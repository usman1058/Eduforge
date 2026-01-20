import { Navbar } from "@/components/navbar"

interface StudentDashboardLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export function StudentDashboardLayout({
  children,
  title,
  description,
}: StudentDashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-background/95">
      <Navbar showAuthLinks={true} />
      <main className="flex-1 p-6 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto space-y-6">
          {title && (
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight">
                {title}
              </h1>
            </div>
          )}
          {description && (
            <div className="space-y-1">
              <p className="text-lg text-muted-foreground">
                {description}
              </p>
            </div>
          )}
          <div className="bg-card rounded-xl shadow-sm border p-6 md:p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
