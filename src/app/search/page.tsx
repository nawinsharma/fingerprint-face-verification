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
import { Loader2, ArrowLeft } from "lucide-react";

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
    <main className="min-h-screen p-8 relative bg-[radial-gradient(ellipse_at_top,var(--primary)/0.1,transparent_50%)]">
      <div className="absolute top-4 right-8 z-10">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <Button variant="outline" className="glass group-hover:scale-105 transition-all">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
      {loading && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass rounded-xl p-8 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin w-16 h-16 text-primary" />
            <p className="text-white font-medium">Searching...</p>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
        <div className="glass rounded-2xl p-8 transition-all hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">
              Search by Face or Thumb
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex justify-end">
              <Select
                value={searchType}
                onValueChange={(v) => setSearchType(v as "face" | "thumb")}
              >
                <SelectTrigger className="w-32 glass">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="face">Face</SelectItem>
                  <SelectItem value="thumb">Thumb</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full aspect-video glass rounded-xl flex items-center justify-center relative overflow-hidden">
              {isCameraOn ? (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                  videoConstraints={{ facingMode: "user" }}
                />
              ) : searchImage ? (
                <Image
                  src={searchImage}
                  alt="Search Preview"
                  width={320}
                  height={180}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-muted-foreground">
                  Camera feed or uploaded image will appear here
                </span>
              )}
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1 glass hover:scale-105"
                onClick={() => setIsCameraOn((on) => !on)}
                disabled={!!searchImage}
              >
                {isCameraOn ? "Stop Camera" : "Start Camera"}
              </Button>
              <Button
                className="flex-1 hover:scale-105"
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
              className="glass"
            />
            <Button
              className="w-full font-semibold text-lg hover:scale-105"
              onClick={handleSearch}
              disabled={!searchImage || loading}
            >
              {loading ? "Searching..." : "Search"}
            </Button>
            {!isCameraOn && searchImage && (
              <Button
                variant="secondary"
                className="w-full glass hover:scale-105"
                onClick={() => {
                  setIsCameraOn(true);
                  setSearchImage(undefined);
                }}
              >
                Retake
              </Button>
            )}
          </CardContent>
        </div>
        <div className="h-full flex items-center justify-center">
          {result && (
            <Card className="w-full glass transition-all hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-primary">
                  Search Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                {result.match ? (
                  <div className="space-y-4">
                    <div className="text-xl font-semibold text-primary">
                      Match Found!
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium">
                        Name: {result.user.first_name} {result.user.last_name}
                      </p>
                      <p className="font-medium">
                        Address: {result.user.address}
                      </p>
                      <p className="font-medium">
                        Additional Info: {result.user.additional_info}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium mb-2">
                        {searchType === "face" ? "Face" : "Thumb"} Image:
                      </p>
                      <div className="glass rounded-lg overflow-hidden">
                        <Image
                          src={
                            searchType === "face"
                              ? result.user.face_image
                              : result.user.thumb_image
                          }
                          alt="Matched"
                          width={128}
                          height={80}
                          className="w-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-destructive font-semibold text-lg">
                    No match found.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}