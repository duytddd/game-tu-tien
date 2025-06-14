// src/components/modals/ClanViewMembersModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useGameState } from '@/hooks/use-game-state';
// QUAN TRỌNG: Đảm bảo import getDoc ở đây.
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'; 
import { db } from '@/lib/firebase/firebase';
import type { UserData } from '@/lib/data';

// Giữ nguyên COSMETIC_SHOP_ITEMS_CLIENT hoặc import từ nơi bạn định nghĩa
const COSMETIC_SHOP_ITEMS_CLIENT: Record<string, {name: string, avatarIdle: string, avatarAttack: string}> = {
  fire_skin: {
    name: "Tiêu Viêm - Già Nam Học Viện",
    cost: 5000,
    avatarIdle: "/images/skin_fire_idle.gif",
    avatarAttack: "/images/skin_fire_attack.gif",
  },
  "default": {
    name: "Mặc định",
    cost: 0,
    avatarIdle: "/images/player-idle.gif",
    avatarAttack: "/images/player-attack.gif",
  }
};

// Thêm các icon mới
import { FaUserCircle, FaCrown, FaStar, FaHashtag, FaCoins, FaCrosshairs } from 'react-icons/fa';

interface ClanViewMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ClanMemberRecord {
    id: string;
    role: 'master' | 'elder' | 'member';
    discordName: string;
    level: number;
    joinedAt: any;
}

const ClanViewMembersModal: React.FC<ClanViewMembersModalProps> = ({ isOpen, onClose }) => {
  // --- TẤT CẢ CÁC HOOKS PHẢI ĐƯỢC GỌI Ở ĐẦU COMPONENT NÀY, TRƯỚC MỌI LỆNH RETURN CÓ ĐIỀU KIỆN ---
  const { userData } = useAuth();
  const { clans } = useGameState(); // Vẫn giữ lại nếu bạn dùng `clans` ở đâu đó
  const [members, setMembers] = useState<(UserData & { role: 'master' | 'elder' | 'member' })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Đây là Hook useEffect chính. Nó phải nằm ở đây, sau các useState, useAuth, useGameState.
  useEffect(() => {
    const fetchMembers = async () => {
      // 1. Kiểm tra điều kiện đầu tiên để không fetch nếu modal không mở hoặc không có clanId
      if (!isOpen || !userData?.clanId) {
        setMembers([]); // Reset members
        setLoading(false); // Ngừng loading
        setError(null); // Clear lỗi
        return; // Dừng fetch
      }

      // 2. Bắt đầu fetch: set loading true, clear error
      setLoading(true);
      setError(null);
      try {
        const clanId = userData.clanId;
        const membersRef = collection(db, "clans", clanId, "members");
        const membersSnapshot = await getDocs(membersRef);

        if (membersSnapshot.empty) {
          setMembers([]);
          setLoading(false);
          return;
        }

        const userUids: string[] = [];
        const memberRolesMap: Record<string, ClanMemberRecord> = {};
        membersSnapshot.forEach(memberDoc => {
            const memberData = memberDoc.data() as ClanMemberRecord;
            memberRolesMap[memberDoc.id] = { id: memberDoc.id, ...memberData };
            userUids.push(memberDoc.id);
        });

        const fetchedUsersData: UserData[] = [];
        if (userUids.length > 0) {
            const userDocPromises = userUids.map(uid => getDoc(doc(db, "users", uid)));
            const userDocs = await Promise.all(userDocPromises);

            userDocs.forEach(userDocSnap => {
                if (userDocSnap.exists()) {
                    fetchedUsersData.push({ id: userDocSnap.id, ...userDocSnap.data() } as UserData);
                }
            });
        }
        
        const combinedMembers: (UserData & { role: 'master' | 'elder' | 'member' })[] = [];
        fetchedUsersData.forEach(userDocData => {
            if (memberRolesMap[userDocData.id]) {
                combinedMembers.push({
                    ...userDocData,
                    role: memberRolesMap[userDocData.id].role
                });
            }
        });

        const rolePriority = { master: 1, elder: 2, member: 3 };
        combinedMembers.sort((a, b) => {
            const priorityA = rolePriority[a.role] || 4;
            const priorityB = rolePriority[b.role] || 4;
            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }
            return (b.clanContribution || 0) - (a.clanContribution || 0);
        });

        setMembers(combinedMembers);
      } catch (err: any) {
        setError(err.message || "Lỗi khi tải danh sách thành viên.");
        console.error("Lỗi tải danh sách thành viên:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers(); // Gọi hàm fetchMembers này mỗi khi dependencies thay đổi

  }, [isOpen, userData?.clanId]); // QUAN TRỌNG: Dependencies của useEffect

  // Style modal cũng phải nằm ở đây, sau các Hooks
  const modalStyle: React.CSSProperties = {
    display: isOpen ? 'flex' : 'none',
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? 'auto' : 'none',
  };

  // Đây là câu lệnh return có điều kiện DUY NHẤT trong component
  // Nó phải nằm SAU TẤT CẢ CÁC KHAI BÁO HOOKS VÀ USEEFFECT
  if (!isOpen) return null; 

  const getRoleIcon = (role: string) => {
    if (role === 'master') return <FaCrown className="text-yellow-500" title="Tông Chủ" />;
    if (role === 'elder') return <FaStar className="text-gray-400" title="Trưởng Lão" />;
    return <FaUserCircle className="text-blue-400" title="Thành viên" />;
  };

  const getAvatarUrl = (equippedSkin?: string) => {
    const skinId = equippedSkin || "default";
    const skinData = COSMETIC_SHOP_ITEMS_CLIENT[skinId];
    return skinData?.avatarIdle || "/images/player-idle.gif";
  };

  // --- PHẦN JSX (VIEW) SẼ ĐƯỢC CHỈNH SỬA DƯỚI ĐÂY ---
  return (
    <div id="clan-view-members-modal" className="modal" style={modalStyle}>
      <div className="modal-content max-w-4xl bg-gray-900/90 border-green-500 text-gray-100">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2 className="text-2xl font-bold text-white text-center mb-6">Danh Sách Thành Viên Tông Môn</h2>

        {loading ? (
          <p className="text-center text-gray-400">Đang tải dữ liệu thành viên...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : members.length === 0 ? (
          <p className="text-center text-gray-400">Tông môn chưa có thành viên.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800/50 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-700 text-gray-300 uppercase text-sm leading-normal">
                  <th className="py-3 px-4 text-left"><FaHashtag /></th> {/* Icon cho cột # */}
                  <th className="py-3 px-4 text-left">Thành Viên</th> {/* Tiêu đề mới */}
                  <th className="py-3 px-4 text-right"><FaCoins className="inline-block mr-1 text-yellow-300" /> Cống Hiến</th> {/* Icon cho cột Cống Hiến */}
                  <th className="py-3 px-4 text-right"><FaCrosshairs className="inline-block mr-1 text-red-400" /> Sát Thương</th> {/* Icon cho cột Tổng Sát Thương */}
                </tr>
              </thead>
              <tbody className="text-gray-200 text-sm font-light">
                {members.map((member, index) => (
                  <tr key={member.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                    <td className="py-3 px-4 text-left whitespace-nowrap">{index + 1}</td>
                    <td className="py-3 px-4 text-left flex items-center gap-3">
                        <img src={getAvatarUrl(member.equippedSkin)} alt={member.discordName} className="w-10 h-10 rounded-full border-2 border-gray-600 shadow-md" />
                        <div className="flex flex-col">
                            <span className="font-semibold text-white">{member.discordName}</span>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                {getRoleIcon(member.role)}
                                <span>{member.role === 'master' ? 'Tông Chủ' : member.role === 'elder' ? 'Trưởng Lão' : 'Thành viên'}</span>
                            </div>
                        </div>
                    </td>
                    <td className="py-3 px-4 text-right">{member.clanContribution?.toLocaleString() || 0}</td>
                    <td className="py-3 px-4 text-right">{member.totalDamageDealt?.toLocaleString() || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClanViewMembersModal;