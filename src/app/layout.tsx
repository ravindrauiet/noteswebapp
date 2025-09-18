import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '../contexts/ThemeContext'
import { NoteProvider } from '../contexts/NoteContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Google Keep Clone',
  description: 'A modern note-taking app inspired by Google Keep',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <NoteProvider>
            {children}
          </NoteProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}