"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wallet, UserCircle, TrendingUp, Store, Briefcase, Plus, Minus, FileText } from 'lucide-react';
import { getAllTransactions } from '@/app/actions';

export default function Home() {
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllTransactions().then((data) => {
      setTransactions(data);
      
      // TAMBAHKAN (t: any) di sini
      const validTransactions = data.filter((t: any) => t.status === 'COMPLETED' || t.status === 'APPROVED');
      
      // TAMBAHKAN (acc: number, curr: any) di sini
      const total = validTransactions.reduce((acc: number, curr: any) => {
        return curr.type === 'INCOME' ? acc + curr.amount : acc - curr.amount;
      }, 0);
      
      setBalance(total);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-white w-full max-w-md mx-auto relative shadow-sm pb-20">
      <header className="flex justify-between items-center p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Wallet className="w-6 h-6 text-gray-700" />
          <h1 className="text-lg font-semibold text-gray-800">KasKantor</h1>
        </div>
        <Link href="/profile">
          <UserCircle className="w-7 h-7 text-gray-600 hover:text-blue-600 transition-colors" />
        </Link>
      </header>

      <main className="p-4 space-y-6">
        {/* Balance Card Berbasis Database */}
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Saldo</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl text-gray-500 font-medium">Rp</span>
            <h2 className="text-4xl font-bold text-gray-900">
              {loading ? "..." : balance.toLocaleString('id-ID')}
            </h2>
          </div>
          <p className="text-sm font-medium text-green-600 flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4" /> Terbaru & Terupdate
          </p>
        </div>

        {/* Transaction History Terbaru (Limit 3) */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Transaksi Terakhir</h3>
            <Link href="/transactions" className="text-blue-600 font-semibold text-sm hover:underline">Lihat Semua</Link>
          </div>
          <div className="space-y-4">
            {loading ? (
               <p className="text-sm text-gray-500 text-center py-4">Memuat data...</p>
            ) : transactions.length === 0 ? (
               <p className="text-sm text-gray-500 text-center py-4">Belum ada transaksi.</p>
            ) : (
              transactions.slice(0, 3).map((trx) => (
                <div key={trx.id} className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center bg-white">
                      {trx.type === 'INCOME' ? <Briefcase className="w-5 h-5 text-blue-600" /> : <Store className="w-5 h-5 text-gray-700" />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{trx.category || 'Transaksi'}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(trx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} · Oleh {trx.user?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${trx.type === 'INCOME' ? 'text-blue-600' : 'text-gray-900'}`}>
                      {trx.type === 'INCOME' ? '+' : '-'}Rp {trx.amount.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 w-full max-w-md left-1/2 -translate-x-1/2 flex justify-end px-4 pointer-events-none z-30">
        <div className="relative pointer-events-auto">
          {isFabOpen && (
            <div className="absolute bottom-16 right-0 bg-white border border-gray-200 shadow-xl rounded-xl p-2 w-48 z-10 flex flex-col overflow-hidden">
              <Link href="/add-expense" className="flex items-center gap-3 p-3 hover:bg-gray-50 text-gray-800 font-medium border-b border-gray-100 transition-colors">
                <Minus className="w-5 h-5 bg-red-100 text-red-600 rounded-full p-0.5" /> Catat Pengeluaran
              </Link>
              <Link href="/add-income" className="flex items-center gap-3 p-3 hover:bg-gray-50 text-gray-800 font-medium transition-colors">
                <Plus className="w-5 h-5 bg-green-100 text-green-600 rounded-full p-0.5" /> Catat Pemasukan
              </Link>
            </div>
          )}
          <button 
            onClick={() => setIsFabOpen(!isFabOpen)}
            className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all"
          >
            <Plus className={`w-8 h-8 transition-transform duration-200 ${isFabOpen ? 'rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 flex justify-around z-20 left-1/2 -translate-x-1/2 pb-safe">
        <div className="flex flex-col items-center p-3 text-blue-600 w-full border-t-2 border-blue-600 bg-blue-50/30">
          <Wallet className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">Beranda</span>
        </div>
        <Link href="/transactions" className="flex flex-col items-center p-3 text-gray-400 w-full hover:text-gray-900 transition-colors">
          <FileText className="w-6 h-6" />
          <span className="text-[10px] font-medium mt-1">Transaksi</span>
        </Link>
      </nav>
    </div>
  );
}