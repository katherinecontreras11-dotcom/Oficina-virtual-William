import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const app = express()

// Middleware - CORS dinámico para dev/prod
const allowedOrigins = (() => {
  if (process.env.NODE_ENV === 'production') {
    return [
      /\.vercel\.app$/,        // Cualquier app en Vercel
      /\.onrender\.com$/,      // Cualquier app en Render
      process.env.FRONTEND_URL // URL específica si se proporciona
    ].filter(Boolean)
  }
  return [
    /^http:\/\/localhost:\d+$/,
    /^http:\/\/127\.0\.0\.1:\d+$/
  ]
})()

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))
app.use(express.json())

// Log de requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// Conectar a MongoDB
console.log('[Server] Iniciando conexión a MongoDB...')
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB conectado exitosamente'))
  .catch(err => {
    console.error('❌ Error conectando MongoDB:', err.message)
    process.exit(1)
  })

// Importar rutas
import authRoutes from './routes/auth.js'
import usersRoutes from './routes/users.js'
import appointmentsRoutes from './routes/appointments.js'
import conversationsRoutes from './routes/conversations.js'
import messagesRoutes from './routes/messages.js'
import notificationsRoutes from './routes/notifications.js'
import casesRoutes from './routes/cases.js'

// Registrar rutas
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/appointments', appointmentsRoutes)
app.use('/api/conversations', conversationsRoutes)
app.use('/api/messages', messagesRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/cases', casesRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  })
})

// Error handler global
app.use((err, req, res, next) => {
  console.error('[Error]', err)
  res.status(500).json({ error: err.message })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
  console.log(`📚 API docs: http://localhost:${PORT}/api/`)
})
