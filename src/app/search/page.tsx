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
import { Camera, Fingerprint, Home, Loader2, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

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
    toast.info("Searching database for matches...", {
      description: "This may take a few moments."
    });
    const res = await fetch("/api/search", {
      method: "POST",
      body: JSON.stringify({ image: searchImage, type: searchType }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
    if (data.match) {
      toast.success("Match found!", {
        description: `Found a match with ${data.user.first_name} ${data.user.last_name}`
      });
    } else {
      toast.error("No match found", {
        description: "The biometric data does not match any records in our system."
      });
    }
  };

  return (
    <main className="min-h-screen">
      <div className="container mx-auto p-6 mt-12 min-h-[calc(100vh-2rem)] flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-violet-200 bg-clip-text text-transparent mb-3">
            Biometric Search
          </h1>
          <p className="text-violet-300/80 text-lg">
            Search our database using face or fingerprint biometrics
          </p>
        </motion.div>
        
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="glass overflow-hidden border border-violet-700/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="border-b p-4 border-violet-700/20 bg-gradient-to-r from-violet-900/80 to-violet-800/80 backdrop-blur-sm">
                <CardTitle className="flex items-center gap-2 text-violet-100">
                  <Camera className="w-5 h-5" />
                  <span>Capture Biometric</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-4"
                >
                  <Select value={searchType} onValueChange={(v) => setSearchType(v as "face" | "thumb")}>
                    <SelectTrigger className="w-32 input-animated bg-black/20 hover:bg-black/30 transition-colors">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="face">Face</SelectItem>
                      <SelectItem value="thumb">Thumb</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="w-full aspect-video bg-gradient-to-br from-violet-900/40 to-violet-800/40 rounded-xl flex items-center justify-center relative overflow-hidden backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl border border-violet-700/20"
                >
                  {isCameraOn ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full h-full"
                    >
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full h-full object-cover rounded-xl"
                        videoConstraints={{ facingMode: "user" }}
                      />
                    </motion.div>
                  ) : searchImage ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative w-full h-full group"
                    >
                      <Image
                        src={searchImage}
                        alt="Search Preview"
                        width={320}
                        height={180}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-white/90 transform group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-violet-300 flex flex-col items-center"
                    >
                      <Camera className="w-16 h-16 mb-3 opacity-70 transform hover:scale-110 transition-transform duration-300" />
                      <span className="text-sm opacity-70">Camera feed or uploaded image will appear here</span>
                    </motion.div>
                  )}
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="grid grid-cols-2 gap-3"
                >
                  <Button
                    variant={isCameraOn ? "destructive" : "outline"}
                    className="transition-all duration-300 hover:scale-105 active:scale-100 hover:shadow-lg"
                    onClick={() => setIsCameraOn((on) => !on)}
                    disabled={!!searchImage}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {isCameraOn ? "Stop Camera" : "Start Camera"}
                  </Button>
                  <Button
                    className="transition-all duration-300 hover:scale-105 active:scale-100 bg-violet-600 hover:bg-violet-700 shadow-lg hover:shadow-xl"
                    onClick={handleCapture}
                    disabled={!isCameraOn}
                  >
                    Capture
                  </Button>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="relative group"
                >
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={!!searchImage}
                    className="input-animated file:bg-violet-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-md file:hover:bg-violet-700 file:transition-colors file:duration-200 hover:shadow-lg transition-shadow"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button
                    className="w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-100 disabled:hover:scale-100 disabled:opacity-70"
                    onClick={handleSearch}
                    disabled={!searchImage || loading}
                  >
                    {loading ? (
                      <motion.div 
                        className="flex items-center justify-center"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="w-5 h-5 mr-2" />
                        Searching...
                      </motion.div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Fingerprint className="w-5 h-5 mr-2" />
                        Search
                      </div>
                    )}
                  </Button>
                </motion.div>

                {!isCameraOn && searchImage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Button
                      variant="secondary"
                      className="w-full transition-all duration-300 hover:scale-105 active:scale-100 hover:shadow-lg"
                      onClick={() => {
                        setIsCameraOn(true);
                        setSearchImage(undefined);
                      }}
                    >
                      Retake
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="glass overflow-hidden border border-violet-700/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="border-b p-4 border-violet-700/20 bg-gradient-to-r from-violet-900/80 to-violet-800/80 backdrop-blur-sm">
                <CardTitle className="flex items-center gap-2 text-violet-100">
                  <Fingerprint className="w-5 h-5" />
                  <span>Search Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {result ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-violet-900/50 to-violet-800/50 border border-violet-700/20 shadow-lg"
                    >
                      <span className="font-semibold text-violet-100">Match Found:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${result.match ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}>
                        {result.match ? "Yes" : "No"}
                      </span>
                    </motion.div>
                    
                    {result.match && (
                      <>
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                          className="grid gap-4 p-4 rounded-xl bg-gradient-to-r from-violet-900/30 to-violet-800/30 border border-violet-700/20 shadow-lg"
                        >
                          <div className="grid gap-2">
                            <span className="font-semibold text-violet-100">Name:</span>
                            <span className="text-violet-300 bg-black/20 p-2 rounded-lg">{result.user.first_name} {result.user.last_name}</span>
                          </div>
                          <div className="grid gap-2">
                            <span className="font-semibold text-violet-100">Address:</span>
                            <span className="text-violet-300 bg-black/20 p-2 rounded-lg">{result.user.address}</span>
                          </div>
                          {result.user.additional_info && (
                            <div className="grid gap-2">
                              <span className="font-semibold text-violet-100">Additional Info:</span>
                              <span className="text-violet-300 bg-black/20 p-2 rounded-lg">{result.user.additional_info}</span>
                            </div>
                          )}
                        </motion.div>

                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          {result.user.face_image && (
                            <div className="space-y-2">
                              <span className="font-semibold text-violet-100">Face Image:</span>
                              <div className="aspect-video bg-gradient-to-br from-violet-900/30 to-violet-800/30 rounded-xl overflow-hidden group shadow-lg">
                                <Image
                                  src={result.user.face_image}
                                  alt="Face"
                                  width={300}
                                  height={200}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              </div>
                            </div>
                          )}
                          {result.user.thumb_image && (
                            <div className="space-y-2">
                              <span className="font-semibold text-violet-100">Thumb Image:</span>
                              <div className="aspect-video bg-gradient-to-br from-violet-900/30 to-violet-800/30 rounded-xl overflow-hidden group shadow-lg">
                                <Image
                                  src={result.user.thumb_image}
                                  alt="Thumb"
                                  width={300}
                                  height={200}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                              </div>
                            </div>
                          )}
                        </motion.div>
                      </>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-violet-300 py-12"
                  >
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      <Fingerprint className="w-20 h-20 mx-auto mb-4 opacity-50" />
                    </motion.div>
                    <h3 className="text-xl font-medium mb-2 bg-gradient-to-r from-violet-400 to-violet-200 bg-clip-text text-transparent">
                      Ready to Search
                    </h3>
                    <p className="text-lg opacity-70">Capture or upload a biometric to start searching</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Home navigation button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Link 
            href="/" 
            className="fixed bottom-6 right-6 bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-700 hover:to-violet-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:transform active:translate-y-0"
          >
            <Home className="w-6 h-6" />
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
