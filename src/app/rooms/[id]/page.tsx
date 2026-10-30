"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Room } from "@/lib/types";
import { INITIAL_ROOMS } from "@/data/initialRooms";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  safeSetLocalStorage,
  CURRENT_ROOMS_CACHE_KEY,
} from "@/lib/storageUtils";
import {
  formatVND,
  formatPriceNumber,
  ROOM_STATUS_MAP,
  ROOM_TYPE_MAP,
  generateClientShareMessage,
} from "@/lib/utils";
import { Header } from "@/components/Header";
import { RoomCard } from "@/components/RoomCard";
import { HoldRoomModal } from "@/components/HoldRoomModal";
import { CreateRoomModal } from "@/components/CreateRoomModal";
import { useToast } from "@/components/Toast";
import {
  Home,
  ArrowLeft,
  MapPin,
  Sparkles,
  Phone,
  MessageCircle,
  Key,
  Dog,
  Sun,
  Building,
  Check,
  Copy,
  Lock,
  Unlock,
  Zap,
  Droplets,
  Wifi,
  Car,
  Armchair,
  CheckCircle2,
  Calendar,
  Layers,
  AlertCircle,
  Share2,
  Navigation,
} from "lucide-react";

function RoomDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const roomId = params.id as string;

  const [isMounted, setIsMounted] = useState(false);
  const [isLoadingRemote, setIsLoadingRemote] = useState(false);

  // 1. Rooms state (synced with localStorage safely after mount)
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);

  // 2. Sale user profile
  const [saleUser, setSaleUser] = useState({ name: "Minh Tuấn (Sale)", phone: "0988.123.456" });

  // Modal states
  const [selectedRoomForHold, setSelectedRoomForHold] = useState<Room | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // Load client-side cached rooms & sale user after mounting to avoid hydration mismatch
  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(CURRENT_ROOMS_CACHE_KEY) ||
        localStorage.getItem("roomsales_rooms_cache_hcm_v4");
      if (saved) {
        const parsed: Room[] = JSON.parse(saved);
        // Tự động bù đắp tọa độ GPS chính xác nếu cache cũ bị thiếu lat/lng
        const merged = parsed.map((r) => {
          const init = INITIAL_ROOMS.find((i) => i.id === r.id);
          if (init && (!r.lat || !r.lng || r.lat !== init.lat || r.lng !== init.lng)) {
            return { ...r, lat: init.lat, lng: init.lng };
          }
          return r;
        });
        setRooms(merged);
        safeSetLocalStorage(CURRENT_ROOMS_CACHE_KEY, merged);
      } else {
        safeSetLocalStorage(CURRENT_ROOMS_CACHE_KEY, INITIAL_ROOMS);
      }

      const savedUser = localStorage.getItem("roomsales_current_user");
      if (savedUser) {
        setSaleUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.warn("Error reading localStorage:", e);
    }
    setIsMounted(true);
  }, []);

  // Remote fetch fallback from Supabase if room not found in local cache
  useEffect(() => {
    if (!isMounted || !isSupabaseConfigured || !supabase || !roomId) return;
    const existsLocally = rooms.some((r) => r.id === roomId);
    if (existsLocally) return;

    const client = supabase;
    let isSubscribed = true;
    setIsLoadingRemote(true);

    const fetchSingleRoom = async () => {
      try {
        const { data, error } = await client
          .from("rooms")
          .select("*")
          .eq("id", roomId)
          .maybeSingle();

        if (!error && data && isSubscribed) {
          setRooms((prev) => {
            const exists = prev.some((r) => r.id === data.id);
            if (exists) {
              return prev.map((r) => (r.id === data.id ? { ...r, ...data } : r));
            }
            return [data as Room, ...prev];
          });
        }
      } catch (err: unknown) {
        console.warn("Error fetching room from Supabase:", err);
      } finally {
        if (isSubscribed) {
          setIsLoadingRemote(false);
        }
      }
    };

    fetchSingleRoom();

    return () => {
      isSubscribed = false;
    };
  }, [roomId, isMounted, rooms]);

  // Reset image and scroll to top on roomId switch
  useEffect(() => {
    setSelectedImgIndex(0);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [roomId]);

  // Sync rooms state to local cache for persistence (only after initial load to avoid overwriting)
  useEffect(() => {
    if (!isMounted) return;
    safeSetLocalStorage(CURRENT_ROOMS_CACHE_KEY, rooms);
  }, [rooms, isMounted]);

  // Current Room
  const currentRoom = useMemo(() => {
    return rooms.find((r) => r.id === roomId) || null;
  }, [rooms, roomId]);

  // Related Rooms: cùng quận, sêm giá (tầm giá gần nhất)
  const relatedRooms = useMemo(() => {
    if (!currentRoom) return [];

    return rooms
      .filter((r) => r.id !== currentRoom.id)
      .map((r) => {
        let score = 0;
        // Điểm ưu tiên cao nhất: cùng quận (100 điểm)
        if (r.district.toLowerCase() === currentRoom.district.toLowerCase()) {
          score += 100;
        }
        // Điểm ưu tiên: cùng kiểu phòng (20 điểm)
        if (r.type === currentRoom.type) {
          score += 20;
        }
        // Điểm ưu tiên: sêm giá (giá chênh lệch càng ít điểm càng cao, tối đa 50 điểm)
        const priceDiff = Math.abs(r.price - currentRoom.price);
        const priceScore = Math.max(0, 50 - (priceDiff / 100000) * 1.5);
        score += priceScore;

        return { room: r, score, priceDiff };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((item) => item.room);
  }, [currentRoom, rooms]);

  const handleUpdateSaleUser = (user: { name: string; phone: string }) => {
    setSaleUser(user);
    safeSetLocalStorage("roomsales_current_user", user);
    showToast("Đã cập nhật thông tin cá nhân của bạn!", "success");
  };

  const handleCreateRoom = async (newRoom: Room) => {
    setRooms((prev) => [newRoom, ...prev]);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("rooms").insert([newRoom]);
      } catch (err) {
        console.error("Supabase insert error:", err);
      }
    }
  };

  const handleConfirmHold = (
    targetRoomId: string,
    holdData: {
      customerName: string;
      customerPhone: string;
      holdMinutes: number;
      notes: string;
    }
  ) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === targetRoomId
          ? {
              ...r,
              status: "holding",
              holdInfo: {
                ...holdData,
                saleName: saleUser.name,
                salePhone: saleUser.phone,
                holdUntil: new Date(Date.now() + holdData.holdMinutes * 60000).toISOString(),
              },
            }
          : r
      )
    );
    showToast(`Đã giữ chỗ phòng thành công!`, "success");
  };

  const handleReleaseHold = (targetRoomId: string) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === targetRoomId
          ? {
              ...r,
              status: "available",
              holdInfo: undefined,
            }
          : r
      )
    );
    showToast("Đã mở lại trạng thái trống cho phòng!", "info");
  };

  const handleCopyZalo = async () => {
    if (!currentRoom) return;
    const message = generateClientShareMessage(currentRoom, saleUser);
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      showToast(`Đã copy nội dung Zalo phòng ${currentRoom.roomCode} thành công!`, "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Không thể sao chép!", "error");
    }
  };

  // Guard while mounting to prevent SSR / Client hydration mismatch
  if (!isMounted || isLoadingRemote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBFA] dark:bg-[#0E1218]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Đang tải dữ liệu căn hộ...</p>
        </div>
      </div>
    );
  }

  // If Room Not Found (only after mounted and localStorage is read)
  if (!currentRoom) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBFBFA] dark:bg-[#0E1218]">
        <Header
          saleUser={saleUser}
          onUpdateSaleUser={handleUpdateSaleUser}
          onOpenCreateRoom={() => setIsCreateModalOpen(true)}
        />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-zinc-900 dark:text-white">
            Không tìm thấy thông tin phòng
          </h1>
          <p className="text-zinc-500 text-sm">
            Phòng này có thể đã được gỡ hoặc mã đường dẫn không chính xác.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-semibold text-xs transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại trang danh sách phòng</span>
          </Link>
        </main>
        <CreateRoomModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreateRoom={handleCreateRoom}
        />
      </div>
    );
  }

  const mapEmbedUrl = useMemo(() => {
    if (!currentRoom) return "";
    // Làm sạch địa chỉ tối ưu cho Google Maps Embed:
    // Tránh ghép tên Phường vào query vì cơ sở dữ liệu Google Maps tại Việt Nam thường lập chỉ mục phường không đồng bộ
    // (Ví dụ: Lê Văn Duyệt được index theo địa danh Gia Định, nếu kèm "Phường 3" hoặc "Phường 1" Google Maps sẽ xung đột và không hiện ghim).
    const cleanAddr = currentRoom.address.trim();
    const query = `${cleanAddr}, ${currentRoom.district}, TP.HCM`;
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }, [currentRoom]);

  const mapSearchUrl = useMemo(() => {
    if (!currentRoom) return "";
    const cleanAddr = currentRoom.address.trim();
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${cleanAddr}, ${currentRoom.district}, TP.HCM`
    )}`;
  }, [currentRoom]);

  const statusInfo = ROOM_STATUS_MAP[currentRoom.status];
  const cleanLandlordPhone = currentRoom.landlord?.phone
    ? currentRoom.landlord.phone.replace(/\D/g, "")
    : "";

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFA] dark:bg-[#0E1218]">
      {/* Top Navbar */}
      <Header
        saleUser={saleUser}
        onUpdateSaleUser={handleUpdateSaleUser}
        onOpenCreateRoom={() => setIsCreateModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Navigation Breadcrumb with True Back action */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  router.back();
                } else {
                  router.push("/");
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200/80 bg-white/80 dark:border-zinc-800 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors shadow-2xs cursor-pointer"
              title="Quay lại trang trước đó"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại</span>
            </button>

            <nav className="text-zinc-400 flex items-center gap-1.5 text-xs">
              <Link
                href="/"
                className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1"
                title="Về trang chủ Quỹ phòng TP.HCM"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Quỹ phòng TP.HCM</span>
              </Link>
              <span>/</span>
              <Link
                href={`/?district=${encodeURIComponent(currentRoom.district)}`}
                className="text-zinc-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 font-medium underline-offset-2 hover:underline transition-colors"
                title={`Xem tất cả phòng tại ${currentRoom.district}`}
              >
                {currentRoom.district}
              </Link>
              {currentRoom.ward && (
                <>
                  <span>/</span>
                  <Link
                    href={`/?district=${encodeURIComponent(currentRoom.district)}&ward=${encodeURIComponent(currentRoom.ward)}`}
                    className="text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    title={`Xem phòng tại ${currentRoom.ward}, ${currentRoom.district}`}
                  >
                    {currentRoom.ward}
                  </Link>
                </>
              )}
              <span>/</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold">{currentRoom.roomCode}</span>
            </nav>
          </div>
        </div>

        {/* Room Header Info */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="font-serif px-3 py-1 rounded-xl text-xs font-bold bg-zinc-950 text-amber-300 border border-amber-500/30 tracking-widest uppercase shadow-xs">
                {currentRoom.roomCode}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${statusInfo.bg} ${statusInfo.text} border ${statusInfo.border}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                {statusInfo.label}
              </span>
              <span className="text-xs text-zinc-500">Tầng {currentRoom.floor}</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-zinc-950 dark:text-white tracking-wide">
              {currentRoom.buildingName}
            </h1>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 font-sans">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                {currentRoom.address}, {currentRoom.ward ? `${currentRoom.ward}, ` : ""}{currentRoom.district}, TP. Hồ Chí Minh
              </span>
            </p>
          </div>

          {/* Quick Action in Header */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleCopyZalo}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                copied
                  ? "bg-amber-600 text-white"
                  : "bg-amber-500/10 text-amber-900 dark:text-amber-200 hover:bg-amber-500/20 border border-amber-500/30"
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Đã sao chép tin nhắn" : "1-Click Copy Zalo Gửi Khách"}</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Gallery & Left Details vs Right Sticky Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* CỘT TRÁI: Gallery ảnh + Thông số chi tiết (8 cột) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Gallery ảnh lớn */}
            <div className="space-y-3">
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-3xl overflow-hidden bg-zinc-900 shadow-xl border border-zinc-200/80 dark:border-zinc-800">
                <img
                  src={currentRoom.images[selectedImgIndex] || currentRoom.images[0]}
                  alt={`${currentRoom.roomCode} - ${currentRoom.buildingName}`}
                  className="w-full h-full object-cover transition-all duration-500"
                />
                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-medium">
                  {selectedImgIndex + 1} / {currentRoom.images.length} hình ảnh
                </div>
              </div>

              {/* Thumbnails row */}
              {currentRoom.images.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {currentRoom.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImgIndex(idx)}
                      className={`relative w-22 h-16 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        selectedImgIndex === idx
                          ? "border-amber-500 scale-105 shadow-md"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quy mô & Thông số căn hộ */}
            <div className="luxury-glass rounded-3xl p-6 shadow-xs space-y-4">
              <h2 className="font-serif text-lg font-bold text-zinc-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-500" />
                <span>Quy mô & Tiện ích căn phòng</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800">
                  <span className="text-[11px] text-zinc-500 uppercase tracking-wider block">Loại phòng</span>
                  <span className="font-bold text-sm text-zinc-900 dark:text-white mt-0.5 block">
                    {ROOM_TYPE_MAP[currentRoom.type]}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800">
                  <span className="text-[11px] text-zinc-500 uppercase tracking-wider block">Diện tích</span>
                  <span className="font-bold text-sm text-zinc-900 dark:text-white mt-0.5 block">
                    {currentRoom.area} m²
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800">
                  <span className="text-[11px] text-zinc-500 uppercase tracking-wider block">Vị trí tầng</span>
                  <span className="font-bold text-sm text-zinc-900 dark:text-white mt-0.5 block">
                    Tầng {currentRoom.floor}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800">
                  <span className="text-[11px] text-zinc-500 uppercase tracking-wider block">Số người tối đa</span>
                  <span className="font-bold text-sm text-zinc-900 dark:text-white mt-0.5 block">
                    {currentRoom.maxTenants} người ở
                  </span>
                </div>
              </div>

              {/* Đặc điểm tiện nghi */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
                {currentRoom.hasBalcony && (
                  <span className="px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-semibold flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5" /> Có Ban công thoáng mát
                  </span>
                )}
                {currentRoom.allowPet && (
                  <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold flex items-center gap-1.5">
                    <Dog className="w-3.5 h-3.5" /> Cho phép nuôi Pet
                  </span>
                )}
                {currentRoom.hasElevator && (
                  <span className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" /> Toà nhà có thang máy
                  </span>
                )}
              </div>
            </div>

            {/* Chi phí dịch vụ hàng tháng */}
            <div className="luxury-glass rounded-3xl p-6 shadow-xs space-y-4">
              <h2 className="font-serif text-lg font-bold text-zinc-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Chi phí dịch vụ hàng tháng</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-500 block">Tiền điện</span>
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">
                      {currentRoom.serviceFees.electricity}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-500 block">Tiền nước</span>
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">
                      {currentRoom.serviceFees.water}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600">
                    <Car className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-500 block">Gửi xe máy</span>
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">
                      {currentRoom.serviceFees.parking}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-zinc-500 block">Wifi / Internet</span>
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">
                      {currentRoom.serviceFees.internet}
                    </span>
                  </div>
                </div>

                {currentRoom.serviceFees.serviceFee && (
                  <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 flex items-center gap-3 sm:col-span-2">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-500 block">Phí quản lý / dịch vụ toà nhà</span>
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">
                        {currentRoom.serviceFees.serviceFee}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Danh mục nội thất bàn giao */}
            <div className="luxury-glass rounded-3xl p-6 shadow-xs space-y-4">
              <h2 className="font-serif text-lg font-bold text-zinc-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Armchair className="w-4 h-4 text-amber-500" />
                <span>Danh mục nội thất bàn giao ({currentRoom.furniture.length} món)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentRoom.furniture.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/70 dark:border-zinc-800 flex items-center gap-2.5 text-xs font-medium text-zinc-800 dark:text-zinc-200"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ghi chú nội bộ cho Sale */}
            {currentRoom.notesForSale && (
              <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Chiến lược dẫn khách & Lưu ý cho Sale</span>
                </span>
                <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-sans">
                  {currentRoom.notesForSale}
                </p>
              </div>
            )}

            {/* Vị trí toà nhà trên bản đồ & Chỉ đường */}
            <div className="luxury-glass rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="font-serif text-lg font-bold text-zinc-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span>Vị trí toà nhà & Bản đồ chỉ đường</span>
                </h2>

                <a
                  href={mapSearchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 border border-amber-500/25 transition-colors cursor-pointer w-fit"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Mở Google Maps chỉ đường ↗</span>
                </a>
              </div>

              <div className="relative w-full h-72 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-inner bg-zinc-100 dark:bg-zinc-900">
                <iframe
                  title={`Bản đồ ${currentRoom.buildingName}`}
                  width="100%"
                  height="100%"
                  className="w-full h-full border-0"
                  loading="lazy"
                  src={mapEmbedUrl}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-zinc-500 pt-1 font-sans">
                <span>
                  Địa chỉ: <strong className="text-zinc-800 dark:text-zinc-200">{currentRoom.address}, {currentRoom.ward ? currentRoom.ward + ", " : ""}{currentRoom.district}</strong>
                </span>
                {currentRoom.lat && currentRoom.lng && (
                  <span className="text-[11px] font-mono text-zinc-400">
                    Tọa độ GPS: {currentRoom.lat.toFixed(4)}, {currentRoom.lng.toFixed(4)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Bảng giá, Hoa hồng & SĐT Chủ Hộ (4 cột Sticky) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Box Giá & Hoa Hồng */}
            <div className="luxury-glass rounded-3xl p-6 shadow-md border border-zinc-200/80 dark:border-zinc-800 space-y-5 sticky top-24">
              <div>
                <span className="text-xs text-zinc-500 uppercase tracking-wider block">Giá thuê niêm yết</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-serif text-3xl sm:text-4xl font-bold text-zinc-950 dark:text-white tracking-tight">
                    {formatPriceNumber(currentRoom.price)}
                  </span>
                  <span className="font-sans text-lg font-bold text-zinc-800 dark:text-zinc-200">đ</span>
                  <span className="text-xs text-zinc-500 font-sans">/tháng</span>
                </div>
                <div className="text-xs text-zinc-500 mt-1">
                  Tiền cọc: <strong className="text-zinc-800 dark:text-zinc-200">{formatVND(currentRoom.deposit)}</strong>
                </div>
              </div>

              {/* Hoa hồng Sale */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Hoa hồng nhận được:</span>
                </div>
                <span className="font-serif text-xl font-bold text-amber-700 dark:text-amber-300 block">
                  {currentRoom.commission}
                </span>
                <span className="text-[11px] text-amber-600/90 dark:text-amber-400/90 block">
                  Nhận ngay sau khi khách ký hợp đồng & vào ở
                </span>
              </div>

              {/* THÔNG TIN CHỦ HỘ / QUẢN LÝ (NỘI BỘ CHO SALE) */}
              {currentRoom.landlord && (
                <div className="p-4.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/90 dark:border-amber-800/60 shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-900/80 dark:text-amber-300/80 font-medium flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Chủ Hộ / Quản Lý:</span>
                    </span>
                    <span className="font-bold text-amber-950 dark:text-amber-100 text-sm tracking-wide">
                      {currentRoom.landlord.name}
                    </span>
                  </div>

                  <div className="text-xl font-mono font-bold text-amber-950 dark:text-amber-100 text-center py-2 px-3 bg-white/95 dark:bg-zinc-900/90 rounded-xl border border-amber-300/70 dark:border-amber-700/50 shadow-2xs tracking-wider">
                    {currentRoom.landlord.phone}
                  </div>

                  {/* Nút Gọi & Zalo Trực Tiếp */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={`tel:${cleanLandlordPhone}`}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Gọi Chủ Hộ</span>
                    </a>
                    <a
                      href={`https://zalo.me/${cleanLandlordPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Nhắn Zalo</span>
                    </a>
                  </div>

                  {/* Pass cửa / Vân tay */}
                  {currentRoom.landlord.doorPassword && (
                    <div className="flex items-start gap-1.5 text-xs text-amber-950/90 dark:text-amber-200/90 pt-2 border-t border-amber-200/80 dark:border-amber-800/60 font-sans">
                      <Key className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="font-semibold text-amber-950 dark:text-amber-100">Cửa / Vân tay:</strong>{" "}
                        {currentRoom.landlord.doorPassword}
                      </span>
                    </div>
                  )}

                  {/* Lưu ý khi dẫn khách */}
                  {currentRoom.landlord.callNotice && (
                    <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 italic font-sans">
                      * {currentRoom.landlord.callNotice}
                    </p>
                  )}
                </div>
              )}

              {/* Nút Hành động */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleCopyZalo}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 transition-all cursor-pointer shadow-sm"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Đã copy nội dung Zalo" : "1-Click Copy Zalo Gửi Khách"}</span>
                </button>

                {currentRoom.status === "holding" ? (
                  <button
                    onClick={() => handleReleaseHold(currentRoom.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 border border-amber-300 dark:border-amber-800 transition-colors cursor-pointer"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Hủy giữ chỗ phòng này</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedRoomForHold(currentRoom)}
                    disabled={currentRoom.status === "occupied" || currentRoom.status === "deposited"}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-zinc-950 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-xs font-bold"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Giữ chỗ dẫn khách xem phòng</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* PHẦN ĐỀ XUẤT PHÒNG LIÊN QUAN (CÙNG QUẬN, SÊM GIÁ) */}
        {relatedRooms.length > 0 && (
          <section className="pt-10 border-t border-zinc-200/80 dark:border-zinc-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 block font-sans">
                  Gợi ý thông minh cho Sale
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-950 dark:text-white tracking-wide mt-1">
                  Phòng Liên Quan Đề Xuất
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 font-sans mt-0.5">
                  Các phòng cùng khu vực <strong className="text-zinc-800 dark:text-zinc-200">{currentRoom.district}</strong> và phân khúc giá tương đương để sale dễ tư vấn thêm phương án cho khách.
                </p>
              </div>

              <Link
                href="/"
                className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Xem tất cả quỹ phòng</span>
                <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedRooms.map((room) => (
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
          </section>
        )}
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

export default function RoomDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FBFBFA] dark:bg-[#0B0F17]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Đang tải dữ liệu căn hộ...</p>
          </div>
        </div>
      }
    >
      <RoomDetailContent />
    </Suspense>
  );
}
