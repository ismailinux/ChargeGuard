const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const supabase = require('../config/supabase')
const { getDisputes } = require('../services/squadService')

const signup = async (req, res) => {
  const { email, password, business_name, squad_api_key } = req.body

  if (!email || !password || !business_name || !squad_api_key) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    })
  }

  try {
    // Check if merchant already exists
    const { data: existing } = await supabase
      .from('merchants')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      })
    }

    // Validate Squad API key
    try {
      await getDisputes(squad_api_key)
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Squad API key. Please check your key and try again.'
      })
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10)

    // Create merchant
    const { data: merchant, error } = await supabase
      .from('merchants')
      .insert([{
        email,
        password_hash,
        business_name,
        squad_api_key
      }])
      .select()
      .single()

    if (error) throw error

    // Generate JWT
    const token = jwt.sign(
      { id: merchant.id, email: merchant.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      merchant: {
        id: merchant.id,
        email: merchant.email,
        business_name: merchant.business_name
      }
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    })
  }

  try {
    // Find merchant
    const { data: merchant, error } = await supabase
      .from('merchants')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !merchant) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Check password
    const validPassword = await bcrypt.compare(password, merchant.password_hash)

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    // Generate JWT
    const token = jwt.sign(
      { id: merchant.id, email: merchant.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      success: true,
      message: 'Login successful',
      token,
      merchant: {
        id: merchant.id,
        email: merchant.email,
        business_name: merchant.business_name
      }
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = { signup, login }