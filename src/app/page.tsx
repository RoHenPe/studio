
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { createRoom } from "@/services/roomService";
import { Loader2 } from "lucide-react";

const RoomIdSchema = z.object({
  roomId: z.string().min(1, "Room ID cannot be empty").max(50, "Room ID is too long"),
});

type RoomIdFormValues = z.infer<typeof RoomIdSchema>;

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const createForm = useForm<RoomIdFormValues>({
    resolver: zodResolver(RoomIdSchema),
  });

  const joinForm = useForm<RoomIdFormValues>({
    resolver: zodResolver(RoomIdSchema),
  });

  const handleCreateRoom: SubmitHandler<RoomIdFormValues> = async (data) => {
    setIsCreating(true);
    try {
      await createRoom(data.roomId);
      router.push(`/room/${data.roomId}/wait`);
    } catch (error: any) {
      toast({
        title: "Error Creating Room",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom: SubmitHandler<RoomIdFormValues> = (data) => {
    router.push(`/room/${data.roomId}/join`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground">
      <Card className="w-full max-w-md shadow-xl rounded-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Unity Room Connect</CardTitle>
          <CardDescription>Create or join a game room</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <form onSubmit={createForm.handleSubmit(handleCreateRoom)} className="space-y-4">
            <div>
              <Label htmlFor="createRoomId" className="text-lg font-medium">Create a Room</Label>
              <Input
                id="createRoomId"
                placeholder="Enter a Room ID"
                {...createForm.register("roomId")}
                className="mt-2"
                aria-invalid={createForm.formState.errors.roomId ? "true" : "false"}
                disabled={isCreating}
              />
              {createForm.formState.errors.roomId && (
                <p className="text-sm text-destructive mt-1">
                  {createForm.formState.errors.roomId.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isCreating ? "Creating..." : "Create Room"}
            </Button>
          </form>

          <Separator />

          <form onSubmit={joinForm.handleSubmit(handleJoinRoom)} className="space-y-4">
            <div>
              <Label htmlFor="joinRoomId" className="text-lg font-medium">Join a Room</Label>
              <Input
                id="joinRoomId"
                placeholder="Enter Room ID to join"
                {...joinForm.register("roomId")}
                className="mt-2"
                aria-invalid={joinForm.formState.errors.roomId ? "true" : "false"}
              />
              {joinForm.formState.errors.roomId && (
                <p className="text-sm text-destructive mt-1">
                  {joinForm.formState.errors.roomId.message}
                </p>
              )}
            </div>
            <Button type="submit" variant="secondary" className="w-full">
              Join Room
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
