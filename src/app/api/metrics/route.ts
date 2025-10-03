// src/app/api/metrics/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserId } from '@/lib/auth';

// Helper function to calculate the total amount of a single invoice.
// This logic is shared with front-end pages to maintain consistency.
const calculateInvoiceTotal = (invoice: { lineItems: string; discount?: number | null; taxRate?: number | null; previousDues?: number | null }): number => {
  let lineItems;
  try {
    lineItems = JSON.parse(invoice.lineItems || '[]');
  } catch (e) {
    console.error("Error parsing lineItems for metrics calculation:", e);
    lineItems = [];
  }

  const subtotal = lineItems.reduce((acc: number, item: { quantity: number; rate: number }) => {
    return acc + (item.quantity || 0) * (item.rate || 0);
  }, 0);

  // Assuming discount and taxRate are percentages (0-100)
  const discountRate = invoice.discount || 0; 
  const taxRate = invoice.taxRate || 0;

  const discountAmount = subtotal * (discountRate / 100);
  const subtotalAfterDiscount = subtotal - discountAmount;
  
  const taxAmount = subtotalAfterDiscount * (taxRate / 100);
  const total = subtotalAfterDiscount + taxAmount + (invoice.previousDues || 0);

  return total;
};

// GET aggregated dashboard metrics
export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all invoices to perform aggregation server-side
    const userInvoices = await prisma.invoice.findMany({
      where: {
        client: {
          userId: userId,
        },
      },
      select: {
        id: true,
        status: true,
        lineItems: true,
        discount: true,
        taxRate: true,
        previousDues: true,
        client: {
          select: {
            id: true // Needed to track unpaid clients
          }
        }
      },
    });

    let totalPendingAmount = 0;
    let totalReceivedAmount = 0;
    const unpaidClients = new Set<number>();
    
    for (const invoice of userInvoices) {
      const total = calculateInvoiceTotal(invoice);
      
      const statusUpper = invoice.status.toUpperCase();
      
      // Calculate Pending/Received amounts based on status
      if (statusUpper === 'PAID') {
        totalReceivedAmount += total;
      } else if (['SENT', 'UNPAID', 'OVERDUE'].includes(statusUpper)) {
        totalPendingAmount += total;
        unpaidClients.add(invoice.client.id);
      }
      // DRAFT, CANCELLED, UNCOLLECTIBLE are not included in financial metrics
    }

    const metrics = {
      totalPendingAmount: totalPendingAmount,
      totalReceivedAmount: totalReceivedAmount,
      unpaidClientCount: unpaidClients.size,
    };

    return NextResponse.json(metrics);
    
  } catch (error) {
    console.error("Failed to fetch dashboard metrics:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}