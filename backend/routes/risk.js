const express = require('express')
const router = express.Router()
const authenticate = require('../middleware/auth')
const supabase = require('../config/supabase')
const { calculateRiskScore } = require('../services/riskEngine')

// Search customer risk score by email or phone
router.get('/search', authenticate, async (req, res) => {
  const { email, phone } = req.query

  if (!email && !phone) {
    return res.status(400).json({
      success: false,
      message: 'Email or phone number is required'
    })
  }

  try {
    // Find customer in our network
    let query = supabase.from('customers').select('*')
    if (email) query = query.eq('email', email)
    if (phone) query = query.eq('phone', phone)

    const { data: customer } = await query.single()

    if (!customer) {
      return res.json({
        success: true,
        found: false,
        risk: calculateRiskScore([]),
        message: 'No history found. First-time buyer on network.'
      })
    }

    // Get all disputes for this customer
    const { data: disputes } = await supabase
      .from('disputes')
      .select('*')
      .eq('customer_id', customer.id)
      .order('raised_at', { ascending: false })

    const risk = calculateRiskScore(disputes)

    res.json({
      success: true,
      found: true,
      customer: {
        email: customer.email,
        phone: customer.phone,
        first_seen: customer.first_seen,
        total_chargebacks: customer.total_chargebacks
      },
      risk
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

// GET /api/risk/recent
router.get('/recent', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('risk_searches')
      .select(`
        *,
        customers (email, phone, trust_score, total_chargebacks)
      `)
      .eq('merchant_id', req.merchant.id)
      .order('searched_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Record a risk search (POST)
router.post('/record', authenticate, async (req, res) => {
  const { customer_id, query, search_type, risk_score } = req.body;

  try {
    const { error } = await supabase
      .from('risk_searches')
      .insert({
        merchant_id: req.merchant.id,
        customer_id: customer_id || null,
        query: query,
        search_type: search_type,
        risk_score: risk_score,
        searched_at: new Date().toISOString()
      });

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error('Failed to record search:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router