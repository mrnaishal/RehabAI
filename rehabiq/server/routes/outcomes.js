const express = require("express");
const router = express.Router();
const Anthropic = require("@anthropic-ai/sdk").default;
const { getClientById } = require("../data/database");
const { buildOutcomesPrompt } = require("../prompts/analyzeOutcomes");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// In-memory cache: { [clientId]: { sessionCount: number, data: object } }
const outcomesCache = new Map();

// GET /api/outcomes/:clientId
router.get("/:clientId", async (req, res) => {
  try {
    const client = await getClientById(req.params.clientId);
    if (!client) return res.status(404).json({ error: "Client not found" });

    if (!client.sessions || client.sessions.length < 2) {
      return res.json({
        success: true,
        outcomes: {
          interventionEffectiveness: [],
          outcomeTrends: {
            triggerManagement: { trend: "too-early-to-assess", evidence: "Insufficient data." },
            supportNetwork: { trend: "too-early-to-assess", evidence: "Insufficient data." },
            engagementLevel: { trend: "too-early-to-assess", evidence: "Insufficient data." },
            copingCapacity: { trend: "too-early-to-assess", evidence: "Insufficient data." },
            overallTrajectory: { trend: "too-early-to-assess", summary: "Minimum 2 sessions required for analysis." },
          },
          evidenceBasedRecommendations: [],
          supervisionTalkingPoints: ["Review initial treatment approach."],
        },
        note: "Outcome analysis requires at least 2 sessions.",
      });
    }

    const sessionCount = client.sessions.length;
    const cached = outcomesCache.get(client.id);

    // Return cached result if session count hasn't changed
    if (cached && cached.sessionCount === sessionCount) {
      console.log(`📊 Returning cached outcomes for ${client.name} (${sessionCount} sessions)`);
      return res.json({
        success: true,
        outcomes: cached.data,
        clientId: client.id,
        clientName: client.name,
        sessionsAnalyzed: sessionCount,
        analysisDate: new Date().toISOString(),
        fromCache: true,
      });
    }

    const { systemPrompt, userPrompt } = buildOutcomesPrompt(client);
    console.log(`\n📊 Analyzing outcomes for ${client.name} (${sessionCount} sessions)...`);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const responseText = message.content.filter((b) => b.type === "text").map((b) => b.text).join("");
    const cleaned = responseText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    // Store in cache
    outcomesCache.set(client.id, { sessionCount, data: parsed });

    console.log(`✅ Outcomes analyzed and cached for ${client.name}`);
    res.json({
      success: true, outcomes: parsed,
      clientId: client.id, clientName: client.name,
      sessionsAnalyzed: sessionCount, analysisDate: new Date().toISOString(),
      fromCache: false,
    });
  } catch (err) {
    console.error("Outcomes error:", err);
    if (err instanceof SyntaxError) return res.status(500).json({ error: "Failed to parse Claude response", message: err.message });
    res.status(500).json({ error: "Failed to analyze outcomes", message: err.message });
  }
});

module.exports = router;
