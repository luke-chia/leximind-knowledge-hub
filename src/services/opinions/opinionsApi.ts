import { supabase } from '@/lib/supabase'
import { ExpertOpinion, CreateOpinionRequest, OpinionRating, OpinionVote } from './types'

export class OpinionsApi {
  static async getOpinionsByMessage(messageId: string): Promise<ExpertOpinion[]> {
    const { data, error } = await supabase
      .from('expert_opinions')
      .select(`
        *,
        profiles:expert_id (
          name,
          nickname,
          img_url
        )
      `)
      .eq('message_id', messageId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map(opinion => ({
      id: opinion.id,
      message_id: opinion.message_id,
      expert_id: opinion.expert_id,
      expert_name: opinion.profiles?.nickname || opinion.profiles?.name || 'Expert',
      expert_avatar: opinion.profiles?.img_url,
      opinion_text: opinion.opinion_text,
      created_at: opinion.created_at,
      rating: opinion.rating,
      helpful_votes: opinion.helpful_votes || 0,
      unhelpful_votes: opinion.unhelpful_votes || 0,
    }))
  }

  static async createOpinion(request: CreateOpinionRequest): Promise<ExpertOpinion> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('expert_opinions')
      .insert({
        message_id: request.message_id,
        expert_id: user.id,
        opinion_text: request.opinion_text,
      })
      .select(`
        *,
        profiles:expert_id (
          name,
          nickname,
          img_url
        )
      `)
      .single()

    if (error) throw error

    return {
      id: data.id,
      message_id: data.message_id,
      expert_id: data.expert_id,
      expert_name: data.profiles?.nickname || data.profiles?.name || 'Expert',
      expert_avatar: data.profiles?.img_url,
      opinion_text: data.opinion_text,
      created_at: data.created_at,
      rating: data.rating,
      helpful_votes: data.helpful_votes || 0,
      unhelpful_votes: data.unhelpful_votes || 0,
    }
  }

  static async rateOpinion(rating: OpinionRating): Promise<void> {
    const { error } = await supabase
      .from('expert_opinions')
      .update({ rating: rating.rating })
      .eq('id', rating.opinion_id)

    if (error) throw error
  }

  static async voteOpinion(vote: OpinionVote): Promise<void> {
    const { data: opinion, error: fetchError } = await supabase
      .from('expert_opinions')
      .select('helpful_votes, unhelpful_votes')
      .eq('id', vote.opinion_id)
      .single()

    if (fetchError) throw fetchError

    const updates = vote.is_helpful
      ? { helpful_votes: (opinion.helpful_votes || 0) + 1 }
      : { unhelpful_votes: (opinion.unhelpful_votes || 0) + 1 }

    const { error } = await supabase
      .from('expert_opinions')
      .update(updates)
      .eq('id', vote.opinion_id)

    if (error) throw error
  }

  static async getOpinionCount(messageId: string): Promise<number> {
    const { count, error } = await supabase
      .from('expert_opinions')
      .select('*', { count: 'exact', head: true })
      .eq('message_id', messageId)

    if (error) throw error
    return count || 0
  }
}
