/**
 * Servidor de prueba simplificado
 */

import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Test Server funcionando',
    timestamp: new Date().toISOString()
  })
})

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Health check OK',
    timestamp: new Date().toISOString()
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Test Server iniciado en puerto ${PORT}`)
  console.log(`📍 URL: http://localhost:${PORT}`)
})
