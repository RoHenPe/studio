
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter, useParams } from "next/navigation";
import { UserCheck } from "lucide-react";

export default function WaitPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;

  const handleEnterGame = () => {
    router.push(`/room/${roomId}/play`);
  };

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
            <UserCheck className="h-16 w-16 animate-pulse" />
          </div>
          <p className="text-lg">
            Waiting for another player to join...
          </p>
          <p className="text-sm text-muted-foreground">
            Share the Room ID with your friend.
          </p>
          <Button onClick={handleEnterGame} className="w-full">
            Simulate Player Joined & Enter Game
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
