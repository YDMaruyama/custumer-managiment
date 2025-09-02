// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "顧客管理アプリ",
  description: "Googleスプレッドシート連携のミニCRM",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

