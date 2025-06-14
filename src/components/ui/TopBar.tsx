// src/components/ui/TopBar.tsx

"use client";
import { useAuth } from "@/hooks/use-auth";
import { useGameState } from "@/hooks/use-game-state";
import { useLevelSystem } from "@/hooks/use-level-system";
import { calculateExpNeeded } from "@/lib/data";
import { FaUserAstronaut, FaMedal, FaBolt, FaTrophy, FaSignOutAlt, FaTasks, FaStore, FaChessKnight, FaFire } from "react-icons/fa";

interface TopBarProps {
  userData: ReturnType<typeof useAuth>['userData'];
  currentTargetData: ReturnType<typeof useGameState>['currentTargetData'];
}

const avatarFrameUrl = "/images/avatar-frame-sprite.png";
const avatarFrameStyle = {
  backgroundImage: `url(${avatarFrameUrl})`,
  backgroundPosition: '0px 0px',
  backgroundSize: 'cover',
};

const TopBar: React.FC<TopBarProps> = ({ userData, currentTargetData }) => {
  const { logout } = useAuth();
  const { openModal } = useGameState(); // Lấy openModal từ useGameState
  const { expBase, expPower, levelTitles, loading: loadingLevelSystem } = useLevelSystem();

  const playerLevel = userData?.level || 1;
  const playerExp = userData?.exp || 0;

  const playerExpNeeded = (expBase && expPower) ? calculateExpNeeded(playerLevel, expBase, expPower) : Math.floor(100 * Math.pow(playerLevel, 1.5));
  const expPercentage = Math.min(100, (playerExp / playerExpNeeded) * 100);

  let playerTitle = "";
  if (!loadingLevelSystem && levelTitles) {
    const levelKeys = Object.keys(levelTitles).map(Number).sort((a, b) => b - a);
    for (const lv of levelKeys) {
      if (playerLevel >= lv) {
        playerTitle = levelTitles[lv.toString()];
        break;
      }
    }
  }
  if (loadingLevelSystem) playerTitle = "...";
  if (!playerTitle) playerTitle = "Phàm Nhân";

  return (
    <header className="absolute top-0 left-0 z-10 flex w-full items-center justify-between gap-2 bg-black/40 p-2 sm:p-3 backdrop-blur-md border-b-2 border-blue-500 shadow-lg">
      <div className="flex items-center gap-2 sm:gap-4 min-w-[220px]">
        <div className="relative w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center">
          <div className="absolute w-full h-full rounded-full border-4 border-cyan-400 shadow-[0_0_24px_6px_rgba(0,255,255,0.2)] animate-pulse" style={avatarFrameStyle}></div>
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-cyan-200 via-blue-400 to-blue-900 flex items-center justify-center text-2xl sm:text-4xl font-bold text-white shadow-inner border-2 border-cyan-400 select-none z-10">
            <FaUserAstronaut />
          </div>
        </div>
        <div className="flex flex-col gap-1 min-w-[120px] sm:min-w-[200px]">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="font-bold text-base sm:text-xl text-cyan-100 drop-shadow flex items-center gap-1">
              <FaMedal className="text-yellow-300" /> {playerTitle}
            </span>
            <span className="flex items-center gap-1 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 text-white text-xs font-extrabold rounded px-2 py-0.5 shadow border-2 border-yellow-300 animate-pulse-glow" style={{boxShadow:'0 0 8px 2px #ff9800, 0 0 16px 4px #ff5722'}}>
              <FaFire className="text-orange-400 animate-flicker" /> {playerLevel}
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 mt-1">
            <span className="text-xs text-green-300 font-semibold">EXP</span>
            <div className="relative w-24 sm:w-40 h-2 sm:h-3 bg-green-900/40 rounded-full overflow-hidden shadow-inner border border-green-400">
              <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-300 via-blue-400 to-purple-400 rounded-full transition-all duration-500" style={{width: `${expPercentage}%`}}></div>
            </div>
            <span className="text-xs text-green-200 font-bold">{playerExp.toLocaleString()}/{playerExpNeeded.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 mt-1">
            <FaBolt className="text-yellow-300" />
            <span className="text-base sm:text-lg font-bold text-yellow-200 drop-shadow">{(userData?.attackPoints || 0).toLocaleString()}</span>
            <span className="text-xs text-yellow-100 ml-1">Công Lực</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center bg-black/60 rounded-xl px-3 py-2 shadow border-2 border-pink-700 min-w-[110px] max-w-[140px] ml-2">
          <div className="flex items-center gap-1 mb-1">
            <FaTasks className="text-pink-300 text-base" />
            <span className="font-bold text-pink-100 text-xs drop-shadow">{currentTargetData?.name || "Mục Tiêu"}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-red-300 font-semibold">HP</span>
            <div className="relative w-16 h-2 bg-red-900/40 rounded-full overflow-hidden border border-pink-400">
              <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-pink-400 via-red-400 to-yellow-200 rounded-full transition-all duration-500" style={{width: `${Math.min(100, (currentTargetData?.hp || 0)/(currentTargetData?.maxHp || 1)*100)}%`}}></div>
            </div>
            <span className="text-xs text-pink-200 font-bold">{(currentTargetData?.hp || 0).toLocaleString()}/{(currentTargetData?.maxHp || 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-row items-center gap-2 sm:gap-3">
        <button onClick={() => openModal('shop')} className="flex items-center gap-1 sm:gap-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-400 to-yellow-300 px-3 sm:px-4 py-1 sm:py-2 text-white font-bold shadow-lg hover:scale-105 transition-transform border-2 border-purple-300 text-xs sm:text-base">
          <FaStore className="text-white text-base sm:text-lg" /> Ngoại Hình
        </button>
        <button onClick={() => openModal('quest')} className="flex items-center gap-1 sm:gap-2 rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-green-300 px-3 sm:px-4 py-1 sm:py-2 text-white font-bold shadow-lg hover:scale-105 transition-transform border-2 border-blue-300 text-xs sm:text-base">
          <FaTasks className="text-white text-base sm:text-lg" /> Nhiệm Vụ
        </button>
        <button onClick={() => openModal('clan')} className="flex items-center gap-1 sm:gap-2 rounded-full bg-gradient-to-r from-green-500 via-lime-400 to-yellow-200 px-3 sm:px-4 py-1 sm:py-2 text-white font-bold shadow-lg hover:scale-105 transition-transform border-2 border-green-300 text-xs sm:text-base">
          <FaMedal className="text-white text-base sm:text-lg" /> Tông Môn
        </button>
        <button onClick={() => openModal('arena')} className="flex items-center gap-1 sm:gap-2 rounded-full bg-gradient-to-r from-orange-500 via-yellow-400 to-pink-300 px-3 sm:px-4 py-1 sm:py-2 text-white font-bold shadow-lg hover:scale-105 transition-transform border-2 border-orange-300 text-xs sm:text-base">
          <FaChessKnight className="text-white text-base sm:text-lg" /> Lôi Đài
        </button>
        <button onClick={logout} className="flex items-center gap-1 sm:gap-2 rounded-full bg-gradient-to-r from-gray-600 via-gray-400 to-gray-200 px-3 sm:px-4 py-1 sm:py-2 text-white font-bold shadow-lg hover:scale-105 transition-transform border-2 border-gray-400 text-xs sm:text-base">
          <FaSignOutAlt className="text-white text-base sm:text-lg" /> Thoát
        </button>
      </div>
    </header>
  );
}

export default TopBar;