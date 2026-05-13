'use client'

import { type RefObject, useLayoutEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'

const EASE = 'power2.inOut'
const HEADING_DURATION = 0.7

type HoverAnimationConfig = {
  sectionRef: RefObject<HTMLDivElement | null>
  sectionOpacity: number
  sectionDuration: number
  headingX: string | number
  headingDelay: number
  lineX: string | number
  lineDelay: number
}

export default function Page () {
  const heroSectionRef = useRef<HTMLDivElement>(null)
  const mainHeadingRef = useRef<HTMLHeadingElement>(null)
  const skincareLineRef = useRef<HTMLSpanElement>(null)
  const leftSectionRef = useRef<HTMLDivElement>(null)
  const rightSectionRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!heroSectionRef.current || !mainHeadingRef.current || !skincareLineRef.current) {
      return
    }

    const ctx = gsap.context(() => {
      gsap.set(mainHeadingRef.current, { opacity: 0 })
      gsap.timeline().to(mainHeadingRef.current, {
        opacity: 1,
        duration: 1.5,
        ease: EASE
      })
    }, heroSectionRef)

    return () => ctx.revert()
  }, [])

  const runHoverAnimation = ({
    sectionRef,
    sectionOpacity,
    sectionDuration,
    headingX,
    headingDelay,
    lineX,
    lineDelay
  }: HoverAnimationConfig) => {
    if (!mainHeadingRef.current || !skincareLineRef.current) {
      return
    }

    if (sectionRef.current) {
      gsap.to(sectionRef.current, {
        opacity: sectionOpacity,
        duration: sectionDuration,
        ease: EASE,
        overwrite: 'auto'
      })
    }

    gsap.to(mainHeadingRef.current, {
      x: headingX,
      duration: HEADING_DURATION,
      ease: EASE,
      delay: headingDelay,
      overwrite: 'auto'
    })

    gsap.to(skincareLineRef.current, {
      x: lineX,
      duration: HEADING_DURATION,
      ease: EASE,
      delay: lineDelay,
      overwrite: 'auto'
    })
  }

  const animateTakeTestIn = () => {
    runHoverAnimation({
      sectionRef: leftSectionRef,
      sectionOpacity: 0,
      sectionDuration: 0.4,
      headingX: '-20rem',
      headingDelay: 0.1,
      lineX: '-6rem',
      lineDelay: 0.1
    })
  }

  const animateTakeTestOut = () => {
    runHoverAnimation({
      sectionRef: leftSectionRef,
      sectionOpacity: 1,
      sectionDuration: 0.4,
      headingX: 0,
      headingDelay: 0.1,
      lineX: 0,
      lineDelay: 0.01
    })
  }

  const animateDiscoverIn = () => {
    runHoverAnimation({
      sectionRef: rightSectionRef,
      sectionOpacity: 0,
      sectionDuration: 0.3,
      headingX: '20rem',
      headingDelay: 0.1,
      lineX: '6rem',
      lineDelay: 0.01
    })
  }

  const animateDiscoverOut = () => {
    runHoverAnimation({
      sectionRef: rightSectionRef,
      sectionOpacity: 1,
      sectionDuration: 0.3,
      headingX: 0,
      headingDelay: 0.01,
      lineX: 0,
      lineDelay: 0.01
    })
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
        <button className='enter-code-btn'>ENTER CODE</button>
      </div>

      <div className='page-container'>
        <div ref={heroSectionRef} className='hero-section'>
          <div className='diamond-overlay'>
            <div className='diamond-sm' />
          </div>
          <div className='diamond-overlay'>
            <div className='diamond-lg' />
          </div>

          <div id='main-heading' className='hero-heading-wrapper text-center'>
            <h1 ref={mainHeadingRef} className='hero-heading'>
              Sophisticated
              <br />
              <span ref={skincareLineRef} className='hero-heading-span'>
                skincare
              </span>
            </h1>
          </div>

          <p className='hero-description-mobile'>
            Skinstric developed an A.I. that creates a highly-personalized
            routine tailored to what your skin needs.
          </p>

          <div className='enter-experience-wrapper'>
            <Link href='/testing'>
              <button className='enter-experience-btn'>
                <span className='enter-experience-btn-text'>
                  ENTER EXPERIENCE
                </span>
                <div className='enter-experience-btn-diamond' />
                <span className='enter-experience-btn-icon'>
                  <svg
                    viewBox='0 0 24 24'
                    width={24}
                    height={24}
                    className='enter-experience-icon-svg'
                  >
                    <path d='M8 5v14l11-7z' />
                  </svg>
                </span>
              </button>
            </Link>
          </div>

          <div className='description-desktop'>
            <p>
              Skinstric developed an A.I. that creates a
              <br />
              highly-personalized routine tailored to
              <br />
              what your skin needs.
            </p>
          </div>

          <div
            id='left-section'
            ref={leftSectionRef}
            className='left-section'
            onMouseEnter={animateDiscoverIn}
            onMouseLeave={animateDiscoverOut}
          >
            <div className='section-inner'>
              <div className='left-section-diamond' />
              <button id='discover-button' className='discover-btn'>
                <div className='discover-btn-diamond' />
                <span className='discover-btn-arrow'>▶</span>
                <span>DISCOVER A.I.</span>
              </button>
            </div>
          </div>

          <div
            id='right-section'
            ref={rightSectionRef}
            className='right-section'
            onMouseEnter={animateTakeTestIn}
            onMouseLeave={animateTakeTestOut}
          >
            <div className='section-inner'>
              <div className='right-section-diamond' />
              <Link href='/testing'>
                <button id='take-test-button' className='take-test-btn'>
                  TAKE TEST
                  <div className='take-test-btn-diamond' />
                  <span className='take-test-btn-arrow'>▶</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
