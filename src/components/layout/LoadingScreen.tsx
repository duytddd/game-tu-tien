// src/components/layout/LoadingScreen.tsx
"use client";

export default function LoadingScreen() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black">
      <div className="text-yellow-500 text-lg animate-pulse">
        Đang tải dữ liệu tu tiên... 
       
      </div>
    </main>
  );
}