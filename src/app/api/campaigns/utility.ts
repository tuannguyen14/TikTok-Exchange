import { CreateCampaignRequest } from './types';
import { createServerSupabaseClient } from '@/lib/supabase/supabase-server';

// Utility functions
export function validateCampaignData(data: CreateCampaignRequest): string | null {
    if (!data.user_id || !data.campaign_type) {
        return 'Missing required fields: user_id and campaign_type';
    }

    if (!['video', 'follow'].includes(data.campaign_type)) {
        return 'Invalid campaign_type. Must be "video" or "follow"';
    }

    if (data.campaign_type === 'video') {
        if (!data.tiktok_video_id) {
            return 'tiktok_video_id is required for video campaigns';
        }
        if (!data.interaction_type || !['view', 'like', 'comment'].includes(data.interaction_type)) {
            return 'Valid interaction_type is required for video campaigns';
        }
    }

    if (data.campaign_type === 'follow') {
        if (!data.target_tiktok_username) {
            return 'target_tiktok_username is required for follow campaigns';
        }
    }

    if (data.credits_per_action <= 0 || data.target_count <= 0 || data.total_credits <= 0) {
        return 'Credits and target count must be positive numbers';
    }

    if (data.total_credits < data.credits_per_action * data.target_count) {
        return 'Total credits must be enough to cover all target actions';
    }

    return null;
}

export async function checkUserCredits(userId: string, requiredCredits: number): Promise<boolean> {
    const supabase = await createServerSupabaseClient();
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

    if (error || !profile) {
        return false;
    }

    return profile.credits >= requiredCredits;
}

export async function deductUserCredits(userId: string, amount: number): Promise<boolean> {
    const supabase = await createServerSupabaseClient();
    const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

    if (fetchError || !profile) {
        return false;
    }

    const newBalance = profile.credits - amount;

    // Cập nhật credits trong profiles
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits: newBalance })
        .eq('id', userId);

    if (updateError) {
        return false;
    }

    // Tạo transaction record
    const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
            user_id: userId,
            type: 'spend',
            amount: -amount,
            balance_after: newBalance,
            description: 'Credits spent on campaign creation',
            reference_type: 'campaign'
        });

    return !transactionError;
}