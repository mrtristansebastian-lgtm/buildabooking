import * as FirebaseSDK from '../../../services/firebase';
import { appId, db } from '../../../services/firebase';

const BATCH_LIMIT = 400;

const cleanId = (value = '', fallback = 'item') => (
  String(value || fallback)
    .trim()
    .replace(/[^A-Za-z0-9@._:-]/g, '-')
    .slice(0, 180) || fallback
);

const timestampMs = (value, fallback = Date.now()) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (value?.toMillis) return value.toMillis();
  if (typeof value?.seconds === 'number') return value.seconds * 1000;
  const parsed = new Date(value || 0).getTime();
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const lower = (value = '') => String(value || '').trim().toLowerCase();

const chunk = (items = [], size = BATCH_LIMIT) => {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
};

const ownerCollection = (ownerId, collectionName) => (
  FirebaseSDK.collection(db, 'artifacts', appId, 'users', ownerId, collectionName)
);

const normalizeMirrorRecord = (record = {}, id, collectionName) => {
  const now = Date.now();
  const base = {
    ...record,
    id,
    updatedAtMs: timestampMs(record.updatedAtMs || record.updatedAt || record.importedAt || record.createdAt, now)
  };

  if (collectionName === 'clients') {
    return {
      ...base,
      searchName: lower(record.name),
      searchEmail: lower(record.email),
      searchPhone: String(record.phone || '').replace(/\D/g, ''),
      createdAtMs: timestampMs(record.createdAt, now)
    };
  }

  if (collectionName === 'staff') {
    return {
      ...base,
      searchName: lower(record.name || record.displayName),
      searchEmail: lower(record.email),
      sortOrder: Number.isFinite(Number(record.sortOrder)) ? Number(record.sortOrder) : 0
    };
  }

  if (collectionName === 'services') {
    return {
      ...base,
      searchName: lower(record.name),
      categoryKey: lower(record.category),
      sortOrder: Number.isFinite(Number(record.sortOrder)) ? Number(record.sortOrder) : 0
    };
  }

  if (collectionName === 'financeImports') {
    return {
      ...base,
      importedAtMs: timestampMs(record.importedAt || record.updatedAtMs || record.createdAt, now)
    };
  }

  return base;
};

export const syncListCollection = async ({
  ownerId,
  collectionName,
  list = [],
  idForRecord = record => record.id,
  deleteMissing = true
}) => {
  if (!db || !ownerId || !collectionName) return;
  const collectionRef = ownerCollection(ownerId, collectionName);
  const normalized = (Array.isArray(list) ? list : [])
    .map((record, index) => {
      const id = cleanId(idForRecord(record, index), `${collectionName}-${index + 1}`);
      return normalizeMirrorRecord(record, id, collectionName);
    })
    .filter(record => record.id);
  const nextIds = new Set(normalized.map(record => record.id));

  for (const group of chunk(normalized)) {
    const batch = FirebaseSDK.writeBatch(db);
    group.forEach(record => {
      batch.set(FirebaseSDK.doc(collectionRef, record.id), record, { merge: true });
    });
    await batch.commit();
  }

  if (!deleteMissing) return;
  const existingSnap = await FirebaseSDK.getDocs(collectionRef);
  const staleDocs = existingSnap.docs.filter(docSnap => !nextIds.has(docSnap.id));
  for (const group of chunk(staleDocs)) {
    const batch = FirebaseSDK.writeBatch(db);
    group.forEach(docSnap => batch.delete(docSnap.ref));
    await batch.commit();
  }
};

export const syncPublicWorkspaceCollections = async ({
  publicSlug,
  settings = {},
  staffList = []
}) => {
  if (!db || !publicSlug) return;
  const workspaceRef = FirebaseSDK.doc(db, 'artifacts', appId, 'public', 'data', 'workspaces', publicSlug);
  const publicServices = Array.isArray(settings.services) ? settings.services : [];
  const publicStaff = (Array.isArray(staffList) ? staffList : [])
    .filter(staff => staff?.id && staff.accessEnabled !== false)
    .map(staff => ({
      id: cleanId(staff.id, 'staff'),
      name: staff.name || staff.displayName || 'Team member',
      color: staff.color || '#111827',
      photoURL: staff.photoURL || '',
      sortOrder: Number.isFinite(Number(staff.sortOrder)) ? Number(staff.sortOrder) : 0,
      updatedAtMs: Date.now()
    }));

  await syncNestedPublicList({ workspaceRef, collectionName: 'services', list: publicServices });
  await syncNestedPublicList({ workspaceRef, collectionName: 'staff', list: publicStaff });
};

const syncNestedPublicList = async ({ workspaceRef, collectionName, list }) => {
  const collectionRef = FirebaseSDK.collection(workspaceRef, collectionName);
  const normalized = (Array.isArray(list) ? list : [])
    .map((record, index) => normalizeMirrorRecord(record, cleanId(record.id, `${collectionName}-${index + 1}`), collectionName));
  const nextIds = new Set(normalized.map(record => record.id));

  for (const group of chunk(normalized)) {
    const batch = FirebaseSDK.writeBatch(db);
    group.forEach(record => batch.set(FirebaseSDK.doc(collectionRef, record.id), record, { merge: true }));
    await batch.commit();
  }

  const existingSnap = await FirebaseSDK.getDocs(collectionRef);
  const staleDocs = existingSnap.docs.filter(docSnap => !nextIds.has(docSnap.id));
  for (const group of chunk(staleDocs)) {
    const batch = FirebaseSDK.writeBatch(db);
    group.forEach(docSnap => batch.delete(docSnap.ref));
    await batch.commit();
  }
};

export const syncWorkspaceScaleCollections = async ({
  ownerId,
  settings = {},
  staffList = []
}) => {
  if (!db || !ownerId) return;
  await syncListCollection({
    ownerId,
    collectionName: 'services',
    list: Array.isArray(settings.services) ? settings.services : [],
    idForRecord: record => record.id
  });
  await syncCalendarCollections({ ownerId, settings, staffList });
};

export const syncCalendarCollections = async ({ ownerId, settings = {}, staffList = [] }) => {
  if (!db || !ownerId) return;
  const defaultRows = [
    {
      id: 'workspace',
      calendarId: 'workspace',
      calendarName: settings.brandName || 'Business',
      availableTimes: Array.isArray(settings.availableTimes) ? settings.availableTimes : [],
      scheduleDefaults: settings.scheduleDefaults || {},
      updatedAtMs: Date.now()
    },
    ...(Array.isArray(staffList) ? staffList : []).filter(staff => staff?.id).map(staff => ({
      id: cleanId(staff.id, 'staff'),
      calendarId: staff.id,
      calendarName: staff.name || 'Staff',
      availableTimes: Array.isArray(settings.staffCalendars?.[staff.id]?.availableTimes)
        ? settings.staffCalendars[staff.id].availableTimes
        : [],
      scheduleDefaults: settings.staffCalendars?.[staff.id]?.scheduleDefaults || {},
      updatedAtMs: Date.now()
    }))
  ];
  await syncListCollection({
    ownerId,
    collectionName: 'calendarDefaults',
    list: defaultRows,
    idForRecord: record => record.id
  });

  const dayRows = [];
  Object.entries(settings.schedule || {}).forEach(([dateKey, config]) => {
    dayRows.push(normalizeCalendarDayRow('workspace', dateKey, config));
  });
  Object.entries(settings.staffCalendars || {}).forEach(([staffId, calendar]) => {
    Object.entries(calendar?.schedule || {}).forEach(([dateKey, config]) => {
      dayRows.push(normalizeCalendarDayRow(staffId, dateKey, config));
    });
  });
  await syncListCollection({
    ownerId,
    collectionName: 'calendarDays',
    list: dayRows,
    idForRecord: record => record.id
  });
};

const normalizeCalendarDayRow = (calendarId, dateKey, config = {}) => ({
  id: `${cleanId(calendarId, 'workspace')}_${cleanId(dateKey, 'date')}`,
  calendarId,
  dateKey,
  available: config.available !== false,
  times: Array.isArray(config.times) ? config.times : [],
  updatedAtMs: timestampMs(config.updatedAt || config.updatedAtMs, Date.now())
});
