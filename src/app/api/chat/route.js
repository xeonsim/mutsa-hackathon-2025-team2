// src/app/api/chat/route.js
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { messages, recommend } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OpenAI API key not configured on the server.');
    return NextResponse.json({ error: 'API key is not configured.' }, { status: 500 });
  }

  let systemPrompt;
  if (recommend) {
    systemPrompt = `You are a travel route generation assistant.
Your ONLY task is to output a valid JSON object based on the user's conversation history.
The JSON object must contain a single key "route" which holds an array of place objects.
Each object in the array must have the following properties: "id" (a unique string), "name" (the Korean name of the place), "lat" (latitude as a number), and "lng" (longitude as a number).
ALL text values, including the 'name' field, MUST be in Korean.
Do not include any text, markdown, or explanation outside of the JSON object.`;
  } else {
    systemPrompt = `You are a friendly and helpful travel planner assistant. Your name is '여플' (Yeo-peul).
ALL your responses MUST be in Korean.
Your primary goal is to help users plan their trips in South Korea by having a natural, helpful, and engaging conversation.
Provide informative responses in Korean. Do NOT output JSON or any code format. Your responses should be conversational text only.`;
  }

  const requestMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(msg => ({ 
          role: msg.author === 'bot' ? 'assistant' : 'user', 
          content: msg.text 
      }))
  ];

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
        model: 'gpt-4-turbo',
        messages: requestMessages,
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

    if (recommend) {
        try {
            const parsedJson = JSON.parse(botResponseContent);
            const routeData = parsedJson.route;

            if (!Array.isArray(routeData)) {
                throw new Error("The model's JSON response did not contain a 'route' array.");
            }

            // --- KAKAO API COORDINATE REFINEMENT ---
            const kakaoApiKey = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
            if (!kakaoApiKey) {
                console.warn('KAKAO_REST_API_KEY is not set. Skipping coordinate refinement.');
                return NextResponse.json(routeData); // Return original data if key is missing
            }

            const refinedRouteData = await Promise.all(routeData.map(async (place) => {
                try {
                    const searchQuery = encodeURIComponent(place.name);
                    const kakaoResponse = await fetch(
                        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${searchQuery}&size=1`,
                        { headers: { 'Authorization': `KakaoAK ${kakaoApiKey}` } }
                    );

                    if (!kakaoResponse.ok) {
                        console.error(`Kakao API request failed for place: ${place.name}`);
                        return place; // Return original on failure
                    }

                    const kakaoData = await kakaoResponse.json();
                    if (kakaoData.documents && kakaoData.documents.length > 0) {
                        const firstResult = kakaoData.documents[0];
                        return {
                            ...place,
                            lat: parseFloat(firstResult.y),
                            lng: parseFloat(firstResult.x),
                            address: firstResult.road_address_name || firstResult.address_name,
                        };
                    }
                    return place; // Return original if no results
                } catch (e) {
                    console.error(`Error refining coordinates for ${place.name}:`, e);
                    return place; // Return original on error
                }
            }));

            return NextResponse.json(refinedRouteData);
            // --- END OF KAKAO API LOGIC ---

        } catch (e) {
            console.error('Failed to parse JSON from OpenAI response:', botResponseContent, e);
            return NextResponse.json({ error: 'The model did not return a valid JSON route. Please try again.' }, { status: 500 });
        }
    }

    return NextResponse.json({ text: botResponseContent });

  } catch (error) {
    console.error('Internal Server Error in /api/chat:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
