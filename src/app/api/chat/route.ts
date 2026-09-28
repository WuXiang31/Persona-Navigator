import { NextResponse } from 'next/server';
import { MAX_STAT, STATS_ORDER, getRankName } from '@/lib/progression';
import { WEATHER_BOOST, WEATHER_INFO, WeatherCondition } from '@/lib/weather';
import { sanitizeMissions } from '@/lib/missionProposals';
import { FOCUS_BOOST, describeProfile, sanitizeMask, sanitizeProfile } from '@/lib/mask';
import { GeminiContent, generateJson } from '@/lib/gemini';
import { MISSION_RULES, MISSION_SCHEMA, companionPersona } from '@/lib/prompts';

// Leaves room for a few Gemini retries (the platform may cap this lower)
export const maxDuration = 60;

const MAX_HISTORY = 12;

const MISSION_PROMPT = `Always reply in the same language the user writes in.

Besides chatting, you turn the user's plans into Missions.
When the user describes things they intend or need to do (today, tomorrow, this week...), propose one mission per concrete task in "missions".
When the user is just chatting, venting, or asking questions, return an empty "missions" array.
Do not propose missions that duplicate the user's current active missions.
When the user asks what to do, has nothing planned, or seems stuck, you may suggest 1-2 missions that fit who they are and train their weakest or focus stats, and say which stat you are targeting. Prefer their mask's routines when one fits.
You can comment on the user's stats and ranks when it fits, but don't recite them unprompted.
When the user has a mask, encourage them in terms of the identity they chose: each finished mission is a vote for who they want to become.
When suggesting missions, favor the stat boosted by today's weather if it makes sense.

${MISSION_RULES}
In "reply", react in character and, if you proposed missions, briefly tell the user to review them.`;

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    reply: { type: 'STRING' },
    missions: { type: 'ARRAY', items: MISSION_SCHEMA },
  },
  required: ['reply', 'missions'],
};

type Stat = (typeof STATS_ORDER)[number];

interface HistoryMessage {
  sender: 'user' | 'companion';
  text: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const history: HistoryMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const activeMissions: string[] = Array.isArray(body.activeMissions) ? body.activeMissions : [];
    const role: string | null = typeof body.role === 'string' ? body.role : null;
    const profile = sanitizeProfile(body.profile);
    const mask = sanitizeMask(body.mask);
    const stats: Partial<Record<Stat, number>> = body.stats && typeof body.stats === 'object' ? body.stats : {};
    const weather: WeatherCondition | null =
      typeof body.weather === 'string' && Object.hasOwn(WEATHER_INFO, body.weather) ? body.weather : null;

    // Gemini expects the conversation to open with a user turn
    const recent = history.filter((m) => m && typeof m.text === 'string' && m.text.trim()).slice(-MAX_HISTORY);
    const firstUser = recent.findIndex((m) => m.sender === 'user');
    const contents: GeminiContent[] = (firstUser === -1 ? [] : recent.slice(firstUser)).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }],
    }));

    if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const context = [
      profile ? `About the user:\n${describeProfile(profile)}` : '',
      mask
        ? [
            `The user's mask: "${mask.name}". Identity: "${mask.identity}".`,
            `Focus stats (x${FOCUS_BOOST} XP): ${mask.focusStats.join(', ')}.`,
            mask.routines.length
              ? `Their routine missions:\n${mask.routines.map((r) => `- ${r.title} (${r.rewardStat}, ${r.rewardXp} XP)`).join('\n')}`
              : '',
          ].filter(Boolean).join('\n')
        : `The user's role: ${role ?? 'not chosen yet'}.`,
      `The user's stats (XP out of ${MAX_STAT}, one rank per 100 XP):\n${STATS_ORDER.map((stat) => {
        const xp = Number(stats[stat]) || 0;
        return `- ${stat}: ${xp} XP (${getRankName(xp)})`;
      }).join('\n')}`,
      weather
        ? `Today's weather: ${weather}. Missions for ${WEATHER_INFO[weather].bonus === 'all' ? 'every stat' : WEATHER_INFO[weather].bonus} give x${WEATHER_BOOST} XP today.`
        : "Today's weather is unknown (no weather bonus).",
      activeMissions.length
        ? `The user's current active missions:\n${activeMissions.map((t) => `- ${t}`).join('\n')}`
        : 'The user has no active missions.',
    ].filter(Boolean).join('\n');

    const result = await generateJson({
      system: `${companionPersona()}\n\n${MISSION_PROMPT}\n\n${context}`,
      contents,
      schema: RESPONSE_SCHEMA,
    });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

    const reply = typeof result.data.reply === 'string' && result.data.reply.trim()
      ? result.data.reply
      : "Hmph. I have nothing to say to that.";

    return NextResponse.json({ reply, missions: sanitizeMissions(result.data.missions) });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
