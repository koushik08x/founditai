import { ItemReport, ItemMatch, MatchExplanation, MatchBreakdown } from '../types';

// Normalized dictionary of common synonyms in campus lost & found
const SYNONYM_GROUPS: string[][] = [
  ['bottle', 'flask', 'tumbler', 'hydroflask', 'sipper', 'thermos', 'mug'],
  ['notebook', 'notepad', 'journal', 'diary', 'book', 'binder', 'notes'],
  ['id', 'card', 'badge', 'pass', 'license', 'campus card', 'student id', 'rfid'],
  ['laptop', 'macbook', 'thinkpad', 'dell', 'computer', 'notebook computer', 'chromebook'],
  ['phone', 'iphone', 'smartphone', 'mobile', 'android', 'cell'],
  ['airpods', 'earphones', 'earbuds', 'headphones', 'headset', 'audio'],
  ['wallet', 'purse', 'billfold', 'pouch', 'money clip'],
  ['backpack', 'bag', 'knapsack', 'rucksack', 'satchel', 'tote'],
  ['keys', 'keychain', 'car key', 'fob', 'key ring'],
  ['glasses', 'spectacles', 'sunglasses', 'shades', 'eyewear'],
  ['jacket', 'hoodie', 'sweater', 'coat', 'sweatshirt', 'fleece', 'cardigan'],
  ['umbrella', 'parasol', 'rain gear'],
  ['calculator', 'scientific calculator', 'ti-84', 'casio'],
  ['charger', 'cable', 'adapter', 'power brick', 'usb-c', 'lightning']
];

// Campus zones for spatial proximity modeling
const LOCATION_ZONES: Record<string, string[]> = {
  academic: [
    'Main Library',
    'Science Quad & Labs',
    'Engineering Hall',
    'North Lecture Theatres',
    'Reading Room',
    'Classroom Block',
    'Study Hall'
  ],
  student_life: [
    'Student Activity Center',
    'Campus Cafeteria & Food Court',
    'Campus Green / Central Lawn',
    'Student Union',
    'Dining Hall'
  ],
  residential: [
    'East Residential Hall',
    'West Residential Hall',
    'Dorms',
    'Hostel'
  ],
  athletics: [
    'University Sports Arena',
    'Sports Complex',
    'Gym',
    'Stadium',
    'Sports Ground',
    'Athletic Field'
  ],
  transit_admin: [
    'Administration & Registrar Building',
    'Bus Transit Terminal',
    'Main Gate',
    'Parking Lot'
  ]
};

// Text normalization helper
export function normalizeText(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Tokenize text into set of clean words
export function tokenize(str: string | null | undefined): Set<string> {
  const norm = normalizeText(str);
  if (!norm) return new Set();
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'my', 'i', 'was', 'is', 'it', 'near', 'by', 'outside', 'inside', 'lost', 'found']);
  const tokens = norm.split(' ').filter(word => word.length > 1 && !stopWords.has(word));
  return new Set(tokens);
}

// Check if two tokens are synonymous or sub-tokens
export function areTokensRelated(t1: string, t2: string): boolean {
  if (t1 === t2) return true;
  if (t1.includes(t2) || t2.includes(t1)) return true;

  for (const group of SYNONYM_GROUPS) {
    const hasT1 = group.some(g => g.includes(t1) || t1.includes(g));
    const hasT2 = group.some(g => g.includes(t2) || t2.includes(g));
    if (hasT1 && hasT2) return true;
  }
  return false;
}

// Jaccard similarity with synonym expansion
export function calculateSemanticOverlap(textA: string, textB: string): number {
  const tokensA = Array.from(tokenize(textA));
  const tokensB = Array.from(tokenize(textB));

  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  let matches = 0;
  for (const a of tokensA) {
    if (tokensB.some(b => areTokensRelated(a, b))) {
      matches += 1;
    }
  }

  const denominator = Math.max(tokensA.length, tokensB.length);
  return Math.min(1, matches / denominator);
}

// Compute location proximity between 0 and 1
export function calculateLocationScore(locA: string, locB: string): { score: number; zoneMatch: boolean; exactMatch: boolean } {
  const normA = normalizeText(locA);
  const normB = normalizeText(locB);

  if (!normA || !normB) return { score: 0.2, zoneMatch: false, exactMatch: false };

  // Exact or containment match (e.g. "Library" and "Library Reading Room")
  if (normA === normB || normA.includes(normB) || normB.includes(normA)) {
    return { score: 1.0, zoneMatch: true, exactMatch: true };
  }

  // Zone cluster match
  let sharedZone = false;
  for (const zone of Object.values(LOCATION_ZONES)) {
    const inZoneA = zone.some(z => normA.includes(normalizeText(z)) || normalizeText(z).includes(normA));
    const inZoneB = zone.some(z => normB.includes(normalizeText(z)) || normalizeText(z).includes(normB));
    if (inZoneA && inZoneB) {
      sharedZone = true;
      break;
    }
  }

  if (sharedZone) {
    return { score: 0.75, zoneMatch: true, exactMatch: false };
  }

  // Check token overlap
  const tokensA = tokenize(locA);
  const tokensB = tokenize(locB);
  let tokenMatch = false;
  for (const tA of tokensA) {
    if (tokensB.has(tA)) {
      tokenMatch = true;
      break;
    }
  }

  if (tokenMatch) {
    return { score: 0.6, zoneMatch: false, exactMatch: false };
  }

  return { score: 0.1, zoneMatch: false, exactMatch: false };
}

// Compute color similarity and contradiction detection
export function evaluateColors(
  colorA: string | null | undefined,
  colorB: string | null | undefined
): { score: number; isMatch: boolean; isContradiction: boolean; isUncertain: boolean } {
  const normA = normalizeText(colorA);
  const normB = normalizeText(colorB);

  if (!normA || !normB) {
    return { score: 0.4, isMatch: false, isContradiction: false, isUncertain: true };
  }

  if (normA === normB || normA.includes(normB) || normB.includes(normA)) {
    return { score: 1.0, isMatch: true, isContradiction: false, isUncertain: false };
  }

  // Common distinct primary colors
  const primaryColors = ['black', 'white', 'blue', 'red', 'green', 'yellow', 'silver', 'grey', 'gray', 'pink', 'purple', 'brown', 'gold', 'orange'];
  const hasColorA = primaryColors.filter(c => normA.includes(c));
  const hasColorB = primaryColors.filter(c => normB.includes(c));

  if (hasColorA.length > 0 && hasColorB.length > 0) {
    const common = hasColorA.filter(c => hasColorB.includes(c));
    if (common.length > 0) {
      return { score: 1.0, isMatch: true, isContradiction: false, isUncertain: false };
    }
    // Meaningful contradiction (e.g. black vs silver or red vs blue)
    return { score: 0.0, isMatch: false, isContradiction: true, isUncertain: false };
  }

  return { score: 0.3, isMatch: false, isContradiction: false, isUncertain: true };
}

// Compute date proximity (Lost date vs Found date)
export function evaluateDates(lostDateStr: string, foundDateStr: string): { score: number; daysDifference: number; isChronological: boolean } {
  const lostDate = new Date(lostDateStr);
  const foundDate = new Date(foundDateStr);

  const diffTime = foundDate.getTime() - lostDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  // Found item before it was reported lost by more than 1 day is suspicious
  if (diffDays < -1) {
    return { score: 0.1, daysDifference: diffDays, isChronological: false };
  }

  // Found on the same day or within 3 days: ideal candidate
  if (diffDays >= -1 && diffDays <= 3) {
    return { score: 1.0, daysDifference: Math.abs(diffDays), isChronological: true };
  }

  if (diffDays <= 7) {
    return { score: 0.8, daysDifference: diffDays, isChronological: true };
  }

  if (diffDays <= 14) {
    return { score: 0.55, daysDifference: diffDays, isChronological: true };
  }

  if (diffDays <= 30) {
    return { score: 0.35, daysDifference: diffDays, isChronological: true };
  }

  return { score: 0.15, daysDifference: diffDays, isChronological: true };
}

// Compare Category
export function evaluateCategories(catA: string, catB: string): { score: number; isMatch: boolean } {
  if (catA.toLowerCase() === catB.toLowerCase()) {
    return { score: 1.0, isMatch: true };
  }

  // Check if categories overlap in tokens (e.g. "Electronics & Gadgets" vs "Other")
  const overlap = calculateSemanticOverlap(catA, catB);
  if (overlap > 0.3) {
    return { score: 0.6, isMatch: false };
  }

  return { score: 0.1, isMatch: false };
}

/**
 * Main transparent matching algorithm between a lost report and a found report
 */
export function calculateMatchScore(lost: ItemReport, found: ItemReport): {
  score: number;
  explanation: MatchExplanation;
} {
  // Defensive check: ensure lost vs found
  if (lost.report_type !== 'lost' || found.report_type !== 'found') {
    throw new Error(`Invalid comparison: Expected lost vs found, received ${lost.report_type} vs ${found.report_type}`);
  }

  const sharedAttributes: string[] = [];
  const conflictingAttributes: string[] = [];
  const uncertainAttributes: string[] = [];

  // 1. Name & Category (30%)
  const catEval = evaluateCategories(lost.category, found.category);
  const nameOverlap = calculateSemanticOverlap(lost.item_name, found.item_name);
  const nameAndCatNormalized = Math.min(1, (catEval.score * 0.45) + (nameOverlap * 0.55));
  const nameAndCategoryScore = Math.round(nameAndCatNormalized * 30);

  if (catEval.isMatch) {
    sharedAttributes.push(`Same category: ${lost.category}`);
  } else if (catEval.score > 0.4) {
    sharedAttributes.push(`Related category: ${lost.category} ~ ${found.category}`);
  } else {
    conflictingAttributes.push(`Different categories (${lost.category} vs ${found.category})`);
  }

  if (nameOverlap >= 0.5) {
    sharedAttributes.push(`Matching item terms: "${lost.item_name}" & "${found.item_name}"`);
  } else if (nameOverlap > 0) {
    sharedAttributes.push(`Partial item naming overlap`);
  }

  // 2. Description & Distinguishing details (25%)
  const fullDescLost = `${lost.description} ${lost.distinguishing_details || ''}`;
  const fullDescFound = `${found.description} ${found.distinguishing_details || ''}`;
  const descOverlap = calculateSemanticOverlap(fullDescLost, fullDescFound);
  const descriptionScore = Math.round(descOverlap * 25);

  if (descOverlap >= 0.4) {
    sharedAttributes.push(`Strong descriptive keyword overlap`);
  } else if (descOverlap > 0.15) {
    sharedAttributes.push(`Related descriptive context`);
  } else {
    uncertainAttributes.push(`Limited description overlap`);
  }

  // 3. Color (15%)
  const colorEval = evaluateColors(lost.color, found.color);
  const colorScore = Math.round(colorEval.score * 15);

  if (colorEval.isMatch) {
    sharedAttributes.push(`Consistent color profile: ${lost.color || found.color}`);
  } else if (colorEval.isContradiction) {
    conflictingAttributes.push(`Color contradiction: Lost "${lost.color}" vs Found "${found.color}"`);
  } else if (colorEval.isUncertain) {
    uncertainAttributes.push('Color unverified or not specified in one of the reports');
  }

  // 4. Location (20%)
  const locEval = calculateLocationScore(lost.campus_location, found.campus_location);
  const locationScore = Math.round(locEval.score * 20);

  if (locEval.exactMatch) {
    sharedAttributes.push(`Identical campus location: ${lost.campus_location}`);
  } else if (locEval.zoneMatch) {
    sharedAttributes.push(`Proximity zone match (${lost.campus_location} & ${found.campus_location})`);
  } else {
    conflictingAttributes.push(`Distant campus locations (${lost.campus_location} vs ${found.campus_location})`);
  }

  // 5. Date Proximity (10%)
  const dateEval = evaluateDates(lost.event_date, found.event_date);
  const dateScore = Math.round(dateEval.score * 10);

  if (dateEval.isChronological && dateEval.daysDifference <= 3) {
    sharedAttributes.push(`Close timeline: within ${dateEval.daysDifference} day(s)`);
  } else if (dateEval.isChronological && dateEval.daysDifference <= 10) {
    sharedAttributes.push(`Plausible timeline: within ${dateEval.daysDifference} days`);
  } else if (!dateEval.isChronological) {
    conflictingAttributes.push(`Chronological discrepancy: Item found before reported lost date`);
  } else {
    uncertainAttributes.push(`Wide date gap (${dateEval.daysDifference} days apart)`);
  }

  // Aggregate raw score (0 - 100)
  let rawScore = nameAndCategoryScore + descriptionScore + colorScore + locationScore + dateScore;

  // Penalize meaningful contradictions (e.g. sharp color or category contradiction)
  if (colorEval.isContradiction) {
    rawScore = Math.max(5, rawScore - 20);
  }
  if (!dateEval.isChronological) {
    rawScore = Math.max(5, rawScore - 15);
  }
  if (!catEval.isMatch && catEval.score < 0.2 && nameOverlap < 0.2) {
    rawScore = Math.min(25, rawScore);
  }

  const finalScore = Math.min(100, Math.max(0, rawScore));

  let confidenceTier: MatchExplanation['confidenceTier'] = 'Unlikely';
  if (finalScore >= 75) {
    confidenceTier = 'High Probability';
  } else if (finalScore >= 55) {
    confidenceTier = 'Moderate Probability';
  } else if (finalScore >= 35) {
    confidenceTier = 'Low / Plausible';
  }

  const breakdown: MatchBreakdown = {
    nameAndCategoryScore,
    descriptionScore,
    colorScore,
    locationScore,
    dateScore
  };

  const summary = `Calculated ${finalScore}% match score using transparent weighted heuristic attributes. ` +
    `Found ${sharedAttributes.length} shared characteristic(s), ${conflictingAttributes.length} potential conflict(s), and ${uncertainAttributes.length} uncertain attribute(s).`;

  return {
    score: finalScore,
    explanation: {
      breakdown,
      sharedAttributes,
      conflictingAttributes,
      uncertainAttributes,
      summary,
      confidenceTier
    }
  };
}

/**
 * Scan active reports and generate candidate matches
 */
export function computeAllCandidateMatches(
  reports: ItemReport[],
  minThreshold: number = 30
): ItemMatch[] {
  const activeReports = reports.filter(r => r.status === 'active');
  const lostReports = activeReports.filter(r => r.report_type === 'lost');
  const foundReports = activeReports.filter(r => r.report_type === 'found');

  const matches: ItemMatch[] = [];

  for (const lost of lostReports) {
    for (const found of foundReports) {
      if (lost.id === found.id) continue;

      const { score, explanation } = calculateMatchScore(lost, found);

      if (score >= minThreshold) {
        matches.push({
          id: `match-${lost.id.slice(0, 8)}-${found.id.slice(0, 8)}`,
          lost_report_id: lost.id,
          found_report_id: found.id,
          score,
          explanation,
          matching_method: 'rule-based',
          status: 'suggested',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          lost_report: lost,
          found_report: found
        });
      }
    }
  }

  // Sort by highest match score first
  return matches.sort((a, b) => b.score - a.score);
}
