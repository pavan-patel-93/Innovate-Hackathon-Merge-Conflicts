import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          Welcome to Next.js with shadcn/ui
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Start building your application with pre-configured setup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Edit <code className="text-sm bg-muted px-1 py-0.5 rounded">src/app/page.jsx</code> to get started
              </p>
              <Button>Learn More</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Components</CardTitle>
              <CardDescription>
                Beautiful and accessible components built with Radix UI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Add components using the CLI or copy from the library
              </p>
              <Button variant="secondary">Browse Components</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Integration</CardTitle>
              <CardDescription>
                Connect to your FastAPI backend seamlessly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Pre-configured API service for backend communication
              </p>
              <Button variant="outline">View API Docs</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
