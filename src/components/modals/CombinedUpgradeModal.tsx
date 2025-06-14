// src/components/modals/CombinedUpgradeModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useGameState } from '@/hooks/use-game-state';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase/firebase';
import type { Clan } from '@/hooks/use-game-state';

interface CombinedUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Cấu hình Nâng cấp Tông Môn và Đại Trận (NÊN ĐỒNG BỘ VỚI BACKEND)
// Tốt nhất là tải từ Firestore như useLevelSystem, nhưng tạm thời hardcode để triển khai
const CLAN_HP_LEVELS_CLIENT: Record<number, number> = { 1: 100000, 2: 200000, 3: 400000, 4: 800000, 5: 1600000 };
const UPGRADE_COSTS_CLIENT: Record<number, number> = { 2: 10000, 3: 50000, 4: 150000, 5: 500000 };
const MAX_CLAN_LEVEL_CLIENT = 5;

const FORMATION_COSTS_CLIENT: Record<number, number> = { 1: 100000, 2: 150000, 3: 300000, 4: 600000, 5: 1200000 };
const MAX_FORMATION_LEVEL_CLIENT = 5;

const CombinedUpgradeModal: React.FC<CombinedUpgradeModalProps> = ({ isOpen, onClose }) => {
  const { userData } = useAuth();
  // `currentUserData` đã được đổi tên thành `userData` trong `useAuth`, hãy dùng `userData`
  const { clans } = useGameState(); 
  const [activeTab, setActiveTab] = useState<'clan' | 'formation'>('clan');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dùng inline style để kiểm soát hiển thị modal
  const modalStyle: React.CSSProperties = {
    display: isOpen ? 'flex' : 'none',
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? 'auto' : 'none',
  };

  if (!isOpen) return null;

  const myClanId = userData?.clanId; // Dùng userData
  const myClan = myClanId ? clans[myClanId] : null;

  const handleUpgradeClan = async () => {
    if (!myClan || !myClanId) return;
    setLoading(true);
    setError(null);
    try {
      const upgradeClan = httpsCallable(functions, 'upgradeClan');
      await upgradeClan({ clanId: myClanId });
      alert("Nâng cấp Tông Môn thành công!"); // Tạm dùng alert
      onClose();
    } catch (err: any) {
      setError(err.message || "Lỗi khi nâng cấp Tông Môn.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeFormation = async () => {
    if (!myClan || !myClanId) return;
    setLoading(true);
    setError(null);
    try {
      const upgradeFormation = httpsCallable(functions, 'upgradeFormation');
      await upgradeFormation({ clanId: myClanId });
      alert("Nâng cấp Đại Trận thành công!"); // Tạm dùng alert
      onClose();
    } catch (err: any) {
      setError(err.message || "Lỗi khi nâng cấp Đại Trận.");
    } finally {
      setLoading(false);
    }
  };

  const renderClanUpgradeContent = () => {
    if (!myClan) return <p className="text-center text-gray-400">Đang tải thông tin Tông Môn...</p>;

    const currentLevel = myClan.level || 1;
    const nextLevel = currentLevel + 1;
    const cost = UPGRADE_COSTS_CLIENT[nextLevel] || 0;
    const canAfford = (myClan.treasury || 0) >= cost;
    const isMaxLevel = currentLevel >= MAX_CLAN_LEVEL_CLIENT;

    return (
      <div className="p-4 bg-gray-800/60 rounded-lg">
        {isMaxLevel ? (
          <p className="text-center text-green-400 font-bold">Tông môn đã đạt cấp tối đa ({MAX_CLAN_LEVEL_CLIENT}).</p>
        ) : (
          <>
            <p className="text-lg text-white mb-2">Nâng Tông Môn lên cấp <span className="font-bold text-green-300">{nextLevel}</span>.</p>
            <p className="text-lg text-white mb-4">Chi phí: <span className="font-bold text-yellow-400">{cost.toLocaleString()} Linh Thạch</span>.</p>
            <button
              onClick={handleUpgradeClan}
              disabled={loading || !canAfford}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : isMaxLevel ? "Đạt cấp tối đa" : canAfford ? "Xác Nhận Nâng Cấp" : "Không đủ Linh Thạch"}
            </button>
            {!canAfford && <p className="text-red-400 text-sm mt-2 text-center">Yêu cầu {cost.toLocaleString()} Linh Thạch.</p>}
          </>
        )}
      </div>
    );
  };

  const renderFormationUpgradeContent = () => {
    if (!myClan) return <p className="text-center text-gray-400">Đang tải thông tin Tông Môn...</p>;

    const currentLevel = myClan.formationLevel || 0;
    const nextLevel = currentLevel + 1;
    const cost = FORMATION_COSTS_CLIENT[nextLevel] || 0;
    const canAfford = (myClan.treasury || 0) >= cost;
    const isMaxLevel = currentLevel >= MAX_FORMATION_LEVEL_CLIENT;
    const actionText = currentLevel === 0 ? "Mở khóa Đại Trận Hộ Tông" : `Nâng cấp Đại Trận lên Cấp ${nextLevel}`;

    return (
      <div className="p-4 bg-gray-800/60 rounded-lg">
        {isMaxLevel ? (
          <p className="text-center text-green-400 font-bold">Đại Trận đã đạt cấp tối đa ({MAX_FORMATION_LEVEL_CLIENT}).</p>
        ) : (
          <>
            <p className="text-lg text-white mb-2">{actionText}.</p>
            <p className="text-lg text-white mb-4">Chi phí: <span className="font-bold text-yellow-400">{cost.toLocaleString()} Linh Thạch</span>.</p>
            <button
              onClick={handleUpgradeFormation}
              disabled={loading || !canAfford}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : isMaxLevel ? "Đạt cấp tối đa" : canAfford ? "Xác Nhận" : "Không đủ Linh Thạch"}
            </button>
            {!canAfford && <p className="text-red-400 text-sm mt-2 text-center">Yêu cầu {cost.toLocaleString()} Linh Thạch.</p>}
          </>
        )}
      </div>
    );
  };

  return (
    <div id="combined-upgrade-modal" className="modal" style={modalStyle}>
      <div className="modal-content max-w-2xl bg-gray-900/90 border-blue-500 text-gray-100">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2 className="text-2xl font-bold text-white text-center mb-6">Nâng Cấp Tông Môn</h2>

        <div className="flex justify-center mb-6 border-b border-gray-700">
          <button
            className={`py-3 px-6 font-bold text-lg ${activeTab === 'clan' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'} transition-colors`}
            onClick={() => setActiveTab('clan')}
          >
            Nâng Cấp Tông
          </button>
          <button
            className={`py-3 px-6 font-bold text-lg ${activeTab === 'formation' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'} transition-colors`}
            onClick={() => setActiveTab('formation')}
          >
            Đại Trận Hộ Tông
          </button>
        </div>

        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        
        <div id="upgrade-content-container">
          {activeTab === 'clan' ? renderClanUpgradeContent() : renderFormationUpgradeContent()}
        </div>
      </div>
    </div>
  );
};

export default CombinedUpgradeModal;