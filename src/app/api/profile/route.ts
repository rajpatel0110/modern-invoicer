import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserId } from '@/lib/auth';

// GET the current user's profile
export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        email: true,
        companyName: true,
        companyLogoUrl: true,
        companyAddress: true,
        contactPhone: true,
        contactWebsite: true,
        taxPanNumber: true,
        taxGstin: true,
        paymentDetails: true,
        itemTableHeaders: true, // Select the new field
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


// PUT (update) the current user's profile
export async function PUT(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Ensure paymentDetails is stored as a string if provided
    if (data.paymentDetails && typeof data.paymentDetails !== 'string') {
      data.paymentDetails = JSON.stringify(data.paymentDetails);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        companyName: data.companyName,
        companyLogoUrl: data.companyLogoUrl,
        companyAddress: data.companyAddress,
        contactPhone: data.contactPhone,
        contactWebsite: data.contactWebsite,
        taxPanNumber: data.taxPanNumber,
        taxGstin: data.taxGstin,
        paymentDetails: data.paymentDetails,
        email: data.email,
        itemTableHeaders: data.itemTableHeaders, // Update the new field
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Failed to update profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
