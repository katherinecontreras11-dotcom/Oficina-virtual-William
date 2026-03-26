import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  type: {
    type: String,
    enum: ['message', 'appointment', 'case', 'client_created', 'client_updated'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedId: String, // ID del mensaje, cita o caso relacionado
  read: { type: Boolean, default: false, index: true },
  icon: String, // lucide-react icon name (e.g., 'Mail', 'Calendar', 'FileText')
  actionUrl: String, // URL para navegar cuando se hace click
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
})

// Índice compuesto para búsquedas comunes
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 })

export default mongoose.model('Notification', notificationSchema)
