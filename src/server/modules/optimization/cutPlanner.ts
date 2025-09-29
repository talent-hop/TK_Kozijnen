export interface StockProfile {
  id: string;
  lengthMm: number;
  scrapAllowanceMm: number;
  stockQuantity: number | null;
  profileType?: string | null;
}

export interface CutRequirement {
  lengthMm: number;
  quantity: number;
  profileId?: string;
  profileType?: string;
}

export interface CutPlanComputationItem {
  profileId: string;
  sourceLengthMm: number;
  usedLengthMm: number;
  wasteLengthMm: number;
  segments: number[];
}

export interface CutPlanComputationSummary {
  strategyRequested: "GREEDY" | "ILP";
  strategyUsed: "GREEDY" | "ILP";
  totalSourceLengthMm: number;
  totalUsedLengthMm: number;
  totalWasteLengthMm: number;
  yield: number;
  stocksUsed: number;
  requirementCount: number;
}

export interface CutPlanComputation {
  items: CutPlanComputationItem[];
  summary: CutPlanComputationSummary;
}

interface WorkingStock {
  segments: number[];
  usedLength: number;
  remaining: number;
}

interface WorkingProfile {
  profile: StockProfile;
  stocks: WorkingStock[];
  stocksAvailable: number;
}

export function generateCutPlan(
  strategy: "GREEDY" | "ILP",
  profiles: StockProfile[],
  requirements: CutRequirement[],
): CutPlanComputation {
  const expandedRequirements = expandRequirements(requirements);
  const sortedProfiles = [...profiles].sort((a, b) => b.lengthMm - a.lengthMm);
  const workingProfiles = new Map<string, WorkingProfile>();

  sortedProfiles.forEach((profile) => {
    workingProfiles.set(profile.id, {
      profile,
      stocks: [],
      stocksAvailable: profile.stockQuantity && profile.stockQuantity > 0 ? profile.stockQuantity : Number.POSITIVE_INFINITY,
    });
  });

  const resolvedStrategy = strategy === "ILP" ? "GREEDY" : "GREEDY";

  for (const requirement of expandedRequirements) {
    const targetProfiles = pickProfilesForRequirement(requirement, sortedProfiles);
    let placed = false;

    for (const candidate of targetProfiles) {
      const entry = workingProfiles.get(candidate.id);
      if (!entry) {
        continue;
      }

      const allocation = tryAllocateRequirement(entry, requirement.lengthMm);
      if (allocation) {
        placed = true;
        break;
      }
    }

    if (!placed) {
      throw new Error(
        `Insufficient inventory to allocate length ${requirement.lengthMm}mm (profile preference: ${requirement.profileId ?? requirement.profileType ?? "any"}).`,
      );
    }
  }

  const items: CutPlanComputationItem[] = [];
  let totalSourceLengthMm = 0;
  let totalUsedLengthMm = 0;

  workingProfiles.forEach(({ profile, stocks }) => {
    stocks.forEach((stock) => {
      const sourceLength = profile.lengthMm;
      const waste = Math.max(sourceLength - stock.usedLength, 0);
      totalSourceLengthMm += sourceLength;
      totalUsedLengthMm += stock.usedLength;
      items.push({
        profileId: profile.id,
        sourceLengthMm: sourceLength,
        usedLengthMm: stock.usedLength,
        wasteLengthMm: waste,
        segments: stock.segments,
      });
    });
  });

  const totalWasteLengthMm = Math.max(totalSourceLengthMm - totalUsedLengthMm, 0);
  const yieldValue = totalSourceLengthMm === 0 ? 1 : (totalSourceLengthMm - totalWasteLengthMm) / totalSourceLengthMm;

  return {
    items,
    summary: {
      strategyRequested: strategy,
      strategyUsed: resolvedStrategy,
      totalSourceLengthMm,
      totalUsedLengthMm,
      totalWasteLengthMm,
      yield: Number.isFinite(yieldValue) ? Number(yieldValue.toFixed(4)) : 1,
      stocksUsed: items.length,
      requirementCount: expandedRequirements.length,
    },
  };
}

function expandRequirements(requirements: CutRequirement[]) {
  const expanded: Array<{ lengthMm: number; profileId?: string; profileType?: string }> = [];
  requirements.forEach((requirement) => {
    const qty = requirement.quantity > 0 ? requirement.quantity : 1;
    for (let index = 0; index < qty; index += 1) {
      expanded.push({
        lengthMm: requirement.lengthMm,
        profileId: requirement.profileId,
        profileType: requirement.profileType,
      });
    }
  });

  expanded.sort((a, b) => b.lengthMm - a.lengthMm);
  return expanded;
}

function pickProfilesForRequirement(requirement: { lengthMm: number; profileId?: string; profileType?: string }, profiles: StockProfile[]) {
  if (requirement.profileId) {
    return profiles.filter((profile) => profile.id === requirement.profileId);
  }

  if (requirement.profileType) {
    const matching = profiles.filter((profile) => profile.profileType === requirement.profileType);
    if (matching.length > 0) {
      return matching;
    }
  }

  return profiles;
}

function tryAllocateRequirement(entry: WorkingProfile, lengthMm: number) {
  const scrapAllowance = entry.profile.scrapAllowanceMm || 0;

  for (const stock of entry.stocks) {
    if (stock.remaining >= lengthMm) {
      stock.segments.push(lengthMm);
      stock.usedLength += lengthMm;
      stock.remaining -= lengthMm;
      return stock;
    }
  }

  if (entry.stocksAvailable <= entry.stocks.length) {
    return null;
  }

  if (entry.profile.lengthMm < lengthMm) {
    return null;
  }

  const remaining = entry.profile.lengthMm - lengthMm - scrapAllowance;
  const stock: WorkingStock = {
    segments: [lengthMm],
    usedLength: lengthMm,
    remaining: remaining > 0 ? remaining : 0,
  };

  entry.stocks.push(stock);
  return stock;
}