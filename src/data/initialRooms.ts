import { Room } from "@/lib/types";

export const INITIAL_ROOMS: Room[] = [
  {
    id: "room-01",
    roomCode: "P.302",
    buildingId: "bld-01",
    buildingName: "Aura Home Tân Hưng",
    district: "Quận 7",
    ward: "Phường Tân Hưng",
    address: "Số 42 Đường số 9",
    floor: 3,
    type: "studio",
    area: 32,
    price: 5800000,
    deposit: 5800000,
    commission: "50% tháng đầu (2.900.000đ)",
    status: "available",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80"
    ],
    furniture: [
      "Máy lạnh Inverter tiết kiệm điện",
      "Tủ lạnh 180L 2 cánh",
      "Giường nệm cao su non 1m6 x 2m",
      "Tủ quần áo âm tường 3 cánh",
      "Kệ bếp từ âm cao cấp + máy hút mùi",
      "Bàn làm việc + ghế công thái học",
      "Máy giặt riêng trong phòng"
    ],
    serviceFees: {
      electricity: "3.800đ/kWh",
      water: "100.000đ/người",
      internet: "Miễn phí",
      parking: "100.000đ/xe",
      serviceFee: "150.000đ/phòng (vệ sinh, thang máy, rác)"
    },
    landlord: {
      name: "Chú Sáu (Chủ nhà)",
      phone: "0908 456 789",
      zaloPhone: "0908456789",
      doorPassword: "Pass cổng: *147258# (Cửa vân tay)",
      callNotice: "Báo trước 15 phút, chú ở tầng trệt phòng Bảo vệ"
    },
    notesForSale: "Chủ toà rất thiện chí. Giảm 300k tháng đầu nếu khách ký hợp đồng 12 tháng trước ngày 30. Giờ giấc tự do 100%.",
    allowPet: true,
    hasElevator: true,
    hasBalcony: true,
    maxTenants: 2,
    lat: 10.746879,
    lng: 106.708656,
    createdAt: "2026-10-20T08:00:00Z"
  },
  {
    id: "room-02",
    roomCode: "P.501",
    buildingId: "bld-01",
    buildingName: "Aura Home Tân Hưng",
    district: "Quận 7",
    ward: "Phường Tân Hưng",
    address: "Số 42 Đường số 9",
    floor: 5,
    type: "1pn",
    area: 45,
    price: 8500000,
    deposit: 8500000,
    commission: "60% tháng đầu (5.100.000đ)",
    status: "holding",
    images: [
      "https://images.unsplash.com/photo-1502005229762-ee1b2da94e0f?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1540518614846-7ede433c4ef9?auto=format&fit=crop&w=1000&q=80"
    ],
    furniture: [
      "Phòng ngủ riêng biệt ngăn vách kính cách âm",
      "Sofa chữ L phòng khách + bàn trà",
      "Smart TV 50 inch 4K",
      "2 Máy lạnh Daikin",
      "Bếp đảo quầy bar mini hiện đại",
      "Tủ lạnh Side by Side",
      "Tủ đồ lớn kịch trần"
    ],
    serviceFees: {
      electricity: "3.800đ/kWh",
      water: "100.000đ/người",
      internet: "Miễn phí",
      parking: "Free 1 xe đầu tiên",
      serviceFee: "150.000đ/phòng"
    },
    landlord: {
      name: "Anh Hưng (Quản lý toà)",
      phone: "0912 334 556",
      zaloPhone: "0912334556",
      doorPassword: "Pass cổng: 9988# - Chìa khóa phòng để trong hộp lockbox",
      callNotice: "Khách xem ban ngày tự do, buổi tối gọi trước 18h"
    },
    notesForSale: "Sale Huy đang giữ chỗ cho khách xem lúc 18:00 hôm nay. Nếu sau 18:30 khách không chốt sẽ tự động mở lại trạng thái trống.",
    allowPet: false,
    hasElevator: true,
    hasBalcony: true,
    maxTenants: 3,
    lat: 10.746950,
    lng: 106.708700,
    createdAt: "2026-10-21T09:30:00Z"
  },
  {
    id: "room-03",
    roomCode: "P.204",
    buildingId: "bld-02",
    buildingName: "The Loft House Bạch Đằng",
    district: "Bình Thạnh",
    ward: "Phường 24",
    address: "182 Bạch Đằng",
    floor: 2,
    type: "duplex",
    area: 38,
    price: 6800000,
    deposit: 6800000,
    commission: "50% tháng đầu (3.400.000đ)",
    status: "available",
    images: [
      "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1000&q=80"
    ],
    furniture: [
      "Gác lửng cao 2m đứng không đụng đầu",
      "Cầu thang gỗ có hộc tủ để đồ thông minh",
      "Máy lạnh 1.5 HP",
      "Tủ lạnh, bếp từ, máy hút mùi",
      "Bộ bàn ăn 2 ghế phong cách Bắc Âu",
      "Máy giặt riêng tại ban công phơi đồ"
    ],
    serviceFees: {
      electricity: "3.900đ/kWh",
      water: "25.000đ/m3",
      internet: "100.000đ/phòng",
      parking: "120.000đ/xe",
      serviceFee: "100.000đ/phòng"
    },
    landlord: {
      name: "Chị Thảo (Chủ hộ)",
      phone: "0938 776 889",
      zaloPhone: "0938776889",
      doorPassword: "Pass cổng: 18224#",
      callNotice: "Nhắn Zalo hoặc gọi trước khi qua, chị đi làm ở Q1"
    },
    notesForSale: "Vị trí sát ĐH Ngoại Thương, HUTECH, UEF, đi Q1 chỉ 5 phút. Rất thích hợp chốt khách sinh viên hoặc nhân viên văn phòng.",
    allowPet: true,
    hasElevator: true,
    hasBalcony: true,
    maxTenants: 3,
    lat: 10.804191,
    lng: 106.706449,
    createdAt: "2026-10-22T10:00:00Z"
  },
  {
    id: "room-04",
    roomCode: "P.402",
    buildingId: "bld-02",
    buildingName: "The Loft House Bạch Đằng",
    district: "Bình Thạnh",
    ward: "Phường 24",
    address: "182 Bạch Đằng",
    floor: 4,
    type: "studio",
    area: 28,
    price: 5200000,
    deposit: 5200000,
    commission: "50% tháng đầu (2.600.000đ)",
    status: "soon_available",
    availableDate: "05/11/2026",
    images: [
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1000&q=80"
    ],
    furniture: [
      "Máy lạnh Sharp mới lắp",
      "Giường nệm lò xo êm ái",
      "Bàn học + kệ sách",
      "Tủ lạnh mini 90L",
      "Bếp nấu ăn sạch sẽ"
    ],
    serviceFees: {
      electricity: "3.900đ/kWh",
      water: "25.000đ/m3",
      internet: "100.000đ/phòng",
      parking: "120.000đ/xe",
      serviceFee: "100.000đ/phòng"
    },
    landlord: {
      name: "Chị Thảo (Chủ hộ)",
      phone: "0938 776 889",
      zaloPhone: "0938776889",
      doorPassword: "Pass cổng: 18224#",
      callNotice: "Khách cũ hết hạn HĐ ngày 05/11, dẫn khách xem sau 18h"
    },
    notesForSale: "Khách cũ hết hạn HĐ ngày 05/11. Sale có thể dẫn khách xem trước từ bây giờ sau 18h hàng ngày.",
    allowPet: false,
    hasElevator: true,
    hasBalcony: false,
    maxTenants: 2,
    lat: 10.804250,
    lng: 106.706500,
    createdAt: "2026-10-23T11:00:00Z"
  },
  {
    id: "room-05",
    roomCode: "P.101",
    buildingId: "bld-03",
    buildingName: "Urban Nest Phan Xích Long",
    district: "Phú Nhuận",
    ward: "Phường 2",
    address: "88 Phan Xích Long",
    floor: 1,
    type: "2pn",
    area: 60,
    price: 12500000,
    deposit: 15000000,
    commission: "100% tháng đầu nếu chốt HĐ 2 năm (12.500.000đ)",
    status: "available",
    images: [
      "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80"
    ],
    furniture: [
      "2 phòng ngủ riêng biệt đầy đủ giường nệm tủ",
      "Phòng khách lớn view phố Phan Xích Long",
      "Khu bếp quầy bar đẳng cấp",
      "Máy rửa chén, lò vi sóng, tủ lạnh 4 cánh",
      "3 Máy lạnh Daikin Inverter",
      "Ban công ngập tràn cây xanh",
      "Khóa cửa vân tay FaceID riêng từng phòng"
    ],
    serviceFees: {
      electricity: "4.000đ/kWh",
      water: "120.000đ/người",
      internet: "Miễn phí",
      parking: "Free 2 xe máy",
      serviceFee: "200.000đ/phòng"
    },
    landlord: {
      name: "Bác Lâm (Chủ nhà)",
      phone: "0903 889 900",
      zaloPhone: "0903889900",
      doorPassword: "Cửa tự động FaceID - Gọi bác Lâm bấm mở từ xa",
      callNotice: "Cần lịch hẹn trước 30p để đón khách chu đáo"
    },
    notesForSale: "Căn hộ VIP phố ẩm thực Phan Xích Long. Hoa hồng cực khủng cho sale chốt trong tháng này.",
    allowPet: true,
    hasElevator: true,
    hasBalcony: true,
    maxTenants: 4,
    lat: 10.798727,
    lng: 106.687633,
    createdAt: "2026-10-24T14:20:00Z"
  },
  {
    id: "room-06",
    roomCode: "P.201",
    buildingId: "bld-04",
    buildingName: "Sư Vạn Hạnh Signature",
    district: "Quận 10",
    ward: "Phường 12",
    address: "740 Sư Vạn Hạnh",
    floor: 2,
    type: "1pn",
    area: 40,
    price: 7500000,
    deposit: 7500000,
    commission: "50% tháng đầu (3.750.000đ)",
    status: "available",
    images: [
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80"
    ],
    furniture: [
      "1 Phòng ngủ riêng tư vách gỗ sang trọng",
      "Máy lạnh Daikin 1.5 HP",
      "Tủ lạnh Toshiba 2 cánh",
      "Bếp điện từ âm & quầy bar mini",
      "Máy giặt riêng ban công",
      "Giường bọc nệm cao cấp"
    ],
    serviceFees: {
      electricity: "3.800đ/kWh",
      water: "100.000đ/người",
      internet: "Miễn phí",
      parking: "120.000đ/xe",
      serviceFee: "150.000đ/phòng"
    },
    landlord: {
      name: "Anh Tuấn (Quản lý toà)",
      phone: "0909 554 321",
      zaloPhone: "0909554321",
      doorPassword: "Pass cửa chính: 74012#",
      callNotice: "Quản lý túc trực 24/7 tại sảnh toà nhà"
    },
    notesForSale: "Sát Vạn Hạnh Mall, ĐH Y Dược, ĐH Huflit. Khách xem là ưng liền, phòng rất thoáng có cửa sổ lớn.",
    allowPet: true,
    hasElevator: true,
    hasBalcony: true,
    maxTenants: 2,
    lat: 10.772198,
    lng: 106.669405,
    createdAt: "2026-10-25T08:15:00Z"
  },
  {
    id: "room-07",
    roomCode: "P.303",
    buildingId: "bld-05",
    buildingName: "The Muse Central",
    district: "Quận 1",
    ward: "Phường Đa Kao",
    address: "18A Nguyễn Thị Minh Khai",
    floor: 3,
    type: "studio",
    area: 35,
    price: 9200000,
    deposit: 9200000,
    commission: "60% tháng đầu (5.520.000đ)",
    status: "available",
    images: [
      "https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80"
    ],
    furniture: [
      "Full nội thất Indochine cao cấp",
      "Smart TV 55 inch",
      "Máy giặt sấy 2 trong 1",
      "Bếp từ âm Teka + Lò vi sóng",
      "Nệm lò xo túi êm ái tiêu chuẩn khách sạn"
    ],
    serviceFees: {
      electricity: "4.200đ/kWh",
      water: "150.000đ/người",
      internet: "Miễn phí",
      parking: "Free 1 xe",
      serviceFee: "200.000đ/phòng (Dọn phòng 2 lần/tuần)"
    },
    landlord: {
      name: "Cô Ngọc (Chủ nhà)",
      phone: "0982 112 233",
      zaloPhone: "0982112233",
      doorPassword: "Pass cổng: *1818#",
      callNotice: "Cô rất quý các bạn sale, gọi trước 10p cô xuống mở cửa"
    },
    notesForSale: "Căn hộ trung tâm Q1, có dịch vụ dọn phòng 2 lần/tuần miễn phí. Thích hợp khách nước ngoài hoặc chuyên gia.",
    allowPet: false,
    hasElevator: true,
    hasBalcony: true,
    maxTenants: 2,
    lat: 10.786110,
    lng: 106.700575,
    createdAt: "2026-10-20T11:00:00Z"
  },
  {
    id: "room-08",
    roomCode: "P.202",
    buildingId: "bld-06",
    buildingName: "Cộng Hòa Living",
    district: "Tân Bình",
    ward: "Phường 4",
    address: "45 Cộng Hòa",
    floor: 2,
    type: "duplex",
    area: 36,
    price: 5900000,
    deposit: 5900000,
    commission: "50% tháng đầu (2.950.000đ)",
    status: "available",
    images: [
      "https://images.unsplash.com/photo-1502005229762-ee1b2da94e0f?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1000&q=80"
    ],
    furniture: [
      "Duplex gác cao thoáng, đứng thẳng người",
      "Cầu thang tay vịn gỗ vững chắc",
      "Máy lạnh 1.5 HP mới 100%",
      "Tủ lạnh, tủ quần áo 3 cánh",
      "Bếp nấu ăn sạch sẽ ốp kính chịu lực"
    ],
    serviceFees: {
      electricity: "3.800đ/kWh",
      water: "100.000đ/người",
      internet: "100.000đ/phòng",
      parking: "100.000đ/xe",
      serviceFee: "100.000đ/phòng"
    },
    landlord: {
      name: "Anh Hoàng (Chủ nhà)",
      phone: "0907 654 321",
      zaloPhone: "0907654321",
      doorPassword: "Pass cổng: 4545#",
      callNotice: "Chủ ở ngay cạnh nhà, gọi là sang mở cửa ngay"
    },
    notesForSale: "Gần sân bay Tân Sơn Nhất, tòa nhà Pico Plaza. Thang máy tốc độ cao, camera an ninh 24/7.",
    allowPet: true,
    hasElevator: true,
    hasBalcony: false,
    maxTenants: 3,
    lat: 10.8010,
    lng: 106.6570,
    createdAt: "2026-10-25T15:00:00Z"
  },
  {
    id: "room-09",
    roomCode: "P.405",
    buildingId: "bld-07",
    buildingName: "Lê Văn Sỹ Boutique",
    district: "Quận 3",
    ward: "Phường 14",
    address: "220 Lê Văn Sỹ",
    floor: 4,
    type: "studio",
    area: 30,
    price: 6500000,
    deposit: 6500000,
    commission: "50% tháng đầu (3.250.000đ)",
    status: "available",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80"
    ],
    furniture: [
      "Máy lạnh Inverter siêu êm",
      "Giường bọc nệm Hàn Quốc",
      "Tủ áo cánh kính lùa",
      "Bếp từ đôi + máy hút mùi",
      "Tủ lạnh 150L"
    ],
    serviceFees: {
      electricity: "3.900đ/kWh",
      water: "100.000đ/người",
      internet: "Miễn phí",
      parking: "120.000đ/xe",
      serviceFee: "120.000đ/phòng"
    },
    landlord: {
      name: "Chú Đức (Quản lý toà)",
      phone: "0918 889 776",
      zaloPhone: "0918889776",
      doorPassword: "Khóa vân tay + Thẻ từ, chuông cửa reo ở phòng bảo vệ",
      callNotice: "Chú Đức bảo vệ trực 24/24, sale qua chỉ cần nói 'dẫn khách xem P.405'"
    },
    notesForSale: "Tuyến phố thời trang Lê Văn Sỹ Q3, di chuyển sang Q1, Tân Bình, Phú Nhuận đều thuận tiện trong 5-10 phút.",
    allowPet: false,
    hasElevator: true,
    hasBalcony: true,
    maxTenants: 2,
    lat: 10.7890,
    lng: 106.6780,
    createdAt: "2026-10-25T16:00:00Z"
  }
];
