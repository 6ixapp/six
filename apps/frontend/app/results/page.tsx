"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Confetti } from "@/components/ui/confetti"

export default function Results() {
  const changingWords = [" forms", " quizzes", "swiping"]
  const fixedWord = "No "
  const [wordIndex, setWordIndex] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setWordIndex((prevIndex) => (prevIndex + 1) % changingWords.length)
        setFade(true)
      }, 200)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-white relative">
      {/* Confetti effect */}
      <Confetti />

      {/* Spinning Logo */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        className="mb-8 w-24 h-24 md:w-32 md:h-32"
      >
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2025-05-02_at_01.06.38_d839fae5-removebg-preview-P52XHHFvphG0yUUk5xcXsOcGzLqlQw.png"
          alt="Logo"
          width={128}
          height={128}
          className="w-full h-full object-contain"
        />
      </motion.div>

      {/* Main Headings */}
      <div className="flex flex-col justify-center items-center mb-4 space-y-3">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 whitespace-nowrap">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
            Six
          </span>
        </h1>

        {/* Extra Subheading */}
        
      </div>
    </main>
  )
}
