export type AffiliatePlacement = "in-chapter" | "sidebar" | "popup" | "global";

export interface AffiliateLink {
  id: string;
  placement: AffiliatePlacement;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  ctaText?: string | null;
  /** URL backend cung cấp, dạng /go/{trackingCode} — KHÔNG tự ghép tay */
  redirectUrl: string;
  trackingCode: string;
}
