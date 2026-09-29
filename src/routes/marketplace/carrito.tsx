import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/marketplace/carrito')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/marketplace/carrito"!</div>
}
