"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Zap, UserCheck, Upload, Sparkles, Sun, Moon, X } from "lucide-react";

interface HeaderProps {
  saleUser: { name: string; phone: string };
  onUpdateSaleUser: (user: { name: string; phone: string }) => void;
  onOpenCreateRoom: () => void;
}

export function Header({ saleUser, onUpdateSaleUser, onOpenCreateRoom }: HeaderProps) {
  const pathname = usePathname();
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempName, setTempName] = React.useState(saleUser.name);
  const [tempPhone, setTempPhone] = React.useState(saleUser.phone);
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (typeof window !== "undefined") {
      if (nextDark) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("roomsales_theme_mode", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("roomsales_theme_mode", "light");
      }
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSaleUser({ name: tempName, phone: tempPhone });
    setIsEditing(false);
  };

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      // Đặt tọa độ cuộn về đỉnh (0, 0)
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        // Nếu có query param hoặc hash, reset về URL trang chủ sạch và reload lại trang
        if (window.location.search || window.location.hash) {
          window.location.href = "/";
        } else {
          window.location.reload();
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full luxury-glass border-b transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          onClick={handleHomeClick}
          className="flex items-center gap-2.5 sm:gap-3.5 group cursor-pointer transition-opacity hover:opacity-95 shrink-0"
          title="Về trang chủ Quỹ phòng TP.HCM (Reset tọa độ & Load lại trang)"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-amber-950/70 dark:from-zinc-100 dark:via-zinc-200 dark:to-amber-200/80 flex items-center justify-center text-amber-400 dark:text-zinc-900 shadow-md shadow-black/10 border border-amber-500/20 group-hover:scale-105 transition-transform duration-300 shrink-0">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.75]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base sm:text-lg text-zinc-950 dark:text-white tracking-widest uppercase group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                ESTATE<span className="text-amber-600 dark:text-amber-400 font-extrabold">.PORTAL</span>
              </span>
              <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                <Sparkles className="w-2.5 h-2.5 text-amber-500" /> Nội Bộ Sale
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans tracking-wide hidden sm:block">
              Quỹ phòng TP.HCM Cao Cấp • Tra cứu SĐT Chủ Hộ • 1-Click Gửi Khách
            </p>
          </div>
        </Link>

        {/* Right Actions: Upload Button + Theme Toggle + Sale User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Nút Đổi Giao Diện Sáng / Tối */}
          <button
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 rounded-xl border border-zinc-200/80 bg-white/70 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/80 dark:hover:bg-zinc-800 text-zinc-700 dark:text-amber-400 shadow-2xs transition-all cursor-pointer flex items-center justify-center"
            title={isDarkMode ? "Chuyển sang giao diện Sáng (Editorial Light)" : "Chuyển sang giao diện Tối (Obsidian Luxury)"}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-600" />
            )}
          </button>

          {/* Nút Upload / Đăng Quỹ Phòng Mới */}
          <button
            onClick={onOpenCreateRoom}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold tracking-wide shadow-sm hover:shadow-md transition-all cursor-pointer border border-zinc-700/30 dark:border-zinc-300/30"
            title="Tải ảnh và nhập thông tin phòng mới vào hệ thống"
          >
            <Upload className="w-3.5 h-3.5 stroke-[2.2]" />
            <span className="hidden sm:inline">+ Đăng Quỹ Phòng</span>
            <span className="sm:hidden font-bold">+ Đăng</span>
          </button>

          {/* Sale User Profile Button */}
          <button
            onClick={() => {
              setTempName(saleUser.name);
              setTempPhone(saleUser.phone);
              setIsEditing(true);
            }}
            className="flex items-center gap-2 p-2 sm:px-3.5 sm:py-2 rounded-xl border border-zinc-200/80 bg-white/70 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 shadow-xs transition-all cursor-pointer"
            title="Thông tin của bạn (dùng khi bạn giữ chỗ hoặc copy gửi khách)"
          >
            <UserCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <div className="text-left hidden sm:block">
              <span className="font-semibold block text-zinc-900 dark:text-white leading-tight">
                {saleUser.name}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block leading-tight">
                {saleUser.phone} <span className="text-amber-600 dark:text-amber-400">(Sửa)</span>
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Modal chỉnh sửa thông tin Sale (Không làm tràn bề ngang màn hình mobile) */}
      {isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsEditing(false)}
        >
          <form
            onSubmit={handleSave}
            className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-serif font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-amber-500" />
                <span>Cập Nhật Thông Tin Sale</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                  Tên của bạn (Tự động chèn vào tin nhắn Zalo gửi khách)
                </label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="VD: Minh Tuấn (Sale)"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-amber-500/40"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                  Số điện thoại Sale
                </label>
                <input
                  type="text"
                  value={tempPhone}
                  onChange={(e) => setTempPhone(e.target.value)}
                  placeholder="VD: 0988.123.456"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 outline-none focus:ring-2 focus:ring-amber-500/40"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all shadow-md cursor-pointer"
              >
                Lưu Thông Tin
              </button>
            </div>
          </form>
        </div>
      )}
    </header>
  );
}
