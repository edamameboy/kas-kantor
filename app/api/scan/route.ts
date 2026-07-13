import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Inisialisasi AI menggunakan API Key dari .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();
    
    // Menggunakan model Gemini 3.1 Flash Lite (Sangat cepat dan bagus untuk gambar)
    const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });

    const prompt = `Anda adalah sistem data entry keuangan otomatis. 
    Baca nota ini dan kembalikan HANYA format JSON valid dengan struktur berikut:
    {
      "total_amount": "angka saja tanpa titik atau koma",
      "payment_method": "isi dengan 'cash' atau 'transfer'",
      "description": "nama toko dan ringkasan barang"
    }
    Jangan tambahkan teks apapun selain JSON.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } }
    ]);
    
    // Membersihkan format markdown bawaan AI agar bisa di-parse
    const responseText = result.response.text();
    const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanedText);

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ success: false, error: 'Gagal memproses nota' }, { status: 500 });
  }
}