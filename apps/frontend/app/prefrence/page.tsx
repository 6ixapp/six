"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SelectionPage() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null)

  const options = [
    { id: "friend", label: "A Friend" },
    { id: "date", label: "A Date" },
  ]

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId)
    // Save to localStorage
    localStorage.setItem("userPreference", optionId)
  }

  useEffect(() => {
    const storedPreference = localStorage.getItem("userPreference")
    if (storedPreference) {
      setSelectedOption(storedPreference)
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-white text-black transition-colors duration-300">
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

      <div className="max-w-xl mx-auto">
        <p className="text-xl mb-1 text-gray-700">I&apos;m looking for...</p>
      </div>

      <div className="mb-8 flex flex-col gap-4 w-full max-w-xs">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionSelect(option.id)}
            className={`w-full px-6 py-4 rounded-full border-2 text-xl mb-1 transition-all duration-300 ${
              selectedOption === option.id
                ? "border-4 border-pink-500"
                : "border-2 border-gray-300 hover:border-pink-400"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <Link href="/profile">
        <Button
          size="lg"
          className="rounded-full bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white px-8 py-6 text-lg h-auto mt-4"
          disabled={!selectedOption}
        >
          Next
        </Button>
      </Link>
    </div>
  )
}
