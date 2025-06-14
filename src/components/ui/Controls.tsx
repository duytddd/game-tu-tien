// src/components/ui/Controls.tsx
"use client";
import type React from "react";
import { FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight, FaFistRaised, FaInfoCircle } from "react-icons/fa";
import { useEffect } from "react";
import { useGameState } from "@/hooks/use-game-state";

interface ControlsProps {
  startMoving: (direction: 'up' | 'down' | 'left' | 'right') => void;
  stopMoving: (direction: 'up' | 'down' | 'left' | 'right') => void;
  handleAttack: () => void;
}

const Controls: React.FC<ControlsProps> = ({ startMoving, stopMoving, handleAttack }) => {
  const { currentTargetId, stopAttack, openModal } = useGameState();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.repeat) return;
      if (e.key === 'w' || e.key === 'W') startMoving('up');
      if (e.key === 'a' || e.key === 'A') startMoving('left');
      if (e.key === 's' || e.key === 'S') startMoving('down');
      if (e.key === 'd' || e.key === 'D') startMoving('right');
      if (e.key === ' ') handleAttack();
      if (e.key === 'i' || e.key === 'I') openModal('player-stats');
    }
    function handleKeyUp(e: KeyboardEvent) {
      if (e.key === 'w' || e.key === 'W') stopMoving('up');
      if (e.key === 'a' || e.key === 'A') stopMoving('left');
      if (e.key === 's' || e.key === 'S') stopMoving('down');
      if (e.key === 'd' || e.key === 'D') stopMoving('right');
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [startMoving, stopMoving, handleAttack, openModal]);

  return (
    <div className="absolute bottom-0 left-0 z-10 flex w-full items-end justify-center gap-10 p-4 border-t-2 border-purple-500">
      <div className="grid grid-cols-3 grid-rows-3 w-[160px] h-[160px] gap-4">
        <div/>
        <button onPointerDown={() => startMoving('up')} onPointerUp={() => stopMoving('up')} onPointerLeave={() => stopMoving('up')} className="col-start-2 row-start-1 rounded-full bg-gradient-to-br from-blue-400 via-cyan-300 to-blue-700 border-2 border-yellow-400 text-white text-2xl shadow-lg active:scale-90 active:bg-blue-500 flex items-center justify-center"><FaArrowUp /></button>
        <button onPointerDown={() => startMoving('left')} onPointerUp={() => stopMoving('left')} onPointerLeave={() => stopMoving('left')} className="col-start-1 row-start-2 rounded-full bg-gradient-to-br from-blue-400 via-cyan-300 to-blue-700 border-2 border-yellow-400 text-white text-2xl shadow-lg active:scale-90 active:bg-blue-500 flex items-center justify-center"><FaArrowLeft /></button>
        <button onPointerDown={() => startMoving('right')} onPointerUp={() => stopMoving('right')} onPointerLeave={() => stopMoving('right')} className="col-start-3 row-start-2 rounded-full bg-gradient-to-br from-blue-400 via-cyan-300 to-blue-700 border-2 border-yellow-400 text-white text-2xl shadow-lg active:scale-90 active:bg-blue-500 flex items-center justify-center"><FaArrowRight /></button>
        <button onPointerDown={() => startMoving('down')} onPointerUp={() => stopMoving('down')} onPointerLeave={() => stopMoving('down')} className="col-start-2 row-start-3 rounded-full bg-gradient-to-br from-blue-400 via-cyan-300 to-blue-700 border-2 border-yellow-400 text-white text-2xl shadow-lg active:scale-90 active:bg-blue-500 flex items-center justify-center"><FaArrowDown /></button>
      </div>
      <div className="flex items-end gap-4">
        {currentTargetId && (
          <button
            onClick={stopAttack}
            className="h-14 w-24 rounded-lg bg-gradient-to-br from-gray-700 via-slate-600 to-gray-500 text-sm font-bold text-white shadow-lg border-2 border-gray-500 active:scale-90 flex items-center justify-center"
          >
            Về Thành
          </button>
        )}

        <button
          onClick={() => openModal('player-stats')}
          className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-700 text-xl font-bold italic text-white shadow-lg border-2 border-blue-400 active:scale-90 flex items-center justify-center"
        >
          <FaInfoCircle />
        </button>
        
        <button
          onClick={handleAttack}
          className="h-20 w-20 rounded-full bg-gradient-to-br from-red-700 via-yellow-400 to-red-500 text-3xl font-bold text-white shadow-lg border-2 border-red-500 active:scale-90 flex items-center justify-center"
        >
          <FaFistRaised />
        </button>
      </div>
    </div>
  );
};
export default Controls;