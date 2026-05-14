require('dotenv').config()

const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'ChargeGuard API is running' })
})

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/disputes', require('./routes/disputes'))
app.use('/api/risk', require('./routes/risk'))
app.use('/api/defence', require('./routes/defence'));

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`ChargeGuard backend running on port ${PORT}`)
  console.log('Squad Key loaded:', process.env.SQUAD_SECRET_KEY ? 'YES' : 'NO')
})