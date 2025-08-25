import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import { Separator } from "./ui/separator"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "./ui/card"
import { Rocket, Star, Heart } from "lucide-react"

export function ComponentShowcase() {
  return (
    <div className="space-y-8 p-8">
      {/* Buttons Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Default Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button variant="outline" size="icon">
            <Rocket className="h-4 w-4" />
          </Button>
        </div>
      </section>

      <Separator />

      {/* Form Controls Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Form Controls</h2>
        <div className="space-y-4 max-w-md">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input type="email" id="email" placeholder="Email" />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input type="password" id="password" placeholder="Password" />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="message">Message</Label>
            <Input id="message" placeholder="Type your message here..." />
          </div>
        </div>
      </section>

      <Separator />

      {/* Badges Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Badges</h2>
        <div className="flex flex-wrap gap-4">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </section>

      <Separator />

      {/* Cards Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Cards</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Simple Card</CardTitle>
              <CardDescription>This is a simple card example</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Card content goes here. You can add any content you want.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interactive Card</CardTitle>
              <CardDescription>Card with actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Badge variant="secondary">New</Badge>
                <Badge variant="outline">Popular</Badge>
              </div>
              <p>This card has interactive elements.</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                <Star className="mr-2 h-4 w-4" />
                Star
              </Button>
              <Button size="sm">
                <Heart className="mr-2 h-4 w-4" />
                Like
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form Card</CardTitle>
              <CardDescription>A card with a form</CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                <div className="grid w-full items-center gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Name of your project" />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="framework">Framework</Label>
                    <Input id="framework" placeholder="React" />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button>Deploy</Button>
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  )
}
