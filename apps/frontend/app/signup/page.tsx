"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    age: "",
    gender: "",
    phoneNumber: "",
    instagram: "",
    agreeToTerms: false,
  });

  const [userPreference, setUserPreference] = useState("");

  useEffect(() => {
    const storedPreference = typeof window !== 'undefined' ? localStorage.getItem('userPreference') : null;
    if (storedPreference) {
      setUserPreference(storedPreference);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isPhoneNumberValid = /^[0-9]{10}$/.test(formData.phoneNumber);

  const isFormValid =
    formData.firstName.trim() &&
    formData.age.trim() &&
    formData.gender &&
    formData.phoneNumber.trim() &&
    isPhoneNumberValid &&
    formData.instagram.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit triggered with:', formData);

    setIsLoading(true);

    try {
      // Send the form data
      fetch('https://six-production.up.railway.app/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUsername: formData.instagram,
          name: formData.firstName,
          phoneNumber: formData.phoneNumber,
          gender: formData.gender,
          age: formData.age,
          lookingFor: userPreference || ''
        }),
      }).then(async (response) => {
        const data = await response.json();
        console.log('Follow response:', data);
      }).catch((err) => {
        console.error('Follow error:', err);
      });

      // Wait for 3 seconds before redirecting
      setTimeout(() => {
        router.push('/results');
      }, 3000);
    } catch (err) {
      console.error('Error:', err);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-black flex flex-col items-center px-4 py-4">
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

      <p className="text-center text-xl mb-4 opacity-80 -mt-2">
        the only form we&apos;ll ever ask you to fill
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <div className="space-y-2">
          <label htmlFor="firstName" className="text-lg font-light">First name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full bg-zinc-100 text-black placeholder:text-zinc-500 rounded-md px-4 py-2 focus:outline-none"
            placeholder=""
          />
        </div>

        <div className="flex space-x-2">
          <div className="flex-1 space-y-2">
            <label htmlFor="age" className="text-lg font-light">Age</label>
            <input
              type="text"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full bg-zinc-100 text-black placeholder:text-zinc-500 rounded-md px-4 py-2 focus:outline-none"
              placeholder=""
            />
          </div>

          <div className="flex-1 space-y-2">
            <label htmlFor="gender" className="text-lg font-light">Gender</label>
            <div className="relative w-full">
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-zinc-100 text-black px-4 pr-10 py-2 rounded-md appearance-none focus:outline-none"
              >
                <option value="" disabled>Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-black">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="phoneNumber" className="text-lg font-light">Phone number</label>
          <input
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full bg-zinc-100 text-black placeholder:text-zinc-500 rounded-md px-4 py-2 focus:outline-none"
            placeholder=""
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="instagram" className="text-lg font-light">Instagram</label>
          <input
            type="text"
            id="instagram"
            name="instagram"
            value={formData.instagram}
            onChange={handleChange}
            className="w-full bg-zinc-100 text-black placeholder:text-zinc-500 rounded-md px-4 py-2 focus:outline-none"
            placeholder="Accept our request for verification"
          />
        </div>

        <p className="pt-1 text-xs text-zinc-600 text-center leading-relaxed px-4">
          *Disclaimer: our matching algorithm reads between the lines and decodes your voice, tone, energy – the little
          things even your therapist wouldn't get
        </p>

        <div className="pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className={`text-white bg-gradient-to-r from-pink-500 to-blue-500 hover:opacity-90 transition-opacity py-2.5 px-6 rounded-full text-lg font-medium mx-auto block -mt-6 relative ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <span className="opacity-0">Join</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              </>
            ) : (
              'Join'
            )}
          </button>
        </div>

        {isLoading && (
          <p className="text-center text-sm text-gray-500 animate-pulse">
            Processing your request...
          </p>
        )}
      </form>
    </main>
  );
}
