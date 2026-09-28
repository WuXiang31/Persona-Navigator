import { NextResponse } from "next/server";
import { STATS_ORDER } from "@/lib/progression";
import { MAX_ROUTINES, describeProfile, profileTexts, sanitizeMask, sanitizeProfile, writingLanguage } from "@/lib/mask";
import { generateJson } from "@/lib/gemini";
import { MISSION_RULES, MISSION_SCHEMA } from "@/lib/prompts";

// Leaves room for a few Gemini retries (the platform may cap this lower)
export const maxDuration = 60;

const MASK_PROMPT = `You design a personal "mask" for a player of a real-life RPG self-improvement app.
The player levels up five stats (${STATS_ORDER.join(", ")}) by completing real missions.
From the player's profile, create:
- name: an evocative mask title, 2-4 words (or 3-6 characters in Chinese), e.g. "The Code Wanderer" or "代码漫游者". Original, no references to existing games, anime or brands.
- identity: one first-person sentence (max ~25 words) describing who they are becoming, grounded in their aspiration. Each finished mission counts as a vote for this identity.
- focusStats: the two stats that matter most for this person right now.
- routines: 6 to ${MAX_ROUTINES} small, concrete, repeatable missions that fit their real life and situation.
  Make them specific to who they are. For example, a computer science student might get: do an assignment, solve one LeetCode problem, touch grass for 20 minutes, talk to a classmate, ship a commit on a side project.
  Cover their focus stats most, but include at least one mission for health (vitality) and one for people (charm).
  Keep them doable in one sitting and safe; never suggest anything harmful or extreme.

${MISSION_RULES}

Write EVERY field, including name and identity, in the language given below.`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    name: { type: "STRING" },
    identity: { type: "STRING" },
    focusStats: { type: "ARRAY", items: { type: "STRING", enum: [...STATS_ORDER] } },
    routines: { type: "ARRAY", items: MISSION_SCHEMA },
  },
  required: ["name", "identity", "focusStats", "routines"],
};

// POST { profile } -> { mask }: a personal mask generated from the Awakening questionnaire
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const profile = sanitizeProfile(body?.profile);
    if (!profile) return NextResponse.json({ error: "A valid profile is required" }, { status: 400 });

    const result = await generateJson({
      system: `${MASK_PROMPT}\nLanguage: ${writingLanguage(profileTexts(profile), body?.lang)}.`,
      contents: [{ role: "user", parts: [{ text: describeProfile(profile) }] }],
      schema: RESPONSE_SCHEMA,
      temperature: 0.9,
    });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

    const mask = sanitizeMask(result.data);
    if (!mask || mask.routines.length === 0) {
      console.error("Mask generation returned unusable output:", result.data);
      return NextResponse.json({ error: "Could not generate a mask" }, { status: 502 });
    }
    return NextResponse.json({ mask });
  } catch (error) {
    console.error("Mask API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
