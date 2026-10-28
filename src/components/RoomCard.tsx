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
  Copy,
  Check,
  Lock,
  Unlock,
  MapPin,
  Sparkles,
  Phone,
  MessageCircle,
  Key,
  Dog,
  Sun,
  ShieldAlert,
} from "lucide-react";

interface RoomCardProps {
  room: Room;
  saleUser: { name: string; phone: string };
  onOpenDetail: (room: Room) => void;
  onOpenHoldModal: (room: Room) => void;
  onReleaseHold: (roomId: string) => void;
}

export function RoomCard({
  room,
  saleUser,
  onOpenDetail,
  onOpenHoldModal,
  onReleaseHold,
}: RoomCardProps) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const statusInfo = ROOM_STATUS_MAP[room.status];

  const handleCopyZalo = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = generateClientShareMessage(room, saleUser);
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      showToast(`Đã copy tin nhắn Zalo phòng ${room.roomCode} thành công!`, "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Không thể sao chép, vui lòng thử lại!", "error");
    }
  };

  const cleanLandlordPhone = room.landlord?.phone ? room.landlord.phone.replace(/\D/g, "") : "";

  return (
    <div
      onClick={() => onOpenDetail(room)}
      className="luxury-glass luxury-card-hover group relative rounded-3xl overflow-hidden cursor-pointer flex flex-col justify-between border border-zinc-200/80 dark:border-zinc-800/80"
    >
      {/* Top Media & Badges */}
      <div>
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <img
            src={room.images[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"}
            alt={`Phòng ${room.roomCode} - ${room.buildingName}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/30 pointer-events-none" />

          {/* Top-left: Room Code & Floor */}
          <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5">
            <span className="font-serif px-3 py-1 rounded-xl text-xs font-bold bg-black/85 backdrop-blur-md text-amber-300 border border-amber-500/30 tracking-widest uppercase shadow-sm">
              {room.roomCode}
            </span>
            <span className="px-2.5 py-1 rounded-xl text-[10px] font-semibold uppercase tracking-wider bg-black/50 backdrop-blur-md text-zinc-300 border border-white/10">
              Tầng {room.floor}
            </span>
          </div>

          {/* Top-right: Status Badge */}
          <div className="absolute top-3.5 right-3.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm ${statusInfo.bg} ${statusInfo.text} border ${statusInfo.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
              {statusInfo.label}
              {room.status === "soon_available" && room.availableDate && (
                <span className="text-[10px] opacity-90">({room.availableDate})</span>
              )}
            </span>
          </div>

          {/* Bottom-left: Building Name & Address */}
          <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white">
            <h3 className="font-serif font-bold text-base md:text-lg leading-snug drop-shadow-sm truncate tracking-wide">
              {room.buildingName}
            </h3>
            <p className="text-xs text-zinc-300 flex items-center gap-1 drop-shadow-sm truncate font-sans">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              {room.address}, {room.ward ? room.ward + ", " : ""}{room.district}
            </p>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-4 space-y-3.5">
          {/* Price & Commission Row */}
          <div className="flex items-baseline justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-800/60 pb-3">
            <div>
              <span className="font-serif text-2xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight">
                {formatVND(room.price)}
              </span>
              <span className="text-xs text-zinc-500 font-sans ml-1">/tháng</span>
            </div>

            {/* Commission Tag for Sale */}
            <div
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/25 tracking-wide"
              title="Hoa hồng nhận được khi sale chốt phòng này"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="truncate max-w-[130px] font-sans">{room.commission}</span>
            </div>
          </div>

          {/* Specifications Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 font-sans">
            <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 font-medium">
              {ROOM_TYPE_MAP[room.type]}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 font-medium">
              {room.area}m²
            </span>
            {room.hasBalcony && (
              <span className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200/70 dark:border-sky-800/60 flex items-center gap-1">
                <Sun className="w-3 h-3" /> Ban công
              </span>
            )}
            {room.allowPet && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60 flex items-center gap-1">
                <Dog className="w-3 h-3" /> Nuôi Pet
              </span>
            )}
          </div>

          {/* THÔNG TIN CHỦ HỘ / QUẢN LÝ (NỘI BỘ CHO SALE) */}
          {room.landlord && (
            <div
              className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50 space-y-2"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between text-xs font-sans">
                <span className="font-semibold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{room.landlord.name}:</span>
                </span>
                <span className="font-bold text-amber-800 dark:text-amber-300 tracking-wider">
                  {room.landlord.phone}
                </span>
              </div>

              {/* Nút Gọi & Zalo Chủ Hộ Trực Tiếp */}
              <div className="flex items-center gap-2 pt-0.5">
                <a
                  href={`tel:${cleanLandlordPhone}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl text-[11px] font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <Phone className="w-3 h-3" />
                  <span>Gọi Chủ Hộ</span>
                </a>
                <a
                  href={`https://zalo.me/${cleanLandlordPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>Zalo Chủ</span>
                </a>
              </div>

              {/* Pass cửa / Lưu ý dẫn khách */}
              {room.landlord.doorPassword && (
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-600 dark:text-zinc-400 pt-1 border-t border-amber-200/60 dark:border-amber-800/40 font-sans">
                  <Key className="w-3 h-3 text-amber-600 shrink-0" />
                  <span className="truncate">{room.landlord.doorPassword}</span>
                </div>
              )}
            </div>
          )}

          {/* Ghi chú sale */}
          {room.notesForSale && (
            <div className="p-2.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 font-sans">
              <strong className="text-zinc-900 dark:text-zinc-200 font-semibold">Ghi chú:</strong>{" "}
              {room.notesForSale}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="p-4 pt-0 grid grid-cols-2 gap-2.5" onClick={(e) => e.stopPropagation()}>
        {/* 1-Click Copy Zalo Message */}
        <button
          onClick={handleCopyZalo}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
            copied
              ? "bg-amber-600 text-white shadow-sm"
              : "bg-amber-500/10 text-amber-900 dark:text-amber-200 hover:bg-amber-500/20 border border-amber-500/30"
          }`}
          title="Sao chép nội dung soạn sẵn để paste Zalo/Facebook gửi khách ngay lập tức"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Đã copy Zalo" : "1-Click Copy Zalo"}</span>
        </button>

        {/* Hold or Release button */}
        {room.status === "holding" ? (
          <button
            onClick={() => onReleaseHold(room.id)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-300 dark:border-amber-800 transition-colors cursor-pointer"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Hủy giữ chỗ</span>
          </button>
        ) : (
          <button
            onClick={() => onOpenHoldModal(room)}
            disabled={room.status === "occupied" || room.status === "deposited"}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-white hover:bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Giữ chỗ khách</span>
          </button>
        )}
      </div>
    </div>
  );
}
