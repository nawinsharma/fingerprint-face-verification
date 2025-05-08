"use client";

import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";

type CaptureType = "face" | "thumb";

interface CameraFeedProps {
  onCapture: (imgSrc: string, type: CaptureType) => void;
}

export default function CameraFeed({ onCapture }: CameraFeedProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [captureType, setCaptureType] = useState<CaptureType>("thumb");
  const [error, setError] = useState<string | null>(null);

  const handleCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc, captureType);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onCapture(reader.result, captureType);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Camera Feed
          <Select value={captureType} onValueChange={v => setCaptureType(v as CaptureType)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="face">Face Capture</SelectItem>
              <SelectItem value="thumb">Thumb Capture</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center relative">
          {isCameraOn ? (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover rounded-lg"
              videoConstraints={{ facingMode: "user" }}
            />
          ) : (
            <span className="text-muted-foreground">Camera feed will appear here</span>
          )}
        </div>
        {error && <div className="text-red-500">{error}</div>}
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setIsCameraOn((on) => !on)}
          >
            {isCameraOn ? "Stop Camera" : "Start Camera"}
          </Button>
          <Button
            className="flex-1"
            onClick={handleCapture}
            disabled={!isCameraOn}
          >
            Capture
          </Button>
        </div>
        <div className="flex items-center gap-2 w-full">
          <label className="flex-1 flex items-center justify-center cursor-pointer border border-dashed border-muted rounded-lg p-2 hover:bg-muted transition">
            <Upload className="mr-2" size={18} />
            <span>Upload Image</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
