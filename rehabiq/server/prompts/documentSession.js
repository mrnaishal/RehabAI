// =============================================================
// Prompt 1: Session Documentation Engine
// Transforms rough counselor notes into structured DAP notes
// with clinical tags and follow-up flags
// =============================================================

function buildDocumentationPrompt(clientProfile = {}, rawNotes = "", sessionNumber = "Unknown") {
  const objectives = Array.isArray(clientProfile?.treatmentPlan?.objectives)
    ? clientProfile.treatmentPlan.objectives
    : [];

  const safe = (value, fallback) =>
    value === null || value === undefined || value === "" ? fallback : value;

  const systemPrompt = `You are a clinical documentation assistant for substance abuse rehabilitation counselors. Your job is to transform rough, informal session notes into properly structured clinical documentation.

You write in a professional clinical voice appropriate for medical records. You are thorough but concise. You NEVER diagnose — you only note observations and patterns. You flag safety concerns prominently.

IMPORTANT RULES:
- Use the counselor's perspective and refer to the client consistently as "client"
- If information is ambiguous, write "counselor to clarify" rather than assuming
- Flag ANY safety concerns, including SI/HI, relapse risk, and immediate safety issues, in follow-up flags using "PRIORITY:" or "URGENT:" when appropriate
- Clinical tags must be specific and actionable, not vague
- The DAP note should read like a counselor wrote it: professional, clear, and human
- Keep Assessment focused on clinical interpretation, not just restating Data
- Plan must contain specific, numbered action items with clear ownership
- Output must be valid JSON only. No markdown, no backticks, no preamble.`;

  const userPrompt = `Here is the client profile and the counselor's rough session notes. Generate structured clinical documentation.

CLIENT PROFILE:
- Name: ${safe(clientProfile?.name, "Unknown")}
- Age: ${safe(clientProfile?.age, "Unknown")}
- Diagnosis: ${safe(clientProfile?.diagnosis, "Not documented")}
- Co-occurring: ${safe(clientProfile?.coOccurring, "None documented")}
- Program: ${safe(clientProfile?.programType, "Not documented")}
- Program Day: ${safe(clientProfile?.programDay, "Not documented")}
- MAT: ${safe(clientProfile?.mat, "None")}
- Session Number: ${safe(sessionNumber, "Unknown")}

CURRENT TREATMENT PLAN OBJECTIVES:
${objectives.length > 0
    ? objectives.map((o) => `- [${safe(o?.status, "unknown")}] ${safe(o?.description, "No description")}`).join("\n")
    : "- No objectives documented"
}

COUNSELOR'S RAW SESSION NOTES:
"""
${safe(rawNotes, "")}
"""

Generate the following JSON structure exactly:

{
  "dapNote": {
    "data": {
      "observations": [
        "One observable fact per item. Client statement, behavior, or affect. Max 15 words each. 3-5 items."
      ],
      "attendance": "present | late | no-show | telephone"
    },
    "assessment": {
      "clinicalSummary": "The single most important clinical interpretation from this session. Max 25 words.",
      "riskLevel": "none | low | moderate | high | critical",
      "riskRationale": "One sentence if risk > none. What specifically raises the level?",
      "clinicalSignificance": "routine | noteworthy | significant | critical"
    },
    "plan": {
      "items": [
        {
          "action": "Specific action — verb first. Max 15 words.",
          "assignedTo": "counselor | client | both | referral",
          "timeline": "next-session | within-1-week | ongoing | immediate"
        }
      ]
    }
  },
  "tags": {
    "moodIndicators": ["1-2 word clinical descriptors only"],
    "triggersIdentified": ["trigger + context in max 8 words"],
    "copingStrategiesDiscussed": ["strategy name only — add (used) or (planned) or (resistant)"],
    "supportNetworkChanges": "One clause. 'No change' if none. Max 10 words.",
    "objectivesAddressed": ["obj-X"],
    "riskIndicators": ["Specific signal in max 12 words, or empty array"],
    "sessionSentiment": "improving | stable | declining | concerning | mixed",
    "keyQuotes": ["Quoted statement from counselor notes. Max 20 words each. Empty array if none."]
  },
  "followUpFlags": [
    {
      "flag": "Specific action item. Max 15 words.",
      "priority": "urgent | priority | routine",
      "category": "safety | treatment-plan | support-network | engagement | documentation"
    }
  ]
}`;

  return { systemPrompt, userPrompt };
}

module.exports = { buildDocumentationPrompt };