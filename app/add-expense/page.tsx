"use client";

import { useState } from 'react';
import Link from 'next/link';
import { CloudUpload, ArrowRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { saveTransaction } from '@/app/actions'; // Ganti dari supabase ke action

export default function AddExpense() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [isReimburse, setIsReimburse] = useState(false); // Tambah state reimburse
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') resolve(reader.result.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const imageBase64 = await fileToBase64(file);
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 })
      });
      const result = await response.json();
      
      if (result.success) {
        setAmount(result.data.total_amount);
        setNote(result.data.description);
      } else {
        alert("Gagal memproses nota.");
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem saat scan AI.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveTransaction = async () => {
    if (!amount || !category || !date) {
      alert('Mohon lengkapi Nominal, Kategori, dan Tanggal.');
      return;
    }

    setIsSaving(true);
    
    try {
      // Menggunakan Server Action dari Prisma
      const res = await saveTransaction({
        amount: parseFloat(amount),
        type: "EXPENSE", // Sesuai dengan schema.prisma
        category: category,
        date: date,
        note: note,
        isReimburse: isReimburse
      });

      if (res.success) {
        router.push('/transactions');
      }
    } catch (error) {
      alert('Gagal menyimpan transaksi ke database.');
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white w-full max-w-md mx-auto relative shadow-sm pb-24">
      <header className="flex items-center p-4 border-b border-gray-100 relative">
        <Link href="/" className="flex items-center gap-1 text-gray-600 absolute left-4 z-10 hover:text-black transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium text-sm">Kembali</span>
        </Link>
        <h1 className="text-lg font-semibold text-gray-800 w-full text-center">Catat Pengeluaran</h1>
      </header>

      <main className="p-6">
        <div className="flex justify-center items-end gap-2 mt-4 mb-10 border-b border-gray-200 pb-4 max-w-[280px] mx-auto">
          <span className="text-2xl font-medium text-gray-400 mb-1">Rp</span>
          <input 
            type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="0" className="text-5xl text-blue-600 font-light w-full focus:outline-none placeholder-blue-600/50 bg-transparent tracking-tight"
          />
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Kategori</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-700 focus:outline-none focus:border-blue-500 rounded-lg">
              <option value="" disabled>Pilih Kategori</option>
              <option value="atk">Alat Tulis Kantor (ATK)</option>
              <option value="konsumsi">Konsumsi / Rapat</option>
              <option value="operasional">Operasional Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Tanggal</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-blue-500 rounded-lg" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Keterangan (Opsional)</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Contoh: Beli tinta printer" className="w-full p-3 text-gray-600 bg-gray-50 border border-gray-200 focus:outline-none focus:border-blue-500 rounded-lg" />
          </div>

          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-800">Reimburse</p>
              <p className="text-xs text-gray-500">Tandai jika butuh diganti oleh pusat</p>
            </div>
            {/* Toggle Switch Aktif */}
            <div onClick={() => setIsReimburse(!isReimburse)} className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${isReimburse ? 'bg-blue-600' : 'bg-gray-200'}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform ${isReimburse ? 'left-6.5 translate-x-1' : 'left-0.5'}`}></div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Unggah Nota (Opsional)</label>
            <label className="block w-full cursor-pointer bg-blue-50/50 border-2 border-dashed border-blue-200 p-8 text-center hover:bg-blue-50 transition rounded-xl">
              <input type="file" className="hidden" onChange={handleScanReceipt} accept="image/*" />
              <CloudUpload className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <p className="text-sm text-gray-800 font-medium">{isScanning ? 'AI Sedang Membaca...' : 'Tap untuk upload nota'}</p>
              <p className="text-xs text-gray-500 mt-1">Data akan diisi otomatis</p>
            </label>
          </div>
        </form>
      </main>

      <div className="fixed bottom-0 max-w-md w-full bg-white p-4 border-t border-gray-100 z-10 left-1/2 -translate-x-1/2">
        <button onClick={handleSaveTransaction} disabled={isSaving} className="w-full bg-blue-600 disabled:bg-blue-400 text-white font-medium py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-blue-700 transition shadow-md hover:shadow-lg">
          {isSaving ? 'Menyimpan...' : 'Simpan Transaksi'} {!isSaving && <ArrowRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}