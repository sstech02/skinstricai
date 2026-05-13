'use client'

import { FormEvent, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type SubmissionStep = 'name' | 'city' | 'processing' | 'success'

export default function Testing () {
  const [step, setStep] = useState<SubmissionStep>('name')
  const [name, setName] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const inputPlaceholder =
    step === 'name' ? 'Introduce Yourself' : 'your city name'

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault()

    const trimmedValue = inputValue.trim()
    if (trimmedValue.length === 0 || step === 'processing') {
      return
    }

    setErrorMessage('')

    if (step === 'name') {
      setName(trimmedValue)
      setInputValue('')
      setStep('city')
      return
    }

    setStep('processing')

    try {
      const response = await fetch('/api/phase-one', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          location: trimmedValue
        })
      })

      if (!response.ok) {
        throw new Error('Submission failed')
      }

      setStep('success')
    } catch {
      setStep('city')
      setErrorMessage('Unable to submit right now. Please try again.')
    }
  }

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
            priority
          />
          <p className='navbar-section-label'>INTRO</p>
          <Image
            alt='right-bracket'
            width={5}
            height={19}
            className='navbar-bracket'
            src='/right-bracket.png'
            priority
          />
        </div>
        <button className='enter-code-btn' suppressHydrationWarning>
          ENTER CODE
        </button>
      </div>

      <div className='testing-shell'>
        <div className='testing-start-label'>
          <p className='testing-start-text'>TO START ANALYSIS</p>
        </div>

        <div className='testing-stage'>
          {step !== 'processing' && step !== 'success' && (
            <>
              <p className='testing-click-label'>CLICK TO TYPE</p>

              <form className='testing-form' onSubmit={handleSubmit}>
                <input
                  className='testing-input'
                  placeholder={inputPlaceholder}
                  autoComplete='off'
                  type='text'
                  name={step === 'name' ? 'name' : 'location'}
                  value={inputValue}
                  onChange={event => setInputValue(event.target.value)}
                  suppressHydrationWarning
                />
                <button
                  type='submit'
                  className='sr-only'
                  suppressHydrationWarning
                >
                  Submit
                </button>
              </form>
            </>
          )}

          {step === 'processing' && (
            <div className='relative z-10'>
              <p className='testing-processing-text'>Processing submission</p>
              <div
                className='flex items-center justify-center space-x-4 py-8'
                aria-hidden='true'
              >
                <div className='h-2 w-2 rounded-full bg-[#1A1B1C] opacity-30 animate-[bounce_1s_infinite_0ms]' />
                <div className='h-2 w-2 rounded-full bg-[#1A1B1C] opacity-30 animate-[bounce_1s_infinite_250ms]' />
                <div className='h-2 w-2 rounded-full bg-[#1A1B1C] opacity-30 animate-[bounce_1s_infinite_500ms]' />
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className='testing-success'>
              <p className='testing-success-title'>Thank you!</p>
              <p className='testing-success-subtitle'>
                Proceed for the next step
              </p>
            </div>
          )}

          {errorMessage.length > 0 && (
            <p className='testing-error'>{errorMessage}</p>
          )}

          <Image
            alt='Diamond Large'
            src='/diamond-large.png'
            width={480}
            height={480}
            className='testing-diamond-large'
          />
          <Image
            alt='Diamond Medium'
            src='/diamond-medium.png'
            width={400}
            height={400}
            className='testing-diamond-medium'
          />
          <Image
            alt='Diamond Small'
            src='/diamond-small.png'
            width={320}
            height={320}
            className='testing-diamond-small'
          />
        </div>

        <div className='testing-bottom-nav'>
          <Link className='inset-0' aria-label='Back' href='/'>
            <div>
              <div className='testing-back-mobile'>
                <span className='testing-back-mobile-text'>BACK</span>
              </div>

              <div className='group testing-back-desktop'>
                <div className='testing-back-desktop-diamond' />
                <span className='testing-back-desktop-arrow'>▶</span>
                <span className='testing-back-desktop-label'>BACK</span>
              </div>
            </div>
          </Link>

          {step === 'success' && (
            <Link
              className='inline-block testing-proceed-slide-in'
              href='/result'
            >
              <div>
                <div className='testing-proceed-mobile'>
                  <span className='testing-proceed-mobile-text'>PROCEED</span>
                </div>

                <div className='group testing-proceed-desktop'>
                  <span className='testing-proceed-desktop-label'>PROCEED</span>
                  <div className='testing-proceed-desktop-diamond' />
                  <span className='testing-proceed-desktop-arrow'>▶</span>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
