"use client";

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Store, Briefcase, Calendar, User, FileText, Tag, Activity, UploadCloud, ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { getTransactionById, getCurrentUser, updateTransactionStatus, submitTransferProof } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function TransactionDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [trx, setTrx] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // State baru untuk fitur hide/show gambar
  const [showReceipt, setShowReceipt] = useState(false);
  const [showProof, setShowProof] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const t = await getTransactionById(id);
      if (!t) router.push('/transactions');
      setTrx(t);
      const u = await getCurrentUser();
      setCurrentUser(u);
      setLoading(false);
    };
    fetchData();
  }, [id, router]);

  const isAdmin = currentUser?.role === 'ADMIN';
  const isIncome = trx?.type === 'INCOME';

  const handleStatusChange = async (newStatus: string) => {
    await updateTransactionStatus(trx.id, newStatus);
    setTrx({ ...trx, status: newStatus }); 
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') resolve(reader.result);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const base64 = await fileToBase64(file);
      await submitTransferProof(trx.id, base64);
      setTrx({ ...trx, status: 'COMPLETED', transferProof: base64 });
      setShowProof(true); // Langsung buka dropdown bukti setelah berhasil upload
      alert('Bukti transfer berhasil diunggah. Transaksi Selesai!');
    } catch (error) {
      alert('Gagal mengunggah bukti transfer.');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Memuat...</div>;

  return (
    <div className="min-h-screen bg-gray-50 w-full max-w-md mx-auto relative shadow-sm pb-24">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <Link href="/transactions" className="flex items-center gap-1 text-gray-600">
          <ArrowLeft className="w-5 h-5" /> Back
        </Link>
        <h1 className="text-lg font-bold text-gray-800">Detail Transaksi</h1>
        <div className="w-16"></div>
      </header>

      <main className="p-4 mt-2">
        
        {/* Tombol Aksi Admin */}
        {isAdmin && trx.status === 'PENDING' && (
          <div className="flex gap-2 justify-end mb-4">
            <button onClick={() => handleStatusChange('REJECTED')} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold border border-red-100 hover:bg-red-100 transition">
              Tolak
            </button>
            <button onClick={() => handleStatusChange('APPROVED')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition">
              Setujui Reimburse
            </button>
          </div>
        )}

        {/* Nominal & Status Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${isIncome ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-700'}`}>
            {isIncome ? <Briefcase className="w-7 h-7" /> : <Store className="w-7 h-7" />}
          </div>
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">
            {isIncome ? 'Pemasukan' : 'Pengeluaran'}
          </p>
          <h2 className={`text-4xl font-light tracking-tight mb-4 ${isIncome ? 'text-blue-600' : 'text-gray-900'}`}>
            {isIncome ? '+' : '-'}Rp {trx.amount.toLocaleString('id-ID')}
          </h2>

          {trx.status === 'COMPLETED' && <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">SELESAI</span>}
          {trx.status === 'PENDING' && <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold">MENUNGGU ACC REIMBURSE</span>}
          {trx.status === 'APPROVED' && <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">REIMBURSE DISETUJUI</span>}
          {trx.status === 'REJECTED' && <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold line-through">DITOLAK</span>}
        </div>

        {/* Area Upload Bukti Transfer Khusus Admin */}
        {isAdmin && trx.status === 'APPROVED' && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mt-4 text-center">
            <p className="text-sm font-bold text-blue-800 mb-1">Menunggu Bukti Transfer</p>
            <p className="text-xs text-blue-600 mb-4">Silakan transfer uang ke pemohon dan unggah bukti transfer di bawah ini.</p>
            
            <label className="cursor-pointer bg-white border-2 border-dashed border-blue-300 rounded-xl p-6 flex flex-col items-center hover:bg-blue-50/50 transition">
              <input type="file" className="hidden" accept="image/*" onChange={handleUploadProof} disabled={isUploading} />
              <UploadCloud className="w-8 h-8 text-blue-500 mb-2" />
              <span className="text-sm font-bold text-blue-700">{isUploading ? 'Sedang Mengunggah...' : 'Pilih Gambar Bukti Transfer'}</span>
            </label>
          </div>
        )}

        {/* ========================================= */}
        {/* AREA GAMBAR BUKTI DENGAN DROPDOWN/ACCORDION */}
        
        {/* 1. Tampilan Nota Pembelian (Struk) */}
        {trx.receiptImage && (
          <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button 
              onClick={() => setShowReceipt(!showReceipt)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500"/> Bukti Struk / Nota Pembelian
              </h3>
              {showReceipt ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
            
            {showReceipt && (
              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <img src={trx.receiptImage} alt="Struk Pembelian" className="w-full rounded-xl border border-gray-200" />
              </div>
            )}
          </div>
        )}

        {/* 2. Tampilan Bukti Transfer (Reimburse dari Admin) */}
        {trx.status === 'COMPLETED' && trx.transferProof && (
          <div className="mt-4 bg-white rounded-2xl border border-green-200 shadow-sm overflow-hidden">
            <button 
              onClick={() => setShowProof(!showProof)}
              className="w-full p-4 flex items-center justify-between bg-green-50 hover:bg-green-100 transition-colors"
            >
              <h3 className="text-sm font-bold text-green-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-green-600"/> Bukti Transfer Reimburse
              </h3>
              {showProof ? <ChevronUp className="w-5 h-5 text-green-700" /> : <ChevronDown className="w-5 h-5 text-green-700" />}
            </button>
            
            {showProof && (
              <div className="p-4 border-t border-green-100 bg-white">
                <img src={trx.transferProof} alt="Bukti Transfer" className="w-full rounded-xl border border-gray-200" />
              </div>
            )}
          </div>
        )}
        {/* ========================================= */}

        {/* Informasi Detail Tabel Bawah */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mt-4">
          <div className="p-4 border-b border-gray-50 flex items-start gap-3">
            <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Kategori</p>
              <p className="font-semibold text-gray-900">{trx.category || '-'}</p>
            </div>
          </div>
          
          <div className="p-4 border-b border-gray-50 flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Tanggal Transaksi</p>
              <p className="font-semibold text-gray-900">
                {new Date(trx.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="p-4 border-b border-gray-50 flex items-start gap-3">
            <User className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Diinput Oleh</p>
              <p className="font-semibold text-gray-900">{trx.user?.name}</p>
              <p className="text-xs text-blue-600">{trx.user?.phone}</p>
            </div>
          </div>

          <div className="p-4 flex items-start gap-3">
            <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="w-full">
              <p className="text-xs text-gray-500 font-medium">Catatan / Keterangan</p>
              <p className="font-medium text-gray-800 mt-1 bg-gray-50 p-3 rounded-lg text-sm border border-gray-100 min-w-[200px]">
                {trx.note || 'Tidak ada catatan'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center gap-1.5 text-xs text-gray-400 mt-8">
          <Activity className="w-4 h-4" /> 
          <span>ID Transaksi: {trx.id.slice(-8).toUpperCase()}</span>
        </div>
      </main>
    </div>
  );
}