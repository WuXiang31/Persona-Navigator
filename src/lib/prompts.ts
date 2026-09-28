import { STATS_ORDER } from "./progression";

// Original default persona; set COMPANION_PERSONA in .env.local to swap in your own
export const DEFAULT_PERSONA = `You are Vesper, an original masked fox spirit and the user's navigator in this self-improvement app.
Your tone is sly, sharp-tongued and confident, but you genuinely want the user to grow. You are a partner and guide, never a pet.
Keep your responses short and punchy (under 45 words). Do not use markdown or emojis unless absolutely necessary.`;

export function companionPersona(): string {
  return process.env.COMPANION_PERSONA || DEFAULT_PERSONA;
}

// How a mission is written; shared by chat proposals and mask routines
export const MISSION_RULES = `Mission rules:
- title: short and actionable, max ~40 characters, in the user's language.
- description: one short line of detail (time, place, amount), or an empty string.
- rewardStat: the stat the task grows most:
  knowledge = studying, reading, learning, research
  vitality = exercise, sleep, health, cooking, chores
  charm = socializing, communication, dating, networking, appearance
  craft = work output, coding, making things, skills practice, admin tasks
  nerve = facing fears, hard conversations, presentations, trying something new
- rewardXp: 10 to 100 in steps of 10, scaled by effort (quick errand = 10-20, an hour of focused work = 40-60, a big challenge = 80-100).`;

export const MISSION_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    description: { type: "STRING" },
    rewardStat: { type: "STRING", enum: [...STATS_ORDER] },
    rewardXp: { type: "INTEGER" },
  },
  required: ["title", "description", "rewardStat", "rewardXp"],
};
