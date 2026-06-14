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

    const prompt = `Analisis laporan ${timeframe} untuk armada kapal Poseidon Fleet.\n` +
      `Fokuskan laporan pada: konsumsi bahan bakar, log insiden (jika ada), dan performa rute keseluruhan.\n` +
      `Anda HARUS mengembalikan response STRICTLY dalam format JSON yang valid, tanpa markdown backticks (\`\`\`) atau teks di luar JSON.\n` +
      `Gunakan struktur JSON berikut:\n` +
      `{\n` +
      `  "ringkasanEksekutif": "Ringkasan naratif 2-3 kalimat mengenai performa armada secara keseluruhan.",\n` +
      `  "analisisBahanBakar": ["Poin analisis 1", "Poin analisis 2", ...],\n` +
      `  "performaKapal": ["Poin performa 1", "Poin performa 2", ...],\n` +
      `  "insidenDanSos": ["Poin insiden 1 (atau tulis 'Tidak ada insiden signifikan' jika aman)", ...],\n` +
      `  "rekomendasi": ["Poin rekomendasi 1", "Poin rekomendasi 2", ...]\n` +
      `}\n\n` +
      `Data operasional terakhir:\n${dataContext}`;

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
