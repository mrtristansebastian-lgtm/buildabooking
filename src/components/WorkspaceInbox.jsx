import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Bell, Calendar, Check, Maximize2, MessageCircle, Minimize2, Search, Send, Users } from 'lucide-react';
import * as FirebaseSDK from '../services/firebase';
import { makeClientNotification, notificationEmailKey, NOTIFICATION_TYPES } from '../services/notifications';

const timestampValue = (value) => {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  if (typeof value?.toMillis === 'function') return value.toMillis();
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 border-amber-100',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  waitlist: 'bg-blue-50 text-blue-700 border-blue-100',
  declined: 'bg-red-50 text-red-600 border-red-100'
};

export function WorkspaceInbox({
  appId,
  db,
  user,
  workspaceOwnerId,
  bookings,
  staffList = [],
  updateBooking,
  setActiveTab,
  showToast
}) {
  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState('');
  const [threadQuery, setThreadQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [chatFullscreen, setChatFullscreen] = useState(false);

  const exampleThread = useMemo(() => ({
    id: 'example-support-thread',
    clientName: 'Example Client',
    clientEmail: 'client@example.com',
    workspaceName: 'Studio Noir',
    lastMessage: 'Could I move my booking to later in the afternoon?',
    bookingId: 'example-support-booking',
    bookingStatus: 'pending',
    ownerUnread: 1,
    clientUnread: 0,
    rescheduleStatus: 'requested',
    isExample: true
  }), []);

  const exampleBooking = useMemo(() => ({
    id: 'example-support-booking',
    clientName: 'Example Client',
    clientEmail: 'client@example.com',
    date: 'Thursday, May 28',
    time: '10:30',
    status: 'pending',
    isExample: true
  }), []);

  const exampleMessages = useMemo(() => ([
    {
      id: 'example-system',
      senderRole: 'system',
      senderName: 'Booking update',
      text: 'Example booking request received for Thursday, May 28 at 10:30.'
    },
    {
      id: 'example-client',
      senderRole: 'client',
      senderName: 'Example Client',
      text: 'Hey, could I move this to later in the afternoon if anything is open?'
    },
    {
      id: 'example-owner',
      senderRole: 'owner',
      senderName: 'Team',
      text: 'Absolutely. We can offer 14:30 or place you on the waitlist for 16:00.'
    }
  ]), []);

  const threadSource = threads.length ? threads : [exampleThread];

  useEffect(() => {
    if (!db || !workspaceOwnerId) return undefined;
    const threadsQuery = FirebaseSDK.query(
      FirebaseSDK.collection(db, 'artifacts', appId, 'clientThreads'),
      FirebaseSDK.where('ownerId', '==', workspaceOwnerId)
    );
    const unsub = FirebaseSDK.onSnapshot(threadsQuery, (snap) => {
      const next = snap.docs
        .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
        .sort((a, b) => timestampValue(b.updatedAt || b.lastMessageAt) - timestampValue(a.updatedAt || a.lastMessageAt));
      setThreads(next);
      setActiveThreadId(current => current || next[0]?.id || '');
    }, (error) => console.error('Workspace inbox sync failed', error));
    return () => unsub();
  }, [appId, db, workspaceOwnerId]);

  const activeThread = useMemo(
    () => threadSource.find(thread => thread.id === activeThreadId) || threadSource[0] || null,
    [activeThreadId, threadSource]
  );
  const linkedBooking = useMemo(
    () => activeThread?.isExample ? exampleBooking : bookings.find(booking => booking.id === activeThread?.bookingId) || null,
    [activeThread?.bookingId, activeThread?.isExample, bookings, exampleBooking]
  );
  const visibleMessages = activeThread?.isExample ? exampleMessages : messages;
  const activeStaff = useMemo(() => {
    const emailKey = notificationEmailKey(user?.email || '');
    return staffList.find(staff => notificationEmailKey(staff.email || '') === emailKey || staff.uid === user?.uid) || staffList[0] || null;
  }, [staffList, user?.email, user?.uid]);
  const assignedStaff = useMemo(() => (
    linkedBooking?.staffId ? staffList.find(staff => staff.id === linkedBooking.staffId) : null
  ), [linkedBooking?.staffId, staffList]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    document.documentElement.classList.toggle('support-chat-open', mobileChatOpen);
    return () => document.documentElement.classList.remove('support-chat-open');
  }, [mobileChatOpen]);

  const createClientNotification = async (email, payload) => {
    const emailKey = notificationEmailKey(email);
    if (!db || !emailKey) return false;
    try {
      await FirebaseSDK.addDoc(
        FirebaseSDK.collection(db, 'artifacts', appId, 'clientAccess', emailKey, 'notifications'),
        {
          ...payload,
          clientEmail: emailKey,
          ownerId: payload.ownerId || workspaceOwnerId,
          audience: 'client',
          read: false,
          createdAtMs: payload.createdAtMs || Date.now(),
          createdAt: FirebaseSDK.serverTimestamp()
        }
      );
      return true;
    } catch (error) {
      console.error('Client notification from inbox failed', error);
      return false;
    }
  };

  useEffect(() => {
    if (!db || !activeThread?.id || activeThread?.isExample) {
      setMessages([]);
      return undefined;
    }
    const messagesQuery = FirebaseSDK.query(
      FirebaseSDK.collection(db, 'artifacts', appId, 'clientThreads', activeThread.id, 'messages'),
      FirebaseSDK.orderBy('createdAt', 'asc'),
      FirebaseSDK.limit(100)
    );
    const unsub = FirebaseSDK.onSnapshot(messagesQuery, (snap) => {
      setMessages(snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
      if (Number(activeThread.ownerUnread || 0) > 0) {
        FirebaseSDK.updateDoc(
          FirebaseSDK.doc(db, 'artifacts', appId, 'clientThreads', activeThread.id),
          { ownerUnread: 0, ownerLastSeenAt: FirebaseSDK.serverTimestamp() }
        ).catch(() => {});
      }
    }, (error) => console.error('Workspace messages sync failed', error));
    return () => unsub();
  }, [activeThread?.id, appId, db]);

  const sendMessage = async (text = draft) => {
    const cleanText = String(text || '').trim();
    if (!cleanText || !db || !activeThread?.id || sending) return;
    if (activeThread.isExample) {
      setDraft('');
      showToast?.('Example preview only. Real replies will send when a client thread exists.');
      return;
    }
    setSending(true);
    try {
      await FirebaseSDK.addDoc(FirebaseSDK.collection(db, 'artifacts', appId, 'clientThreads', activeThread.id, 'messages'), {
        text: cleanText,
        kind: 'message',
        senderId: user?.uid || workspaceOwnerId,
        senderName: activeStaff?.name || user?.displayName || user?.email || 'Team',
        senderPhotoURL: activeStaff?.photoURL || user?.photoURL || '',
        staffId: activeStaff?.id || '',
        senderRole: 'owner',
        createdAt: FirebaseSDK.serverTimestamp()
      });
      await FirebaseSDK.updateDoc(FirebaseSDK.doc(db, 'artifacts', appId, 'clientThreads', activeThread.id), {
        lastMessage: cleanText,
        lastMessageAt: FirebaseSDK.serverTimestamp(),
        updatedAt: FirebaseSDK.serverTimestamp(),
        clientUnread: FirebaseSDK.increment(1),
        ownerUnread: 0
      });
      await createClientNotification(activeThread.clientEmail, makeClientNotification({
        type: NOTIFICATION_TYPES.NEW_MESSAGE,
        title: `New message from ${activeThread.workspaceName || 'the business'}`,
        body: cleanText,
        ownerId: workspaceOwnerId,
        booking: linkedBooking || {},
        bookingId: activeThread.bookingId || '',
        threadId: activeThread.id,
        view: 'chats',
        priority: 'high',
        metadata: { senderRole: 'owner' }
      }));
      setDraft('');
    } finally {
      setSending(false);
    }
  };

  const confirmLinkedBooking = async () => {
    if (activeThread?.isExample) {
      showToast?.('Example preview only. Real requests can be approved from live threads.');
      return;
    }
    if (!linkedBooking) {
      showToast?.('No matching booking found for this thread yet.');
      return;
    }
    await updateBooking(linkedBooking.id, { status: 'confirmed' });
    if (activeThread?.id && db) {
      await FirebaseSDK.updateDoc(FirebaseSDK.doc(db, 'artifacts', appId, 'clientThreads', activeThread.id), {
        bookingStatus: 'confirmed',
        rescheduleStatus: '',
        updatedAt: FirebaseSDK.serverTimestamp()
      }).catch(() => {});
      await sendMessage(`Confirmed: ${linkedBooking.date} at ${linkedBooking.time}.`);
    }
    showToast?.('Booking confirmed and client thread updated.');
  };

  const unreadCount = threads.reduce((sum, thread) => sum + Number(thread.ownerUnread || 0), 0);
  const needsReplyCount = threads.filter(thread => Number(thread.ownerUnread || 0) > 0 || thread.rescheduleStatus === 'requested').length;
  const openRequestCount = threads.filter(thread => ['pending', 'waitlist'].includes(thread.bookingStatus)).length;
  const linkedBookingCount = threads.filter(thread => thread.bookingId).length;
  const filteredThreads = useMemo(() => {
    const queryText = threadQuery.trim().toLowerCase();
    if (!queryText) return threadSource;
    return threadSource.filter(thread => [
      thread.clientName,
      thread.clientEmail,
      thread.workspaceName,
      thread.lastMessage,
      thread.bookingStatus
    ].some(value => String(value || '').toLowerCase().includes(queryText)));
  }, [threadQuery, threadSource]);

  return (
    <section data-tour="client-inbox" className={`saas-card overflow-hidden bg-white native-gradient-ring ${chatFullscreen ? 'fixed inset-3 z-[80] flex flex-col rounded-[1.25rem] shadow-2xl' : ''}`}>
      <div className="h-1 native-gradient-line" />
      <div className={`${chatFullscreen ? 'hidden' : 'p-3 md:p-5'} border-b border-neutral-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3`}>
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-neutral-50 border border-neutral-100 px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-2">
            <MessageCircle size={13} className="text-black" />
            Support Inbox
          </div>
          <h2 className="text-lg md:text-2xl font-bold tracking-tight text-black">Chat with your clients & manage their bookings!</h2>
          <p className="hidden sm:block text-sm text-neutral-500 mt-1 max-w-2xl">Reply, confirm, reschedule, and keep every client conversation beside the booking it belongs to.</p>
          {!threads.length && <p className="mt-3 inline-flex rounded-full bg-neutral-50 border border-neutral-100 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-neutral-400">Example preview only - not saved or counted</p>}
        </div>
        <div className="grid grid-cols-3 gap-2 lg:min-w-[250px]">
          {[
            ['Needs Reply', needsReplyCount, Bell],
            ['Open Requests', openRequestCount, MessageCircle],
            ['Linked Bookings', linkedBookingCount, Calendar]
          ].map(([label, value, IconCmp]) => (
            <div key={label} className="native-stat-card rounded-lg border border-neutral-100 bg-neutral-50 p-2.5 md:p-3">
              <div className="w-7 h-7 md:w-8 md:h-8 native-gradient-icon rounded-lg flex items-center justify-center mb-2">
                <IconCmp size={14} />
              </div>
              <p className="text-[8px] font-bold uppercase tracking-widest text-neutral-400">{label}</p>
              <p className="metric-value text-lg md:text-xl font-bold text-black">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={`grid grid-cols-1 xl:grid-cols-12 ${chatFullscreen ? 'min-h-0 flex-1' : 'min-h-[520px] xl:min-h-[640px]'}`}>
        <aside className={`${mobileChatOpen ? 'hidden xl:block' : ''} xl:col-span-4 border-b xl:border-b-0 xl:border-r border-neutral-100 bg-neutral-50/45`}>
          <div className="p-3 md:p-4 border-b border-neutral-100 bg-white/70">
            <div className="relative">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" />
              <input
                value={threadQuery}
                onChange={(event) => setThreadQuery(event.target.value)}
                placeholder="Search client, email, message"
                className="w-full h-11 md:h-12 rounded-lg bg-white border border-neutral-200 pl-11 pr-4 text-sm font-bold outline-none focus:border-black transition-colors"
              />
            </div>
          </div>
          <div className="max-h-[62vh] xl:max-h-[660px] overflow-y-auto">
            {filteredThreads.length ? filteredThreads.map(thread => {
              const active = activeThread?.id === thread.id;
              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => {
                    setActiveThreadId(thread.id);
                    setMobileChatOpen(true);
                  }}
                  className={`w-full text-left p-3.5 md:p-5 border-b border-neutral-100 transition-colors relative overflow-hidden ${active ? 'bg-black text-white' : 'bg-transparent hover:bg-white text-black'}`}
                >
                  {active && <span className="absolute inset-y-0 left-0 w-1 native-gradient-line" />}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold ${active ? 'native-gradient-icon text-black' : 'bg-white border border-neutral-100 text-black'}`}>
                        {(thread.clientName || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-bold truncate ${active ? 'text-white' : 'text-black'}`}>{thread.clientName || 'Client'}</p>
                        <p className={`text-xs mt-1 truncate ${active ? 'text-white/55' : 'text-neutral-500'}`}>{thread.isExample ? 'Example only - live chats replace this' : thread.workspaceName || thread.clientEmail}</p>
                      </div>
                    </div>
                    {Number(thread.ownerUnread || 0) > 0 && <span className="min-w-6 h-6 rounded-full bg-[#39FF14] text-black text-[10px] font-bold flex items-center justify-center">{thread.ownerUnread}</span>}
                  </div>
                  <p className={`text-sm mt-3 line-clamp-2 ${active ? 'text-white/60' : 'text-neutral-500'}`}>{thread.lastMessage || 'No messages yet.'}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className={`px-2 py-1 rounded-md border text-[8px] font-bold uppercase tracking-widest ${active ? 'border-white/15 bg-white/10 text-white/70' : statusStyles[thread.bookingStatus] || statusStyles.pending}`}>
                      {thread.bookingStatus || 'pending'}
                    </span>
                    {thread.isExample && <span className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-widest ${active ? 'bg-white/10 text-white/70' : 'bg-neutral-100 text-neutral-500'}`}>Example</span>}
                    {thread.rescheduleStatus === 'requested' && <span className="px-2 py-1 rounded-md bg-violet-50 text-violet-700 text-[8px] font-bold uppercase tracking-widest">Reschedule</span>}
                  </div>
                </button>
              );
            }) : (
              <div className="p-8 text-center">
                <div className="w-14 h-14 rounded-lg bg-white border border-neutral-100 flex items-center justify-center mx-auto mb-4 text-neutral-300"><Users size={22}/></div>
                <h3 className="font-bold text-black mb-2">{threads.length ? 'No matching threads' : 'No client threads yet'}</h3>
                <p className="text-sm text-neutral-500">{threads.length ? 'Try another name, email, or message keyword.' : 'New bookings with an email address will open a client support thread here automatically.'}</p>
              </div>
            )}
          </div>
        </aside>

        <div className={`${mobileChatOpen ? 'fixed inset-0 z-[999] xl:static xl:z-auto' : 'hidden xl:flex'} xl:col-span-8 flex flex-col min-h-[100dvh] xl:min-h-[620px] bg-white`}>
          {activeThread ? (
            <>
              <div className="p-3 md:p-5 xl:p-6 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white">
                <div className="flex items-center gap-3 min-w-0">
                  <button type="button" onClick={() => setMobileChatOpen(false)} className="xl:hidden w-10 h-10 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center text-black shrink-0">
                    <ArrowLeft size={18} />
                  </button>
                  <div className="w-11 h-11 md:w-12 md:h-12 rounded-full native-gradient-icon flex items-center justify-center shrink-0 overflow-hidden font-bold">
                    {activeThread.clientPhotoURL ? <img src={activeThread.clientPhotoURL} alt="" className="w-full h-full object-cover" /> : (activeThread.clientName || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base md:text-xl font-bold text-black truncate">{activeThread.clientName || 'Client'}</h3>
                    <p className="text-xs md:text-sm text-neutral-500 truncate">
                      {assignedStaff ? `Assigned to ${assignedStaff.name}` : activeThread.clientEmail || 'Active support thread'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button type="button" onClick={() => setChatFullscreen(value => !value)} className="hidden md:flex h-10 w-10 rounded-lg border border-neutral-200 bg-white items-center justify-center text-black hover:border-black transition-colors">
                    {chatFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                  </button>
                  <button onClick={() => setActiveTab?.('bookings')} className="h-10 px-3 rounded-lg border border-neutral-200 bg-white text-[9px] font-bold uppercase tracking-widest hover:border-black transition-colors">
                    Bookings
                  </button>
                  <button onClick={confirmLinkedBooking} className="h-10 px-3 md:px-4 rounded-lg native-gradient-button text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                    <Check size={13} /> Confirm
                  </button>
                </div>
              </div>

              {(linkedBooking || assignedStaff) && (
                <div className="px-3 md:px-5 py-2.5 bg-neutral-50 border-b border-neutral-100">
                  <div className="grid grid-cols-3 gap-2 text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                    <div className="rounded-lg bg-white border border-neutral-100 px-3 py-2 min-w-0">
                      <p>Booking</p>
                      <p className="mt-1 text-xs normal-case tracking-normal font-bold text-black truncate">{linkedBooking ? `${linkedBooking.date || 'Date'} / ${linkedBooking.time || 'Time'}` : 'Not linked yet'}</p>
                    </div>
                    <div className="rounded-lg bg-white border border-neutral-100 px-3 py-2 min-w-0">
                      <p>Status</p>
                      <p className="mt-1 text-xs normal-case tracking-normal font-bold text-black truncate">{linkedBooking?.status || activeThread.bookingStatus || 'Open'}</p>
                    </div>
                    <div className="rounded-lg bg-white border border-neutral-100 px-3 py-2 min-w-0">
                      <p>Staff</p>
                      <p className="mt-1 text-xs normal-case tracking-normal font-bold text-black truncate">{assignedStaff?.name || activeStaff?.name || 'Team'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-[#F7F7F5] space-y-3">
                {visibleMessages.map(message => {
                  const mine = message.senderRole === 'owner';
                  return (
                    <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${mine ? 'bg-black text-white rounded-br-md' : message.senderRole === 'system' ? 'native-stat-card bg-neutral-50 border border-neutral-100 text-neutral-500' : 'bg-neutral-50 text-black border border-neutral-100 rounded-bl-md'}`}>
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-45 mb-1">{message.senderRole === 'system' ? 'System' : message.senderName || message.senderRole}</p>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:p-5 border-t border-neutral-100 bg-white">
                <div className="flex items-end gap-2">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Reply to client..."
                    rows={2}
                    className="flex-1 resize-none rounded-lg bg-white border border-neutral-200 px-4 py-3 text-sm font-medium outline-none focus:border-black transition-colors"
                  />
                  <button onClick={() => sendMessage()} disabled={!draft.trim() || sending} className="h-12 w-12 rounded-lg native-gradient-button flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed">
                    <Send size={17} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-10 text-center">
              <div>
                <div className="w-16 h-16 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center mx-auto mb-5 text-neutral-300"><MessageCircle size={24}/></div>
                <h3 className="text-2xl font-bold tracking-tight text-black mb-3">Client chat is ready</h3>
                <p className="text-sm text-neutral-500 max-w-sm">When a client books with an email address, their portal and your workspace thread connect here automatically.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
