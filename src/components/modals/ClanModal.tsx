// src/components/modals/ClanModal.tsx
"use client";

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useGameState } from '@/hooks/use-game-state';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase/firebase';
import type { Clan } from '@/hooks/use-game-state'; // Import Clan interface

interface ClanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ClanModal: React.FC<ClanModalProps> = ({ isOpen, onClose }) => {
  const { userData } = useAuth();
  // Lấy clans, openModal, và closeModal từ useGameState
  const { clans, openModal, closeModal } = useGameState(); 

  // Dùng inline style để kiểm soát hiển thị modal một cách mạnh mẽ
  const modalStyle: React.CSSProperties = {
    display: isOpen ? 'flex' : 'none',
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? 'auto' : 'none',
  };

  if (!isOpen) return null;

  const myClanId = userData?.clanId;
  const myClan = myClanId ? clans[myClanId] : null;
  const userRole = userData?.clanRole; // role có thể là 'member', 'elder', 'master'
  const isClanMaster = userData?.isClanMaster; // isClanMaster là quyền tạo clan

  // Helper để lấy URL ảnh tông môn (ví dụ, bạn có thể tạo hàm này trong lib/data.ts nếu cần)
  const getClanImageUrl = (clan: Clan | null) => {
    if (!clan || !clan.level) return "/images/castle-lv1.png"; // Fallback mặc định
    // Đảm bảo bạn có các ảnh này: castle-lv1.png, castle-lv2.gif, ...
    const extension = clan.level > 1 ? "gif" : "png";
    return `/images/castle-lv${clan.level}.${extension}`;
  };

  const renderJoinClanList = () => {
    const availableClans = Object.values(clans).filter(clan => clan.id !== myClanId);

    if (availableClans.length === 0 && !isClanMaster) { // Hiển thị thông báo nếu không có clan nào và không có quyền tạo
      return <p className="text-center text-gray-400">Hiện chưa có Tông Môn nào chiêu mộ đệ tử.</p>;
    }

    return (
      <div className="grid gap-4 mt-4 max-h-[300px] overflow-y-auto pr-2">
        {availableClans.map(clan => (
          <div key={clan.id} className="bg-gray-800/50 p-4 rounded-lg flex items-center justify-between border border-gray-700 hover:border-green-400 transition-colors">
            <div className="flex items-center gap-4">
              <img src={getClanImageUrl(clan)} alt={clan.name} className="w-12 h-12 rounded-md object-cover border border-green-500"/>
              <div>
                <h4 className="font-bold text-green-300 text-lg">{clan.name}</h4>
                <p className="text-sm text-gray-300">Cấp: {clan.level} | HP: {clan.hp.toLocaleString()}</p>
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  const applyToClan = httpsCallable(functions, 'applyToClan');
                  await applyToClan({ clanId: clan.id });
                  alert("Đã gửi đơn xin gia nhập! Vui lòng chờ Tông Chủ hoặc Trưởng Lão duyệt."); // Tạm dùng alert
                  closeModal(); // Đóng modal sau khi gửi đơn
                } catch (error: any) {
                  alert("Lỗi: " + error.message); // Tạm dùng alert
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              Xin Gia Nhập
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderClanDashboard = () => {
    if (!myClan) return <p className="text-center text-gray-400">Đang tải thông tin Tông Môn...</p>;

    return (
      <div className="flex flex-col gap-6">
        <h3 className="text-3xl font-extrabold text-green-400 text-center drop-shadow-md">{myClan.name}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-800/60 p-4 rounded-lg border border-green-700">
          <p><strong>Cấp Độ:</strong> <span className="text-green-300">{myClan.level}</span></p>
          <p><strong>Độ Bền:</strong> <span className="text-green-300">{myClan.hp.toLocaleString()} / {myClan.maxHp.toLocaleString()}</span></p>
          <p><strong>Tông Chủ:</strong> <span className="text-green-300">{myClan.ownerName}</span></p>
          <p><strong>Ngân Khố:</strong> <span className="text-green-300">{myClan.treasury.toLocaleString()} Linh Thạch</span></p>
          <p>
            <strong>Thành Viên:</strong> <span className="text-green-300">{myClan.memberCount}</span>
            <button onClick={() => openModal('clan-members')} className="ml-2 text-blue-400 hover:underline text-sm">Xem</button>
          </p>
          {myClan.formationLevel && myClan.formationLevel > 0 && (
            <p>
              <strong>Đại Trận:</strong> Cấp <span className="text-green-300">{myClan.formationLevel}</span> | Giáp: <span className="text-green-300">{myClan.formationShield?.toLocaleString() || 0} / {myClan.maxFormationShield?.toLocaleString() || 0}</span>
            </p>
          )}
        </div>

        <h4 className="text-xl font-bold text-green-300 mt-4">Hành Động Tông Môn:</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <button onClick={() => openModal('select-target')} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md">Khai Chiến</button> {/* QUAN TRỌNG: Sửa dòng này */}
          <button onClick={() => openModal('attack-log')} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md">Nhật Ký</button>
          
          {(userRole === 'master' || userRole === 'elder') && (
            <button onClick={() => { /* openModal('clan-applications'); */ alert("Chức năng duyệt đơn đang phát triển!"); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md">Duyệt Đơn</button>
          )}
          
          {userRole === 'master' && (
            <>
              <button onClick={() => openModal('clan-upgrade')} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md">Nâng Cấp</button>
              <button onClick={() => { /* openModal('clan-manage-members'); */ alert("Chức năng quản lý thành viên đang phát triển!"); }} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md">Quản Lý TV</button>
            </>
          )}

          {userRole !== 'master' && (
            <button onClick={async () => {
              if (confirm("Bạn có chắc chắn muốn rời khỏi Tông Môn?")) {
                try {
                  const leaveClan = httpsCallable(functions, 'leaveClan');
                  await leaveClan();
                  alert("Rời Tông Môn thành công.");
                  closeModal();
                } catch (error: any) {
                  alert("Lỗi: " + error.message);
                }
              }
            }} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-md">Rời Môn</button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div id="clan-modal" className="modal" style={modalStyle}>
      <div className="modal-content clan max-w-2xl bg-gray-900/90 border-green-500 text-gray-100">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2 className="text-3xl font-extrabold text-white text-center mb-6">
          {myClan ? "Tông Môn của bạn" : "Gia Nhập Thế Lực"}
        </h2>

        {myClan ? renderClanDashboard() : renderJoinClanList()}
        
        {!myClan && isClanMaster && ( // Nút tạo tông môn chỉ khi chưa có clan và có quyền master
            <div className="mt-8 pt-4 border-t border-gray-700 text-center">
                <button
                    onClick={() => openModal('create-clan')}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
                >
                    Khai Môn Lập Phái
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default ClanModal;