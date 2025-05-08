"use server";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function saveUser({
  firstName,
  lastName,
  address,
  additionalInfo,
  faceImage,
  thumbImage,
}: {
  firstName: string;
  lastName: string;
  address: string;
  additionalInfo: string;
  faceImage?: string;
  thumbImage?: string;
}) {
  const { data, error } = await supabase.from("users").insert([
    {
      first_name: firstName,
      last_name: lastName,
      address,
      additional_info: additionalInfo,
      face_image: faceImage,
      thumb_image: thumbImage,
    },
  ]);
  if (error) throw error;
  return data;
}
