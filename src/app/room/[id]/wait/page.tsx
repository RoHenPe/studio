
"use client";

import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { onRoomUpdate, type Room } from "@/services/roomService";
import { useToast } from "@/hooks/use-toast";

export default function WaitPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const roomId = params.id as string;

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = onRoomUpdate(roomId, (room: Room | null) => {
      if (room) {
        if (room.status === 'connected' && room.playerCount === 2) {
          router.push(`/room/${roomId}/play`);
        }
      } else {
        // Room was deleted or never existed
        toast({
          title: "Room Not Found",
          description: `The room with ID "${roomId}" does not exist.`,
          variant: "destructive",
        });
        router.push('/');
      }
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [roomId, router, toast]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground">
      <Card className="w-full max-w-md shadow-xl rounded-lg text-center">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Waiting Room</CardTitle>
          <CardDescription>
            You've created Room ID: <span className="font-semibold text-primary">{roomId}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center items-center text-muted-foreground">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          </div>
          <p className="text-lg">
            Waiting for another player to join...
          </p>
          <p className="text-sm text-muted-foreground">
            Share the Room ID with your friend.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
