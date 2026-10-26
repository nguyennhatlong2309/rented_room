"use client";

import React, { useState, useEffect } from "react";
import { Room, RoomType } from "@/lib/types";
import { useToast } from "./Toast";
import {
  X,
  Upload,
  Image as ImageIcon,
  Building,
  Phone,
  Key,
  DollarSign,
  Sparkles,
  FileText,
  Dog,
  Sun,
  Layers,
  Plus,
  Trash2,
  MapPin,
  Check,
  Compass,
} from "lucide-react";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (room: Room) => void;
}

const POPULAR_DISTRICTS = [
  "Quận 1",
  "Quận 3",
  "Quận 7",
  "Quận 10",
  "Bình Thạnh",
  "Phú Nhuận",
  "Tân Bình",
  "Gò Vấp",
  "TP. Thủ Đức",
];

const ALL_HCM_DISTRICTS = [
  "Quận 1",
  "Quận 3",
  "Quận 4",
  "Quận 5",
  "Quận 6",
  "Quận 7",
  "Quận 8",
  "Quận 10",
  "Quận 11",
  "Quận 12",
  "Bình Thạnh",
  "Phú Nhuận",
  "Tân Bình",
  "Tân Phú",
  "Gò Vấp",
  "Bình Tân",
  "TP. Thủ Đức",
  "Huyện Nhà Bè",
  "Huyện Bình Chánh",
  "Huyện Hóc Môn",
  "Huyện Củ Chi",
  "Huyện Cần Giờ",
];

export const HCM_WARDS_BY_DISTRICT: Record<string, string[]> = {
  "Quận 1": [
    "Phường Bến Nghé",
    "Phường Bến Thành",
    "Phường Đa Kao",
    "Phường Tân Định",
    "Phường Phạm Ngũ Lão",
    "Phường Cầu Ông Lãnh",
    "Phường Nguyễn Thái Bình",
    "Phường Cô Giang",
    "Phường Cầu Kho",
    "Phường Nguyễn Cư Trinh",
  ],
  "Quận 3": [
    "Phường Võ Thị Sáu",
    "Phường 1",
    "Phường 2",
    "Phường 3",
    "Phường 4",
    "Phường 5",
    "Phường 9",
    "Phường 11",
    "Phường 12",
    "Phường 14",
  ],
  "Quận 4": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 6", "Phường 8", "Phường 9", "Phường 10", "Phường 13", "Phường 14", "Phường 15", "Phường 16", "Phường 18"
  ],
  "Quận 5": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14"
  ],
  "Quận 6": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14"
  ],
  "Quận 7": [
    "Phường Tân Hưng",
    "Phường Tân Phong",
    "Phường Tân Quy",
    "Phường Tân Kiểng",
    "Phường Tân Phú",
    "Phường Phú Mỹ",
    "Phường Bình Thuận",
    "Phường Tân Thuận Đông",
    "Phường Tân Thuận Tây",
    "Phường Phú Thuận",
  ],
  "Quận 8": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16"
  ],
  "Quận 10": [
    "Phường 1", "Phường 2", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15"
  ],
  "Quận 11": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16"
  ],
  "Quận 12": [
    "Phường Thạnh Xuân", "Phường Thạnh Lộc", "Phường Hiệp Thành", "Phường Thới An", "Phường Tân Chánh Hiệp", "Phường An Phú Đông", "Phường Tân Thới Hiệp", "Phường Trung Mỹ Tây", "Phường Tân Hưng Thuận", "Phường Đông Hưng Thuận", "Phường Tân Thới Nhất"
  ],
  "Bình Thạnh": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 5", "Phường 6", "Phường 7", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 17", "Phường 19", "Phường 21", "Phường 22", "Phường 24", "Phường 25", "Phường 26", "Phường 27", "Phường 28"
  ],
  "Phú Nhuận": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 13", "Phường 15", "Phường 17"
  ],
  "Tân Bình": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15"
  ],
  "Tân Phú": [
    "Phường Hiệp Tân", "Phường Hòa Thạnh", "Phường Phú Thạnh", "Phường Phú Thọ Hòa", "Phường Phú Trung", "Phường Sơn Kỳ", "Phường Tân Quý", "Phường Tân Sơn Nhì", "Phường Tân Thành", "Phường Tân Thới Hòa", "Phường Tây Thạnh"
  ],
  "Gò Vấp": [
    "Phường 1", "Phường 3", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16", "Phường 17"
  ],
  "Bình Tân": [
    "Phường An Lạc", "Phường An Lạc A", "Phường Bình Hưng Hòa", "Phường Bình Hưng Hòa A", "Phường Bình Hưng Hòa B", "Phường Bình Trị Đông", "Phường Bình Trị Đông A", "Phường Bình Trị Đông B", "Phường Tân Tạo", "Phường Tân Tạo A"
  ],
  "TP. Thủ Đức": [
    "Phường Thảo Điền", "Phường An Phú", "Phường An Khánh", "Phường Thủ Thiêm", "Phường Hiệp Bình Chánh", "Phường Hiệp Bình Phước", "Phường Linh Tây", "Phường Linh Trung", "Phường Linh Chiểu", "Phường Linh Đông", "Phường Tam Bình", "Phường Tam Phú", "Phường Bình Chiểu", "Phường Tăng Nhơn Phú A", "Phường Tăng Nhơn Phú B", "Phường Phước Long A", "Phường Phước Long B", "Phường Trường Thạnh", "Phường Long Trường", "Phường Long Phước"
  ],
  "Huyện Nhà Bè": [
    "Thị trấn Nhà Bè", "Xã Phước Kiển", "Xã Phước Lộc", "Xã Nhơn Đức", "Xã Phú Xuân", "Xã Long Thới", "Xã Hiệp Phước"
  ],
  "Huyện Bình Chánh": [
    "Thị trấn Tân Túc", "Xã Bình Hưng", "Xã Phong Phú", "Xã An Phú Tây", "Xã Đa Phước", "Xã Vĩnh Lộc A", "Xã Vĩnh Lộc B"
  ],
  "Huyện Hóc Môn": [
    "Thị trấn Hóc Môn", "Xã Bà Điểm", "Xã Tân Xuân", "Xã Trung Chánh", "Xã Xuân Thới Đông", "Xã Thới Tam Thôn"
  ],
  "Huyện Củ Chi": [
    "Thị trấn Củ Chi", "Xã Tân An Hội", "Xã Phước Vĩnh An", "Xã Tân Thạnh Đông", "Xã Bình Mỹ"
  ],
  "Huyện Cần Giờ": [
    "Thị trấn Cần Thạnh", "Xã Long Hòa", "Xã Bình Khánh", "Xã Tam Thôn Hiệp"
  ],
};

export function CreateRoomModal({
  isOpen,
  onClose,
  onCreateRoom,
}: CreateRoomModalProps) {
  const { showToast } = useToast();

  // Form states
  const [roomCode, setRoomCode] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [district, setDistrict] = useState("Quận 7");
  const [isCustomDistrict, setIsCustomDistrict] = useState(false);
  const [customDistrict, setCustomDistrict] = useState("");
  
  // Ward states
  const [ward, setWard] = useState("Phường Tân Hưng");
  const [isCustomWard, setIsCustomWard] = useState(false);
  const [customWard, setCustomWard] = useState("");

  const [address, setAddress] = useState("");
  const [floor, setFloor] = useState(2);
  const [type, setType] = useState<RoomType>("studio");
  const [area, setArea] = useState(30);
  const [price, setPrice] = useState(6000000);
  const [deposit, setDeposit] = useState(6000000);
  const [commission, setCommission] = useState("50% tháng đầu");

  // Landlord states
  const [landlordName, setLandlordName] = useState("");
  const [landlordPhone, setLandlordPhone] = useState("");
  const [doorPassword, setDoorPassword] = useState("");
  const [callNotice, setCallNotice] = useState("");

  // Services
  const [electricity, setElectricity] = useState("3.800đ/kWh");
  const [water, setWater] = useState("100.000đ/người");
  const [internet, setInternet] = useState("Miễn phí");
  const [parking, setParking] = useState("100.000đ/xe");
  const [serviceFee, setServiceFee] = useState("150.000đ/phòng");

  // Features
  const [allowPet, setAllowPet] = useState(false);
  const [hasBalcony, setHasBalcony] = useState(true);
  const [hasElevator, setHasElevator] = useState(true);
  const [notesForSale, setNotesForSale] = useState("");

  // Image Uploads (File & Preview)
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");

  // Khi thay đổi Quận -> tự động cập nhật danh sách Phường tương ứng
  const handleSelectDistrict = (newDistrict: string) => {
    setDistrict(newDistrict);
    setIsCustomDistrict(false);
    const availableWards = HCM_WARDS_BY_DISTRICT[newDistrict] || [];
    if (availableWards.length > 0) {
      setWard(availableWards[0]);
    } else {
      setWard("");
    }
    setIsCustomWard(false);
  };

  if (!isOpen) return null;

  // Handle local file uploads (multiple images)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    showToast(`Đã tải lên ${files.length} ảnh phòng!`, "info");
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setUploadedImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput("");
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const selectedFinalDistrict = isCustomDistrict
    ? customDistrict.trim() || "Quận khác"
    : district;

  const selectedFinalWard = isCustomWard
    ? customWard.trim() || undefined
    : ward || undefined;

  const availableWardsForCurrentDistrict = HCM_WARDS_BY_DISTRICT[district] || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomCode || !buildingName || !address || !landlordPhone) {
      showToast("Vui lòng điền các thông tin bắt buộc (*)", "error");
      return;
    }

    if (isCustomDistrict && !customDistrict.trim()) {
      showToast("Vui lòng nhập tên quận / khu vực!", "error");
      return;
    }

    const defaultImages = [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
    ];

    const newRoom: Room = {
      id: `room-${Date.now()}`,
      roomCode: roomCode.trim().toUpperCase(),
      buildingId: `bld-${Date.now()}`,
      buildingName: buildingName.trim(),
      district: selectedFinalDistrict,
      ward: selectedFinalWard,
      address: address.trim(),
      floor: Number(floor),
      type,
      area: Number(area),
      price: Number(price),
      deposit: Number(deposit),
      commission: commission.trim() || "50% tháng đầu",
      status: "available",
      images: uploadedImages.length > 0 ? uploadedImages : defaultImages,
      furniture: [
        "Máy lạnh Inverter",
        "Tủ lạnh",
        "Giường nệm cao cấp",
        "Tủ quần áo",
        "Kệ bếp nấu ăn",
      ],
      serviceFees: {
        electricity,
        water,
        internet,
        parking,
        serviceFee,
      },
      landlord: {
        name: landlordName.trim() || "Chủ nhà / Quản lý",
        phone: landlordPhone.trim(),
        zaloPhone: landlordPhone.replace(/\D/g, ""),
        doorPassword: doorPassword.trim() || "Pass cửa: Chưa cập nhật",
        callNotice: callNotice.trim() || "Gọi trước khi dẫn khách qua",
      },
      notesForSale: notesForSale.trim(),
      allowPet,
      hasElevator,
      hasBalcony,
      maxTenants: 2,
      createdAt: new Date().toISOString(),
    };

    onCreateRoom(newRoom);
    const wardText = newRoom.ward ? `${newRoom.ward}, ` : "";
    showToast(`Đã upload & đăng phòng ${newRoom.roomCode} tại ${wardText}${newRoom.district} thành công!`, "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl max-h-[92vh] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Upload & Đăng Quỹ Phòng Mới (Dành Cho Sale)
              </h2>
              <p className="text-xs text-zinc-500">
                Thêm thông tin phòng, chọn Quận và Phường tại TP.HCM, ảnh thực tế và SĐT chủ hộ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* 1. UPLOAD HÌNH ẢNH */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              1. Hình ảnh thực tế của phòng *
            </label>
            <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-4 text-center hover:border-emerald-500 transition-colors bg-zinc-50/60 dark:bg-zinc-800/40">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="room-image-upload"
              />
              <label
                htmlFor="room-image-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
              >
                <ImageIcon className="w-8 h-8 text-emerald-500" />
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Bấm vào đây để chọn ảnh từ máy tính / điện thoại
                </span>
                <span className="text-[11px] text-zinc-400">
                  Hỗ trợ JPG, PNG, WEBP (Có thể chọn nhiều ảnh cùng lúc)
                </span>
              </label>
            </div>

            {/* Hoặc thêm link ảnh */}
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Hoặc dán trực tiếp link ảnh (URL)..."
                className="flex-1 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 outline-none"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
              >
                Thêm link
              </button>
            </div>

            {/* Image Preview Grid */}
            {uploadedImages.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1">
                {uploadedImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border border-zinc-300 dark:border-zinc-700 group"
                  >
                    <img src={img} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3 text-rose-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. THÔNG TIN CHỦ HỘ / QUẢN LÝ (NỘI BỘ SALE) */}
          <div className="space-y-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              <Phone className="w-4 h-4 text-amber-600" />
              <span>2. Thông tin Chủ Hộ / Quản Lý Toà Nhà (Nội bộ Sale) *</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tên Chủ nhà / Quản lý *
                </label>
                <input
                  type="text"
                  required
                  value={landlordName}
                  onChange={(e) => setLandlordName(e.target.value)}
                  placeholder="VD: Cô Mai (Chủ nhà) / Anh Hùng (QL toà)"
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Số điện thoại Chủ hộ * (Sale gọi trực tiếp)
                </label>
                <input
                  type="tel"
                  required
                  value={landlordPhone}
                  onChange={(e) => setLandlordPhone(e.target.value)}
                  placeholder="VD: 0908 123 456"
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Mật khẩu cửa / Mã vân tay cổng
                </label>
                <input
                  type="text"
                  value={doorPassword}
                  onChange={(e) => setDoorPassword(e.target.value)}
                  placeholder="VD: Pass cổng: *147258# / Vân tay bảo vệ"
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Lưu ý khi liên hệ chủ hộ
                </label>
                <input
                  type="text"
                  value={callNotice}
                  onChange={(e) => setCallNotice(e.target.value)}
                  placeholder="VD: Báo trước 15p, chủ ở tầng trệt"
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>

          {/* 3. THÔNG TIN PHÒNG, ĐỊA CHỈ & OPTION CHỌN QUẬN + PHƯỜNG */}
          <div className="space-y-4">
            <span className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              3. Vị Trí & Khu Vực (Quận & Phường tại TP.HCM)
            </span>

            {/* PHẦN 3.1: CHỌN QUẬN */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Quận / Huyện *:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold ml-1">
                    {selectedFinalDistrict}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomDistrict(!isCustomDistrict)}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
                >
                  {isCustomDistrict ? "← Chọn từ danh sách quận" : "+ Nhập quận khác"}
                </button>
              </div>

              {isCustomDistrict ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    required={isCustomDistrict}
                    value={customDistrict}
                    onChange={(e) => setCustomDistrict(e.target.value)}
                    placeholder="VD: Khu Thảo Điền, KDC Him Lam Q7, v.v..."
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 rounded-xl text-xs border border-emerald-500 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Option Pills: Các quận trọng điểm 1-click */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {POPULAR_DISTRICTS.map((d) => {
                      const isSelected = district === d;
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => handleSelectDistrict(d)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1 ${
                            isSelected
                              ? "bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-600/20"
                              : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          <span>{d}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dropdown chọn toàn bộ 22 quận/huyện TP.HCM */}
                  <div className="flex items-center gap-2 pt-1 border-t border-zinc-200/50 dark:border-zinc-700/50">
                    <span className="text-[11px] text-zinc-400 shrink-0">Hoặc chọn quận khác:</span>
                    <select
                      value={district}
                      onChange={(e) => handleSelectDistrict(e.target.value)}
                      className="flex-1 px-2.5 py-1 bg-white dark:bg-zinc-800 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 cursor-pointer"
                    >
                      {ALL_HCM_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          📍 {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* PHẦN 3.2: CHỌN PHƯỜNG / XÃ (TỰ ĐỘNG ĐỔ THEO QUẬN ĐÃ CHỌN) */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Phường / Xã thuộc {selectedFinalDistrict} *:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-extrabold ml-1">
                    {selectedFinalWard || "Chưa chọn"}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomWard(!isCustomWard)}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
                >
                  {isCustomWard ? "← Chọn từ danh sách phường" : "+ Tự nhập phường khác"}
                </button>
              </div>

              {isCustomWard ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={customWard}
                    onChange={(e) => setCustomWard(e.target.value)}
                    placeholder="VD: Phường Tân Hưng, Phường Bến Nghé, Xã Phước Kiển..."
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 rounded-xl text-xs border border-emerald-500 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              ) : availableWardsForCurrentDistrict.length > 0 ? (
                <div className="space-y-2">
                  {/* Option Pills: Các Phường thuộc Quận đã chọn */}
                  <div className="flex flex-wrap items-center gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {availableWardsForCurrentDistrict.map((w) => {
                      const isSelected = ward === w;
                      return (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setWard(w)}
                          className={`px-2.5 py-1 rounded-lg text-xs transition-all flex items-center gap-1 ${
                            isSelected
                              ? "bg-emerald-700 text-white font-bold shadow-sm shadow-emerald-700/20"
                              : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-emerald-100/50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          <span>{w}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dropdown Phường phòng khi danh sách dài */}
                  <div className="flex items-center gap-2 pt-1 border-t border-emerald-200/40 dark:border-emerald-800/30">
                    <span className="text-[11px] text-zinc-500 shrink-0">Hoặc chọn từ menu:</span>
                    <select
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      className="flex-1 px-2.5 py-1 bg-white dark:bg-zinc-800 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 cursor-pointer"
                    >
                      {availableWardsForCurrentDistrict.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    placeholder="Nhập tên Phường / Xã..."
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 rounded-xl text-xs border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              )}
            </div>

            {/* Các thông số phòng khác */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Mã phòng *
                </label>
                <input
                  type="text"
                  required
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  placeholder="P.302"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 font-bold text-zinc-900 dark:text-zinc-100 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Tên Toà nhà *
                </label>
                <input
                  type="text"
                  required
                  value={buildingName}
                  onChange={(e) => setBuildingName(e.target.value)}
                  placeholder="VD: Aura Home"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Tầng
                </label>
                <input
                  type="number"
                  value={floor}
                  onChange={(e) => setFloor(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Diện tích (m²)
                </label>
                <input
                  type="number"
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Địa chỉ số nhà & tên đường *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="VD: Số 42 Đường số 9"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Kiểu phòng
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as RoomType)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                >
                  <option value="studio">Studio</option>
                  <option value="duplex">Duplex (Gác lửng)</option>
                  <option value="1pn">1 Phòng Ngủ (1PN)</option>
                  <option value="2pn">2 Phòng Ngủ (2PN)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Giá thuê (VNĐ/tháng) *
                </label>
                <input
                  type="number"
                  required
                  step={100000}
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Tiền cọc (VNĐ)
                </label>
                <input
                  type="number"
                  step={100000}
                  value={deposit}
                  onChange={(e) => setDeposit(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Hoa hồng cho Sale *</span>
                </label>
                <input
                  type="text"
                  required
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  placeholder="VD: 50% tháng đầu / 3.000.000đ"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 font-bold text-amber-600 dark:text-amber-400"
                />
              </div>
            </div>
          </div>

          {/* 4. TIỆN ÍCH & LƯU Ý CHIẾN LƯỢC CHO SALE */}
          <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={allowPet}
                  onChange={(e) => setAllowPet(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Cho nuôi Pet</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={hasBalcony}
                  onChange={(e) => setHasBalcony(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Có Ban công</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  checked={hasElevator}
                  onChange={(e) => setHasElevator(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Có Thang máy</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Ghi chú nội bộ cho Sale (deal giá, tính cách chủ, giờ xem...)
              </label>
              <textarea
                rows={2}
                value={notesForSale}
                onChange={(e) => setNotesForSale(e.target.value)}
                placeholder="VD: Chủ bớt 200k nếu cọc trong tuần, giờ giấc tự do không chung chủ..."
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Đăng Quỹ Phòng Ngay</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
