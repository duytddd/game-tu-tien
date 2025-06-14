// src/hooks/use-level-system.ts
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

interface LevelSystemData {
  expBase: number;
  expPower: number;
  levelTitles: Record<string, string>;
  // THÊM statGrowth vào interface này
  statGrowth: {
    maxHp: { base: number; perLevel: number; };
    attackDamage: { base: number; perLevel: number; };
  };
  // Nếu bạn có các cấu hình khác trong game_config/level_system, hãy thêm vào đây
  // Ví dụ: maxLevel: number;
}

export function useLevelSystem() {
  const [data, setData] = useState<LevelSystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLevelSystem() {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, "game_config", "level_system");
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const d = snap.data();
          setData({
            expBase: d.expBase,
            expPower: d.expPower,
            levelTitles: d.levelTitles,
            statGrowth: d.statGrowth, // Đảm bảo lấy statGrowth từ Firestore
            // ... lấy các thuộc tính khác nếu có
          });
        } else {
          setError("Không tìm thấy cấu hình level_system.");
        }
      } catch (e: any) {
        setError(e.message || "Lỗi không xác định khi tải cấu hình level.");
      } finally {
        setLoading(false);
      }
    }
    fetchLevelSystem();
  }, []);

  // Trả về dữ liệu đã bóc tách để dễ sử dụng
  return {
    expBase: data?.expBase,
    expPower: data?.expPower,
    levelTitles: data?.levelTitles,
    statGrowth: data?.statGrowth, // Trả về statGrowth
    loading,
    error
  };
}