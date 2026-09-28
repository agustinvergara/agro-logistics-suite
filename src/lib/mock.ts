import mangoImg from "../../public/mango.jpg";
import platanoImg from "../../public/platano.jpg";
import cebollaImg from "../../public/cebolla.jpg";
import aguacateImg from "../../public/aguacate.jpg";

export type Producto = {
  id: number;
  name: string;
  category: string;
  requiresRefrigeration: boolean;
  basePricePerUnit: number;
  stockAvailable: number;
  producer?: string;
  description?: string;
  expirationDate?: string;
  condition?: string;
  unit?: string;
  image?: string;
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
    description:
      "Mango Tommy Atkins de primera calidad, calibre 10-12, cosechado el mismo día. Empaque en cajas de 10 kg aptas para exportación.",
    expirationDate: "2026-10-12",
    condition: "Fresco",
    unit: "Caja",
    image: mangoImg,
  },
  {
    id: 2,
    name: "Plátano Barraganete",
    category: "Frutas",
    requiresRefrigeration: false,
    basePricePerUnit: 0.45,
    stockAvailable: 2400,
    producer: "Cooperativa Chiriquí",
    description:
      "Plátano verde de primera, grado 1, ideal para freír o madurar en bodega. Se vende por kilo en racimos seleccionados.",
    expirationDate: "2026-10-05",
    condition: "Fresco",
    unit: "Kilo",
    image: platanoImg,
  },
  {
    id: 3,
    name: "Tomate Perita",
    category: "Vegetales",
    requiresRefrigeration: true,
    basePricePerUnit: 0.98,
    stockAvailable: 620,
    producer: "Agro Coclé",
    description:
      "Tomate perita tipo romana, firme y de color uniforme, cosecha de la semana. Cajas de 20 lb listas para distribución.",
    expirationDate: "2026-10-03",
    condition: "Maduro",
    unit: "Caja",
    image: mangoImg,
  },
  {
    id: 4,
    name: "Piña MD2",
    category: "Frutas",
    requiresRefrigeration: false,
    basePricePerUnit: 2.1,
    stockAvailable: 310,
    producer: "Finca Santa Rita",
    description:
      "Piña MD2 golden, 12-14 °Brix, tamaño 8-10. Cultivo sin exceso de agroquímicos, lista para consumo inmediato.",
    expirationDate: "2026-10-18",
    condition: "Fresco",
    unit: "Unidad",
    image: mangoImg,
  },
  {
    id: 5,
    name: "Cebolla Blanca",
    category: "Vegetales",
    requiresRefrigeration: false,
    basePricePerUnit: 0.72,
    stockAvailable: 1500,
    producer: "Productores de Natá",
    description:
      "Cebolla blanca curada al sol, bulbo firme de tamaño mediano. Saco de 50 lb bien ventilado para mayor duración.",
    expirationDate: "2026-11-01",
    condition: "Para procesar",
    unit: "Saco",
    image: cebollaImg,
  },
  {
    id: 6,
    name: "Aguacate Hass",
    category: "Frutas",
    requiresRefrigeration: true,
    basePricePerUnit: 3.4,
    stockAvailable: 190,
    producer: "Finca Boquete Verde",
    description:
      "Aguacate Hass de altura, pulpa cremosa sin fibras, calibre 24-28. Cajas de 4 kg con madurez controlada por lotes.",
    expirationDate: "2026-10-09",
    condition: "Fresco",
    unit: "Kilo",
    image: aguacateImg,
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
