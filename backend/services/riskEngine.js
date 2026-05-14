const calculateRiskScore = (customerDisputes = []) => {
  if (!customerDisputes || customerDisputes.length === 0) {
    return {
      score: 10,
      label: 'Low Risk',
      color: 'green',
      recommendation: 'No prior chargeback history. First-time buyer on network.',
      reason: 'No chargeback history found on network.',
      signals: [],
      legitimacy_notes: [],
      total_chargebacks: 0,
      recent_chargebacks: 0,
      merchants_affected: 0,
      rejected_disputes: 0
    }
  }

  let score = 0
  const signals = []
  const legitimacyNotes = []
  const now = new Date()

  // ─────────────────────────────────────────────
  // SIGNAL 1: Total chargeback volume (max 20)
  // More chargebacks = higher baseline risk.
  // A single chargeback can be genuine.
  // Multiple chargebacks show a pattern.
  // Source: disputes array length
  // ─────────────────────────────────────────────
  const total = customerDisputes.length
  if (total === 1) score += 10
  else if (total === 2) score += 15
  else if (total >= 3) score += 20
  if (total >= 2) signals.push(`${total} chargebacks filed across network`)

  // ─────────────────────────────────────────────
  // SIGNAL 2: Velocity — chargebacks in last 30 days (max 25)
  // A burst of chargebacks in a short time window
  // is a classic indicator of coordinated fraud.
  // Source: raised_at timestamp
  // ─────────────────────────────────────────────
  const last30 = customerDisputes.filter(d => {
    const days = (now - new Date(d.raised_at)) / 86400000
    return days >= 0 && days <= 30
  })
  if (last30.length >= 3) score += 25
  else if (last30.length === 2) score += 18
  else if (last30.length === 1) score += 10
  if (last30.length > 0) {
    signals.push(`${last30.length} chargeback(s) in the last 30 days`)
  }

  // ─────────────────────────────────────────────
  // SIGNAL 3: Cross-merchant pattern (max 20)
  // A customer filing chargebacks against multiple
  // different merchants is the clearest sign of
  // deliberate abuse rather than a genuine one-off.
  // Source: merchant_id across disputes
  // ─────────────────────────────────────────────
  const uniqueMerchants = new Set(customerDisputes.map(d => d.merchant_id))
  if (uniqueMerchants.size >= 3) {
    score += 20
    signals.push(`Chargebacks filed against ${uniqueMerchants.size} different merchants — systematic fraud pattern`)
  } else if (uniqueMerchants.size === 2) {
    score += 12
    signals.push('Chargebacks across 2 different merchants')
  }

  // ─────────────────────────────────────────────
  // SIGNAL 4: Chargeback rejection pattern (max 15)
  // action: "3" = merchant rejected the chargeback
  // action: "2" = merchant accepted the claim
  // Multiple rejections = multiple merchants
  // independently concluded this buyer was lying.
  // Source: action field
  // Confirmed by Squad engineer:
  // 1 = pending, 2 = accepted, 3 = rejected
  // ─────────────────────────────────────────────
  const rejectedDisputes = customerDisputes.filter(d => d.action === '3')
  const acceptedDisputes = customerDisputes.filter(d => d.action === '2')

  if (rejectedDisputes.length >= 3) {
    score += 15
    signals.push(`${rejectedDisputes.length} chargebacks rejected by merchants — repeatedly flagged as fraudulent`)
  } else if (rejectedDisputes.length === 2) {
    score += 10
    signals.push(`${rejectedDisputes.length} chargebacks rejected by merchants`)
  } else if (rejectedDisputes.length === 1) {
    score += 5
    signals.push('Chargeback previously rejected by a merchant')
  }

  if (acceptedDisputes.length > 0 && rejectedDisputes.length === 0) {
    score -= 5
    legitimacyNotes.push('All chargebacks were accepted by merchants — claims appear legitimate')
  }

  // ─────────────────────────────────────────────
  // SIGNAL 5: Merchant fight-back count (max 20)
  // *** CUSTOM CHARGEGUARD SIGNAL ***
  // Every time a merchant calls GET /dispute/upload-url
  // or clicks Reject on a dispute, ChargeGuard
  // increments rejection_attempt_count for that ticket.
  // This is tracked entirely within ChargeGuard —
  // it is not a Squad API field.
  // A high count means merchants kept uploading
  // evidence and fighting — certain it was fraud.
  // Source: rejection_attempt_count (ChargeGuard DB)
  // ─────────────────────────────────────────────
  const totalFightbacks = customerDisputes.reduce((sum, d) => {
    return sum + (d.rejection_attempt_count || 0)
  }, 0)

  if (totalFightbacks >= 5) {
    score += 20
    signals.push(`Merchants fought back ${totalFightbacks} times — high conviction of fraud`)
  } else if (totalFightbacks >= 3) {
    score += 12
    signals.push(`Merchants submitted evidence ${totalFightbacks} times — disputes appear non-genuine`)
  } else if (totalFightbacks >= 1) {
    score += 5
    signals.push(`Merchants contested ${totalFightbacks} time(s)`)
  }

  // ─────────────────────────────────────────────
  // SIGNAL 6: IP address reuse (max 20)
  // Same IP across multiple disputes is a strong
  // indicator of a fraud ring or identity rotation.
  // Real customers rarely appear in multiple disputes
  // from the same IP address.
  // Source: ip_address field (from transaction metadata)
  // ─────────────────────────────────────────────
  const ipAddresses = customerDisputes.map(d => d.ip_address).filter(Boolean)
  const uniqueIPs = new Set(ipAddresses)
  if (ipAddresses.length > 1 && uniqueIPs.size === 1) {
    score += 20
    signals.push('Identical IP address across multiple disputes — strong fraud ring indicator')
  } else if (ipAddresses.length > 1 && uniqueIPs.size < ipAddresses.length) {
    score += 10
    signals.push('Overlapping IP addresses detected across disputes')
  }

  // ─────────────────────────────────────────────
  // SIGNAL 7: Device fingerprint reuse (max 15)
  // Same browser_id means the same physical device
  // was used even if email or phone changed.
  // Catches fraudsters rotating identities but
  // using the same device.
  // Source: fingerprintData.brwoser_id
  // Note: Squad API has a typo — brwoser_id
  // We store this as browser_id in ChargeGuard DB
  // ─────────────────────────────────────────────
  const browserIds = customerDisputes.map(d => d.browser_id).filter(Boolean)
  const uniqueBrowserIds = new Set(browserIds)
  if (browserIds.length > 1 && uniqueBrowserIds.size === 1) {
    score += 15
    signals.push('Same device fingerprint across multiple disputes — identity rotation suspected')
  } else if (browserIds.length > 1 && uniqueBrowserIds.size < browserIds.length) {
    score += 8
    signals.push('Overlapping device fingerprints detected across disputes')
  }

  // ─────────────────────────────────────────────
  // SIGNAL 8: High value disputes (max 10)
  // Fraudsters target high-value transactions for
  // maximum gain. Multiple high-value disputes
  // from the same customer is a strong red flag.
  // Amount stored in kobo — ₦50,000 = 5,000,000 kobo
  // Source: amount field
  // ─────────────────────────────────────────────
  const highValueDisputes = customerDisputes.filter(d => {
    return parseInt(d.amount || 0) >= 5000000
  })
  if (highValueDisputes.length >= 2) {
    score += 10
    signals.push(`${highValueDisputes.length} high-value disputes (₦50,000+) — typical fraud target range`)
  } else if (highValueDisputes.length === 1) {
    score += 5
    signals.push('High-value transaction disputed (₦50,000+)')
  }

  // Cap score between 0 and 100
  score = Math.max(0, Math.min(score, 100))

  // Determine risk label and recommendation
  let label, color, recommendation
  if (score <= 25) {
    label = 'Low Risk'
    color = 'green'
    recommendation = 'Safe to proceed with transaction.'
  } else if (score <= 55) {
    label = 'Moderate Risk'
    color = 'amber'
    recommendation = 'Proceed with caution. Request proof of identity before releasing goods.'
  } else if (score <= 80) {
    label = 'High Risk'
    color = 'orange'
    recommendation = 'High risk detected. Request advance payment or decline transaction.'
  } else {
    label = 'Critical Risk'
    color = 'red'
    recommendation = 'Do not proceed. This buyer shows a clear pattern of chargeback fraud.'
  }

  const allReasons = [...signals, ...legitimacyNotes]

  return {
    score,
    label,
    color,
    recommendation,
    reason: allReasons.join('. ') + '.',
    signals,
    legitimacy_notes: legitimacyNotes,
    total_chargebacks: total,
    recent_chargebacks: last30.length,
    merchants_affected: uniqueMerchants.size,
    rejected_disputes: rejectedDisputes.length,
    merchant_fightback_count: totalFightbacks,
    high_value_disputes: highValueDisputes.length
  }
}

module.exports = { calculateRiskScore }