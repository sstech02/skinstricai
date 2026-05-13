'use client'

import { useRef, useState, ChangeEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const PHASE_TWO_ENDPOINT =
  'https://us-central1-api-skinstric-ai.cloudfunctions.net/skinstricPhaseTwo'
const SUCCESS_MESSAGE = 'Image analyzed successfully!'
const PHASE_TWO_STORAGE_KEY = 'skinstricPhaseTwoResult'

export default function ResultPage () {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCameraPrompt, setShowCameraPrompt] = useState(false)
  const [error, setError] = useState('')

  const uploadBase64Image = async (base64: string): Promise<void> => {
    const response = await fetch(PHASE_TWO_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64 })
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const contentType = response.headers.get('content-type') || ''

    if (contentType.includes('application/json')) {
      const payload = (await response.json()) as unknown
      localStorage.setItem(PHASE_TWO_STORAGE_KEY, JSON.stringify(payload))
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsSubmitting(true)
    setError('')

    const reader = new FileReader()
    reader.onload = async () => {
      const dataUrl = reader.result as string
      setImagePreview(dataUrl)

      try {
        const base64 = dataUrl.split(',')[1]
        await uploadBase64Image(base64)
        window.alert(SUCCESS_MESSAGE)
        router.push('/select')
      } catch {
        setError('Unable to process image. Please try again.')
        setIsSubmitting(false)
      }
    }
    reader.onerror = () => {
      setError('Unable to read selected image. Please try another file.')
      setIsSubmitting(false)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleGalleryClick = () => {
    if (isSubmitting) {
      return
    }

    setError('')
    fileInputRef.current?.click()
  }

  const openCameraPrompt = () => {
    if (isSubmitting) {
      return
    }

    setShowCameraPrompt(true)
    setError('')
  }

  const handleCameraAllow = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      setShowCameraPrompt(false)
      router.push('/camera')
    } catch {
      setError('Camera access was denied. Please allow access to continue.')
    }
  }

  const handleCameraDeny = () => {
    setShowCameraPrompt(false)
  }

  const handleProceed = async () => {
    if (!imagePreview || isSubmitting) return

    setIsSubmitting(true)
    setError('')

    // Strip the data URL prefix to get the raw base64 string
    const base64 = imagePreview.split(',')[1]

    try {
      await uploadBase64Image(base64)
      window.alert(SUCCESS_MESSAGE)
      router.push('/select')
    } catch {
      setError('Unable to process image. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className='result-wrapper'>
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

      <div className='result-main'>
        <div className='result-start-label'>
          <p className='result-start-text'>TO START ANALYSIS</p>
        </div>

        <div
          className={`result-diamonds-section ${
            isSubmitting ? 'result-faded-disabled' : ''
          }`}
        >
          {/* Camera / scan left diamond */}
          <div className='result-diamond-left'>
            <div className='result-diamond-spacer' />
            <Image
              alt='Diamond Large'
              width={482}
              height={482}
              className='result-diamond-large-left'
              src='/res-diamond-large.png'
            />
            <Image
              alt='DiamondMedium'
              width={444}
              height={444}
              className='result-diamond-medium-left'
              src='/res-diamond-medium.png'
            />
            <Image
              alt='DiamondSmall'
              width={405}
              height={405}
              className='result-diamond-small'
              src='/res-diamond-small.png'
            />

            <div className='result-diamond-inner'>
              <Image
                alt='Camera Icon'
                width={136}
                height={136}
                className='result-icon'
                src='/camera-icon.png'
                onClick={openCameraPrompt}
              />
              <div
                className='result-scan-label result-clickable'
                role='button'
                tabIndex={0}
                onClick={openCameraPrompt}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openCameraPrompt()
                  }
                }}
              >
                <p className='result-scan-text'>
                  ALLOW A.I.
                  <br />
                  TO SCAN YOUR FACE
                </p>
                <Image
                  alt='Scan Line'
                  width={66}
                  height={59}
                  className='result-scan-line'
                  src='/res-scan-line.png'
                />
              </div>

              {showCameraPrompt && (
                <div className='result-camera-prompt'>
                  <div className='result-camera-prompt-card'>
                    <h2 className='result-camera-prompt-title'>
                      ALLOW A.I. TO ACCESS YOUR CAMERA
                    </h2>
                    <div className='result-camera-prompt-actions'>
                      <button
                        className='result-camera-deny-btn'
                        type='button'
                        onClick={handleCameraDeny}
                      >
                        DENY
                      </button>
                      <button
                        className='result-camera-allow-btn'
                        type='button'
                        onClick={handleCameraAllow}
                      >
                        ALLOW
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gallery / upload right diamond */}
          <div
            className={`result-diamond-right ${
              showCameraPrompt || isSubmitting ? 'result-faded-disabled' : ''
            }`}
          >
            <div className='result-diamond-spacer' />
            <Image
              alt='Diamond Large'
              width={484}
              height={484}
              className='result-diamond-large-right'
              src='/res-diamond-large.png'
            />
            <Image
              alt='DiamondMedium'
              width={448}
              height={448}
              className='result-diamond-medium-right'
              src='/res-diamond-medium.png'
            />
            <Image
              alt='DiamondSmall'
              width={408}
              height={408}
              className='result-diamond-small'
              src='/res-diamond-small.png'
            />

            <div className='result-diamond-inner'>
              <Image
                alt='Photo Upload Icon'
                width={136}
                height={136}
                className='result-icon'
                src='/gallery-icon.png'
                onClick={handleGalleryClick}
              />
              <div
                className='result-gallery-label result-clickable'
                role='button'
                tabIndex={0}
                onClick={handleGalleryClick}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleGalleryClick()
                  }
                }}
              >
                <p className='result-gallery-text'>
                  ALLOW A.I.
                  <br />
                  ACCESS GALLERY
                </p>
                <Image
                  alt='Gallery Line'
                  width={66}
                  height={59}
                  className='result-gallery-line'
                  src='/res-gallery-line.png'
                />
              </div>
            </div>
          </div>

          {/* Preview box */}
          <div
            className={`result-preview ${
              showCameraPrompt || isSubmitting ? 'result-faded-disabled' : ''
            }`}
          >
            <h1 className='result-preview-heading'>Preview</h1>
            <div className='result-preview-box'>
              {imagePreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt='Selected preview'
                  src={imagePreview}
                  className='result-preview-image'
                />
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            accept='image/*'
            className='hidden'
            type='file'
            onChange={handleFileChange}
          />
        </div>

        {error && <p className='result-error-message'>{error}</p>}

        {isSubmitting && (
          <div className='result-processing-overlay' aria-live='polite'>
            <div className='camera-loading-diamond-stage'>
              <div className='result-diamond-spacer' />
              <Image
                alt='Diamond Large'
                width={482}
                height={482}
                className='camera-loading-diamond-large'
                src='/res-diamond-large.png'
              />
              <Image
                alt='DiamondMedium'
                width={444}
                height={444}
                className='camera-loading-diamond-medium'
                src='/res-diamond-medium.png'
              />
              <Image
                alt='DiamondSmall'
                width={405}
                height={405}
                className='camera-loading-diamond-small'
                src='/res-diamond-small.png'
              />
              <div className='result-processing-text'>
                <p className='testing-processing-text'>
                  Preparing your analysis
                </p>
                <div
                  className='flex items-center justify-center space-x-4 py-8'
                  aria-hidden='true'
                >
                  <div className='h-2 w-2 rounded-full bg-[#1A1B1C] opacity-30 animate-[bounce_1s_infinite_0ms]' />
                  <div className='h-2 w-2 rounded-full bg-[#1A1B1C] opacity-30 animate-[bounce_1s_infinite_250ms]' />
                  <div className='h-2 w-2 rounded-full bg-[#1A1B1C] opacity-30 animate-[bounce_1s_infinite_500ms]' />
                </div>
              </div>
            </div>
          </div>
        )}

        {!isSubmitting && (
          <div className='result-bottom-nav'>
            <div className='result-nav-buttons'>
              <Link className='relative' aria-label='Back' href='/testing'>
                <div>
                  <div className='result-nav-btn-mobile'>
                    <span className='result-nav-btn-mobile-text'>BACK</span>
                  </div>
                  <div className='group result-nav-btn-desktop'>
                    <div className='result-nav-btn-desktop-diamond' />
                    <span className='result-back-arrow'>▶</span>
                    <span className='result-back-label'>BACK</span>
                  </div>
                </div>
              </Link>

              <button
                onClick={handleProceed}
                disabled={!imagePreview || isSubmitting}
                aria-label='Proceed'
                className={imagePreview ? 'relative' : 'invisible'}
              >
                <div>
                  <div className='result-proceed-btn-mobile'>
                    <span className='result-nav-btn-mobile-text'>
                      {isSubmitting ? '...' : 'PROCEED'}
                    </span>
                  </div>
                  <div className='group result-nav-btn-desktop'>
                    <span className='result-proceed-label'>
                      {isSubmitting ? 'PROCESSING...' : 'PROCEED'}
                    </span>
                    <div className='result-nav-btn-desktop-diamond' />
                    <span className='result-proceed-arrow'>▶</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
