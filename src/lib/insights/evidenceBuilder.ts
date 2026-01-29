/**
 * Builds evidence packs by fetching only relevant data from Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { DataCategory, getDateBefore } from './questionAnalyzer';
import {
  summarizeMoods,
  summarizePoops,
  summarizeFoods,
  summarizeIllnesses,
  calculateCycleStats,
} from './summarizers';

// Server-side Supabase client (uses service role for API routes)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface EvidencePack {
  recentMoods?: string;
  recentPoops?: string;
  recentFoods?: string;
  recentIllnesses?: string;
  cycleInfo?: string;
  dataFetched: string[];
  [key: string]: string | string[] | undefined;
}

export async function buildEvidencePack(
  userId: string,
  dataNeeded: DataCategory[],
  timeRange: string
): Promise<EvidencePack> {
  const pack: EvidencePack = { dataFetched: [] };
  const cutoffDate = getDateBefore(timeRange).toISOString();

  // Fetch data in parallel for efficiency
  const fetchPromises: Promise<void>[] = [];

  if (dataNeeded.includes('mood')) {
    fetchPromises.push(
      (async () => {
        const { data: moods } = await supabase
          .from('mood_entries')
          .select('mood, created_at, notes')
          .eq('user_id', userId)
          .gte('created_at', cutoffDate)
          .order('created_at', { ascending: false })
          .limit(15);

        pack.recentMoods = summarizeMoods(moods);
        pack.dataFetched.push('mood');
      })()
    );
  }

  if (dataNeeded.includes('poop')) {
    fetchPromises.push(
      (async () => {
        const { data: poops } = await supabase
          .from('poop_entries')
          .select('type, logged_at, notes')
          .eq('user_id', userId)
          .gte('logged_at', cutoffDate)
          .order('logged_at', { ascending: false })
          .limit(15);

        pack.recentPoops = summarizePoops(poops);
        pack.dataFetched.push('poop');
      })()
    );
  }

  if (dataNeeded.includes('food')) {
    fetchPromises.push(
      (async () => {
        const { data: foods } = await supabase
          .from('food_entries')
          .select('breakfast, lunch, dinner, snack, logged_at')
          .eq('user_id', userId)
          .gte('logged_at', cutoffDate)
          .order('logged_at', { ascending: false })
          .limit(7);

        pack.recentFoods = summarizeFoods(foods);
        pack.dataFetched.push('food');
      })()
    );
  }

  if (dataNeeded.includes('illness')) {
    fetchPromises.push(
      (async () => {
        const { data: illnesses } = await supabase
          .from('illness_entries')
          .select('illness_types, logged_at, notes')
          .eq('user_id', userId)
          .gte('logged_at', cutoffDate)
          .order('logged_at', { ascending: false })
          .limit(10);

        pack.recentIllnesses = summarizeIllnesses(illnesses);
        pack.dataFetched.push('illness');
      })()
    );
  }

  if (dataNeeded.includes('period')) {
    fetchPromises.push(
      (async () => {
        // For period, always look back 90 days for cycle calculation
        const periodCutoff = getDateBefore('90d').toISOString().split('T')[0];

        const { data: periods } = await supabase
          .from('period_entries')
          .select('period_date')
          .eq('user_id', userId)
          .gte('period_date', periodCutoff)
          .order('period_date', { ascending: false });

        const dates = periods?.map(p => p.period_date) || [];
        pack.cycleInfo = calculateCycleStats(dates);
        pack.dataFetched.push('period');
      })()
    );
  }

  await Promise.all(fetchPromises);

  return pack;
}
