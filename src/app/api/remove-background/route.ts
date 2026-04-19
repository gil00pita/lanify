import { NextResponse } from 'next/server'

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024
const REMBG_SERVICE_URL = process.env.REMBG_SERVICE_URL
const SUPPORTED_EDGE_PRESETS = new Set(['off', 'sharp', 'balanced', 'soft'])
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const SUPPORTED_MODELS = new Set(['birefnet-portrait', 'u2net_human_seg', 'u2net'])

export const runtime = 'nodejs'

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

function normalizeServiceUrl(url: string) {
  return url.endsWith('/') ? url.slice(0, -1) : url
}

export async function POST(request: Request) {
  if (!REMBG_SERVICE_URL) {
    return errorResponse('Background removal is not configured on this server.', 500)
  }

  let formData: FormData

  try {
    formData = await request.formData()
  } catch {
    return errorResponse('Upload a supported image before removing the background.', 400)
  }

  const image = formData.get('image')
  const edgePreset = formData.get('edgePreset')
  const model = formData.get('model')
  const postProcessMask = formData.get('postProcessMask')

  if (!(image instanceof File)) {
    return errorResponse('Upload a supported image before removing the background.', 400)
  }

  if (typeof edgePreset !== 'string' || !SUPPORTED_EDGE_PRESETS.has(edgePreset)) {
    return errorResponse('Choose a valid edge refinement option.', 400)
  }

  if (typeof model !== 'string' || !SUPPORTED_MODELS.has(model)) {
    return errorResponse('Choose a valid background removal model.', 400)
  }

  if (!SUPPORTED_IMAGE_TYPES.has(image.type)) {
    return errorResponse('Use a PNG, JPEG, or WebP image for background removal.', 415)
  }

  if (image.size > MAX_IMAGE_SIZE_BYTES) {
    return errorResponse('Use an image smaller than 10MB for background removal.', 413)
  }

  const upstreamFormData = new FormData()
  upstreamFormData.append('image', image)
  upstreamFormData.append('edgePreset', edgePreset)
  upstreamFormData.append('model', model)
  upstreamFormData.append('postProcessMask', postProcessMask === 'true' ? 'true' : 'false')

  let upstreamResponse: Response

  try {
    upstreamResponse = await fetch(`${normalizeServiceUrl(REMBG_SERVICE_URL)}/remove-background`, {
      body: upstreamFormData,
      cache: 'no-store',
      method: 'POST',
    })
  } catch {
    return errorResponse(
      'The background removal service is unavailable right now. Your original photo is still safe.',
      503
    )
  }

  if (!upstreamResponse.ok) {
    let message = 'Background removal failed. Please try again in a moment.'

    try {
      const payload = (await upstreamResponse.json()) as { detail?: string; error?: string }
      message = payload.error ?? payload.detail ?? message
    } catch {
      // Preserve the stable fallback when the upstream response is not JSON.
    }

    return errorResponse(message, 502)
  }

  const imageBuffer = await upstreamResponse.arrayBuffer()

  return new Response(imageBuffer, {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'image/png',
    },
    status: 200,
  })
}
