// src/components/modals/ForceClanModal.tsx
"use client";

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useGameState } from '@/hooks/use-game-state';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase/firebase';
import type { Clan } from '@/hooks/use-game-state';
import { ErrorHandler } from '@/lib/utils/ErrorHandler';

interface ForceClanModalProps {
  // Modal này không nhận isOpen/onClose vì nó là modal "bắt buộc"
  // và chỉ được render bởi page.tsx khi userData.clanId là null.
}

const ForceClanModal: React.FC<ForceClanModalProps> = () => {
  const { userData } = useAuth();
  const { clans, openModal } = useGameState();

  const isClanMaster = userData?.isClanMaster; // Quyền tạo tông môn của người chơi

  // Helper để lấy URL ảnh tông môn
  const getClanImageUrl = (clan: Clan | null) => {
    if (!clan || !clan.level) return "/images/castle-lv1.png";
    const extension = clan.level > 1 ? "gif" : "png";
    return `/images/castle-lv${clan.level}.${extension}`;
  };

  const renderJoinClanList = () => {
    const availableClans = Object.values(clans); 

    if (availableClans.length === 0) {
      if (!isClanMaster) {
        return <p className="text-center text-gray-400">Hiện chưa có Tông Môn nào chiêu mộ đệ tử.</p>;
      }
      return null;
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
                console.log("DEBUG: Nút Xin Gia Nhập được click cho clan:", clan.name); // THÊM LOG NÀY
                try {
                  const applyToClan = httpsCallable(functions, 'applyToClan');
                  await applyToClan({ clanId: clan.id });
                  ErrorHandler.showError("Đã gửi đơn xin gia nhập! Vui lòng chờ Tông Chủ hoặc Trưởng Lão duyệt.", "info");
                } catch (error: any) {
                  ErrorHandler.handleFirebaseError(error, 'applyToClan');
                }
              }}
              // THÊM !important vào các class màu để đảm bảo không bị mờ
              className="bg-green-600 !opacity-100 !cursor-pointer hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors" 
              // Đảm bảo không có thuộc tính disabled nào ở đây
            >
              Xin Gia Nhập
            </button>
          </div>
        ))}
      </div>
    );
  };

  if (!userData) {
    return <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm text-white">Đang tải dữ liệu người dùng...</div>;
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="modal-content max-w-xl bg-gray-900/90 border-yellow-500 text-gray-100 p-8">
        <h2 className="text-3xl font-extrabold text-white text-center mb-6">Gia Nhập Thế Lực</h2>
        <p className="text-center text-gray-300 mb-6">Để bắt đầu hành trình tu tiên, bạn phải gia nhập hoặc sáng lập một Tông Môn!</p>

        {renderJoinClanList()}
        
        {isClanMaster && ( 
            <div className="mt-8 pt-4 border-t border-gray-700 text-center">
                <button
                    onClick={() => {
                        console.log("DEBUG: Nút Khai Môn Lập Phái được click."); // THÊM LOG NÀY
                        openModal('create-clan');
                    }}
                    // THÊM !important vào các class màu để đảm bảo không bị mờ
                    className="bg-purple-600 !opacity-100 !cursor-pointer hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-lg"
                    // Đảm bảo không có thuộc tính disabled nào ở đây
                >
                    Khai Môn Lập Phái
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default ForceClanModal;