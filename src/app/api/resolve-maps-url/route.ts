import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl = body?.url;

    if (!rawUrl || typeof rawUrl !== "string") {
      return NextResponse.json(
        { success: false, error: "Vui lòng cung cấp đường dẫn Google Maps hợp lệ" },
        { status: 400 }
      );
    }

    const trimmedUrl = rawUrl.trim();

    // Helper trích xuất tọa độ từ chuỗi URL
    const parseCoordinatesFromUrl = (targetUrl: string) => {
      // 1. Dạng dữ liệu địa điểm chuẩn của Google Maps: !3d10.7965334!4d106.6949383 (Chính xác nhất)
      const dMatch = targetUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
      if (dMatch) {
        return { lat: parseFloat(dMatch[1]), lng: parseFloat(dMatch[2]) };
      }

      // 2. Dạng query tọa độ: ?q=10.7965334,106.6949383 hoặc &q=...
      const qMatch = targetUrl.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (qMatch) {
        return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
      }

      // 3. Dạng viewport camera của Google Maps: @10.7965334,106.6949383,16z
      const atMatch = targetUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atMatch) {
        return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
      }

      // 4. Dạng ll hoặc center: ?ll=10.7965334,106.6949383
      const llMatch = targetUrl.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (llMatch) {
        return { lat: parseFloat(llMatch[1]), lng: parseFloat(llMatch[2]) };
      }

      return null;
    };

    let lat: number | null = null;
    let lng: number | null = null;
    let placeName: string | null = null;
    let finalDestinationUrl = trimmedUrl;

    // Kiểm tra trực tiếp trên chuỗi URL gửi lên
    const directCoords = parseCoordinatesFromUrl(trimmedUrl);
    if (directCoords) {
      lat = directCoords.lat;
      lng = directCoords.lng;
    }

    // Nếu là link rút gọn (maps.app.goo.gl hoặc goo.gl) hoặc chưa có tọa độ, thực hiện follow redirect
    const isShortUrl =
      trimmedUrl.includes("maps.app.goo.gl") ||
      trimmedUrl.includes("goo.gl/maps") ||
      trimmedUrl.includes("app.goo.gl");

    if (isShortUrl || lat === null) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      try {
        const response = await fetch(trimmedUrl, {
          method: "GET",
          redirect: "follow",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "vi,en;q=0.9",
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        finalDestinationUrl = response.url;
        const resolvedCoords = parseCoordinatesFromUrl(finalDestinationUrl);
        if (resolvedCoords) {
          lat = resolvedCoords.lat;
          lng = resolvedCoords.lng;
        }

        // Trích xuất tên địa chỉ / địa điểm từ URL đích (/place/Tên_Địa_Điểm/@lat,lng)
        const placeMatch = finalDestinationUrl.match(/\/place\/([^/@?]+)/);
        if (placeMatch && placeMatch[1]) {
          placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
        }
      } catch (fetchErr: any) {
        clearTimeout(timeoutId);
        console.warn("Không thể tải link Google Maps rút gọn:", fetchErr);
      }
    }

    if (lat !== null && lng !== null) {
      return NextResponse.json({
        success: true,
        lat,
        lng,
        placeName,
        resolvedUrl: finalDestinationUrl,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error:
          "Không thể tìm thấy tọa độ GPS từ link Google Maps này. Vui lòng đảm bảo link dẫn trực tiếp tới một địa điểm trên bản đồ.",
      },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Lỗi xử lý yêu cầu" },
      { status: 500 }
    );
  }
}
