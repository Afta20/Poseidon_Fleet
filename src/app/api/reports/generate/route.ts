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
      `Buat laporan profesional dalam bahasa Indonesia yang terstruktur dengan format Markdown yang rapi (Gunakan subjudul, list, dll).\n\n` +
      `Data operasional terakhir:\n${dataContext}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return NextResponse.json({ success: true, report: response.text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal membuat laporan dengan AI' }, { status: 500 });
  }
}
