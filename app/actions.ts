"use server";

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Simulasi mengambil User yang sedang Login (Bisa diganti NextAuth nantinya)
async function getCurrentUser() {
  let user = await prisma.user.findFirst();
  if (!user) {
    // Jika database kosong, buat user dummy
    user = await prisma.user.create({
      data: { name: 'Budi (Finance)' }
    });
  }
  return user;
}

export async function saveTransaction(data: {
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  date: string;
  note: string;
  isReimburse?: boolean;
}) {
  const user = await getCurrentUser();

  await prisma.transaction.create({
    data: {
      amount: data.amount,
      type: data.type,
      category: data.category,
      date: new Date(data.date),
      note: data.note,
      isReimburse: data.isReimburse || false,
      userId: user.id,
    }
  });

  // Refresh data di halaman beranda dan transaksi
  revalidatePath('/');
  revalidatePath('/transactions');
  return { success: true };
}

export async function getAllTransactions() {
  return await prisma.transaction.findMany({
    orderBy: { date: 'desc' },
    include: {
      user: true // Mengambil nama pengguna yang menginput
    }
  });
}