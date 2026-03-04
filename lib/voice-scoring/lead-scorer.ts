import { loadConversationConfig } from "@/lib/elevenlabs/config-builder";

export interface QualificationData {
  interest_area?: string;
  experience_level?: string;
  budget_readiness?: string;
  timeline?: string;
  decision_authority?: string;
  engagement?: string;
}

export interface ScoringResult {
  score: number;
  grade: "A" | "B" | "C";
  breakdown: Record<string, { value: string; points: number; weight: number }>;
}

const LEVEL_SCORES: Record<string, number> = {
  high: 100,
  medium: 60,
  low: 20,
};

/**
 * Calculates a weighted lead score (0-100) based on qualification criteria
 * defined in conversation.yaml → lead_qualification.criteria
 *
 * Criteria (Numerologie-PRO):
 *  - interest_area (25%) — Specific problem vs. general curiosity
 *  - experience_level (15%) — Prior numerology experience
 *  - budget_readiness (25%) — Ready for paid consultation vs. free only
 *  - timeline (20%) — Want to start now vs. no timeline
 *  - decision_authority (10%) — Decides alone vs. needs to check
 *  - engagement (5%) — Very engaged vs. disinterested in call
 */
export function scoreLeadFromQualification(
  data: QualificationData
): ScoringResult {
  const config = loadConversationConfig();

  // Use lead_qualification.criteria from conversation.yaml
  const criteria = config.lead_qualification?.criteria || config.qualification_criteria || [];
  const thresholds = config.lead_qualification?.scoring || config.scoring;

  let totalScore = 0;
  const breakdown: ScoringResult["breakdown"] = {};

  for (const criterion of criteria) {
    const value = data[criterion.name as keyof QualificationData] || "low";
    const normalizedValue = value.toLowerCase().trim();

    const levelScore = LEVEL_SCORES[normalizedValue] ?? LEVEL_SCORES.low;
    const weightedScore = (levelScore * criterion.weight) / 100;

    breakdown[criterion.name] = {
      value: normalizedValue,
      points: Math.round(weightedScore),
      weight: criterion.weight,
    };

    totalScore += weightedScore;
  }

  const finalScore = Math.round(totalScore);

  let grade: "A" | "B" | "C";
  if (finalScore >= (thresholds?.grade_a ?? 70)) {
    grade = "A";
  } else if (finalScore >= (thresholds?.grade_b ?? 40)) {
    grade = "B";
  } else {
    grade = "C";
  }

  return { score: finalScore, grade, breakdown };
}
