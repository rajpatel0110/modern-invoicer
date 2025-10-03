// src/app/api/invoices/preview/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserId } from '@/lib/auth';

// Helper function to check ownership remains the same.
async function checkInvoiceOwnership(invoiceId: number, userId: number) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { client: { select: { userId: true } } },
  });
  return invoice && invoice.client.userId === userId;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const invoiceId = parseInt(id, 10);
  
  if (isNaN(invoiceId)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!(await checkInvoiceOwnership(invoiceId, userId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { client: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        companyName: true,
        companyAddress: true,
        companyLogoUrl: true,
        taxPanNumber: true,
        paymentDetails: true,
        email: true,
        contactPhone: true,
        itemTableHeaders: true, // Select the new field
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }
    
    const parsedInvoice = {
      ...invoice,
      lineItems: JSON.parse(invoice.lineItems || '[]'),
    };

    const parsedUser = {
        ...user,
        paymentDetails: JSON.parse(user.paymentDetails || '{}'),
    };

    return NextResponse.json({ invoice: parsedInvoice, user: parsedUser });

  } catch (error) {
    console.error('Failed to fetch preview data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
