// src/app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/use-auth";
import { GameStateProvider } from "@/hooks/use-game-state";
import { ToastProvider } from "@/hooks/use-toast"; // Không cần import useToast ở đây nữa
import ErrorHandlerInitializer from "@/components/layout/ErrorHandlerInitializer"; // QUAN TRỌNG: Import Client Component mới

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          {/* Component này là Client Component và sẽ được render ở client */}
          <ErrorHandlerInitializer /> 
          <AuthProvider>
            <GameStateProvider>
              {children}
            </GameStateProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}