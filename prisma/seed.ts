import {
  CutPlanStatus,
  CutPlanStrategy,
  InvoiceDocumentStatus,
  InvoiceStatus,
  InvoiceType,
  Prisma,
  PrismaClient,
  ProjectStatus,
} from "@prisma/client";

import { tkProfileTypeLookup } from "@/modules/catalog/tkAalsmeer";

const prisma = new PrismaClient();

const PROFILE_STOCK_LENGTHS: Record<string, number> = {
  trend: 6400,
  cube: 5200,
  classic: 6000,
};

async function upsertWindowFrames(projectIds: { aurora: string; cityPark: string }) {
  const trendProfile = tkProfileTypeLookup["trend"];
  const cubeProfile = tkProfileTypeLookup["cube"];
  if (!trendProfile || !cubeProfile) {
    throw new Error("Missing TK Aalsmeer profile definitions");
  }

  const [livingRoom, office] = await Promise.all([
    prisma.windowFrame.upsert({
      where: { id: "00000000-0000-0000-0000-000000000101" },
      update: {
        costProfiles: new Prisma.Decimal(320),
        costGlazing: new Prisma.Decimal(220),
        costHardware: new Prisma.Decimal(150),
        unitPrice: new Prisma.Decimal(785),
        materials: {
          profileType: trendProfile.slug,
          profileName: trendProfile.name,
          glazing: "HR++",
        },
      },
      create: {
        id: "00000000-0000-0000-0000-000000000101",
        projectId: projectIds.aurora,
        label: "Living room - Hinged",
        status: "Awaiting glass",
        widthMm: 1200,
        heightMm: 1400,
        materials: {
          profileType: trendProfile.slug,
          profileName: trendProfile.name,
          glazing: "HR++",
        },
        configuration: {
          divisions: 2,
        },
        unitPrice: new Prisma.Decimal(785),
        costProfiles: new Prisma.Decimal(320),
        costGlazing: new Prisma.Decimal(220),
        costHardware: new Prisma.Decimal(150),
        notes: "Awaiting glass delivery",
      },
    }),
    prisma.windowFrame.upsert({
      where: { id: "00000000-0000-0000-0000-000000000102" },
      update: {
        costProfiles: new Prisma.Decimal(280),
        costGlazing: new Prisma.Decimal(190),
        costHardware: new Prisma.Decimal(120),
        unitPrice: new Prisma.Decimal(645),
        materials: {
          profileType: cubeProfile.slug,
          profileName: cubeProfile.name,
          glazing: "Triple",
        },
      },
      create: {
        id: "00000000-0000-0000-0000-000000000102",
        projectId: projectIds.cityPark,
        label: "Kitchen - Tilt & Turn",
        status: "Ready for assembly",
        widthMm: 900,
        heightMm: 1100,
        materials: {
          profileType: cubeProfile.slug,
          profileName: cubeProfile.name,
          glazing: "Triple",
        },
        configuration: {
          divisions: 3,
        },
        unitPrice: new Prisma.Decimal(645),
        costProfiles: new Prisma.Decimal(280),
        costGlazing: new Prisma.Decimal(190),
        costHardware: new Prisma.Decimal(120),
        notes: "Ready for assembly",
      },
    }),
  ]);

  return {
    livingRoom,
    office,
  };
}

async function upsertWallsAndInstances(
  projectIds: { aurora: string; cityPark: string },
  frames: { livingRoom: { id: string }; office: { id: string } },
) {
  const [auroraNorth, cityParkWest] = await Promise.all([
    prisma.wall.upsert({
      where: { id: "00000000-0000-0000-0000-000000000501" },
      update: {
        projectId: projectIds.aurora,
        name: "Residence facade north",
        description: "Primary living room facade",
        widthMm: 6400,
        heightMm: 2600,
        elevation: "North",
      },
      create: {
        id: "00000000-0000-0000-0000-000000000501",
        projectId: projectIds.aurora,
        name: "Residence facade north",
        description: "Primary living room facade",
        widthMm: 6400,
        heightMm: 2600,
        elevation: "North",
      },
    }),
    prisma.wall.upsert({
      where: { id: "00000000-0000-0000-0000-000000000502" },
      update: {
        projectId: projectIds.cityPark,
        name: "Office level 2 west",
        description: "Second floor west elevation",
        widthMm: 7200,
        heightMm: 2600,
        elevation: "West",
      },
      create: {
        id: "00000000-0000-0000-0000-000000000502",
        projectId: projectIds.cityPark,
        name: "Office level 2 west",
        description: "Second floor west elevation",
        widthMm: 7200,
        heightMm: 2600,
        elevation: "West",
      },
    }),
  ]);

  await Promise.all([
    prisma.windowInstance.upsert({
      where: { id: "00000000-0000-0000-0000-000000000601" },
      update: {
        wallId: auroraNorth.id,
        windowFrameId: frames.livingRoom.id,
        label: "Living room bay",
        positionXMm: 800,
        sillHeightMm: 900,
        widthMm: 1200,
        heightMm: 1400,
        rotationDeg: 0,
        config: { cluster: "A" },
      },
      create: {
        id: "00000000-0000-0000-0000-000000000601",
        wallId: auroraNorth.id,
        windowFrameId: frames.livingRoom.id,
        label: "Living room bay",
        positionXMm: 800,
        sillHeightMm: 900,
        widthMm: 1200,
        heightMm: 1400,
        rotationDeg: 0,
        config: { cluster: "A" },
      },
    }),
    prisma.windowInstance.upsert({
      where: { id: "00000000-0000-0000-0000-000000000602" },
      update: {
        wallId: cityParkWest.id,
        windowFrameId: frames.office.id,
        label: "Office tilt-turn",
        positionXMm: 1200,
        sillHeightMm: 1000,
        widthMm: 900,
        heightMm: 1100,
        rotationDeg: 0,
        config: { notes: "Ventilation mode" },
      },
      create: {
        id: "00000000-0000-0000-0000-000000000602",
        wallId: cityParkWest.id,
        windowFrameId: frames.office.id,
        label: "Office tilt-turn",
        positionXMm: 1200,
        sillHeightMm: 1000,
        widthMm: 900,
        heightMm: 1100,
        rotationDeg: 0,
        config: { notes: "Ventilation mode" },
      },
    }),
  ]);

  return {
    auroraNorth,
    cityParkWest,
  };
}

async function upsertInvoices(
  customerIds: { aurora: string; cityPark: string },
  projectIds: { aurora: string; cityPark: string },
) {
  const [quoteInvoice, finalInvoice] = await Promise.all([
    prisma.invoice.upsert({
      where: { number: "INV-2025-001" },
      update: {
        status: InvoiceStatus.DRAFT,
        totalAmount: new Prisma.Decimal(12540),
        lineItems: [
          {
            label: "Window package",
            quantity: 24,
            unitPrice: 522.5,
            total: 12540,
          },
        ],
        documentStatus: InvoiceDocumentStatus.PROCESSING,
        notes: "Pending approval",
      },
      create: {
        id: "00000000-0000-0000-0000-000000000201",
        number: "INV-2025-001",
        customerId: customerIds.aurora,
        projectId: projectIds.aurora,
        status: InvoiceStatus.DRAFT,
        type: InvoiceType.QUOTE,
        currency: "EUR",
        totalAmount: new Prisma.Decimal(12540),
        lineItems: [
          {
            label: "Window package",
            quantity: 24,
            unitPrice: 522.5,
            total: 12540,
          },
        ],
        documentStatus: InvoiceDocumentStatus.PROCESSING,
        notes: "Pending approval",
      },
    }),
    prisma.invoice.upsert({
      where: { number: "INV-2025-002" },
      update: {
        status: InvoiceStatus.SENT,
        totalAmount: new Prisma.Decimal(24180),
        documentStatus: InvoiceDocumentStatus.GENERATED,
        documentUrl: "s3://kozijnen/invoices/INV-2025-002.pdf",
        documentGeneratedAt: new Date("2025-09-18T10:15:00Z"),
        documentMeta: {
          template: "standard",
          renderedBy: "system",
          version: 1,
        },
        integrationState: {
          system: "ExactOnline",
          state: "SYNCED",
          syncedAt: "2025-09-19T08:12:00Z",
        },
        externalReference: "ERP-INV-2025-002",
      },
      create: {
        id: "00000000-0000-0000-0000-000000000202",
        number: "INV-2025-002",
        customerId: customerIds.cityPark,
        projectId: projectIds.cityPark,
        status: InvoiceStatus.SENT,
        type: InvoiceType.INVOICE,
        currency: "EUR",
        totalAmount: new Prisma.Decimal(24180),
        lineItems: [
          {
            label: "Installation batch",
            quantity: 56,
            unitPrice: 432.5,
            total: 24180,
          },
        ],
        documentStatus: InvoiceDocumentStatus.GENERATED,
        documentUrl: "s3://kozijnen/invoices/INV-2025-002.pdf",
        documentGeneratedAt: new Date("2025-09-18T10:15:00Z"),
        documentMeta: {
          template: "standard",
          renderedBy: "system",
          version: 1,
        },
        integrationState: {
          system: "ExactOnline",
          state: "SYNCED",
          syncedAt: "2025-09-19T08:12:00Z",
        },
        externalReference: "ERP-INV-2025-002",
      },
    }),
  ]);

  await Promise.all([
    prisma.paymentLog.upsert({
      where: { id: "00000000-0000-0000-0000-000000000401" },
      update: {
        invoiceId: quoteInvoice.id,
        provider: "Mollie",
        status: "PENDING",
        amount: new Prisma.Decimal(5000),
        currency: "EUR",
        reference: "PAY-2025-001-DEP",
        metadata: { method: "BankTransfer" },
        processedAt: null,
      },
      create: {
        id: "00000000-0000-0000-0000-000000000401",
        invoiceId: quoteInvoice.id,
        provider: "Mollie",
        status: "PENDING",
        amount: new Prisma.Decimal(5000),
        currency: "EUR",
        reference: "PAY-2025-001-DEP",
        metadata: { method: "BankTransfer" },
      },
    }),
    prisma.paymentLog.upsert({
      where: { id: "00000000-0000-0000-0000-000000000402" },
      update: {
        invoiceId: finalInvoice.id,
        provider: "Adyen",
        status: "SETTLED",
        amount: new Prisma.Decimal(24180),
        currency: "EUR",
        reference: "PAY-2025-002-01",
        metadata: { method: "iDEAL", fee: 180.4 },
        processedAt: new Date("2025-09-20T12:00:00Z"),
      },
      create: {
        id: "00000000-0000-0000-0000-000000000402",
        invoiceId: finalInvoice.id,
        provider: "Adyen",
        status: "SETTLED",
        amount: new Prisma.Decimal(24180),
        currency: "EUR",
        reference: "PAY-2025-002-01",
        metadata: { method: "iDEAL", fee: 180.4 },
        processedAt: new Date("2025-09-20T12:00:00Z"),
      },
    }),
  ]);
}

async function upsertInventoryProfiles() {

  const trend = tkProfileTypeLookup["trend"];

  const cube = tkProfileTypeLookup["cube"];

  const classic = tkProfileTypeLookup["classic"];

  if (!trend || !cube || !classic) {

    throw new Error("Missing TK Aalsmeer profile definitions");

  }



  const [trendProfile, cubeProfile, classicProfile, reinforcement] = await Promise.all([

    prisma.inventoryProfile.upsert({

      where: { sku: "PVC-TREND-6400" },

      update: {

        name: `${trend.name} profiel ${PROFILE_STOCK_LENGTHS.trend / 1000} m`,

        profileType: trend.slug,

        lengthMm: PROFILE_STOCK_LENGTHS.trend,

        stockQuantity: 24,

        scrapAllowanceMm: 35,

        metadata: { system: trend.name, minimumStock: 50 },

      },

      create: {

        id: "00000000-0000-0000-0000-000000000701",

        sku: "PVC-TREND-6400",

        name: `${trend.name} profiel ${PROFILE_STOCK_LENGTHS.trend / 1000} m`,

        profileType: trend.slug,

        lengthMm: PROFILE_STOCK_LENGTHS.trend,

        stockQuantity: 24,

        scrapAllowanceMm: 35,

        metadata: { system: trend.name, minimumStock: 50 },

      },

    }),

    prisma.inventoryProfile.upsert({

      where: { sku: "PVC-CUBE-5200" },

      update: {

        name: `${cube.name} profiel ${PROFILE_STOCK_LENGTHS.cube / 1000} m`,

        profileType: cube.slug,

        lengthMm: PROFILE_STOCK_LENGTHS.cube,

        stockQuantity: 30,

        scrapAllowanceMm: 35,

        metadata: { system: cube.name, minimumStock: 40 },

      },

      create: {

        id: "00000000-0000-0000-0000-000000000702",

        sku: "PVC-CUBE-5200",

        name: `${cube.name} profiel ${PROFILE_STOCK_LENGTHS.cube / 1000} m`,

        profileType: cube.slug,

        lengthMm: PROFILE_STOCK_LENGTHS.cube,

        stockQuantity: 30,

        scrapAllowanceMm: 35,

        metadata: { system: cube.name, minimumStock: 40 },

      },

    }),

    prisma.inventoryProfile.upsert({

      where: { sku: "PVC-CLASSIC-6000" },

      update: {

        name: `${classic.name} profiel ${PROFILE_STOCK_LENGTHS.classic / 1000} m`,

        profileType: classic.slug,

        lengthMm: PROFILE_STOCK_LENGTHS.classic,

        stockQuantity: 18,

        scrapAllowanceMm: 30,

        metadata: { system: classic.name, minimumStock: 24 },

      },

      create: {

        id: "00000000-0000-0000-0000-000000000703",

        sku: "PVC-CLASSIC-6000",

        name: `${classic.name} profiel ${PROFILE_STOCK_LENGTHS.classic / 1000} m`,

        profileType: classic.slug,

        lengthMm: PROFILE_STOCK_LENGTHS.classic,

        stockQuantity: 18,

        scrapAllowanceMm: 30,

        metadata: { system: classic.name, minimumStock: 24 },

      },

    }),

    prisma.inventoryProfile.upsert({

      where: { sku: "PVC-3100-REINF" },

      update: {

        name: "Staalversterking 3.1 m",

        profileType: "reinforcement",

        lengthMm: 3100,

        stockQuantity: 48,

        scrapAllowanceMm: 15,

        metadata: null,

      },

      create: {

        id: "00000000-0000-0000-0000-000000000704",

        sku: "PVC-3100-REINF",

        name: "Staalversterking 3.1 m",

        profileType: "reinforcement",

        lengthMm: 3100,

        stockQuantity: 48,

        scrapAllowanceMm: 15,

        metadata: null,

      },

    }),

  ]);



  return {

    trend: trendProfile,

    cube: cubeProfile,

    classic: classicProfile,

    reinforcement,

  };

}



async function upsertCutPlans(
  projectIds: { aurora: string; cityPark: string },
  walls: { auroraNorth: { id: string }; cityParkWest: { id: string } },
  inventoryProfiles: { trend: { id: string }; cube: { id: string } },
) {
  const auroraPlan = await prisma.cutPlan.upsert({
    where: { id: "00000000-0000-0000-0000-000000000801" },
    update: {
      projectId: projectIds.aurora,
      wallId: walls.auroraNorth.id,
      strategy: CutPlanStrategy.GREEDY,
      status: CutPlanStatus.COMPLETED,
      summary: { yield: 0.91, segments: 12 },
    },
    create: {
      id: "00000000-0000-0000-0000-000000000801",
      projectId: projectIds.aurora,
      wallId: walls.auroraNorth.id,
      strategy: CutPlanStrategy.GREEDY,
      status: CutPlanStatus.COMPLETED,
      summary: { yield: 0.91, segments: 12 },
    },
  });

  await prisma.cutPlan.upsert({
    where: { id: "00000000-0000-0000-0000-000000000802" },
    update: {
      projectId: projectIds.cityPark,
      wallId: null,
      strategy: CutPlanStrategy.GREEDY,
      status: CutPlanStatus.PENDING,
      summary: { pendingWalls: [walls.cityParkWest.id] },
    },
    create: {
      id: "00000000-0000-0000-0000-000000000802",
      projectId: projectIds.cityPark,
      wallId: null,
      strategy: CutPlanStrategy.GREEDY,
      status: CutPlanStatus.PENDING,
      summary: { pendingWalls: [walls.cityParkWest.id] },
    },
  });

  await Promise.all([
    prisma.cutPlanItem.upsert({
      where: { id: "00000000-0000-0000-0000-000000000901" },
      update: {
        cutPlanId: auroraPlan.id,
        inventoryProfileId: inventoryProfiles.trend.id,
        sourceLengthMm: PROFILE_STOCK_LENGTHS.trend,
        usedLengthMm: 5980,
        wasteLengthMm: 420,
        segments: { cuts: [1200, 1200, 1400, 1180, 1200] },
      },
      create: {
        id: "00000000-0000-0000-0000-000000000901",
        cutPlanId: auroraPlan.id,
        inventoryProfileId: inventoryProfiles.trend.id,
        sourceLengthMm: PROFILE_STOCK_LENGTHS.trend,
        usedLengthMm: 5980,
        wasteLengthMm: 420,
        segments: { cuts: [1200, 1200, 1400, 1180, 1200] },
      },
    }),
    prisma.cutPlanItem.upsert({
      where: { id: "00000000-0000-0000-0000-000000000902" },
      update: {
        cutPlanId: auroraPlan.id,
        inventoryProfileId: inventoryProfiles.cube.id,
        sourceLengthMm: PROFILE_STOCK_LENGTHS.cube,
        usedLengthMm: 4880,
        wasteLengthMm: 320,
        segments: { cuts: [900, 900, 1100, 980, 1000] },
      },
      create: {
        id: "00000000-0000-0000-0000-000000000902",
        cutPlanId: auroraPlan.id,
        inventoryProfileId: inventoryProfiles.cube.id,
        sourceLengthMm: PROFILE_STOCK_LENGTHS.cube,
        usedLengthMm: 4880,
        wasteLengthMm: 320,
        segments: { cuts: [900, 900, 1100, 980, 1000] },
      },
    }),
  ]);
}

async function main() {
  const [alufast, stadionbouw] = await Promise.all([
    prisma.customer.upsert({
      where: { email: "sales@alufast.nl" },
      update: {
        phone: "+31 20 123 4567",
        address: "Industrieweg 12, Amsterdam",
        contactPerson: "Iris van Dijk",
      },
      create: {
        id: "00000000-0000-0000-0000-000000000011",
        name: "AluFast BV",
        contactPerson: "Iris van Dijk",
        phone: "+31 20 123 4567",
        email: "sales@alufast.nl",
        address: "Industrieweg 12, Amsterdam",
        notes: "Preferred aluminium supplier",
      },
    }),
    prisma.customer.upsert({
      where: { email: "inkoop@stadionbouw.nl" },
      update: {
        phone: "+31 10 765 8899",
        address: "Havenspoor 44, Rotterdam",
        contactPerson: "Mark Jansen",
      },
      create: {
        id: "00000000-0000-0000-0000-000000000012",
        name: "Stadionbouw NV",
        contactPerson: "Mark Jansen",
        phone: "+31 10 765 8899",
        email: "inkoop@stadionbouw.nl",
        address: "Havenspoor 44, Rotterdam",
      },
    }),
  ]);

  const [residenceAurora, cityParkOffices] = await Promise.all([
    prisma.project.upsert({
      where: { id: "00000000-0000-0000-0000-000000000001" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000001",
        name: "Residence Aurora",
        reference: "PRJ-1001",
        status: ProjectStatus.PLANNING,
        customerId: alufast.id,
        startDate: new Date("2025-10-01"),
        description: "24 premium residential frames",
      },
    }),
    prisma.project.upsert({
      where: { id: "00000000-0000-0000-0000-000000000002" },
      update: {},
      create: {
        id: "00000000-0000-0000-0000-000000000002",
        name: "City Park Offices",
        reference: "PRJ-1002",
        status: ProjectStatus.IN_PRODUCTION,
        customerId: stadionbouw.id,
        startDate: new Date("2025-09-15"),
        endDate: new Date("2025-12-20"),
        description: "56 office units with tilt & turn windows",
      },
    }),
  ]);

  const frames = await upsertWindowFrames({ aurora: residenceAurora.id, cityPark: cityParkOffices.id });
  const walls = await upsertWallsAndInstances({ aurora: residenceAurora.id, cityPark: cityParkOffices.id }, frames);
  await upsertInvoices({ aurora: alufast.id, cityPark: stadionbouw.id }, { aurora: residenceAurora.id, cityPark: cityParkOffices.id });

  await Promise.all([
    prisma.inventoryItem.upsert({
      where: { sku: "MAT-TREND-6400" },
      update: {
        quantity: 120,
        location: "Warehouse 1",
        notes: "Inbouwdiepte 120 mm; breedte incl. aanslag 81 mm (montage mét stelkozijn)",
      },
      create: {
        sku: "MAT-TREND-6400",
        name: "Trend profiel 6.4 m",
        category: "Profielen",
        quantity: 120,
        unit: "lengths",
        location: "Warehouse 1",
        minQuantity: 50,
        notes: "Inbouwdiepte 120 mm; breedte incl. aanslag 81 mm (montage mét stelkozijn)",
      },
    }),
    prisma.inventoryItem.upsert({
      where: { sku: "MAT-CUBE-5200" },
      update: {
        quantity: 96,
        location: "Warehouse 1",
        notes: "Inbouwdiepte 120 mm; breedte incl. aanslag 81 mm (montage mét stelkozijn)",
      },
      create: {
        sku: "MAT-CUBE-5200",
        name: "Cube profiel 5.2 m",
        category: "Profielen",
        quantity: 96,
        unit: "lengths",
        location: "Warehouse 1",
        minQuantity: 40,
        notes: "Inbouwdiepte 120 mm; breedte incl. aanslag 81 mm (montage mét stelkozijn)",
      },
    }),
    prisma.inventoryItem.upsert({
      where: { sku: "MAT-CLASSIC-6000" },
      update: {
        quantity: 54,
        location: "Warehouse 2",
        notes: "Inbouwdiepte 76 mm; breedte incl. aanslag 84 mm (montage mét stelkozijn)",
      },
      create: {
        sku: "MAT-CLASSIC-6000",
        name: "Classic profiel 6.0 m",
        category: "Profielen",
        quantity: 54,
        unit: "lengths",
        location: "Warehouse 2",
        minQuantity: 24,
        notes: "Inbouwdiepte 76 mm; breedte incl. aanslag 84 mm (montage mét stelkozijn)",
      },
    }),
    prisma.inventoryItem.upsert({
      where: { sku: "MAT-HARDWARE-TILT" },
      update: {
        quantity: 90,
        location: "Assembly",
      },
      create: {
        sku: "MAT-HARDWARE-TILT",
        name: "Draai-kiep beslagset",
        category: "Raam- en deurbeslag",
        quantity: 90,
        unit: "sets",
        location: "Assembly",
        minQuantity: 40,
        notes: "Compleet voor Trend en Cube profielen.",
      },
    }),
    prisma.inventoryItem.upsert({
      where: { sku: "MAT-VENT-400" },
      update: {
        quantity: 60,
        location: "Warehouse 2",
      },
      create: {
        sku: "MAT-VENT-400",
        name: "Ventilatierooster 400 mm",
        category: "Ventilatieroosters",
        quantity: 60,
        unit: "pieces",
        location: "Warehouse 2",
        minQuantity: 30,
        notes: "Voor luchtaanvoer in alle profielseries.",
      },
    }),
    prisma.inventoryItem.upsert({
      where: { sku: "MAT-HOR-SET" },
      update: {
        quantity: 45,
        location: "Assembly",
      },
      create: {
        sku: "MAT-HOR-SET",
        name: "Inzethor op maat",
        category: "Horren",
        quantity: 45,
        unit: "sets",
        location: "Assembly",
        minQuantity: 20,
        notes: "Levertijd afgestemd op kozijnkleur.",
      },
    }),
  ]);

  const inventoryProfiles = await upsertInventoryProfiles();
  await upsertCutPlans(
    { aurora: residenceAurora.id, cityPark: cityParkOffices.id },
    { auroraNorth: walls.auroraNorth, cityParkWest: walls.cityParkWest },
    { trend: inventoryProfiles.trend, cube: inventoryProfiles.cube },
  );
}

main()
  .catch((error) => {
    console.error("Failed to seed database", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



