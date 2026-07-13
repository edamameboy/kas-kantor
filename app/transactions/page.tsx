import Link from 'next/link';
import { getAllTransactions } from '@/app/actions';
import { Wallet, FileText, ArrowRight, Store, Briefcase } from 'lucide-react';

export default async function TransactionsPage() {
  // Mengambil data dari database secara real-time
  const transactions = await getAllTransactions();

  return (
    <div className="min-h-screen bg-white w-full max-w-md mx-auto relative shadow-sm pb-24">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-gray-100">
        <h1 className="text-lg font-bold text-gray-800">Semua Transaksi</h1>
      </header>

      <main className="p-4 space-y-4">
        {transactions.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">Belum ada transaksi tercatat.</p>
        ) : (
          transactions.map((trx) => (
            // Kita ubah div menjadi Link yang mengarah ke /transactions/[id]
            <Link 
              href={`/transactions/${trx.id}`} 
              key={trx.id} 
              className={`flex justify-between items-center border-b border-gray-100 pb-4 pt-2 px-2 -mx-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer ${trx.status === 'REJECTED' ? 'opacity-50' : ''}`}
            >
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center bg-white shadow-sm">
                  {trx.type === 'INCOME' ? <Briefcase className="w-5 h-5 text-blue-600" /> : <Store className="w-5 h-5 text-gray-700" />}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    {trx.category}
                    {trx.status === 'PENDING' && <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">MENUNGGU ACC</span>}
                    {trx.status === 'REJECTED' && <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">DITOLAK</span>}
                  </p>
                  <p className="text-xs text-gray-500">
                    {trx.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} · 
                    <span className="font-medium text-gray-700 ml-1">{trx.user.name}</span>
                  </p>
                  {trx.note && <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[150px]">{trx.note}</p>}
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${trx.type === 'INCOME' ? 'text-blue-600' : 'text-gray-900'} ${trx.status === 'REJECTED' ? 'line-through text-gray-400' : ''}`}>
                  {trx.type === 'INCOME' ? '+' : '-'}Rp {trx.amount.toLocaleString('id-ID')}
                </p>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 mt-1 inline-block rounded border ${
                  trx.type === 'INCOME' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}>
                  {trx.type}
                </span>
              </div>
            </Link>
          ))
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 flex justify-around z-20 left-1/2 -translate-x-1/2 pb-safe">
        <Link href="/" className="flex flex-col items-center p-3 text-gray-400 w-full hover:text-gray-900 transition-colors">
          <Wallet className="w-6 h-6" />
          <span className="text-[10px] font-medium mt-1">Beranda</span>
        </Link>
        <div className="flex flex-col items-center p-3 text-blue-600 w-full border-t-2 border-blue-600 bg-blue-50/30">
          <FileText className="w-6 h-6" />
          <span className="text-[10px] font-bold mt-1">Transaksi</span>
        </div>
      </nav>
    </div>
  );
}