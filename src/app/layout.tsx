import type { Metadata } from "next";
import { Cinzel, Josefin_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const josefin = Josefin_Sans({
  variable: "--font-josefin",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RoomSales Pro • Quỹ Phòng TP.HCM Cao Cấp",
  description: "Cổng thông tin quỹ phòng cho thuê TP.HCM chuẩn Real Estate Luxury dành riêng cho đội ngũ Sale.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${cinzel.variable} ${josefin.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FBFBFA] dark:bg-[#0B0F17] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-amber-500 selection:text-white">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
