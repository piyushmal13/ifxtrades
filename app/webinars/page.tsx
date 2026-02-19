"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-provider"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { session, supabase } = useAuth()
  const router = useRouter()
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!session?.user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("webinar_registrations")
        .select(`
          created_at,
          webinars (
            id,
            title,
            description,
            event_date,
            image_url,
            hero_image,
            is_premium,
            zoom_link
          )
        `)
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching registrations:", error)
      } else {
        setRegistrations(data || [])
      }
      setLoading(false)
    }

    fetchRegistrations()
  }, [session, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-[#C6A23A] animate-pulse">Loading Dashboard...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h1>
        <p className="text-gray-600 mb-6">Please log in to view your dashboard.</p>
        <button 
          onClick={() => router.push("/login?redirect=/dashboard")}
          className="bg-[#0E1A2B] text-white px-6 py-3 rounded-lg hover:opacity-90 transition"
        >
          Go to Login
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-serif text-[#0E1A2B]">
            My Dashboard
          </h1>
          <p className="text-gray-500 mt-2">
            Welcome back, <span className="font-semibold text-[#C6A23A]">{session.user.user_metadata.full_name || session.user.email}</span>
          </p>
        </header>

        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-[#C6A23A] rounded-full"></span>
            Registered Events
          </h2>

          {registrations.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                📅
              </div>
              <h3 className="text-lg font-medium text-gray-900">No upcoming events</h3>
              <p className="text-gray-500 mt-2 mb-6">You haven't registered for any webinars yet.</p>
              <button 
                onClick={() => router.push("/webinars")}
                className="text-[#C6A23A] font-semibold hover:underline"
              >
                Browse Available Webinars &rarr;
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {registrations.map((reg: any) => {
                const event = reg.webinars
                if (!event) return null
                
                const eventDate = new Date(event.event_date)
                const isPast = eventDate.getTime() < Date.now()

                return (
                  <div key={event.id} className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition group ${isPast ? 'opacity-75 grayscale' : ''}`}>
                    <div className="relative h-48 bg-gray-200 overflow-hidden">
                      <img 
                        src={event.hero_image || event.image_url} 
                        alt={event.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                        {eventDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                      {event.is_premium && (
                        <div className="absolute top-4 left-4 bg-[#C6A23A] text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                          PREMIUM
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded ${isPast ? 'bg-gray-100 text-gray-500' : 'bg-green-50 text-green-700'}`}>
                          {isPast ? 'COMPLETED' : 'UPCOMING'}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                          {eventDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h3 className="font-bold text-lg text-[#0E1A2B] mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      
                      <p className="text-gray-500 text-sm line-clamp-2 mb-6">
                        {event.description}
                      </p>

                      {event.zoom_link && !isPast ? (
                        <a 
                          href={event.zoom_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center bg-[#0E1A2B] text-white py-3 rounded-xl hover:opacity-90 transition text-sm font-medium"
                        >
                          Join Webinar
                        </a>
                      ) : (
                        <button 
                          disabled
                          className="block w-full text-center bg-gray-100 text-gray-400 py-3 rounded-xl text-sm font-medium cursor-not-allowed"
                        >
                          {isPast ? "Event Ended" : "Link Available Soon"}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}