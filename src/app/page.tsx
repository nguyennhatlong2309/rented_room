"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Room, FilterOptions } from "@/lib/types";
import { INITIAL_ROOMS } from "@/data/initialRooms";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Header } from "@/components/Header";
import { StatsOverview } from "@/components/StatsOverview";
import { FilterBar } from "@/components/FilterBar";
import { RoomCard } from "@/components/RoomCard";
import { HoldRoomModal } from "@/components/HoldRoomModal";
import { CreateRoomModal } from "@/components/CreateRoomModal";
import { useToast } from "@/components/Toast";
import { Sparkles, RefreshCw, AlertCircle, MapPin, Upload, Image as ImageIcon } from "lucide-react";

function SalesRentedRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const districtParam = searchParams.get("district");
  const wardParam = searchParams.get("ward");
  const { showToast } = useToast();

  const [isMounted, setIsMounted] = useState(false);

  // 1. Rooms state (TP.HCM only) - initialized consistently for SSR
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);

  // 2. Sale user profile
  const [saleUser, setSaleUser] = useState({ name: "Minh Tuấn (Sale)", phone: "0988.123.456" });

  // Banner image theme state
  const [bannerTheme, setBannerTheme] = useState<"penthouse" | "saigon">("penthouse");

  // Load client-side cached rooms & sale user after mounting to prevent SSR hydration mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem("roomsales_rooms_cache_hcm_v4");
      if (saved) {
        setRooms(JSON.parse(saved));
      }
      const savedUser = localStorage.getItem("roomsales_current_user");
      if (savedUser) {
        setSaleUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Error reading localStorage:", e);
    }
    setIsMounted(true);
  }, []);

  const handleUpdateSaleUser = (user: { name: string; phone: string }) => {
    setSaleUser(user);
    if (typeof window !== "undefined") {
      localStorage.setItem("roomsales_current_user", JSON.stringify(user));
    }
    showToast("Đã cập nhật thông tin cá nhân của bạn!", "success");
  };

  // Sync rooms state to local cache for persistence (only after initial load)
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem("roomsales_rooms_cache_hcm_v4", JSON.stringify(rooms));
    } catch (e) {
      console.error("Error saving to localStorage:", e);
    }
  }, [rooms, isMounted]);

  // 3. Optional Supabase Realtime Subscription
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;

    const fetchRooms = async () => {
      const { data, error } = await client.from("rooms").select("*");
      if (!error && data && data.length > 0) {
        setRooms(data as any);
      }
    };
    fetchRooms();

    const channel = client
      .channel("realtime:rooms")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms" },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const updated = payload.new as Room;
            setRooms((prev) =>
              prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r))
            );
            showToast(`Phòng ${updated.roomCode} vừa được cập nhật trạng thái!`, "info");
          } else if (payload.eventType === "INSERT") {
            const newRoom = payload.new as Room;
            setRooms((prev) => [newRoom, ...prev]);
            showToast(`Phòng mới ${newRoom.roomCode} vừa được thêm vào hệ thống!`, "success");
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [showToast]);

  // 4. Filters state with Multi-Select support
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: "",
    status: "all",
    districts: [],        // Mảng các quận được chọn tại TP.HCM (rỗng = tất cả TP.HCM)
    roomTypes: [],        // Mảng các kiểu phòng được chọn (rỗng = tất cả)
    priceBrackets: [],    // Mảng các khoảng giá được chọn (rỗng = tất cả)
    allowPet: false,
    hasBalcony: false,
    hasElevator: false,
    sortBy: "newest",
  });

  // Auto-apply district/ward from URL params (e.g. from breadcrumb click)
  useEffect(() => {
    if (districtParam) {
      setFilters((prev) => ({
        ...prev,
        districts: [districtParam],
        searchQuery: wardParam ? wardParam : prev.searchQuery,
      }));
    }
  }, [districtParam, wardParam]);

  const handleUpdateFilters = (updates: Partial<FilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: "",
      status: "all",
      districts: [],
      roomTypes: [],
      priceBrackets: [],
      allowPet: false,
      hasBalcony: false,
      hasElevator: false,
      sortBy: "newest",
    });
    showToast("Đã thiết lập lại toàn bộ bộ lọc!", "info");
  };

  // 5. Unique Districts list for filter dropdown (All in TP.HCM)
  const uniqueDistricts = useMemo(() => {
    const set = new Set(rooms.map((r) => r.district));
    return Array.from(set).sort();
  }, [rooms]);

  // 6. Blazing Fast Multi-Criteria Filtering (0ms latency, zero layout shift)
  const filteredRooms = useMemo(() => {
    const q = filters.searchQuery.trim().toLowerCase();

    return rooms
      .filter((room) => {
        // Status filter
        if (filters.status !== "all" && room.status !== filters.status) {
          return false;
        }

        // Multi-district filter (TP.HCM)
        if (
          filters.districts.length > 0 &&
          !filters.districts.includes(room.district)
        ) {
          return false;
        }

        // Multi-select Room Type filter (ví dụ: vừa gác vừa 1PN)
        if (
          filters.roomTypes.length > 0 &&
          !filters.roomTypes.includes(room.type)
        ) {
          return false;
        }

        // Multi-select Price Bracket filter (ví dụ: vừa dưới 6tr vừa 6-9tr)
        if (filters.priceBrackets.length > 0) {
          const matchAnyPriceBracket = filters.priceBrackets.some((bracket) => {
            if (bracket === "under_6") return room.price < 6_000_000;
            if (bracket === "6_to_9") return room.price >= 6_000_000 && room.price <= 9_000_000;
            if (bracket === "9_to_12") return room.price > 9_000_000 && room.price <= 12_000_000;
            if (bracket === "over_12") return room.price > 12_000_000;
            return false;
          });
          if (!matchAnyPriceBracket) return false;
        }

        // Feature toggles
        if (filters.allowPet && !room.allowPet) return false;
        if (filters.hasBalcony && !room.hasBalcony) return false;
        if (filters.hasElevator && !room.hasElevator) return false;

        // Instant text search
        if (q) {
          const matchCode = room.roomCode.toLowerCase().includes(q);
          const matchBuilding = room.buildingName.toLowerCase().includes(q);
          const matchAddress = room.address.toLowerCase().includes(q);
          const matchDistrict = room.district.toLowerCase().includes(q);
          const matchWard = room.ward?.toLowerCase().includes(q);
          const matchNotes = room.notesForSale?.toLowerCase().includes(q);
          const matchLandlord = room.landlord?.name?.toLowerCase().includes(q) || room.landlord?.phone?.includes(q);
          const matchFurniture = room.furniture.some((f) =>
            f.toLowerCase().includes(q)
          );

          if (
            !matchCode &&
            !matchBuilding &&
            !matchAddress &&
            !matchDistrict &&
            !matchWard &&
            !matchNotes &&
            !matchLandlord &&
            !matchFurniture
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === "price_asc") return a.price - b.price;
        if (filters.sortBy === "price_desc") return b.price - a.price;
        if (filters.sortBy === "area_desc") return b.area - a.area;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [rooms, filters]);

  // 7. Modals state
  const [selectedRoomForHold, setSelectedRoomForHold] = useState<Room | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 8. Upload / Create Room handler
  const handleCreateRoom = async (newRoom: Room) => {
    // Optimistic update to UI immediately
    setRooms((prev) => [newRoom, ...prev]);

    // If Supabase is connected, optionally insert
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("rooms").insert([newRoom]);
      } catch (err) {
        console.error("Supabase insert error:", err);
      }
    }
  };

  // 9. Hold Room action
  const handleConfirmHold = (
    roomId: string,
    holdData: {
      customerName: string;
      customerPhone: string;
      holdMinutes: number;
      notes: string;
    }
  ) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            status: "holding",
            notesForSale: `[ĐANG GIỮ CHỖ bởi ${saleUser.name} cho khách ${holdData.customerName} - ${holdData.customerPhone} (trong ${holdData.holdMinutes}p)]: ${holdData.notes || "Dẫn khách xem"}`,
          };
        }
        return r;
      })
    );
  };

  // 10. Release Hold action
  const handleReleaseHold = (roomId: string) => {
    setRooms((prev) =>
      prev.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            status: "available",
            notesForSale: r.notesForSale.replace(/\[ĐANG GIỮ CHỖ[^\]]*\]:? ?/, ""),
          };
        }
        return r;
      })
    );
    showToast("Đã mở lại trạng thái trống cho phòng!", "info");
  };

  // 11. Reset to default demo data action
  const handleResetData = () => {
    if (confirm("Bạn có muốn tải lại danh sách phòng TP.HCM mặc định không?")) {
      setRooms(INITIAL_ROOMS);
      if (typeof window !== "undefined") {
        localStorage.removeItem("roomsales_rooms_cache_hcm_v4");
      }
      showToast("Đã khôi phục danh sách phòng TP.HCM thành công!", "success");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#0E1218]">
      {/* Top App Header with Upload button */}
      <Header
        saleUser={saleUser}
        onUpdateSaleUser={handleUpdateSaleUser}
        onOpenCreateRoom={() => setIsCreateModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner Hero - Luxury Real Estate Full-Image Showcase */}
        <div className="relative overflow-hidden rounded-3xl min-h-[300px] sm:min-h-[340px] flex items-center p-5 sm:p-9 shadow-xl border border-zinc-200/80 dark:border-zinc-800">
          {/* Full-bleed high-res background image */}
          <div className="absolute inset-0 z-0">
            <img
              src={bannerTheme === "penthouse" ? "/banner-hero.jpg" : "/banner-saigon.jpg"}
              alt="Luxury Real Estate TP.HCM"
              className="w-full h-full object-cover object-center transition-all duration-700 ease-out"
            />
            {/* Subtle natural vignette - only slight darkening for text readability, avoiding heavy solid black */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
          </div>

          {/* Elegant Frosted Glass Content Box on the left */}
          <div className="relative z-10 max-w-xl p-6 sm:p-8 rounded-3xl bg-zinc-950/65 dark:bg-zinc-900/80 backdrop-blur-md border border-white/20 dark:border-amber-500/30 text-white shadow-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/40 font-sans">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Hệ Thống Quỹ Phòng Đội Sale • TP.HCM</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              Tra Cứu SĐT Chủ Hộ & Quỹ Phòng Tức Thì
            </h1>
            <p className="text-zinc-200 text-xs sm:text-sm leading-relaxed font-sans">
              Số điện thoại chủ nhà, pass cửa vân tay và hoa hồng sale. Nút bấm 1-chạm gọi trực tiếp cho chủ hộ hoặc tải ảnh và đăng quỹ phòng mới bất kỳ lúc nào.
            </p>
          </div>

          {/* Quick theme switcher on banner */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-[11px] text-zinc-200 shadow-lg">
            <ImageIcon className="w-3.5 h-3.5 text-amber-400 mr-0.5" />
            <button
              onClick={() => setBannerTheme("penthouse")}
              className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                bannerTheme === "penthouse"
                  ? "bg-amber-500 text-zinc-950 font-bold shadow-xs"
                  : "hover:text-white"
              }`}
            >
              Penthouse
            </button>
            <span className="text-zinc-500">|</span>
            <button
              onClick={() => setBannerTheme("saigon")}
              className={`px-2.5 py-0.5 rounded-lg transition-all cursor-pointer ${
                bannerTheme === "saigon"
                  ? "bg-amber-500 text-zinc-950 font-bold shadow-xs"
                  : "hover:text-white"
              }`}
            >
              Sài Gòn Đêm
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <StatsOverview
          rooms={rooms}
          selectedStatus={filters.status}
          onSelectStatus={(status) => handleUpdateFilters({ status })}
        />

        {/* Multi-Select Filter Bar (Zero Layout Shift) */}
        <FilterBar
          filters={filters}
          districts={uniqueDistricts}
          totalResults={filteredRooms.length}
          totalRooms={rooms.length}
          onUpdateFilters={handleUpdateFilters}
          onResetFilters={handleResetFilters}
        />

        {/* Room Grid */}
        {filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                saleUser={saleUser}
                onOpenDetail={(r) => router.push(`/rooms/${r.id}`)}
                onOpenHoldModal={(r) => setSelectedRoomForHold(r)}
                onReleaseHold={handleReleaseHold}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 space-y-3">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
              Không tìm thấy phòng nào phù hợp với các điều kiện đã chọn
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Bạn có thể bật thêm các quận lân cận hoặc chọn thêm khoảng giá để xem nhiều lựa chọn hơn.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Xóa bộ lọc</span>
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Đăng phòng mới</span>
              </button>
            </div>
          </div>
        )}

        {/* Bottom Utility Bar */}
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <div>
            Đang hiển thị {filteredRooms.length} / {rooms.length} phòng khả dụng tại TP.HCM.
          </div>
          <button
            onClick={handleResetData}
            className="hover:text-zinc-800 dark:hover:text-zinc-200 underline cursor-pointer"
          >
            Khôi phục danh sách phòng gốc
          </button>
        </div>
      </main>

      {/* Modals */}
      <HoldRoomModal
        room={selectedRoomForHold}
        saleUser={saleUser}
        onClose={() => setSelectedRoomForHold(null)}
        onConfirmHold={handleConfirmHold}
      />

      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateRoom={handleCreateRoom}
      />
    </div>
  );
}

export default function SalesRentedRoomPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Đang tải quỹ phòng...</p>
          </div>
        </div>
      }
    >
      <SalesRentedRoomContent />
    </Suspense>
  );
}
