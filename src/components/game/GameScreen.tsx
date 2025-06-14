// src/components/game/GameScreen.tsx
"use client";

import TopBar from "@/components/ui/TopBar";
import Controls from "@/components/ui/Controls";
import PlayerStatsModal from "@/components/modals/PlayerStatsModal";
import ClanModal from "@/components/modals/ClanModal";
import CreateClanModal from "@/components/modals/CreateClanModal";
import ClanViewMembersModal from "@/components/modals/ClanViewMembersModal";
import CombinedUpgradeModal from "@/components/modals/CombinedUpgradeModal";
import AttackLogModal from "@/components/modals/AttackLogModal";
import SelectTargetModal from "@/components/modals/SelectTargetModal"; // QUAN TRỌNG: THÊM IMPORT NÀY

import { useAuth } from "@/hooks/use-auth";
import { useGameState } from "@/hooks/use-game-state";
import { useGameCanvas } from "@/hooks/use-game-canvas";

export default function GameScreen() {
  const { userData } = useAuth();
  const { handleAttack, currentTargetData, activeModal, openModal, closeModal } = useGameState();
  const { canvasRef, startMoving, stopMoving, fireProjectile } = useGameCanvas();

  const onAttack = () => {
    handleAttack();
    fireProjectile();
  };

  return (
    <main className="flex-grow relative overflow-hidden">
      <TopBar userData={userData} currentTargetData={currentTargetData} />

      <canvas ref={canvasRef} width={1920} height={1080} className="absolute inset-0 z-0"/>

      <Controls 
        startMoving={startMoving} 
        stopMoving={stopMoving} 
        handleAttack={onAttack} 
      />

      {/* RENDER TẤT CẢ CÁC MODAL TẠI ĐÂY */}
      <PlayerStatsModal 
        isOpen={activeModal === 'player-stats'} 
        onClose={closeModal} 
      />
      <ClanModal 
        isOpen={activeModal === 'clan'} 
        onClose={closeModal} 
      />
      <CreateClanModal 
        isOpen={activeModal === 'create-clan'} 
        onClose={closeModal} 
      />
      <ClanViewMembersModal 
        isOpen={activeModal === 'clan-members'} 
        onClose={closeModal} 
      />
      <CombinedUpgradeModal 
        isOpen={activeModal === 'clan-upgrade'} 
        onClose={closeModal} 
      />
      <AttackLogModal 
        isOpen={activeModal === 'attack-log'} 
        onClose={closeModal} 
      />
      <SelectTargetModal
        isOpen={activeModal === 'select-target'} // QUAN TRỌNG: THÊM RENDER MODAL NÀY
        onClose={closeModal}
      />

      {/* Các modal và alert khác sẽ được thêm vào đây tương tự */}
    </main>
  );
}