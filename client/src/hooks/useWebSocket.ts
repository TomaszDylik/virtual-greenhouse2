import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface PlantUpdate {
  plantId: number;
  waterLevel: number;
  isDead: boolean;
  name: string;
}

interface PlantDied {
  plantId: number;
  name: string;
}

interface UseWebSocketProps {
  onPlantUpdate?: (data: PlantUpdate) => void;
  onPlantDied?: (data: PlantDied) => void;
  onPlantWatered?: (data: { plantId: number; waterLevel: number }) => void;
}

export function useWebSocket({ onPlantUpdate, onPlantDied, onPlantWatered }: UseWebSocketProps) {
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef({ onPlantUpdate, onPlantDied, onPlantWatered });

  // Update handlers ref without causing reconnection
  useEffect(() => {
    handlersRef.current = { onPlantUpdate, onPlantDied, onPlantWatered };
  }, [onPlantUpdate, onPlantDied, onPlantWatered]);

  useEffect(() => {
    // Connect to WebSocket only once
    const socket = io('http://localhost:4000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ WebSocket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    socket.on('plant-update', (data: PlantUpdate) => {
      console.log('🌱 Plant update received:', data);
      if (handlersRef.current.onPlantUpdate) {
        handlersRef.current.onPlantUpdate(data);
      }
    });

    socket.on('plant-died', (data: PlantDied) => {
      console.log('💀 Plant died:', data);
      if (handlersRef.current.onPlantDied) {
        handlersRef.current.onPlantDied(data);
      }
    });

    socket.on('plant-watered', (data: { plantId: number; waterLevel: number }) => {
      console.log('💧 Plant watered:', data);
      if (handlersRef.current.onPlantWatered) {
        handlersRef.current.onPlantWatered(data);
      }
    });

    socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
    });

    // Cleanup on unmount
    return () => {
      console.log('🔌 Disconnecting WebSocket...');
      socket.disconnect();
    };
  }, []); // Empty deps - only connect once

  const waterPlant = useCallback((plantId: number) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('water-plant', { plantId });
      console.log('💧 Watering plant:', plantId);
    } else {
      console.error('❌ WebSocket not connected');
    }
  }, []);

  return { waterPlant };
}
