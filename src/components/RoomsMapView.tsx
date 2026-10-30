"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Room, FilterOptions, PriceBracketKey, RoomType, RoomStatus } from "@/lib/types";
import {
  formatPricePill,
  getRoomCoordinates,
  DISTRICT_COORDINATES,
  HCMC_CENTER,
  calculateDistanceKm,
  formatDistance,
} from "@/lib/geoUtils";
import { formatVND, ROOM_STATUS_MAP, ROOM_TYPE_MAP } from "@/lib/utils";
import {
  MapPin,
  Layers,
  Sparkles,
  Phone,
  X,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Search,
  Loader2,
  Navigation2,
  LocateFixed,
  Plus,
  Minus,
  Compass,
  LayoutGrid,
  Menu,
  Building,
  Upload,
  Check,
  CheckCircle2,
  ShieldCheck,
  Calendar,
} from "lucide-react";

interface RoomsMapViewProps {
  rooms: Room[];
  filteredRooms?: Room[];
  filterOptions?: FilterOptions;
  onUpdateFilterOptions?: React.Dispatch<React.SetStateAction<FilterOptions>>;
  onResetFilters?: () => void;
  saleUser: { name: string; phone: string };
  onOpenHoldModal?: (room: Room) => void;
  onReleaseHold?: (roomId: string) => void;
  onSwitchToGrid?: () => void;
  onOpenCreateModal?: () => void;
}

// Mapbox Token chính thức từ biến môi trường NEXT_PUBLIC_MAPBOX_TOKEN (.env.local)
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

mapboxgl.accessToken = MAPBOX_TOKEN;

// Cấu hình worker an toàn
if (typeof window !== "undefined") {
  try {
    mapboxgl.workerUrl = `${window.location.origin}/mapbox-gl-csp-worker.js`;
  } catch {
    // Dự phòng mặc định
  }
}

// 4 Phong cách bản đồ Mapbox chính hãng
const MAP_STYLES = {
  streets: {
    name: "Đường phố",
    sub: "Tiếng Việt chuẩn",
    url: "mapbox://styles/mapbox/streets-v12",
    icon: "🏙️",
  },
  satellite: {
    name: "Vệ tinh 3D",
    sub: "Ảnh chụp thực tế",
    url: "mapbox://styles/mapbox/satellite-streets-v12",
    icon: "🛰️",
  },
  obsidian_dark: {
    name: "Tối Obsidian",
    sub: "Huyền bí cao cấp",
    url: "mapbox://styles/mapbox/dark-v11",
    icon: "🌑",
  },
  luxury_light: {
    name: "Sáng Luxury",
    sub: "Trắng ngọc trai",
    url: "mapbox://styles/mapbox/light-v11",
    icon: "🏛️",
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
  filteredRooms,
  filterOptions,
  onUpdateFilterOptions,
  onResetFilters,
  saleUser,
  onOpenHoldModal,
  onReleaseHold,
  onSwitchToGrid,
  onOpenCreateModal,
}: RoomsMapViewProps) {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [roomId: string]: mapboxgl.Marker }>({});
  const searchMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const hasInitialFitRef = useRef(false);

  // Danh sách phòng sử dụng để hiển thị
  const activeRoomsList = filteredRooms || rooms;

  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentStyle, setCurrentStyle] = useState<keyof typeof MAP_STYLES>("streets");
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [is3DBuildingsEnabled, setIs3DBuildingsEnabled] = useState(true);

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
    if (!selectedLocation) return activeRoomsList;

    return [...activeRoomsList].sort((a, b) => {
      const distA = calculateDistanceKm(selectedLocation.coords, getRoomCoordinates(a));
      const distB = calculateDistanceKm(selectedLocation.coords, getRoomCoordinates(b));
      return distA - distB;
    });
  }, [activeRoomsList, selectedLocation]);

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

  // 1. Khởi tạo Bản đồ Mapbox GL (Chiếm toàn bộ màn hình 100vw x 100vh)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Tự động nhận diện theme sáng / tối ban đầu
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
      zoom: 12.5,
      pitch: 45, // Góc nghiêng 3D điện ảnh Google Maps
      bearing: 0,
      attributionControl: false,
    });

    map.on("load", () => {
      setIsMapLoaded(true);
      mapRef.current = map;
      add3DBuildingsLayer(map);
    });

    map.on("style.load", () => {
      if (is3DBuildingsEnabled) {
        add3DBuildingsLayer(map);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Chuyển đổi Style Map
  const handleSwitchStyle = (styleKey: keyof typeof MAP_STYLES) => {
    setCurrentStyle(styleKey);
    setIsLayersOpen(false);
    if (mapRef.current) {
      mapRef.current.setStyle(MAP_STYLES[styleKey].url);
    }
  };

  // 3. Cập nhật các Marker trên bản đồ khi danh sách phòng thay đổi
  // LƯU Ý: KHÔNG ĐƯA hoveredRoomId hay activeRoom vào dependency array để TRÁNH LÀM RESET ZOOM khi hover!
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Xóa marker phòng cũ
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    if (activeRoomsList.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    activeRoomsList.forEach((room, index) => {
      const coords = getRoomCoordinates(room, index);
      bounds.extend(coords);

      const el = document.createElement("div");
      el.className = "room-map-marker-container cursor-pointer transition-transform duration-300 relative";

      const priceText = formatPricePill(room.price);
      const isHolding = room.status === "holding";
      const isSoon = room.status === "soon_available";

      el.innerHTML = `
        <div class="relative group select-none flex flex-col items-center">
          <!-- CARD XEM NHANH ẢNH PHÒNG KHI HOVER TRỰC TIẾP TRÊN MARKER -->
          <div class="room-hover-card absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-60 rounded-2xl bg-white/98 dark:bg-zinc-900/98 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-700/80 shadow-2xl p-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
            <!-- Hình ảnh phòng sắc nét -->
            <div class="relative w-full h-32 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800">
              <img src="${room.images[0]}" alt="${room.roomCode}" class="w-full h-full object-cover" />
              <span class="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/85 text-amber-300 font-serif shadow-xs">
                ${room.roomCode}
              </span>
              <span class="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold ${
                isHolding
                  ? "bg-amber-500 text-zinc-950"
                  : isSoon
                  ? "bg-sky-500 text-white"
                  : "bg-emerald-600 text-white"
              }">
                ${isHolding ? "Đang giữ chỗ" : isSoon ? "Sắp trống" : "Trống sẵn"}
              </span>
              <span class="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md text-[9px] font-semibold bg-black/75 text-white backdrop-blur-xs">
                ${room.area}m² • Tầng ${room.floor}
              </span>
            </div>

            <!-- Chi tiết toà nhà & Giá -->
            <div class="p-2 space-y-1 text-left">
              <h4 class="font-serif font-bold text-xs text-zinc-900 dark:text-white truncate">
                ${room.buildingName}
              </h4>
              <p class="text-[10px] text-zinc-500 truncate flex items-center gap-1">
                <span>📍 ${room.address}, ${room.district}</span>
              </p>
              <div class="flex items-baseline justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                <span class="font-serif font-bold text-sm text-zinc-950 dark:text-amber-300">
                  ${formatVND(room.price)}
                </span>
                <span class="text-[10px] text-amber-700 dark:text-amber-400 font-semibold truncate max-w-[100px]">
                  ${room.commission}
                </span>
              </div>
            </div>

            <!-- Mũi tên trỏ nhọn xuống Ghim -->
            <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] border-t-white dark:border-t-zinc-900"></div>
          </div>

          <!-- Ghim giá tiền (Pill Marker) -->
          <div class="room-marker-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 shadow-xl ${
            isHolding
              ? "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/90 dark:text-amber-200"
              : isSoon
              ? "bg-sky-100 text-sky-900 border border-sky-300 dark:bg-sky-950/90 dark:text-sky-200"
              : "bg-zinc-950/90 text-white dark:bg-zinc-900 dark:text-amber-300 border border-amber-500/40 hover:scale-105"
          }">
            <span class="w-2 h-2 rounded-full ${
              isHolding ? "bg-amber-600 animate-pulse" : isSoon ? "bg-sky-500" : "bg-emerald-500"
            }"></span>
            <span class="font-sans font-bold tracking-tight">${priceText}</span>
          </div>
        </div>
      `;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setActiveRoom(room);
        map.flyTo({
          center: coords,
          zoom: 17.8, // Zoom siêu gần thấy rõ toà nhà, ngõ hẻm và khối 3D
          pitch: 55,  // Góc nghiêng 3D điện ảnh
          duration: 1200,
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

    // Chỉ tự động fitBounds DUY NHẤT LẦN ĐẦU KHI MỞ BẢN ĐỒ
    // TUYỆT ĐỐI KHÔNG CHẠY LẠI KHI HOVER ĐỂ GIỮ NGUYÊN 100% MỨC ZOOM CỦA NGƯỜI DÙNG
    if (!hasInitialFitRef.current && !bounds.isEmpty() && !selectedLocation) {
      map.fitBounds(bounds, {
        padding: { top: 100, bottom: 80, left: isSidebarOpen ? 420 : 80, right: 80 },
        maxZoom: 15,
        duration: 1200,
      });
      hasInitialFitRef.current = true;
    }
  }, [activeRoomsList, isMapLoaded, selectedLocation]);

  // 4. Đồng bộ hiệu ứng Hover/Active lên Marker độc lập mà KHÔNG ĐẶT LẠI ZOOM
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([roomId, marker]) => {
      const el = marker.getElement();
      const hoverCard = el.querySelector(".room-hover-card");
      const pill = el.querySelector(".room-marker-pill");

      const isHovered = hoveredRoomId === roomId;
      const isSelected = activeRoom?.id === roomId;

      if (isHovered || isSelected) {
        el.style.zIndex = "1000";
        if (isHovered) {
          hoverCard?.classList.add("opacity-100", "translate-y-0", "pointer-events-auto");
          hoverCard?.classList.remove("opacity-0", "translate-y-1", "pointer-events-none");
        }
        pill?.classList.add("scale-110", "ring-4", "ring-amber-500/40", "bg-amber-500", "text-zinc-950");
      } else {
        el.style.zIndex = "";
        hoverCard?.classList.remove("opacity-100", "translate-y-0", "pointer-events-auto");
        hoverCard?.classList.add("opacity-0", "translate-y-1", "pointer-events-none");
        pill?.classList.remove("scale-110", "ring-4", "ring-amber-500/40", "bg-amber-500", "text-zinc-950");
      }
    });
  }, [hoveredRoomId, activeRoom?.id]);

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

    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
    }

    const searchEl = document.createElement("div");
    searchEl.className = "relative flex items-center justify-center cursor-pointer";
    searchEl.innerHTML = `
      <div class="absolute w-10 h-10 rounded-full bg-amber-500/30 animate-ping pointer-events-none"></div>
      <div class="relative w-7 h-7 rounded-full bg-amber-500 border-2 border-white shadow-2xl flex items-center justify-center">
        <div class="w-2.5 h-2.5 rounded-full bg-zinc-950"></div>
      </div>
    `;

    const marker = new mapboxgl.Marker({ element: searchEl })
      .setLngLat(item.center)
      .addTo(map);

    searchMarkerRef.current = marker;

    map.flyTo({
      center: item.center,
      zoom: 16.5,
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

  // Các thao tác điều khiển camera bản đồ
  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleResetNorth = () => mapRef.current?.resetNorthPitch();
  const handleResetHCMC = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: HCMC_CENTER,
        zoom: 12.5,
        pitch: 35,
        bearing: 0,
        duration: 1200,
      });
    }
    setActiveRoom(null);
  };

  // Định vị vị trí hiện tại
  const handleGeolocate = () => {
    if ("geolocation" in navigator && mapRef.current) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          mapRef.current?.flyTo({
            center: [pos.coords.longitude, pos.coords.latitude],
            zoom: 16.5,
            pitch: 50,
            duration: 1400,
          });
        },
        (err) => {
          console.warn("Lỗi GPS:", err.message);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  // Bật/tắt nhanh bộ lọc từ các Pill trên thanh công cụ
  const handleToggleDistrictPill = (district: string) => {
    if (!onUpdateFilterOptions || !filterOptions) return;
    onUpdateFilterOptions((prev) => {
      const exists = prev.districts.includes(district);
      return {
        ...prev,
        districts: exists
          ? prev.districts.filter((d) => d !== district)
          : [...prev.districts, district],
      };
    });
  };

  const handleTogglePricePill = (bracket: PriceBracketKey) => {
    if (!onUpdateFilterOptions || !filterOptions) return;
    onUpdateFilterOptions((prev) => {
      const exists = prev.priceBrackets.includes(bracket);
      return {
        ...prev,
        priceBrackets: exists
          ? prev.priceBrackets.filter((b) => b !== bracket)
          : [...prev.priceBrackets, bracket],
      };
    });
  };

  const handleToggleStatusPill = (status: RoomStatus | "all") => {
    if (!onUpdateFilterOptions || !filterOptions) return;
    onUpdateFilterOptions((prev) => ({
      ...prev,
      status: prev.status === status ? "all" : status,
    }));
  };

  const handleTogglePet = () => {
    if (!onUpdateFilterOptions || !filterOptions) return;
    onUpdateFilterOptions((prev) => ({ ...prev, allowPet: !prev.allowPet }));
  };

  const handleToggleBalcony = () => {
    if (!onUpdateFilterOptions || !filterOptions) return;
    onUpdateFilterOptions((prev) => ({ ...prev, hasBalcony: !prev.hasBalcony }));
  };

  return (
    <div className="fixed inset-0 z-40 w-screen h-screen overflow-hidden bg-zinc-950 flex select-none">
      {/* 1. KHUNG MAPBOX TOÀN MÀN HÌNH (100vw x 100vh) */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* 2. THANH CÔNG CỤ TÌM KIẾM & BỘ LỌC CHUẨN GOOGLE MAPS (TOP BAR) */}
      <div className="absolute top-3.5 left-3.5 right-3.5 z-20 flex items-start gap-3 pointer-events-none">
        {/* A. THẺ TÌM KIẾM GOOGLE MAPS (TOP-LEFT CARD) */}
        <div className="relative pointer-events-auto shrink-0 w-84 sm:w-96 shadow-2xl rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 transition-all">
          <div className="flex items-center px-3 py-2 gap-2">
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="p-1.5 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title={isSidebarOpen ? "Thu gọn danh sách" : "Mở danh sách phòng"}
            >
              <Menu className="w-5 h-5 text-zinc-700 dark:text-zinc-200" />
            </button>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Tìm địa điểm, toà nhà, ĐH tại TP.HCM..."
              className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
            />

            {isSearching && (
              <Loader2 className="w-4 h-4 animate-spin text-amber-500 shrink-0" />
            )}

            {searchQuery && !isSearching && (
              <button
                onClick={handleClearSelectedLocation}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="w-[1px] h-5 bg-zinc-200 dark:bg-zinc-800 my-auto" />

            <button
              onClick={() => handleSearchChange(searchQuery)}
              className="p-1.5 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
              title="Tìm kiếm"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Gợi ý Geocoding Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-50 py-1 max-h-80 overflow-y-auto">
              {searchResults.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectLocation(item)}
                  className="w-full px-3.5 py-2.5 text-left hover:bg-amber-500/10 flex items-start gap-3 transition-colors cursor-pointer border-b border-zinc-100 dark:border-zinc-800/50 last:border-none"
                >
                  <MapPin className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {item.text}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate">{item.place_name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* B. DÃY NÚT BỘ LỌC CHUYÊN NGHIỆP CUỘN NGANG (GOOGLE MAPS CATEGORY CHIPS) */}
        <div className="pointer-events-auto flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {/* Nút Trạng thái */}
          <button
            onClick={() => handleToggleStatusPill("available")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-md backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 border ${
              filterOptions?.status === "available"
                ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20"
                : "bg-white/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-200 border-zinc-200/80 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Trống sẵn</span>
          </button>

          <button
            onClick={() => handleToggleStatusPill("holding")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-md backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 border ${
              filterOptions?.status === "holding"
                ? "bg-amber-500 text-zinc-950 font-bold border-amber-400 shadow-amber-500/20"
                : "bg-white/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-200 border-zinc-200/80 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Đang giữ chỗ</span>
          </button>

          {/* Phím lọc Giá tiền */}
          <button
            onClick={() => handleTogglePricePill("under_6")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-md backdrop-blur-md transition-all cursor-pointer border ${
              filterOptions?.priceBrackets.includes("under_6")
                ? "bg-amber-500 text-zinc-950 font-bold border-amber-400 shadow-amber-500/20"
                : "bg-white/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-200 border-zinc-200/80 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800"
            }`}
          >
            Dưới 6 triệu
          </button>

          <button
            onClick={() => handleTogglePricePill("6_to_9")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-md backdrop-blur-md transition-all cursor-pointer border ${
              filterOptions?.priceBrackets.includes("6_to_9")
                ? "bg-amber-500 text-zinc-950 font-bold border-amber-400 shadow-amber-500/20"
                : "bg-white/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-200 border-zinc-200/80 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800"
            }`}
          >
            6 - 9 triệu
          </button>

          <button
            onClick={() => handleTogglePricePill("9_to_12")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-md backdrop-blur-md transition-all cursor-pointer border ${
              filterOptions?.priceBrackets.includes("9_to_12")
                ? "bg-amber-500 text-zinc-950 font-bold border-amber-400 shadow-amber-500/20"
                : "bg-white/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-200 border-zinc-200/80 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800"
            }`}
          >
            9 - 12 triệu
          </button>

          {/* Phím tiện ích */}
          <button
            onClick={handleTogglePet}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-md backdrop-blur-md transition-all cursor-pointer border ${
              filterOptions?.allowPet
                ? "bg-amber-500 text-zinc-950 font-bold border-amber-400"
                : "bg-white/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-200 border-zinc-200/80 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800"
            }`}
          >
            🐾 Nuôi Pet
          </button>

          <button
            onClick={handleToggleBalcony}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-md backdrop-blur-md transition-all cursor-pointer border ${
              filterOptions?.hasBalcony
                ? "bg-amber-500 text-zinc-950 font-bold border-amber-400"
                : "bg-white/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-200 border-zinc-200/80 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800"
            }`}
          >
            🌿 Ban công
          </button>

          {/* Phím lọc theo Quận */}
          {availableDistricts.map((district) => (
            <button
              key={district}
              onClick={() => handleToggleDistrictPill(district)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shadow-md backdrop-blur-md transition-all cursor-pointer border ${
                filterOptions?.districts.includes(district)
                  ? "bg-amber-500 text-zinc-950 font-bold border-amber-400"
                  : "bg-white/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-200 border-zinc-200/80 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800"
              }`}
            >
              {district}
            </button>
          ))}
        </div>

        {/* C. CÁC NÚT ĐIỀU HƯỚNG GÓC PHẢI (TOP-RIGHT ACTIONS) */}
        <div className="pointer-events-auto flex items-center gap-2 shrink-0">
          {/* Nút Quay lại Danh sách Thẻ */}
          {onSwitchToGrid && (
            <button
              onClick={onSwitchToGrid}
              className="px-3.5 py-2 rounded-2xl bg-zinc-900/95 hover:bg-zinc-800 dark:bg-white/95 dark:hover:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-bold shadow-xl backdrop-blur-md border border-white/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4 text-amber-400 dark:text-amber-600" />
              <span className="hidden sm:inline">Danh sách Thẻ</span>
            </button>
          )}

          {/* Nút Đăng Quỹ Phòng Mới */}
          {onOpenCreateModal && (
            <button
              onClick={onOpenCreateModal}
              className="px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-xl border border-amber-300 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">Đăng Quỹ Phòng</span>
            </button>
          )}

          {/* Sale User Avatar Pill */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-xl text-xs font-medium text-zinc-800 dark:text-zinc-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="truncate max-w-[140px]">{saleUser.name}</span>
          </div>
        </div>
      </div>

      {/* 3. NGĂN KÉO DANH SÁCH PHÒNG BÊN TRÁI (GOOGLE MAPS DRAWER) */}
      <div
        className={`absolute top-16 bottom-4 left-3.5 z-20 w-84 sm:w-96 max-w-[90vw] transition-transform duration-300 ease-in-out pointer-events-auto flex flex-col bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xl overflow-hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-[110%]"
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>Quỹ phòng tại TP.HCM</span>
            </h3>

            <div className="flex items-center gap-1">
              {onResetFilters && (
                <button
                  onClick={onResetFilters}
                  className="px-2 py-1 rounded-lg text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Xóa lọc
                </button>
              )}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Thu gọn"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Badge thông báo trạng thái tìm kiếm quanh địa điểm */}
          {selectedLocation ? (
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs">
              <div className="min-w-0 pr-1">
                <p className="text-xs text-amber-800 dark:text-amber-300 font-bold truncate">
                  📍 Gần: {selectedLocation.name}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Đã sắp xếp danh sách theo khoảng cách gần nhất
                </p>
              </div>
              <button
                onClick={handleClearSelectedLocation}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white cursor-pointer shrink-0"
                title="Bỏ lọc khoảng cách"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <span className="text-[11px] text-zinc-500 block">
              Tìm thấy <strong className="text-zinc-900 dark:text-white">{displayRooms.length}</strong> phòng phù hợp
            </span>
          )}
        </div>

        {/* Scrollable Room List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {displayRooms.length > 0 ? (
            displayRooms.map((room) => {
              const isSelected = activeRoom?.id === room.id;
              const isHovered = hoveredRoomId === room.id;
              const coords = getRoomCoordinates(room);

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
                        zoom: 17.8, // Zoom siêu gần toà nhà
                        pitch: 55,
                        duration: 1200,
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
            })
          ) : (
            <div className="p-8 text-center space-y-2 text-zinc-500">
              <p className="text-xs">Không có phòng nào phù hợp với bộ lọc hiện tại.</p>
              {onResetFilters && (
                <button
                  onClick={onResetFilters}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. NÚT MỞ LẠI NGĂN KÉO KHI ĐANG THU GỌN (GOOGLE MAPS TAB BUTTON) */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-20 left-3.5 z-20 pointer-events-auto p-3 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 shadow-2xl hover:bg-white dark:hover:bg-zinc-800 transition-all flex items-center gap-2 cursor-pointer"
          title="Mở danh sách phòng"
        >
          <ChevronRight className="w-5 h-5 text-amber-500" />
          <span className="text-xs font-bold hidden sm:inline">Quỹ phòng ({displayRooms.length})</span>
        </button>
      )}

      {/* 5. NÚT "LỚP" (LAYERS) GÓC DƯỚI BÊN TRÁI CHUẨN GOOGLE MAPS */}
      <div className="absolute bottom-6 left-3.5 z-20 pointer-events-auto">
        <div className="relative">
          <button
            onClick={() => setIsLayersOpen((prev) => !prev)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-2xl hover:scale-105 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center font-bold text-base shadow-sm">
              {MAP_STYLES[currentStyle].icon}
            </div>
            <div className="text-left pr-1">
              <span className="text-xs font-bold text-zinc-900 dark:text-white block">Lớp bản đồ</span>
              <span className="text-[10px] text-zinc-500">{MAP_STYLES[currentStyle].name}</span>
            </div>
          </button>

          {/* Menu chọn Lớp bản đồ mở lên */}
          {isLayersOpen && (
            <div className="absolute bottom-full left-0 mb-3 w-64 p-2.5 rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="px-2 py-1 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                Chọn kiểu hiển thị
              </div>

              {(Object.keys(MAP_STYLES) as (keyof typeof MAP_STYLES)[]).map((key) => (
                <button
                  key={key}
                  onClick={() => handleSwitchStyle(key)}
                  className={`w-full p-2 rounded-2xl flex items-center gap-3 transition-colors cursor-pointer text-left ${
                    currentStyle === key
                      ? "bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  <span className="text-xl">{MAP_STYLES[key].icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold">{MAP_STYLES[key].name}</p>
                    <p className="text-[10px] text-zinc-400">{MAP_STYLES[key].sub}</p>
                  </div>
                  {currentStyle === key && <Check className="w-4 h-4 text-amber-500" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. BỘ ĐIỀU KHIỂN BẢN ĐỒ GÓC DƯỚI BÊN PHẢI (ZOOM, COMPASS, GPS, RESET) */}
      <div className="absolute bottom-6 right-3.5 z-20 pointer-events-auto flex flex-col gap-2">
        {/* Cụm Zoom in / out */}
        <div className="flex flex-col rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="p-2.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-b border-zinc-100 dark:border-zinc-800"
            title="Phóng to"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2.5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Thu nhỏ"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Nút Reset Bắc / La bàn */}
        <button
          onClick={handleResetNorth}
          className="p-2.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Đặt lại hướng Bắc"
        >
          <Compass className="w-4 h-4 text-amber-500" />
        </button>

        {/* Nút Định vị GPS vị trí hiện tại */}
        <button
          onClick={handleGeolocate}
          className="p-2.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Định vị vị trí của tôi"
        >
          <LocateFixed className="w-4 h-4 text-sky-500" />
        </button>

        {/* Nút Toàn cảnh TP.HCM */}
        <button
          onClick={handleResetHCMC}
          className="p-2.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 shadow-2xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Toàn cảnh TP.HCM"
        >
          <Building className="w-4 h-4 text-amber-500" />
        </button>
      </div>

      {/* 7. FLOATING PREVIEW CARD KHI BẤM VÀO MARKER TRÊN BẢN ĐỒ */}
      {activeRoom && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-16 w-[92vw] sm:w-96 z-30 pointer-events-auto bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-4 rounded-3xl border border-amber-500/40 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-serif px-2.5 py-0.5 rounded-lg text-xs font-bold bg-zinc-950 text-amber-300 border border-amber-500/30">
                {activeRoom.roomCode}
              </span>
              <span className="text-xs text-zinc-500 font-medium">Tầng {activeRoom.floor}</span>
              <span className="text-xs text-zinc-500">• {ROOM_TYPE_MAP[activeRoom.type]}</span>
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
