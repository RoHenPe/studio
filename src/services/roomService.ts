
'use server';

import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  runTransaction,
  serverTimestamp,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';

export interface Room {
  id: string;
  status: 'waiting' | 'connected';
  playerCount: number;
  createdAt: any; // Firebase Timestamp
}

/**
 * Creates a new room in Firestore if it doesn't already exist.
 * @param roomId The ID of the room to create.
 */
export async function createRoom(roomId: string): Promise<void> {
  const roomRef = doc(db, 'rooms', roomId);
  const roomSnap = await getDoc(roomRef);

  if (roomSnap.exists()) {
    throw new Error('Room with this ID already exists.');
  }

  const newRoom: Room = {
    id: roomId,
    status: 'waiting',
    playerCount: 1,
    createdAt: serverTimestamp(),
  };

  await setDoc(roomRef, newRoom);
}

/**
 * Allows a player to join an existing, waiting room.
 * @param roomId The ID of the room to join.
 */
export async function joinRoom(roomId: string): Promise<void> {
  const roomRef = doc(db, 'rooms', roomId);

  try {
    await runTransaction(db, async (transaction) => {
      const roomDoc = await transaction.get(roomRef);
      if (!roomDoc.exists()) {
        throw new Error('Room not found.');
      }

      const roomData = roomDoc.data() as Room;
      if (roomData.playerCount >= 2) {
        throw new Error('This room is already full.');
      }

      if (roomData.status !== 'waiting') {
        throw new Error('This room is not available to join.');
      }
      
      transaction.update(roomRef, { 
        playerCount: 2,
        status: 'connected'
      });
    });
  } catch (e: any) {
    // Re-throw the specific error message for the UI to catch
    throw new Error(e.message || 'Failed to join the room.');
  }
}

/**
 * Sets up a real-time listener for a room's status.
 * @param roomId The ID of the room to listen to.
 * @param onUpdate A callback function that receives the room data.
 * @returns An unsubscribe function to stop listening.
 */
export function onRoomUpdate(
  roomId: string,
  onUpdate: (room: Room | null) => void
): Unsubscribe {
  const roomRef = doc(db, 'rooms', roomId);
  return onSnapshot(roomRef, (doc) => {
    if (doc.exists()) {
      onUpdate(doc.data() as Room);
    } else {
      onUpdate(null);
    }
  });
}
