"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Contact() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mb-12">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-pink-500">
            Contact Us
          </h1>
          
          <p className="text-lg text-center text-gray-600">
            If you're facing any issues or have questions about Six, we're here to help. 
            Our team is dedicated to providing the best experience for our users. 
            Click the button below to fill out our contact form and we'll get back to you as soon as possible.
          </p>

          <div className="flex justify-center mt-8">
            <Link
              href="https://airtable.com/appNqQZ51v1FDfgRo/pag72eIDtgnfHLvYY/form"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="rounded-full bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white px-8 py-6 text-lg">
                Contact Form
              </Button>
            </Link>
          </div>

          <p className="text-sm text-center text-gray-500 mt-4">
            Alternatively, you can email us directly at{" "}
            <a href="mailto:contact@sixsocialapp.com" className="text-blue-500 hover:text-blue-600">
              contact@sixsocialapp.com
            </a>
          </p>
        </div>
      </div>
    </main>
  );
} 