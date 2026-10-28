"use client";

import React from "react";
import { FilterOptions, RoomType, PriceBracketKey } from "@/lib/types";
import {
  Search,
  X,
  ArrowUpDown,
  Dog,
  Sun,
  Building,
  Check,
  CheckSquare,
  Square,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";

interface FilterBarProps {
  filters: FilterOptions;
  districts: string[];
  totalResults: number;
  totalRooms: number;
  onUpdateFilters: (updates: Partial<FilterOptions>) => void;
  onResetFilters: () => void;
}

export function FilterBar({
  filters,
  districts,
  totalResults,
  totalRooms,
  onUpdateFilters,
  onResetFilters,
}: FilterBarProps) {
  // Danh sách các loại phòng
  const roomTypeOptions: { id: RoomType; label: string }[] = [
    { id: "studio", label: "Studio" },
    { id: "duplex", label: "Duplex (Gác lửng)" },
    { id: "1pn", label: "1 Phòng Ngủ (1PN)" },
    { id: "2pn", label: "2 Phòng Ngủ (2PN)" },
  ];

  // Danh sách các khoảng giá cho phép chọn nhiều khoảng cùng lúc
  const priceBracketOptions: { id: PriceBracketKey; label: string }[] = [
    { id: "under_6", label: "Dưới 6 triệu" },
    { id: "6_to_9", label: "6 - 9 triệu" },
    { id: "9_to_12", label: "9 - 12 triệu" },
    { id: "over_12", label: "Trên 12 triệu" },
  ];

  // Toggle chọn nhiều Quận/Huyện tại TP.HCM
  const toggleDistrict = (district: string) => {
    const current = filters.districts;
    if (current.includes(district)) {
      onUpdateFilters({ districts: current.filter((d) => d !== district) });
    } else {
      onUpdateFilters({ districts: [...current, district] });
    }
  };

  // Toggle chọn nhiều Loại phòng (ví dụ: vừa muốn phòng Gác, vừa muốn 1PN)
  const toggleRoomType = (type: RoomType) => {
    const current = filters.roomTypes;
    if (current.includes(type)) {
      onUpdateFilters({ roomTypes: current.filter((t) => t !== type) });
    } else {
      onUpdateFilters({ roomTypes: [...current, type] });
    }
  };

  // Toggle chọn nhiều Khoảng giá (ví dụ: vừa dưới 6tr, vừa 6-9tr)
  const togglePriceBracket = (bracket: PriceBracketKey) => {
    const current = filters.priceBrackets;
    if (current.includes(bracket)) {
      onUpdateFilters({ priceBrackets: current.filter((b) => b !== bracket) });
    } else {
      onUpdateFilters({ priceBrackets: [...current, bracket] });
    }
  };

  const hasActiveFilters =
    filters.searchQuery !== "" ||
    filters.districts.length > 0 ||
    filters.roomTypes.length > 0 ||
    filters.priceBrackets.length > 0 ||
    filters.allowPet ||
    filters.hasBalcony ||
    filters.hasElevator;

  return (
    <div className="luxury-glass rounded-3xl p-6 shadow-xs space-y-4 transition-all">
      {/* HÀNG 1: Ô TÌM KIẾM NHANH + SẮP XẾP */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="relative md:col-span-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onUpdateFilters({ searchQuery: e.target.value })}
            placeholder="Tìm nhanh theo mã phòng (P.302), tên toà nhà, đường, tiện ích..."
            className="w-full pl-11 pr-10 py-3 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1.5 focus:ring-amber-500/60 transition-all font-sans"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onUpdateFilters({ searchQuery: "" })}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="relative md:col-span-4">
          <select
            value={filters.sortBy}
            onChange={(e) => onUpdateFilters({ sortBy: e.target.value as any })}
            className="w-full px-4 py-3 appearance-none bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1.5 focus:ring-amber-500/60 pr-9 cursor-pointer font-medium font-sans"
          >
            <option value="newest">⚡ Mới cập nhật</option>
            <option value="price_asc">💰 Giá thuê: Thấp đến Cao</option>
            <option value="price_desc">💰 Giá thuê: Cao đến Thấp</option>
            <option value="area_desc">📐 Diện tích: Lớn nhất</option>
          </select>
          <ArrowUpDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        </div>
      </div>

      {/* HÀNG 2: CHỌN NHIỀU QUẬN TẠI TP.HCM */}
      <div className="space-y-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 font-sans">
            <Building className="w-3.5 h-3.5 text-amber-500" />
            <span>Khu vực tại TP.HCM (Chọn một hoặc nhiều quận)</span>
          </span>
          {filters.districts.length > 0 && (
            <button
              onClick={() => onUpdateFilters({ districts: [] })}
              className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-medium cursor-pointer"
            >
              Chọn tất cả TP.HCM
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => onUpdateFilters({ districts: [] })}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filters.districts.length === 0
                ? "bg-zinc-950 text-white dark:bg-amber-500 dark:text-zinc-950 font-bold shadow-sm shadow-amber-500/20"
                : "bg-white/60 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700/80"
            }`}
          >
            Toàn bộ TP.HCM
          </button>
          {districts.map((d) => {
            const isSelected = filters.districts.includes(d);
            return (
              <button
                key={d}
                onClick={() => toggleDistrict(d)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? "bg-zinc-900 text-white dark:bg-amber-500 dark:text-zinc-950 font-bold shadow-sm shadow-amber-500/20"
                    : "bg-white/60 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700/80"
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5] text-amber-400 dark:text-zinc-950" />}
                <span>{d}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* HÀNG 3: BỘ LỌC ĐA TIÊU CHÍ (LOẠI PHÒNG + KHOẢNG GIÁ) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
        {/* Cột Trái: Loại phòng (Chọn nhiều option cùng lúc) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest font-sans">
              Kiểu phòng (Chọn nhiều loại)
            </span>
            {filters.roomTypes.length > 0 && (
              <button
                onClick={() => onUpdateFilters({ roomTypes: [] })}
                className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                Tất cả kiểu
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {roomTypeOptions.map((opt) => {
              const isSelected = filters.roomTypes.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleRoomType(opt.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-zinc-900 text-white dark:bg-amber-500 dark:text-zinc-950 font-bold shadow-sm shadow-amber-500/20"
                      : "bg-white/60 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700/80"
                  }`}
                >
                  {isSelected ? (
                    <CheckSquare className="w-3.5 h-3.5 text-amber-400 dark:text-zinc-950" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cột Phải: Khoảng giá (Chọn nhiều khoảng cùng lúc: vừa <6tr vừa 6-9tr) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest font-sans">
              Khoảng giá thuê (Chọn nhiều mức)
            </span>
            {filters.priceBrackets.length > 0 && (
              <button
                onClick={() => onUpdateFilters({ priceBrackets: [] })}
                className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                Mọi mức giá
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {priceBracketOptions.map((opt) => {
              const isSelected = filters.priceBrackets.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => togglePriceBracket(opt.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-amber-600 dark:bg-amber-500 text-white dark:text-zinc-950 font-bold shadow-sm shadow-amber-500/20"
                      : "bg-white/60 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-700/80"
                  }`}
                >
                  {isSelected ? (
                    <CheckSquare className="w-3.5 h-3.5 text-white dark:text-zinc-950" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-zinc-400" />
                  )}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* HÀNG 4: TIỆN ÍCH BỔ SUNG CỐ ĐỊNH + KẾT QUẢ */}
      <div className="pt-3 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-wrap items-center justify-between gap-3">
        {/* Các toggle tiện ích đặc thù */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mr-1 hidden sm:inline font-sans">
            Tiêu chuẩn:
          </span>

          {/* Nuôi thú cưng */}
          <button
            onClick={() => onUpdateFilters({ allowPet: !filters.allowPet })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              filters.allowPet
                ? "bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-300 shadow-xs"
                : "border-zinc-200/70 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800"
            }`}
          >
            <Dog className="w-3.5 h-3.5 text-amber-500" />
            <span>Cho nuôi Pet</span>
            {filters.allowPet && <Check className="w-3 h-3 text-amber-600" />}
          </button>

          {/* Ban công thoáng mát */}
          <button
            onClick={() => onUpdateFilters({ hasBalcony: !filters.hasBalcony })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              filters.hasBalcony
                ? "bg-sky-500/15 border-sky-500/40 text-sky-800 dark:text-sky-300 shadow-xs"
                : "border-zinc-200/70 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800"
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-sky-500" />
            <span>Có Ban công</span>
            {filters.hasBalcony && <Check className="w-3 h-3 text-sky-600" />}
          </button>

          {/* Thang máy */}
          <button
            onClick={() => onUpdateFilters({ hasElevator: !filters.hasElevator })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              filters.hasElevator
                ? "bg-purple-500/15 border-purple-500/40 text-purple-800 dark:text-purple-300 shadow-xs"
                : "border-zinc-200/70 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800"
            }`}
          >
            <Building className="w-3.5 h-3.5 text-purple-500" />
            <span>Có Thang máy</span>
            {filters.hasElevator && <Check className="w-3 h-3 text-purple-600" />}
          </button>
        </div>

        {/* Cụm đếm kết quả và Xóa lọc */}
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Xóa lọc</span>
            </button>
          )}

          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 pl-3 border-l border-zinc-200 dark:border-zinc-800">
            Hiển thị{" "}
            <strong className="font-serif text-base text-amber-600 dark:text-amber-400 font-bold">
              {totalResults}
            </strong>{" "}
            / {totalRooms} phòng
          </div>
        </div>
      </div>
    </div>
  );
}
