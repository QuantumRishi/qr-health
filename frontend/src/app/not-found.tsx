import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
            <h1 className="text-9xl font-extrabold text-primary/20">404</h1>
            <h2 className="text-3xl font-bold mt-4">Page Not Found</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
                The recovery page you are looking for might have been moved, deleted, or never existed.
            </p>
            <div className="mt-8">
                <Button asChild>
                    <Link href="/">
                        <MoveLeft className="mr-2 h-4 w-4" />
                        Back to Home
                    </Link>
                </Button>
            </div>
        </div>
    );
}
