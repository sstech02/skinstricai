import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Skinstric AI Clone',
  description: 'A clone of Skinstric AI'
}

export default function RootLayout ({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' className='app-root-html'>
      <body className='app-root-body'>
        {children}
        <script src='js/main.js' async></script>
      </body>
    </html>
  )
}
