// src/app/api/invoices/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserId } from '@/lib/auth';

/**
 * Checks if the invoice belongs to the currently authenticated user.
 */
async function checkInvoiceOwnership(invoiceId: number, userId: number) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { client: { select: { userId: true } } },
  });
  return invoice && invoice.client.userId === userId;
}

/**
 * Parses raw invoice data for a safe API response.
 */
function parseInvoiceForResponse(invoice: any) {
    if (!invoice) return null;
    return {
        ...invoice,
        lineItems: JSON.parse(invoice.lineItems || '[]'),
    };
}

/**
 * GET handler to fetch a single invoice by ID.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const invoiceId = parseInt(id, 10);
  if (isNaN(invoiceId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

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

    return NextResponse.json(parseInvoiceForResponse(invoice));
  } catch (error) {
    console.error('Failed to fetch invoice:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PUT handler to update an invoice by ID.
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const invoiceId = parseInt(id, 10);
  if (isNaN(invoiceId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  
  if (!(await checkInvoiceOwnership(invoiceId, userId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const data = await request.json();
    
    // FIX: Convert date strings to ISO-8601 format for Prisma.
    const invoiceDate = new Date(data.invoiceDate);
    // Handle optional dueDate, ensuring it's either a Date object or null.
    const dueDate = data.dueDate ? new Date(data.dueDate) : null;

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        ...data,
        invoiceDate, // Use the converted Date object
        dueDate,     // Use the converted or null dueDate
        lineItems: JSON.stringify(data.lineItems),
      },
    });
    return NextResponse.json(parseInvoiceForResponse(updatedInvoice));
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

/**
 * DELETE handler to remove an invoice by ID.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const invoiceId = parseInt(id, 10);
  if (isNaN(invoiceId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  if (!(await checkInvoiceOwnership(invoiceId, userId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await prisma.invoice.delete({
      where: { id: invoiceId },
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}