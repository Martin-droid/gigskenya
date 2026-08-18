import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc,
  query, where, limit, serverTimestamp, increment, setDoc, onSnapshot,
  Timestamp, runTransaction, getCountFromServer, documentId,
} from 'firebase/firestore';
import { db } from './firebase';

// ── Collections ───────────────────────────────────────────────
export const C = {
  USERS:    'users',
  ADS:      'ads',
  PROFILES: 'profiles',
  REPORTS:  'reports',
  RATINGS:  'ratings',
  STATS:    'platform_stats',
};

const STATS_REF = () => doc(db, C.STATS, 'public');
const _incrStats = (fields) =>
  setDoc(STATS_REF(), fields, { merge: true }).catch(() => {});

// ── Sanitize: strip blob: URLs and undefined values before writing to Firestore
// Firestore cannot serialize blob: URLs and the browser aborts the request.
const sanitize = (obj) => {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;                          // Firestore rejects undefined
    if (typeof v === 'string' && v.startsWith('blob:')) continue; // never persist blob URLs
    out[k] = v;
  }
  return out;
};

// ── User profiles ─────────────────────────────────────────────
export const createUserProfile = async (uid, data) => {
  const ref  = doc(db, C.USERS, uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    // Profile already exists — never overwrite the original role.
    // Only sync non-role identity fields.
    await setDoc(ref, {
      displayName: data.displayName || snap.data().displayName || '',
      email:       data.email       || snap.data().email       || '',
      photoURL:    data.photoURL    || snap.data().photoURL    || null,
      updatedAt:   serverTimestamp(),
    }, { merge: true });
  } else {
    // Brand-new account — write everything including role.
    const role = data.role || 'hirer';
    await setDoc(ref, {
      displayName:       data.displayName || '',
      email:             data.email || '',
      photoURL:          data.photoURL || null,
      role,
      phone:             data.phone || '',
      location:          data.location || '',
      createdAt:         serverTimestamp(),
      updatedAt:         serverTimestamp(),
      boosted:           false,
      boostExpiresAt:    null,
      boostPlan:         null,
      verified:          false,
      verifiedAt:        null,
      profileComplete:   false,
      adCount:           0,
      profileViews:      0,
      contactClicks:     0,
    });
    _incrStats({ [role === 'talent' ? 'talents' : 'hirers']: increment(1) });
  }
};

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, C.USERS, uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateUserProfile = async (uid, data) => {
  // role is immutable after registration — strip it from every update path
  const { role, ...safeData } = sanitize(data);
  if (Object.keys(safeData).length === 0) return;
  await setDoc(doc(db, C.USERS, uid), { ...safeData, updatedAt: serverTimestamp() }, { merge: true });
};

export const acceptTerms = async (uid) => {
  await setDoc(doc(db, C.USERS, uid), {
    termsAgreed: true,
    termsAgreedAt: serverTimestamp(),
    termsVersion: '2026-05-08',
  }, { merge: true });
};

// ── Talent profiles ───────────────────────────────────────────
export const saveTalentProfile = async (uid, data) => {
  // Hard role enforcement: a hirer account can never create a talent profile
  const userSnap = await getDoc(doc(db, C.USERS, uid));
  if (userSnap.exists() && userSnap.data().role === 'hirer') {
    throw Object.assign(new Error('ROLE_MISMATCH'), {
      code: 'ROLE_MISMATCH',
      message: 'This account is registered as a Hirer and cannot create a talent profile.',
    });
  }

  const profileRef = doc(db, C.PROFILES, uid);
  const existing   = await getDoc(profileRef);
  const prev       = existing.exists() ? existing.data() : {};

  const base = {
    ...sanitize(data),
    userId:    uid,
    status:    'active',
    updatedAt: serverTimestamp(),
    boosted:        prev.boosted        ?? false,
    boostExpiresAt: prev.boostExpiresAt ?? null,
    boostPlan:      prev.boostPlan      ?? null,
    featured:       prev.featured       ?? false,
    views:          prev.views          ?? 0,
    contactClicks:  prev.contactClicks  ?? 0,
  };
  if (!existing.exists()) base.createdAt = serverTimestamp();

  await setDoc(profileRef, base, { merge: true });
  // updateUserProfile strips role — profileComplete only, role never changed here
  await updateUserProfile(uid, { profileComplete: true });
};

export const getTalentProfile = async (uid) => {
  const snap = await getDoc(doc(db, C.PROFILES, uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getTalentsCount = async () => {
  try {
    const snap = await getCountFromServer(
      query(collection(db, C.PROFILES), where('status', '==', 'active'))
    );
    return snap.data().count;
  } catch { return null; }
};

export const getTalents = async ({ limitCount = 50 } = {}) => {
  const q = query(
    collection(db, C.PROFILES),
    where('status', '==', 'active'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return docs.sort((a, b) => {
    if (b.boosted !== a.boosted) return b.boosted ? 1 : -1;
    return (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0);
  });
};

export const incrementProfileViews = (uid) =>
  updateDoc(doc(db, C.PROFILES, uid), { views: increment(1) }).catch(() => {});

export const incrementProfileContact = (uid) =>
  updateDoc(doc(db, C.PROFILES, uid), { contactClicks: increment(1) }).catch(() => {});

// ── Job ads ───────────────────────────────────────────────────
export const createAd = async (uid, data) => {
  const ref = await addDoc(collection(db, C.ADS), {
    ...sanitize(data),
    userId:        uid,
    status:        'active',
    views:         0,
    contactClicks: 0,
    boosted:        false,
    boostExpiresAt: null,
    boostPlan:      null,
    featured:       false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, C.USERS, uid), { adCount: increment(1) }).catch(() => {});
  _incrStats({ ads: increment(1) });
  return ref.id;
};

export const getAd = async (id) => {
  const snap = await getDoc(doc(db, C.ADS, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

// Ads posted before the posterLogo field existed — or before the hirer
// had uploaded a company logo yet — don't carry one. Backfill from each
// poster's *current* hirer profile so cards stay up to date without
// requiring a repost. Requires the viewer to be signed in (hirer_profiles
// reads are auth-gated); anonymous visitors silently keep initials.
const _fillMissingLogos = async (ads) => {
  const uids = [...new Set(ads.filter(a => !a.posterLogo && a.userId).map(a => a.userId))];
  if (!uids.length) return;
  const logos = new Map();
  for (let i = 0; i < uids.length; i += 10) {
    const chunk = uids.slice(i, i + 10);
    try {
      const snap = await getDocs(query(collection(db, 'hirer_profiles'), where(documentId(), 'in', chunk)));
      snap.docs.forEach(d => {
        const url = d.data().companyLogoURL;
        if (url) logos.set(d.id, url);
      });
    } catch { /* not signed in, or rules deny — leave this batch unfilled */ }
  }
  ads.forEach(a => { if (!a.posterLogo && logos.has(a.userId)) a.posterLogo = logos.get(a.userId); });
};

export const getAds = async ({ limitCount = 50 } = {}) => {
  const q = query(
    collection(db, C.ADS),
    where('status', '==', 'active'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  await _fillMissingLogos(docs);
  return docs.sort((a, b) => (b.boosted ? 1 : 0) - (a.boosted ? 1 : 0));
};

export const getUserAds = async (uid) => {
  const q = query(collection(db, C.ADS), where('userId', '==', uid));
  const snap = await getDocs(q);
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
};

export const deleteAd = async (id, uid) => {
  await updateDoc(doc(db, C.ADS, id), { status: 'deleted', updatedAt: serverTimestamp() });
  await updateDoc(doc(db, C.USERS, uid), { adCount: increment(-1) }).catch(() => {});
  _incrStats({ ads: increment(-1) });
};

export const incrementAdViews = (id) =>
  updateDoc(doc(db, C.ADS, id), { views: increment(1) }).catch(() => {});

export const incrementAdContact = (id) =>
  updateDoc(doc(db, C.ADS, id), { contactClicks: increment(1) }).catch(() => {});

// ── Boost ─────────────────────────────────────────────────────
export const boostProfile = async (uid, plan = 'basic', days = 7) => {
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  await updateDoc(doc(db, C.PROFILES, uid), {
    boosted: true, boostPlan: plan, boostExpiresAt: expires, updatedAt: serverTimestamp()
  });
  await updateDoc(doc(db, C.USERS, uid), {
    boosted: true, boostPlan: plan, boostExpiresAt: expires
  });
};

export const boostAd = async (id, plan = 'basic', days = 7) => {
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  await updateDoc(doc(db, C.ADS, id), {
    boosted: true, boostPlan: plan, boostExpiresAt: expires, updatedAt: serverTimestamp()
  });
};

export const removeBoost = async (uid) => {
  await updateDoc(doc(db, C.PROFILES, uid), {
    boosted: false, boostPlan: null, boostExpiresAt: null
  }).catch(() => {});
  await updateDoc(doc(db, C.ADS, uid), {
    boosted: false, boostPlan: null, boostExpiresAt: null
  }).catch(() => {});
};

// ── Reports ───────────────────────────────────────────────────
export const reportListing = async (targetId, reporterId, reason) => {
  await addDoc(collection(db, C.REPORTS), {
    targetId, reporterId, reason, createdAt: serverTimestamp()
  });
};

// ── Messaging ─────────────────────────────────────────────────
export const getThreadId = (uid1, uid2) => [uid1, uid2].sort().join('_');

// ── Helper: update thread metadata after any message ──────────
const _updateThread = async (threadRef, senderId, receiverId, senderName, lastMessage, now) => {
  const snap = await getDoc(threadRef);
  if (!snap.exists()) {
    await setDoc(threadRef, {
      participants:     [senderId, receiverId],
      participantNames: { [senderId]: senderName || '', [receiverId]: '' },
      lastMessage,
      lastSenderId:   senderId,
      lastSenderName: senderName || '',
      updatedAt:      now,
      [`unread_${receiverId}`]: 1,
      [`unread_${senderId}`]:   0,
    });
  } else {
    await updateDoc(threadRef, {
      lastMessage,
      lastSenderId:   senderId,
      lastSenderName: senderName || '',
      updatedAt:      serverTimestamp(),
      [`unread_${receiverId}`]: increment(1),
      [`unread_${senderId}`]:   0,
    });
  }
};

// ── Send a plain text message ──────────────────────────────────
export const sendMessage = async (threadId, senderId, receiverId, text, senderName) => {
  const now = Timestamp.now();

  await addDoc(collection(db, 'messages'), {
    threadId,
    senderId,
    receiverId,
    participants: [senderId, receiverId],
    senderName: senderName || '',
    text,
    type:      'text',
    read:      false,
    createdAt: now,
  });

  await _updateThread(
    doc(db, 'threads', threadId),
    senderId, receiverId, senderName,
    text, now
  );
};

// ── Send a file / image message ────────────────────────────────
export const sendFileMessage = async (threadId, senderId, receiverId, fileInfo, senderName) => {
  const now      = Timestamp.now();
  const isImage  = fileInfo.mimeType?.startsWith('image/');
  const msgType  = isImage ? 'image' : 'file';
  const preview  = isImage ? `📷 ${fileInfo.name}` : `📎 ${fileInfo.name}`;

  await addDoc(collection(db, 'messages'), {
    threadId,
    senderId,
    receiverId,
    participants: [senderId, receiverId],
    senderName:  senderName || '',
    text:        '',
    type:        msgType,
    file: {
      url:      fileInfo.url,
      name:     fileInfo.name,
      size:     fileInfo.size,
      mimeType: fileInfo.mimeType,
    },
    read:      false,
    createdAt: now,
  });

  await _updateThread(
    doc(db, 'threads', threadId),
    senderId, receiverId, senderName,
    preview, now
  );
};

// ── Subscribe to threads ───────────────────────────────────────
export const subscribeToThreads = (uid, callback) => {
  const q = query(
    collection(db, 'threads'),
    where('participants', 'array-contains', uid)
  );
  return onSnapshot(q, snap => {
    const threads = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) =>
        (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0)
      );
    callback(threads);
  });
};

// ── Subscribe to messages ──────────────────────────────────────
export const subscribeToMessages = (threadId, callback, onError) => {
  const q = query(
    collection(db, 'messages'),
    where('threadId', '==', threadId)
  );
  // Note: includeMetadataChanges is intentionally omitted. Enabling it
  // triggers a Firestore SDK 12.x internal assertion crash (ID: ca9) when
  // the listener is torn down and re-created rapidly (e.g. switching threads).
  return onSnapshot(
    q,
    snap => {
      const msgs = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) =>
          (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0)
        );
      callback(msgs);
    },
    err => {
      console.error('subscribeToMessages failed:', err.code, err.message);
      onError?.(err);
    }
  );
};

export const markThreadRead = async (threadId, uid) => {
  await updateDoc(doc(db, 'threads', threadId), {
    [`unread_${uid}`]: 0,
  }).catch(() => {});
};

export const getTotalUnread = async (uid) => {
  const q = query(
    collection(db, 'threads'),
    where('participants', 'array-contains', uid)
  );
  const snap = await getDocs(q);
  return snap.docs.reduce((sum, d) => sum + (d.data()[`unread_${uid}`] || 0), 0);
};

export const getOrCreateThread = async (myUid, myName, otherUid, otherName) => {
  const threadId = getThreadId(myUid, otherUid);
  const ref      = doc(db, 'threads', threadId);

  // The Firestore rule uses resource.data.participants; for a non-existent
  // document resource.data is null, so the rule evaluates to false and the
  // SDK throws permission-denied. Treat that as "thread doesn't exist yet".
  let snap = null;
  try {
    snap = await getDoc(ref);
  } catch (e) {
    if (e.code !== 'permission-denied') throw e;
  }

  if (!snap?.exists()) {
    await setDoc(ref, {
      participants:     [myUid, otherUid],
      participantNames: { [myUid]: myName, [otherUid]: otherName },
      lastMessage:      '',
      updatedAt:        serverTimestamp(),
      [`unread_${myUid}`]:    0,
      [`unread_${otherUid}`]: 0,
    });
    _incrStats({ pitches: increment(1) });
  } else if (!snap.data().participantNames?.[otherUid] && otherName) {
    await updateDoc(ref, {
      [`participantNames.${otherUid}`]: otherName,
    }).catch(() => {});
  }

  return threadId;
};

// ── Hirer profiles ────────────────────────────────────────────
export const getHirerProfile = async (uid) => {
  const snap = await getDoc(doc(db, 'hirer_profiles', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const saveHirerProfile = async (uid, data) => {
  // Hard role enforcement: a talent account can never create a hirer profile
  const userSnap = await getDoc(doc(db, C.USERS, uid));
  if (userSnap.exists() && userSnap.data().role === 'talent') {
    throw Object.assign(new Error('ROLE_MISMATCH'), {
      code: 'ROLE_MISMATCH',
      message: 'This account is registered as Talent and cannot create a hirer profile.',
    });
  }

  const clean = sanitize(data);

  await setDoc(doc(db, 'hirer_profiles', uid), {
    ...clean,
    uid,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  // setDoc with merge:true handles the createdAt-only-on-first-write pattern
  // without needing a separate getDoc round-trip. We use a conditional field
  // approach: only set createdAt if the document doesn't exist yet, which
  // merge:true handles correctly when the field isn't present.
  const snap = await getDoc(doc(db, 'hirer_profiles', uid));
  if (snap.exists() && !snap.data().createdAt) {
    await updateDoc(doc(db, 'hirer_profiles', uid), { createdAt: serverTimestamp() });
  }

  await updateUserProfile(uid, { profileComplete: true });
};

// ── Ratings ───────────────────────────────────────────────────
// Each rating is stored as ratings/<targetId>_<raterId> so a rater
// can update their own rating but never create a duplicate.
export const submitRating = async (targetId, raterId, score, comment = '') => {
  const ratingId   = `${targetId}_${raterId}`;
  const ratingRef  = doc(db, C.RATINGS, ratingId);
  const profileRef = doc(db, C.PROFILES, targetId);

  await runTransaction(db, async (tx) => {
    const existing    = await tx.get(ratingRef);
    const profileSnap = await tx.get(profileRef);
    const prevScore   = existing.exists() ? existing.data().score : 0;
    const isNew       = !existing.exists();

    tx.set(ratingRef, {
      targetId, raterId, score, comment,
      updatedAt: serverTimestamp(),
      ...(isNew ? { createdAt: serverTimestamp() } : {}),
    }, { merge: true });

    if (profileSnap.exists()) {
      if (isNew) {
        tx.update(profileRef, { ratingSum: increment(score), ratingCount: increment(1) });
      } else {
        tx.update(profileRef, { ratingSum: increment(score - prevScore) });
      }
    }
  });
};

export const getMyRating = async (targetId, raterId) => {
  const snap = await getDoc(doc(db, C.RATINGS, `${targetId}_${raterId}`));
  return snap.exists() ? snap.data() : null;
};

export const getRatings = async (targetId) => {
  const q    = query(collection(db, C.RATINGS), where('targetId', '==', targetId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ── Platform Stats ────────────────────────────────────────
// Reads the publicly cached stats document — visible to all users
// including unauthenticated visitors. Updated atomically on each
// registration, ad creation, and ad deletion.
export const getPlatformStats = async () => {
  try {
    const snap = await getDoc(STATS_REF());
    if (snap.exists()) {
      const d = snap.data();
      return {
        hirers:  d.hirers  || 0,
        talents: d.talents || 0,
        ads:     d.ads     || 0,
      };
    }

    const [hirersResult, talentsResult, adsResult] = await Promise.allSettled([
      getCountFromServer(query(collection(db, C.USERS),    where('role',   '==', 'hirer'))),
      getCountFromServer(query(collection(db, C.PROFILES), where('status', '==', 'active'))),
      getCountFromServer(query(collection(db, C.ADS),      where('status', '==', 'active'))),
    ]);
    const stats = {
      hirers:  hirersResult.status  === 'fulfilled' ? hirersResult.value.data().count  : 0,
      talents: talentsResult.status === 'fulfilled' ? talentsResult.value.data().count : 0,
      ads:     adsResult.status     === 'fulfilled' ? adsResult.value.data().count     : 0,
    };
    await setDoc(STATS_REF(), stats).catch(() => {});
    return stats;
  } catch {
    return { hirers: 0, talents: 0, ads: 0 };
  }
};