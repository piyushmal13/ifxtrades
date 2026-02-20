"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-provider"
import { useRouter } from "next/navigation"

export default function AlgosPage() {
  const { supabase, session } = useAuth()
  const router = useRouter()
  const [algos, setAlgos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlgos = async () => {
      const { data } = await supabase
        .from("algos")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true })
      
      setAlgos(data || [])
      setLoading(false)
    }
    fetchAlgos()
  }, [supabase])

  const handlePurchase = async (algo: any) => {
    if (!session) {
      router.push("/login?redirect=/algos")
      return
    }
    
    // Placeholder for Stripe Payment
    const confirmPurchase = confirm(`Purchase license for ${algo.title} for $${algo.price}?`)
    if (!confirmPurchase) return

    const { error } = await supabase
      .from("user_licenses")
      .insert({
        user_id: session.user.id,
        algo_id: algo.id,
        status: 'active'
      })

    if (!error) {
      alert("License Purchased Successfully! Check your dashboard.")
      router.push("/dashboard")
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#C6A23A]">Loading Marketplace...</div>

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif text-[#0E1A2B] mb-4">Institutional Algorithms</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Access high-frequency trading strategies powered by our proprietary engine. 
            Licensed for individual and institutional use.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {algos.map(algo => (
            <div key={algo.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 border border-gray-100 flex flex-col">
              <div className="h-48 bg-gray-200 relative">
                {algo.image_url && (
                  <img src={algo.image_url} alt={algo.title} className="w-full h-full object-cover" />
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                  {algo.risk_level} Risk
                </div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-[#0E1A2B] mb-2">{algo.title}</h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-3 flex-1">{algo.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8 bg-gray-50 p-4 rounded-xl">
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wider">Est. ROI</span>
                    <span className="text-lg font-bold text-green-600">{algo.monthly_roi}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 uppercase tracking-wider">Min Invest</span>
                    <span className="text-lg font-bold text-[#0E1A2B]">${algo.min_investment}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-100">
                  <div>
                    <span className="block text-xs text-gray-400">License Fee</span>
                    <span className="text-2xl font-serif font-bold text-[#0E1A2B]">${algo.price}</span>
                  </div>
                  <button 
                    onClick={() => handlePurchase(algo)}
                    className="bg-[#0E1A2B] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#C6A23A] transition"
                  >
                    Get License
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {algos.length === 0 && (
          <div className="text-center py-20 text-gray-400">No algorithms currently available for licensing.</div>
        )}
      </div>
    </div>
  )
}