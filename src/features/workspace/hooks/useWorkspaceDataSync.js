import { useEffect } from 'react';
import { createDefaultCommunications, createDefaultSettings, normalizeCommunications } from '../../../config/appConfig';
import * as FirebaseSDK from '../../../services/firebase';
import { appId, db, isFirebaseConfigured } from '../../../services/firebase';
import { createOwnerStaffProfile } from '../../staff';
import { readBookingsCache, writeBookingsCache } from '../../../utils/workspaceRoute';
import { areJsonEqual, mergeStateIfChanged } from '../utils/workspaceState';
import { asArray } from './useWorkspaceData';

const DEFAULT_STAFF = [{ id: 'owner', name: 'Admin', color: '#39FF14' }];

const dateValueToMs = (value) => {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  if (value?.toMillis) return value.toMillis();
  if (value?.seconds) return value.seconds * 1000;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getTimestampValue = (value) => {
  if (typeof value === 'number') return value;
  if (value?.toMillis) return value.toMillis();
  if (typeof value?.seconds === 'number') return value.seconds * 1000;
  const parsed = new Date(value || 0).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

const handleSyncError = (label) => (error) => {
  console.error(`${label} sync failed`, error);
};

export function useWorkspaceDataSync({
  isGuestWorkspace,
  isWorkspaceOwner,
  loading,
  personalDisplayName,
  personalProfile,
  publicSlug,
  publishedSettingsSnapshotRef,
  setBookings,
  setBookingsReady,
  setClientRecords,
  setCommunications,
  setFinanceImports,
  setFinancePaymentAttempts,
  setSettings,
  setStaffList,
  settingsRef,
  user,
  workspaceOwnerId
}) {
  useEffect(() => {
    if (publicSlug) {
      return undefined;
    }
    if ((!user || !workspaceOwnerId) && isFirebaseConfigured) return undefined;
    if (!isFirebaseConfigured) {
      return undefined;
    }

    const settingsDocRef = FirebaseSDK.doc(db, 'artifacts', appId, 'users', workspaceOwnerId, 'config', 'settings');
    const applyWorkspaceSettings = (baseSettings = {}) => {
      const data = { ...baseSettings };
      if (data.fontFamily === 'sans') data.fontFamily = 'inter';
      if (data.fontFamily === 'serif') data.fontFamily = 'playfair';
      if (data.fontFamily === 'mono') data.fontFamily = 'space-mono';
      if (data.fontFamily === 'display') data.fontFamily = 'syne';
      setSettings(prev => mergeStateIfChanged(prev, data));
    };

    const unsubSettings = FirebaseSDK.onSnapshot(settingsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = { ...docSnap.data() };
        publishedSettingsSnapshotRef.current = data;
        applyWorkspaceSettings(data);
      } else {
        publishedSettingsSnapshotRef.current = null;
        setSettings(prev => mergeStateIfChanged(prev, createDefaultSettings()));
      }
    }, handleSyncError('Settings'));

    const staffRef = FirebaseSDK.doc(db, 'artifacts', appId, 'users', workspaceOwnerId, 'config', 'staff');
    const unsubStaff = FirebaseSDK.onSnapshot(staffRef, (docSnap) => {
      if (docSnap.exists()) {
        const nextStaff = asArray(docSnap.data().list);
        setStaffList(prev => areJsonEqual(prev, nextStaff) ? prev : nextStaff);
      } else if (isWorkspaceOwner) {
        const ownerProfile = [createOwnerStaffProfile({
          ...user,
          displayName: personalDisplayName,
          email: personalProfile.email || user?.email || '',
          photoURL: personalProfile.photoURL || user?.photoURL || '',
          phoneNumber: personalProfile.mobile || user?.phoneNumber || ''
        })];
        setStaffList(prev => areJsonEqual(prev, ownerProfile) ? prev : ownerProfile);
      } else {
        setStaffList(prev => areJsonEqual(prev, DEFAULT_STAFF) ? prev : DEFAULT_STAFF);
      }
    }, handleSyncError('Staff'));

    const commsRef = FirebaseSDK.doc(db, 'artifacts', appId, 'users', workspaceOwnerId, 'config', 'communications');
    const unsubComms = FirebaseSDK.onSnapshot(commsRef, (docSnap) => {
      if (docSnap.exists()) {
        const nextComms = normalizeCommunications(docSnap.data());
        setCommunications(prev => areJsonEqual(prev, nextComms) ? prev : nextComms);
      } else {
        const nextComms = createDefaultCommunications();
        setCommunications(prev => areJsonEqual(prev, nextComms) ? prev : nextComms);
      }
    }, handleSyncError('Communication'));

    const clientsRef = FirebaseSDK.doc(db, 'artifacts', appId, 'users', workspaceOwnerId, 'config', 'clients');
    const unsubClients = FirebaseSDK.onSnapshot(clientsRef, (docSnap) => {
      if (docSnap.exists()) {
        const nextClients = asArray(docSnap.data().list);
        setClientRecords(prev => areJsonEqual(prev, nextClients) ? prev : nextClients);
      } else {
        setClientRecords(prev => prev.length ? [] : prev);
      }
    }, handleSyncError('Client'));

    const financeImportsRef = FirebaseSDK.doc(db, 'artifacts', appId, 'users', workspaceOwnerId, 'finance', 'imports');
    const unsubFinanceImports = FirebaseSDK.onSnapshot(financeImportsRef, (docSnap) => {
      if (docSnap.exists()) {
        const nextImports = asArray(docSnap.data().list);
        setFinanceImports(prev => areJsonEqual(prev, nextImports) ? prev : nextImports);
      } else {
        setFinanceImports(prev => prev.length ? [] : prev);
      }
    }, handleSyncError('Finance import'));

    return () => {
      unsubSettings();
      unsubStaff();
      unsubComms();
      unsubClients();
      unsubFinanceImports();
    };
  }, [user, workspaceOwnerId, isWorkspaceOwner, publicSlug, personalDisplayName, personalProfile.email, personalProfile.mobile, personalProfile.photoURL]);

  useEffect(() => {
    if (publicSlug || isGuestWorkspace || !isFirebaseConfigured || !db || !workspaceOwnerId) {
      setFinancePaymentAttempts(prev => prev.length ? [] : prev);
      return undefined;
    }

    const paymentAttemptsQuery = FirebaseSDK.query(
      FirebaseSDK.collection(db, 'artifacts', appId, 'users', workspaceOwnerId, 'payment_attempts'),
      FirebaseSDK.orderBy('updatedAtMs', 'desc'),
      FirebaseSDK.limit(240)
    );
    const unsubscribe = FirebaseSDK.onSnapshot(paymentAttemptsQuery, (snapshot) => {
      const nextAttempts = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() || {};
        return {
          id: docSnap.id,
          gatewayType: data.gatewayType || 'stripe',
          status: data.status || 'initiated',
          amountInCents: Number(data.amountInCents || data.amountPaidInCents || 0),
          currency: data.currency || settingsRef.current?.currency || 'ZAR',
          customerName: data.customerName || data.clientName || 'Client',
          bookingId: data.bookingId || '',
          updatedAtMs: dateValueToMs(data.paidAt || data.updatedAt || data.createdAt)
        };
      });
      setFinancePaymentAttempts(prev => areJsonEqual(prev, nextAttempts) ? prev : nextAttempts);
    }, (error) => console.error('Finance payment attempts sync failed', error));

    return () => unsubscribe();
  }, [workspaceOwnerId, publicSlug, isGuestWorkspace]);

  useEffect(() => {
    if (publicSlug) {
      setBookingsReady(true);
      return undefined;
    }
    if (isGuestWorkspace) {
      setBookingsReady(true);
      return undefined;
    }
    if (!isFirebaseConfigured || !db) {
      setBookingsReady(true);
      return undefined;
    }
    if (!user || !workspaceOwnerId) {
      setBookings([]);
      setBookingsReady(!loading);
      return undefined;
    }

    const cachedBookings = readBookingsCache(workspaceOwnerId);
    if (cachedBookings?.bookings?.length) {
      setBookings(prev => areJsonEqual(prev, cachedBookings.bookings) ? prev : cachedBookings.bookings);
      setBookingsReady(true);
    } else {
      setBookings([]);
      setBookingsReady(false);
    }

    const bookingsCol = FirebaseSDK.collection(db, 'artifacts', appId, 'users', workspaceOwnerId, 'bookings');
    const bookingsQuery = FirebaseSDK.query(
      bookingsCol,
      FirebaseSDK.orderBy('timestamp', 'desc'),
      FirebaseSDK.limit(250)
    );

    const unsubBookings = FirebaseSDK.onSnapshot(bookingsQuery, (snap) => {
      const nextBookings = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => getTimestampValue(b.timestamp) - getTimestampValue(a.timestamp));
      writeBookingsCache(workspaceOwnerId, nextBookings);
      setBookings(prev => areJsonEqual(prev, nextBookings) ? prev : nextBookings);
      setBookingsReady(true);
    }, (error) => {
      console.error('Booking sync failed', error);
      const fallbackBookings = readBookingsCache(workspaceOwnerId);
      if (fallbackBookings?.bookings?.length) {
        setBookings(prev => areJsonEqual(prev, fallbackBookings.bookings) ? prev : fallbackBookings.bookings);
      }
      setBookingsReady(true);
    });

    return () => unsubBookings();
  }, [isGuestWorkspace, loading, publicSlug, user?.uid, workspaceOwnerId]);
}
