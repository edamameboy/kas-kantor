"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  Wallet, UserCircle, TrendingUp, Store, 
  ArrowRight, Briefcase, Plus, 
  Minus, FileText 
} from 'lucide-react';

export default function Home() {
  const [isFabOpen, setIsFabOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white w-full max-w-md mx-auto relative shadow-sm pb-20">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Wallet className="w-6 h-6 text-gray-700" />
          <h1 className="text-lg font-semibold text-gray-800">KasKantor</h1>
        </div>
        <UserCircle className="w-6 h-6 text-gray-600" />
      </header>

      <main className="p-4 space-y-6">
        {/* Balance Card */}
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Saldo</p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl text-gray-500 font-medium">Rp</span>
            <h2 className="text-4xl font-bold text-gray-900">12.485.000</h2>
          </div>
          <p className="text-sm font-medium text-green-600 flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4" /> +2.4% dari bulan lalu
          </p>
        </div>

        {/* Monthly Usage Chart */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xl font-bold text-gray-900">Grafik Bulanan</h3>
            <div className="flex gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-green-600 rounded-sm"></div> Masuk</span>
              <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-gray-400 rounded-sm"></div> Keluar</span>
            </div>
          </div>
          <div className="h-40 border border-gray-100 p-4 rounded-lg flex items-end justify-between px-6 pb-8 relative">
            <div className="absolute bottom-6 left-0 right-0 border-t border-gray-200"></div>
            {/* Bars */}
            {[
              { m: 'Jul', inc: 70, exp: 40 },
              { m: 'Agu', inc: 60, exp: 65 },
              { m: 'Sep', inc: 90, exp: 45 },
              { m: 'Okt', inc: 85, exp: 55 }
            ].map((data) => (
              <div key={data.m} className="flex flex-col items-center z-10">
                <div className="flex items-end gap-1.5 h-32">
                  <div className="w-3.5 bg-green-600 rounded-t-sm" style={{ height: `${data.inc}%` }}></div>
                  <div className="w-3.5 bg-gray-400 rounded-t-sm" style={{ height: `${data.exp}%` }}></div>
                </div>
                <span className={`text-xs mt-3 ${data.m === 'Okt' ? 'font-bold text-black' : 'text-gray-500'}`}>{data.m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Riwayat Transaksi</h3>
            <button className="text-blue-600 font-semibold text-sm hover:underline">Lihat Semua</button>
          </div>
          <div className="space-y-4">
            {/* Item 1 */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center bg-white">
                  <Store className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Gramedia Subirman</p>
                  <p className="text-xs text-gray-500">24 Okt · ATK Kantor</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">-Rp 142.500</p>
                <span className="text-[10px] font-bold bg-green-100 text-green-800 px-1.5 py-0.5 mt-1 inline-block rounded border border-green-200">CASH</span>
              </div>
            </div>
            {/* Item 2 */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center bg-white">
                  <ArrowRight className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Transfer ke Vendor A</p>
                  <p className="text-xs text-gray-500">23 Okt · Jasa Servis AC</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">-Rp 500.000</p>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 mt-1 inline-block rounded border border-blue-200">TRANSFER</span>
              </div>
            </div>
            {/* Item 3 */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 bg-gray-50 -mx-4 px-4 py-2">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center bg-white">
                  <Briefcase className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Topup Kas Pusat</p>
                  <p className="text-xs text-gray-500">15 Okt · Dana Operasional</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">+Rp 3.200.000</p>
                <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 mt-1 inline-block rounded border border-blue-200">TRANSFER</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button & Menu - Responsif Centered */}
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

      {/* Bottom Navigation - Responsif Centered */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 flex justify-around z-20 left-1/2 -translate-x-1/2 pb-safe">
        <div className="flex flex-col items-center p-3 text-blue-600 w-full border-t-2 border-blue-600 bg-blue-50/30">
          <Wallet className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">Beranda</span>
        </div>
        <div className="flex flex-col items-center p-3 text-gray-400 w-full hover:text-gray-900 transition-colors cursor-pointer">
          <FileText className="w-6 h-6" />
          <span className="text-[10px] font-medium mt-1">Transaksi</span>
        </div>
      </nav>
    </div>
  );
}