
"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/room/${roomId}/play`);
    }, 3000); // Simulate 3 seconds connection time

    return () => clearTimeout(timer);
  }, [roomId, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground">
      <Card className="w-full max-w-md shadow-xl rounded-lg text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Joining Room</CardTitle>
          <CardDescription>
            Attempting to connect to Room ID: <span className="font-semibold text-primary">{roomId}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center items-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
          <p className="text-lg">Connecting, please wait...</p>
          <p className="text-sm text-muted-foreground">
            This may take a few moments.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
