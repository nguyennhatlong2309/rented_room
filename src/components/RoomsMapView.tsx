"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Room } from "@/lib/types";
import {
  formatPricePill,
  getRoomCoordinates,
  DISTRICT_COORDINATES,
  HCMC_CENTER,
  calculateDistanceKm,
  formatDistance,
} from "@/lib/geoUtils";
import { formatVND, ROOM_STATUS_MAP } from "@/lib/utils";
import {
  MapPin,
  Layers,
  Sparkles,
  Phone,
  X,
  ExternalLink,
  ChevronRight,
  Search,
  Loader2,
  Navigation2,
  LocateFixed,
} from "lucide-react";

interface RoomsMapViewProps {
  rooms: Room[];
  saleUser: { name: string; phone: string };
  onOpenHoldModal?: (room: Room) => void;
  onReleaseHold?: (roomId: string) => void;
}

// Mapbox Token chính thức từ biến môi trường NEXT_PUBLIC_MAPBOX_TOKEN (.env.local)
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

mapboxgl.accessToken = MAPBOX_TOKEN;

// Cấu hình worker an toàn (sử dụng worker nội bộ đã copy sẵn hoặc fallback)
if (typeof window !== "undefined") {
  try {
    mapboxgl.workerUrl = `${window.location.origin}/mapbox-gl-csp-worker.js`;
  } catch {
    // Dự phòng mặc định
  }
}

// 4 Phong cách bản đồ Mapbox chính hãng cao cấp
const MAP_STYLES = {
  streets: {
    name: "Đường phố",
    url: "mapbox://styles/mapbox/streets-v12",
  },
  obsidian_dark: {
    name: "Tối Obsidian",
    url: "mapbox://styles/mapbox/dark-v11",
  },
  luxury_light: {
    name: "Sáng Luxury",
    url: "mapbox://styles/mapbox/light-v11",
  },
  satellite: {
    name: "Vệ tinh 3D",
    url: "mapbox://styles/mapbox/satellite-streets-v12",
  },
};

interface SearchResultItem {
  id: string;
  place_name: string;
  text: string;
  center: [number, number];
}

export function RoomsMapView({
  rooms,
  saleUser,
  onOpenHoldModal,
  onReleaseHold,
}: RoomsMapViewProps) {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [roomId: string]: mapboxgl.Marker }>({});
  const searchMarkerRef = useRef<mapboxgl.Marker | null>(null);

  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentStyle, setCurrentStyle] = useState<keyof typeof MAP_STYLES>("streets");
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // State tìm kiếm địa điểm qua Mapbox Geocoding
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string;
    coords: [number, number];
  } | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Danh sách các quận có phòng
  const availableDistricts = useMemo(() => {
    const list = Array.from(new Set(rooms.map((r) => r.district)));
    return list.sort();
  }, [rooms]);

  // Sắp xếp danh sách phòng theo khoảng cách nếu người dùng đang tìm kiếm quanh một địa điểm
  const displayRooms = useMemo(() => {
    if (!selectedLocation) return rooms;

    return [...rooms].sort((a, b) => {
      const distA = calculateDistanceKm(selectedLocation.coords, getRoomCoordinates(a));
      const distB = calculateDistanceKm(selectedLocation.coords, getRoomCoordinates(b));
      return distA - distB;
    });
  }, [rooms, selectedLocation]);

  // Hàm thêm lớp 3D Buildings của Mapbox vào bản đồ
  const add3DBuildingsLayer = (map: mapboxgl.Map) => {
    try {
      if (map.getLayer("3d-buildings")) return;

      const layers = map.getStyle().layers;
      const labelLayerId = layers?.find(
        (layer) => layer.type === "symbol" && layer.layout && layer.layout["text-field"]
      )?.id;

      map.addLayer(
        {
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 14,
          paint: {
            "fill-extrusion-color": [
              "interpolate",
              ["linear"],
              ["get", "height"],
              0,
              "#334155",
              60,
              "#475569",
              150,
              "#d97706",
            ],
            "fill-extrusion-height": [
              "interpolate",
              ["linear"],
              ["zoom"],
              14,
              0,
              15.05,
              ["get", "height"],
            ],
            "fill-extrusion-base": [
              "interpolate",
              ["linear"],
              ["zoom"],
              14,
              0,
              15.05,
              ["get", "min_height"],
            ],
            "fill-extrusion-opacity": 0.65,
          },
        },
        labelLayerId
      );
    } catch {
      // Bỏ qua nếu style không hỗ trợ vector building
    }
  };

  // 1. Khởi tạo Bản đồ Mapbox GL
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Tự động chọn theme phù hợp Dark/Light
    const isDark =
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark");
    const initialStyleKey: keyof typeof MAP_STYLES = isDark
      ? "obsidian_dark"
      : "streets";
    setCurrentStyle(initialStyleKey);

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLES[initialStyleKey].url,
      center: HCMC_CENTER,
      zoom: 12.4,
      pitch: 40, // Góc nghiêng 3D đặc trưng của Mapbox
      bearing: 0,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-right");
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      "top-right"
    );

    map.on("load", () => {
      setIsMapLoaded(true);
      mapRef.current = map;
      add3DBuildingsLayer(map);
    });

    map.on("style.load", () => {
      add3DBuildingsLayer(map);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Chuyển đổi Style Map
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

    // Xóa marker phòng cũ
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    if (rooms.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    rooms.forEach((room, index) => {
      const coords = getRoomCoordinates(room, index);
      bounds.extend(coords);

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
          zoom: 15.2,
          pitch: 50,
          duration: 1000,
        });
      });

      el.addEventListener("mouseenter", () => {
        setHoveredRoomId(room.id);
      });

      el.addEventListener("mouseleave", () => {
        setHoveredRoomId(null);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(coords)
        .addTo(map);

      markersRef.current[room.id] = marker;
    });

    // Chỉ tự động fitBounds nếu người dùng chưa chọn địa điểm tìm kiếm cụ thể
    if (!bounds.isEmpty() && !selectedLocation) {
      map.fitBounds(bounds, {
        padding: { top: 60, bottom: 60, left: isSidebarOpen ? 380 : 60, right: 60 },
        maxZoom: 15,
        duration: 1200,
      });
    }
  }, [rooms, isMapLoaded, activeRoom?.id, hoveredRoomId, isSidebarOpen, selectedLocation]);

  // 4. Tìm kiếm địa chỉ qua Mapbox Geocoding API (Debounced 350ms)
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!value.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          value.trim()
        )}.json?country=vn&proximity=106.6990,10.7760&types=poi,address,neighborhood,locality&limit=5&access_token=${MAPBOX_TOKEN}`;

        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(
            data.features?.map((f: any) => ({
              id: f.id,
              place_name: f.place_name,
              text: f.text,
              center: f.center,
            })) || []
          );
        }
      } catch (err) {
        console.error("Lỗi Mapbox Geocoding:", err);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  // Chọn một địa điểm tìm kiếm từ danh sách gợi ý
  const handleSelectLocation = (item: SearchResultItem) => {
    setSelectedLocation({ name: item.text, coords: item.center });
    setSearchResults([]);
    setSearchQuery(item.text);

    const map = mapRef.current;
    if (!map) return;

    // Xóa marker tìm kiếm cũ nếu có
    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
    }

    // Tạo Marker Radar phát sáng cho vị trí tìm kiếm
    const searchEl = document.createElement("div");
    searchEl.className = "relative flex items-center justify-center cursor-pointer";
    searchEl.innerHTML = `
      <div class="absolute w-9 h-9 rounded-full bg-amber-500/30 animate-ping pointer-events-none"></div>
      <div class="relative w-6 h-6 rounded-full bg-amber-500 border-2 border-white shadow-xl flex items-center justify-center">
        <div class="w-2 h-2 rounded-full bg-zinc-950"></div>
      </div>
    `;

    const marker = new mapboxgl.Marker({ element: searchEl })
      .setLngLat(item.center)
      .addTo(map);

    searchMarkerRef.current = marker;

    // Bay máy ảnh mượt mà đến vị trí tìm kiếm với góc nghiêng 3D
    map.flyTo({
      center: item.center,
      zoom: 15.5,
      pitch: 50,
      duration: 1400,
    });
  };

  // Hủy vị trí tìm kiếm, quay lại chế độ xem tổng quan
  const handleClearSelectedLocation = () => {
    setSelectedLocation(null);
    setSearchQuery("");
    setSearchResults([]);
    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
      searchMarkerRef.current = null;
    }
    handleResetHCMC();
  };

  // Bay đến Quận khi click phím tắt
  const handleFlyToDistrict = (districtName: string) => {
    const coords = DISTRICT_COORDINATES[districtName];
    if (coords && mapRef.current) {
      mapRef.current.flyTo({
        center: [coords.lng, coords.lat],
        zoom: 14,
        pitch: 45,
        duration: 1500,
      });
    }
  };

  // Reset về toàn TP.HCM
  const handleResetHCMC = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: HCMC_CENTER,
        zoom: 12,
        pitch: 30,
        bearing: 0,
        duration: 1200,
      });
    }
    setActiveRoom(null);
  };

  return (
    <div className="relative w-full h-[640px] sm:h-[740px] rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-2xl bg-zinc-100 dark:bg-zinc-950 flex">
      {/* 1. KHUNG MAPBOX CHÍNH */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* 2. THANH CÔNG CỤ TÌM KIẾM & PHONG CÁCH MAP (TOP BAR) */}
      <div className="absolute top-4 left-4 right-16 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
        {/* THANH TÌM KIẾM ĐỊA CHỈ MAPBOX */}
        <div className="relative pointer-events-auto">
          <div className="flex items-center gap-2 luxury-glass px-3 py-1.5 rounded-2xl shadow-lg border border-white/20 w-64 sm:w-80">
            <Search className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Tìm địa điểm, trường ĐH, toà nhà..."
              className="w-full bg-transparent text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
            />
            {isSearching && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500 shrink-0" />}
            {searchQuery && !isSearching && (
              <button
                onClick={handleClearSelectedLocation}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Gợi ý Geocoding Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 luxury-glass bg-white/95 dark:bg-zinc-900/95 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-50 py-1">
              {searchResults.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectLocation(item)}
                  className="w-full px-3 py-2 text-left hover:bg-amber-500/10 flex items-start gap-2.5 transition-colors cursor-pointer border-b border-zinc-100 dark:border-zinc-800/50 last:border-none"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {item.text}
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate">{item.place_name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chuyển đổi Style Mapbox */}
        <div className="pointer-events-auto luxury-glass px-2.5 py-1.5 rounded-2xl shadow-lg border border-white/20 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-amber-500 mr-0.5" />
          {(Object.keys(MAP_STYLES) as (keyof typeof MAP_STYLES)[]).map((key) => (
            <button
              key={key}
              onClick={() => handleSwitchStyle(key)}
              className={`px-2 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                currentStyle === key
                  ? "bg-amber-500 text-zinc-950 font-bold shadow-xs"
                  : "text-zinc-700 dark:text-zinc-300 hover:text-amber-500"
              }`}
            >
              {MAP_STYLES[key].name}
            </button>
          ))}
        </div>

        {/* Phím tắt bay nhanh theo Quận */}
        <div className="pointer-events-auto hidden lg:flex items-center gap-1 luxury-glass px-2.5 py-1.5 rounded-2xl shadow-lg border border-white/20 overflow-x-auto max-w-md">
          <button
            onClick={handleResetHCMC}
            className="px-2 py-1 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-white/80 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
          >
            Toàn TP.HCM
          </button>
          <span className="text-zinc-300 dark:text-zinc-700">|</span>
          {availableDistricts.slice(0, 5).map((district) => (
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

      {/* 3. SIDEBAR DANH SÁCH PHÒNG BÊN TRÁI */}
      <div
        className={`absolute top-0 bottom-0 left-0 z-20 w-84 sm:w-96 transition-transform duration-300 ease-in-out pointer-events-auto flex flex-col luxury-glass border-r border-zinc-200/80 dark:border-zinc-800 shadow-2xl ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>Quỹ phòng trên Mapbox</span>
            </h3>

            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Thu gọn danh sách"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Badge thông báo trạng thái tìm kiếm quanh địa điểm */}
          {selectedLocation ? (
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
              <div className="min-w-0 pr-1">
                <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium truncate">
                  Gần: <span className="font-bold">{selectedLocation.name}</span>
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Sắp xếp theo khoảng cách gần nhất
                </p>
              </div>
              <button
                onClick={handleClearSelectedLocation}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer shrink-0"
                title="Bỏ lọc khoảng cách"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span className="text-[11px] text-zinc-500 block">
              Hiển thị {displayRooms.length} phòng phân bố tại TP.HCM
            </span>
          )}
        </div>

        {/* Sidebar Rooms Scroll Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {displayRooms.map((room) => {
            const isSelected = activeRoom?.id === room.id;
            const isHovered = hoveredRoomId === room.id;
            const coords = getRoomCoordinates(room);

            // Tính khoảng cách nếu đang tìm kiếm quanh địa điểm
            const distanceKm = selectedLocation
              ? calculateDistanceKm(selectedLocation.coords, coords)
              : null;

            return (
              <div
                key={room.id}
                onClick={() => {
                  setActiveRoom(room);
                  if (mapRef.current) {
                    mapRef.current.flyTo({
                      center: coords,
                      zoom: 15.5,
                      pitch: 45,
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
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-serif font-bold text-xs text-zinc-900 dark:text-white truncate">
                        {room.buildingName}
                      </h4>
                      {distanceKm !== null && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
                          {formatDistance(distanceKm)}
                        </span>
                      )}
                    </div>
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

      {/* 4. NÚT MỞ LẠI SIDEBAR */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-4 left-4 z-20 pointer-events-auto px-3.5 py-2 rounded-2xl luxury-glass border border-white/20 text-zinc-800 dark:text-zinc-100 text-xs font-semibold shadow-lg hover:bg-white dark:hover:bg-zinc-800 transition-all flex items-center gap-2 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 text-amber-500" />
          <span>Danh sách phòng ({displayRooms.length})</span>
        </button>
      )}

      {/* 5. FLOATING PREVIEW CARD KHI CLICK MARKER */}
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
