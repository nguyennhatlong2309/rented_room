"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Room } from "@/lib/types";
import { formatPricePill, getRoomCoordinates, DISTRICT_COORDINATES, HCMC_CENTER } from "@/lib/geoUtils";
import { formatVND, ROOM_STATUS_MAP, ROOM_TYPE_MAP } from "@/lib/utils";
import {
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  Layers,
  Sparkles,
  Phone,
  MessageCircle,
  X,
  ExternalLink,
  ChevronRight,
  Compass,
} from "lucide-react";

interface RoomsMapViewProps {
  rooms: Room[];
  saleUser: { name: string; phone: string };
  onOpenHoldModal?: (room: Room) => void;
  onReleaseHold?: (roomId: string) => void;
}

// Map style presets (Miễn phí 100%, vector WebGL 60fps, tương thích Mapbox / MapLibre)
const MAP_STYLES = {
  luxury_light: {
    name: "Sáng Luxury (Positron)",
    url: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  },
  obsidian_dark: {
    name: "Tối Obsidian (Dark Matter)",
    url: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  },
  voyager: {
    name: "Chi tiết phố (Voyager)",
    url: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  },
};

// Cấu hình Web Worker tĩnh cho MapLibre tương thích Next.js Turbopack & tránh lỗi MIME text/html
if (typeof window !== "undefined") {
  try {
    maplibregl.setWorkerUrl(`${window.location.origin}/maplibre-gl-worker.mjs`);
  } catch {
    // Dự phòng an toàn
  }
}

export function RoomsMapView({
  rooms,
  saleUser,
  onOpenHoldModal,
  onReleaseHold,
}: RoomsMapViewProps) {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [roomId: string]: maplibregl.Marker }>({});

  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentStyle, setCurrentStyle] = useState<keyof typeof MAP_STYLES>("luxury_light");
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Danh sách các quận có phòng để làm phím tắt bay nhanh
  const availableDistricts = useMemo(() => {
    const list = Array.from(new Set(rooms.map((r) => r.district)));
    return list.sort();
  }, [rooms]);

  // 1. Khởi tạo Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Tự động nhận diện theme sáng / tối ban đầu
    const isDark =
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark");
    const initialStyleKey: keyof typeof MAP_STYLES = isDark
      ? "obsidian_dark"
      : "luxury_light";
    setCurrentStyle(initialStyleKey);

    // Đảm bảo URL Worker luôn trỏ chính xác vào file tĩnh public/
    try {
      maplibregl.setWorkerUrl(`${window.location.origin}/maplibre-gl-worker.mjs`);
    } catch {
      // Bỏ qua nếu đã cấu hình
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLES[initialStyleKey].url,
      center: HCMC_CENTER,
      zoom: 12.2,
      pitch: 35, // Góc nghiêng 3D nhẹ sang trọng
      bearing: 0,
      attributionControl: false,
    });

    // Thêm các control chuẩn
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      "top-right"
    );

    map.on("load", () => {
      setIsMapLoaded(true);
      mapRef.current = map;
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Chuyển đổi Style Map (Sáng / Tối / Voyager)
  const handleSwitchStyle = (styleKey: keyof typeof MAP_STYLES) => {
    setCurrentStyle(styleKey);
    if (mapRef.current) {
      mapRef.current.setStyle(MAP_STYLES[styleKey].url);
    }
  };

  // 3. Cập nhật các Marker trên bản đồ khi danh sách phòng thay đổi
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Xóa marker cũ
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    if (rooms.length === 0) return;

    const bounds = new maplibregl.LngLatBounds();

    rooms.forEach((room, index) => {
      const coords = getRoomCoordinates(room, index);
      bounds.extend(coords);

      // Tạo Custom Marker DOM Element
      const el = document.createElement("div");
      el.className = "room-map-marker-container cursor-pointer transition-transform duration-300";

      const isSelected = activeRoom?.id === room.id;
      const isHovered = hoveredRoomId === room.id;

      const priceText = formatPricePill(room.price);
      const isHolding = room.status === "holding";
      const isSoon = room.status === "soon_available";

      el.innerHTML = `
        <div class="group relative flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300 shadow-md ${
          isSelected || isHovered
            ? "bg-amber-500 text-zinc-950 scale-110 ring-4 ring-amber-500/40 z-30"
            : isHolding
            ? "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-200"
            : isSoon
            ? "bg-sky-100 text-sky-900 border border-sky-300 dark:bg-sky-950/80 dark:text-sky-200"
            : "bg-zinc-950 text-white dark:bg-zinc-900 dark:text-amber-300 border border-amber-500/30 hover:scale-105"
        }">
          <span class="w-1.5 h-1.5 rounded-full ${
            isHolding ? "bg-amber-600" : isSoon ? "bg-sky-500" : "bg-emerald-500"
          }"></span>
          <span class="font-sans font-bold tracking-tight">${priceText}</span>
        </div>
      `;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setActiveRoom(room);
        map.flyTo({
          center: coords,
          zoom: 14.8,
          duration: 1000,
        });
      });

      el.addEventListener("mouseenter", () => {
        setHoveredRoomId(room.id);
      });

      el.addEventListener("mouseleave", () => {
        setHoveredRoomId(null);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(coords)
        .addTo(map);

      markersRef.current[room.id] = marker;
    });

    // Tự động căn chỉnh vừa khung nhìn tất cả các phòng
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, {
        padding: { top: 60, bottom: 60, left: isSidebarOpen ? 380 : 60, right: 60 },
        maxZoom: 15,
        duration: 1200,
      });
    }
  }, [rooms, isMapLoaded, activeRoom?.id, hoveredRoomId, isSidebarOpen]);

  // Bay đến Quận khi click phím tắt
  const handleFlyToDistrict = (districtName: string) => {
    const coords = DISTRICT_COORDINATES[districtName];
    if (coords && mapRef.current) {
      mapRef.current.flyTo({
        center: [coords.lng, coords.lat],
        zoom: 13.8,
        pitch: 40,
        duration: 1500,
      });
    }
  };

  // Reset về toàn TP.HCM
  const handleResetHCMC = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: HCMC_CENTER,
        zoom: 11.8,
        pitch: 20,
        bearing: 0,
        duration: 1200,
      });
    }
    setActiveRoom(null);
  };

  return (
    <div className="relative w-full h-[620px] sm:h-[720px] rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-xl bg-zinc-100 dark:bg-zinc-950 flex">
      {/* 1. KHUNG MAP CHÍNH (Chiếm toàn bộ không gian) */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* 2. THANH CÔNG CỤ TRÊN MAP (Style Selector & Quick Fly) */}
      <div className="absolute top-4 left-4 right-16 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
        {/* Style Selector */}
        <div className="pointer-events-auto luxury-glass px-2.5 py-1.5 rounded-2xl shadow-lg border border-white/20 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-amber-500 mr-0.5" />
          <button
            onClick={() => handleSwitchStyle("luxury_light")}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              currentStyle === "luxury_light"
                ? "bg-amber-500 text-zinc-950 font-bold shadow-xs"
                : "text-zinc-700 dark:text-zinc-300 hover:text-amber-500"
            }`}
          >
            Sáng
          </button>
          <button
            onClick={() => handleSwitchStyle("obsidian_dark")}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              currentStyle === "obsidian_dark"
                ? "bg-amber-500 text-zinc-950 font-bold shadow-xs"
                : "text-zinc-700 dark:text-zinc-300 hover:text-amber-500"
            }`}
          >
            Tối
          </button>
          <button
            onClick={() => handleSwitchStyle("voyager")}
            className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer hidden sm:block ${
              currentStyle === "voyager"
                ? "bg-amber-500 text-zinc-950 font-bold shadow-xs"
                : "text-zinc-700 dark:text-zinc-300 hover:text-amber-500"
            }`}
          >
            Phố
          </button>
        </div>

        {/* Quick Fly District Pills */}
        <div className="pointer-events-auto hidden md:flex items-center gap-1 luxury-glass px-2.5 py-1.5 rounded-2xl shadow-lg border border-white/20 overflow-x-auto max-w-xl">
          <button
            onClick={handleResetHCMC}
            className="px-2.5 py-1 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-white/80 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
          >
            Toàn TP.HCM
          </button>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          {availableDistricts.slice(0, 6).map((district) => (
            <button
              key={district}
              onClick={() => handleFlyToDistrict(district)}
              className="px-2 py-1 rounded-xl text-xs text-zinc-600 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
            >
              {district}
            </button>
          ))}
        </div>
      </div>

      {/* 3. SIDEBAR DANH SÁCH PHÒNG BÊN TRÁI (Thu gọn được) */}
      <div
        className={`absolute top-0 bottom-0 left-0 z-20 w-84 sm:w-96 transition-transform duration-300 ease-in-out pointer-events-auto flex flex-col luxury-glass border-r border-zinc-200/80 dark:border-zinc-800 shadow-2xl ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>Quỹ phòng trên Bản đồ</span>
            </h3>
            <span className="text-[11px] text-zinc-500">
              Đang hiển thị {rooms.length} phòng khả dụng
            </span>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Thu gọn danh sách"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar Rooms Scroll Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {rooms.map((room) => {
            const isSelected = activeRoom?.id === room.id;
            const isHovered = hoveredRoomId === room.id;
            const statusInfo = ROOM_STATUS_MAP[room.status];

            return (
              <div
                key={room.id}
                onClick={() => {
                  setActiveRoom(room);
                  const coords = getRoomCoordinates(room);
                  if (mapRef.current) {
                    mapRef.current.flyTo({
                      center: coords,
                      zoom: 15,
                      duration: 1000,
                    });
                  }
                }}
                onMouseEnter={() => setHoveredRoomId(room.id)}
                onMouseLeave={() => setHoveredRoomId(null)}
                className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex gap-3 ${
                  isSelected
                    ? "bg-amber-500/10 border-amber-500 dark:bg-amber-950/30 ring-1.5 ring-amber-500/50 shadow-md"
                    : isHovered
                    ? "bg-white dark:bg-zinc-800/80 border-amber-300 dark:border-amber-700"
                    : "bg-white/80 dark:bg-zinc-900/70 border-zinc-200/70 dark:border-zinc-800 hover:border-zinc-300"
                }`}
              >
                {/* Ảnh nhỏ */}
                <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800 relative">
                  <img
                    src={room.images[0]}
                    alt={room.roomCode}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-black/80 text-amber-300 font-serif">
                    {room.roomCode}
                  </span>
                </div>

                {/* Nội dung */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-xs text-zinc-900 dark:text-white truncate">
                      {room.buildingName}
                    </h4>
                    <p className="text-[11px] text-zinc-500 truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>{room.ward ? `${room.ward}, ` : ""}{room.district}</span>
                    </p>
                  </div>

                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-serif font-bold text-sm text-zinc-950 dark:text-amber-300">
                      {formatVND(room.price)}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {room.area}m² • Tầng {room.floor}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. NÚT MỞ LẠI SIDEBAR (Khi đang thu gọn) */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-4 left-4 z-20 pointer-events-auto px-3.5 py-2 rounded-2xl luxury-glass border border-white/20 text-zinc-800 dark:text-zinc-100 text-xs font-semibold shadow-lg hover:bg-white dark:hover:bg-zinc-800 transition-all flex items-center gap-2 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 text-amber-500" />
          <span>Danh sách phòng ({rooms.length})</span>
        </button>
      )}

      {/* 5. FLOATING PREVIEW CARD KHI BẤM VÀO MARKER TRÊN BẢN ĐỒ */}
      {activeRoom && (
        <div className="absolute bottom-6 right-6 left-6 sm:left-auto sm:w-96 z-30 pointer-events-auto luxury-glass p-4 rounded-3xl border border-amber-500/40 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-serif px-2.5 py-0.5 rounded-lg text-xs font-bold bg-zinc-950 text-amber-300 border border-amber-500/30">
                {activeRoom.roomCode}
              </span>
              <span className="text-xs text-zinc-500 font-medium">Tầng {activeRoom.floor}</span>
            </div>

            <button
              onClick={() => setActiveRoom(null)}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Ảnh & Thông tin */}
          <div className="flex gap-3">
            <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-zinc-200 dark:bg-zinc-800">
              <img
                src={activeRoom.images[0]}
                alt={activeRoom.roomCode}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <h4 className="font-serif font-bold text-sm text-zinc-950 dark:text-white truncate">
                {activeRoom.buildingName}
              </h4>
              <p className="text-xs text-zinc-500 truncate flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                <span>{activeRoom.address}, {activeRoom.district}</span>
              </p>
              <div className="pt-1">
                <span className="font-serif text-lg font-bold text-zinc-950 dark:text-amber-300">
                  {formatVND(activeRoom.price)}
                </span>
                <span className="text-[11px] text-zinc-400 ml-1">/tháng</span>
              </div>
            </div>
          </div>

          {/* Hoa hồng sale badge */}
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs">
            <span className="text-amber-800 dark:text-amber-300 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Hoa hồng:
            </span>
            <span className="font-bold text-amber-900 dark:text-amber-200 truncate max-w-[180px]">
              {activeRoom.commission}
            </span>
          </div>

          {/* Nút Xem chi tiết & Gọi chủ */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {activeRoom.landlord && (
              <a
                href={`tel:${activeRoom.landlord.phone.replace(/\D/g, "")}`}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Gọi Chủ Hộ</span>
              </a>
            )}

            <button
              onClick={() => router.push(`/rooms/${activeRoom.id}`)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs col-span-1"
            >
              <span>Xem chi tiết</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
