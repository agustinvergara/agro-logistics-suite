export type Producto = {
  id: number;
  name: string;
  category: string;
  requiresRefrigeration: boolean;
  basePricePerUnit: number;
  stockAvailable: number;
  producer?: string;
};

export type Viaje = {
  id: number;
  orderId: number;
  description: string;
  pickupLat: number;
  pickupLng: number;
  dropoffLat: number;
  dropoffLng: number;
  distanceKm: number;
  payout: number;
  requiresRefrigeration: boolean;
};

export const MOCK_PRODUCTOS: Producto[] = [
  {
    id: 1,
    name: "Mango Tommy Atkins",
    category: "Frutas",
    requiresRefrigeration: true,
    basePricePerUnit: 1.35,
    stockAvailable: 850,
    producer: "Finca La Esperanza",
  },
  {
    id: 2,
    name: "Plátano Barraganete",
    category: "Frutas",
    requiresRefrigeration: false,
    basePricePerUnit: 0.45,
    stockAvailable: 2400,
    producer: "Cooperativa Chiriquí",
  },
  {
    id: 3,
    name: "Tomate Perita",
    category: "Vegetales",
    requiresRefrigeration: true,
    basePricePerUnit: 0.98,
    stockAvailable: 620,
    producer: "Agro Coclé",
  },
  {
    id: 4,
    name: "Piña MD2",
    category: "Frutas",
    requiresRefrigeration: false,
    basePricePerUnit: 2.1,
    stockAvailable: 310,
    producer: "Finca Santa Rita",
  },
  {
    id: 5,
    name: "Cebolla Blanca",
    category: "Vegetales",
    requiresRefrigeration: false,
    basePricePerUnit: 0.72,
    stockAvailable: 1500,
    producer: "Productores de Natá",
  },
  {
    id: 6,
    name: "Aguacate Hass",
    category: "Frutas",
    requiresRefrigeration: true,
    basePricePerUnit: 3.4,
    stockAvailable: 190,
    producer: "Finca Boquete Verde",
  },
];

export const MOCK_BALANCE = { availableBalance: 12480.5, heldInEscrow: 5320.75 };

export const MOCK_VIAJES: Viaje[] = [
  {
    id: 101,
    orderId: 5001,
    description: "Mango Tommy — 400 cajas",
    pickupLat: 9.1012,
    pickupLng: -79.5401,
    dropoffLat: 9.0501,
    dropoffLng: -79.4702,
    distanceKm: 11.4,
    payout: 78.5,
    requiresRefrigeration: true,
  },
  {
    id: 102,
    orderId: 5002,
    description: "Plátano Barraganete — 1.2 t",
    pickupLat: 9.0602,
    pickupLng: -79.5605,
    dropoffLat: 9.1205,
    dropoffLng: -79.4405,
    distanceKm: 18.2,
    payout: 124.0,
    requiresRefrigeration: false,
  },
  {
    id: 103,
    orderId: 5003,
    description: "Tomate Perita — 300 cajas",
    pickupLat: 9.0301,
    pickupLng: -79.5002,
    dropoffLat: 9.0902,
    dropoffLng: -79.5801,
    distanceKm: 9.8,
    payout: 62.25,
    requiresRefrigeration: true,
  },
];
