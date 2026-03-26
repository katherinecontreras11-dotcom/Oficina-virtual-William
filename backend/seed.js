import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/User.js'

dotenv.config()

console.log('[Seed] Iniciando...')

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB conectado')
    
    // Limpiar usuarios existentes
    await User.deleteMany({})
    console.log('🧹 Base de datos limpiada')
    
    // Crear admin
    const admin = new User({
      role: 'admin',
      email: 'admin@wil.com',
      password: 'Admin2026',
      name: 'Lic. Rodríguez',
      phone: '+51925651248',
      avatar: 'R',
      bio: 'Abogado Senior especialista en derecho corporativo.'
    })
    
    await admin.save()
    console.log('✅ Admin creado: admin@wil.com / Admin2026')
    
    console.log('[Seed] ¡Completado!')
    process.exit(0)
  })
  .catch(err => {
    console.error('❌ Error:', err.message)
    process.exit(1)
  })
