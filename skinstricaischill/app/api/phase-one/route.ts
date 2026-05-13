import { NextResponse } from 'next/server'

type PhaseOnePayload = {
  name: string
  location: string
}

const SKINSTRIC_PHASE_ONE_API =
  'https://us-central1-api-skinstric-ai.cloudfunctions.net/skinstricPhaseOne'

export async function POST (request: Request): Promise<NextResponse> {
  let payload: PhaseOnePayload

  try {
    payload = (await request.json()) as PhaseOnePayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (
    typeof payload.name !== 'string' ||
    typeof payload.location !== 'string' ||
    payload.name.trim().length === 0 ||
    payload.location.trim().length === 0
  ) {
    return NextResponse.json(
      { error: 'Both name and location are required' },
      { status: 400 }
    )
  }

  try {
    const upstreamResponse = await fetch(SKINSTRIC_PHASE_ONE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: payload.name.trim(),
        location: payload.location.trim()
      })
    })

    const contentType = upstreamResponse.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const data = await upstreamResponse.json()
      return NextResponse.json(data, { status: upstreamResponse.status })
    }

    const data = await upstreamResponse.text()
    return new NextResponse(data, {
      status: upstreamResponse.status,
      headers: {
        'Content-Type': contentType || 'text/plain'
      }
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to reach upstream phase one API' },
      { status: 502 }
    )
  }
}
