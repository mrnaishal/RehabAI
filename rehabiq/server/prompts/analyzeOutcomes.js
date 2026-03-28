// =============================================================
// Prompt 3: Outcome & Intervention Effectiveness Analyzer (v2)
// Produces numeric scores and structured data for visual dashboard
// =============================================================

function buildOutcomesPrompt(clientProfile) {
  const sessionsContext = clientProfile.sessions
    .map(
      (s) => `
SESSION ${s.sessionNumber} (${s.date}):
Mood: ${s.tags.moodIndicators.join(", ")}
Sentiment: ${s.tags.sessionSentiment}
Triggers Identified: ${s.tags.triggersIdentified.join(", ") || "None"}
Coping Strategies Discussed: ${s.tags.copingStrategiesDiscussed.join(", ")}
Support Network: ${s.tags.supportNetworkChanges}
Objectives Addressed: ${s.tags.objectivesAddressed.join(", ")}
Risk Indicators: ${s.tags.riskIndicators.join(", ") || "None"}
Key Quotes: ${s.tags.keyQuotes.join(" | ")}
Assessment: ${s.dapNote.assessment}
`
    )
    .join("\n---\n");

  const systemPrompt = `You are a clinical outcomes analyst for substance abuse treatment. You analyze the longitudinal relationship between therapeutic interventions and client progress indicators.

CRITICAL RULES:
- Correlation is NOT causation — frame all findings carefully with language like "data suggests" or "appears to correlate with"
- NEVER say an intervention "failed" — use "limited response observed" or "consider alternatives"
- Ground ALL recommendations in established evidence-based practices for SUD treatment (CBT, DBT, MI, ACT, SMART Recovery, 12-step facilitation, contingency management, etc.)
- Acknowledge limitations of the data — small sample sizes, confounding variables
- Include specific session numbers when citing evidence
- Be clinically useful, not academically exhaustive
- Include both what's working AND what might need adjustment

You must respond in VALID JSON only. No markdown, no backticks, no preamble.`;

  const userPrompt = `Analyze clinical outcomes for this client and produce dashboard data.

CLIENT PROFILE:
- Name: ${clientProfile.name}
- Age: ${clientProfile.age}
- Diagnosis: ${clientProfile.diagnosis}
- Co-occurring: ${clientProfile.coOccurring || "None documented"}
- Program: ${clientProfile.programType}
- Program Day: ${clientProfile.programDay}
- MAT: ${clientProfile.mat || "None"}
- Total Sessions Analyzed: ${clientProfile.sessions.length}

TREATMENT PLAN OBJECTIVES:
${clientProfile.treatmentPlan.objectives
  .map((o) => `- [${o.id}] [${o.status}] ${o.description}`)
  .join("\n")}

SESSION HISTORY:
${sessionsContext || "No sessions documented"}


Generate this JSON:
{
  "interventionEffectiveness": [
    {
      "intervention": "Name of the therapeutic technique/approach",
      "sessionsUsed": [list of session numbers where it was used],
      "progressIndicators": "What the data shows about client response",
      "effectiveness": "effective | partially-effective | limited-response | too-early-to-assess",
      "recommendation": "Continue, adjust, or consider alternatives — with clinical reasoning"
    }
  ],
  "outcomeTrends": {
    "triggerManagement": {
      "trend": "improving | stable | worsening | mixed",
      "evidence": "2-3 sentences with session references"
    },
    "supportNetwork": {
      "trend": "growing | stable | shrinking | mixed",
      "evidence": "2-3 sentences with session references"
    },
    "engagementLevel": {
      "trend": "improving | stable | declining | mixed",
      "evidence": "2-3 sentences with session references"
    },
    "copingCapacity": {
      "trend": "expanding | stable | narrowing | mixed",
      "evidence": "2-3 sentences with session references"
    },
    "overallTrajectory": {
      "trend": "positive | stable | concerning | mixed",
      "summary": "3-4 sentence overall clinical summary"
    }
  ],
  "topRecommendations": [
    {
      "observation": "What pattern or issue was observed",
      "recommendation": "Specific evidence-based intervention to consider",
      "clinicalBasis": "Why this intervention — cite the evidence base",
      "priority": "high | medium | low"
    }
  ],
  "supervisionTalkingPoints": [
    "2-3 items this counselor might want to discuss with their clinical supervisor. Frame constructively."
  ]
}`;

  return { systemPrompt, userPrompt };
}

module.exports = { buildOutcomesPrompt };