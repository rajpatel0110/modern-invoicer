// src/app/(app)/dashboard/page.tsx
import { getUserId } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import type { Client, Invoice } from '@prisma/client';

type LineItem = { description: string; quantity: number; rate: number };

const calculateTotal = (invoice: { lineItems: string; discount?: number | null; taxRate?: number | null; previousDues?: number | null }): number => {
    let lineItems: LineItem[];
    try {
        lineItems = JSON.parse(invoice.lineItems || '[]');
    } catch (e) {
        lineItems = [];
    }
    
    const subtotal = lineItems.reduce((acc, item) => acc + (item.quantity || 0) * (item.rate || 0), 0);
    const discountRate = invoice.discount || 0;
    const taxRate = invoice.taxRate || 0;

    const discountAmount = subtotal * (discountRate / 100);
    const subtotalAfterDiscount = subtotal - discountAmount;
    
    const taxAmount = subtotalAfterDiscount * (taxRate / 100);
    
    return subtotalAfterDiscount + taxAmount + (invoice.previousDues || 0);
};

async function getDashboardData(userId: number) {
    const [clients, rawInvoices] = await Promise.all([
        prisma.client.findMany({ where: { userId } }),
        prisma.invoice.findMany({
            where: { client: { userId } },
            include: { client: true },
        }),
    ]);

    const invoices = rawInvoices.map(inv => ({
        ...inv,
        lineItems: JSON.parse(inv.lineItems || '[]') as LineItem[],
        totalAmount: calculateTotal(inv),
    }));

    let totalPendingAmount = 0;
    let totalReceivedAmount = 0;
    let totalOverdueAmount = 0;
    const unpaidClients = new Set<number>();

    const now = new Date();

    for (const invoice of invoices) {
      const statusUpper = invoice.status.toUpperCase();
      
      if (statusUpper === 'PAID') {
        totalReceivedAmount += invoice.totalAmount;
      } else if (['SENT', 'UNPAID', 'OVERDUE'].includes(statusUpper)) {
        totalPendingAmount += invoice.totalAmount;
        unpaidClients.add(invoice.clientId);

        if (invoice.dueDate && new Date(invoice.dueDate) < now) {
            totalOverdueAmount += invoice.totalAmount;
        }
      }
    }

    const metrics = {
      totalPendingAmount,
      totalReceivedAmount,
      totalOverdueAmount,
      unpaidClientCount: unpaidClients.size,
    };

    return { clients, invoices, metrics };
}

export default async function DashboardPage() {
  const userId = await getUserId();

  if (!userId) {
    redirect('/login');
  }

  const { clients, invoices, metrics } = await getDashboardData(userId);

  return <DashboardClient metrics={metrics} clients={clients} invoices={invoices} />;
}