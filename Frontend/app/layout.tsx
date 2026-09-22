import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "myITS Recap",
  description: "Sistem Rekap Nilai Mahasiswa ITS",
  icons: {
    icon: "/myITS-Portal.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}