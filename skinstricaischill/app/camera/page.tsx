'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CameraPage () {
  const router = useRouter()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.push('/camera/capture')
    }, 2500)

    return () => window.clearTimeout(timer)
  }, [router])

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

      <div className='camera-page-shell'>
        <div className='camera-loading-inner'>
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

            <div className='camera-loading-icon-stack'>
              <Image
                alt='Camera Icon'
                width={136}
                height={136}
                className='camera-loading-icon'
                src='/camera-icon.png'
              />
              <p className='camera-setup-text'>SETTING UP CAMERA ...</p>
            </div>
          </div>

          <div className='camera-guidance-wrapper'>
            <p className='camera-guidance-title'>
              TO GET BETTER RESULTS MAKE SURE TO HAVE
            </p>
            <div className='camera-guidance-list'>
              <p className='camera-guidance-item'>◇ NEUTRAL EXPRESSION</p>
              <p className='camera-guidance-item'>◇ FRONTAL POSE</p>
              <p className='camera-guidance-item'>◇ ADEQUATE LIGHTING</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
