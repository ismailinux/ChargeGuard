const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const supabase = require('../config/supabase');
const axios = require('axios');

router.post('/generate', authenticate, async (req, res) => {
  try {
    const { dispute_id, ticket_id } = req.body;

    const { data: dispute, error } = await supabase
      .from('disputes')
      .select(`
        *,
        customers (email, phone, trust_score, total_chargebacks)
      `)
      .eq('id', dispute_id)
      .single();

    if (error || !dispute) {
      return res.status(404).json({ success: false, message: "Dispute not found" });
    }

    const prompt = `
You are an expert Nigerian chargeback defence lawyer.

Return your response **strictly as valid JSON only**. No explanations, no markdown, no extra text.

{
  "full_defence": "Complete professional defence letter here...",
  "evidence": [
    "First strong evidence point",
    "Second strong evidence point",
    "Third strong evidence point"
  ],
  "recommendation": "Short one-sentence recommendation for the merchant"
}

Dispute Information:
- Ticket ID: ${dispute.squad_ticket_id || ticket_id}
- Customer Email: ${dispute.customers?.email || 'N/A'}
- Amount: ₦${((dispute.amount || 0) / 100).toLocaleString('en-NG')}
- Reason: ${dispute.reason || 'Not provided'}
- Raised Date: ${new Date(dispute.raised_at).toDateString()}
- Customer Risk Score: ${dispute.customers?.trust_score || 50}/100   (Higher score = Higher Risk)
- Previous Chargebacks: ${dispute.customers?.total_chargebacks || 0}

Important Instructions:
- Refer to it as "**Risk Score**" (not Trust Score). 
- A high Risk Score (e.g. 91/100) should be presented as a red flag / suspicious.
- Emphasize the customer's history of previous chargebacks as strong evidence of possible fraud.
`;

    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json"
        }
      }
    );

    const rawText = geminiRes.data.candidates[0].content.parts[0].text.trim();
    
    let defenceData;
    try {
      defenceData = JSON.parse(rawText);
    } catch (e) {
      defenceData = {
        full_defence: rawText,
        evidence: ["Customer has high risk score", "Multiple previous chargebacks"],
        recommendation: "Submit this defence to Squad immediately."
      };
    }

    res.json({
      success: true,
      defenceText: defenceData.full_defence,
      evidence: defenceData.evidence || [],
      recommendation: defenceData.recommendation || "Submit this strong defence to Squad.",
      confidence: 82
    });

  } catch (error) {
    console.error("Gemini Error:", error.response?.data || error.message);
    res.status(500).json({ success: false, message: "Failed to generate defence" });
  }
});
module.exports = router;