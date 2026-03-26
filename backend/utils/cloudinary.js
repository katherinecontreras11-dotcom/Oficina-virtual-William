import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'

const ensureCloudinaryEnv = () => {
  const missing = []
  if (!process.env.CLOUDINARY_CLOUD_NAME) missing.push('CLOUDINARY_CLOUD_NAME')
  if (!process.env.CLOUDINARY_API_KEY) missing.push('CLOUDINARY_API_KEY')
  if (!process.env.CLOUDINARY_API_SECRET) missing.push('CLOUDINARY_API_SECRET')

  if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno de Cloudinary: ${missing.join(', ')}`)
  }
}

const configureCloudinary = () => {
  ensureCloudinaryEnv()
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  })
}

export const uploadPdfBuffer = (buffer, originalName = 'document.pdf') => {
  return new Promise((resolve, reject) => {
    try {
      configureCloudinary()
    } catch (error) {
      return reject(error)
    }

    const folder = process.env.CLOUDINARY_FOLDER || 'wil-law-firm/pdfs'
    const publicBase = originalName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_')
    const publicId = `${Date.now()}-${publicBase}`

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'raw',
        public_id: publicId,
        format: 'pdf'
      },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )

    streamifier.createReadStream(buffer).pipe(uploadStream)
  })
}

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return
  try {
    configureCloudinary()
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' })
  } catch (error) {
    console.error('[Cloudinary] Error deleting file:', error.message)
  }
}

export const getSignedPdfUrl = (publicId, { attachment = false, expiresInSeconds = 3600 } = {}) => {
  if (!publicId) {
    throw new Error('publicId es requerido para firmar la URL')
  }

  configureCloudinary()
  const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds

  return cloudinary.utils.private_download_url(publicId, 'pdf', {
    resource_type: 'raw',
    type: 'upload',
    attachment,
    expires_at: expiresAt
  })
}
