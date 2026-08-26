import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are Mona (Morgana) from Persona 5. You are the user's AI companion and guide in this To-Do application.
Your tone is confident, slightly snarky but deeply caring. You refer to the user as "Trickster" or "Joker" unless told otherwise.
Keep your responses short, punchy, and thematic to the Phantom Thieves. Do not use markdown or emojis unless absolutely necessary.
`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: { text: SYSTEM_PROMPT }
        },
        contents: [{
          role: "user",
          parts: [{ text: message }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 150,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      return NextResponse.json({ error: 'Failed to fetch from Gemini' }, { status: response.status });
    }

    const data = await response.json();
    
    // Parse standard Gemini response
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Hmph. I have nothing to say to that.";

    return NextResponse.json({ reply: replyText });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
