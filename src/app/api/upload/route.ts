// src/app/api/upload/route.ts
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const form = await request.formData();
  const file = form.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  try {
    // The `put` function uploads the file to your Vercel Blob store.
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // The `blob.url` is the public URL of the uploaded file.
    // We return this in the expected format for the frontend.
    return NextResponse.json({ success: true, url: blob.url });

  } catch (error) {
    console.error('Upload error:', error);
    // Provide a more specific error message if possible
    const errorMessage = error instanceof Error ? error.message : 'Something went wrong during upload.';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}