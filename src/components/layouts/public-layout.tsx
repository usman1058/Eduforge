import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

interface PublicLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  showFooter?: boolean
}

export function PublicLayout({
  children,
  title,
  description,
  showFooter = true,
}: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background/95 to-background/90">
      <Navbar showAuthLinks={true} />
      <main className="flex-1 p-4 md:p-8 lg:p-5">
        <div className="max-w-9xl mx-auto space-y-6">
          {title && (
            <div className="space-y-2">
              <h1 className="text-5xl font-bold tracking-tight">
                {title}
              </h1>
            </div>
          )}
          {description && (
            <div className="space-y-2">
              <p className="text-xl text-muted-foreground max-w-2xl">
                {description}
              </p>
            </div>
          )}
          <div className="bg-card rounded-xl shadow-sm border p-6 md:p-8">
            {children}
          </div>
        </div>
      </main>
      {showFooter && <Footer />}
    </div>
  )
}
