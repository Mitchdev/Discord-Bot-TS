export interface TwitchStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  tag_ids: string[];
  is_mature: boolean
}

export interface TwitchUser {
  broadcaster_type: string;
  description: string;
  display_name: string;
  id: string;
  login: string;
  offline_image_url: string;
  profile_image_url: string;
  type: string;
  view_count: number;
  created_at: string;
}

export interface TwitchVideo {
  id: string;
  stream_id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  title: string;
  description: string;
  created_at: string;
  published_at: string;
  url: object;
  thumbnail_url: object;
  viewable: string;
  view_count: number;
  language: string;
  type: string;
  duration: string;
  muted_segments: {
    duration: number;
    offset: number;
  }[];
}

export interface DGGYoutube {
  live: boolean;
  status_text: string;
  preview: string;
  started_at: string;
  ended_at: string;
  duration: number;
  viewers: number;
  videoId: string;
}
