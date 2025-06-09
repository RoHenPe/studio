
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PlayPageProps {
  params: {
    id: string;
  };
}

export default function PlayPage({ params }: PlayPageProps) {
  const roomId = params.id;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground">
      <Card className="w-full max-w-md shadow-xl rounded-lg text-center border-accent">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-20 w-20 text-accent" />
          </div>
          <CardTitle className="text-3xl font-headline text-accent">
            Connection Successful!
          </CardTitle>
          <CardDescription className="text-accent/80">
            You are now connected to Room ID: <span className="font-semibold">{roomId}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg">
            Both players are now in the game scene.
          </p>
          <p className="text-sm text-muted-foreground">
            (This is a simulated game scene. In a real Unity game, players would now interact.)
          </p>
          <Button asChild variant="outline">
            <Link href="/">Return to Homepage</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
