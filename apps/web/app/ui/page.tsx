import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Tooltip } from '@/components/ui/Tooltip'
import { FadeIn } from '@/components/motion/FadeIn'
import { ScaleOnHover } from '@/components/motion/ScaleOnHover'

export default function DemoUI() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">UI Kit</h1>

      <Card className="p-4">
        <h2 className="mb-3 text-lg font-medium">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button size="sm">Small</Button>
          <Tooltip content="Click me">
            <Button>With tooltip</Button>
          </Tooltip>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 text-lg font-medium">Inputs</h2>
        <div className="grid gap-3">
          <Input placeholder="Your name" />
          <Textarea placeholder="Say something nice…" rows={4} />
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="mb-3 text-lg font-medium">Motion</h2>
        <div className="flex gap-4">
          <FadeIn className="rounded-xl border border-white/20 bg-white/10 px-4 py-2">FadeIn</FadeIn>
          <ScaleOnHover className="rounded-xl border border-white/20 bg-white/10 px-4 py-2">ScaleOnHover</ScaleOnHover>
        </div>
      </Card>
    </div>
  )
}


