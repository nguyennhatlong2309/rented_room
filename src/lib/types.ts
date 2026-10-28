export type RoomStatus = 'available' | 'holding' | 'deposited' | 'occupied' | 'soon_available';

export type RoomType = 'studio' | '1pn' | '2pn' | 'duplex' | 'dorm';

export interface Amenity {
  id: string;
  name: string;
  icon: string;
}

export interface Building {
  id: string;
  name: string;
  address: string;
  district: string;
  city: string;
  totalFloors: number;
  managerName: string;
  managerPhone: string;
  sharedAmenities: string[];
}

export interface ServiceFees {
  electricity: string;
  water: string;
  waterPerPerson?: string;
  waterPerM3?: string;
  internet: string;
  parking: string;
  serviceFee?: string;
}

export interface LandlordInfo {
  name: string;          // Tên chủ hộ hoặc quản lý toà (VD: "Cô Lan (Chủ nhà)", "Anh Tuấn (QL toà)")
  phone: string;         // Số điện thoại gọi trực tiếp (VD: "0908 123 456")
  zaloPhone?: string;    // SĐT Zalo để gửi tin nhắn
  doorPassword?: string; // Mật khẩu cửa cổng / Mã vân tay (VD: "Pass cửa: #123456")
  callNotice?: string;   // Lưu ý khi liên hệ (VD: "Gọi trước 15 phút", "Chủ ở tầng trệt")
}

export interface Room {
  id: string;
  roomCode: string;
  buildingId: string;
  buildingName: string;
  district: string;
  ward?: string;         // Phường / Xã (VD: "Phường Tân Hưng", "Phường Bến Nghé")
  address: string;
  floor: number;
  type: RoomType;
  area: number;
  price: number;
  deposit: number;
  commission: string;
  status: RoomStatus;
  availableDate?: string;
  images: string[];
  videoUrl?: string;
  furniture: string[];
  serviceFees: ServiceFees;
  landlord: LandlordInfo; // Thông tin liên hệ trực tiếp CHỦ HỘ / Quản lý
  notesForSale: string;
  allowPet: boolean;
  hasElevator: boolean;
  hasBalcony: boolean;
  maxTenants: number;
  createdAt: string;
}

export interface RoomHold {
  id: string;
  roomId: string;
  roomCode: string;
  saleName: string;
  salePhone: string;
  customerName: string;
  customerPhone: string;
  heldAt: string;
  expiresAt: string;
  notes?: string;
}

export type PriceBracketKey = 'under_6' | '6_to_9' | '9_to_12' | 'over_12';

export interface FilterOptions {
  searchQuery: string;
  status: RoomStatus | 'all';
  districts: string[];              // Chọn nhiều quận tại TP.HCM
  roomTypes: RoomType[];            // Chọn nhiều loại phòng (ví dụ: vừa gác vừa 1PN)
  priceBrackets: PriceBracketKey[]; // Chọn nhiều khoảng giá (ví dụ: vừa dưới 6tr vừa 6-9tr)
  allowPet: boolean;                // Chỉ lọc phòng cho phép nuôi Pet nếu true
  hasBalcony: boolean;              // Chỉ lọc phòng có ban công nếu true
  hasElevator: boolean;             // Chỉ lọc phòng có thang máy nếu true
  sortBy: 'price_asc' | 'price_desc' | 'area_desc' | 'newest';
}
