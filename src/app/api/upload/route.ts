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
      // This is the fix: It ensures every uploaded file gets a unique name.
      addRandomSuffix: true,
    });

    // The `blob.url` is the public URL of the uploaded file.
    return NextResponse.json({ success: true, url: blob.url });

  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Something went wrong during upload.';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}