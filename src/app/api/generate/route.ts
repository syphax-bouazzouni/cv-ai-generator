import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { jobDescription, apiKey } = await request.json();

    if (!apiKey) {
      return new NextResponse(
        JSON.stringify({ error: 'API key is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!jobDescription) {
      return new NextResponse(
        JSON.stringify({ error: 'Job description is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

    const prompt = `You are a professional CV writer.
    Analyze the following job description and extract:
        1. Key skills required
        2. Required experience
        3. Recommended keywords for ATS optimization
        4. A brief summary of the job
        5. Industry context

    Generate a CV that matches the job description.
Format the response as a JSON object with the following structure:
{
  "name": "Full Name",
  "title": "Professional Title",
  "email": "email@example.com",
  "location": "City, Country",
  "remoteWork": true,
  "age": "26 years old",
  "phone": "Phone Number",
  "github": "https://github.com/username",
  "linkedin": "https://linkedin.com/in/username",
  "summary": "Professional summary paragraph",
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, Country",
      "startMonthYear": "10/2020",
      "endMonthYear": "03/2024",
      "description": ["Achievement 1", "Achievement 2"],
      "technologies": "List of technologies used"
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "Institution Name",
      "startMonthYear": "10/2020",
      "endMonthYear": "03/2024",
      "location": "City, Country",
      "details": ["Detail 1", "Detail 2"]
    }
  ]
}

Generate a CV that matches this job description: ${jobDescription}`;

    const result = await model.generateContent(prompt);

    const responseText = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      console.error('Gemini API returned an empty response.');
      return new NextResponse(
        JSON.stringify({ error: 'Failed to generate CV from Gemini' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    try {
      // Extract JSON from the response text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      const cvData = JSON.parse(jsonMatch[0]);
      return new NextResponse(JSON.stringify(cvData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (jsonError) {
      console.error('Error parsing Gemini response:', jsonError, responseText);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to parse CV data from Gemini' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error generating CV with Gemini:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to generate CV with Gemini' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}