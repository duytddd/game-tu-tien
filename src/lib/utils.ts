// src/lib/utils.ts

import { type ClassValue, clsx } from "clsx" // Import từ clsx
import { twMerge } from "tailwind-merge" // Import từ tailwind-merge

/**
 * Tải một hình ảnh và trả về một Promise.
 * @param src Đường dẫn của hình ảnh.
 * @returns Promise<HTMLImageElement> sẽ resolve khi ảnh được tải, hoặc reject nếu lỗi.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => {
      console.error(`LỖI TẢI ẢNH: ${src}`, e);
      reject(new Error(`Không thể tải ảnh: ${src}`));
    };
    img.src = src;
  });
}

/**
 * Hàm tiện ích để kết hợp classNames một cách có điều kiện và giải quyết xung đột Tailwind CSS.
 * Đây là hàm `cn` phổ biến trong các dự án Next.js/Tailwind.
 * @param inputs Các giá trị class để kết hợp.
 * @returns Chuỗi classNames đã kết hợp.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Bạn có thể thêm các hàm tiện ích khác vào đây sau này.