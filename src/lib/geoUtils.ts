import { Room } from "./types";

// Bảng tọa độ trung tâm các Quận / Huyện tại TP.HCM (Kinh độ, Vĩ độ)
export const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Quận 1": { lat: 10.7756, lng: 106.7019 },
  "Quận 3": { lat: 10.7844, lng: 106.6844 },
  "Quận 4": { lat: 10.7610, lng: 106.7042 },
  "Quận 5": { lat: 10.7554, lng: 106.6669 },
  "Quận 6": { lat: 10.7473, lng: 106.6346 },
  "Quận 7": { lat: 10.7410, lng: 106.7050 },
  "Quận 8": { lat: 10.7240, lng: 106.6286 },
  "Quận 10": { lat: 10.7725, lng: 106.6669 },
  "Quận 11": { lat: 10.7629, lng: 106.6504 },
  "Quận 12": { lat: 10.8672, lng: 106.6414 },
  "Bình Thạnh": { lat: 10.8012, lng: 106.7115 },
  "Phú Nhuận": { lat: 10.7992, lng: 106.6828 },
  "Gò Vấp": { lat: 10.8387, lng: 106.6653 },
  "Tân Bình": { lat: 10.7983, lng: 106.6578 },
  "Tân Phú": { lat: 10.7900, lng: 106.6280 },
  "Bình Tân": { lat: 10.7654, lng: 106.6038 },
  "TP. Thủ Đức": { lat: 10.8494, lng: 106.7537 },
  "Nhà Bè": { lat: 10.6953, lng: 106.7272 },
  "Bình Chánh": { lat: 10.6874, lng: 106.5938 },
  "Hóc Môn": { lat: 10.8841, lng: 106.5913 },
  "Củ Chi": { lat: 11.0067, lng: 106.5132 },
  "Cần Giờ": { lat: 10.4114, lng: 106.9546 },
};

// Tọa độ mặc định trung tâm TP.HCM (Bến Thành / Landmark 81)
export const HCMC_CENTER: [number, number] = [106.6990, 10.7760]; // [lng, lat]

/**
 * Lấy tọa độ [lng, lat] chuẩn cho Mapbox / MapLibre.
 * Nếu phòng chưa có lat/lng, tự suy luận từ Quận tại TP.HCM (kèm một chút offset nhẹ để không bị đè ghim).
 */
export function getRoomCoordinates(room: Room, index: number = 0): [number, number] {
  if (room.lng && room.lat) {
    return [room.lng, room.lat];
  }

  const districtCenter = DISTRICT_COORDINATES[room.district];
  if (districtCenter) {
    // Offset nhẹ dựa trên ID hoặc index để các phòng cùng quận không bị chồng khít lên nhau
    const offsetLng = ((index % 5) - 2) * 0.0035;
    const offsetLat = (Math.floor(index / 5) - 1) * 0.0035;
    return [districtCenter.lng + offsetLng, districtCenter.lat + offsetLat];
  }

  return HCMC_CENTER;
}

/**
 * Rút gọn giá tiền để hiển thị ngắn gọn trên ghim bản đồ (VD: "5.8tr", "7.5tr", "12tr")
 */
export function formatPricePill(price: number): string {
  if (price >= 1_000_000) {
    const val = price / 1_000_000;
    return `${val % 1 === 0 ? val : val.toFixed(1)}tr`;
  }
  return `${Math.round(price / 1_000)}k`;
}

/**
 * Tính khoảng cách (km) giữa 2 tọa độ GPS [lng, lat] theo công thức Haversine
 */
export function calculateDistanceKm(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Định dạng khoảng cách thân thiện cho người dùng (VD: "450m" hoặc "1.8km")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
}

