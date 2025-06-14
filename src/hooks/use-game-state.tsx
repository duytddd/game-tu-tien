// src/hooks/use-game-state.tsx
"use client";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { httpsCallable } from 'firebase/functions';
import { useAuth } from "./use-auth";
import { db, functions } from "@/lib/firebase/firebase";
import type { UserData } from "@/lib/data";

// ĐỊNH NGHĨA INTERFACE CLAN (Giữ nguyên như đã sửa trước đó)
export interface Clan {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  level: number;
  ownerId: string;
  ownerName: string;
  treasury: number;
  memberCount: number;
  elderCount: number;
  formationLevel?: number;
  formationShield?: number;
  maxFormationShield?: number; // Thêm nếu có trong DB của bạn
  hitImageUrl?: string;
  imageUrl?: string;
  createdAt?: any;
  updatedAt?: any;
}

// MỞ RỘNG ModalType ĐỂ BAO GỒM TẤT CẢ CÁC MODAL LIÊN QUAN ĐẾN TÔNG MÔN
export type ModalType =
  'clan' // Modal chính của Tông Môn
  | 'select-target'
  | 'arena'
  | 'leaderboard'
  | 'shop'
  | 'quest'
  | 'player-stats'
  | 'create-clan' // THÊM: Modal tạo Tông Môn
  | 'clan-upgrade' // THÊM: Modal nâng cấp Tông Môn/Đại Trận
  | 'clan-members' // THÊM: Modal xem thành viên (danh sách)
  | 'attack-log' // THÊM: Modal nhật ký chiến sự
  | null;

interface GameStateContextType {
  currentUserData: UserData | null;
  clans: Record<string, Clan>;
  loadingClans: boolean;
  activeModal: ModalType;
  currentTargetId: string | null;
  currentTargetData: Clan | null;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  selectTarget: (clanId: string) => void;
  stopAttack: () => void;
  handleAttack: () => Promise<void>;
  getClanNameById: (clanId: string | undefined) => string;
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export function GameStateProvider({ children }: { children: ReactNode }) {
  const { userData } = useAuth();
  const [clans, setClans] = useState<Record<string, Clan>>({});
  const [loadingClans, setLoadingClans] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [currentTargetId, setCurrentTargetId] = useState<string | null>(null);

  useEffect(() => {
    const clansRef = collection(db, "clans");
    const unsubscribe = onSnapshot(clansRef, (snapshot) => {
      const allClans: Record<string, Clan> = {};
      snapshot.forEach((doc) => {
        allClans[doc.id] = { id: doc.id, ...doc.data() } as Clan;
      });
      setClans(allClans);
      setLoadingClans(false);
    });
    return () => unsubscribe();
  }, []);

  const openModal = useCallback((modal: ModalType) => setActiveModal(modal), []);
  const closeModal = useCallback(() => setActiveModal(null), []);
  
  const selectTarget = (clanId: string) => {
    if (clans[clanId] && userData?.clanId !== clanId) {
      setCurrentTargetId(clanId);
      closeModal();
    }
  };
  const stopAttack = () => setCurrentTargetId(null);

  const handleAttack = async () => {
    if (!currentTargetId) return;
    try {
      const performClanAttack = httpsCallable(functions, 'performClanAttack');
      await performClanAttack({ targetClanId: currentTargetId });
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const getClanNameById = useCallback((clanId: string | undefined): string => {
    if (!clanId) return "Chưa gia nhập";
    // Đảm bảo `clans` đã tải xong trước khi truy cập
    if (!clans || Object.keys(clans).length === 0) return "Đang tải...";
    return clans[clanId]?.name || "N/A";
  }, [clans]);
  
  const currentTargetData = currentTargetId ? clans[currentTargetId] : null;

  const value = {
    currentUserData: userData,
    clans, loadingClans, activeModal, openModal, closeModal,
    currentTargetId, currentTargetData, selectTarget, stopAttack, handleAttack,
    getClanNameById,
  };

  return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
}

export function useGameState() {
  const context = useContext(GameStateContext);
  if (!context) throw new Error("useGameState must be used within a GameStateProvider");
  return context;
}