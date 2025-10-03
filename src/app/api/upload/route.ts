// src/app/api/upload/route.ts
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  // The 'file' field name must match what you send from the frontend
  const form = await request.formData();
  const file = form.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  try {
    // Upload the file to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // The frontend expects a response object with a `url` property.
    // The `blob.url` is the public URL of the uploaded file.
    return NextResponse.json({ success: true, url: blob.url });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Something went wrong during upload.' }, { status: 500 });
  }
}