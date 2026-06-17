import { STORIES } from "./mock-data";

export interface ChapterSummary {
  id?: string;
  chapterNumber: number;
  title: string;
  publishedAt: string;
  wordCount: number;
}

export interface ChapterDetail extends ChapterSummary {
  storyId: string;
  storyTitle: string;
  content: string;
  totalChapters: number;
}

const PARAGRAPHS = [
  "Trời chiều, gió thu se lạnh thổi qua những tán lá phong đỏ rực. Lâm Phong đứng trên đỉnh núi, nhìn xuống thung lũng phía dưới, trong lòng dâng lên vô vàn cảm xúc khó tả.",
  "Hắn nhớ lại ngày đầu tiên bước chân vào tông môn, một thiếu niên gầy gò, ánh mắt kiên định nhưng cô đơn. Giờ đây, sau mười năm khổ luyện, hắn đã trở thành cường giả mà người người kính nể.",
  "Đột nhiên, một luồng linh khí mãnh liệt từ xa truyền tới, khiến Lâm Phong giật mình. Hắn nhíu mày, lập tức vận chuyển công pháp, toàn thân bao phủ một tầng linh quang mờ ảo.",
  "<em>Có người tới.</em> Hắn thầm nghĩ, ánh mắt sắc bén nhìn về phía chân trời. Một bóng người mặc áo trắng đang nhanh chóng tiếp cận, tốc độ kinh người.",
  '"Lâm sư đệ, lâu rồi không gặp." Giọng nói trong trẻo vang lên, là tiểu sư muội Tô Vân Nhi của cùng tông môn. Nàng mỉm cười, hai má lúm đồng tiền hiện rõ.',
  'Lâm Phong thu liễm khí thế, gật đầu chào: "Sư tỷ, hôm nay đến đây có việc gì?" Trong lòng hắn dâng lên cảm giác ấm áp, dù sao thì giữa giang hồ hiểm ác, gặp lại người quen luôn là điều đáng quý.',
  'Tô Vân Nhi thở dài, vẻ mặt nghiêm trọng: "Tông môn gặp đại nạn. Ma Giáo đã liên thủ với mấy thế lực hắc đạo, chuẩn bị tổng tấn công trong vòng ba ngày tới."',
  'Tin tức như sét đánh ngang tai. Lâm Phong nắm chặt thanh kiếm bên hông, ánh mắt lóe lên sát ý: "Ta sẽ trở về cùng các vị sư huynh sư tỷ chống địch. Dù phải đổ máu cũng quyết không lùi bước."',
];

export function getChaptersForStory(storyId: string): ChapterSummary[] {
  const story = STORIES.find((s) => s.id === storyId);
  if (!story) return [];
  return Array.from({ length: story.totalChapters }, (_, i) => ({
    chapterNumber: i + 1,
    title: `Chương ${i + 1}: ${["Khởi đầu", "Tương ngộ", "Đối đầu", "Bí mật", "Đột phá", "Sinh tử", "Trùng phùng", "Quyết chiến"][i % 8]}`,
    publishedAt: new Date(Date.now() - (story.totalChapters - i) * 3600_000 * 6).toISOString(),
    wordCount: 1800 + ((i * 137) % 1500),
  }));
}

export function getChapter(storyId: string, chapterNumber: number): ChapterDetail | null {
  const story = STORIES.find((s) => s.id === storyId);
  if (!story) return null;
  if (chapterNumber < 1 || chapterNumber > story.totalChapters) return null;
  const chapters = getChaptersForStory(storyId);
  const meta = chapters[chapterNumber - 1];
  const paragraphs = Array.from({ length: 14 }, (_, i) => {
    return `<p>${PARAGRAPHS[(chapterNumber + i) % PARAGRAPHS.length]}</p>`;
  }).join("\n");
  return {
    ...meta,
    storyId,
    storyTitle: story.title,
    totalChapters: story.totalChapters,
    content: paragraphs,
  };
}
