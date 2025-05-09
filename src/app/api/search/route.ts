import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { cacheImageHash, getCachedImageHash, cacheSearchResult, getCachedSearchResult } from "@/lib/redis";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function hammingDistance(a: string, b: string) {
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) dist++;
  }
  return dist;
}

async function imageHash(base64: string) {
  // Try to get hash from cache first
  const cachedHash = await getCachedImageHash(base64, "thumb");
  if (cachedHash) {
    return cachedHash;
  }

  // If not in cache, compute the hash
  const buffer = Buffer.from(base64.split(",")[1], "base64");
  const resized = await sharp(buffer).resize(8, 8).grayscale().raw().toBuffer();
  // Simple average hash: each pixel > mean is 1, else 0
  const mean = resized.reduce((a, b) => a + b, 0) / resized.length;
  let hash = "";
  for (const pixel of resized) {
    hash += pixel > mean ? "1" : "0";
  }

  // Cache the computed hash
  await cacheImageHash(base64, "thumb", hash);
  return hash;
}

export async function POST(req: NextRequest) {
  const { image, type } = await req.json();
  if (!image || !type) return NextResponse.json({ match: false });

  const searchHash = await imageHash(image);

  // Try to get result from cache
  const cachedResult = await getCachedSearchResult(searchHash, type);
  if (cachedResult) {
    return NextResponse.json(cachedResult);
  }

  // If not in cache, perform the search
  const { data: users } = await supabase.from("users").select("*");
  if (!users) return NextResponse.json({ match: false });

  let bestDistance = Infinity;
  let bestUser = null;

  for (const user of users) {
    const userImage = type === "face" ? user.face_image : user.thumb_image;
    if (!userImage) continue;
    
    // Try to get user's image hash from cache, or compute it
    const userHash = await imageHash(userImage);
    const dist = hammingDistance(searchHash, userHash);
    if (dist < bestDistance) {
      bestDistance = dist;
      bestUser = user;
    }
  }

  const threshold = 10; // Adjust as needed
  const result = {
    match: bestDistance < threshold,
    user: bestUser,
    distance: bestDistance
  };

  // Cache the search result
  await cacheSearchResult(searchHash, type, result);

  return NextResponse.json(result);
}
