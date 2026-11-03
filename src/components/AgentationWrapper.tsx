"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Tải linh hoạt Agentation ở phía Client (chỉ trên Desktop)
// Không chạy SSR để tránh xung đột HTML và không kích hoạt trên Mobile
const DynamicAgentation = dynamic(
  () => import("agentation").then((mod) => mod.Agentation),
  { ssr: false }
);

/**
 * AgentationWrapper:
 * - Agentation là công cụ thu thập phản hồi giao diện trực quan cho AI Agent.
 * - Tuy nhiên, cơ chế của Agentation là đăng ký sự kiện `click` ở CAPTURE PHASE (`pageEvents.addEventListener("click", handleClick, true)`),
 *   điều này sẽ can thiệp và nuốt (preventDefault) toàn bộ thao tác click/tap trên màn hình cảm ứng điện thoại khi kích hoạt.
 * - Wrapper này ngăn chặn hoàn toàn việc nạp Agentation trên các thiết bị di động (màn hình < 768px),
 *   giúp các thao tác chạm, chọn bộ lọc, click thẻ phòng và tương tác bản đồ trên điện thoại chạy mượt mà 100%.
 */
export function AgentationWrapper() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Chỉ kích hoạt trên màn hình Desktop (>= 768px)
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setIsDesktop(true);
    }
  }, []);

  if (!isDesktop) {
    return null;
  }

  return <DynamicAgentation />;
}
