import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

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
  const buffer = Buffer.from(base64.split(",")[1], "base64");
  const resized = await sharp(buffer).resize(8, 8).grayscale().raw().toBuffer();
  // Simple average hash: each pixel > mean is 1, else 0
  const mean = resized.reduce((a, b) => a + b, 0) / resized.length;
  let hash = "";
  for (const pixel of resized) {
    hash += pixel > mean ? "1" : "0";
  }
  return hash;
}

export async function POST(req: NextRequest) {
  const { image, type } = await req.json();
  if (!image || !type) return NextResponse.json({ match: false });

  const searchHash = await imageHash(image);

  // Fetch all users
  const { data: users } = await supabase.from("users").select("*");
  if (!users) return NextResponse.json({ match: false });

  let bestDistance = Infinity;
  let bestUser = null;

  for (const user of users) {
    const userImage = type === "face" ? user.face_image : user.thumb_image;
    if (!userImage) continue;
    const userHash = await imageHash(userImage);
    const dist = hammingDistance(searchHash, userHash);
    if (dist < bestDistance) {
      bestDistance = dist;
      bestUser = user;
    }
  }

  const threshold = 10; // Adjust as needed
  if (bestDistance < threshold) {
    return NextResponse.json({ match: true, user: bestUser, distance: bestDistance });
  } else {
    return NextResponse.json({ match: false });
  }
}
