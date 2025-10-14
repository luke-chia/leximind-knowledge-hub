import { supabase } from '@/lib/supabase'
import {
  ExpertOpinion,
  CreateOpinionRequest,
  OpinionRating,
  OpinionVote,
} from './types'

export class OpinionsApi {
  static async getOpinionsByMessage(
    messageId: string
  ): Promise<ExpertOpinion[]> {
    console.log('OpinionsApi: Fetching opinions for message ID:', messageId)

    // Only query database if messageId is a valid UUID (from saved messages)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(messageId)) {
      return [] // Return empty array for temporary local IDs
    }

    // First get opinions without JOIN to avoid foreign key issues
    const { data: opinions, error } = await supabase
      .from('expert_opinions')
      .select('*')
      .eq('message_id', messageId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching opinions:', error)
      return [] // Return empty array instead of throwing
    }

    if (!opinions || opinions.length === 0) {
      return []
    }

    // Get unique expert_user_ids to fetch profiles
    const expertIds = [
      ...new Set(opinions.map((opinion) => opinion.expert_user_id)),
    ]

    // Fetch profiles for all experts
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, nickname, img_url')
      .in('id', expertIds)

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      // Continue without profile data
    }

    // Create a map for quick profile lookup
    const profilesMap = new Map()
    if (profiles) {
      profiles.forEach((profile) => {
        profilesMap.set(profile.id, profile)
      })
    }

    return opinions.map((opinion) => {
      const profile = profilesMap.get(opinion.expert_user_id)
      return {
        id: opinion.id,
        message_id: opinion.message_id,
        expert_id: opinion.expert_user_id,
        expert_name: profile?.nickname || 'Expert',
        expert_avatar: profile?.img_url,
        opinion_text: opinion.opinion,
        document_url: opinion.document_url,
        created_at: opinion.created_at,
        rating: null, // Not available in current schema
        helpful_votes: 0, // Not available in current schema
        unhelpful_votes: 0, // Not available in current schema
      }
    })
  }

  static async createOpinion(
    request: CreateOpinionRequest
  ): Promise<ExpertOpinion> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Create opinion without JOIN to avoid foreign key issues
    const { data: opinion, error } = await supabase
      .from('expert_opinions')
      .insert({
        message_id: request.message_id,
        expert_user_id: user.id,
        opinion: request.opinion_text,
      })
      .select('*')
      .single()

    if (error) throw error

    // Fetch profile separately
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('nickname, img_url')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      // Continue without profile data
    }

    return {
      id: opinion.id,
      message_id: opinion.message_id,
      expert_id: opinion.expert_user_id,
      expert_name: profile?.nickname || 'Expert',
      expert_avatar: profile?.img_url,
      opinion_text: opinion.opinion,
      document_url: opinion.document_url,
      created_at: opinion.created_at,
      rating: null, // Not available in current schema
      helpful_votes: 0, // Not available in current schema
      unhelpful_votes: 0, // Not available in current schema
    }
  }

  // TODO: Add rating, helpful_votes, unhelpful_votes columns to expert_opinions table
  // to enable these functions

  static async rateOpinion(rating: OpinionRating): Promise<void> {
    // Disabled - rating column doesn't exist in current schema
    throw new Error(
      'Rating functionality not available - missing rating column'
    )
    /*
    const { error } = await supabase
      .from('expert_opinions')
      .update({ rating: rating.rating })
      .eq('id', rating.opinion_id)

    if (error) throw error
    */
  }

  static async voteOpinion(vote: OpinionVote): Promise<void> {
    // Disabled - helpful_votes/unhelpful_votes columns don't exist in current schema
    throw new Error('Voting functionality not available - missing vote columns')
    /*
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
    */
  }

  static async getOpinionCount(messageId: string): Promise<number> {
    // Only query database if messageId is a valid UUID (from saved messages)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(messageId)) {
      return 0 // Return 0 for temporary local IDs
    }

    const { count, error } = await supabase
      .from('expert_opinions')
      .select('*', { count: 'exact', head: true })
      .eq('message_id', messageId)

    if (error) {
      console.error('Error fetching opinion count:', error)
      return 0 // Return 0 instead of throwing to avoid breaking the UI
    }
    return count || 0
  }
}
