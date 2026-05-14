require('dotenv').config({ path: require('path').join(__dirname, '../.env') })

const supabase = require('../config/supabase')

const seedDummyData = async () => {
  console.log('Cleaning existing data...')
  await supabase.from('disputes').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  console.log('Cleaned.')

  console.log('Seeding customers...')
  const { data: customers, error: customerError } = await supabase
    .from('customers')
    .insert([
      {
        email: 'fraudster@gmail.com',
        phone: '08012345678',
        browser_id: 'abc123def456',
        ip_address: '18.133.63.109',
        trust_score: 91,
        total_chargebacks: 5
      },
      {
        email: 'suspicious@yahoo.com',
        phone: '08098765432',
        browser_id: 'xyz789uvw012',
        ip_address: '197.210.2.2',
        trust_score: 55,
        total_chargebacks: 2
      },
      {
        email: 'goodbuyer@gmail.com',
        phone: '08055555555',
        browser_id: 'good123buyer456',
        ip_address: '197.210.3.3',
        trust_score: 15,
        total_chargebacks: 0
      }
    ])
    .select()

  if (customerError) {
    console.error('Customer seed error:', customerError)
    return
  }

  console.log('Customers seeded:', customers.length)

  const { data: merchant } = await supabase
    .from('merchants')
    .select('id')
    .eq('email', 'test@merchant.com')
    .single()

  if (!merchant) {
    console.error('No merchant found — make sure test@merchant.com exists')
    return
  }

  const fraudster = customers[0]
  const suspicious = customers[1]
  const now = new Date()
  const daysAgo = (d) => new Date(now - d * 24 * 60 * 60 * 1000).toISOString()

  console.log('Seeding disputes...')
  const { error: disputeError } = await supabase
    .from('disputes')
    .insert([

      // ── FRAUDSTER: 5 chargebacks ──
      // Same IP, same device, high value,
      // merchants kept rejecting — all point to fraud
      {
        merchant_id: merchant.id,
        customer_id: fraudster.id,
        squad_ticket_id: 'TKT_FRAUD_001',
        amount: 8500000,
        reason: 'Item not received',
        status: 'pending',
        squad_status: 'open',
        action: '3',
        raised_at: daysAgo(2),
        ip_address: '18.133.63.109',
        browser_id: 'abc123def456',
        rejection_attempt_count: 3
      },
      {
        merchant_id: merchant.id,
        customer_id: fraudster.id,
        squad_ticket_id: 'TKT_FRAUD_002',
        amount: 12000000,
        reason: 'Unauthorized transaction',
        status: 'pending',
        squad_status: 'open',
        action: '3',
        raised_at: daysAgo(10),
        ip_address: '18.133.63.109',
        browser_id: 'abc123def456',
        rejection_attempt_count: 5
      },
      {
        merchant_id: merchant.id,
        customer_id: fraudster.id,
        squad_ticket_id: 'TKT_FRAUD_003',
        amount: 15000000,
        reason: 'Item not received',
        status: 'closed',
        squad_status: 'closed',
        action: '3',
        raised_at: daysAgo(25),
        ip_address: '18.133.63.109',
        browser_id: 'abc123def456',
        rejection_attempt_count: 2
      },
      {
        merchant_id: merchant.id,
        customer_id: fraudster.id,
        squad_ticket_id: 'TKT_FRAUD_004',
        amount: 6000000,
        reason: 'Item not as described',
        status: 'closed',
        squad_status: 'closed',
        action: '3',
        raised_at: daysAgo(45),
        ip_address: '18.133.63.109',
        browser_id: 'abc123def456',
        rejection_attempt_count: 4
      },
      {
        merchant_id: merchant.id,
        customer_id: fraudster.id,
        squad_ticket_id: 'TKT_FRAUD_005',
        amount: 9000000,
        reason: 'Unauthorized transaction',
        status: 'closed',
        squad_status: 'closed',
        action: '3',
        raised_at: daysAgo(60),
        ip_address: '18.133.63.109',
        browser_id: 'abc123def456',
        rejection_attempt_count: 1
      },

      // ── SUSPICIOUS: 2 chargebacks ──
      // Merchants accepted claims, slower disputes
      // less clear cut than fraudster
      {
        merchant_id: merchant.id,
        customer_id: suspicious.id,
        squad_ticket_id: 'TKT_SUS_001',
        amount: 3500000,
        reason: 'Item not received',
        status: 'closed',
        squad_status: 'closed',
        action: '2',
        raised_at: daysAgo(20),
        ip_address: '197.210.2.2',
        browser_id: 'xyz789uvw012',
        rejection_attempt_count: 1
      },
      {
        merchant_id: merchant.id,
        customer_id: suspicious.id,
        squad_ticket_id: 'TKT_SUS_002',
        amount: 7000000,
        reason: 'Item not as described',
        status: 'pending',
        squad_status: 'open',
        action: '1',
        raised_at: daysAgo(35),
        ip_address: '197.210.2.2',
        browser_id: 'xyz789uvw012',
        rejection_attempt_count: 0
      }
    ])

  if (disputeError) {
    console.error('Dispute seed error:', disputeError)
    return
  }

  console.log('Disputes seeded successfully')
  console.log('')
  console.log('Test these profiles:')
  console.log('  CRITICAL RISK: fraudster@gmail.com')
  console.log('  MODERATE RISK: suspicious@yahoo.com')
  console.log('  LOW RISK:      goodbuyer@gmail.com')
}

seedDummyData()