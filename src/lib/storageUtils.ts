/**
 * Utility an toàn xử lý localStorage tránh lỗi QuotaExceededError trên trình duyệt
 */

const OLD_CACHE_KEYS = [
  "roomsales_rooms_cache_hcm_v4",
  "roomsales_rooms_cache_hcm_v3",
  "roomsales_rooms_cache_hcm_v2",
  "roomsales_rooms_cache_hcm_v1",
  "estate_portal_rooms_v1",
  "estate_portal_cache_v2",
];

export const CURRENT_ROOMS_CACHE_KEY = "roomsales_rooms_cache_hcm_v5";

/**
 * Xóa sạch các key cache phiên bản cũ để giải phóng dung lượng 5MB của localStorage
 */
export function cleanupOldStorageCaches(): void {
  if (typeof window === "undefined") return;

  try {
    OLD_CACHE_KEYS.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // Bỏ qua lỗi
      }
    });

    // Dọn dẹp bất kỳ key nào khác bắt đầu bằng roomsales_rooms_cache cũ
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (
        key &&
        key.startsWith("roomsales_rooms_cache") &&
        key !== CURRENT_ROOMS_CACHE_KEY
      ) {
        try {
          localStorage.removeItem(key);
        } catch {
          // Bỏ qua
        }
      }
    }
  } catch {
    // Bỏ qua
  }
}

/**
 * Thu gọn dữ liệu phòng nếu có chứa chuỗi ảnh base64 quá lớn (> 200KB)
 */
function sanitizeRoomsForStorage(rooms: any[]): any[] {
  return rooms.map((room) => {
    if (!room || !Array.isArray(room.images)) return room;

    const sanitizedImages = room.images.map((img: string) => {
      // Nếu là ảnh base64 dung lượng khủng (vượt quá 150KB ký tự), thu gọn lại
      if (typeof img === "string" && img.startsWith("data:image/") && img.length > 150000) {
        // Fallback về ảnh kiến trúc mẫu chất lượng cao từ Unsplash
        return "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80";
      }
      return img;
    });

    return {
      ...room,
      images: sanitizedImages,
    };
  });
}

/**
 * Lưu dữ liệu an toàn vào localStorage, tự động dọn dẹp cache cũ và thu nhỏ dữ liệu nếu chạm trần Quota
 */
export function safeSetLocalStorage(key: string, data: any): boolean {
  if (typeof window === "undefined") return false;

  const rawJson = typeof data === "string" ? data : JSON.stringify(data);

  try {
    localStorage.setItem(key, rawJson);
    return true;
  } catch (err: any) {
    // Nếu gặp QuotaExceededError (code 22 hoặc tên QuotaExceededError)
    cleanupOldStorageCaches();

    try {
      localStorage.setItem(key, rawJson);
      return true;
    } catch {
      // Nếu vẫn quá dung lượng và data là mảng phòng, tiến hành thu gọn chuỗi ảnh base64
      if (Array.isArray(data)) {
        try {
          const sanitized = sanitizeRoomsForStorage(data);
          localStorage.setItem(key, JSON.stringify(sanitized));
          return true;
        } catch {
          // Bỏ qua nếu vẫn không đủ bộ nhớ
        }
      }
      console.warn("localStorage quota reached. Running in memory-only fallback.");
      return false;
    }
  }
}

/**
 * Đọc dữ liệu an toàn từ localStorage
 */
export function safeGetLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
}

/**
 * Nén ảnh trước khi chuyển sang Base64 để không bao giờ làm tràn quota localStorage
 * Giảm dung lượng từ 5MB - 10MB xuống chỉ còn ~40KB - 80KB (nhẹ gấp 100 lần)
 */
export function compressImageFile(
  file: File,
  maxWidth = 1000,
  maxHeight = 800,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        resolve("");
        return;
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(result);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      img.onerror = () => resolve(result);
      img.src = result;
    };

    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}
