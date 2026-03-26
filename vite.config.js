import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⭐ SERVER-SIDE STORE - En memoria compartido entre navegadores
let serverAppointments = []

// ⭐ Plugin de Vite para API de citas
const appointmentsApiPlugin = {
  name: 'appointments-api',
  apply: 'serve',
  configureServer(server) {
    // Registrar UN middleware que maneje TODAS las rutas /api/appointments/*
    server.middlewares.use((req, res, next) => {
      // Solo procesar rutas que empiezan con /api/appointments
      if (!req.url.startsWith('/api/appointments')) {
        return next()
      }

      // Habilitar CORS
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

      // Responder a OPTIONS
      if (req.method === 'OPTIONS') {
        res.writeHead(200)
        res.end()
        return
      }

      // GET /api/appointments - Obtener todas las citas
      if (req.url === '/api/appointments' && req.method === 'GET') {
        console.log('[SERVER] GET /api/appointments ->', serverAppointments.length, 'appointments')
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ appointments: serverAppointments }))
        return
      }

      // POST /api/appointments - Agregar cita
      if (req.url === '/api/appointments' && req.method === 'POST') {
        let body = ''
        req.on('data', chunk => {
          body += chunk.toString()
        })
        req.on('end', () => {
          try {
            const appointment = JSON.parse(body)
            serverAppointments.push(appointment)
            console.log('[SERVER] POST /api/appointments -> Added appointment:', appointment.id)
            res.writeHead(201, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true, appointment }))
          } catch (e) {
            console.error('[SERVER] POST error:', e)
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Invalid JSON' }))
          }
        })
        return
      }

      // PUT /api/appointments/:id y DELETE /api/appointments/:id
      const idMatch = req.url.match(/^\/api\/appointments\/(\d+)$/)
      if (idMatch) {
        const id = Number(idMatch[1])

        // PUT - Actualizar cita
        if (req.method === 'PUT') {
          let body = ''
          req.on('data', chunk => {
            body += chunk.toString()
          })
          req.on('end', () => {
            try {
              const updates = JSON.parse(body)
              const index = serverAppointments.findIndex(a => a.id === id)
              if (index !== -1) {
                serverAppointments[index] = { ...serverAppointments[index], ...updates }
                console.log('[SERVER] PUT /api/appointments/:id -> Updated appointment:', id)
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ success: true, appointment: serverAppointments[index] }))
              } else {
                res.writeHead(404, { 'Content-Type': 'application/json' })
                res.end(JSON.stringify({ error: 'Appointment not found' }))
              }
            } catch (e) {
              console.error('[SERVER] PUT error:', e)
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Invalid JSON' }))
            }
          })
          return
        }

        // DELETE - Eliminar cita
        if (req.method === 'DELETE') {
          const index = serverAppointments.findIndex(a => a.id === id)
          if (index !== -1) {
            const removed = serverAppointments.splice(index, 1)[0]
            console.log('[SERVER] DELETE /api/appointments/:id -> Deleted appointment:', id)
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true, removed }))
          } else {
            res.writeHead(404, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Appointment not found' }))
          }
          return
        }
      }

      // Si llegamos aquí, la ruta no fue reconocida
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: 'Not found' }))
    })
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), appointmentsApiPlugin],
  server: {
    middlewareMode: false
  }
})
