"use client";

import { useRef, useState } from "react";
import Webcam from "react-webcam";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function SearchPage() {
  const webcamRef = useRef<Webcam>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [searchImage, setSearchImage] = useState<string | undefined>();
  const [result, setResult] = useState<{
    match: boolean;
    user: {
      first_name: string;
      last_name: string;
      address: string;
      additional_info: string;
      face_image: string;
      thumb_image: string;
    };
    distance: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<"face" | "thumb">("thumb");

  const handleCapture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setSearchImage(imageSrc);
        setIsCameraOn(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") setSearchImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/search-thumb", {
      method: "POST",
      body: JSON.stringify({ image: searchImage, type: searchType }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <main className="flex flex-col md:flex-row gap-4 p-4 min-h-screen relative bg-gradient-to-br from-slate-100 to-slate-300">
      {/* Top bar with navigation */}
      <div className="absolute top-4 right-8 z-10">
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
      {/* Loading spinner overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <Loader2 className="animate-spin w-16 h-16 text-primary" />
        </div>
      )}
      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-xl shadow-xl border-2 border-primary/20 bg-white/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">
              Search by Face or Thumb
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex justify-end">
              <Select
                value={searchType}
                onValueChange={(v) => setSearchType(v as "face" | "thumb")}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="face">Face</SelectItem>
                  <SelectItem value="thumb">Thumb</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center relative border border-dashed border-primary/30">
              {isCameraOn ? (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover rounded-lg"
                  videoConstraints={{ facingMode: "user" }}
                />
              ) : searchImage ? (
                <Image
                  src={searchImage}
                  alt="Search Preview"
                  width={320}
                  height={180}
                  className="object-cover w-full h-full shadow-lg rounded-lg"
                />
              ) : (
                <span className="text-muted-foreground">
                  Camera feed or uploaded image will appear here
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsCameraOn((on) => !on)}
                disabled={!!searchImage}
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
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={!!searchImage}
            />
            <Button
              className="w-full font-semibold text-lg"
              onClick={handleSearch}
              disabled={!searchImage || loading}
            >
              {loading ? "Searching..." : "Search"}
            </Button>
            {!isCameraOn && searchImage && (
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setIsCameraOn(true);
                  setSearchImage(undefined);
                }}
              >
                Retake
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="flex-1 flex items-center justify-center">
        {result && (
          <Card className="w-full max-w-xl shadow-xl border-2 border-green-400/20 bg-white/80 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-green-700">
                Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.match ? (
                <div>
                  <div className="mb-2 font-semibold text-green-600 text-lg">
                    Match Found!
                  </div>
                  <div className="mb-1">
                    <b>Name:</b> {result.user.first_name}{" "}
                    {result.user.last_name}
                  </div>
                  <div className="mb-1">
                    <b>Address:</b> {result.user.address}
                  </div>
                  <div className="mb-1">
                    <b>Additional Info:</b> {result.user.additional_info}
                  </div>
                  <div className="mt-2">
                    <b>{searchType === "face" ? "Face" : "Thumb"} Image:</b>
                    <Image
                      src={
                        searchType === "face"
                          ? result.user.face_image
                          : result.user.thumb_image
                      }
                      alt="Matched"
                      width={128}
                      height={80}
                      className="rounded border border-primary/30 mt-1"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-red-600 font-semibold text-lg">
                  No match found.
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
