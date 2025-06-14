// src/components/modals/SelectTargetModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useGameState } from '@/hooks/use-game-state'; // SỬA DÒNG NÀY: Dùng 'from' thay vì '='
import type { Clan } from '@/hooks/use-game-state';

interface SelectTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SelectTargetModal: React.FC<SelectTargetModalProps> = ({ isOpen, onClose }) => {
  const { userData } = useAuth();
  const { clans, selectTarget } = useGameState();
  const [filterText, setFilterText] = useState('');
  const [filteredClans, setFilteredClans] = useState<Clan[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setFilterText('');
      setFilteredClans([]);
      return;
    }
    
    const availableClans = Object.values(clans).filter(clan => clan.id !== userData?.clanId);
    
    const lowercasedFilter = filterText.toLowerCase();
    const currentFiltered = availableClans.filter(clan =>
      clan.name.toLowerCase().includes(lowercasedFilter)
    );
    setFilteredClans(currentFiltered);

  }, [isOpen, clans, userData?.clanId, filterText]);

  const modalStyle: React.CSSProperties = {
    display: isOpen ? 'flex' : 'none',
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? 'auto' : 'none',
  };

  if (!isOpen) return null;

  const getClanImageUrl = (clan: Clan | null) => {
    if (!clan || !clan.level) return "/images/castle-lv1.png";
    const extension = clan.level > 1 ? "gif" : "png";
    return `/images/castle-lv${clan.level}.${extension}`;
  };

  return (
    <div id="attack-target-modal" className="modal" style={modalStyle}>
      <div className="modal-content max-w-xl bg-gray-900/90 border-red-500 text-gray-100">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2 className="text-2xl font-bold text-white text-center mb-6">Tông Môn Khai Chiến</h2>

        <input
          type="text"
          placeholder="Tìm kiếm Tông Môn..."
          className="w-full p-2 mb-4 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-red-400"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />

        {filteredClans.length === 0 ? (
          <p className="text-center text-gray-400">Không tìm thấy mục tiêu nào phù hợp hoặc thiên hạ thái bình.</p>
        ) : (
          <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2">
            {filteredClans.map(clan => (
              <div key={clan.id} className="bg-gray-800/50 p-4 rounded-lg flex items-center justify-between border border-gray-700 hover:border-red-400 transition-colors">
                <div className="flex items-center gap-4">
                  <img src={getClanImageUrl(clan)} alt={clan.name} className="w-14 h-14 rounded-md object-cover border border-red-500"/>
                  <div>
                    <h4 className="font-bold text-red-300 text-lg">{clan.name}</h4>
                    <p className="text-sm text-gray-300">Cấp: {clan.level} | HP: {clan.hp.toLocaleString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    selectTarget(clan.id);
                    onClose();
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                  Tấn Công
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectTargetModal;