"use client";

import React from "react";
import { Building2, Zap, Phone, UserCheck, PlusCircle, Upload } from "lucide-react";

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
    <header className="sticky top-0 z-30 w-full border-b border-zinc-200 bg-white/85 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/85 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight">
                ROOMSALES<span className="text-emerald-600 dark:text-emerald-400">.PRO</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
                <Zap className="w-3 h-3 fill-emerald-500" /> Nội Bộ Sale
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
              Quỹ phòng TP.HCM • Tra cứu SĐT chủ hộ • 1-Click gửi khách
            </p>
          </div>
        </div>

        {/* Right Actions: Upload Button + Sale User Profile */}
        <div className="flex items-center gap-2.5">
          {/* Nút Upload / Đăng Quỹ Phòng Mới */}
          <button
            onClick={onOpenCreateRoom}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            title="Tải ảnh và nhập thông tin phòng mới vào hệ thống"
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            <span>+ Đăng Quỹ Phòng</span>
          </button>

          {/* Sale User Profile Quick Set */}
          {isEditing ? (
            <form onSubmit={handleSave} className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Tên Sale"
                className="text-xs px-2 py-1 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 w-24 outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
              <input
                type="text"
                value={tempPhone}
                onChange={(e) => setTempPhone(e.target.value)}
                placeholder="SĐT"
                className="text-xs px-2 py-1 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 w-24 outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
              <button
                type="submit"
                className="text-xs px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded transition-colors"
              >
                Lưu
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-xs font-medium text-zinc-700 dark:text-zinc-300 shadow-sm transition-all"
              title="Thông tin của bạn (dùng khi bạn giữ chỗ hoặc copy gửi khách)"
            >
              <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div className="text-left hidden sm:block">
                <span className="font-semibold block text-zinc-900 dark:text-white leading-tight">
                  {saleUser.name}
                </span>
                <span className="text-[10px] text-zinc-500 block leading-tight">
                  {saleUser.phone} (Sửa)
                </span>
              </div>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
