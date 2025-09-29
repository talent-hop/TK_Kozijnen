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

const prisma = new PrismaClient();

async function upsertWindowFrames(projectIds: { aurora: string; cityPark: string }) {
  const [livingRoom, office] = await Promise.all([
    prisma.windowFrame.upsert({
      where: { id: "00000000-0000-0000-0000-000000000101" },
      update: {
        costProfiles: new Prisma.Decimal(320),
        costGlazing: new Prisma.Decimal(220),
        costHardware: new Prisma.Decimal(150),
        unitPrice: new Prisma.Decimal(785),
      },
      create: {
        id: "00000000-0000-0000-0000-000000000101",
        projectId: projectIds.aurora,
        label: "Living room - Hinged",
        status: "Awaiting glass",
        widthMm: 1200,
        heightMm: 1400,
        materials: {
          frame: "uPVC Profile A",
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
      },
      create: {
        id: "00000000-0000-0000-0000-000000000102",
        projectId: projectIds.cityPark,
        label: "Kitchen - Tilt & Turn",
        status: "Ready for assembly",
        widthMm: 900,
        heightMm: 1100,
        materials: {
          frame: "uPVC Profile B",
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
  const [pvc6400, pvc5200, reinforcement] = await Promise.all([
    prisma.inventoryProfile.upsert({
      where: { sku: "PVC-6400-A" },
      update: {
        name: "uPVC Stock Length 6.4m",
        profileType: "Frame-A",
        lengthMm: 6400,
        stockQuantity: 24,
        scrapAllowanceMm: 35,
        metadata: { color: "traffic white" },
      },
      create: {
        id: "00000000-0000-0000-0000-000000000701",
        sku: "PVC-6400-A",
        name: "uPVC Stock Length 6.4m",
        profileType: "Frame-A",
        lengthMm: 6400,
        stockQuantity: 24,
        scrapAllowanceMm: 35,
        metadata: { color: "traffic white" },
      },
    }),
    prisma.inventoryProfile.upsert({
      where: { sku: "PVC-5200-B" },
      update: {
        name: "uPVC Stock Length 5.2m",
        profileType: "Frame-B",
        lengthMm: 5200,
        stockQuantity: 30,
        scrapAllowanceMm: 35,
        metadata: { color: "anthracite" },
      },
      create: {
        id: "00000000-0000-0000-0000-000000000702",
        sku: "PVC-5200-B",
        name: "uPVC Stock Length 5.2m",
        profileType: "Frame-B",
        lengthMm: 5200,
        stockQuantity: 30,
        scrapAllowanceMm: 35,
        metadata: { color: "anthracite" },
      },
    }),
    prisma.inventoryProfile.upsert({
      where: { sku: "PVC-3100-H" },
      update: {
        name: "Hardware reinforcement bar 3.1m",
        profileType: "Reinforcement",
        lengthMm: 3100,
        stockQuantity: 48,
        scrapAllowanceMm: 15,
        metadata: null,
      },
      create: {
        id: "00000000-0000-0000-0000-000000000703",
        sku: "PVC-3100-H",
        name: "Hardware reinforcement bar 3.1m",
        profileType: "Reinforcement",
        lengthMm: 3100,
        stockQuantity: 48,
        scrapAllowanceMm: 15,
        metadata: null,
      },
    }),
  ]);

  return {
    pvc6400,
    pvc5200,
    reinforcement,
  };
}

async function upsertCutPlans(
  projectIds: { aurora: string; cityPark: string },
  walls: { auroraNorth: { id: string }; cityParkWest: { id: string } },
  inventoryProfiles: { pvc6400: { id: string }; pvc5200: { id: string } },
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
        inventoryProfileId: inventoryProfiles.pvc6400.id,
        sourceLengthMm: 6400,
        usedLengthMm: 5980,
        wasteLengthMm: 420,
        segments: { cuts: [1200, 1200, 1400, 1180, 1200] },
      },
      create: {
        id: "00000000-0000-0000-0000-000000000901",
        cutPlanId: auroraPlan.id,
        inventoryProfileId: inventoryProfiles.pvc6400.id,
        sourceLengthMm: 6400,
        usedLengthMm: 5980,
        wasteLengthMm: 420,
        segments: { cuts: [1200, 1200, 1400, 1180, 1200] },
      },
    }),
    prisma.cutPlanItem.upsert({
      where: { id: "00000000-0000-0000-0000-000000000902" },
      update: {
        cutPlanId: auroraPlan.id,
        inventoryProfileId: inventoryProfiles.pvc5200.id,
        sourceLengthMm: 5200,
        usedLengthMm: 4880,
        wasteLengthMm: 320,
        segments: { cuts: [900, 900, 1100, 980, 1000] },
      },
      create: {
        id: "00000000-0000-0000-0000-000000000902",
        cutPlanId: auroraPlan.id,
        inventoryProfileId: inventoryProfiles.pvc5200.id,
        sourceLengthMm: 5200,
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
      where: { sku: "MAT-001" },
      update: {
        quantity: 120,
        location: "Warehouse 1",
      },
      create: {
        sku: "MAT-001",
        name: "uPVC Profile A",
        category: "Frame",
        quantity: 120,
        unit: "lengths",
        location: "Warehouse 1",
        minQuantity: 50,
      },
    }),
    prisma.inventoryItem.upsert({
      where: { sku: "MAT-002" },
      update: {
        quantity: 85,
        location: "Assembly",
      },
      create: {
        sku: "MAT-002",
        name: "Multi-point Lock",
        category: "Hardware",
        quantity: 85,
        unit: "sets",
        location: "Assembly",
        minQuantity: 40,
      },
    }),
    prisma.inventoryItem.upsert({
      where: { sku: "MAT-003" },
      update: {
        quantity: 48,
        location: "Glass Storage",
      },
      create: {
        sku: "MAT-003",
        name: "HR++ Glass Panel",
        category: "Glazing",
        quantity: 48,
        unit: "panels",
        location: "Glass Storage",
        minQuantity: 30,
      },
    }),
  ]);

  const inventoryProfiles = await upsertInventoryProfiles();
  await upsertCutPlans(
    { aurora: residenceAurora.id, cityPark: cityParkOffices.id },
    { auroraNorth: walls.auroraNorth, cityParkWest: walls.cityParkWest },
    { pvc6400: inventoryProfiles.pvc6400, pvc5200: inventoryProfiles.pvc5200 },
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