import express from 'express'
import multer from 'multer'
import { verifyToken } from '../middleware/auth.js'
import { uploadPdfBuffer } from '../utils/cloudinary.js'

const router = express.Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
})

router.post('/pdf', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Archivo requerido' })
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Solo se aceptan archivos PDF' })
    }

    const uploaded = await uploadPdfBuffer(req.file.buffer, req.file.originalname)

    return res.json({
      success: true,
      file: {
        name: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        url: uploaded.secure_url,
        publicId: uploaded.public_id,
        uploadedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('[Uploads] Error uploading PDF:', error.message)
    return res.status(500).json({ error: 'Error subiendo archivo a la nube' })
  }
})

export default router
