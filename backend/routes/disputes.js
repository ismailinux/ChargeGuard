const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { getDisputes } = require('../services/squadService');
const supabase = require('../config/supabase');

// Get all disputes for logged in merchant
router.get('/', authenticate, async (req, res) => {
  try {
    // Get merchant's Squad API key
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('squad_api_key')
      .eq('id', req.merchant.id)
      .single();

    if (merchantError || !merchant?.squad_api_key) {
      console.warn('No Squad API key found for merchant');
      // Fall back to ChargeGuard DB if no key
      return await returnChargeGuardDisputes(req, res);
    }

    // STEP 1: Try Squad API first
    let squadDisputes = [];
    try {
      console.log('Fetching disputes from Squad API...');
      const squadResponse = await getDisputes(merchant.squad_api_key);
      squadDisputes = squadResponse?.data?.rows || [];
      console.log(`Squad returned ${squadDisputes.length} disputes`);
    } catch (squadError) {
      console.warn('Squad API call failed:', squadError.message);
      // Continue to fallback
    }

    // If Squad returned real disputes, use them
    if (squadDisputes.length > 0) {
      return res.json({
        success: true,
        source: 'squad',
        data: squadDisputes
      });
    }

    // STEP 2: No disputes from Squad → return ChargeGuard seeded data
    console.log('No disputes from Squad. Falling back to ChargeGuard database...');
    return await returnChargeGuardDisputes(req, res);

  } catch (error) {
    console.error('Disputes route error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch disputes'
    });
  }
});

// Helper function to return ChargeGuard database disputes
async function returnChargeGuardDisputes(req, res) {
  try {
    const { data: dbDisputes, error } = await supabase
      .from('disputes')
      .select(`
        *,
        customers (
          email,
          phone,
          trust_score,
          total_chargebacks
        )
      `)
      .eq('merchant_id', req.merchant.id)
      .order('raised_at', { ascending: false });

    if (error) throw error;

    return res.json({
      success: true,
      source: 'chargeguard',
      data: dbDisputes || []
    });
  } catch (error) {
    console.error('ChargeGuard DB fallback error:', error);
    throw error;
  }
}

module.exports = router;