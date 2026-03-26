import express from 'express'
import Appointment from '../models/Appointment.js'
import { verifyToken } from '../middleware/auth.js'
import { notifyNewAppointment, notifyAppointmentUpdated } from '../utils/notificationHelper.js'

const router = express.Router()

// GET /api/appointments
router.get('/', verifyToken, async (req, res) => {
  try {
    const { clientId, lawyerId } = req.query
    let query = {}
    
    if (clientId) query.clientId = clientId
    if (lawyerId) query.lawyerId = lawyerId
    
    const appointments = await Appointment.find(query)
      .populate('clientId', 'name email')
      .populate('lawyerId', 'name email')
    
    res.json(appointments)
  } catch (error) {
    console.error('[Appointments] Error listando:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/appointments
router.post('/', verifyToken, async (req, res) => {
  try {
    const { clientId, lawyerId, date, time, roomId, notes } = req.body
    
    const appointment = new Appointment({
      clientId,
      lawyerId,
      date,
      time,
      roomId: roomId || `room-${Date.now()}`,
      notes: notes || ''
    })
    
    await appointment.save()
    
    // 🔔 NOTIFICAR AL CLIENTE
    await notifyNewAppointment(
      clientId,
      date,
      time,
      appointment._id.toString(),
      '/cliente/citas'
    )
    
    console.log(`[Appointments] Cita creada: ${date} ${time}`)
    
    res.json({ success: true, appointment })
  } catch (error) {
    console.error('[Appointments] Error creando:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/appointments/:id
router.put('/:id', verifyToken, async (req, res) => {
  try {
    // Obtener cita anterior para comparar
    const oldAppointment = await Appointment.findById(req.params.id)
    
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    
    // 🔔 NOTIFICAR AL CLIENTE SI FECHA O HORA CAMBIÓ
    const dateChanged = oldAppointment.date !== appointment.date
    const timeChanged = oldAppointment.time !== appointment.time
    
    if (dateChanged || timeChanged) {
      await notifyAppointmentUpdated(
        appointment.clientId,
        appointment.date,
        appointment.time,
        appointment._id.toString(),
        '/cliente/citas'
      )
    }
    
    console.log(`[Appointments] Cita actualizada: ${req.params.id}`)
    
    res.json({ success: true, appointment })
  } catch (error) {
    console.error('[Appointments] Error actualizando:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/appointments/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id)
    
    console.log(`[Appointments] Cita eliminada: ${req.params.id}`)
    
    res.json({ success: true })
  } catch (error) {
    console.error('[Appointments] Error eliminando:', error.message)
    res.status(500).json({ error: error.message })
  }
})

export default router
