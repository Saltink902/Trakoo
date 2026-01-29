import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { analyzeQuestionIntent } from '@/lib/insights/questionAnalyzer';
import { buildEvidencePack } from '@/lib/insights/evidenceBuilder';
import { openai, MODEL, buildSystemPrompt, InsightResponse } from '@/lib/insights/openai';

// Initialize Supabase client for auth verification
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Get auth token from request header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - missing auth token' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the user with Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - invalid token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { question } = body;

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid question' },
        { status: 400 }
      );
    }

    // Analyze the question to determine what data we need
    const { dataNeeded, timeRange } = analyzeQuestionIntent(question);

    // Build evidence pack with only relevant data
    const evidencePack = await buildEvidencePack(user.id, dataNeeded, timeRange);

    // Check if we have any meaningful data
    const hasData = Object.entries(evidencePack)
      .filter(([key]) => key !== 'dataFetched')
      .some(([, value]) => value && !String(value).includes('No ') && !String(value).includes('insufficient'));

    // Build system prompt with evidence
    const systemPrompt = buildSystemPrompt(evidencePack);

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const responseText = completion.choices[0]?.message?.content || '';

    // Parse the JSON response
    let insightResponse: InsightResponse;
    try {
      // Clean up the response in case there are markdown code blocks
      let cleanedResponse = responseText.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.slice(7);
      }
      if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.slice(3);
      }
      if (cleanedResponse.endsWith('```')) {
        cleanedResponse = cleanedResponse.slice(0, -3);
      }
      cleanedResponse = cleanedResponse.trim();

      insightResponse = JSON.parse(cleanedResponse);
    } catch {
      // If parsing fails, create a fallback response
      insightResponse = {
        answer: responseText || "I'm having trouble analyzing your data right now. Please try again.",
        suspects: [],
        evidence: [],
        confidence: 1,
        dataUsed: evidencePack.dataFetched,
      };
    }

    // Ensure dataUsed reflects what was actually fetched
    insightResponse.dataUsed = evidencePack.dataFetched;

    // Add a note if no data was found
    if (!hasData && !insightResponse.answer.toLowerCase().includes('no data') && !insightResponse.answer.toLowerCase().includes('track')) {
      insightResponse.answer += " Note: I have limited data to work with. Keep tracking to get better insights!";
      insightResponse.confidence = Math.min(insightResponse.confidence, 2);
    }

    return NextResponse.json(insightResponse);

  } catch (error) {
    console.error('Insights API error:', error);

    // Check if it's an OpenAI API error
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
