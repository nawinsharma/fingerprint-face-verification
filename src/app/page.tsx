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
    <main className="min-h-screen p-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70 animate-float">
          Fingerprint Verification System
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass rounded-2xl p-6 transition-all hover:shadow-lg hover:scale-[1.02]">
            <CameraFeed onCapture={handleCapture} />
          </div>
          <div className="glass rounded-2xl p-6 transition-all hover:shadow-lg hover:scale-[1.02]">
            <ImagePreview faceImage={faceImage} thumbImage={thumbImage} />
          </div>
          <div className="glass rounded-2xl p-6 transition-all hover:shadow-lg hover:scale-[1.02]">
            <PersonForm faceImage={faceImage} thumbImage={thumbImage} />
          </div>
        </div>
      </div>
      <Link
        href="/search"
        className="fixed bottom-8 right-8 z-50 glass text-primary rounded-full shadow-lg p-4 hover:scale-110 transition-all flex items-center justify-center group"
        title="Go to Search"
      >
        <Search className="w-7 h-7" />
        <span className="sr-only">Go to Search</span>
        <span className="absolute opacity-0 group-hover:opacity-100 glass text-white text-sm rounded-lg px-3 py-2 left-[-110px] top-1/2 -translate-y-1/2 transition-all">
          Go to Search
        </span>
      </Link>
    </main>
  );
}