'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type CameraState = 'loading' | 'ready' | 'error'

const PHASE_TWO_ENDPOINT =
  'https://us-central1-api-skinstric-ai.cloudfunctions.net/skinstricPhaseTwo'
const PHASE_TWO_STORAGE_KEY = 'skinstricPhaseTwoResult'

export default function CameraCapturePage () {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraState, setCameraState] = useState<CameraState>('loading')
  const [cameraError, setCameraError] = useState('')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const handleTakePicture = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    setCapturedImage(dataUrl)
    setSubmitError('')
  }

  const handleRetake = () => {
    setCapturedImage(null)
    setSubmitError('')
    // Re-attach the stream to the video element since it was hidden
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  }

  const handleUsePhoto = async () => {
    if (!capturedImage || isSubmitting) return

    const base64 = capturedImage.split(',')[1]
    setIsSubmitting(true)
    setSubmitError('')

    try {
      const response = await fetch(PHASE_TWO_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 })
      })

      if (!response.ok) throw new Error('Upload failed')

      const contentType = response.headers.get('content-type') || ''

      if (contentType.includes('application/json')) {
        const payload = (await response.json()) as unknown
        localStorage.setItem(PHASE_TWO_STORAGE_KEY, JSON.stringify(payload))
      }

      router.push('/select')
    } catch {
      setSubmitError('Unable to process image. Please try again.')
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    let activeStream: MediaStream | null = null

    const startCamera = async () => {
      try {
        setCameraState('loading')
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user'
          },
          audio: false
        })

        activeStream = stream
        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        setCameraState('ready')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setCameraError(`Camera access error: ${message}`)
        setCameraState('error')
      }
    }

    startCamera()

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return (
    <>
      <div className='navbar'>
        <div className='navbar-logo-section'>
          <Link className='navbar-link' href='/'>
            SKINSTRIC
          </Link>
          <Image
            alt='left-bracket'
            width={5}
            height={19}
            className='navbar-bracket'
            src='/left-bracket.png'
          />
          <p className='navbar-section-label'>INTRO</p>
          <Image
            alt='right-bracket'
            width={5}
            height={19}
            className='navbar-bracket'
            src='/right-bracket.png'
          />
        </div>

        <button className='enter-code-btn'>ENTER CODE</button>
      </div>

      <canvas ref={canvasRef} className='hidden' />

      <div className='camera-capture-shell'>
        <div className='camera-capture-stage'>
          {cameraState === 'error' && (
            <div className='camera-capture-error'>{cameraError}</div>
          )}

          {submitError && (
            <div className='camera-capture-error'>{submitError}</div>
          )}

          {/* ── Live camera feed — always in DOM ── */}
          <video
            ref={videoRef}
            className={`camera-capture-video ${
              cameraState === 'ready' && !capturedImage
                ? ''
                : 'camera-capture-video-hidden'
            }`}
            autoPlay
            muted
            playsInline
          />

          {capturedImage ? (
            /* ── Preview mode ── */
            <div className='camera-capture-preview-overlay'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={capturedImage}
                alt='Captured selfie'
                className='camera-capture-preview-image'
              />

              {isSubmitting ? (
                /* ── Analyzing overlay ── */
                <div className='camera-capture-analyzing-overlay'>
                  <div className='camera-capture-analyzing-card'>
                    <p className='camera-capture-analyzing-title'>
                      ANALYZING IMAGE...
                    </p>
                    <div className='camera-capture-analyzing-dots'>
                      <div className='camera-capture-analyzing-dot animate-[bounce_1s_infinite_0ms]' />
                      <div className='camera-capture-analyzing-dot animate-[bounce_1s_infinite_250ms]' />
                      <div className='camera-capture-analyzing-dot animate-[bounce_1s_infinite_500ms]' />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className='camera-capture-great-shot'>GREAT SHOT!</div>
                  <div className='camera-capture-preview-actions-wrap'>
                    <h2 className='camera-capture-preview-title'>Preview</h2>
                    <div className='camera-capture-preview-actions'>
                      <button
                        className='camera-capture-retake-btn'
                        type='button'
                        onClick={handleRetake}
                      >
                        Retake
                      </button>
                      <button
                        className='camera-capture-use-photo-btn'
                        type='button'
                        onClick={handleUsePhoto}
                      >
                        Use This Photo
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : null}

          {cameraState === 'ready' && !capturedImage && (
            <div className='camera-capture-take-picture'>
              <div className='camera-capture-take-picture-label'>
                TAKE PICTURE
              </div>
              <button
                className='camera-capture-take-picture-btn'
                type='button'
                onClick={handleTakePicture}
                aria-label='Take Picture'
              >
                <Image
                  alt='Take Picture'
                  width={60}
                  height={60}
                  className='camera-capture-take-picture-icon'
                  src='/take-picture-icon.png'
                />
              </button>
            </div>
          )}

          {cameraState === 'ready' && !capturedImage && (
            <div className='camera-capture-guidance'>
              <p className='camera-capture-guidance-title'>
                TO GET BETTER RESULTS MAKE SURE TO HAVE
              </p>
              <div className='camera-capture-guidance-list'>
                <p>◇ NEUTRAL EXPRESSION</p>
                <p>◇ FRONTAL POSE</p>
                <p>◇ ADEQUATE LIGHTING</p>
              </div>
            </div>
          )}

          <div className='camera-capture-back-wrap'>
            <Link href='/testing'>
              <div>
                <div className='camera-capture-back-mobile'>
                  <span className='camera-capture-back-mobile-text'>BACK</span>
                </div>
                <div className='group camera-capture-back-desktop'>
                  <div className='camera-capture-back-desktop-diamond' />
                  <span className='camera-capture-back-desktop-arrow'>▶</span>
                  <span className='camera-capture-back-desktop-label'>
                    BACK
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
