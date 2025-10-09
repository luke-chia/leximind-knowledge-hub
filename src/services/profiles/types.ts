export interface Profile {
  id: string;
  name: string | null;
  nickname: string | null;
  role: string | null;
  status: string | null;
  img_url: string | null;
  created_at: string;
}

export interface ProfileUpdateData {
  name?: string;
  nickname?: string;
  img_url?: string;
}
