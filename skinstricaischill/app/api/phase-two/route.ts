import { NextResponse } from 'next/server'

const SKINSTRIC_PHASE_TWO_API =
  'https://us-central1-api-skinstric-ai.cloudfunctions.net/skinstricPhaseTwo'

export async function POST (request: Request): Promise<NextResponse> {
  let payload: { image: string }

  try {
    payload = (await request.json()) as { image: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (typeof payload.image !== 'string' || payload.image.trim().length === 0) {
    return NextResponse.json({ error: 'image is required' }, { status: 400 })
  }

  try {
    const upstreamResponse = await fetch(SKINSTRIC_PHASE_TWO_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image: payload.image })
    })

    const contentType = upstreamResponse.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const data = await upstreamResponse.json()
      return NextResponse.json(data, { status: upstreamResponse.status })
    }

    const data = await upstreamResponse.text()
    return new NextResponse(data, {
      status: upstreamResponse.status,
      headers: { 'Content-Type': contentType || 'text/plain' }
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to reach upstream phase two API' },
      { status: 502 }
    )
  }
}
