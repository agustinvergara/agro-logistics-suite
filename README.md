# Mango Agro Logistics

Act as an expert React/Tailwind frontend developer. Build the "Mango App" MVP, a multi-tenant B2B agricultural logistics platform. 

CRITICAL RULE: ALL user interface text, buttons, placeholders, menus, and toasts MUST be strictly in Spanish.

Use React, React Router, Tailwind CSS, Lucide React for icons, and strictly integrate `react-leaflet` and `leaflet` for the maps using OpenStreetMap tiles (https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png).

1. STYLING & THEMING:

Inject the following OKLCH palette into the global CSS/Tailwind config. Apply these exact variables for primary buttons, backgrounds, and borders:

:root {

    --radius: .875rem;

    --background: oklch(100% 0 0);

    --foreground: oklch(22% .03 150);

    --card: oklch(100% 0 0);

    --card-foreground: oklch(22% .03 150);

    --popover: oklch(100% 0 0);

    --popover-foreground: oklch(22% .03 150);

    --primary: oklch(58% .16 148);

    --primary-foreground: oklch(99% .01 120);

    --secondary: oklch(96% .02 140);

    --secondary-foreground: oklch(30% .06 150);

    --muted: oklch(97% .008 130);

    --muted-foreground: oklch(52% .02 150);

    --accent: oklch(75% .16 62);

    --accent-foreground: oklch(24% .05 60);

    --mango: oklch(75% .16 62);

    --mango-foreground: oklch(24% .05 60);

    --leaf: oklch(45% .13 152);

    --sun: oklch(86% .14 92);

    --destructive: oklch(57.7% .245 27.325);

    --destructive-foreground: oklch(98.4% .003 247.858);

    --border: oklch(92% .012 140);

    --input: oklch(92% .012 140);

    --ring: oklch(58% .16 148);

    --gradient-brand: linear-gradient(135deg, var(--leaf), var(--primary) 55%, var(--mango));

    --shadow-soft: 0 1px 2px oklch(22% .03 150 / .05), 0 12px 32px -16px oklch(22% .03 150 / .22);

}

2. GLOBAL STATE & AUTHENTICATION:

Create a login view. 

UI Text: "Iniciar Sesión", "Correo Electrónico", "Contraseña".

Action: Send POST to `http://localhost:8080/api/auth/login` with `{email, password}`.

Store the returned `token`, `tenantId`, and `role` in localStorage. 

Create an Axios interceptor (or custom fetch hook) to append `Authorization: Bearer <token>` to all subsequent requests.

Provide a role selector in the login screen (Text: "Entrar como:") to simulate logging in as Productor, Minisuper, Transportista, or Admin.

3. VIEWS BY ROLE (DASHBOARDS):

A. PRODUCER DASHBOARD (Panel de Productor):

- Components: "Publicar Producto" form and "Mi Billetera".

- Publish Action: POST to `http://localhost:8080/api/marketplace/perecederos/publish`.

  Payload: `{name: string, category: string, requiresRefrigeration: bool, basePricePerUnit: number, stockAvailable: number}`.

- Wallet Action: GET `http://localhost:8080/api/escrow/balance`. Display `availableBalance` (Saldo Disponible) and `heldInEscrow` (Retenido en Escrow).

B. BUYER DASHBOARD (Panel de Minisuper):

- Components: "Mercado de Productos". 

- Feed Action: GET `http://localhost:8080/api/marketplace/perecederos/list`. Render products in cards.

- Buy Action: Click "Comprar" on a card -> open modal to select quantity (Cantidad) -> POST to `http://localhost:8080/api/marketplace/ordenes/comprar`.

  Payload: `{productId: number, quantity: number}`. Show success toast ("Compra realizada con éxito").

C. CARRIER DASHBOARD (Panel de Transportista - THE MAP VIEW):

- Components: Full-screen or large `react-leaflet` MapContainer, and an overlaid list/sidebar of "Viajes Disponibles".

- Action: Get device geolocation (mock currentLat: 9.0833, currentLng: -79.5167). 

- Trips Action: GET `http://localhost:8080/api/logistica/viajes/cercanos?currentLat=9.0833&currentLng=-79.5167`.

- Map Rendering: For each trip in the response, render a Green Marker at `pickupLat/pickupLng` (Origen) and a Red Marker at `dropoffLat/dropoffLng` (Destino). Draw a simple `Polyline` between them.

- Accept Trip: Button "Aceptar Viaje" sends POST to `http://localhost:8080/api/logistica/viajes/{tripId}/aceptar?vehicleId=1`. Remove from map on success.

- Complete Trip (Escrow Release): Button "Completar Entrega" opens modal asking for PIN. Sends POST to `http://localhost:8080/api/escrow/release` with `{orderId: number, releasePin: "1234"}`.

D. ADMIN DASHBOARD (Panel de Administración):

- Fully mock this view. Show dummy charts (bar/line) regarding "Volumen de Sistema", "Total en Escrow", and "Camiones Activos". Use Recharts or similar. No API connection needed here.

4. UX/UI CONSTRAINTS:

- Keep the design clean, B2B focused, using the `--gradient-brand` for the main hero or top navigations.

- Implement loading states (spinners) during API calls (Text: "Cargando...").

- Handle CORS gracefully (assume backend allows origins, just make standard fetch calls).

- If API calls fail (e.g., backend off), fallback to rendering mock data so the UI doesn't crash during the demo. Show a subtle toast saying "Usando datos de prueba".

Build the complete application architecture.
 @project:a9adacbf-9ca6-4b13-a675-a6c87bcec79e:"Mango Connect"

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://agro-logistics-suite.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6721ff37-a7d2-4a9b-b0c7-f3f0f86bfaaf).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
