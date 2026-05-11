import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Send, ArrowLeft, MessageSquare, Search, X, Loader,
  CheckCheck, Paperclip, FileText, ImageIcon, Download, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  subscribeToThreads, subscribeToMessages, sendMessage, sendFileMessage,
  markThreadRead, getOrCreateThread,
} from '../lib/firestore';
import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';

// ── Constants ──────────────────────────────────────────────────
const MAX_FILE_MB   = 10;
const MAX_FILE_SIZE = MAX_FILE_MB * 1024 * 1024;
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];

// ── Presence helpers ───────────────────────────────────────────
function usePresence(myUid) {
  useEffect(() => {
    if (!myUid) return;
    const r = doc(db, 'presence', myUid);
    setDoc(r, { online: true, lastSeen: serverTimestamp() }, { merge: true }).catch(() => {});
    const handleUnload = () =>
      setDoc(r, { online: false, lastSeen: serverTimestamp() }, { merge: true }).catch(() => {});
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      setDoc(r, { online: false, lastSeen: serverTimestamp() }, { merge: true }).catch(() => {});
    };
  }, [myUid]);
}

function useOnlineStatus(uid) {
  const [online, setOnline] = useState(false);
  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(
      doc(db, 'presence', uid),
      snap => setOnline(snap.exists() ? snap.data()?.online === true : false),
      () => setOnline(false)
    );
    // Firestore 12.x has an SDK bug (ID: ca9) where calling unsubscribe
    // synchronously in React's commit-phase cleanup triggers an internal
    // assertion crash. The try-catch prevents it from crashing the UI.
    return () => { try { unsub(); } catch {} };
  }, [uid]);
  return online;
}

// ── Helpers ────────────────────────────────────────────────────
const avatarColors = ['#4F46E5','#EC4899','#F59E0B','#10B981','#EF4444','#8B5CF6','#06B6D4','#F97316'];
function getColor(str) {
  if (!str) return avatarColors[0];
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return avatarColors[Math.abs(h) % avatarColors.length];
}
function getInitials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}
function timeAgo(ts) {
  if (!ts) return '';
  const d    = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return d.toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
}
function formatTime(ts) {
  if (!ts?.toDate) return '';
  return ts.toDate().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });
}
function formatBytes(bytes) {
  if (!bytes) return '';
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Avatar({ name, size = 40, online }) {
  const color = getColor(name);
  return (
    <div style={{ position: 'relative', flexShrink: 0, width: size, height: size }}>
      <div style={{ width: size, height: size, borderRadius: '50%', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: size * 0.36, color }}>
        {getInitials(name)}
      </div>
      {online !== undefined && (
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: size * 0.28, height: size * 0.28, borderRadius: '50%', background: online ? '#22C55E' : '#9CA3AF', border: '2px solid white' }} />
      )}
    </div>
  );
}

// ── Thread list item ───────────────────────────────────────────
function ThreadItem({ thread, myUid, active, onClick }) {
  const otherUid  = thread.participants?.find(p => p !== myUid);
  const otherName = thread.participantNames?.[otherUid] || 'User';
  const unread    = thread[`unread_${myUid}`] || 0;
  const [online, setOnline] = useState(false);

  useEffect(() => {
    if (!otherUid) return;
    const unsub = onSnapshot(doc(db, 'presence', otherUid), snap => {
      setOnline(snap.exists() ? snap.data()?.online === true : false);
    }, () => {});
    return () => { try { unsub(); } catch {} };
  }, [otherUid]);

  return (
    <button onClick={onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: active ? 'var(--green-light)' : 'transparent', border: 'none', borderBottom: '1px solid var(--grey-150)', cursor: 'pointer', textAlign: 'left', transition: 'background .15s' }}
      onMouseOver={e => { if (!active) e.currentTarget.style.background = 'var(--grey-100)'; }}
      onMouseOut={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}>
      <Avatar name={otherName} size={40} online={online} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
          <span style={{ fontWeight: unread > 0 ? 700 : 600, fontSize: 13, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>
            {otherName}
          </span>
          <span style={{ fontSize: 10, color: 'var(--grey-400)', flexShrink: 0, marginLeft: 6 }}>
            {timeAgo(thread.updatedAt)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
          <p style={{ fontSize: 12, color: unread > 0 ? 'var(--ink)' : 'var(--grey-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: unread > 0 ? 600 : 400, flex: 1 }}>
            {thread.lastSenderId === myUid ? 'You: ' : ''}{thread.lastMessage || 'Start the conversation →'}
          </p>
          {unread > 0 && (
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--green)', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {unread > 9 ? '9+' : unread}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

// ── File preview bubble ────────────────────────────────────────
function FileBubble({ msg, isMe }) {
  const { file } = msg;
  const isImage  = msg.type === 'image';
  const time     = formatTime(msg.createdAt);

  if (isImage) {
    return (
      <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 4 }}>
        <div style={{ maxWidth: '70%' }}>
          <a href={file.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', overflow: 'hidden', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,.12)', cursor: 'zoom-in' }}>
            <img src={file.url} alt={file.name} style={{ display: 'block', maxWidth: '100%', maxHeight: 280, objectFit: 'cover' }} />
          </a>
          <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginTop: 3 }}>
            <span style={{ fontSize: 10, color: 'var(--grey-400)' }}>{time}</span>
          </div>
        </div>
      </div>
    );
  }

  const ext      = file.name?.split('.').pop()?.toUpperCase() || 'FILE';
  const extColor = ext === 'PDF' ? '#EF4444' : ext === 'DOC' || ext === 'DOCX' ? '#3B82F6' : '#6B7280';

  return (
    <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 4 }}>
      <div style={{ maxWidth: '70%', borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: isMe ? 'var(--green)' : 'white', border: isMe ? 'none' : '1px solid var(--grey-200)', boxShadow: isMe ? 'none' : '0 1px 3px rgba(0,0,0,.05)', overflow: 'hidden' }}>
        <a href={file.url} target="_blank" rel="noopener noreferrer" download={file.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px', textDecoration: 'none' }}>
          <div style={{ width: 38, height: 44, borderRadius: 6, background: isMe ? 'rgba(255,255,255,.2)' : `${extColor}15`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: isMe ? '1px solid rgba(255,255,255,.25)' : `1px solid ${extColor}30` }}>
            <FileText size={16} color={isMe ? 'white' : extColor} />
            <span style={{ fontSize: 8, fontWeight: 800, color: isMe ? 'white' : extColor, marginTop: 2, letterSpacing: '.03em' }}>{ext}</span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: isMe ? 'white' : 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{file.name}</p>
            <p style={{ fontSize: 11, color: isMe ? 'rgba(255,255,255,.7)' : 'var(--grey-400)' }}>{formatBytes(file.size)}</p>
          </div>
          <Download size={14} color={isMe ? 'rgba(255,255,255,.8)' : 'var(--grey-400)'} style={{ flexShrink: 0 }} />
        </a>
        <div style={{ padding: '0 13px 8px', display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 10, color: isMe ? 'rgba(255,255,255,.6)' : 'var(--grey-400)' }}>{time}</span>
        </div>
      </div>
    </div>
  );
}

// ── Text message bubble ────────────────────────────────────────
function Bubble({ msg, isMe, isLast }) {
  if (msg.type === 'image' || msg.type === 'file') {
    return <FileBubble msg={msg} isMe={isMe} />;
  }
  const time = formatTime(msg.createdAt);
  return (
    <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 4, alignItems: 'flex-end', gap: 6 }}>
      <div style={{ maxWidth: '70%', padding: '9px 13px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: isMe ? 'var(--green)' : 'white', color: isMe ? 'white' : 'var(--ink)', border: isMe ? 'none' : '1px solid var(--grey-200)', boxShadow: isMe ? 'none' : '0 1px 3px rgba(0,0,0,.05)' }}>
        <p style={{ fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.text}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 3 }}>
          <span style={{ fontSize: 10, opacity: 0.65 }}>{time}</span>
          {isMe && isLast && <CheckCheck size={11} style={{ opacity: 0.75 }} />}
        </div>
      </div>
    </div>
  );
}

// ── Upload progress bar ────────────────────────────────────────
function UploadBar({ progress, fileName, onCancel }) {
  return (
    <div style={{ padding: '8px 14px', background: 'white', borderTop: '1px solid var(--grey-200)', flexShrink: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: 'var(--grey-600)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
          Uploading {fileName}…
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--grey-400)', fontWeight: 600 }}>{progress}%</span>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--grey-400)', display: 'flex', padding: 2 }}>
            <X size={13} />
          </button>
        </div>
      </div>
      <div style={{ height: 3, background: 'var(--grey-200)', borderRadius: 99 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: 'var(--green)', borderRadius: 99, transition: 'width .2s' }} />
      </div>
    </div>
  );
}

// ── Chat window ────────────────────────────────────────────────
function ChatWindow({ threadId, myUid, myName, otherUid, otherName, onBack, isPitch = false }) {
  const [messages, setMessages]         = useState([]);
  const [text, setText]                 = useState('');
  const [sending, setSending]           = useState(false);
  const [sendErr, setSendErr]           = useState('');
  const [uploadProgress, setUpProgress] = useState(null);
  const [fileErr, setFileErr]           = useState('');
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const fileRef    = useRef(null);
  const uploadTask = useRef(null);
  const otherOnline = useOnlineStatus(otherUid);

  useEffect(() => {
    if (!threadId) return;
    const unsub = subscribeToMessages(
      threadId,
      msgs => {
        setMessages(msgs);
        markThreadRead(threadId, myUid).catch(() => {});
      },
      () => setSendErr('Could not load messages — check your connection.')
    );
    return () => { try { unsub(); } catch {} };
  }, [threadId, myUid]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, [threadId]);

  // ── Send text ──────────────────────────────────────────────
  const handleSend = async e => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSendErr('');
    setText('');
    setSending(true);
    try {
      await sendMessage(threadId, myUid, otherUid, trimmed, myName);
    } catch (err) {
      console.error('sendMessage error:', err);
      setSendErr('Failed to send — check your connection.');
      setText(trimmed);
    } finally {
      setSending(false);
    }
  };

  // ── File picker ────────────────────────────────────────────
  const handleFileClick = () => {
    setFileErr('');
    fileRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileErr('File type not supported. Please send an image, PDF, Word, Excel, or text file.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileErr(`File too large. Maximum size is ${MAX_FILE_MB} MB.`);
      return;
    }

    setFileErr('');
    setUpProgress({ pct: 0, name: file.name });

    const path = `chat-files/${threadId}/${Date.now()}_${file.name}`;
    const sRef = storageRef(storage, path);
    const task = uploadBytesResumable(sRef, file);
    uploadTask.current = task;

    task.on(
      'state_changed',
      snap => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        setUpProgress({ pct, name: file.name });
      },
      err => {
        console.error('Upload error:', err);
        setUpProgress(null);
        if (err.code !== 'storage/canceled') {
          setFileErr('Upload failed — check your connection and try again.');
        }
      },
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          await sendFileMessage(threadId, myUid, otherUid, {
            url,
            name:     file.name,
            size:     file.size,
            mimeType: file.type,
          }, myName);
        } catch (err) {
          console.error('sendFileMessage error:', err);
          setFileErr('File sent but message could not be saved. Try again.');
        } finally {
          setUpProgress(null);
        }
      }
    );
  };

  const cancelUpload = () => {
    uploadTask.current?.cancel();
    setUpProgress(null);
  };

  // ── Derived pitch UI values ────────────────────────────────
  const showPitchTip = isPitch && messages.length === 0;
  const headerBg     = isPitch ? '#FFFBEB' : 'white';
  const inputPlaceholder = isPitch
    ? 'Introduce yourself, mention your rate, and say why you\'re the best fit…'
    : 'Type a message… (Enter to send)';
  const attachHint = isPitch
    ? `📎 Attach your CV, portfolio, or work samples · Max ${MAX_FILE_MB} MB`
    : `📎 Images, PDF, Word, Excel · Max ${MAX_FILE_MB} MB`;
  const emptySubline = isPitch
    ? (otherOnline ? 'Online now · ' : '') + 'Send your pitch to get the ball rolling!'
    : (otherOnline ? 'Online now · ' : '') + 'Say hello to start the conversation!';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: '1px solid var(--grey-200)', background: headerBg, flexShrink: 0, transition: 'background .2s' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--grey-500)', display: 'flex', padding: 6, borderRadius: 8, flexShrink: 0 }}>
          <ArrowLeft size={17} />
        </button>
        <Avatar name={otherName} size={36} online={otherOnline} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{otherName}</p>
            {isPitch && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 'var(--r-full)', background: '#FEF3C7', color: '#92400E', letterSpacing: '.04em', textTransform: 'uppercase', flexShrink: 0 }}>
                Pitch
              </span>
            )}
          </div>
          <p style={{ fontSize: 11, color: otherOnline ? (isPitch ? '#D97706' : 'var(--green)') : 'var(--grey-400)', fontWeight: 500 }}>
            {isPitch
              ? (otherOnline ? '● Online now · Waiting for your pitch' : '○ Offline · Leave your pitch below')
              : (otherOnline ? '● Online' : '○ Offline')}
          </p>
        </div>
      </div>

      {/* Pitch tip banner — only on empty thread */}
      {showPitchTip && (
        <div style={{ padding: '10px 16px', background: '#FFFBEB', borderBottom: '1px solid #FDE68A', display: 'flex', alignItems: 'flex-start', gap: 9, flexShrink: 0 }}>
          <span style={{ fontSize: 15, lineHeight: 1, marginTop: 2, flexShrink: 0 }}>💡</span>
          <p style={{ fontSize: 12, color: '#92400E', lineHeight: 1.6, margin: 0 }}>
            <strong>Make your pitch count:</strong> introduce yourself, mention your rate, and say why you're the right fit. Keep it under 3 paragraphs — hirers respond faster to concise pitches.
          </p>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px', background: '#F0F2F5', display: 'flex', flexDirection: 'column' }}>
        {messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px 20px' }}>
            <Avatar name={otherName} size={56} online={otherOnline} />
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginTop: 12, marginBottom: 4 }}>{otherName}</p>
            <p style={{ fontSize: 13, color: 'var(--grey-400)', lineHeight: 1.5 }}>{emptySubline}</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <Bubble
              key={msg.id}
              msg={msg}
              isMe={msg.senderId === myUid}
              isLast={i === messages.length - 1 && msg.senderId === myUid}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Upload progress */}
      {uploadProgress && (
        <UploadBar
          progress={uploadProgress.pct}
          fileName={uploadProgress.name}
          onCancel={cancelUpload}
        />
      )}

      {/* File error */}
      {fileErr && (
        <div style={{ padding: '8px 14px', background: '#FEF2F2', borderTop: '1px solid rgba(220,38,38,.15)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <AlertCircle size={13} color="var(--red)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--red)', flex: 1 }}>{fileErr}</span>
          <button onClick={() => setFileErr('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--grey-400)' }}><X size={12} /></button>
        </div>
      )}

      {/* Send error */}
      {sendErr && (
        <div style={{ padding: '8px 14px', background: 'var(--red-light)', fontSize: 12, color: 'var(--red)', borderTop: '1px solid rgba(220,38,38,.15)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={13} color="var(--red)" />
          <span style={{ flex: 1 }}>{sendErr}</span>
          <button onClick={() => setSendErr('')} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontWeight: 600 }}>✕</button>
        </div>
      )}

      {/* Input row */}
      <div style={{ borderTop: `1px solid ${isPitch ? '#FDE68A' : 'var(--grey-200)'}`, background: isPitch ? '#FFFDF5' : 'white', flexShrink: 0, transition: 'background .2s, border-color .2s' }}>
        <input
          ref={fileRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, padding: isPitch ? '12px 12px 8px' : '10px 12px', alignItems: 'flex-end' }}>
          {/* Attach button */}
          <button
            type="button"
            onClick={handleFileClick}
            disabled={!!uploadProgress}
            title={isPitch ? 'Attach CV, portfolio, or samples' : 'Send a file or image'}
            style={{ width: 38, height: 38, borderRadius: '50%', border: `1.5px solid ${isPitch ? '#FDE68A' : 'var(--grey-200)'}`, cursor: uploadProgress ? 'not-allowed' : 'pointer', background: 'white', color: 'var(--grey-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s', flexShrink: 0, opacity: uploadProgress ? 0.5 : 1 }}
            onMouseOver={e => { if (!uploadProgress) { e.currentTarget.style.borderColor = isPitch ? '#D97706' : 'var(--green)'; e.currentTarget.style.color = isPitch ? '#D97706' : 'var(--green)'; }}}
            onMouseOut={e => { e.currentTarget.style.borderColor = isPitch ? '#FDE68A' : 'var(--grey-200)'; e.currentTarget.style.color = 'var(--grey-500)'; }}
          >
            <Paperclip size={16} />
          </button>

          {/* Text area */}
          <textarea
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
            placeholder={inputPlaceholder}
            rows={isPitch ? 6 : 1}
            style={{ flex: 1, border: `1.5px solid ${isPitch ? '#FDE68A' : 'var(--grey-200)'}`, borderRadius: isPitch ? 14 : 20, padding: isPitch ? '11px 14px' : '9px 14px', fontSize: 14, resize: isPitch ? 'vertical' : 'none', outline: 'none', fontFamily: 'var(--font-body)', lineHeight: 1.6, maxHeight: isPitch ? 260 : 120, minHeight: isPitch ? 120 : 'auto', overflowY: 'auto', transition: 'border-color .15s', background: isPitch ? '#FFFDF5' : 'var(--grey-50,#fafafa)' }}
            onFocus={e => e.target.style.borderColor = isPitch ? '#D97706' : 'var(--green)'}
            onBlur={e => e.target.style.borderColor = isPitch ? '#FDE68A' : 'var(--grey-200)'}
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={!text.trim() || sending}
            style={{ width: 38, height: 38, borderRadius: '50%', border: 'none', cursor: text.trim() ? 'pointer' : 'default', background: text.trim() ? (isPitch ? '#D97706' : 'var(--green)') : 'var(--grey-200)', color: text.trim() ? 'white' : 'var(--grey-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s', flexShrink: 0 }}
          >
            {sending
              ? <Loader size={15} style={{ animation: 'spin .7s linear infinite' }} />
              : <Send size={15} />}
          </button>
        </form>

        {/* Hint */}
        <p style={{ fontSize: 10, color: isPitch ? '#B45309' : 'var(--grey-400)', textAlign: 'center', paddingBottom: 6, marginTop: -4 }}>
          {attachHint}
        </p>
      </div>
    </div>
  );
}

// ── MAIN MESSAGES PAGE ─────────────────────────────────────────
export default function Messages() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const [threads, setThreads]               = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [activeThread, setActiveThread]     = useState(null);
  const [openingThread, setOpeningThread]   = useState(false);
  const [searchQ, setSearchQ]               = useState('');
  const [mobileView, setMobileView]         = useState('list');

  const myName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'You';

  usePresence(user?.uid);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToThreads(user.uid, t => {
      setThreads(t);
      setLoadingThreads(false);
    });
    return () => { try { unsub(); } catch {} };
  }, [user]);

  useEffect(() => {
    const withUid  = sp.get('with');
    const withName = sp.get('name') || 'User';
    const isPitch  = sp.get('pitch') === 'true';
    if (!withUid || !user || withUid === user.uid) return;
    setOpeningThread(true);
    getOrCreateThread(user.uid, myName, withUid, withName)
      .then(threadId => {
        setActiveThread({ threadId, otherUid: withUid, otherName: withName, isPitch });
        setMobileView('chat');
      })
      .catch(err => console.error('getOrCreateThread failed:', err))
      .finally(() => setOpeningThread(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp, user]);

  const openThread = thread => {
    const otherUid  = thread.participants?.find(p => p !== user.uid);
    const otherName = thread.participantNames?.[otherUid] || 'User';
    // Existing threads opened from the list are not pitch-mode
    setActiveThread({ threadId: thread.id, otherUid, otherName, isPitch: false });
    markThreadRead(thread.id, user.uid).catch(() => {});
    setMobileView('chat');
  };

  const closeChat = () => { setActiveThread(null); setMobileView('list'); };

  const filtered = threads.filter(t => {
    if (!searchQ) return true;
    const otherUid = t.participants?.find(p => p !== user?.uid);
    const name     = t.participantNames?.[otherUid] || '';
    return name.toLowerCase().includes(searchQ.toLowerCase()) ||
      (t.lastMessage || '').toLowerCase().includes(searchQ.toLowerCase());
  });

  const totalUnread = threads.reduce((s, t) => s + (t[`unread_${user?.uid}`] || 0), 0);

  if (!user) return (
    <div style={{ paddingTop: 64, minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <MessageSquare size={40} color="var(--grey-300)" style={{ margin: '0 auto 16px', display: 'block' }} />
        <p style={{ color: 'var(--grey-500)', marginBottom: 16 }}>Please log in to view messages.</p>
        <button onClick={() => navigate('/login')} className="btn-primary" style={{ padding: '11px 24px' }}>Log In</button>
      </div>
    </div>
  );

  return (
    <div style={{ paddingTop: 64, height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--cream)' }}>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', maxWidth: 1100, width: '100%', margin: '0 auto' }}>

        {/* Thread list */}
        <div className="msg-list-panel" style={{ width: 300, borderRight: '1px solid var(--grey-200)', background: 'white', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid var(--grey-150)', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, letterSpacing: '-.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
                Messages
                {totalUnread > 0 && (
                  <span style={{ fontSize: 11, background: 'var(--green)', color: 'white', borderRadius: 'var(--r-full)', padding: '2px 7px', fontFamily: 'var(--font-body)', fontWeight: 700 }}>
                    {totalUnread}
                  </span>
                )}
              </h2>
              <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--grey-500)', fontWeight: 500 }}>← Back</button>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--grey-400)', pointerEvents: 'none' }} />
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search conversations…"
                style={{ width: '100%', padding: '8px 28px 8px 28px', borderRadius: 'var(--r-sm)', border: '1.5px solid var(--grey-200)', fontSize: 13, outline: 'none', fontFamily: 'var(--font-body)', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                onBlur={e => e.target.style.borderColor = 'var(--grey-200)'} />
              {searchQ && (
                <button onClick={() => setSearchQ('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--grey-400)', display: 'flex' }}>
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loadingThreads ? (
              [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 64, margin: '8px 10px', borderRadius: 'var(--r-sm)' }} />)
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                <MessageSquare size={30} style={{ margin: '0 auto 10px', display: 'block', color: 'var(--grey-300)' }} />
                <p style={{ fontSize: 13, color: 'var(--grey-400)', marginBottom: 6 }}>
                  {threads.length === 0 ? 'No conversations yet' : 'No results'}
                </p>
                {threads.length === 0 && (
                  <p style={{ fontSize: 12, color: 'var(--grey-400)', lineHeight: 1.5, maxWidth: 200, margin: '0 auto' }}>
                    Visit a talent or job profile and tap <strong>Pitch to Hirer</strong>.
                  </p>
                )}
              </div>
            ) : filtered.map(thread => (
              <ThreadItem
                key={thread.id}
                thread={thread}
                myUid={user.uid}
                active={activeThread?.threadId === thread.id}
                onClick={() => openThread(thread)}
              />
            ))}
          </div>

          <div style={{ padding: '10px 12px', borderTop: '1px solid var(--grey-150)', background: 'var(--cream)', flexShrink: 0 }}>
            <button onClick={() => navigate('/talent')}
              style={{ width: '100%', padding: '9px', borderRadius: 'var(--r-sm)', border: '1px solid var(--grey-200)', background: 'white', fontSize: 12, color: 'var(--grey-600)', cursor: 'pointer', fontWeight: 500, transition: 'all .15s' }}
              onMouseOver={e => { e.currentTarget.style.background = 'var(--green-light)'; e.currentTarget.style.color = 'var(--green-dark)'; e.currentTarget.style.borderColor = 'var(--green)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--grey-600)'; e.currentTarget.style.borderColor = 'var(--grey-200)'; }}>
              Browse Talent → Start a Conversation
            </button>
          </div>
        </div>

        {/* Chat panel */}
        <div className="msg-chat-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {openingThread ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0F2F5', gap: 10, color: 'var(--grey-500)', fontSize: 14 }}>
              <Loader size={20} style={{ animation: 'spin .7s linear infinite' }} />
              Opening conversation…
            </div>
          ) : activeThread ? (
            <ChatWindow
              key={activeThread.threadId}
              threadId={activeThread.threadId}
              myUid={user.uid}
              myName={myName}
              otherUid={activeThread.otherUid}
              otherName={activeThread.otherName}
              onBack={closeChat}
              isPitch={activeThread?.isPitch || false}
            />
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F0F2F5', gap: 12, padding: 24, textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'white', border: '1px solid var(--grey-200)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={26} color="var(--grey-300)" />
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--grey-600)' }}>No conversation selected</p>
              <p style={{ fontSize: 13, color: 'var(--grey-400)', maxWidth: 260, lineHeight: 1.6 }}>
                Pick one from the list, or visit a job listing and tap <strong>Pitch to Hirer</strong>.
              </p>
              <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                <button onClick={() => navigate('/talent')} className="btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>Browse Talent →</button>
                <button onClick={() => navigate('/browse')} className="btn-secondary" style={{ padding: '10px 20px', fontSize: 13 }}>Browse Jobs →</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .msg-list-panel {
            width: 100% !important;
            display: ${mobileView === 'list' ? 'flex' : 'none'} !important;
            border-right: none !important;
          }
          .msg-chat-panel {
            display: ${mobileView === 'chat' ? 'flex' : 'none'} !important;
          }
        }
      `}</style>
    </div>
  );
}

export { Avatar, getColor };