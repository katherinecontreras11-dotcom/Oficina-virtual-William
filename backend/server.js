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

const isOriginAllowed = (origin = '') => {
  return allowedOrigins.some((allowed) => {
    if (allowed instanceof RegExp) return allowed.test(origin)
    return allowed === origin
  })
}

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin Origin (Postman, curl, health checks internos)
    if (!origin) return callback(null, true)

    if (isOriginAllowed(origin)) {
      return callback(null, true)
    }

    return callback(new Error(`CORS bloqueado para origin: ${origin}`), false)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
import uploadsRoutes from './routes/uploads.js'

// Registrar rutas
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/appointments', appointmentsRoutes)
app.use('/api/conversations', conversationsRoutes)
app.use('/api/messages', messagesRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/cases', casesRoutes)
app.use('/api/uploads', uploadsRoutes)

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
