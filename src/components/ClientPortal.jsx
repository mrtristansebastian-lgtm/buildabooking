import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Bell, Calendar, CheckCircle2, Download, LogOut, MessageCircle, RefreshCw, Send, Smartphone } from 'lucide-react';
import { BuildABookingBrand } from './BuildABookingBrand';
import * as FirebaseSDK from '../services/firebase';

const normalizeEmail = (email = '') => String(email || '').trim().toLowerCase();

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

export function ClientPortal({ appId, db, user, onSignOut, onOwnerLogin, onInstallApp }) {
  const emailKey = normalizeEmail(user?.email);
  const [bookings, setBookings] = useState([]);
  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState('');
  const [messageDraft, setMessageDraft] = useState('');
  const [rescheduleDraft, setRescheduleDraft] = useState({ bookingId: '', date: '', time: '' });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!db || !emailKey) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const bookingsRef = FirebaseSDK.collection(db, 'artifacts', appId, 'clientAccess', emailKey, 'bookings');
    const threadsQuery = FirebaseSDK.query(
      FirebaseSDK.collection(db, 'artifacts', appId, 'clientThreads'),
      FirebaseSDK.where('clientEmail', '==', emailKey)
    );

    const unsubBookings = FirebaseSDK.onSnapshot(bookingsRef, (snap) => {
      const next = snap.docs
        .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
        .sort((a, b) => timestampValue(b.timestamp || b.createdAt) - timestampValue(a.timestamp || a.createdAt));
      setBookings(next);
      setLoading(false);
    }, (error) => {
      console.error('Client bookings sync failed', error);
      setLoading(false);
    });

    const unsubThreads = FirebaseSDK.onSnapshot(threadsQuery, (snap) => {
      const next = snap.docs
        .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
        .sort((a, b) => timestampValue(b.updatedAt || b.lastMessageAt) - timestampValue(a.updatedAt || a.lastMessageAt));
      setThreads(next);
      setActiveThreadId(current => current || next[0]?.id || '');
    }, (error) => console.error('Client threads sync failed', error));

    return () => {
      unsubBookings();
      unsubThreads();
    };
  }, [appId, db, emailKey]);

  const activeThread = useMemo(
    () => threads.find(thread => thread.id === activeThreadId) || threads[0] || null,
    [activeThreadId, threads]
  );

  useEffect(() => {
    if (!db || !activeThread?.id) {
      setMessages([]);
      return undefined;
    }

    const messagesQuery = FirebaseSDK.query(
      FirebaseSDK.collection(db, 'artifacts', appId, 'clientThreads', activeThread.id, 'messages'),
      FirebaseSDK.orderBy('createdAt', 'asc'),
      FirebaseSDK.limit(80)
    );
    const unsubMessages = FirebaseSDK.onSnapshot(messagesQuery, (snap) => {
      setMessages(snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })));
      if (Number(activeThread.clientUnread || 0) > 0) {
        FirebaseSDK.updateDoc(
          FirebaseSDK.doc(db, 'artifacts', appId, 'clientThreads', activeThread.id),
          { clientUnread: 0, clientLastSeenAt: FirebaseSDK.serverTimestamp() }
        ).catch(() => {});
      }
    }, (error) => console.error('Client messages sync failed', error));
    return () => unsubMessages();
  }, [activeThread?.id, appId, db]);

  const sendThreadMessage = async ({ text, kind = 'message', bookingId = '' }) => {
    const cleanText = String(text || '').trim();
    if (!cleanText || !db || !activeThread?.id || sending) return;
    setSending(true);
    try {
      const threadRef = FirebaseSDK.doc(db, 'artifacts', appId, 'clientThreads', activeThread.id);
      await FirebaseSDK.addDoc(FirebaseSDK.collection(db, 'artifacts', appId, 'clientThreads', activeThread.id, 'messages'), {
        text: cleanText,
        kind,
        bookingId,
        senderId: user.uid,
        senderName: user.displayName || user.email || 'Client',
        senderRole: 'client',
        createdAt: FirebaseSDK.serverTimestamp()
      });
      await FirebaseSDK.updateDoc(threadRef, {
        lastMessage: cleanText,
        lastMessageAt: FirebaseSDK.serverTimestamp(),
        updatedAt: FirebaseSDK.serverTimestamp(),
        ownerUnread: FirebaseSDK.increment(1),
        clientUnread: 0,
        rescheduleStatus: kind === 'reschedule-request' ? 'requested' : (activeThread.rescheduleStatus || '')
      });
      setMessageDraft('');
    } finally {
      setSending(false);
    }
  };

  const sendRescheduleRequest = async () => {
    const booking = bookings.find(item => item.id === rescheduleDraft.bookingId) || bookings[0];
    if (!booking) return;
    const preferredDate = rescheduleDraft.date || 'another available date';
    const preferredTime = rescheduleDraft.time || 'a better time';
    await sendThreadMessage({
      kind: 'reschedule-request',
      bookingId: booking.id,
      text: `Reschedule request for ${booking.workspaceName || 'booking'}: ${booking.date} at ${booking.time}. Preferred: ${preferredDate} at ${preferredTime}.`
    });
    setRescheduleDraft({ bookingId: booking.id, date: '', time: '' });
  };

  const nextBooking = bookings.find(booking => booking.status !== 'declined') || bookings[0];
  const confirmedCount = bookings.filter(booking => booking.status === 'confirmed').length;
  const pendingCount = bookings.filter(booking => booking.status === 'pending' || booking.status === 'waitlist').length;

  return (
    <div className="native-ui min-h-screen bg-[#F7F7F5] text-black">
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-neutral-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 h-16 md:h-20 flex items-center justify-between gap-4">
          <BuildABookingBrand className="w-[154px] md:w-[190px]" />
          <div className="flex items-center gap-2">
            <button onClick={onOwnerLogin} className="hidden sm:inline-flex h-10 px-4 rounded-full border border-neutral-200 bg-white text-[10px] font-bold uppercase tracking-widest text-neutral-500 hover:text-black hover:border-black transition-colors">
              Owner Login
            </button>
            <button onClick={onSignOut} className="h-10 w-10 md:w-auto md:px-4 rounded-full bg-black text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-black/10">
              <LogOut size={14} />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-6 md:py-10">
        <section className="rounded-[1.5rem] md:rounded-lg bg-black text-white p-6 md:p-10 overflow-hidden relative shadow-2xl shadow-black/10">
          <div className="absolute inset-0 opacity-70 native-subtle-gradient" />
          <div className="relative z-10 max-w-3xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/45 mb-4">Client Portal</p>
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight leading-[0.95] mb-5">Your booking companion.</h1>
            <p className="text-white/65 text-base md:text-lg max-w-2xl">Track bookings, get updates, request changes, and chat with the place you booked with from one calm little command center.</p>
          </div>
        </section>

        <section className="mt-5 md:mt-6 rounded-lg bg-white border border-neutral-200 p-4 md:p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-lg bg-black text-white flex items-center justify-center shrink-0 shadow-xl shadow-black/10">
              <Smartphone size={18} />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-neutral-400 mb-1">Mobile App</p>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">Keep bookings one tap away.</h2>
              <p className="text-sm text-neutral-500 mt-1 max-w-2xl">Add Build A Booking to your phone so updates, messages, and reschedule requests stay easy to find after you book.</p>
            </div>
          </div>
          {onInstallApp && (
            <button onClick={onInstallApp} className="h-11 px-5 rounded-full bg-black text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors">
              <Download size={14} /> Add App
            </button>
          )}
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-5 md:mt-6">
          {[
            ['Bookings', bookings.length, Calendar],
            ['Confirmed', confirmedCount, CheckCircle2],
            ['Needs Update', pendingCount, Bell],
            ['Threads', threads.length, MessageCircle]
          ].map(([label, value, IconCmp]) => (
            <div key={label} className="rounded-lg bg-white border border-neutral-200 p-4 md:p-5 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-5">
                <IconCmp size={17} />
              </div>
              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-neutral-400 mb-2">{label}</p>
              <p className="metric-value text-3xl font-bold">{loading ? '-' : value}</p>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 md:gap-6 mt-5 md:mt-6">
          <section className="xl:col-span-5 rounded-lg bg-white border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-5 md:p-6 border-b border-neutral-100 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-neutral-400 mb-2">Booking Timeline</p>
                <h2 className="text-2xl font-bold tracking-tight">My Bookings</h2>
              </div>
              <RefreshCw size={18} className="text-neutral-300" />
            </div>
            <div className="divide-y divide-neutral-100">
              {bookings.length ? bookings.map(booking => (
                <button
                  key={booking.id}
                  type="button"
                  onClick={() => setActiveThreadId(booking.threadId || activeThreadId)}
                  className="w-full p-5 text-left hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-black truncate">{booking.workspaceName || 'Booking'}</h3>
                        <span className={`px-2 py-1 rounded-md border text-[8px] font-bold uppercase tracking-widest ${statusStyles[booking.status] || statusStyles.pending}`}>{booking.status || 'pending'}</span>
                      </div>
                      <p className="text-sm text-neutral-500">{booking.date} / {booking.time}</p>
                    </div>
                    <ArrowRight size={16} className="text-neutral-300 mt-1 shrink-0" />
                  </div>
                </button>
              )) : (
                <div className="p-10 text-center">
                  <div className="w-14 h-14 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center mx-auto mb-5 text-neutral-300"><Calendar size={22}/></div>
                  <h3 className="text-xl font-bold tracking-tight mb-2">No client bookings yet</h3>
                  <p className="text-sm text-neutral-500">Bookings linked to {emailKey || 'your email'} will appear here after you submit a request. Use this same email when you book.</p>
                </div>
              )}
            </div>
          </section>

          <section className="xl:col-span-7 rounded-lg bg-white border border-neutral-200 shadow-sm overflow-hidden">
            <div className="p-5 md:p-6 border-b border-neutral-100">
              <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-neutral-400 mb-2">Support Thread</p>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <h2 className="text-2xl font-bold tracking-tight">{activeThread?.workspaceName || nextBooking?.workspaceName || 'Messages'}</h2>
                {activeThread && <span className="text-[10px] font-bold uppercase tracking-widest rounded-full bg-neutral-50 border border-neutral-100 px-3 py-2 text-neutral-500">{activeThread.bookingStatus || 'open'}</span>}
              </div>
            </div>

            {activeThread ? (
              <>
                <div className="h-[340px] md:h-[420px] overflow-y-auto p-4 md:p-6 bg-neutral-50/60 space-y-3">
                  {messages.map(message => {
                    const mine = message.senderRole === 'client';
                    return (
                      <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${mine ? 'bg-black text-white rounded-br-md' : message.senderRole === 'system' ? 'bg-white border border-neutral-200 text-neutral-500' : 'bg-white text-black border border-neutral-200 rounded-bl-md'}`}>
                          <p className="text-[9px] font-bold uppercase tracking-widest opacity-45 mb-1">{message.senderRole === 'system' ? 'Update' : message.senderName || message.senderRole}</p>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                        </div>
                      </div>
                    );
                  })}
                  {!messages.length && (
                    <div className="h-full flex items-center justify-center text-center">
                      <p className="text-sm font-medium text-neutral-400">No messages yet. Start the conversation below.</p>
                    </div>
                  )}
                </div>

                <div className="p-4 md:p-5 border-t border-neutral-100 space-y-3">
                  <div className="rounded-lg border border-neutral-200 bg-white p-3 md:p-4">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2">
                      <select
                        value={rescheduleDraft.bookingId || bookings[0]?.id || ''}
                        onChange={(event) => setRescheduleDraft(prev => ({ ...prev, bookingId: event.target.value }))}
                        className="h-11 rounded-lg bg-neutral-50 border border-neutral-100 px-3 text-xs font-bold outline-none"
                      >
                        {bookings.map(booking => <option key={booking.id} value={booking.id}>{booking.date} / {booking.time}</option>)}
                      </select>
                      <div className="grid grid-cols-2 gap-2">
                        <input value={rescheduleDraft.date} onChange={(event) => setRescheduleDraft(prev => ({ ...prev, date: event.target.value }))} placeholder="New date" className="h-11 rounded-lg bg-neutral-50 border border-neutral-100 px-3 text-xs font-bold outline-none" />
                        <input value={rescheduleDraft.time} onChange={(event) => setRescheduleDraft(prev => ({ ...prev, time: event.target.value }))} placeholder="New time" className="h-11 rounded-lg bg-neutral-50 border border-neutral-100 px-3 text-xs font-bold outline-none" />
                      </div>
                      <button onClick={sendRescheduleRequest} disabled={!bookings.length || sending} className="h-11 px-4 rounded-lg bg-white border border-neutral-200 text-[9px] font-bold uppercase tracking-widest hover:border-black disabled:opacity-40">
                        Request Reschedule
                      </button>
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <textarea value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} placeholder="Write a message..." rows={2} className="flex-1 resize-none rounded-lg bg-neutral-50 border border-neutral-100 px-4 py-3 text-sm font-medium outline-none focus:bg-white focus:border-black transition-colors" />
                    <button onClick={() => sendThreadMessage({ text: messageDraft })} disabled={!messageDraft.trim() || sending} className="h-12 w-12 rounded-lg bg-black text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed">
                      <Send size={17} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-10 md:p-16 text-center">
                <div className="w-16 h-16 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center mx-auto mb-5 text-neutral-300"><MessageCircle size={24}/></div>
                <h3 className="text-2xl font-bold tracking-tight mb-3">Messages will appear here</h3>
                <p className="text-sm text-neutral-500 max-w-sm mx-auto">Once a booking is linked, this becomes your place to ask questions, request changes, and stay in touch with the business.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
