import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { roomService } from '../services/roomService.js';
import { getErrorMessage } from '../utils/errors.js';
import { prefs } from '../utils/storage.js';
import { useAuth } from './AuthContext.jsx';

const RoomContext = createContext(null);

/**
 * 내가 참여한 공유 공간 목록과 '지금 보고 있는 공간'을 관리한다.
 * status: 'idle' | 'loading' | 'ready' | 'error'
 */
export function RoomProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const prefKey = userId ? `room:${userId}` : null;

  const [rooms, setRooms] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!userId) return;
    setStatus((prev) => (prev === 'ready' ? 'ready' : 'loading'));
    try {
      const list = await roomService.list();
      setRooms(list);
      setCurrentRoomId((prev) => {
        const stored = Number(prefs.get(`room:${userId}`));
        const candidate = [prev, stored].find((id) => list.some((room) => room.id === id));
        return candidate ?? list[0]?.id ?? null;
      });
      setError(null);
      setStatus('ready');
    } catch (err) {
      setError(getErrorMessage(err));
      setStatus('error');
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      reload();
    } else {
      setRooms([]);
      setCurrentRoomId(null);
      setStatus('idle');
    }
  }, [userId, reload]);

  const selectRoom = useCallback(
    (roomId) => {
      setCurrentRoomId(roomId);
      if (prefKey && roomId) prefs.set(prefKey, String(roomId));
    },
    [prefKey],
  );

  /** 생성·참여·수정된 공간을 목록에 반영 */
  const upsertRoom = useCallback((room) => {
    setRooms((list) =>
      list.some((item) => item.id === room.id) ? list.map((item) => (item.id === room.id ? room : item)) : [...list, room],
    );
  }, []);

  /** 서버에서 한 공간의 최신 정보(멤버 등)를 다시 받아 온다 */
  const refreshRoom = useCallback(
    async (roomId) => {
      const room = await roomService.get(roomId);
      upsertRoom(room);
      return room;
    },
    [upsertRoom],
  );

  const removeRoom = useCallback(
    (roomId) => {
      const remaining = rooms.filter((room) => room.id !== roomId);
      setRooms(remaining);
      if (currentRoomId === roomId) selectRoom(remaining[0]?.id ?? null);
    },
    [rooms, currentRoomId, selectRoom],
  );

  const currentRoom = rooms.find((room) => room.id === currentRoomId) ?? null;
  const others = useMemo(() => (currentRoom?.members ?? []).filter((member) => member.id !== userId), [currentRoom, userId]);
  const partner = others[0] ?? null;

  const value = useMemo(
    () => ({ rooms, currentRoom, others, partner, status, error, reload, selectRoom, upsertRoom, refreshRoom, removeRoom }),
    [rooms, currentRoom, others, partner, status, error, reload, selectRoom, upsertRoom, refreshRoom, removeRoom],
  );

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}

export function useRooms() {
  const context = useContext(RoomContext);
  if (!context) throw new Error('useRooms는 RoomProvider 안에서만 쓸 수 있어요.');
  return context;
}
