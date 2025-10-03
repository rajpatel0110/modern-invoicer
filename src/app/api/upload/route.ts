// src/app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file found.' }, { status: 400 });
    }

    // --- Basic File Validation ---
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        return NextResponse.json({ success: false, error: 'File is too large (max 5MB).' }, { status: 400 });
    }
    if (!['image/jpeg', 'image/png', 'image/svg+xml'].includes(file.type)) {
        return NextResponse.json({ success: false, error: 'Invalid file type (only JPEG, PNG, SVG allowed).' }, { status: 400 });
    }
    
    // --- Vercel Deployment Advisory ---
    // The following code saves files to the local filesystem.
    // This will NOT work in a serverless environment like Vercel, as the filesystem is ephemeral.
    // For production, you MUST replace this with a cloud storage solution like Vercel Blob, AWS S3, or Cloudinary.

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename to avoid overwrites
    const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const publicPath = path.join(process.cwd(), 'public', 'uploads');
    const filePath = path.join(publicPath, filename);

    // This line writes the file to a temporary local directory that will be erased on Vercel.
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Something went wrong.' }, { status: 500 });
  }
}