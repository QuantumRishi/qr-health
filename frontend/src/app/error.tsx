"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
            <div className="bg-destructive/10 p-4 rounded-full mb-6">
                <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <h2 className="text-3xl font-bold">Something went wrong!</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
                An error occurred while loading this recovery section. Our team has been notified.
            </p>
            <div className="mt-8 flex gap-4">
                <Button onClick={() => reset()} variant="outline">
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Try again
                </Button>
                <Button onClick={() => (window.location.href = "/")}>
                    Go to Home
                </Button>
            </div>
        </div>
    );
}
