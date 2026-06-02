import { YOUTUBE_API_KEY } from "./oauth-config";

export type YouTubeResult = {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  publishedAt: string;
};

export async function searchYouTube(query: string): Promise<YouTubeResult[]> {
  if (!query.trim()) return [];
  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    videoCategoryId: "10", // Music
    maxResults: "20",
    q: query,
    key: YOUTUBE_API_KEY,
  });
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${params}`,
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`YouTube API error: ${res.status} ${err.slice(0, 120)}`);
  }
  const data = await res.json();
  return (data.items ?? []).map((item: {
    id: { videoId: string };
    snippet: {
      title: string;
      channelTitle: string;
      thumbnails: { medium?: { url: string }; default?: { url: string } };
      publishedAt: string;
    };
  }) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    thumbnail:
      item.snippet.thumbnails.medium?.url ??
      item.snippet.thumbnails.default?.url ??
      "",
    publishedAt: item.snippet.publishedAt,
  }));
}
