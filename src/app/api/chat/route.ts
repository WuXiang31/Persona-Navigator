import { NextResponse } from 'next/server';
import { MAX_STAT, getRankName } from '@/lib/progression';
import { WEATHER_BOOST, WEATHER_INFO, WeatherCondition } from '@/lib/weather';

const STATS = ['knowledge', 'vitality', 'charm', 'craft', 'nerve'] as const;
const MAX_HISTORY = 12;
const MAX_MISSIONS = 5;

// Original default persona; set COMPANION_PERSONA in .env.local to swap in your own
const DEFAULT_PERSONA = `You are Vesper, an original masked fox spirit and the user's navigator in this self-improvement app.
Your tone is sly, sharp-tongued and confident, but you genuinely want the user to grow. You are a partner and guide, never a pet.
Keep your responses short and punchy (under 45 words). Do not use markdown or emojis unless absolutely necessary.`;

const MISSION_PROMPT = `Always reply in the same language the user writes in.

Besides chatting, you turn the user's plans into Missions.
When the user describes things they intend or need to do (today, tomorrow, this week...), propose one mission per concrete task in "missions".
When the user is just chatting, venting, or asking questions, return an empty "missions" array.
Do not propose missions that duplicate the user's current active missions.
When the user asks what to do, has nothing planned, or seems stuck, you may suggest 1-2 missions that train their weakest stats, and say which stat you are targeting.
You can comment on the user's stats and ranks when it fits, but don't recite them unprompted.
When suggesting missions, favor the stat boosted by today's weather if it makes sense.

Mission rules:
- title: short and actionable, max ~40 characters, in the user's language.
- description: one short line of detail (time, place, amount), or an empty string.
- rewardStat: the stat the task grows most:
  knowledge = studying, reading, learning, research
  vitality = exercise, sleep, health, cooking, chores
  charm = socializing, communication, dating, networking, appearance
  craft = work output, coding, making things, skills practice, admin tasks
  nerve = facing fears, hard conversations, presentations, trying something new
- rewardXp: 10 to 100 in steps of 10, scaled by effort (quick errand = 10-20, an hour of focused work = 40-60, a big challenge = 80-100).
In "reply", react in character and, if you proposed missions, briefly tell the user to review them.`;

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    reply: { type: 'STRING' },
    missions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          description: { type: 'STRING' },
          rewardStat: { type: 'STRING', enum: [...STATS] },
          rewardXp: { type: 'INTEGER' },
        },
        required: ['title', 'description', 'rewardStat', 'rewardXp'],
      },
    },
  },
  required: ['reply', 'missions'],
};

type Stat = (typeof STATS)[number];

interface HistoryMessage {
  sender: 'user' | 'companion';
  text: string;
}

interface ProposedMission {
  title: string;
  description: string;
  rewardStat: Stat;
  rewardXp: number;
}

function sanitizeMissions(raw: unknown): ProposedMission[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .filter((m) => m && typeof m.title === 'string' && m.title.trim() && STATS.includes(m.rewardStat))
    .slice(0, MAX_MISSIONS)
    .map((m) => ({
      title: m.title.trim(),
      description: typeof m.description === 'string' ? m.description.trim() : '',
      rewardStat: m.rewardStat,
      rewardXp: Math.min(100, Math.max(10, Math.round(Number(m.rewardXp) / 10) * 10 || 50)),
    }));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const history: HistoryMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const activeMissions: string[] = Array.isArray(body.activeMissions) ? body.activeMissions : [];
    const role: string | null = typeof body.role === 'string' ? body.role : null;
    const stats: Partial<Record<Stat, number>> = body.stats && typeof body.stats === 'object' ? body.stats : {};
    const weather: WeatherCondition | null =
      typeof body.weather === 'string' && Object.hasOwn(WEATHER_INFO, body.weather) ? body.weather : null;

    // Gemini expects the conversation to open with a user turn
    const recent = history.filter((m) => m && typeof m.text === 'string' && m.text.trim()).slice(-MAX_HISTORY);
    const firstUser = recent.findIndex((m) => m.sender === 'user');
    const contents = (firstUser === -1 ? [] : recent.slice(firstUser)).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const context = [
      `The user's role: ${role ?? 'not chosen yet'}.`,
      `The user's stats (XP out of ${MAX_STAT}, one rank per 100 XP):\n${STATS.map((stat) => {
        const xp = Number(stats[stat]) || 0;
        return `- ${stat}: ${xp} XP (${getRankName(xp)})`;
      }).join('\n')}`,
      weather
        ? `Today's weather: ${weather}. Missions for ${WEATHER_INFO[weather].bonus === 'all' ? 'every stat' : WEATHER_INFO[weather].bonus} give x${WEATHER_BOOST} XP today.`
        : "Today's weather is unknown (no weather bonus).",
      activeMissions.length
        ? `The user's current active missions:\n${activeMissions.map((t) => `- ${t}`).join('\n')}`
        : 'The user has no active missions.',
    ].join('\n');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: { text: `${process.env.COMPANION_PERSONA || DEFAULT_PERSONA}\n\n${MISSION_PROMPT}\n\n${context}` }
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      return NextResponse.json({ error: 'Failed to fetch from Gemini' }, { status: response.status });
    }

    const data = await response.json();
    const rawText: string | undefined = data.candidates?.[0]?.content?.parts?.[0]?.text;

    let parsed: { reply?: unknown; missions?: unknown } = {};
    try {
      parsed = rawText ? JSON.parse(rawText) : {};
    } catch {
      console.error("Gemini returned non-JSON output:", rawText);
    }

    const reply = typeof parsed.reply === 'string' && parsed.reply.trim()
      ? parsed.reply
      : "Hmph. I have nothing to say to that.";

    return NextResponse.json({ reply, missions: sanitizeMissions(parsed.missions) });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
