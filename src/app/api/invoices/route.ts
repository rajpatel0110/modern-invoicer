import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserId } from '@/lib/auth';

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();

    // FIX: Convert date strings to ISO-8601 format for Prisma.
    const invoiceDate = new Date(data.invoiceDate);
    // Handle optional dueDate, ensuring it's either a Date object or null.
    const dueDate = data.dueDate ? new Date(data.dueDate) : null;

    // Generate Invoice Number
    const year = new Date().getFullYear();
    const count = await prisma.invoice.count({
      where: {
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        },
        client: {
          userId: userId,
        },
      },
    });

    const invoiceNumber = `INV-${year}-${(count + 1).toString().padStart(4, '0')}`;

    const newInvoice = await prisma.invoice.create({
      data: {
        ...data,
        invoiceDate, // Use the converted Date object
        dueDate,     // Use the converted or null dueDate
        invoiceNumber,
        lineItems: JSON.stringify(data.lineItems),
      },
    });

    return NextResponse.json(newInvoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}

export async function GET() {
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        client: {
          userId: userId,
        },
      },
      include: {
        client: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Safely parse lineItems for the response
    const parsedInvoices = invoices.map((invoice: { lineItems: string; }) => ({
        ...invoice,
        lineItems: JSON.parse(invoice.lineItems as string || '[]')
    }));

    return NextResponse.json(parsedInvoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}