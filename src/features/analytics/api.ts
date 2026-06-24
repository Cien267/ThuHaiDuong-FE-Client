import { api, isBackendUnavailable } from "@/lib/api/client";
import { TrackChapterViewInput } from "./types";
const SESSION_ID_KEY = "reader_session_id";

export async function trackChapterView(input: TrackChapterViewInput): Promise<void> {
  try {
    await api.post("/analytics/views", input);
  } catch (err) {
    if (isBackendUnavailable(err)) {
      console.warn("[analytics] Không thể gửi chapter view, backend không khả dụng.");
      return;
    }

    console.error("[analytics] Track chapter view failed:", err);
  }
}

export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }

  return sessionId;
}
