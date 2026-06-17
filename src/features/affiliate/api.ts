import { queryOptions } from "@tanstack/react-query";
import { api, isBackendUnavailable } from "@/lib/api/client";
import type { AffiliateLink, AffiliatePlacement } from "./types";

interface FetchParams {
  storyId?: string | null;
  chapterId?: string | null;
}

/**
 * Lấy danh sách affiliate link cho 1 ngữ cảnh (story / chapter).
 * Backend đã lọc IsActive / StartDate / EndDate và chọn link ưu tiên nhất cho mỗi placement.
 * Không có ngữ cảnh truyện → không gọi API (trả về []).
 * Backend lỗi → trả [] để KHÔNG block render trang đọc.
 */
export async function fetchAffiliateLinks(params: FetchParams): Promise<AffiliateLink[]> {
  if (!params.storyId) return [];
  try {
    const { data } = await api.get("/affiliate/display", {
      params: {
        storyId: params.storyId,
        ...(params.chapterId ? { chapterId: params.chapterId } : {}),
      },
    });
    const items = Array.isArray(data) ? data : ((data as { items?: AffiliateLink[] })?.items ?? []);
    return items as AffiliateLink[];
  } catch (err) {
    if (isBackendUnavailable(err)) return [];
    // Lỗi 4xx khác cũng coi như không có link — không làm hỏng trang đọc
    return [];
  }
}

export const affiliateLinksQuery = (params: FetchParams) =>
  queryOptions({
    queryKey: ["affiliate/display", params.storyId ?? null, params.chapterId ?? null],
    queryFn: () => fetchAffiliateLinks(params),
    enabled: !!params.storyId,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

export function pickByPlacement(links: AffiliateLink[] | undefined, placement: AffiliatePlacement) {
  if (!links?.length) return null;
  return links.find((l) => l.placement === placement) ?? null;
}

/**
 * Ghép chapterId vào redirectUrl (nếu có) — backend dùng để biết click đến từ chapter nào.
 * KHÔNG tự tạo URL tracking, chỉ thêm query param vào URL backend trả về.
 */
export function buildClickUrl(redirectUrl: string, chapterId?: string | null): string {
  if (!chapterId) return redirectUrl;
  const sep = redirectUrl.includes("?") ? "&" : "?";
  return `${redirectUrl}${sep}chapterId=${encodeURIComponent(chapterId)}`;
}
