import type { Locale } from "@/i18n/config";

export interface OfflineTool {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  features: string[];
  tips: string[];
  links: { label: string; url: string }[];
  worksOffline: boolean;
}

export const OFFLINE_TOOLS: OfflineTool[] = [
  {
    id: "bitchat",
    slug: "bitchat",
    name: "BitChat",
    tagline:
      "Mensajería por Bluetooth sin internet — ideal cuando cae la red o hay cortes de datos.",
    description:
      "BitChat (también conocida como BIT CHAT) es una app de mensajería descentralizada que funciona sin internet, Wi‑Fi ni datos móviles. Usa una red mesh por Bluetooth: los mensajes saltan entre teléfonos cercanos (hasta varios saltos) sin servidores ni número de teléfono. Muy útil en emergencias, cortes de comunicación o zonas sin señal.",
    features: [
      "No requiere internet, cuenta ni número de teléfono",
      "Mensajes cifrados entre dispositivos cercanos",
      "Los mensajes se retransmiten por otros usuarios en la zona (red mesh)",
      "Funciona en Android e iOS",
      "Código abierto — proyecto de Jack Dorsey",
    ],
    tips: [
      "Activa Bluetooth y concede permisos de ubicación (necesarios para escanear dispositivos en Android/iOS)",
      "Desactiva la optimización de batería para la app",
      "Mantén la app abierta y acércate a otras personas con BitChat (10–30 m aprox.)",
      "Cuantas más personas la usen en tu zona, más lejos llegan los mensajes",
      "Si hay internet, también puede usar canales por ubicación vía Nostr",
    ],
    links: [
      {
        label: "Google Play (Android)",
        url: "https://play.google.com/store/apps/details?id=com.bitchat.bluetooth",
      },
      {
        label: "Código fuente (GitHub)",
        url: "https://github.com/permissionlesstech/bitchat",
      },
    ],
    worksOffline: true,
  },
];

export const OFFLINE_TOOLS_EN: OfflineTool[] = [
  {
    id: "bitchat",
    slug: "bitchat",
    name: "BitChat",
    tagline:
      "Bluetooth messaging without internet — ideal when the network goes down or data runs out.",
    description:
      "BitChat (also known as BIT CHAT) is a decentralized messaging app that works without internet, Wi‑Fi or mobile data. It uses a Bluetooth mesh network: messages hop between nearby phones (multiple hops) with no servers or phone number required. Very useful in emergencies, communication blackouts or areas with no signal.",
    features: [
      "No internet, account or phone number required",
      "Encrypted messages between nearby devices",
      "Messages relay through other users in the area (mesh network)",
      "Works on Android and iOS",
      "Open source — Jack Dorsey's project",
    ],
    tips: [
      "Enable Bluetooth and grant location permission (required for device scanning on Android/iOS)",
      "Disable battery optimization for the app",
      "Keep the app open and stay near other BitChat users (approx. 10–30 m)",
      "The more people use it in your area, the farther messages can travel",
      "When internet is available, it can also use location-based channels via Nostr",
    ],
    links: [
      {
        label: "Google Play (Android)",
        url: "https://play.google.com/store/apps/details?id=com.bitchat.bluetooth",
      },
      {
        label: "Source code (GitHub)",
        url: "https://github.com/permissionlesstech/bitchat",
      },
    ],
    worksOffline: true,
  },
];

export function getOfflineTools(locale: Locale): OfflineTool[] {
  if (locale === "es") return OFFLINE_TOOLS;
  return OFFLINE_TOOLS_EN;
}
