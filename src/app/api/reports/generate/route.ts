import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { GoogleGenAI } from '@google/genai';

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
       return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
    }
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { timeframe } = await request.json(); // daily, weekly, monthly
    
    const logs = await db.log.findMany({
      include: { vessel: true },
      orderBy: { timestamp: 'desc' },
      take: 50
    });

    const vessels = await db.vessel.findMany();

    const dataContext = JSON.stringify({
      vessels: vessels.map(v => ({ id: v.id, name: v.name, status: v.status })),
      logs: logs.map(l => ({ vesselName: l.vessel.name, fuelLevel: l.fuelLevel, speed: l.speed, incident: l.incident, timestamp: l.timestamp }))
    });

    const prompt = `Analyze the ${timeframe} report for the Poseidon Fleet vessels.\n` +
      `Focus the report on: fuel consumption, incident logs (if any), and overall route performance.\n` +
      `You MUST return the response STRICTLY in valid JSON format, without markdown backticks (\`\`\`) or text outside the JSON.\n` +
      `Use the following JSON structure:\n` +
      `{\n` +
      `  "executiveSummary": "A 2-3 sentence narrative summary of the overall fleet performance.",\n` +
      `  "fuelAnalysis": ["Analysis point 1", "Analysis point 2", ...],\n` +
      `  "vesselPerformance": ["Performance point 1", "Performance point 2", ...],\n` +
      `  "incidentsAndSos": ["Incident point 1 (or write 'No significant incidents' if safe)", ...],\n` +
      `  "recommendations": ["Recommendation point 1", "Recommendation point 2", ...]\n` +
      `}\n\n` +
      `All output values should be in English.\n\n` +
      `Recent operational data:\n${dataContext}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    let reportJson = null;
    const aiText = response.text || '';
    try {
        const textStr = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
        reportJson = JSON.parse(textStr);
    } catch (parseError) {
        console.error("Failed to parse JSON from AI", aiText);
        return NextResponse.json({ error: 'AI mengembalikan format yang tidak valid' }, { status: 500 });
    }

    return NextResponse.json({ success: true, report: reportJson });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal membuat laporan dengan AI' }, { status: 500 });
  }
}
