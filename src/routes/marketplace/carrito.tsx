import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/marketplace/carrito')({
  component: CarritoPage,
})

function CarritoPage() {
  return <div>Hello "/marketplace/carrito"!</div>
}
