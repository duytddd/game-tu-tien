// src/components/modals/PlayerStatsModal.tsx
"use client";

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useGameState } from '@/hooks/use-game-state';
import { useLevelSystem } from '@/hooks/use-level-system';
import { calculateExpNeeded, calculateStatsWithTitle, getTitleFromConfig, TITLE_SHOP_ITEMS_CLIENT } from '@/lib/data';
import { FaUserCircle, FaStar, FaMedal, FaFire, FaCrown, FaTrophy, FaHeart, FaFistRaised, FaBolt, FaShieldAlt, FaUsers } from 'react-icons/fa';

interface PlayerStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PlayerStatsModal: React.FC<PlayerStatsModalProps> = ({ isOpen, onClose }) => {
  const { userData } = useAuth();
  const { getClanNameById } = useGameState();
  const { expBase, expPower, levelTitles, statGrowth, loading: configLoading, error: configError } = useLevelSystem();

  // Dùng `isOpen` để kiểm soát visibility, nhưng vẫn render để có thể dùng animation CSS
  // Dùng inline style để kiểm soát display và opacity một cách mạnh mẽ
  const modalStyle: React.CSSProperties = {
    display: isOpen ? 'flex' : 'none', // HIỂN THỊ FLEX KHI isOpen LÀ TRUE
    opacity: isOpen ? 1 : 0,           // OPACITY 1 KHI isOpen LÀ TRUE
    pointerEvents: isOpen ? 'auto' : 'none', // CHO PHÉP TƯƠNG TÁC KHI HIỆN
  };

  // Điều kiện render nội dung bên trong modal
  if (!isOpen) return null; // Quan trọng: Nếu không mở thì không render gì cả.

  // Logic hiển thị trạng thái loading/error của config
  if (configLoading || configError || !expBase || !expPower || !levelTitles || !statGrowth) {
    return (
      <div id="player-stats-modal" className="modal" style={modalStyle}> {/* Vẫn dùng class "modal" và style={modalStyle} */}
        <div className="modal-content player-stats">
          <span className="close-btn" onClick={onClose}>&times;</span>
          <h2>Thông Tin Tu Sĩ</h2>
          {configLoading && <p>Đang tải cấu hình game...</p>}
          {configError && <p style={{color: 'red'}}>Lỗi tải cấu hình: {configError}</p>}
          {!configLoading && !configError && <p>Không thể tải cấu hình game.</p>}
        </div>
      </div>
    );
  }

  // Logic hiển thị trạng thái loading/null của userData
  if (!userData) {
    return (
      <div id="player-stats-modal" className="modal" style={modalStyle}>
        <div className="modal-content player-stats">
          <span className="close-btn" onClick={onClose}>&times;</span>
          <h2>Thông Tin Tu Sĩ</h2>
          <p>Đang tải dữ liệu người chơi...</p>
        </div>
      </div>
    );
  }

  const playerLevel = userData.level || 1;
  const playerExp = userData.exp || 0;

  const expNeeded = calculateExpNeeded(playerLevel, expBase, expPower);
  const expPercentage = Math.min(100, (playerExp / expNeeded) * 100);

  const levelTitle = getTitleFromConfig(playerLevel, levelTitles);
  
  const stats = calculateStatsWithTitle(playerLevel, userData.equippedTitle, statGrowth, TITLE_SHOP_ITEMS_CLIENT);

  const titleInfo = userData.equippedTitle && userData.equippedTitle !== "none"
    ? TITLE_SHOP_ITEMS_CLIENT[userData.equippedTitle]?.name || "Không rõ"
    : "Không có";

  // Chuẩn bị dữ liệu avatar và ngoại trang (nếu có)
  const avatarUrl = (userData as any).avatarUrl || null;
  const outfitUrl = (userData as any).outfitUrl || null;

  // Phẩm chất (ví dụ S, S+, vv) - demo lấy theo cấp
  const quality = playerLevel >= 100 ? 'S+' : playerLevel >= 50 ? 'S' : 'A';
  const qualityColor = quality === 'S+' ? 'from-yellow-300 via-orange-400 to-red-500' : quality === 'S' ? 'from-blue-300 via-purple-400 to-pink-500' : 'from-gray-300 via-gray-400 to-gray-500';

  // Số sao (demo: mỗi 20 cấp 1 sao, tối đa 7)
  const starCount = Math.min(7, Math.floor(playerLevel / 20));

  return (
    <div id="player-stats-modal" className="modal" style={modalStyle}>
      <div className="modal-content player-stats p-0 bg-gradient-to-br from-yellow-50/90 via-yellow-100/80 to-yellow-200/80 border-4 border-yellow-400 shadow-2xl rounded-2xl max-w-2xl flex flex-col items-stretch relative" style={{boxShadow:'0 0 40px 8px #ffe082, 0 0 0 4px #bfa14a'}}>
        <span className="close-btn" onClick={onClose}>&times;</span>
        <div className="flex flex-col sm:flex-row gap-4 p-6">
          {/* Bên trái: Avatar + ngoại trang */}
          <div className="flex flex-col items-center min-w-[140px] max-w-[180px]">
            {/* Avatar tròn */}
            <div className="relative w-24 h-24 rounded-full border-4 border-yellow-400 shadow-lg bg-gradient-to-br from-yellow-200 via-yellow-100 to-yellow-400 flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <FaUserCircle className="text-yellow-500 text-6xl" />
              )}
            </div>
            {/* Ngoại trang (nếu có) */}
            {outfitUrl && (
              <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden border-2 border-yellow-300 shadow">
                <img src={outfitUrl} alt="outfit" className="w-full h-full object-cover" />
              </div>
            )}
            {/* Phẩm chất */}
            <div className={`mt-2 px-3 py-1 rounded-full bg-gradient-to-r ${qualityColor} text-white font-bold text-xs shadow flex items-center gap-1`}>
              <FaCrown className="text-base" /> Phẩm: {quality}
            </div>
            {/* Sao */}
            <div className="flex gap-1 mt-1">
              {[...Array(starCount)].map((_, i) => <FaStar key={i} className="text-yellow-400 text-base drop-shadow" />)}
            </div>
          </div>
          {/* Bên phải: Thông tin tu sĩ */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-extrabold text-2xl text-yellow-700 drop-shadow flex items-center gap-2">
                <FaMedal className="text-yellow-400 text-2xl" /> {userData.discordName}
              </span>
              <span className="flex items-center gap-1 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 text-white text-xs font-extrabold rounded px-2 py-0.5 shadow border-2 border-yellow-300 animate-pulse-glow" style={{boxShadow:'0 0 8px 2px #ff9800, 0 0 16px 4px #ff5722'}}>
                <FaFire className="text-orange-400 animate-flicker" /> {playerLevel}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-lg text-pink-700 flex items-center gap-1"><FaTrophy className="text-pink-400" /> {titleInfo}</span>
              <span className="font-bold text-base text-blue-700 ml-2">{levelTitle}</span>
            </div>
            {/* Tu vi + progress */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-700 font-bold">Tu Vi:</span>
              <span className="text-sm text-green-900 font-bold">{playerExp.toLocaleString()}/{expNeeded.toLocaleString()}</span>
              <span className="text-xs text-green-700">({expPercentage}%)</span>
            </div>
            <div className="w-full h-2 bg-green-200 rounded-full overflow-hidden mb-1">
              <div className="h-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-400" style={{width: `${expPercentage}%`}}></div>
            </div>
            {/* Các chỉ số chính */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <div className="flex items-center gap-1"><FaBolt className="text-yellow-400" /> <b>Công Lực:</b> {(userData.attackPoints || 0).toLocaleString()}</div>
              <div className="flex items-center gap-1"><FaHeart className="text-red-400" /> <b>Sinh Lực:</b> {(stats.maxHp || 0).toLocaleString()}</div>
              <div className="flex items-center gap-1"><FaFistRaised className="text-orange-400" /> <b>Sát Thương:</b> {(stats.attackDamage || 0).toLocaleString()}</div>
              <div className="flex items-center gap-1"><FaTrophy className="text-pink-400" /> <b>Lôi Đài Thắng:</b> {(userData.pvpWins || 0).toLocaleString()}</div>
              <div className="flex items-center gap-1"><FaTrophy className="text-yellow-600" /> <b>Tổng Sát Thương:</b> {(userData.totalDamageDealt || 0).toLocaleString()}</div>
              <div className="flex items-center gap-1"><FaUsers className="text-blue-400" /> <b>Cống hiến:</b> {(userData.clanContribution || 0).toLocaleString()}</div>
              <div className="flex items-center gap-1"><FaShieldAlt className="text-blue-700" /> <b>Tông Môn:</b> {getClanNameById(userData.clanId)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsModal;