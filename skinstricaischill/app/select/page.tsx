'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type HoveredTile = 'none' | 'demographics' | 'cosmetic' | 'skin' | 'weather'

export default function SelectPage () {
  const [hoveredTile, setHoveredTile] = useState<HoveredTile>('none')

  const isSmallLayerActive = hoveredTile === 'demographics'
  const isMediumLayerActive =
    hoveredTile === 'cosmetic' || hoveredTile === 'skin'
  const isLargeLayerActive = hoveredTile === 'weather'

  const getLayerStyle = (isActive: boolean, activeSize: string) => ({
    width: isActive ? activeSize : '400px',
    height: isActive ? activeSize : '400px',
    opacity: isActive ? 1 : 0
  })

  const smallLayerStyle = getLayerStyle(isSmallLayerActive, '602px')
  const mediumLayerStyle = getLayerStyle(isMediumLayerActive, '682px')
  const largeLayerStyle = getLayerStyle(isLargeLayerActive, '762px')

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

      <div>
        <div className='select-analysis-header'>
          <h1 className='select-title'>A.I. ANALYSIS</h1>
          <p className='select-subtitle'>
            A.I. HAS ESTIMATED THE FOLLOWING.
            <br />
            FIX ESTIMATED INFORMATION IF NEEDED.
          </p>
        </div>

        <div
          className='select-grid-area'
          onMouseLeave={() => setHoveredTile('none')}
        >
          <div className='relative'>
            <div className='select-diamond-layer-wrapper'>
              <div className='select-diamond-layer' style={smallLayerStyle}>
                <Image
                  alt='Diamond Small'
                  fill
                  src='/res-diamond-small.png'
                  className='object-contain'
                  sizes='400px'
                />
              </div>
            </div>
            <div className='select-diamond-layer-wrapper'>
              <div className='select-diamond-layer' style={mediumLayerStyle}>
                <Image
                  alt='Diamond Medium'
                  fill
                  src='/res-diamond-medium.png'
                  className='object-contain'
                  sizes='400px'
                />
              </div>
            </div>
            <div className='select-diamond-layer-wrapper'>
              <div className='select-diamond-layer' style={largeLayerStyle}>
                <Image
                  alt='Diamond Large'
                  fill
                  src='/res-diamond-large.png'
                  className='object-contain'
                  sizes='400px'
                />
              </div>
            </div>

            <div className='select-tile-grid'>
              <div
                className='select-tile-cell-top'
                onMouseEnter={() => setHoveredTile('demographics')}
              >
                <Link href='/summary'>
                  <button
                    type='button'
                    className='select-diamond-btn select-diamond-btn-primary'
                  >
                    <span className='select-diamond-btn-label'>
                      Demographics
                    </span>
                  </button>
                </Link>
              </div>

              <div
                className='select-tile-cell-left'
                onMouseEnter={() => setHoveredTile('cosmetic')}
              >
                <button
                  type='button'
                  className='select-diamond-btn select-diamond-btn-secondary'
                >
                  <span className='select-diamond-btn-label'>
                    Cosmetic
                    <br />
                    Concerns
                  </span>
                </button>
              </div>

              <div
                className='select-tile-cell-right'
                onMouseEnter={() => setHoveredTile('skin')}
              >
                <button
                  type='button'
                  className='select-diamond-btn select-diamond-btn-secondary'
                >
                  <span className='select-diamond-btn-label'>
                    Skin Type
                    <br />
                    Details
                  </span>
                </button>
              </div>

              <div
                className='select-tile-cell-bottom'
                onMouseEnter={() => setHoveredTile('weather')}
              >
                <button
                  type='button'
                  className='select-diamond-btn select-diamond-btn-secondary'
                >
                  <span className='select-diamond-btn-label'>Weather</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className='select-bottom-nav-wrapper'>
          <div className='select-nav-row'>
            <Link href='/result'>
              <div>
                <div className='select-nav-btn-mobile'>
                  <span className='select-nav-btn-mobile-text'>BACK</span>
                </div>
                <div className='group select-nav-btn-desktop'>
                  <div className='select-nav-btn-desktop-diamond' />
                  <span className='select-nav-back-arrow'>▶</span>
                  <span className='select-nav-back-label'>BACK</span>
                </div>
              </div>
            </Link>

            <Link href='/summary'>
              <div>
                <div className='select-nav-btn-mobile'>
                  <span className='select-nav-btn-mobile-text'>SUM</span>
                </div>
                <div className='group select-nav-btn-desktop'>
                  <span className='select-nav-summary-label'>GET SUMMARY</span>
                  <div className='select-nav-btn-desktop-diamond' />
                  <span className='select-nav-summary-arrow'>▶</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
