import express from 'express'
import Case from '../models/Case.js'
import { verifyToken, verifyAdmin } from '../middleware/auth.js'
import { notifyClientCaseUpdated } from '../utils/notificationHelper.js'
import { deleteFromCloudinary } from '../utils/cloudinary.js'

const router = express.Router()

// GET /api/cases - Listar casos (con filtros opcionales)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { clientId, lawyerId, status } = req.query
    let query = {}
    
    if (clientId) query.clientId = clientId
    if (lawyerId) query.lawyerId = lawyerId
    if (status) query.status = status
    
    const cases = await Case.find(query)
      .populate('clientId', 'name email phone')
      .populate('lawyerId', 'name email phone')
      .sort({ createdAt: -1 })
    
    res.json(cases)
  } catch (error) {
    console.error('[Cases] Error listando:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// GET /api/cases/:id - Obtener caso específico
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id)
      .populate('clientId', 'name email phone')
      .populate('lawyerId', 'name email phone')
    
    if (!caseData) {
      return res.status(404).json({ error: 'Caso no encontrado' })
    }
    
    res.json(caseData)
  } catch (error) {
    console.error('[Cases] Error obteniendo:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/cases - Crear caso (solo admin)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, clientId, lawyerId, status, priority, progress, date, description } = req.body
    
    if (!title || !clientId || !lawyerId) {
      return res.status(400).json({ error: 'Campos requeridos: title, clientId, lawyerId' })
    }
    
    const caseData = new Case({
      title,
      clientId,
      lawyerId,
      status: status || 'active',
      priority: priority || 'media',
      progress: progress || 0,
      date: date || '',
      description: description || ''
    })
    
    await caseData.save()
    
    // 🔔 NOTIFICAR AL CLIENTE
    await notifyClientCaseUpdated(
      clientId,
      title,
      caseData._id.toString(),
      '/cliente/casos'
    )
    
    console.log(`[Cases] Caso creado: ${title}`)
    
    res.json({
      success: true,
      case: caseData
    })
  } catch (error) {
    console.error('[Cases] Error creando:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// PUT /api/cases/:id - Actualizar caso
router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { title, status, priority, progress, date, description, clientDocuments, lawyerDocuments } = req.body

    const previousCase = await Case.findById(req.params.id)
    if (!previousCase) {
      return res.status(404).json({ error: 'Caso no encontrado' })
    }
    
    const updateData = {}
    if (title) updateData.title = title
    if (status) updateData.status = status
    if (priority) updateData.priority = priority
    if (progress !== undefined) updateData.progress = progress
    if (date !== undefined) updateData.date = date
    if (description !== undefined) updateData.description = description
    if (clientDocuments) updateData.clientDocuments = clientDocuments
    if (lawyerDocuments) updateData.lawyerDocuments = lawyerDocuments
    
    const caseData = await Case.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    
    if (!caseData) {
      return res.status(404).json({ error: 'Caso no encontrado' })
    }
    
    // 🔔 NOTIFICAR AL CLIENTE SI CAMBIÓ ESTADO/PROGRESO/FECHA
    const statusChanged = previousCase.status !== caseData.status
    const progressChanged = previousCase.progress !== caseData.progress
    const dateChanged = previousCase.date !== caseData.date

    if (statusChanged || progressChanged || dateChanged) {
      await notifyClientCaseUpdated(
        caseData.clientId,
        caseData.title,
        caseData._id.toString(),
        '/cliente/casos'
      )
    }
    
    console.log(`[Cases] Caso actualizado: ${req.params.id}`)
    
    res.json({ success: true, case: caseData })
  } catch (error) {
    console.error('[Cases] Error actualizando:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/cases/:id/client-documents - Subir metadata de documento del cliente
router.post('/:id/client-documents', verifyToken, async (req, res) => {
  try {
    const { name, size, mimeType, url, publicId } = req.body
    if (!name || !url || !publicId) {
      return res.status(400).json({ error: 'Campos requeridos: name, url, publicId' })
    }

    const caseData = await Case.findById(req.params.id)
    if (!caseData) return res.status(404).json({ error: 'Caso no encontrado' })

    const isAdmin = req.user?.role === 'admin'
    const isOwnerClient = String(caseData.clientId) === String(req.user?.id)
    if (!isAdmin && !isOwnerClient) {
      return res.status(403).json({ error: 'No tienes permisos para agregar documentos a este caso' })
    }

    const newDoc = {
      id: Date.now(),
      name,
      size: Number(size) || 0,
      type: 'PDF',
      mimeType: mimeType || 'application/pdf',
      url,
      publicId,
      uploadedAt: new Date().toLocaleString('es-ES')
    }

    caseData.clientDocuments = [...(caseData.clientDocuments || []), newDoc]
    await caseData.save()

    res.json({ success: true, case: caseData, document: newDoc })
  } catch (error) {
    console.error('[Cases] Error agregando client document:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// POST /api/cases/:id/lawyer-documents - Subir metadata de documento del abogado
router.post('/:id/lawyer-documents', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { name, size, mimeType, url, publicId } = req.body
    if (!name || !url || !publicId) {
      return res.status(400).json({ error: 'Campos requeridos: name, url, publicId' })
    }

    const caseData = await Case.findById(req.params.id)
    if (!caseData) return res.status(404).json({ error: 'Caso no encontrado' })

    const newDoc = {
      id: Date.now(),
      name,
      size: Number(size) || 0,
      type: 'PDF',
      mimeType: mimeType || 'application/pdf',
      url,
      publicId,
      uploadedAt: new Date().toLocaleString('es-ES')
    }

    caseData.lawyerDocuments = [...(caseData.lawyerDocuments || []), newDoc]
    await caseData.save()

    res.json({ success: true, case: caseData, document: newDoc })
  } catch (error) {
    console.error('[Cases] Error agregando lawyer document:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/cases/:id/client-documents/:docId - Eliminar doc cliente
router.delete('/:id/client-documents/:docId', verifyToken, async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id)
    if (!caseData) return res.status(404).json({ error: 'Caso no encontrado' })

    const isAdmin = req.user?.role === 'admin'
    const isOwnerClient = String(caseData.clientId) === String(req.user?.id)
    if (!isAdmin && !isOwnerClient) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar documentos de este caso' })
    }

    const currentDocs = caseData.clientDocuments || []
    const docToDelete = currentDocs.find((d) => String(d.id) === String(req.params.docId))
    caseData.clientDocuments = currentDocs.filter((d) => String(d.id) !== String(req.params.docId))
    await caseData.save()

    if (docToDelete?.publicId) {
      await deleteFromCloudinary(docToDelete.publicId)
    }

    res.json({ success: true, case: caseData })
  } catch (error) {
    console.error('[Cases] Error eliminando client document:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/cases/:id/lawyer-documents/:docId - Eliminar doc abogado
router.delete('/:id/lawyer-documents/:docId', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id)
    if (!caseData) return res.status(404).json({ error: 'Caso no encontrado' })

    const currentDocs = caseData.lawyerDocuments || []
    const docToDelete = currentDocs.find((d) => String(d.id) === String(req.params.docId))
    caseData.lawyerDocuments = currentDocs.filter((d) => String(d.id) !== String(req.params.docId))
    await caseData.save()

    if (docToDelete?.publicId) {
      await deleteFromCloudinary(docToDelete.publicId)
    }

    res.json({ success: true, case: caseData })
  } catch (error) {
    console.error('[Cases] Error eliminando lawyer document:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// DELETE /api/cases/:id - Eliminar caso (solo admin)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const caseData = await Case.findByIdAndDelete(req.params.id)
    
    if (!caseData) {
      return res.status(404).json({ error: 'Caso no encontrado' })
    }
    
    console.log(`[Cases] Caso eliminado: ${req.params.id}`)
    
    res.json({ success: true })
  } catch (error) {
    console.error('[Cases] Error eliminando:', error.message)
    res.status(500).json({ error: error.message })
  }
})

export default router
