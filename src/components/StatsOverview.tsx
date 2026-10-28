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
      activeClass: "ring-1.5 ring-zinc-950 dark:ring-zinc-100 bg-white dark:bg-zinc-900 shadow-md",
    },
    {
      id: "available" as const,
      label: "Trống sẵn vào ngay",
      count: available,
      subText: "Sẵn sàng dắt khách",
      icon: CheckCircle2,
      color: "emerald",
      activeClass: "ring-1.5 ring-emerald-600 dark:ring-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-md",
    },
    {
      id: "holding" as const,
      label: "Đang giữ chỗ",
      count: holding,
      subText: "Sale đang hẹn khách",
      icon: Clock,
      color: "amber",
      activeClass: "ring-1.5 ring-amber-600 dark:ring-amber-400 bg-amber-50/50 dark:bg-amber-950/30 shadow-md",
    },
    {
      id: "soon_available" as const,
      label: "Sắp trống",
      count: soonAvailable,
      subText: "Trong vòng 15 ngày",
      icon: CalendarClock,
      color: "blue",
      activeClass: "ring-1.5 ring-sky-600 dark:ring-sky-400 bg-sky-50/50 dark:bg-sky-950/30 shadow-md",
    },
    {
      id: "deposited" as const,
      label: "Đã cọc / Đang ở",
      count: deposited,
      subText: "Tạm dừng dẫn khách",
      icon: BookmarkCheck,
      color: "purple",
      activeClass: "ring-1.5 ring-purple-600 dark:ring-purple-400 bg-purple-50/50 dark:bg-purple-950/30 shadow-md",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {cards.map((c) => {
        const Icon = c.icon;
        const isSelected = selectedStatus === c.id;

        return (
          <button
            key={c.id}
            onClick={() => onSelectStatus(c.id)}
            className={`text-left p-4 rounded-2xl border transition-all duration-300 cursor-pointer luxury-card-hover ${
              isSelected
                ? c.activeClass
                : "bg-white/80 dark:bg-zinc-900/60 border-zinc-200/80 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {c.label}
              </span>
              <Icon
                className={`w-4 h-4 ${
                  c.color === "emerald"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : c.color === "amber"
                    ? "text-amber-600 dark:text-amber-400"
                    : c.color === "blue"
                    ? "text-sky-600 dark:text-sky-400"
                    : c.color === "purple"
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-zinc-400"
                }`}
              />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold text-zinc-950 dark:text-white tracking-tight">
                {c.count}
              </span>
              <span className="text-[11px] text-zinc-400 truncate font-sans">
                {c.subText}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
