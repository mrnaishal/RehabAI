// =============================================================
// Prompt 2: Pre-Session Briefing Generator (v2)
// Now generates both a Quick Glance (30-sec scan) and Full Briefing
// =============================================================

function buildBriefingPrompt(clientProfile) {
  const sessionsContext = clientProfile.sessions
    .map(
      (s) => `
SESSION ${s.sessionNumber} (${s.date}):
DAP Note - Data: ${s.dapNote.data}
DAP Note - Assessment: ${s.dapNote.assessment}
DAP Note - Plan: ${s.dapNote.plan}
Mood: ${s.tags.moodIndicators.join(", ")}
Triggers: ${s.tags.triggersIdentified.join(", ") || "None identified"}
Coping: ${s.tags.copingStrategiesDiscussed.join(", ")}
Support Network: ${s.tags.supportNetworkChanges}
Risk Indicators: ${s.tags.riskIndicators.join(", ") || "None"}
Sentiment: ${s.tags.sessionSentiment}
Key Quotes: ${s.tags.keyQuotes.join(" | ")}
Follow-ups: ${s.followUpFlags.join("; ")}
`
    )
    .join("\n---\n");

  const systemPrompt = `You are a clinical intelligence assistant preparing a rehabilitation counselor for their next session with a client. You analyze the full session history and generate a concise, actionable briefing.

CRITICAL RULES:
- Be concise — counselors read this in 2-3 minutes before walking into a session
- ALWAYS cite specific session numbers when referencing patterns (e.g., "In sessions 7 and 8...")
- Frame all suggestions as "Consider..." or "You might explore..." — NEVER tell the counselor what to do
- Connect dots across sessions that individual notes might not reveal
- If data is insufficient for a pattern, say so rather than speculating
- Highlight both concerns AND strengths — don't make every briefing feel alarming
- Use clinical language but keep it scannable

You must respond in VALID JSON only. No markdown, no backticks, no preamble.`;

  const userPrompt = `Generate a pre-session briefing for this client.

CLIENT PROFILE:
- Name: ${clientProfile.name}
- Age: ${clientProfile.age}
- Diagnosis: ${clientProfile.diagnosis}
- Co-occurring: ${clientProfile.coOccurring || "None documented"}
- Program: ${clientProfile.programType}
- Program Day: ${clientProfile.programDay}
- MAT: ${clientProfile.mat || "None"}

TREATMENT PLAN OBJECTIVES:
${clientProfile.treatmentPlan.objectives
  .map((o) => `- [${o.id}] [${o.status}] ${o.description} (target: ${o.targetDate})`)
  .join("\n")}

COMPLETE SESSION HISTORY:
${sessionsContext}

Generate the following JSON:
{
  "clientSnapshot": "2-3 sentences: who this client is and where they are right now in their program.",
  "recentTrajectory": "3-4 sentences: what's been happening across the most recent sessions. Include mood/engagement trend.",
  "patternAlerts": [
    {
      "type": "concern | positive | neutral",
      "pattern": "describe the cross-session pattern — cite specific session numbers",
      "clinicalImplication": "what this might mean clinically"
    }
  ],
  "treatmentPlanProgress": [
    {
      "objectiveId": "obj-X",
      "objective": "the objective text",
      "status": "on-track | in-progress | stalled | at-risk | achieved",
      "evidence": "1-2 sentences explaining the status based on session data"
    }
  ],
  "suggestedFocus": [
    "2-4 specific, actionable suggestions for the upcoming session, each grounded in session data or evidence-based practice. Start each with 'Consider...' or 'You might...'"
  ],
  "strengthsToReinforce": [
    "1-2 positive things the counselor should acknowledge or build on"
  ]
}`;

  return { systemPrompt, userPrompt };
}

module.exports = { buildBriefingPrompt };