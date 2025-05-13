"use client"

import type React from "react"
import { useState, useRef } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Arrow31 from "@/components/arrow31"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase"
import Link from "next/link"

export default function ProfileSetup() {
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedOption, setSelectedOption] = useState<"instagram" | "camera" | null>(null)

  const handleCameraRollClick = () => {
    setSelectedOption("camera")
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)

    try {
      const storageRef = ref(storage, `profilePictures/${Date.now()}-${file.name}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      setProfileImage(downloadURL)
      
      // Send notification about camera upload
      await fetch('/api/upload-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: 'camera',
          photoUrl: downloadURL
        }),
      });
    } catch (error) {
      console.error("Upload failed:", error)
      alert("Image upload failed. Please try again.")
    }

    setIsLoading(false)
  }

  const handleInstagramClick = async () => {
    setSelectedOption("instagram")
    setIsLoading(true)
    try {
      // Send notification about Instagram selection
      await fetch('/api/upload-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: 'instagram'
        }),
      });
      
      // Navigate to results page immediately
      window.location.href = '/signup'
    } catch (error) {
      console.error('Error processing Instagram selection:', error);
      alert('Failed to process Instagram selection. Please try again.');
    }
    setIsLoading(false);
  }

  const handleSubmit = async () => {
    if (selectedOption === "instagram") {
      handleInstagramClick();
    } else if (selectedOption === "camera" && profileImage) {
      // Send final notification for camera upload
      try {
        await fetch('/api/upload-photo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            source: 'camera',
            photoUrl: profileImage
          }),
        });
        // Navigate to results page
        window.location.href = '/signup'
      } catch (error) {
        console.error('Error submitting profile:', error);
        alert('Failed to submit profile. Please try again.');
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white">
      <div className="w-full max-w-md space-y-8 flex flex-col items-center">
        {/* Logo */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          className="mb-4 w-20 h-20 md:w-28 md:h-28"
        >
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp_Image_2025-05-02_at_01.06.38_d839fae5-removebg-preview-P52XHHFvphG0yUUk5xcXsOcGzLqlQw.png"
            alt="Logo"
            width={112}
            height={112}
            className="w-full h-full object-contain"
          />
        </motion.div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Your profile</h1>
        </div>

        <div className="space-y-4 w-full flex flex-col items-center">
          {/* Instagram Button */}
          <button
            onClick={handleInstagramClick}
            disabled={isLoading}
            className={`w-full max-w-[350px] px-6 py-4 rounded-full text-gray-600 text-lg font-medium transition-all duration-300
              ${selectedOption === "instagram"
                ? "border-4 border-pink-500"
                : "border-2 border-gray-300 hover:border-pink-400 hover:border-4"}`}
          >
            {isLoading ? "Processing..." : "Use Instagram profile pic"}
          </button>

          {/* Camera Roll Button */}
          <button
            onClick={handleCameraRollClick}
            disabled={isLoading}
            className={`w-full max-w-[350px] px-6 py-4 rounded-full text-gray-600 text-lg font-medium transition-all duration-300
              ${selectedOption === "camera"
                ? "border-4 border-pink-500"
                : "border-2 border-gray-300 hover:border-pink-400 hover:border-4"}`}
          >
            {isLoading && selectedOption === "camera" ? "Processing..." : "Upload from camera roll"}
          </button>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            aria-label="Upload profile picture"
          />

          {/* Uploaded Preview */}
          {profileImage && (
            <div className="mt-6 w-32 h-32 relative rounded-full overflow-hidden border-4 border-pink-500">
              <Image src={profileImage} alt="Profile Preview" layout="fill" objectFit="cover" />
            </div>
          )}

          {/* Submit Button - Always visible */}
          <div className="relative flex flex-col items-center mt-10">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className={`w-40 py-6 px-6 rounded-full text-xl font-medium bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500
                ${isLoading ? "opacity-50 cursor-not-allowed" : "text-white"}`}
            >
              {isLoading ? "Processing..." : "Submit"}
            </Button>
            {/* Arrow + Handwritten Note */}
            <div className="absolute -right-32 top-0 flex flex-col items-start">
              <Arrow31 className="w-16 h-24 text-purple-500 -rotate-130 scale-x-[-1] mb-2 ml-4" aria-hidden="true" />
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ana.jpg-vz9YijNCqgDmCD2QJERI5M2B5uBztb.jpeg"
                alt="Handwritten note"
                width={180}
                height={120}
                className="object-contain -mt-4 -ml-8"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
