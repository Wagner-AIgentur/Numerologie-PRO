/**
 * Creates the 'deliverables' storage bucket in Supabase.
 * Run: node scripts/create-storage-bucket.mjs
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  console.error('Make sure your .env.local file is loaded or set these variables in your shell.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('Creating deliverables bucket...');

  // 1. Create the bucket (public so getPublicUrl works for downloads)
  const { data, error } = await supabase.storage.createBucket('deliverables', {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10 MB max
    allowedMimeTypes: ['application/pdf'],
  });

  if (error) {
    if (error.message?.includes('already exists')) {
      console.log('Bucket "deliverables" already exists — skipping creation.');
    } else {
      console.error('Error creating bucket:', error);
      process.exit(1);
    }
  } else {
    console.log('Bucket created:', data);
  }

  // 2. Verify bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  const found = buckets?.find((b) => b.name === 'deliverables');
  if (found) {
    console.log(`\nBucket verified: "${found.name}" (public: ${found.public})`);
  } else {
    console.error('Bucket NOT found after creation!');
    process.exit(1);
  }

  // 3. Test upload
  const testContent = Buffer.from('test PDF content');
  const { error: uploadErr } = await supabase.storage
    .from('deliverables')
    .upload('_test/test.pdf', testContent, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (uploadErr) {
    console.error('Test upload failed:', uploadErr);
  } else {
    console.log('Test upload successful!');
    // Clean up test file
    await supabase.storage.from('deliverables').remove(['_test/test.pdf']);
    console.log('Test file cleaned up.');
  }

  console.log('\nDone! PDF downloads should now work in the Kundenportal.');
}

main();
