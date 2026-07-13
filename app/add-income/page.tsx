"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { saveTransaction } from '@/app/actions';

export default function AddIncome() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveIncome = async () => {
    if (!amount || !source || !date) {
      alert('Mohon lengkapi Nominal, Sumber, dan Tanggal.');
      return;
    }

    setIsSaving(true);
    
    try {
      const res = await saveTransaction({
        amount: parseFloat(amount),
        type: "INCOME", // Sesuai schema.prisma
        category: source,
        date: date,
        note: note,
      });

      if (res.success) {
        router.push('/transactions');
      }
    } catch (error) {
      alert('Gagal menyimpan pemasukan ke database.');
      setIsSaving(false);
    }
  };

  const setQuickTag = (tag: string) => {
    setNote((prev) => prev ? `${prev}, ${tag}` : tag);
  };

  return (
    <div className="min-h-screen bg-white w-full max-w-md mx-auto relative shadow-sm pb-24">
      <header className="flex items-center p-4 border-b border-gray-100 relative">
        <Link href="/" className="flex items-center gap-1 text-blue-600 absolute left-4 z-10 hover:text-blue-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium text-sm">Batal</span>
        </Link>
        <h1 className="text-lg font-bold text-gray-800 w-full text-center">Catat Pemasukan</h1>
      </header>

      <main className="p-6 space-y-8 mt-4">
        <div className="text-center">
          <p className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-4">Nominal</p>
          <div className="flex justify-center items-baseline gap-2 border-b border-gray-300 pb-4 max-w-[280px] mx-auto focus-within:border-blue-600 transition-colors">
            <span className="text-xl font-medium text-gray-400">Rp</span>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="text-5xl text-gray-800 font-light w-full focus:outline-none bg-transparent tracking-tight text-center" />
          </div>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">Sumber Dana</label>
            <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-700 focus:outline-none focus:border-blue-500 rounded-lg">
              <option value="" disabled>Pilih Sumber Pemasukan</option>
              <option value="pusat">Topup Kas Pusat</option>
              <option value="karyawan">Pengembalian Dana Karyawan</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">Tanggal</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-200 text-gray-700 focus:outline-none focus:border-blue-500 rounded-lg" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2">Catatan Tambahan</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tulis detail pemasukan..." rows={3} className="w-full p-3 text-gray-600 bg-gray-50 border border-gray-200 focus:outline-none focus:border-blue-500 rounded-lg resize-none"></textarea>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-3">Tag Cepat</label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setQuickTag('Divisi IT')} className="bg-gray-100 text-gray-700 text-xs py-2 px-3 font-medium hover:bg-blue-100 hover:text-blue-700 rounded-lg">Divisi IT</button>
              <button type="button" onClick={() => setQuickTag('Divisi HR')} className="bg-gray-100 text-gray-700 text-xs py-2 px-3 font-medium hover:bg-blue-100 hover:text-blue-700 rounded-lg">Divisi HR</button>
              <button type="button" onClick={() => setQuickTag('Uang Muka')} className="bg-gray-100 text-gray-700 text-xs py-2 px-3 font-medium hover:bg-blue-100 hover:text-blue-700 rounded-lg">Uang Muka</button>
            </div>
          </div>
        </form>
      </main>

      <div className="fixed bottom-0 max-w-md w-full bg-white p-4 border-t border-gray-100 z-10 left-1/2 -translate-x-1/2">
        <button onClick={handleSaveIncome} disabled={isSaving} className="w-full bg-blue-600 disabled:bg-blue-400 text-white font-medium py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-blue-700 transition shadow-md hover:shadow-lg">
          {isSaving ? 'Menyimpan...' : 'Simpan Pemasukan'} {!isSaving && <ArrowRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}