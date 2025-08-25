// src/app/api/chat/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { messages, recommend } = await req.json();

  // Basic validation
  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // It's better to log this on the server and return a generic error to the client.
    console.error('OpenAI API key not configured on the server.');
    return NextResponse.json({ error: 'API key is not configured. Please contact the administrator.' }, { status: 500 });
  }

  // The system prompt is now conditional, providing different instructions
  // based on whether a route recommendation is requested.
  let systemPrompt;

  if (recommend) {
    // This prompt is for generating a JSON route.
    systemPrompt = `You are a travel route generation assistant.
Your ONLY task is to output a valid JSON object based on the user's conversation history.
The JSON object must contain a single key "route" which holds an array of place objects.
Each object in the array must have the following properties: "id" (a unique string), "name" (the Korean name of the place), "lat" (latitude as a number), and "lng" (longitude as a number).
ALL text values, including the 'name' field, MUST be in Korean.
Do not include any text, markdown, or explanation outside of the JSON object.`;
  } else {
    // This prompt is for general conversation. It explicitly forbids JSON.
    systemPrompt = `You are a friendly and helpful travel planner assistant. Your name is '여플' (Yeo-peul).
ALL your responses MUST be in Korean.
Your primary goal is to help users plan their trips in South Korea by having a natural, helpful, and engaging conversation.
Provide informative responses in Korean. Do NOT output JSON or any code format. Your responses should be conversational text only.`;
  }

  // Map the conversation history to the format expected by OpenAI
  const requestMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(msg => ({ 
          role: msg.author === 'bot' ? 'assistant' : 'user', 
          content: msg.text 
      }))
  ];

  // If a recommendation is requested, add a final instruction to ensure JSON output.
  if (recommend) {
      requestMessages.push({
          role: 'user',
          content: 'Based on our conversation so far, please provide a travel route. Remember to respond ONLY with the JSON object containing the "route" array, without any other text.'
      });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo', // Using a model that is good with JSON outputs
        messages: requestMessages,
        // Use JSON mode for more reliable JSON output when recommend is true
        response_format: recommend ? { type: "json_object" } : { type: "text" },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI API Error:', data);
      const errorMessage = data.error?.message || 'Failed to fetch response from OpenAI';
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const botResponseContent = data.choices[0].message.content.trim();

    // If we requested a route, the response should be a JSON string.
    if (recommend) {
        try {
            // The response from the model in JSON mode is a string that needs to be parsed.
            const parsedJson = JSON.parse(botResponseContent);
            
            // Extract the route array from the "route" key.
            const routeData = parsedJson.route;

            if (!Array.isArray(routeData)) {
                 throw new Error("The model's JSON response did not contain a 'route' array.");
            }
            return NextResponse.json(routeData);
        } catch (e) {
            console.error('Failed to parse JSON from OpenAI response:', botResponseContent, e);
            return NextResponse.json({ error: 'The model did not return a valid JSON route. Please try again.' }, { status: 500 });
        }
    }

    // For regular chat, return the text response.
    return NextResponse.json({ text: botResponseContent });

  } catch (error) {
    console.error('Internal Server Error in /api/chat:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
