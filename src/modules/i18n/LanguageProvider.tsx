"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Language = "en" | "nl";

type SummaryMetric = "projects" | "inventory" | "quotes";

type SummaryCard = {
  id: string;
  name: string;
  description: string;
  href: string;
  metric: SummaryMetric;
};

type DashboardTranslations = {
  summaryCards: SummaryCard[];
  quickLinks: {
    id: string;
    title: string;
    description: string;
    href: string;
  }[];
  productionPipeline: {
    title: string;
    description: string;
    bullets: string[];
  };
  quickActionsTitle: string;
  viewDetails: string;
};

type InventoryTranslations = {
  title: string;
  description: string;
  materialsTitle: string;
  profileCatalogTitle: string;
  profileCatalogDescription: string;
  profileStockTitle: string;
  profileStockDescription: string;
  profileStockColumns: {
    profile: string;
    depth: string;
    widthIncl: string;
    widthExcl: string;
    length: string;
    quantity: string;
    minimum: string;
  };
  profileStockSummaryLabel: string;
  profileStockSummaryMinimum: string;
  productCatalogTitle: string;
  productCatalogDescription: string;
  catalogSourceLabel: string;
  framesTitle: string;
  implementationHintsTitle: string;
  implementationHints: string[];
  form: {
    sku: string;
    name: string;
    category: string;
    quantity: string;
    unit: string;
    location: string;
    minQuantity: string;
    notes: string;
    submitCreate: string;
    submitUpdate: string;
  };
};

type CustomerTranslations = {
  title: string;
  description: string;
  addButton: string;
  table: {
    headers: {
      customer: string;
      contact: string;
      phone: string;
      projects: string;
    };
    activeSuffix: string;
  };
  form: {
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    notes: string;
    submitCreate: string;
    submitUpdate: string;
  };
  nextStepsTitle: string;
  nextSteps: string[];
};

type ProjectTranslations = {
  title: string;
  description: string;
  newProject: string;
  fields: {
    start: string;
    end: string;
    frames: string;
  };
  datePlaceholder: string;
  roadmapTitle: string;
  roadmap: string[];
  form: {
    name: string;
    reference: string;
    customer: string;
    status: string;
    startDate: string;
    endDate: string;
    description: string;
    submitCreate: string;
    submitUpdate: string;
  };
};

type SalesTranslations = {
  title: string;
  description: string;
  newQuote: string;
  newInvoice: string;
  table: {
    number: string;
    customer: string;
    type: string;
    status: string;
    total: string;
    issued: string;
  };
  pricingSystemTitle: string;
  pricingSystem: string[];
  form: {
    number: string;
    customer: string;
    project: string;
    status: string;
    type: string;
    totalAmount: string;
    issueDate: string;
    dueDate: string;
    notes: string;
    submitCreate: string;
    submitUpdate: string;
  };
};

type DrawingsTranslations = {
  title: string;
  description: string;
  divisionsLabel: string;
  exportButton: string;
  footnote: string;
  form: {
    project: string;
    label: string;
    width: string;
    height: string;
    notes: string;
    submitCreate: string;
    submitUpdate: string;
  };
};

type CommonTranslations = {
  loading: string;
  saving: string;
  cancel: string;
  edit: string;
  delete: string;
  confirmDelete: string;
  empty: string;
  saveChanges: string;
  create: string;
  update: string;
};

type TranslationShape = {
  languageName: string;
  common: CommonTranslations;
  layout: {
    brand: string;
    suiteTitle: string;
    suiteTagline: string;
  };
  languageSwitcher: {
    label: string;
    english: string;
    dutch: string;
  };
  sidebar: {
    dashboard: string;
    customers: string;
    projects: string;
    inventory: string;
    sales: string;
    drawings: string;
  };
  dashboard: DashboardTranslations;
  customers: CustomerTranslations;
  projects: ProjectTranslations;
  inventory: InventoryTranslations;
  sales: SalesTranslations;
  drawings: DrawingsTranslations;
  statuses: {
    projects: Record<string, string>;
    invoices: Record<string, string>;
    invoiceStatus: Record<string, string>;
    windowFrames: Record<string, string>;
  };
};

const translations: Record<Language, TranslationShape> = {
  en: {
    languageName: "English",
    common: {
      loading: "Loading...",
      saving: "Saving...",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      confirmDelete: "Are you sure you want to delete this item?",
      empty: "No records yet.",
      saveChanges: "Save changes",
      create: "Create",
      update: "Update",
    },
    layout: {
      brand: "TK Kozijnen",
      suiteTitle: "Factory Management Suite",
      suiteTagline: "uPVC Window Production",
    },
    languageSwitcher: {
      label: "Language",
      english: "English",
      dutch: "Dutch",
    },
    sidebar: {
      dashboard: "Dashboard",
      customers: "Customers",
      projects: "Projects",
      inventory: "Inventory",
      sales: "Quotes & Invoices",
      drawings: "Drawings",
    },
    dashboard: {
      summaryCards: [
        {
          id: "active-projects",
          name: "Active Projects",
          description: "Track production status per window batch.",
          href: "/projects",
          metric: "projects",
        },
        {
          id: "inventory-alerts",
          name: "Inventory Items",
          description: "Monitor frame profiles, glass, and hardware.",
          href: "/inventory",
          metric: "inventory",
        },
        {
          id: "outstanding-quotes",
          name: "Quotes & Invoices",
          description: "Convert quotes to orders and invoices quickly.",
          href: "/sales",
          metric: "quotes",
        },
      ],
      quickLinks: [
        {
          id: "register-customer",
          title: "Register New Customer",
          description: "Capture company details and contacts in seconds.",
          href: "/customers",
        },
        {
          id: "create-project",
          title: "Create Project",
          description:
            "Bundle multiple windows, assign pricing, and schedule production.",
          href: "/projects",
        },
        {
          id: "design-window",
          title: "Design Window",
          description: "Start a schematic drawing and attach fabrication notes.",
          href: "/drawings",
        },
      ],
      productionPipeline: {
        title: "Production Pipeline",
        description:
          "Organise every window order by project, manage fabrication steps, and keep inventory aligned with demand. Link projects straight to customer records and costings.",
        bullets: [
          "Projects capture installation schedules and required frames.",
          "Window frames store dimensions, glazing, and hardware choices.",
          "Quotes roll into invoices automatically with approved pricing.",
        ],
      },
      quickActionsTitle: "Quick Actions",
      viewDetails: "View details",
    },
    customers: {
      title: "Customers",
      description:
        "Register installers, dealers, and direct clients. Link every project and invoice to the right account.",
      addButton: "Add customer",
      table: {
        headers: {
          customer: "Customer",
          contact: "Contact",
          phone: "Phone",
          projects: "Projects",
        },
        activeSuffix: "active",
      },
      form: {
        name: "Customer name",
        contactPerson: "Contact person",
        email: "Email",
        phone: "Phone",
        address: "Address",
        notes: "Notes",
        submitCreate: "Create customer",
        submitUpdate: "Update customer",
      },
      nextStepsTitle: "Next steps",
      nextSteps: [
        "Replace mock data by calling the REST endpoint `/api/customers`.",
        "Use Prisma in `src/server/modules/customers/service.ts` for CRUD and extend with search / pagination.",
      ],
    },
    projects: {
      title: "Projects",
      description:
        "Coordinate multi-window orders, deadlines, and production phases for every customer project.",
      newProject: "New project",
      fields: {
        start: "Start",
        end: "End",
        frames: "Frames",
      },
      datePlaceholder: "TBD",
      roadmapTitle: "Roadmap",
      roadmap: [
        "Wire API routes `/api/projects` into a client-side data grid.",
        "Attach window frame drawings and pricing packages per project.",
        "Link project status to production milestones and inventory usage.",
      ],
      form: {
        name: "Project name",
        reference: "Reference",
        customer: "Customer",
        status: "Status",
        startDate: "Start date",
        endDate: "End date",
        description: "Description",
        submitCreate: "Create project",
        submitUpdate: "Update project",
      },
    },
    inventory: {
      title: "Inventory",
      description:
        "Maintain live stock levels for uPVC profiles, glazing, and hardware. Track which frames are ready, pending, or reserved for projects.",
      materialsTitle: "Materials",
      profileCatalogTitle: "TK Aalsmeer profile types",
      profileCatalogDescription:
        "Reference the standard profile geometries available from TK Aalsmeer when planning fabrication.",
      profileStockTitle: "Profile stock overview",
      profileStockDescription:
        "Track stock lengths, quantities, and minimum thresholds per TK Aalsmeer profile type.",
      profileStockColumns: {
        profile: "Profile",
        depth: "Inbouwdiepte",
        widthIncl: "Breedte incl. aanslag",
        widthExcl: "Breedte excl. aanslag",
        length: "Length (mm)",
        quantity: "Number",
        minimum: "Minimum",
      },
      profileStockSummaryLabel: "Stock",
      profileStockSummaryMinimum: "min.",
      productCatalogTitle: "TK Aalsmeer product portfolio",
      productCatalogDescription:
        "Catalogue of finished goods and accessories that can be produced with the available profiles.",
      catalogSourceLabel: "View on tkaalsmeer.nl",
      framesTitle: "Window Frames in Progress",
      implementationHintsTitle: "Implementation hints",
      implementationHints: [
        "Create Prisma relations for stock reservations per window frame.",
        "Automate minimum stock level alerts and supplier reorder tasks.",
      ],
      form: {
        sku: "SKU",
        name: "Name",
        category: "Category",
        quantity: "Quantity",
        unit: "Unit",
        location: "Location",
        minQuantity: "Minimum quantity",
        notes: "Notes",
        submitCreate: "Add item",
        submitUpdate: "Update item",
      },
    },
    sales: {
      title: "Quotes & Invoices",
      description:
        "Build offers from project data, convert to invoices, and keep track of payment status.",
      newQuote: "New quote",
      newInvoice: "New invoice",
      table: {
        number: "Number",
        customer: "Customer",
        type: "Type",
        status: "Status",
        total: "Total",
        issued: "Issued",
      },
      pricingSystemTitle: "Pricing system",
      pricingSystem: [
        "Extend `windowFrame` model with cost breakdown (profiles, glazing, hardware).",
        "Generate financial documents via `/api/invoices` to serve PDF in future.",
        "Integrate with payment logs or external ERP if needed.",
      ],
      form: {
        number: "Document number",
        customer: "Customer",
        project: "Linked project",
        status: "Status",
        type: "Type",
        totalAmount: "Total amount",
        currency: "Currency",
        issueDate: "Issue date",
        dueDate: "Due date",
        notes: "Notes",
        submitCreate: "Create document",
        submitUpdate: "Update document",
      },
    },
    drawings: {
      title: "Schematic Drawings",
      description:
        "Draft window layouts, capture dimensions, and attach fabrication notes. This placeholder canvas illustrates the design surface - replace it with your preferred drawing library (e.g. Konva, Fabric, or SVG tools).",
      divisionsLabel: "Divisions",
      exportButton: "Export DXF (coming soon)",
      footnote:
        "To build the full drawing experience, move the canvas into a dedicated client component, capture mouse interactions, and save JSON blueprints to the `configuration` field on `WindowFrame` records.",
      form: {
        project: "Project",
        label: "Frame label",
        width: "Width (mm)",
        height: "Height (mm)",
        profileType: "Profile type",
        notes: "Notes",
        profileSourceLabel: "View TK Aalsmeer spec",
        validationError: "Please complete the required fields with valid values.",
        submitCreate: "Create frame",
        submitUpdate: "Update frame",
      },
    },
    statuses: {
      projects: {
        PLANNING: "Planning",
        IN_PRODUCTION: "In production",
        COMPLETED: "Completed",
        ON_HOLD: "On hold",
      },
      invoices: {
        QUOTE: "Quote",
        INVOICE: "Invoice",
      },
      invoiceStatus: {
        DRAFT: "Draft",
        SENT: "Sent",
        PAID: "Paid",
        CANCELLED: "Cancelled",
      },
      windowFrames: {
        "Awaiting glass": "Awaiting glass",
        "Ready for assembly": "Ready for assembly",
      },
    },
  },
  nl: {
    languageName: "Nederlands",
    common: {
      loading: "Laden...",
      saving: "Opslaan...",
      cancel: "Annuleren",
      edit: "Bewerken",
      delete: "Verwijderen",
      confirmDelete: "Weet je zeker dat je dit item wilt verwijderen?",
      empty: "Nog geen gegevens.",
      saveChanges: "Wijzigingen opslaan",
      create: "Aanmaken",
      update: "Bijwerken",
    },
    layout: {
      brand: "TK Kozijnen",
      suiteTitle: "Fabrieksbeheersuite",
      suiteTagline: "uPVC-ramenproductie",
    },
    languageSwitcher: {
      label: "Taal",
      english: "Engels",
      dutch: "Nederlands",
    },
    sidebar: {
      dashboard: "Dashboard",
      customers: "Klanten",
      projects: "Projecten",
      inventory: "Voorraad",
      sales: "Offertes & Facturen",
      drawings: "Tekeningen",
    },
    dashboard: {
      summaryCards: [
        {
          id: "active-projects",
          name: "Actieve projecten",
          description: "Volg de productiestatus per raam-batch.",
          href: "/projects",
          metric: "projects",
        },
        {
          id: "inventory-alerts",
          name: "Voorraaditems",
          description: "Bewaken van profielvoorraad, glas en beslag.",
          href: "/inventory",
          metric: "inventory",
        },
        {
          id: "outstanding-quotes",
          name: "Offertes & facturen",
          description: "Zet offertes razendsnel om naar orders en facturen.",
          href: "/sales",
          metric: "quotes",
        },
      ],
      quickLinks: [
        {
          id: "register-customer",
          title: "Nieuwe klant registreren",
          description: "Leg bedrijfsgegevens en contactpersonen vast in seconden.",
          href: "/customers",
        },
        {
          id: "create-project",
          title: "Project aanmaken",
          description:
            "Bundel meerdere ramen, koppel prijzen en plan de productie.",
          href: "/projects",
        },
        {
          id: "design-window",
          title: "Raam ontwerpen",
          description: "Start een schets en voeg fabricagenotities toe.",
          href: "/drawings",
        },
      ],
      productionPipeline: {
        title: "Productiepijplijn",
        description:
          "Organiseer elke raamorder per project, beheer de fabricagestappen en houd de voorraad afgestemd op de vraag. Koppel projecten direct aan klantdossiers en kostprijzen.",
        bullets: [
          "Projecten bevatten montageschema's en benodigde kozijnen.",
          "Kozijnen bewaren afmetingen, beglazing en hang- en sluitwerk.",
          "Offertes worden automatisch facturen zodra prijzen zijn goedgekeurd.",
        ],
      },
      quickActionsTitle: "Snelle acties",
      viewDetails: "Bekijk details",
    },
    customers: {
      title: "Klanten",
      description:
        "Registreer monteurs, dealers en directe klanten. Koppel elk project en elke factuur aan het juiste account.",
      addButton: "Klant toevoegen",
      table: {
        headers: {
          customer: "Klant",
          contact: "Contact",
          phone: "Telefoon",
          projects: "Projecten",
        },
        activeSuffix: "actief",
      },
      form: {
        name: "Klantnaam",
        contactPerson: "Contactpersoon",
        email: "E-mail",
        phone: "Telefoon",
        address: "Adres",
        notes: "Notities",
        submitCreate: "Klant aanmaken",
        submitUpdate: "Klant bijwerken",
      },
      nextStepsTitle: "Volgende stappen",
      nextSteps: [
        "Vervang mockdata door de REST-endpoint `/api/customers` aan te roepen.",
        "Gebruik Prisma in `src/server/modules/customers/service.ts` voor CRUD en breid uit met zoeken/paginering.",
      ],
    },
    projects: {
      title: "Projecten",
      description:
        "CoÃÂ¶rdineer raamopdrachten, deadlines en productiefasen voor ieder klantproject.",
      newProject: "Nieuw project",
      fields: {
        start: "Start",
        end: "Einde",
        frames: "Kozijnen",
      },
      datePlaceholder: "n.t.b.",
      roadmapTitle: "Roadmap",
      roadmap: [
        "Koppel API-routes `/api/projects` aan een client-side datagrid.",
        "Voeg kozijntekeningen en prijspakketten per project toe.",
        "Link projectstatus aan productiemijlpalen en voorraadverbruik.",
      ],
      form: {
        name: "Projectnaam",
        reference: "Referentie",
        customer: "Klant",
        status: "Status",
        startDate: "Startdatum",
        endDate: "Einddatum",
        description: "Omschrijving",
        submitCreate: "Project aanmaken",
        submitUpdate: "Project bijwerken",
      },
    },
    inventory: {
      title: "Voorraad",
      description:
        "Houd realtime voorraad bij van uPVC-profielen, beglazing en beslag. Volg welke kozijnen klaar, in behandeling of gereserveerd zijn per project.",
      materialsTitle: "Materialen",
      profileCatalogTitle: "TK Aalsmeer-profieltypes",
      profileCatalogDescription:
        "Gebruik deze standaard PVC-profielen van TK Aalsmeer als basis voor je productieplanning.",
      profileStockTitle: "Profielvoorraad",
      profileStockDescription:
        "Overzicht van lengtes, aantallen en minimumstanden per TK Aalsmeer-profieltype.",
      profileStockColumns: {
        profile: "Profiel",
        depth: "Inbouwdiepte",
        widthIncl: "Breedte incl. aanslag",
        widthExcl: "Breedte excl. aanslag",
        length: "Lengte (mm)",
        quantity: "Aantal",
        minimum: "Minimum",
      },
      profileStockSummaryLabel: "Voorraad",
      profileStockSummaryMinimum: "min.",
      productCatalogTitle: "TK Aalsmeer productassortiment",
      productCatalogDescription:
        "Referentiecategorieën voor eindproducten en toebehoren die met deze profielen kunnen worden samengesteld.",
      catalogSourceLabel: "Bekijk op tkaalsmeer.nl",
      framesTitle: "Kozijnen in productie",
      implementationHintsTitle: "Implementatietips",
      implementationHints: [
        "Maak Prisma-relaties voor voorraadreserveringen per kozijn.",
        "Automatiseer minimumvoorraadmeldingen en inkooporders.",
      ],
      form: {
        sku: "Artikelcode",
        name: "Naam",
        category: "Categorie",
        quantity: "Aantal",
        unit: "Eenheid",
        location: "Locatie",
        minQuantity: "Minimum voorraad",
        notes: "Notities",
        submitCreate: "Item toevoegen",
        submitUpdate: "Item bijwerken",
      },
    },
    sales: {
      title: "Offertes & Facturen",
      description:
        "Stel offertes op vanuit projectgegevens, zet ze om naar facturen en bewaak de betalingsstatus.",
      newQuote: "Nieuwe offerte",
      newInvoice: "Nieuwe factuur",
      table: {
        number: "Nummer",
        customer: "Klant",
        type: "Type",
        status: "Status",
        total: "Totaal",
        issued: "Datum",
      },
      pricingSystemTitle: "Prijssysteem",
      pricingSystem: [
        "Breid het `windowFrame`-model uit met kostprijsopbouw (profielen, beglazing, beslag).",
        "Genereer documenten via `/api/invoices` en serveer later als PDF.",
        "Integreer met betalingslogboeken of externe ERP-systemen indien nodig.",
      ],
      form: {
        number: "Documentnummer",
        customer: "Klant",
        project: "Gekoppeld project",
        status: "Status",
        type: "Type",
        totalAmount: "Totaalbedrag",
        currency: "Valuta",
        issueDate: "Uitgiftedatum",
        dueDate: "Vervaldatum",
        notes: "Notities",
        submitCreate: "Document aanmaken",
        submitUpdate: "Document bijwerken",
      },
    },
    drawings: {
      title: "Schematische tekeningen",
      description:
        "Maak raamindelingen, leg afmetingen vast en voeg productienotities toe. Dit tijdelijke canvas toont de ontwerpoppervlakte - vervang het door je favoriete tekenbibliotheek (bijv. Konva, Fabric of SVG-tools).",
      divisionsLabel: "Verdelingen",
      exportButton: "Exporteer DXF (binnenkort beschikbaar)",
      footnote:
        "Voor een volledige tekenervaring verplaats je het canvas naar een clientcomponent, registreer je muisacties en sla je JSON-blauwdrukken op in het veld `configuration` van `WindowFrame`-records.",
      form: {
        project: "Project",
        label: "Kozijnlabel",
        width: "Breedte (mm)",
        height: "Hoogte (mm)",
        profileType: "Profieltype",
        notes: "Notities",
        profileSourceLabel: "Bekijk TK Aalsmeer-specificatie",
        validationError: "Vul de verplichte velden in en gebruik positieve waarden.",
        submitCreate: "Kozijn aanmaken",
        submitUpdate: "Kozijn bijwerken",
      },
    },
    statuses: {
      projects: {
        PLANNING: "Planning",
        IN_PRODUCTION: "In productie",
        COMPLETED: "Afgerond",
        ON_HOLD: "On hold",
      },
      invoices: {
        QUOTE: "Offerte",
        INVOICE: "Factuur",
      },
      invoiceStatus: {
        DRAFT: "Concept",
        SENT: "Verzonden",
        PAID: "Betaald",
        CANCELLED: "Geannuleerd",
      },
      windowFrames: {
        "Awaiting glass": "Wacht op glas",
        "Ready for assembly": "Klaar voor assemblage",
      },
    },
  },
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: TranslationShape;
};

const STORAGE_KEY = "kozijnen-language";

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "nl") {
        return stored;
      }
      const docLang = document.documentElement.getAttribute("lang");
      if (docLang === "en" || docLang === "nl") {
        return docLang;
      }
    }
    return "en";
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      translations: translations[language],
    }),
    [language, setLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function useTranslations(): TranslationShape {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslations must be used within a LanguageProvider");
  }
  return context.translations;
}

export const supportedLanguages: { code: Language; label: string }[] = [
  { code: "en", label: translations.en.languageSwitcher.english },
  { code: "nl", label: translations.nl.languageSwitcher.dutch },
];

