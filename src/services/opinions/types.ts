export interface ExpertOpinion {
  id: string
  message_id: string
  expert_id: string
  expert_name: string
  expert_avatar?: string
  opinion_text: string
  document_url?: string
  created_at: string
  rating?: number
  helpful_votes: number
  unhelpful_votes: number
}

export interface CreateOpinionRequest {
  message_id: string
  opinion_text: string
}

export interface OpinionRating {
  opinion_id: string
  rating: number
}

export interface OpinionVote {
  opinion_id: string
  is_helpful: boolean
}
