// src/components/modals/AttackLogModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

interface AttackLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AttackLog {
  attackerId: string;
  attackerName: string;
  attackerClanName: string;
  damage: number;
  timestamp: Timestamp;
}

const AttackLogModal: React.FC<AttackLogModalProps> = ({ isOpen, onClose }) => {
  // TẤT CẢ CÁC HOOKS PHẢI ĐƯỢC GỌI Ở ĐẦU COMPONENT, TRƯỚC BẤT KỲ LỆNH RETURN CÓ ĐIỀU KIỆN NÀO
  const { userData } = useAuth();
  const [logs, setLogs] = useState<AttackLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hook useEffect cũng phải nằm ngoài điều kiện `if (!isOpen) return null;`
  useEffect(() => {
    const fetchAttackLogs = async () => {
      // Logic fetch chỉ chạy nếu modal đang mở
      if (!isOpen) { // Thêm kiểm tra `isOpen` vào đây để không fetch khi đóng modal
        setLogs([]);
        setLoading(false);
        return;
      }

      if (!userData?.clanId) {
        setLogs([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const clanId = userData.clanId;
        const logsRef = collection(db, "clans", clanId, "attack_logs");
        const q = query(logsRef, orderBy("timestamp", "desc"), limit(50));
        const querySnapshot = await getDocs(q);

        const fetchedLogs: AttackLog[] = [];
        querySnapshot.forEach((doc) => {
          fetchedLogs.push(doc.data() as AttackLog);
        });
        setLogs(fetchedLogs);
      } catch (err: any) {
        setError(err.message || "Lỗi khi tải nhật ký chiến sự.");
        console.error("Lỗi tải nhật ký chiến sự:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttackLogs(); // Gọi hàm fetch khi `isOpen` hoặc `userData.clanId` thay đổi
    // Không cần else{} để reset vì đã có điều kiện `if (!isOpen)` ở đầu `fetchAttackLogs`

  }, [isOpen, userData?.clanId]); // Dependencies: Hook này chạy lại khi isOpen hoặc clanId thay đổi

  // Dùng inline style để kiểm soát hiển thị modal
  // STYLE NÀY CŨNG KHÔNG ĐƯỢC NẰM TRONG ĐIỀU KIỆN `if (!isOpen) return null;`
  const modalStyle: React.CSSProperties = {
    display: isOpen ? 'flex' : 'none',
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? 'auto' : 'none',
  };

  // Bây giờ mới return null nếu modal không mở.
  // Đảm bảo tất cả Hooks đã được gọi trước dòng này.
  if (!isOpen) return null; 

  return (
    <div id="attack-log-modal" className="modal" style={modalStyle}>
      <div className="modal-content max-w-xl bg-gray-900/90 border-red-500 text-gray-100">
        <span className="close-btn" onClick={onClose}>&times;</span>
        <h2 className="text-2xl font-bold text-white text-center mb-6">Nhật Ký Chiến Sự</h2>

        {loading ? (
          <p className="text-center text-gray-400">Đang tải nhật ký...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : logs.length === 0 ? (
          <p className="text-center text-gray-400">Tông môn chưa từng bị tấn công.</p>
        ) : (
          <div className="max-h-[400px] overflow-y-auto pr-2">
            {logs.map((log, index) => (
              <div key={index} className="bg-gray-800/50 p-3 rounded-lg mb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center border border-gray-700">
                <div className="flex-grow">
                  <p className="font-bold text-white">
                    <span className="text-red-300">{log.attackerName}</span>
                    <span className="text-sm text-gray-400 ml-2">(Tông: {log.attackerClanName})</span>
                  </p>
                  <p className="text-red-400 text-sm">Gây sát thương: {log.damage.toLocaleString()}</p>
                </div>
                <span className="text-xs text-gray-500 mt-2 sm:mt-0 sm:ml-4">
                  {log.timestamp instanceof Timestamp ? log.timestamp.toDate().toLocaleString('vi-VN') : 'Không rõ'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttackLogModal;