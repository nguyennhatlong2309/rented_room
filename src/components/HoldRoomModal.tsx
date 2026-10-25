"use client";

import React, { useState } from "react";
import { Room } from "@/lib/types";
import { useToast } from "./Toast";
import { X, Lock, Clock, User, Phone, FileText } from "lucide-react";

interface HoldRoomModalProps {
  room: Room | null;
  saleUser: { name: string; phone: string };
  onClose: () => void;
  onConfirmHold: (roomId: string, holdData: {
    customerName: string;
    customerPhone: string;
    holdMinutes: number;
    notes: string;
  }) => void;
}

export function HoldRoomModal({
  room,
  saleUser,
  onClose,
  onConfirmHold,
}: HoldRoomModalProps) {
  const { showToast } = useToast();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [holdMinutes, setHoldMinutes] = useState(30);
  const [notes, setNotes] = useState("");

  if (!room) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      showToast("Vui lòng điền đủ thông tin khách hàng!", "error");
      return;
    }

    onConfirmHold(room.id, {
      customerName,
      customerPhone,
      holdMinutes,
      notes,
    });

    showToast(`Đã giữ chỗ phòng ${room.roomCode} trong ${holdMinutes} phút!`, "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Giữ Chỗ Dẫn Khách: Phòng {room.roomCode}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {room.buildingName} - {room.district}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300">
            <strong>Lưu ý:</strong> Khi bạn giữ chỗ, phòng sẽ chuyển sang trạng thái <strong>ĐANG GIỮ CHỖ</strong> để các bạn sale khác không dẫn trùng khách. Hết thời gian giữ chỗ, hệ thống sẽ tự động mở lại trạng thái trống.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Sale thực hiện
              </label>
              <input
                type="text"
                disabled
                value={`${saleUser.name} (${saleUser.phone})`}
                className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Thời gian giữ phòng
              </label>
              <select
                value={holdMinutes}
                onChange={(e) => setHoldMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value={15}>15 phút (Khách sắp đến)</option>
                <option value={30}>30 phút (Tiêu chuẩn)</option>
                <option value={45}>45 phút</option>
                <option value={60}>60 phút (Tối đa)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Họ tên khách hàng *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="VD: Anh Hoàng Anh / Chị Linh"
                className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Số điện thoại khách hàng *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="VD: 0912 345 678"
                className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Ghi chú thêm
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="VD: Khách đang di chuyển từ Q1 qua, hẹn 18h gặp ở sảnh..."
                className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 transition-all flex items-center gap-1.5"
            >
              <Lock className="w-4 h-4" />
              <span>Xác Nhận Giữ Phòng</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
