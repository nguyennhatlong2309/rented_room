"use client";

import React from "react";
import { Room, RoomStatus } from "@/lib/types";
import { CheckCircle2, Clock, CalendarClock, Building, BookmarkCheck } from "lucide-react";

interface StatsOverviewProps {
  rooms: Room[];
  selectedStatus: RoomStatus | "all";
  onSelectStatus: (status: RoomStatus | "all") => void;
}

export function StatsOverview({ rooms, selectedStatus, onSelectStatus }: StatsOverviewProps) {
  const total = rooms.length;
  const available = rooms.filter((r) => r.status === "available").length;
  const holding = rooms.filter((r) => r.status === "holding").length;
  const soonAvailable = rooms.filter((r) => r.status === "soon_available").length;
  const deposited = rooms.filter((r) => r.status === "deposited" || r.status === "occupied").length;

  const cards = [
    {
      id: "all" as const,
      label: "Tất cả phòng",
      count: total,
      subText: "Toàn bộ quỹ phòng",
      icon: Building,
      color: "zinc",
      activeClass: "ring-2 ring-zinc-900 dark:ring-zinc-100 bg-zinc-50 dark:bg-zinc-900",
    },
    {
      id: "available" as const,
      label: "Trống sẵn vào ngay",
      count: available,
      subText: "Sẵn sàng dắt khách",
      icon: CheckCircle2,
      color: "emerald",
      activeClass: "ring-2 ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20",
    },
    {
      id: "holding" as const,
      label: "Đang giữ chỗ",
      count: holding,
      subText: "Sale đang hẹn khách",
      icon: Clock,
      color: "amber",
      activeClass: "ring-2 ring-amber-500 bg-amber-50/50 dark:bg-amber-950/20",
    },
    {
      id: "soon_available" as const,
      label: "Sắp trống",
      count: soonAvailable,
      subText: "Trong vòng 15 ngày",
      icon: CalendarClock,
      color: "blue",
      activeClass: "ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20",
    },
    {
      id: "deposited" as const,
      label: "Đã cọc / Đang ở",
      count: deposited,
      subText: "Tạm dừng dẫn khách",
      icon: BookmarkCheck,
      color: "purple",
      activeClass: "ring-2 ring-purple-500 bg-purple-50/50 dark:bg-purple-950/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        const isSelected = selectedStatus === c.id;

        return (
          <button
            key={c.id}
            onClick={() => onSelectStatus(c.id)}
            className={`text-left p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer ${
              isSelected
                ? c.activeClass
                : "bg-white border-zinc-200 hover:border-zinc-300 dark:bg-zinc-900/60 dark:border-zinc-800 dark:hover:border-zinc-700 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {c.label}
              </span>
              <Icon
                className={`w-4 h-4 ${
                  c.color === "emerald"
                    ? "text-emerald-500"
                    : c.color === "amber"
                    ? "text-amber-500"
                    : c.color === "blue"
                    ? "text-blue-500"
                    : c.color === "purple"
                    ? "text-purple-500"
                    : "text-zinc-400"
                }`}
              />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
                {c.count}
              </span>
              <span className="text-[11px] text-zinc-400 truncate">
                {c.subText}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
