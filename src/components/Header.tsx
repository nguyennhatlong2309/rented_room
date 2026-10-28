"use client";

import React from "react";
import { Building2, Zap, UserCheck, Upload, Sparkles } from "lucide-react";

interface HeaderProps {
  saleUser: { name: string; phone: string };
  onUpdateSaleUser: (user: { name: string; phone: string }) => void;
  onOpenCreateRoom: () => void;
}

export function Header({ saleUser, onUpdateSaleUser, onOpenCreateRoom }: HeaderProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempName, setTempName] = React.useState(saleUser.name);
  const [tempPhone, setTempPhone] = React.useState(saleUser.phone);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSaleUser({ name: tempName, phone: tempPhone });
    setIsEditing(false);
  };

  return (
    <header className="sticky top-0 z-30 w-full luxury-glass border-b transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-amber-950/70 dark:from-zinc-100 dark:via-zinc-200 dark:to-amber-200/80 flex items-center justify-center text-amber-400 dark:text-zinc-900 shadow-md shadow-black/10 border border-amber-500/20">
            <Building2 className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-serif font-bold text-lg text-zinc-950 dark:text-white tracking-widest uppercase">
                ESTATE<span className="text-amber-600 dark:text-amber-400 font-extrabold">.PORTAL</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                <Sparkles className="w-2.5 h-2.5 text-amber-500" /> Nội Bộ Sale
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans tracking-wide hidden sm:block">
              Quỹ phòng TP.HCM Cao Cấp • Tra cứu SĐT Chủ Hộ • 1-Click Gửi Khách
            </p>
          </div>
        </div>

        {/* Right Actions: Upload Button + Sale User Profile */}
        <div className="flex items-center gap-3">
          {/* Nút Upload / Đăng Quỹ Phòng Mới */}
          <button
            onClick={onOpenCreateRoom}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-semibold tracking-wide shadow-sm hover:shadow-md transition-all cursor-pointer border border-zinc-700/30 dark:border-zinc-300/30"
            title="Tải ảnh và nhập thông tin phòng mới vào hệ thống"
          >
            <Upload className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>+ Đăng Quỹ Phòng</span>
          </button>

          {/* Sale User Profile Quick Set */}
          {isEditing ? (
            <form onSubmit={handleSave} className="flex items-center gap-2 bg-white/90 dark:bg-zinc-900/90 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Tên Sale"
                className="text-xs px-2.5 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 w-24 outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
              <input
                type="text"
                value={tempPhone}
                onChange={(e) => setTempPhone(e.target.value)}
                placeholder="SĐT"
                className="text-xs px-2.5 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 w-24 outline-none focus:ring-1 focus:ring-amber-500"
                required
              />
              <button
                type="submit"
                className="text-xs px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
              >
                Lưu
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-zinc-200/80 bg-white/70 hover:bg-white dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300 shadow-xs transition-all cursor-pointer"
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
          )}
        </div>
      </div>
    </header>
  );
}
