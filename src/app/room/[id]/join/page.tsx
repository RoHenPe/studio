
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
import { joinRoom } from "@/services/roomService";
import { useToast } from "@/hooks/use-toast";

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const roomId = params.id as string;

  useEffect(() => {
    if (!roomId) {
      router.push('/');
      return;
    };

    const attemptToJoin = async () => {
      try {
        await joinRoom(roomId);
        // If joinRoom is successful, it means the room is now full and connected.
        router.push(`/room/${roomId}/play`);
      } catch (error: any) {
        toast({
          title: "Failed to Join Room",
          description: error.message,
          variant: "destructive",
        });
        router.push("/");
      }
    };

    attemptToJoin();
  }, [roomId, router, toast]);

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
