// src/components/modals/CreateClanModal.tsx
"use client";

import React, { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase/firebase';
// import { useGameState } from '@/hooks/use-game-state'; // Không cần thiết nếu chỉ dùng onClose

interface CreateClanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateClanModal: React.FC<CreateClanModalProps> = ({ isOpen, onClose }) => {
  const [clanName, setClanName] = useState('');
  const [loading, setLoading] = useState(false); // Đổi isSubmitting thành loading cho nhất quán
  const [error, setError] = useState<string | null>(null);

  // Dùng inline style để kiểm soát hiển thị modal
  const modalStyle: React.CSSProperties = {
    display: isOpen ? 'flex' : 'none',
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? 'auto' : 'none',
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clanName.trim()) {
      setError("Tên Tông Môn không được để trống.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const createClan = httpsCallable(functions, 'createClan');
      await createClan({ clanName });
      alert("Tạo Tông Môn thành công!"); // Tạm dùng alert
      onClose(); // Đóng modal sau khi tạo thành công
    } catch (err: any) {
      setError(err.message || "Lỗi khi tạo Tông Môn.");
      console.error("Lỗi tạo tông môn:", err); // Log lỗi chi tiết hơn
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="create-clan-modal" className="modal" style={modalStyle}> {/* Áp dụng class modal và style inline */}
      <div className="modal-content max-w-lg bg-gray-900/90 border-yellow-500 text-gray-100"> {/* Áp dụng class modal-content */}
        <span className="close-btn" onClick={onClose}>&times;</span> {/* Nút đóng chuẩn */}
        <h2 className="text-2xl font-bold text-yellow-500 text-center mb-6">Khai Môn Lập Phái</h2>
        <p className="mt-2 mb-6 text-gray-300 text-center">Chọn một cái tên thật kêu cho thế lực của bạn.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            id="create-clan-name"
            placeholder="Tên Tông Môn"
            value={clanName}
            onChange={(e) => setClanName(e.target.value)}
            className="w-full p-3 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
            required
            maxLength={50}
            minLength={3}
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading} // Sử dụng loading
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang sáng lập..." : "Sáng Lập"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateClanModal;