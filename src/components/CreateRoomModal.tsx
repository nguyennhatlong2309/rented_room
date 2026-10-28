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
  Zap,
  Droplets,
  Wifi,
  Car,
  Armchair,
} from "lucide-react";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (room: Room) => void;
}

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
  "Tân Bình": [
    "Phường Tân Sơn Nhất",
    "Phường Tân Sơn Hòa",
    "Phường Tân Hòa",
    "Phường Bảy Hiền",
    "Phường Tân Bình",
    "Phường Tân Sơn",
    "Phường 2 (cũ)",
    "Phường 4 (cũ)",
    "Phường 12 (cũ)",
    "Phường 13 (cũ)",
    "Phường 15 (cũ)",
  ],
  "Quận 1": [
    "Phường Sài Gòn",
    "Phường Bến Thành",
    "Phường Tân Định",
    "Phường Cầu Ông Lãnh",
    "Phường Bến Nghé (cũ)",
    "Phường Đa Kao (cũ)",
    "Phường Phạm Ngũ Lão (cũ)",
    "Phường Nguyễn Thái Bình (cũ)",
  ],
  "Quận 3": [
    "Phường Xuân Hòa",
    "Phường Bàn Cờ",
    "Phường Nhiêu Lộc",
    "Phường Võ Thị Sáu (cũ)",
    "Phường 1 (cũ)",
    "Phường 3 (cũ)",
    "Phường 14 (cũ)",
  ],
  "Quận 4": [
    "Phường Xóm Chiếu",
    "Phường Khánh Hội",
    "Phường Vĩnh Hội",
    "Phường 1 (cũ)",
    "Phường 4 (cũ)",
    "Phường 9 (cũ)",
  ],
  "Quận 5": [
    "Phường Chợ Quán",
    "Phường An Đông",
    "Phường Chợ Lớn",
    "Phường 1 (cũ)",
    "Phường 5 (cũ)",
    "Phường 11 (cũ)",
  ],
  "Quận 6": [
    "Phường Bình Tây",
    "Phường Bình Tiên",
    "Phường Bình Phú",
    "Phường Phú Lâm",
  ],
  "Quận 7": [
    "Phường Tân Hưng",
    "Phường Tân Phong",
    "Phường Tân Quy",
    "Phường Tân Kiểng",
    "Phường Tân Thuận",
    "Phường Phú Thuận",
    "Phường Tân Mỹ",
    "Phường Tân Phú",
    "Phường Phú Mỹ",
    "Phường Bình Thuận",
  ],
  "Quận 8": [
    "Phường Chánh Hưng",
    "Phường Phú Định",
    "Phường Bình Đông",
    "Phường Rạch Ông",
    "Phường Hưng Phú",
  ],
  "Quận 10": [
    "Phường Diên Hồng",
    "Phường Vườn Lài",
    "Phường Hòa Hưng",
    "Phường 12 (cũ)",
    "Phường 14 (cũ)",
    "Phường 15 (cũ)",
  ],
  "Quận 11": [
    "Phường Minh Phụng",
    "Phường Bình Thới",
    "Phường Hòa Bình",
    "Phường Phú Thọ",
  ],
  "Quận 12": [
    "Phường Đông Hưng Thuận",
    "Phường Trung Mỹ Tây",
    "Phường Tân Thới Hiệp",
    "Phường Thới An",
    "Phường An Phú Đông",
    "Phường Thạnh Xuân",
    "Phường Thạnh Lộc",
    "Phường Hiệp Thành",
  ],
  "Bình Thạnh": [
    "Phường Gia Định",
    "Phường Bình Thạnh",
    "Phường Bình Lợi Trung",
    "Phường Thạnh Mỹ Tây",
    "Phường Bình Quới",
    "Phường 24 (cũ)",
    "Phường 25 (cũ)",
    "Phường 26 (cũ)",
    "Phường 19 (cũ)",
    "Phường 2 (cũ)",
  ],
  "Phú Nhuận": [
    "Phường Đức Nhuận",
    "Phường Cầu Kiệu",
    "Phường Phú Nhuận",
    "Phường 2 (cũ)",
    "Phường 7 (cũ)",
    "Phường 15 (cũ)",
  ],
  "Tân Phú": [
    "Phường Tây Thạnh",
    "Phường Tân Sơn Nhì",
    "Phường Phú Thọ Hòa",
    "Phường Tân Quý",
    "Phường Tân Thành",
    "Phường Hòa Thạnh",
    "Phường Phú Trung",
  ],
  "Gò Vấp": [
    "Phường Hạnh Thông",
    "Phường An Nhơn",
    "Phường Gò Vấp",
    "Phường An Hội Đông",
    "Phường Thông Tây Hội",
    "Phường An Hội Tây",
  ],
  "Bình Tân": [
    "Phường An Lạc",
    "Phường Bình Tân",
    "Phường Tân Tạo",
    "Phường Bình Trị Đông",
    "Phường Bình Hưng Hòa",
  ],
  "TP. Thủ Đức": [
    "Phường Thảo Điền",
    "Phường An Phú",
    "Phường Thủ Thiêm",
    "Phường An Khánh",
    "Phường Hiệp Bình Chánh",
    "Phường Hiệp Bình Phước",
    "Phường Linh Trung",
    "Phường Linh Chiểu",
    "Phường Linh Tây",
    "Phường Phước Long A",
    "Phường Phước Long B",
    "Phường Tăng Nhơn Phú A",
    "Phường Tăng Nhơn Phú B",
  ],
  "Huyện Nhà Bè": [
    "Thị trấn Nhà Bè",
    "Xã Phước Kiển",
    "Xã Phước Lộc",
    "Xã Nhơn Đức",
    "Xã Phú Xuân",
    "Xã Long Thới",
    "Xã Hiệp Phước",
  ],
  "Huyện Bình Chánh": [
    "Thị trấn Tân Túc",
    "Xã Bình Hưng",
    "Xã Phong Phú",
    "Xã An Phú Tây",
    "Xã Đa Phước",
    "Xã Vĩnh Lộc A",
    "Xã Vĩnh Lộc B",
  ],
  "Huyện Hóc Môn": [
    "Thị trấn Hóc Môn",
    "Xã Bà Điểm",
    "Xã Tân Xuân",
    "Xã Trung Chánh",
    "Xã Xuân Thới Đông",
  ],
  "Huyện Củ Chi": [
    "Thị trấn Củ Chi",
    "Xã Tân An Hội",
    "Xã Phước Vĩnh An",
    "Xã Tân Thạnh Đông",
  ],
  "Huyện Cần Giờ": [
    "Thị trấn Cần Thạnh",
    "Xã Long Hòa",
    "Xã Bình Khánh",
  ],
};

export const POPULAR_FURNITURE = [
  "Máy lạnh Inverter",
  "Tủ lạnh",
  "Giường nệm cao cấp",
  "Tủ quần áo",
  "Kệ bếp nấu ăn",
  "Máy giặt riêng",
  "Máy giặt chung",
  "Máy nước nóng",
  "Sofa & Bàn trà",
  "Bàn ghế làm việc",
  "Smart Tivi",
  "Bàn ăn",
  "Ban công riêng",
  "Khóa vân tay phòng",
];

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
  const [waterPerPerson, setWaterPerPerson] = useState("100.000đ/người");
  const [waterPerM3, setWaterPerM3] = useState("");
  const [internet, setInternet] = useState("Miễn phí");
  const [parking, setParking] = useState("100.000đ/xe");
  const [serviceFee, setServiceFee] = useState("150.000đ/phòng");

  // Furniture list state
  const [furnitureList, setFurnitureList] = useState<string[]>([
    "Máy lạnh Inverter",
    "Tủ lạnh",
    "Giường nệm cao cấp",
    "Tủ quần áo",
    "Kệ bếp nấu ăn",
  ]);
  const [customFurnitureInput, setCustomFurnitureInput] = useState("");

  const toggleFurniture = (item: string) => {
    if (furnitureList.includes(item)) {
      setFurnitureList(furnitureList.filter((f) => f !== item));
    } else {
      setFurnitureList([...furnitureList, item]);
    }
  };

  const handleAddCustomFurniture = () => {
    const trimmed = customFurnitureInput.trim();
    if (!trimmed) return;
    if (!furnitureList.includes(trimmed)) {
      setFurnitureList([...furnitureList, trimmed]);
    }
    setCustomFurnitureInput("");
  };

  const handleRemoveFurniture = (item: string) => {
    setFurnitureList(furnitureList.filter((f) => f !== item));
  };

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

    // Compose water fee string
    let formattedWater = "";
    if (waterPerPerson.trim() && waterPerM3.trim()) {
      formattedWater = `${waterPerPerson.trim()} (hoặc ${waterPerM3.trim()})`;
    } else if (waterPerPerson.trim()) {
      formattedWater = waterPerPerson.trim();
    } else if (waterPerM3.trim()) {
      formattedWater = waterPerM3.trim();
    } else {
      formattedWater = "100.000đ/người";
    }

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
      furniture: furnitureList.length > 0 ? furnitureList : ["Nội thất cơ bản"],
      serviceFees: {
        electricity: electricity.trim() || "3.800đ/kWh",
        water: formattedWater,
        waterPerPerson: waterPerPerson.trim() || undefined,
        waterPerM3: waterPerM3.trim() || undefined,
        internet: internet.trim() || "Miễn phí",
        parking: parking.trim() || "100.000đ/xe",
        serviceFee: serviceFee.trim() || "150.000đ/phòng",
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
        <div className="px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between shrink-0 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-amber-400 dark:bg-white dark:text-zinc-950 flex items-center justify-center shadow-sm">
              <Upload className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-zinc-950 dark:text-white tracking-wide">
                Đăng Quỹ Phòng Mới (Dành Cho Sale)
              </h2>
              <p className="text-xs text-zinc-500 font-sans">
                Thêm thông tin phòng, chọn Quận và Phường tại TP.HCM, ảnh thực tế và SĐT chủ hộ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
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

          {/* 3. THÔNG TIN PHÒNG, ĐỊA CHỈ & MENU CHỌN QUẬN + PHƯỜNG */}
          <div className="space-y-4">
            <span className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              3. Vị Trí & Khu Vực (Quận & Phường tại TP.HCM)
            </span>

            {/* CHỌN QUẬN & PHƯỜNG GỌN GÀNG DẠNG MENU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80">
              {/* Cột 1: Menu chọn Quận / Huyện */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Quận / Huyện (TP.HCM) *</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomDistrict(!isCustomDistrict)}
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
                  >
                    {isCustomDistrict ? "← Chọn từ menu" : "+ Nhập quận khác"}
                  </button>
                </div>

                {isCustomDistrict ? (
                  <input
                    type="text"
                    required={isCustomDistrict}
                    value={customDistrict}
                    onChange={(e) => setCustomDistrict(e.target.value)}
                    placeholder="VD: Khu Thảo Điền, KDC Him Lam Q7..."
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 rounded-xl text-xs border border-emerald-500 text-zinc-900 dark:text-zinc-100 outline-none"
                  />
                ) : (
                  <select
                    value={district}
                    onChange={(e) => handleSelectDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 cursor-pointer font-medium"
                  >
                    {ALL_HCM_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        📍 {d}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Cột 2: Menu chọn Phường / Xã */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Phường / Xã ({selectedFinalDistrict}) *</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomWard(!isCustomWard)}
                    className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
                  >
                    {isCustomWard ? "← Chọn từ menu" : "+ Nhập phường khác"}
                  </button>
                </div>

                {isCustomWard ? (
                  <input
                    type="text"
                    value={customWard}
                    onChange={(e) => setCustomWard(e.target.value)}
                    placeholder="VD: Phường Tân Hưng, Phường 24..."
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 rounded-xl text-xs border border-emerald-500 text-zinc-900 dark:text-zinc-100 outline-none"
                  />
                ) : (
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 cursor-pointer font-medium"
                  >
                    {availableWardsForCurrentDistrict.length > 0 ? (
                      availableWardsForCurrentDistrict.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))
                    ) : (
                      <option value="">Không có phường danh mục sẵn</option>
                    )}
                  </select>
                )}
              </div>
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

          {/* 4. CHI PHÍ DỊCH VỤ HÀNG THÁNG */}
          <div className="space-y-3 pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>4. Chi phí dịch vụ hàng tháng</span>
              </label>
              <span className="text-[11px] text-zinc-400 font-sans">Có thể chỉnh sửa giá hoặc bấm chọn nhanh mẫu</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Tiền điện */}
              <div className="p-3 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700 space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Tiền điện</span>
                </label>
                <input
                  type="text"
                  value={electricity}
                  onChange={(e) => setElectricity(e.target.value)}
                  placeholder="VD: 3.800đ/kWh"
                  className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium"
                />
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {["3.500đ/kWh", "3.800đ/kWh", "4.000đ/kWh", "Giá nhà nước"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setElectricity(preset)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        electricity === preset
                          ? "bg-amber-500 text-zinc-950 font-bold border-amber-500"
                          : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tiền nước - Chia thành 2 input: theo người & theo m3 */}
              <div className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700 space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 font-sans">
                    <Droplets className="w-3.5 h-3.5 text-sky-500" />
                    <span>Tiền nước (Chia 2 input: Theo người & Theo m³)</span>
                  </label>
                  <span className="text-[11px] text-zinc-400">Có thể điền 1 hoặc cả 2 cách tính</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Input 1: Theo người */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-700 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        1. Tính theo người (/người)
                      </span>
                      {waterPerPerson && (
                        <button
                          type="button"
                          onClick={() => setWaterPerPerson("")}
                          className="text-[10px] text-zinc-400 hover:text-rose-500 cursor-pointer"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={waterPerPerson}
                      onChange={(e) => setWaterPerPerson(e.target.value)}
                      placeholder="VD: 100.000đ/người"
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium"
                    />
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {["100.000đ/người", "120.000đ/người", "Miễn phí"].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setWaterPerPerson(preset)}
                          className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                            waterPerPerson === preset
                              ? "bg-sky-500 text-white font-bold border-sky-500"
                              : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input 2: Theo khối m3 */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-700 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        2. Tính theo khối (/m³)
                      </span>
                      {waterPerM3 && (
                        <button
                          type="button"
                          onClick={() => setWaterPerM3("")}
                          className="text-[10px] text-zinc-400 hover:text-rose-500 cursor-pointer"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={waterPerM3}
                      onChange={(e) => setWaterPerM3(e.target.value)}
                      placeholder="VD: 25.000đ/m³"
                      className="w-full px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium"
                    />
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {["20.000đ/m³", "25.000đ/m³", "30.000đ/m³", "Giá nhà nước"].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setWaterPerM3(preset)}
                          className={`text-[10px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                            waterPerM3 === preset
                              ? "bg-sky-500 text-white font-bold border-sky-500"
                              : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tiền gửi xe */}
              <div className="p-3 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700 space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Gửi xe máy</span>
                </label>
                <input
                  type="text"
                  value={parking}
                  onChange={(e) => setParking(e.target.value)}
                  placeholder="VD: 100.000đ/xe"
                  className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium"
                />
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {["100.000đ/xe", "120.000đ/xe", "150.000đ/xe", "Miễn phí 1 xe", "Miễn phí"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setParking(preset)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        parking === preset
                          ? "bg-indigo-500 text-white font-bold border-indigo-500"
                          : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wifi / Internet */}
              <div className="p-3 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700 space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Wifi / Internet</span>
                </label>
                <input
                  type="text"
                  value={internet}
                  onChange={(e) => setInternet(e.target.value)}
                  placeholder="VD: Miễn phí"
                  className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium"
                />
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {["Miễn phí", "50.000đ/người", "100.000đ/phòng"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setInternet(preset)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        internet === preset
                          ? "bg-emerald-600 text-white font-bold border-emerald-600"
                          : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phí quản lý / Dịch vụ chung */}
              <div className="p-3 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700 space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  <span>Phí dịch vụ chung (Rác, hành lang, máy giặt chung, thang máy...)</span>
                </label>
                <input
                  type="text"
                  value={serviceFee}
                  onChange={(e) => setServiceFee(e.target.value)}
                  placeholder="VD: 150.000đ/phòng"
                  className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium"
                />
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {["150.000đ/phòng", "200.000đ/phòng", "100.000đ/người", "Miễn phí"].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setServiceFee(preset)}
                      className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        serviceFee === preset
                          ? "bg-purple-600 text-white font-bold border-purple-600"
                          : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-zinc-300"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 5. DANH MỤC NỘI THẤT BÀN GIAO */}
          <div className="space-y-3 pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                <Armchair className="w-3.5 h-3.5 text-amber-500" />
                <span>5. Danh mục nội thất bàn giao</span>
              </label>
              <span className="text-[11px] text-zinc-400 font-sans">
                Đã chọn: <strong className="text-amber-600 dark:text-amber-400">{furnitureList.length}</strong> món
              </span>
            </div>

            {/* Chip chọn nhanh nội thất */}
            <div className="flex flex-wrap items-center gap-1.5">
              {POPULAR_FURNITURE.map((item) => {
                const isChecked = furnitureList.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleFurniture(item)}
                    className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                      isChecked
                        ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-semibold shadow-xs"
                        : "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-transparent"
                    }`}
                  >
                    {isChecked ? (
                      <Check className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600 stroke-[2.5]" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>

            {/* Ô thêm nội thất tuỳ chỉnh */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={customFurnitureInput}
                onChange={(e) => setCustomFurnitureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomFurniture();
                  }
                }}
                placeholder="Nhập nội thất khác (VD: Bếp từ âm, Máy sấy, Lò vi sóng, Kệ giày...)"
                className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-xs border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={handleAddCustomFurniture}
                className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm</span>
              </button>
            </div>

            {/* Danh sách đã chọn hiển thị dạng pill có nút xoá */}
            {furnitureList.length > 0 && (
              <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/20 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-amber-900 dark:text-amber-300 mr-1">
                  Nội thất kèm theo:
                </span>
                {furnitureList.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-amber-500/20 shadow-2xs"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFurniture(item)}
                      className="text-zinc-400 hover:text-rose-500 ml-0.5 cursor-pointer"
                      title="Xóa món này"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 6. TIỆN ÍCH & LƯU Ý CHIẾN LƯỢC CHO SALE */}
          <div className="space-y-3 pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-sans">
              6. Tiện ích & Lưu ý chiến lược cho Sale
            </label>
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
