/** Insumos médicos solicitados para donación o compra (lista comunitaria). */
export const DONATION_NEED_CATEGORIES = [
  {
    id: "wound-care",
    items: ["compress-packs", "sterile-gauze", "suture-nylon", "suture-silk"],
  },
  {
    id: "antiseptics",
    items: ["hydrogen-peroxide", "povidone-iodine"],
  },
  {
    id: "iv-solutions",
    items: ["saline-09", "ringer-lactate", "dextrose-5-10"],
  },
  {
    id: "syringes",
    items: ["syringe-3cc", "syringe-5cc", "syringe-10cc", "syringe-20cc"],
  },
  {
    id: "gloves",
    items: ["sterile-gloves", "work-gloves"],
  },
  {
    id: "medications",
    items: [
      "captopril-50",
      "nifedipine",
      "ketoprofen-100",
      "dexamethasone",
      "metoclopramide",
      "adrenaline",
      "omeprazole",
      "vitamin-k",
      "tranexamic-acid",
      "lidocaine",
    ],
  },
  {
    id: "bathroom-supplies",
    items: [
      "toilet-paper",
      "paper-towels",
      "hand-soap",
      "bleach",
      "bathroom-cleaner",
      "trash-bags",
    ],
  },
  {
    id: "3d-printing",
    items: ["pla-filament", "petg-filament", "abs-filament"],
  },
] as const;

/** Colectivo que imprime férulas en 3D y solicita donaciones de filamento. */
export const SCAYTALLER_3D_DONATION = {
  id: "scaytaller-filament",
  anchor: "donacion-filamento-3d",
  instagramUrl: "https://www.instagram.com/scaytaller",
  instagramHandle: "@scaytaller",
  phone: "0412-0521777",
} as const;
