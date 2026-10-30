"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { DISTRICT_COORDINATES, HCMC_CENTER } from "@/lib/geoUtils";
import { useToast } from "./Toast";
import {
  MapPin,
  Link as LinkIcon,
  Search,
  Crosshair,
  Sparkles,
  Check,
  RotateCcw,
  ExternalLink,
  Navigation,
  Loader2,
  AlertCircle,
} from "lucide-react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface MapLocationPickerProps {
  lat: number;
  lng: number;
  address?: string;
  district?: string;
  googleMapsUrl?: string;
  onChangeLocation: (coords: {
    lat: number;
    lng: number;
    googleMapsUrl?: string;
    resolvedAddress?: string;
  }) => void;
  compact?: boolean;
}

export function MapLocationPicker({
  lat,
  lng,
  address = "",
  district = "Quận 1",
  googleMapsUrl = "",
  onChangeLocation,
  compact = false,
}: MapLocationPickerProps) {
  const { showToast } = useToast();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // States
  const [activeTab, setActiveTab] = useState<"link" | "auto" | "pick">("link");
  const [urlInput, setUrlInput] = useState(googleMapsUrl);
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [resolvedPlaceName, setResolvedPlaceName] = useState<string | null>(null);
  const [isCustomCoordinates, setIsCustomCoordinates] = useState(false);

  // Current Coordinates in component
  const [currentLat, setCurrentLat] = useState(lat || HCMC_CENTER[1]);
  const [currentLng, setCurrentLng] = useState(lng || HCMC_CENTER[0]);

  // Sync internal state if external lat/lng changes
  useEffect(() => {
    if (lat && lng && (lat !== currentLat || lng !== currentLng)) {
      setCurrentLat(lat);
      setCurrentLng(lng);
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      }
      if (mapRef.current) {
        mapRef.current.flyTo({ center: [lng, lat], zoom: 16 });
      }
    }
  }, [lat, lng]);

  // 1. Khởi tạo bản đồ Mapbox GL mini picker
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // Tránh tạo lại bản đồ nếu đã tồn tại

    mapboxgl.accessToken = MAPBOX_TOKEN;
    if (typeof window !== "undefined") {
      mapboxgl.workerUrl = `${window.location.origin}/mapbox-gl-csp-worker.js`;
    }

    const initialLng = currentLng || HCMC_CENTER[0];
    const initialLat = currentLat || HCMC_CENTER[1];

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [initialLng, initialLat],
      zoom: 15,
      attributionControl: false,
    });

    // Tạo phần tử ghim mốc tùy chỉnh (Custom Pulsing Marker)
    const markerEl = document.createElement("div");
    markerEl.className = "group relative flex items-center justify-center cursor-grab active:cursor-grabbing";
    markerEl.innerHTML = `
      <div class="relative flex items-center justify-center">
        <span class="absolute w-8 h-8 rounded-full bg-rose-500/30 animate-ping"></span>
        <div class="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-zinc-900 transition-transform group-hover:scale-110">
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
          </svg>
        </div>
      </div>
    `;

    const marker = new mapboxgl.Marker({
      element: markerEl,
      draggable: true,
    })
      .setLngLat([initialLng, initialLat])
      .addTo(map);

    // Kéo thả marker để chọn vị trí
    marker.on("dragend", () => {
      const lngLat = marker.getLngLat();
      setCurrentLat(lngLat.lat);
      setCurrentLng(lngLat.lng);
      setIsCustomCoordinates(true);
      onChangeLocation({ lat: lngLat.lat, lng: lngLat.lng });
      showToast(`Đã ghim mốc mới: ${lngLat.lat.toFixed(4)}, ${lngLat.lng.toFixed(4)}`, "success");
    });

    // Bấm bất kỳ đâu trên map để di chuyển marker
    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      marker.setLngLat([lng, lat]);
      setCurrentLat(lat);
      setCurrentLng(lng);
      setIsCustomCoordinates(true);
      onChangeLocation({ lat, lng });
      showToast(`Đã ghim tại vị trí click: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, "success");
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Di chuyển camera và marker tới tọa độ mới
  const updateMapPosition = useCallback(
    (newLat: number, newLng: number, zoom = 16.5) => {
      setCurrentLat(newLat);
      setCurrentLng(newLng);
      setIsCustomCoordinates(true);

      if (markerRef.current) {
        markerRef.current.setLngLat([newLng, newLat]);
      }
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [newLng, newLat],
          zoom,
          essential: true,
        });
      }
    },
    []
  );

  // 1. Xử lý Dán liên kết Google Maps (Mode 3)
  const handleResolveGoogleMapsLink = async () => {
    if (!urlInput.trim()) {
      showToast("Vui lòng dán link Google Maps vào ô!", "error");
      return;
    }

    setIsResolvingUrl(true);
    setResolvedPlaceName(null);

    try {
      const res = await fetch("/api/resolve-maps-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim() }),
      });

      const data = await res.json();

      if (data.success && data.lat && data.lng) {
        updateMapPosition(data.lat, data.lng, 16.5);
        setResolvedPlaceName(data.placeName || null);
        onChangeLocation({
          lat: data.lat,
          lng: data.lng,
          googleMapsUrl: urlInput.trim(),
          resolvedAddress: data.placeName || undefined,
        });
        showToast(
          `Đã định vị thành công từ Google Maps: ${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}`,
          "success"
        );
      } else {
        showToast(data.error || "Không thể lấy tọa độ từ link này", "error");
      }
    } catch (err: any) {
      showToast("Lỗi kết nối tới máy chủ khi bóc tách link!", "error");
    } finally {
      setIsResolvingUrl(false);
    }
  };

  // 2. Xử lý Tự động định vị từ địa chỉ nhập (Mode 1)
  const handleAutoGeocodeFromAddress = async () => {
    const fullQuery = `${address.trim()}, ${district}, TP.HCM`.trim();

    if (!address.trim()) {
      showToast("Vui lòng nhập địa chỉ số nhà & tên đường trước!", "error");
      return;
    }

    setIsGeocoding(true);

    try {
      // Làm sạch địa chỉ để tìm kiếm tốt nhất
      let cleanQuery = fullQuery.replace(/\b([Dd])uệt\b/g, (m, p) => (p === "D" ? "Duyệt" : "duyệt"));

      const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        cleanQuery
      )}.json?country=vn&proximity=106.6990,10.7760&limit=1&access_token=${MAPBOX_TOKEN}`;

      const res = await fetch(endpoint);
      const data = await res.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [foundLng, foundLat] = feature.center;
        updateMapPosition(foundLat, foundLng, 16);
        onChangeLocation({
          lat: foundLat,
          lng: foundLng,
        });
        showToast(
          `Đã tìm thấy vị trí phù hợp: ${feature.place_name?.split(",")[0] || ""}`,
          "success"
        );
      } else {
        // Fallback về trung tâm quận nếu không tìm thấy
        const fallback = DISTRICT_COORDINATES[district] || {
          lat: HCMC_CENTER[1],
          lng: HCMC_CENTER[0],
        };
        updateMapPosition(fallback.lat, fallback.lng, 14);
        showToast(`Không tìm thấy chính xác số nhà, đã ghim về trung tâm ${district}`, "info");
      }
    } catch {
      showToast("Không thể kết nối dịch vụ định vị tự động!", "error");
    } finally {
      setIsGeocoding(false);
    }
  };

  // 3. Xử lý Lấy vị trí GPS hiện tại của người dùng
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast("Trình duyệt không hỗ trợ định vị GPS!", "error");
      return;
    }

    showToast("Đang xác định tọa độ GPS của bạn...", "info");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        updateMapPosition(latitude, longitude, 17);
        onChangeLocation({ lat: latitude, lng: longitude });
        showToast("Đã lấy thành công vị trí GPS hiện tại của bạn!", "success");
      },
      () => {
        showToast("Không thể truy cập GPS thiết bị. Vui lòng cấp quyền vị trí!", "error");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Đặt lại về trung tâm quận mặc định
  const handleResetToDistrict = () => {
    const defaultCoords = DISTRICT_COORDINATES[district] || {
      lat: HCMC_CENTER[1],
      lng: HCMC_CENTER[0],
    };
    updateMapPosition(defaultCoords.lat, defaultCoords.lng, 14);
    setIsCustomCoordinates(false);
    onChangeLocation({ lat: defaultCoords.lat, lng: defaultCoords.lng });
    showToast(`Đã đặt lại về tọa độ trung tâm ${district}`, "info");
  };

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80">
      {/* Tiêu đề & Chọn phương thức */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200/80 dark:border-zinc-700/80 pb-2.5">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Vị trí chính xác trên bản đồ (GPS)
          </span>
        </div>

        {/* 3 Tab chuyển đổi phương thức chọn vị trí */}
        <div className="flex items-center gap-1 bg-zinc-200/70 dark:bg-zinc-900/60 p-0.5 rounded-xl text-[11px] font-semibold w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("link")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === "link"
                ? "bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>Link GG Maps</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("auto")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === "auto"
                ? "bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Tự động chọn</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pick")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === "pick"
                ? "bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Crosshair className="w-3 h-3" />
            <span>Tích chọn trên map</span>
          </button>
        </div>
      </div>

      {/* NỘI DUNG TỪNG TAB */}
      {/* TAB 1: DÁN LINK GOOGLE MAPS */}
      {activeTab === "link" && (
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Dán link Google Maps (VD: https://maps.app.goo.gl/i6gmJKqmSFLEjefZ6)"
                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-zinc-900 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 outline-none focus:border-rose-500"
              />
              <LinkIcon className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <button
              type="button"
              disabled={isResolvingUrl || !urlInput.trim()}
              onClick={handleResolveGoogleMapsLink}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isResolvingUrl ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang trích xuất...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Trích xuất GPS</span>
                </>
              )}
            </button>
          </div>

          {/* Gợi ý nếu đã trích xuất được địa danh */}
          {resolvedPlaceName && (
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px]">
              <div className="flex items-center gap-1.5 truncate">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">
                  Google Maps xác nhận: <strong>{resolvedPlaceName}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onChangeLocation({
                    lat: currentLat,
                    lng: currentLng,
                    resolvedAddress: resolvedPlaceName,
                  });
                  showToast("Đã cập nhật địa chỉ theo link Google Maps!", "success");
                }}
                className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 underline hover:no-underline shrink-0 cursor-pointer"
              >
                Áp dụng địa chỉ này
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TỰ ĐỘNG ĐỊNH VỊ TỪ ĐỊA CHỈ NHẬP */}
      {activeTab === "auto" && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Hệ thống sẽ tự động quét địa chỉ:{" "}
              <strong>
                {address.trim() ? `${address.trim()}, ${district}` : "Chưa nhập địa chỉ"}
              </strong>
            </span>
          </div>

          <button
            type="button"
            disabled={isGeocoding || !address.trim()}
            onClick={handleAutoGeocodeFromAddress}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {isGeocoding ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang quét vị trí...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Quét định vị ngay</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* TAB 3: TÍCH CHỌN TRỰC TIẾP TRÊN BẢN ĐỒ */}
      {activeTab === "pick" && (
        <div className="flex items-center justify-between gap-2 text-xs text-zinc-600 dark:text-zinc-400">
          <span className="text-[11px] flex items-center gap-1">
            <Crosshair className="w-3.5 h-3.5 text-rose-500" />
            <span>
              <strong>Bấm vào bất kỳ đâu</strong> trên map hoặc <strong>kéo mốc đỏ</strong> để chọn
              vị trí toà nhà.
            </span>
          </span>

          <button
            type="button"
            onClick={handleGetCurrentLocation}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 text-[11px] font-semibold transition-colors shrink-0 cursor-pointer"
            title="Lấy GPS hiện tại từ điện thoại/máy tính"
          >
            <Crosshair className="w-3 h-3 text-rose-500" />
            <span>Vị trí của tôi</span>
          </button>
        </div>
      )}

      {/* KHUNG BẢN ĐỒ MAPBOX MINI PICKER */}
      <div className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-inner bg-zinc-100 dark:bg-zinc-900">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Nút Reset vị trí về trung tâm quận */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
          <button
            type="button"
            onClick={handleResetToDistrict}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border border-zinc-200/80 dark:border-zinc-700 text-[10px] font-semibold shadow-xs transition-colors cursor-pointer"
            title="Đặt lại về trung tâm quận"
          >
            <RotateCcw className="w-3 h-3 text-zinc-500" />
            <span>Về {district}</span>
          </button>
        </div>

        {/* Chỉ báo tọa độ GPS hiện tại góc dưới bản đồ */}
        <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/85 text-white backdrop-blur-md text-[10px] font-mono shadow-md border border-white/10">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>
              GPS: {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
            </span>
            {isCustomCoordinates && (
              <span className="ml-1 text-[9px] font-sans font-bold text-emerald-400">
                (Đã ghim mốc)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
