import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/marketplace/carrito')({
    head: () => ({
    meta: [
      { title: "Carrito de Compras — Mango App" },
      {
        name: "description",
        content: "Revisa tu carrito y confirma la orden de compra al productor.",
      },
      { property: "og:title", content: "Carrito de Compras — Mango App" },
      {
        property: "og:description",
        content: "Revisa los productos agregados y confirma tu orden de compra.",
      },
    ],
  }),
  component: CarritoPage,
})

function CarritoPage() {
  return <div>Hello "/marketplace/carrito"!</div>
}
