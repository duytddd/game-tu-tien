// src/components/layout/ErrorHandlerInitializer.tsx
"use client"; // QUAN TRỌNG: Đánh dấu đây là Client Component

import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { ErrorHandler } from "@/lib/utils/ErrorHandler";

// Component này chỉ có nhiệm vụ khởi tạo ErrorHandler một lần
const ErrorHandlerInitializer: React.FC = () => {
  const { showToast } = useToast();
  const initialized = useRef(false); // Dùng useRef để đảm bảo chỉ khởi tạo 1 lần

  useEffect(() => {
    if (!initialized.current && showToast) {
      ErrorHandler.init(showToast); // Khởi tạo ErrorHandler với hàm showToast
      initialized.current = true;
      console.log("DEBUG LAYOUT: ErrorHandler initialized successfully.");
    }
  }, [showToast]); // Dependencies: Hook này sẽ chạy lại nếu showToast thay đổi
  
  return null; // Component này không render gì cả
};

export default ErrorHandlerInitializer;