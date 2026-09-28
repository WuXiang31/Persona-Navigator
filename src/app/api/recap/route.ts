import { NextResponse } from "next/server";
import { STATS_ORDER } from "@/lib/progression";
import { describeProfile, profileTexts, sanitizeProfile, writingLanguage } from "@/lib/mask";
import type { Recap } from "@/lib/chapter";
import { generateJson } from "@/lib/gemini";
import { companionPersona } from "@/lib/prompts";

// Leaves room for a few Gemini retries (the platform may cap this lower)
export const maxDuration = 60;

const RECAP_PROMPT = `A month (a "chapter") of the player's real-life growth has just ended. Write the closing words of the chapter.

For this moment, set your usual teasing aside. Speak warmly and gently, like a companion at the end of an arc in an anime:
- Honor the effort. Name two or three specific things from the numbers (a streak, a routine they kept coming back to, a stat that grew, the time of day they usually showed up).
- Invite them to look back at how far they came and to thank the version of themselves who kept trying to become better.
- If something was left untouched, mention it softly as something to carry into the next chapter, never as a failure.
- If the month was quiet, be kind about it: showing up at all counts, and the next chapter is a fresh start.
- Tie it back to the identity they chose, if they have one.
- 4 to 6 sentences, no lists, no markdown, no emojis. Address the player directly.`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: { summary: { type: "STRING" } },
  required: ["summary"],
};

// Compact, readable version of the recap numbers for the prompt
function describeRecap(r: Recap): string {
  const lines = [
    `Chapter ${r.number}: ${r.startedOn} to ${r.endedOn}.`,
    r.mask ? `Mask: "${r.mask.name}". Identity: "${r.mask.identity}". Focus stats: ${r.mask.focusStats.join(", ")}.` : "",
    `Missions cleared: ${r.missionsCleared} (${r.fromRoutines} from their routines). Quick Logs: ${r.quickLogs}.`,
    `Active days: ${r.activeDays}. Longest streak: ${r.longestStreak} days.`,
    "Stats:",
    ...r.stats.map(
      (s) => `- ${s.stat}: ${s.start} -> ${s.end} XP (+${s.gained}, -${s.lost} decay), ${s.startRank} -> ${s.endRank}`
    ),
    r.topMissions.length ? `Most repeated: ${r.topMissions.map((m) => `${m.title} x${m.count}`).join(", ")}.` : "",
    r.untouchedRoutines.length ? `Routines never done: ${r.untouchedRoutines.join(", ")}.` : "",
    r.mostImproved ? `Most improved stat: ${r.mostImproved}.` : "",
    r.leastTrained ? `Least trained stat: ${r.leastTrained}.` : "",
    r.favoriteTime ? `Usually completed missions in the ${r.favoriteTime}.` : "",
    r.weatherBoosted ? `Missions boosted by the weather: ${r.weatherBoosted}.` : "",
  ];
  return lines.filter(Boolean).join("\n");
}

const isRecap = (value: unknown): value is Recap => {
  const r = value as Recap;
  return !!r && typeof r.number === "number" && Array.isArray(r.stats) && r.stats.every((s) => STATS_ORDER.includes(s.stat));
};

// POST { recap, profile? } -> { summary }: the navigator's closing words for a finished chapter
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!isRecap(body?.recap)) return NextResponse.json({ error: "A recap is required" }, { status: 400 });
    const profile = sanitizeProfile(body.profile);
    const recap: Recap = body.recap;
    const language = writingLanguage([...profileTexts(profile), recap.mask?.name, recap.mask?.identity]);

    const result = await generateJson({
      system: `${companionPersona()}\n\n${RECAP_PROMPT}\n\nWrite the summary in ${language}. Refer to the mask by its exact name.`,
      contents: [
        {
          role: "user",
          parts: [{ text: [profile ? `About the player:\n${describeProfile(profile)}` : "", describeRecap(recap)].filter(Boolean).join("\n\n") }],
        },
      ],
      schema: RESPONSE_SCHEMA,
      temperature: 0.8,
    });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

    const summary = typeof result.data.summary === "string" ? result.data.summary.trim() : "";
    if (!summary) return NextResponse.json({ error: "Could not write the recap" }, { status: 502 });
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Recap API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
