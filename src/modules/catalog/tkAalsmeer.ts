// src/modules/catalog/tkAalsmeer.ts

// Canonical catalog information derived from https://www.tkaalsmeer.nl.



export interface ProfileTypeSpec {

  slug: string;

  name: string;

  description: string;

  metrics: Array<{ label: string; value: string }>;

  sourceUrl: string;

}



export interface ProductCategorySpec {

  slug: string;

  name: string;

  summary: string;

  sourceUrl: string;

}



export const tkProfileTypes: ProfileTypeSpec[] = [

  {

    slug: "trend",

    name: "Trend",

    description:

      "Recessed profile with a 15° chamfered daylight opening that keeps the exterior slender while maintaining excellent insulation values.",

    metrics: [

      { label: "Inbouwdiepte", value: "120 mm" },

      { label: "Breedte incl. aanslag", value: "81 mm (montage mét stelkozijn)" },

      { label: "Breedte excl. aanslag", value: "63 mm (montage zónder stelkozijn)" },

      {

        label: "Opmerking",

        value: "Let op: de ruimte tussen scharnieren en de binnenafwerking is beperkt.",

      },

    ],

    sourceUrl: "https://www.tkaalsmeer.nl/profiel-types/",

  },

  {

    slug: "cube",

    name: "Cube",

    description:

      "Recessed profile with straight daylight openings that mirrors the look of timber frames while keeping a sloped bottom rail for drainage.",

    metrics: [

      { label: "Inbouwdiepte", value: "120 mm" },

      { label: "Breedte incl. aanslag", value: "81 mm (montage mét stelkozijn)" },

      { label: "Breedte excl. aanslag", value: "63 mm (montage zónder stelkozijn)" },

      {

        label: "Opmerking",

        value: "Let op: de ruimte tussen scharnieren en de binnenafwerking is beperkt.",

      },

    ],

    sourceUrl: "https://www.tkaalsmeer.nl/profiel-types/",

  },

  {

    slug: "classic",

    name: "Classic",

    description: "Flush profile with modern straight sight-lines, ideal when a flat interior finish is required.",

    metrics: [

      { label: "Inbouwdiepte", value: "76 mm" },

      { label: "Breedte incl. aanslag", value: "84 mm (montage mét stelkozijn)" },

    ],

    sourceUrl: "https://www.tkaalsmeer.nl/profiel-types/",

  },

];



export const tkProductCategories: ProductCategorySpec[] = [

  {

    slug: "raamkozijnen",

    name: "Raamkozijnen",

    summary: "Window frames in multiple shapes, profiles, and colours tailored to each project.",

    sourceUrl: "https://www.tkaalsmeer.nl/producten/",

  },

  {

    slug: "raam-deurbeslag",

    name: "Raam- en deurbeslag",

    summary: "Hardware catalogue covering handles, locking sets, and seasonal night-ventilation positions.",

    sourceUrl: "https://www.tkaalsmeer.nl/producten/",

  },

  {

    slug: "voordeuren",

    name: "Voordeuren",

    summary: "Front door programme combining security, weather-tight performance, and custom styling.",

    sourceUrl: "https://www.tkaalsmeer.nl/producten/",

  },

  {

    slug: "kleuren",

    name: "Kleuren",

    summary: "Palette of 25 finishes and surface structures to match facade aesthetics.",

    sourceUrl: "https://www.tkaalsmeer.nl/producten/",

  },

  {

    slug: "achterdeuren",

    name: "Achterdeuren",

    summary: "Back door line-up with practical low thresholds and robust everyday usability.",

    sourceUrl: "https://www.tkaalsmeer.nl/producten/",

  },

  {

    slug: "horren",

    name: "Horren",

    summary: "Made-to-measure insect screens supplied in the same colour as the associated frame.",

    sourceUrl: "https://www.tkaalsmeer.nl/producten/",

  },

  {

    slug: "openslaande-deuren",

    name: "Openslaande deuren",

    summary: "French door systems that connect living spaces to the garden with wide, low-threshold openings.",

    sourceUrl: "https://www.tkaalsmeer.nl/producten/",

  },

  {

    slug: "voordeur-vullingen",

    name: "Voordeur vullingen",

    summary: "Decorative infill panels ranging from modern to classic for personalised entrances.",

    sourceUrl: "https://www.tkaalsmeer.nl/producten/",

  },

  {

    slug: "schuifpuien",

    name: "Schuifpuien",

    summary: "Sliding patio doors that maximise daylight with smooth lateral operation and minimal thresholds.",

    sourceUrl: "https://www.tkaalsmeer.nl/producten/",

  },

  {

    slug: "onderdorpels",

    name: "Onderdorpels",

    summary: "Choice between traditional PVC sills and low Isostone thresholds, each with distinct benefits.",

    sourceUrl: "https://www.tkaalsmeer.nl/producten/",

  },

  {

    slug: "verhuisramen",

    name: "Verhuisramen",

    summary: "Heritage Dutch sliding windows recreated in low-maintenance PVC.",

    sourceUrl: "https://www.tkaalsmeer.nl/producten/",

  },

  {

    slug: "ventilatieroosters",

    name: "Ventilatieroosters",

    summary: "Ventilation louvres that maintain indoor air quality alongside high insulation values.",

    sourceUrl: "https://www.tkaalsmeer.nl/producten/",

  },

];



export const tkProfileTypeSlugs = tkProfileTypes.map((item) => item.slug);

export const tkProfileTypeLookup = Object.fromEntries(tkProfileTypes.map((item) => [item.slug, item] as const));



export const tkProductCategorySlugs = tkProductCategories.map((item) => item.slug);

export const tkProductCategoryLookup = Object.fromEntries(tkProductCategories.map((item) => [item.slug, item] as const));

