"use client";

import { useState } from "react";
import CameraFeed from "@/components/CameraFeed";
import ImagePreview from "@/components/ImagePreview";
import PersonForm from "@/components/PersonForm";

export default function Home() {
  const [faceImage, setFaceImage] = useState<string | undefined>();
  const [thumbImage, setThumbImage] = useState<string | undefined>();

  const handleCapture = (img: string, type: "face" | "thumb") => {
    if (type === "face") setFaceImage(img);
    else setThumbImage(img);
  };

  return (
    <main className="flex flex-col md:flex-row gap-4 p-4 h-screen">
      <div className="flex-1">
        <CameraFeed onCapture={handleCapture} />
      </div>
      <div className="flex-1">
        <ImagePreview faceImage={faceImage} thumbImage={thumbImage} />
      </div>
      <div className="flex-1">
        <PersonForm faceImage={faceImage} thumbImage={thumbImage} />
      </div>
    </main>
  );
}
