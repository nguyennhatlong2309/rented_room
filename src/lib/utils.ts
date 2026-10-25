import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Room, RoomStatus, RoomType } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    return `${millions.toLocaleString("vi-VN", { maximumFractionDigits: 1 })} triệu/tháng`;
  }
  return `${amount.toLocaleString("vi-VN")} đ/tháng`;
}

export function formatVND(amount: number): string {
  return `${amount.toLocaleString("vi-VN")} đ`;
}

export const ROOM_STATUS_MAP: Record<
  RoomStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  available: {
    label: "Trống sẵn",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  holding: {
    label: "Đang giữ chỗ",
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-500/20",
    dot: "bg-amber-500 animate-pulse",
  },
  soon_available: {
    label: "Sắp trống",
    bg: "bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-500/20",
    dot: "bg-blue-500",
  },
  deposited: {
    label: "Đã cọc",
    bg: "bg-purple-500/10",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-500/20",
    dot: "bg-purple-500",
  },
  occupied: {
    label: "Đang ở",
    bg: "bg-zinc-500/10",
    text: "text-zinc-600 dark:text-zinc-400",
    border: "border-zinc-500/20",
    dot: "bg-zinc-400",
  },
};

export const ROOM_TYPE_MAP: Record<RoomType, string> = {
  studio: "Studio",
  "1pn": "1 Phòng Ngủ",
  "2pn": "2 Phòng Ngủ",
  duplex: "Duplex / Gác lửng",
  dorm: "Ký túc xá / Sleepbox",
};

/**
 * Sinh mẫu tin nhắn gửi khách hàng chuyên nghiệp cho Zalo / FB Messenger
 */
export function generateClientShareMessage(room: Room, saleInfo?: { name: string; phone: string }): string {
  const statusLabel = ROOM_STATUS_MAP[room.status].label;
  const statusNote = room.status === 'soon_available' && room.availableDate 
    ? `Sắp trống (Dự kiến: ${room.availableDate})`
    : statusLabel;

  return `🏠 [CĂN HỘ / PHÒNG CHO THUÊ TIỆN NGHI]
📍 Địa chỉ: ${room.address}, ${room.district}
🏢 Toà nhà: ${room.buildingName} - Mã phòng: ${room.roomCode} (Tầng ${room.floor})
📐 Diện tích: ${room.area}m² - Loại phòng: ${ROOM_TYPE_MAP[room.type]}

💰 GIÁ THUÊ & PHÍ DỊCH VỤ:
• Giá thuê: ${formatVND(room.price)}/tháng (Cọc: ${formatVND(room.deposit)})
• Điện: ${room.serviceFees.electricity}
• Nước: ${room.serviceFees.water}
• Xe: ${room.serviceFees.parking}
• Wifi: ${room.serviceFees.internet}
${room.serviceFees.serviceFee ? `• Phí dịch vụ chung: ${room.serviceFees.serviceFee}\n` : ''}
🛋️ NỘI THẤT BÀN GIAO:
${room.furniture.map(f => ` • ${f}`).join('\n')}

✨ ĐẶC ĐIỂM NỔI BẬT:
• ${room.hasElevator ? 'Có thang máy' : 'Thang bộ thuận tiện'}
• ${room.hasBalcony ? 'Có ban công / Cửa sổ lớn thoáng mát' : 'Cửa sổ giếng trời thông thoáng'}
• ${room.allowPet ? 'Cho phép nuôi thú cưng' : 'Không nuôi thú cưng'}
• Giờ giấc tự do, không chung chủ, khóa cửa vân tay an ninh 24/7.
• Trạng thái hiện tại: ${statusNote}

📸 HÌNH ẢNH THỰC TẾ:
${room.images.slice(0, 3).map((img, idx) => `Ảnh ${idx + 1}: ${img}`).join('\n')}

📲 Liên hệ dẫn xem phòng trực tiếp miễn phí:
${saleInfo?.name ? `Chuyên viên tư vấn: ${saleInfo.name} - SĐT: ${saleInfo.phone}` : 'Chuyên viên tư vấn phòng - Hỗ trợ xem phòng 24/7'}`;
}
