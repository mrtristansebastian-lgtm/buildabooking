import { useCallback, useEffect, useState } from 'react';
import * as FirebaseSDK from '../../../services/firebase';
import { appId, db, isFirebaseConfigured } from '../../../services/firebase';
import { buildBookingSlug } from '../../../utils/slugs';
import { guestModeStorageKey, safeLocalGet } from '../../../utils/workspaceRoute';
import { stripLegacyEditorFields } from '../../workspace/utils/workspaceState';

export function usePublicBookingWorkspace({
  guestMode,
  publicSlug,
  settings,
  settingsRef,
  user
}) {
  const [publicWorkspace, setPublicWorkspace] = useState(null);
  const [publicManualPaymentOptions, setPublicManualPaymentOptions] = useState([]);
  const [publicLoading, setPublicLoading] = useState(false);
  const [publicError, setPublicError] = useState('');
  const [publicReloadKey, setPublicReloadKey] = useState(0);

  const reloadPublicWorkspace = useCallback(() => {
    setPublicReloadKey(key => key + 1);
  }, []);

  useEffect(() => {
    if (!publicSlug) return;
    const localGuestSettings = settingsRef.current || settings;
    const localGuestSlug = buildBookingSlug(localGuestSettings.slug || localGuestSettings.brandName || localGuestSettings.businessName || 'studio');
    if (!user && (guestMode || safeLocalGet(guestModeStorageKey) === 'true') && localGuestSlug === publicSlug) {
      const publishableGuestSettings = stripLegacyEditorFields(localGuestSettings);
      setPublicError('');
      setPublicWorkspace({
        ...publishableGuestSettings,
        slug: publicSlug,
        workspaceName: publishableGuestSettings.brandName || publishableGuestSettings.businessName || 'Build A Booking Workspace',
        ownerId: ''
      });
      setPublicLoading(false);
      return;
    }
    if (!isFirebaseConfigured) {
      setPublicError('Firebase is not configured yet.');
      setPublicLoading(false);
      return;
    }

    let cancelled = false;
    setPublicLoading(true);
    setPublicError('');
    setPublicWorkspace(null);
    const workspaceRef = FirebaseSDK.doc(db, 'artifacts', appId, 'public', 'data', 'workspaces', publicSlug);
    const timeoutId = window.setTimeout(() => {
      if (cancelled) return;
      setPublicError('This booking page is taking longer than expected to load. Check your connection and try again.');
      setPublicLoading(false);
    }, 12000);
    FirebaseSDK.getDoc(workspaceRef)
      .then(async (docSnap) => {
        if (cancelled) return;
        if (!docSnap.exists()) {
          setPublicError('This booking page is not published yet.');
          setPublicWorkspace(null);
          return;
        }
        const workspace = docSnap.data() || {};
        const [servicesSnap, staffSnap] = await Promise.all([
          FirebaseSDK.getDocs(FirebaseSDK.query(
            FirebaseSDK.collection(workspaceRef, 'services'),
            FirebaseSDK.orderBy('sortOrder', 'asc'),
            FirebaseSDK.limit(300)
          )).catch(() => null),
          FirebaseSDK.getDocs(FirebaseSDK.query(
            FirebaseSDK.collection(workspaceRef, 'staff'),
            FirebaseSDK.orderBy('sortOrder', 'asc'),
            FirebaseSDK.limit(200)
          )).catch(() => null)
        ]);
        if (cancelled) return;
        const publicServices = servicesSnap?.docs?.map(serviceDoc => ({ id: serviceDoc.id, ...serviceDoc.data() })) || [];
        const publicStaff = staffSnap?.docs?.map(staffDoc => ({ id: staffDoc.id, ...staffDoc.data() })) || [];
        setPublicWorkspace({
          ...workspace,
          ...(publicServices.length ? { services: publicServices } : {}),
          ...(publicStaff.length ? { publicStaff } : {})
        });
      })
      .catch((error) => {
        if (cancelled) return;
        console.error(error);
        setPublicError('Could not load this booking page.');
      })
      .finally(() => {
        if (cancelled) return;
        window.clearTimeout(timeoutId);
        setPublicLoading(false);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [publicSlug, publicReloadKey, guestMode, user?.uid]);

  useEffect(() => {
    let cancelled = false;
    if (!publicSlug || !isFirebaseConfigured || !publicWorkspace?.ownerId) {
      setPublicManualPaymentOptions([]);
      return () => { cancelled = true; };
    }

    const gatewayIds = ['manual_eft', 'cash'];
    Promise.all(gatewayIds.map(async (gatewayId) => {
      const snap = await FirebaseSDK.getDoc(FirebaseSDK.doc(db, 'artifacts', appId, 'users', publicWorkspace.ownerId, 'payment_settings', gatewayId));
      if (!snap.exists()) return null;
      const data = snap.data() || {};
      if (data.enabled !== true) return null;
      return {
        id: gatewayId,
        gatewayType: gatewayId,
        name: data.providerName || (gatewayId === 'manual_eft' ? 'Manual EFT' : 'Cash'),
        enabled: true,
        mode: data.mode || 'live',
        credentialSummary: data.credentialSummary || {},
        instructions: data.credentialSummary?.instructions || ''
      };
    }))
      .then((options) => {
        if (!cancelled) setPublicManualPaymentOptions(options.filter(Boolean));
      })
      .catch((error) => {
        console.error('Could not load manual payment options', error);
        if (!cancelled) setPublicManualPaymentOptions([]);
      });

    return () => { cancelled = true; };
  }, [publicSlug, publicWorkspace?.ownerId]);

  return {
    publicError,
    publicLoading,
    publicManualPaymentOptions,
    publicWorkspace,
    reloadPublicWorkspace,
    setPublicError,
    setPublicLoading
  };
}
