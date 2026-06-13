// Cloudinary 配置
// 请在 Cloudinary 注册后获取以下信息：https://cloudinary.com/users/register/free

export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ''
export const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY || ''
export const CLOUDINARY_API_SECRET = import.meta.env.VITE_CLOUDINARY_API_SECRET || ''
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'nexus-images'

// Cloudinary 上传地址
export const CLOUDINARY_UPLOAD_URL = CLOUDINARY_CLOUD_NAME
  ? `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
  : ''

// 检查是否已配置 Cloudinary
export const isCloudinaryConfigured = () => {
  return !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET)
}

// 上传图片到 Cloudinary
export interface CloudinaryResult {
  secure_url: string
  public_id: string
  width: number
  height: number
  bytes: number
}

export const uploadToCloudinary = async (file: File): Promise<CloudinaryResult> => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary 未配置')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formData.append('cloud_name', CLOUDINARY_CLOUD_NAME)
  formData.append('api_key', CLOUDINARY_API_KEY)
  formData.append('timestamp', Date.now().toString())
  formData.append('signature', await generateSignature())

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error('上传失败')
  }

  return response.json()
}

// 生成签名（简化版，实际生产环境应在服务端完成）
const generateSignature = async (): Promise<string> => {
  if (!CLOUDINARY_API_SECRET) return ''
  
  const timestamp = Date.now()
  const stringToSign = `folder=nexus-images&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`
  
  // 简单的签名生成（实际应使用 SHA1）
  const encoder = new TextEncoder()
  const data = encoder.encode(stringToSign)
  const hashBuffer = await crypto.subtle.digest('SHA-1', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
