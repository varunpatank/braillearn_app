import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from '@/components/motion';
import { PhoneOff, Users, Clock, Copy, Check, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';

interface MeetingRoomProps {
  roomCode: string;
  jitsiRoomName: string;
  title: string;
  isHost: boolean;
  userName: string;
  onLeave: () => void;
}

export default function MeetingRoom({ roomCode, jitsiRoomName, title, isHost, userName, onLeave }: MeetingRoomProps) {
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [participants, setParticipants] = useState(1);
  const jitsiContainer = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const initJitsi = useCallback(() => {
    if (!jitsiContainer.current) return;
    try {
      apiRef.current = new (window as any).JitsiMeetExternalAPI('meet.jit.si', {
        roomName: jitsiRoomName || `braillearn-${roomCode}`,
        parentNode: jitsiContainer.current,
        width: '100%',
        height: '100%',
        configOverwrite: {
          startWithAudioMuted: !isHost,
          startWithVideoMuted: false,
          disableDeepLinking: true,
          prejoinPageEnabled: false,
          toolbarButtons: [
            'camera', 'chat', 'closedcaptions', 'desktop',
            'fullscreen', 'hangup', 'microphone', 'raisehand',
            'settings', 'tileview',
          ],
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          TOOLBAR_ALWAYS_VISIBLE: true,
          DEFAULT_BACKGROUND: '#1e3a5f',
        },
        userInfo: { displayName: userName },
      });

      apiRef.current.addListener('readyToClose', onLeave);
      apiRef.current.addListener('videoConferenceJoined', () => setLoadState('ready'));
      apiRef.current.addListener('participantJoined', () => setParticipants(p => p + 1));
      apiRef.current.addListener('participantLeft', () => setParticipants(p => Math.max(1, p - 1)));
    } catch (err) {
      console.error('Jitsi init error:', err);
      setLoadState('error');
    }
  }, [jitsiRoomName, roomCode, isHost, userName, onLeave]);

  useEffect(() => {
    if (!jitsiContainer.current) return;

    if (!(window as any).JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.onload = () => initJitsi();
      script.onerror = () => setLoadState('error');
      document.head.appendChild(script);
    } else {
      initJitsi();
    }

    return () => { apiRef.current?.dispose(); };
  }, [initJitsi]);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
      : `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleChat = () => {
    setShowChat(prev => !prev);
    try { apiRef.current?.executeCommand('toggleChat'); } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-white font-bold text-sm truncate max-w-[200px]">{title}</span>
          <span className="text-gray-400 text-xs hidden sm:inline">|</span>
          <button onClick={copyCode} className="hidden sm:flex items-center gap-1 px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300 hover:bg-gray-600 transition">
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            {roomCode}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-blue-300 text-xs bg-blue-900/40 px-2 py-0.5 rounded-full">
            <Users className="w-3.5 h-3.5" />
            {participants}
          </div>
          <div className="flex items-center gap-1 text-gray-300 text-sm">
            <Clock className="w-4 h-4" />
            {formatTime(elapsed)}
          </div>
          {isHost && <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-medium">Host</span>}
        </div>
      </div>

      <div className="flex-1 relative">
        <div ref={jitsiContainer} className="w-full h-full" />

        <AnimatePresence>
          {loadState === 'loading' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center gap-4 z-10">
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
              <p className="text-gray-300 text-sm font-medium">Connecting to meeting...</p>
              <p className="text-gray-500 text-xs">Room: {roomCode}</p>
            </motion.div>
          )}
          {loadState === 'error' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center gap-4 z-10">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="text-gray-300 text-sm font-medium">Failed to connect</p>
              <button onClick={() => { setLoadState('loading'); initJitsi(); }}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
                Retry
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-3 px-4 py-3 bg-gray-800/80 backdrop-blur-sm border-t border-gray-700">
        <button onClick={copyCode} className="sm:hidden p-3 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 transition">
          {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
        </button>
        <button
          onClick={toggleChat}
          className={`p-3 rounded-full transition-colors ${showChat ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          <MessageSquare className="w-5 h-5" />
        </button>
        <button
          onClick={onLeave}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors"
        >
          <PhoneOff className="w-5 h-5" /> Leave
        </button>
      </div>
    </div>
  );
}