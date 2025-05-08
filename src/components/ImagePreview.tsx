"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

type CaptureType = "face" | "thumb";

interface ImagePreviewProps {
  faceImage?: string;
  thumbImage?: string;
}

export default function ImagePreview({ faceImage, thumbImage }: ImagePreviewProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Image Preview</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <span className="font-semibold">Face Image</span>
          <div className="w-64 h-40 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            {faceImage ? (
              <Image
                src={faceImage}
                alt="Face Preview"
                width={256}
                height={160}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-muted-foreground">Face Image Preview</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="font-semibold">Thumb Image</span>
          <div className="w-64 h-40 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            {thumbImage ? (
              <Image
                src={thumbImage}
                alt="Thumb Preview"
                width={256}
                height={160}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-muted-foreground">Thumb Image Preview</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
