'use client'
import { useState, useEffect } from 'react'
import { ArrowRight, Leaf, Recycle, Users, Coins, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Poppins } from 'next/font/google'
import Link from 'next/link'
import Image from 'next/image'

const poppins = Poppins({
  weight: ['300', '400', '600'],
  subsets: ['latin'],
  display: 'swap',
})

function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-800 via-blue-600 to-white rounded-3xl p-8 md:p-12 mb-20">
      <div className="relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
          <span className="bg-gradient-to-r from-white via-blue-300 to-blue-600 bg-clip-text text-transparent animate-[spin_3s_linear_infinite]">
            Welcome to <span className="font-extrabold">WasteHero</span>
          </span>
        </h1>
        <p className="text-xl text-blue-50 max-w-2xl leading-relaxed mb-8">
          Join our community in making waste management more efficient and rewarding. Every piece of waste collected brings us closer to a cleaner world.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/report">
            <Button className="bg-white text-lg py-6 px-8 rounded-full font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
              <span className="text-white font-semibold">Report Waste</span>
              <ArrowRight className="ml-2 h-5 w-5 text-white" />
            </Button>
          </Link>
          <Link href="/collect">
            <Button className="bg-blue-700 text-white hover:bg-blue-800 text-lg py-6 px-8 rounded-full font-medium transition-all duration-300">
              Start Collecting
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="absolute right-0 top-0 w-1/3 h-full mix-blend-screen opacity-30">
        <Image
          src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b"
          alt="Recycling"
          fill
          className="object-cover brightness-125 contrast-110 saturate-150"
        />
      </div>
    </div>
  )
}


function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="bg-blue-100 p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-6">
        <Icon className="h-8 w-8 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}

export default function Home() {
  return (
    <div className={`container mx-auto px-4 py-8 ${poppins.className}`}>
      <HeroSection />

      <section className="grid md:grid-cols-3 gap-8 mb-20">
        <FeatureCard
          icon={Leaf}
          title="Eco-Friendly"
          description="Make a real impact on the environment by reporting and collecting waste in your community."
        />
        <FeatureCard
          icon={Coins}
          title="Earn Rewards"
          description="Get rewarded for your environmental contributions with our points system."
        />
        <FeatureCard
          icon={Users}
          title="Community-Driven"
          description="Join a growing network of environmental heroes making a difference."
        />
      </section>
    </div>
  )
}
