"use client";

import { useState } from "react";
import CameraFeed from "@/components/CameraFeed";
import ImagePreview from "@/components/ImagePreview";
import PersonForm from "@/components/PersonForm";
import Link from "next/link";
import { Search } from "lucide-react";

export default function Home() {
  const [faceImage, setFaceImage] = useState<string | undefined>();
  const [thumbImage, setThumbImage] = useState<string | undefined>();

  const handleCapture = (img: string, type: "face" | "thumb") => {
    if (type === "face") setFaceImage(img);
    else setThumbImage(img);
  };

  return (
    <main className="flex flex-col md:flex-row gap-4 p-4 h-screen relative">
      <div className="flex-1">
        <CameraFeed onCapture={handleCapture} />
      </div>
      <div className="flex-1">
        <ImagePreview faceImage={faceImage} thumbImage={thumbImage} />
      </div>
      <div className="flex-1">
        <PersonForm faceImage={faceImage} thumbImage={thumbImage} />
      </div>
      {/* Floating action button for search navigation */}
      <Link href="/search">
        <div
          className="fixed bottom-8 right-8 z-50 bg-primary text-white rounded-full shadow-lg p-4 hover:bg-primary/90 transition flex items-center justify-center group"
          title="Go to Search"
        >
          <Search className="w-7 h-7" />
          <span className="sr-only">Go to Search</span>
          <span className="absolute opacity-0 group-hover:opacity-100 bg-black text-white text-xs rounded px-2 py-1 left-[-110px] top-1/2 -translate-y-1/2 transition-opacity">Go to Search</span>
        </div>
      </Link>
    </main>
  );
}
