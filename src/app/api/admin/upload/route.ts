import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/getSession';
import { canManageProjects } from '@/lib/permissions';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// ============================================================
// POST /api/admin/upload
// Secure project image upload to Supabase Storage ('project-images')
// Requires authenticated ADMIN role.
// Self-heals: ensures bucket exists with public access.
// ============================================================
export async function POST(request: NextRequest) {
  try {
    // ── 1. Authentication & Permission ─────────────────────────
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Admin login required.' }, { status: 401 });
    }
    if (!canManageProjects(session.admin.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions to upload project assets.' }, { status: 403 });
    }

    // ── 2. Read Multipart Form Data ───────────────────────────
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Please select an image file to upload.' }, { status: 400 });
    }

    // ── 3. Validate File Type ─────────────────────────────────
    const normalizedType = file.type.toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(normalizedType)) {
      return NextResponse.json(
        { error: 'Invalid file format. Please upload a JPG, PNG, or WEBP image.' },
        { status: 400 }
      );
    }

    // ── 4. Validate File Size ─────────────────────────────────
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'Image must be smaller than 5 MB.' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    const BUCKET_NAME = 'project-images';

    // ── 5. Ensure Bucket Exists (Auto-heals missing bucket) ────
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME);

      if (!bucketExists) {
        console.warn(`[admin/upload] Bucket "${BUCKET_NAME}" not found. Creating public bucket...`);
        const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
          public: true,
          fileSizeLimit: MAX_SIZE_BYTES,
          allowedMimeTypes: ALLOWED_MIME_TYPES,
        });
        if (createError) {
          console.error('[admin/upload] Error creating bucket:', createError.message);
        }
      }
    } catch (bucketErr) {
      console.warn('[admin/upload] Bucket existence check warning:', bucketErr);
    }

    // ── 6. Generate Unique File Name & Key ─────────────────────
    const rawExt = file.name.split('.').pop()?.toLowerCase() || 'webp';
    const ext = ['jpeg', 'jpg', 'png', 'webp'].includes(rawExt) ? rawExt : 'webp';
    const timestamp = Date.now();
    const randomHex = Math.random().toString(36).slice(2, 8);
    const fileName = `${timestamp}-${randomHex}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // ── 7. Upload to Supabase Storage ──────────────────────────
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: normalizedType,
        upsert: false,
      });

    if (uploadError) {
      console.error('[admin/upload] Storage upload failed:', {
        message: uploadError.message,
        name: file.name,
        type: file.type,
        size: file.size,
      });

      return NextResponse.json(
        { error: `Storage error: ${uploadError.message}. Please check storage configuration.` },
        { status: 500 }
      );
    }

    // ── 8. Retrieve Public URL ─────────────────────────────────
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return NextResponse.json(
      {
        success: true,
        data: {
          url: publicUrl,
          fileName,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/upload] Unexpected exception:', errorMsg);
    return NextResponse.json({ error: 'Unable to upload the image. Please try again.' }, { status: 500 });
  }
}
