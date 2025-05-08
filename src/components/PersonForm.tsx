"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveUser } from "@/app/actions/saveUser";
import { toast } from "sonner";

interface PersonFormProps {
  faceImage?: string;
  thumbImage?: string;
}

export default function PersonForm({ faceImage, thumbImage }: PersonFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [loading, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    startTransition(async () => {
      try {
        await saveUser({
          firstName,
          lastName,
          address,
          additionalInfo,
          faceImage,
          thumbImage,
        });
        setSuccess("Saved successfully!");
        setFirstName("");
        setLastName("");
        setAddress("");
        setAdditionalInfo("");
      } catch (err) {
        toast.error("Failed to save.");
        console.error(err);
        setError("Failed to save.");
      }
    });
  };

  const handleClear = () => {
    setFirstName("");
    setLastName("");
    setAddress("");
    setAdditionalInfo("");
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Person Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSave}>
          <Input
            placeholder="First Name"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
          />
          <Input
            placeholder="Last Name"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            required
          />
          <Textarea
            placeholder="Address"
            value={address}
            onChange={e => setAddress(e.target.value)}
            rows={2}
          />
          <Textarea
            placeholder="Additional Info"
            value={additionalInfo}
            onChange={e => setAdditionalInfo(e.target.value)}
            rows={2}
          />
          <div className="flex gap-2 mt-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button type="button" variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
          {success && <div className="text-green-600">{success}</div>}
          {error && <div className="text-red-600">{error}</div>}
        </form>
      </CardContent>
    </Card>
  );
}
