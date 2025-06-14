// src/app/page.tsx
"use client";

import AuthScreen from "@/components/auth/AuthScreen";
import GameScreen from "@/components/game/GameScreen";
import ForceClanModal from "@/components/modals/ForceClanModal"; // Import ForceClanModal
import LoadingScreen from "@/components/layout/LoadingScreen";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { user, userData, loading } = useAuth();

  // 1. Nếu auth hook đang trong quá trình kiểm tra ban đầu -> Hiện Loading
  if (loading) {
    return <LoadingScreen />;
  }

  // 2. Nếu không có user -> Chắc chắn là phải đăng nhập
  if (!user) {
    return <AuthScreen />;
  }

  // 3. Nếu có user nhưng CHƯA CÓ userData (đang tải từ Firestore) -> Vẫn là trạng thái loading
  // Đây là bước kiểm tra quan trọng để tránh race condition
  if (!userData) {
     return <LoadingScreen />;
  }

  // 4. Đến đây, ta chắc chắn có user và userData. Bây giờ mới kiểm tra clanId
  // Nếu userData.clanId là null hoặc undefined, hiển thị ForceClanModal
  if (!userData.clanId) { // Kiểm tra nếu clanId là null hoặc undefined
    return <ForceClanModal />;
  }

  // 5. Nếu tất cả điều kiện trên đều qua -> Hiển thị GameScreen
  return <GameScreen />;
}