import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileQuestion } from "lucide-react"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <FileQuestion className="h-20 w-20 mx-auto text-muted-foreground" />
            <div>
              <h1 className="text-4xl font-bold mb-2">404</h1>
              <h2 className="text-xl font-semibold">Page Not Found</h2>
              <p className="text-muted-foreground mt-2">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link href="/">Go Home</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/services">Browse Services</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
