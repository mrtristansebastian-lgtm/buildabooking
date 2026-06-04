import { sendClientEmail } from '../../../services/email';
import * as FirebaseSDK from '../../../services/firebase';
import { appId, db, functions, isFirebaseConfigured } from '../../../services/firebase';
import { makeClientNotification, NOTIFICATION_TYPES } from '../../../services/notifications';
import { parseAmountToCents } from '../utils/bookingActionHelpers';

const normalizeEmail = (email = '') => String(email || '').trim().toLowerCase();

export function createBookingLifecycleActions({
  communications,
  createClientNotification,
  runningLateDialog,
  safeStaffList,
  setBookingsAndCache,
  setRunningLateDialog,
  settings,
  showToast,
  user,
  visibleBookings,
  workspaceOwnerId
}) {
  const sendBookingEmail = async (booking, templateKey, extra = {}) => {
    if (booking.notificationChannels?.email === false) {
      showToast('Client email updates are off for this booking.');
      return false;
    }
    if (!communications[templateKey]?.active) {
      showToast(`Turn on the ${templateKey} email first.`);
      return false;
    }
    try {
      const result = await sendClientEmail({ communications, settings, booking, templateKey, extra });
      if (result.skipped) {
        showToast(result.reason);
        return false;
      }
      showToast(`${templateKey === 'runningLate' ? 'Running late' : templateKey} email sent to ${booking.clientName}.`);
      return true;
    } catch (error) {
      console.error(error);
      showToast('Email delivery is not connected yet.');
      return false;
    }
  };

  const updateBooking = async (bookingId, updates) => {
    const existingBooking = visibleBookings.find(booking => booking.id === bookingId);
    const nextStaffId = updates.staffId ?? existingBooking?.staffId ?? '';
    const nextAssignedStaff = nextStaffId ? safeStaffList.find(staff => staff.id === nextStaffId) : null;
    if (!isFirebaseConfigured || !user) {
      setBookingsAndCache(prev => prev.map(b => b.id === bookingId ? { ...b, ...updates } : b));
      return;
    }
    setBookingsAndCache(prev => prev.map(b => b.id === bookingId ? { ...b, ...updates } : b));
    try {
      await FirebaseSDK.updateDoc(FirebaseSDK.doc(db, 'artifacts', appId, 'users', workspaceOwnerId, 'bookings', bookingId), updates);
      const threadId = updates.threadId ?? existingBooking?.threadId ?? '';
      const emailKey = normalizeEmail(existingBooking?.clientEmail);
      const portalUpdates = {
        ...updates,
        updatedAt: FirebaseSDK.serverTimestamp()
      };
      if (emailKey) {
        FirebaseSDK.setDoc(
          FirebaseSDK.doc(db, 'artifacts', appId, 'clientAccess', emailKey, 'bookings', bookingId),
          {
            bookingId,
            threadId,
            ownerId: workspaceOwnerId,
            clientEmail: emailKey,
            clientName: existingBooking?.clientName || '',
            workspaceSlug: existingBooking?.workspaceSlug || settings.slug || '',
            workspaceName: existingBooking?.workspaceName || settings.brandName || '',
            workspaceLogo: existingBooking?.workspaceLogo || settings.logo || '',
            date: updates.date ?? existingBooking?.date ?? '',
            dateKey: updates.dateKey ?? existingBooking?.dateKey ?? null,
            time: updates.time ?? existingBooking?.time ?? '',
            serviceId: updates.serviceId ?? existingBooking?.serviceId ?? '',
            serviceName: updates.serviceName ?? existingBooking?.serviceName ?? '',
            serviceDescription: updates.serviceDescription ?? existingBooking?.serviceDescription ?? '',
            servicePrice: updates.servicePrice ?? existingBooking?.servicePrice ?? '',
            servicePriceType: updates.servicePriceType ?? existingBooking?.servicePriceType ?? '',
            serviceDuration: updates.serviceDuration ?? existingBooking?.serviceDuration ?? '',
            serviceCategory: updates.serviceCategory ?? existingBooking?.serviceCategory ?? '',
            paymentMethod: updates.paymentMethod ?? existingBooking?.paymentMethod ?? '',
            paymentGateway: updates.paymentGateway ?? existingBooking?.paymentGateway ?? '',
            paymentProviderName: updates.paymentProviderName ?? existingBooking?.paymentProviderName ?? '',
            paymentStatus: updates.paymentStatus ?? existingBooking?.paymentStatus ?? '',
            paymentReference: updates.paymentReference ?? existingBooking?.paymentReference ?? '',
            amountPaidInCents: updates.amountPaidInCents ?? existingBooking?.amountPaidInCents ?? 0,
            paidAt: updates.paidAt ?? existingBooking?.paidAt ?? null,
            status: updates.status ?? existingBooking?.status ?? 'pending',
            staffId: nextStaffId,
            staffName: nextAssignedStaff?.name || '',
            staffPhotoURL: nextAssignedStaff?.photoURL || '',
            timestamp: existingBooking?.timestamp || Date.now(),
            ...portalUpdates
          },
          { merge: true }
        ).catch(error => console.error('Client portal booking sync failed', error));
      }
      if (threadId) {
        FirebaseSDK.updateDoc(FirebaseSDK.doc(db, 'artifacts', appId, 'clientThreads', threadId), {
          bookingStatus: updates.status ?? existingBooking?.status ?? 'pending',
          lastMessage: updates.status ? `Booking status updated to ${updates.status}.` : 'Booking details updated.',
          lastMessageAt: FirebaseSDK.serverTimestamp(),
          lastMessageAtMs: Date.now(),
          updatedAt: FirebaseSDK.serverTimestamp(),
          updatedAtMs: Date.now(),
          staffId: nextStaffId,
          staffName: nextAssignedStaff?.name || '',
          staffPhotoURL: nextAssignedStaff?.photoURL || '',
          workspaceLogo: existingBooking?.workspaceLogo || settings.logo || '',
          clientUnread: FirebaseSDK.increment(1)
        }).catch(error => console.error('Client thread sync failed', error));
      }
      if (emailKey && existingBooking) {
        const nextBooking = { ...existingBooking, ...updates, id: bookingId, ownerId: workspaceOwnerId };
        const statusChanged = updates.status && updates.status !== existingBooking.status;
        const scheduleChanged = (
          (updates.date && updates.date !== existingBooking.date) ||
          (updates.time && updates.time !== existingBooking.time && updates.time !== 'Waitlist')
        );
        if (statusChanged) {
          const copyByStatus = {
            confirmed: {
              type: NOTIFICATION_TYPES.BOOKING_CONFIRMED,
              title: 'Your booking was approved',
              body: `${settings.brandName || nextBooking.workspaceName || 'The business'} confirmed ${nextBooking.date} at ${nextBooking.time}.`
            },
            declined: {
              type: NOTIFICATION_TYPES.BOOKING_DECLINED,
              title: 'Your booking request was declined',
              body: `${settings.brandName || nextBooking.workspaceName || 'The business'} could not approve that request. Open your portal to chat or request another time.`
            },
            waitlist: {
              type: NOTIFICATION_TYPES.BOOKING_WAITLIST,
              title: 'You are on the waitlist',
              body: 'You are now on standby. If a slot opens, the business can message you from your booking thread.'
            }
          };
          const copy = copyByStatus[updates.status];
          if (copy) {
            createClientNotification(emailKey, makeClientNotification({
              ...copy,
              ownerId: workspaceOwnerId,
              booking: nextBooking,
              view: 'bookings',
              priority: updates.status === 'confirmed' ? 'high' : 'normal'
            })).catch(() => {});
          }
        }
        if (scheduleChanged) {
          createClientNotification(emailKey, makeClientNotification({
            type: NOTIFICATION_TYPES.BOOKING_RESCHEDULED,
            title: 'Your booking time changed',
            body: `${settings.brandName || nextBooking.workspaceName || 'The business'} updated your booking to ${nextBooking.date} at ${nextBooking.time}.`,
            ownerId: workspaceOwnerId,
            booking: nextBooking,
            view: 'bookings',
            priority: 'high'
          })).catch(() => {});
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markBookingPaid = async (booking) => {
    if (!booking?.id || booking.isExample) {
      showToast('Example previews cannot be marked paid.');
      return;
    }

    const amountInCents = Number.isSafeInteger(Number(booking.amountInCents))
      ? Number(booking.amountInCents)
      : parseAmountToCents(booking.servicePrice);
    const paymentMethod = booking.paymentMethod || booking.paymentGateway || 'manual';
    const updates = {
      paymentStatus: 'paid',
      paymentMethod,
      paymentGateway: booking.paymentGateway || paymentMethod,
      paymentProviderName: booking.paymentProviderName || (paymentMethod === 'cash' ? 'Cash' : 'Manual payment'),
      manualPayment: true,
      amountPaidInCents: amountInCents,
      paidAt: Date.now()
    };

    if (functions && FirebaseSDK.httpsCallable && isFirebaseConfigured && user) {
      try {
        const callable = FirebaseSDK.httpsCallable(functions, 'markManualBookingPaid');
        await callable({
          appId,
          businessId: workspaceOwnerId,
          bookingId: booking.id,
          paymentMethod,
          amountInCents,
          currency: booking.currency || 'ZAR'
        });
      } catch (error) {
        console.error('markManualBookingPaid failed, applying local booking status update', error);
      }
    }

    await updateBooking(booking.id, updates);
    showToast(`${booking.clientName || 'Booking'} marked as paid.`);
  };

  const deleteBooking = async (bookingId) => {
    if (!isFirebaseConfigured || !user) {
      setBookingsAndCache(prev => prev.filter(b => b.id !== bookingId));
      return;
    }
    setBookingsAndCache(prev => prev.filter(b => b.id !== bookingId));
    try {
      await FirebaseSDK.deleteDoc(FirebaseSDK.doc(db, 'artifacts', appId, 'users', workspaceOwnerId, 'bookings', bookingId));
    } catch (err) {
      console.error(err);
    }
  };

  const approveBooking = async (booking) => {
    await updateBooking(booking.id, { status: 'confirmed' });
    await sendBookingEmail({ ...booking, status: 'confirmed' }, 'confirmed');
  };

  const sendRunningLateToBooking = async (booking) => {
    setRunningLateDialog({
      booking,
      minutes: '15',
      message: `Running 15 minutes late. Thanks for your patience - we will keep you posted here.`
    });
  };

  const submitRunningLateDialog = async () => {
    const booking = runningLateDialog?.booking;
    const minutes = String(runningLateDialog?.minutes || '').trim();
    if (!booking || !minutes) {
      showToast('Add the number of minutes before sending.');
      return;
    }
    await sendBookingEmail(booking, 'runningLate', { minutes });
    await createClientNotification(booking.clientEmail, makeClientNotification({
      type: NOTIFICATION_TYPES.RUNNING_LATE,
      title: `${settings.brandName || 'The business'} is running late`,
      body: String(runningLateDialog?.message || '').trim() || `They are running about ${minutes} minutes behind. Your booking thread stays open for questions.`,
      ownerId: workspaceOwnerId,
      booking,
      view: 'chats',
      priority: 'high',
      metadata: { minutes }
    }));
    setRunningLateDialog(null);
    showToast('Running-late update sent.');
  };

  const sendWaitlistToBooking = async (booking) => {
    if (booking.status !== 'waitlist') {
      await updateBooking(booking.id, { status: 'waitlist', time: 'Waitlist' });
      await sendBookingEmail({ ...booking, status: 'waitlist', time: 'Waitlist' }, 'waitlist');
      showToast(`${booking.clientName} moved to waitlist.`);
      return;
    }
    await sendBookingEmail(booking, 'waitlist');
    await createClientNotification(booking.clientEmail, makeClientNotification({
      type: NOTIFICATION_TYPES.BOOKING_WAITLIST,
      title: 'A waitlist update is ready',
      body: `${settings.brandName || 'The business'} sent a waitlist update. Open your booking thread to keep moving.`,
      ownerId: workspaceOwnerId,
      booking,
      view: 'bookings',
      priority: 'normal'
    }));
  };

  const sendReviewToBooking = async (booking) => {
    await sendBookingEmail(booking, 'review');
    await createClientNotification(booking.clientEmail, makeClientNotification({
      type: NOTIFICATION_TYPES.REVIEW_REQUEST,
      title: 'Quick follow-up from your visit',
      body: `${settings.brandName || 'The business'} sent a quick thank-you and review request.`,
      ownerId: workspaceOwnerId,
      booking,
      view: 'chats',
      priority: 'normal'
    }));
  };

  return {
    approveBooking,
    deleteBooking,
    markBookingPaid,
    sendBookingEmail,
    sendReviewToBooking,
    sendRunningLateToBooking,
    sendWaitlistToBooking,
    submitRunningLateDialog,
    updateBooking
  };
}
