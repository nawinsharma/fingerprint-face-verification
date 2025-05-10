import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function imageHash(base64: string) {
  const buffer = Buffer.from(base64.split(",")[1], "base64");
  const resized = await sharp(buffer).resize(8, 8).grayscale().raw().toBuffer();
  // Simple average hash: each pixel > mean is 1, else 0
  const mean = resized.reduce((a, b) => a + b, 0) / resized.length;
  let hash = "";
  for (const pixel of resized) {
    hash += pixel > mean ? "1" : "0";
  }
  // Pad to 64 bits if needed
  return hash.padStart(64, "0");
}

export async function POST(req: NextRequest) {
  const { image, type } = await req.json();
  if (!image || !type) return NextResponse.json({ match: false });

  const searchHash = await imageHash(image);
  console.log('Search hash:', searchHash);
  
  const hashColumn = type === "face" ? "face_hash" : "thumb_hash";
  const bucketColumn = type === "face" ? "face_hash_bucket" : "thumb_hash_bucket";

  // Get the bucket for the search hash
  const { data: bucketData, error: bucketError } = await supabase.rpc("get_hash_bucket", {
    hash: searchHash
  });

  if (bucketError) {
    console.error('Error getting bucket:', bucketError);
    return NextResponse.json({ match: false });
  }

  const searchBucket = bucketData;
  console.log('Search bucket:', searchBucket);

  // Search in the same bucket and neighboring buckets
  const bucketRange = 1; // Search in current bucket and adjacent buckets
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .not(hashColumn, "is", null)
    .gte(bucketColumn, searchBucket - bucketRange)
    .lte(bucketColumn, searchBucket + bucketRange);

  console.log('Found users in buckets:', users?.length);

  if (error) {
    console.error('Database error:', error);
    return NextResponse.json({ match: false });
  }

  if (!users || users.length === 0) {
    console.log('No users found in matching buckets');
    return NextResponse.json({ match: false });
  }

  // Calculate distances for users in matching buckets
  let bestUser = null;
  let bestDistance = Infinity;
  const threshold = 10;

  for (const user of users) {
    const userHash = user[hashColumn];
    if (!userHash) continue;

    const { data: distanceData, error: distanceError } = await supabase.rpc("hamming_distance", {
      hash1: searchHash,
      hash2: userHash,
    });

    if (distanceError) {
      console.error('Distance calculation error:', distanceError);
      continue;
    }

    const distance = parseInt(distanceData);
    console.log('Distance for user:', user.first_name, distance);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestUser = user;
    }
  }

  console.log('Best match:', bestUser?.first_name, 'Distance:', bestDistance);

  if (bestUser && bestDistance < threshold) {
    return NextResponse.json({ match: true, user: bestUser, distance: bestDistance });
  } else {
    return NextResponse.json({ match: false });
  }
}
