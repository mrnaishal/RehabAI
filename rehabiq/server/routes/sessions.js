const express = require("express");
const router = express.Router();
const Anthropic = require("@anthropic-ai/sdk").default;
const { getClientById, addSession, getSessionCount } = require("../data/database");
const { buildDocumentationPrompt } = require("../prompts/documentSession");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/sessions/document
router.post("/document", async (req, res) => {
  try {
    const { clientId, rawNotes, sessionNumber } = req.body;

    if (!clientId || !rawNotes) {
      return res.status(400).json({ error: "Missing required fields: clientId, rawNotes" });
    }

    const client = await getClientById(clientId);
    if (!client) return res.status(404).json({ error: "Client not found" });

    const sessNum = sessionNumber || (await getSessionCount(clientId)) + 1;
    const { systemPrompt, userPrompt } = buildDocumentationPrompt(client, rawNotes, sessNum);

    console.log(`\n📝 Documenting session ${sessNum} for ${client.name}...`);

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const responseText = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    const cleaned = responseText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const today = new Date().toISOString().split("T")[0];
    const newSession = await addSession(clientId, {
      id: `sess-${Date.now()}`,
      sessionNumber: sessNum,
      date: today,
      rawNotes,
      dapNote: parsed.dapNote,
      tags: parsed.tags,
      followUpFlags: parsed.followUpFlags,
    });

    console.log(`✅ Session ${sessNum} documented and saved for ${client.name}`);

    res.json({ success: true, session: newSession });
  } catch (err) {
    console.error("Documentation error:", err);
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: "Failed to parse Claude response", message: err.message });
    }
    res.status(500).json({ error: "Failed to document session", message: err.message });
  }
});

module.exports = router;
