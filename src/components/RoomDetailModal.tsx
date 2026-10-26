"use client";

import React, { useState } from "react";
import { Room } from "@/lib/types";
import {
  formatVND,
  ROOM_STATUS_MAP,
  ROOM_TYPE_MAP,
  generateClientShareMessage,
} from "@/lib/utils";
import { useToast } from "./Toast";
import {
  X,
  Copy,
  Check,
  Lock,
  Phone,
  MessageCircle,
  Sparkles,
  MapPin,
  CheckCircle,
  Zap,
  Droplets,
  Wifi,
  Car,
  Key,
  Dog,
  Sun,
  ShieldAlert,
} from "lucide-react";

interface RoomDetailModalProps {
  room: Room | null;
  saleUser: { name: string; phone: string };
  onClose: () => void;
  onOpenHoldModal: (room: Room) => void;
}

export function RoomDetailModal({
  room,
  saleUser,
  onClose,
  onOpenHoldModal,
}: RoomDetailModalProps) {
  const { showToast } = useToast();
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!room) return null;

  const statusInfo = ROOM_STATUS_MAP[room.status];
  const cleanLandlordPhone = room.landlord?.phone ? room.landlord.phone.replace(/\D/g, "") : "";

  const handleCopyZalo = async () => {
    const message = generateClientShareMessage(room, saleUser);
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      showToast(`Đã copy toàn bộ thông tin phòng ${room.roomCode} để gửi khách!`, "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Không thể sao chép!", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl text-base font-extrabold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 tracking-wider">
              {room.roomCode}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                  {room.buildingName}
                </h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.text} border ${statusInfo.border}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                {room.address}, {room.ward ? room.ward + ", " : ""}{room.district} (Tầng {room.floor})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* THÔNG TIN CHỦ HỘ / QUẢN LÝ (DÀNH RIÊNG CHO SALE) */}
          {room.landlord && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-500/30 dark:border-amber-500/40 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block">
                    Thông tin liên hệ Chủ Hộ / Quản Lý (Nội bộ Sale)
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-base font-black text-zinc-900 dark:text-white">
                      {room.landlord.name}
                    </span>
                    <span className="text-base font-extrabold text-amber-700 dark:text-amber-400">
                      {room.landlord.phone}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${cleanLandlordPhone}`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Gọi Chủ Ngay</span>
                  </a>
                  <a
                    href={`https://zalo.me/${cleanLandlordPhone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Nhắn Zalo Chủ</span>
                  </a>
                </div>
              </div>

              {/* Pass cửa & Lưu ý */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-amber-500/20 text-xs">
                {room.landlord.doorPassword && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white/70 dark:bg-zinc-850/80 border border-amber-300/40 text-amber-900 dark:text-amber-200">
                    <Key className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-semibold">{room.landlord.doorPassword}</span>
                  </div>
                )}
                {room.landlord.callNotice && (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white/70 dark:bg-zinc-850/80 border border-amber-300/40 text-amber-900 dark:text-amber-200">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{room.landlord.callNotice}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
              <img
                src={room.images[selectedImgIndex] || room.images[0]}
                alt={`Phòng ${room.roomCode}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg text-xs font-semibold bg-black/60 text-white backdrop-blur-md">
                Ảnh {selectedImgIndex + 1} / {room.images.length}
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {room.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImgIndex(idx)}
                  className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    selectedImgIndex === idx
                      ? "border-emerald-500 scale-105 shadow-md"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Pricing & Commission Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60">
              <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300 block mb-1">
                Giá thuê niêm yết
              </span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                {formatVND(room.price)}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-500 block mt-0.5">
                Cọc {formatVND(room.deposit)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Hoa hồng Sale</span>
              </div>
              <span className="text-lg font-black text-amber-700 dark:text-amber-300 block">
                {room.commission}
              </span>
              <span className="text-xs text-amber-600 dark:text-amber-400 block mt-0.5">
                Thanh toán sau khi khách vào
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 block mb-1">
                Quy mô & Loại phòng
              </span>
              <span className="text-base font-bold text-zinc-900 dark:text-white block">
                {ROOM_TYPE_MAP[room.type]} - {room.area}m²
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 block mt-0.5">
                Tối đa {room.maxTenants} người ở
              </span>
            </div>
          </div>

          {/* Service Fees Table */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Bảng Phí Dịch Vụ Hàng Tháng
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Điện sinh hoạt</span>
                </div>
                <span className="text-sm font-bold text-zinc-900 dark:text-white">
                  {room.serviceFees.electricity}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" />
                  <span>Nước sinh hoạt</span>
                </div>
                <span className="text-sm font-bold text-zinc-900 dark:text-white">
                  {room.serviceFees.water}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1">
                  <Car className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Gửi xe máy</span>
                </div>
                <span className="text-sm font-bold text-zinc-900 dark:text-white">
                  {room.serviceFees.parking}
                </span>
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1">
                  <Wifi className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Wifi Internet</span>
                </div>
                <span className="text-sm font-bold text-zinc-900 dark:text-white">
                  {room.serviceFees.internet}
                </span>
              </div>
            </div>
            {room.serviceFees.serviceFee && (
              <p className="text-xs text-zinc-500 italic">
                * Phí dịch vụ toà nhà: {room.serviceFees.serviceFee}
              </p>
            )}
          </div>

          {/* Furniture Checklist */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Nội Thất & Trang Thiết Bị Bàn Giao
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {room.furniture.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 text-xs font-medium text-zinc-700 dark:text-zinc-300"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ghi chú sale */}
          {room.notesForSale && (
            <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs">
              <span className="font-bold text-zinc-900 dark:text-white block mb-1">
                Lưu ý chiến lược cho Sale khi chốt khách:
              </span>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{room.notesForSale}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-zinc-50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyZalo}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Đã copy tin nhắn Zalo" : "1-Click Copy Gửi Khách"}</span>
            </button>

            {room.status !== "occupied" && room.status !== "deposited" && (
              <button
                onClick={() => {
                  onClose();
                  onOpenHoldModal(room);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>Giữ Chỗ Dẫn Khách (30p)</span>
              </button>
            )}
          </div>

          {room.landlord && (
            <a
              href={`tel:${cleanLandlordPhone}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-700 hover:text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800"
            >
              <Phone className="w-4 h-4" />
              <span>Gọi {room.landlord.name}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
