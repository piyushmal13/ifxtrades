"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-provider"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export default function WebinarsPage() {
  const { supabase, session } = useAuth()
  const router = useRouter()
  
  const [webinar, setWebinar] = useState<any>(null)
  const [speakers, setSpeakers] = useState<any[]>([])
  const [agenda, setAgenda] = useState<any[]>([])
  const [sponsors, setSponsors] = useState<any[]>([])
  const [faqs, setFaqs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [registrations, setRegistrations] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState<{d: number, h: number, m: number, s: number} | null>(null)

  useEffect(() => {
    loadWebinar()
  }, [])

  useEffect(() => {
    if (!webinar?.event_date) return

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const eventTime = new Date(webinar.event_date).getTime()
      const distance = eventTime - now
      
      if (distance < 0) {
        setTimeLeft(null)
        clearInterval(interval)
      } else {
        setTimeLeft({
          d: Math.floor(distance / (1000 * 60 * 60 * 24)),
          h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((distance % (1000 * 60)) / 1000)
        })
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [webinar])

  async function loadWebinar() {
    // 1. Fetch Active Webinar
    const { data, error } = await supabase
      .from("webinars")
      .select("*")
      .eq("is_active", true)
      .single()

    if (error || !data) {
      setLoading(false)
      return
    }

    setWebinar(data)

    // 2. Check Registration
    if (session?.user) {
      const { data: reg } = await supabase
        .from("webinar_registrations")
        .select("id")
        .eq("webinar_id", data.id)
        .eq("user_id", session.user.id)
        .single()
      
      if (reg) setIsRegistered(true)
    }

    // 3. Get Total Registrations
    const { count } = await supabase
      .from("webinar_registrations")
      .select("id", { count: "exact", head: true })
      .eq("webinar_id", data.id)
    
    setRegistrations(count || 0)

    // 4. Fetch Speakers
    const { data: sp } = await supabase
      .from("webinar_speakers")
      .select("*")
      .eq("webinar_id", data.id)
      .order("display_order", { ascending: true })
    setSpeakers(sp || [])

    // 5. Fetch Sponsors
    const { data: spo } = await supabase
      .from("webinar_sponsors")
      .select("*")
      .eq("webinar_id", data.id)
      .order("display_order", { ascending: true })
    setSponsors(spo || [])

    // 6. Fetch Agenda
    const { data: ag } = await supabase
      .from("webinar_agenda")
      .select("*")
      .eq("webinar_id", data.id)
      .order("id", { ascending: true })
    
    if (ag && ag.length > 0) {
        setAgenda(ag)
    } else if (Array.isArray(data.agenda)) {
        setAgenda(data.agenda)
    }

    // 7. FAQs
    if (data.faq && Array.isArray(data.faq)) {
      setFaqs(data.faq)
    }

    setLoading(false)
  }

  const handleRegister = async () => {
    if (!session) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    if (webinar.is_premium) {
      // Enterprise: Payment Gateway Trigger would go here
      const confirmPayment = confirm(`This is a Premium Event ($${webinar.price || "99"}). Proceed to payment?`)
      if (!confirmPayment) return
    }
    
    setRegistering(true)
    const { error } = await supabase
      .from("webinar_registrations")
      .insert({
        webinar_id: webinar.id,
        user_id: session.user.id
      })

    if (!error) {
      setIsRegistered(true)
      setRegistrations(prev => prev + 1)
    }
    setRegistering(false)
  }

  const addToCalendar = () => {
    if (!webinar) return
    
    const startTime = new Date(webinar.event_date)
    const endTime = new Date(startTime.getTime() + (60 * 60 * 1000)) // Default 1 hour
    
    const formatTime = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, "")
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(webinar.title)}&dates=${formatTime(startTime)}/${formatTime(endTime)}&details=${encodeURIComponent(webinar.description || "")}&location=${encodeURIComponent(webinar.zoom_link || "Online")}`
    
    window.open(googleCalendarUrl, "_blank")
  }

  const handleShare = async () => {
    if (!webinar) return
    
    const shareData = {
      title: webinar.title,
      text: `Join me at ${webinar.title}!`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // Ignore abort errors
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Event link copied to clipboard!")
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#C6A23A]">Loading Experience...</div>
  if (!webinar) return <div className="min-h-screen flex items-center justify-center text-gray-500">No Active Webinars Found</div>

  const isSoldOut = (webinar.max_seats && registrations >= webinar.max_seats)
  const isDeadlinePassed = webinar.registration_deadline && new Date(webinar.registration_deadline).getTime() < Date.now()
  const isRegistrationLocked = isSoldOut || isDeadlinePassed

  const seatsRemaining = webinar.max_seats ? Math.max(0, webinar.max_seats - registrations) : null

  // Data Segmentation
  const keynoteSpeakers = speakers.filter(s => s.is_keynote)
  const regularSpeakers = speakers.filter(s => !s.is_keynote)

  const goldSponsors = sponsors.filter(s => s.tier === 'gold')
  const silverSponsors = sponsors.filter(s => s.tier === 'silver')
  const bronzeSponsors = sponsors.filter(s => s.tier === 'bronze' || !s.tier)

  return (
    <div className="min-h-screen bg-white font-sans text-[#0E1A2B]">
       
       {/* 1️⃣ AUTHORITY HERO SECTION */}
       <div className="relative h-[500px] md:h-[600px] flex items-center overflow-hidden">
         <img src={webinar.hero_image || webinar.image_url} alt={webinar.title} className="absolute inset-0 w-full h-full object-cover" />
         <div className="absolute inset-0 bg-gradient-to-r from-[#0E1A2B]/95 to-[#0E1A2B]/70"></div>
         
         <div className="relative z-10 container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center h-full">
           <div className="text-white space-y-8">
             <div className="flex items-center gap-4">
                <span className="px-4 py-1 bg-[#C6A23A] text-white text-xs font-bold tracking-widest uppercase rounded-sm">
                  {webinar.is_premium ? "Executive Access" : "Institutional Event"}
                </span>
                {webinar.price && (
                  <span className="text-[#C6A23A] font-serif text-xl">${webinar.price}</span>
                )}
             </div>

             <h1 className="text-5xl md:text-7xl font-serif leading-tight">
               {webinar.title}
             </h1>
             <p className="text-xl text-gray-300 max-w-xl leading-relaxed">
               {webinar.description}
             </p>
             
             {/* Countdown Timer */}
             {timeLeft && !isRegistered && (
               <div className="flex gap-6 py-6 border-t border-white/10">
                 <div className="text-center">
                   <div className="text-3xl font-serif font-bold text-white">{timeLeft.d}</div>
                   <div className="text-[10px] uppercase tracking-widest text-[#C6A23A]">Days</div>
                 </div>
                 <div className="text-center">
                   <div className="text-3xl font-serif font-bold text-white">{timeLeft.h}</div>
                   <div className="text-[10px] uppercase tracking-widest text-[#C6A23A]">Hours</div>
                 </div>
                 <div className="text-center">
                   <div className="text-3xl font-serif font-bold text-white">{timeLeft.m}</div>
                   <div className="text-[10px] uppercase tracking-widest text-[#C6A23A]">Mins</div>
                 </div>
                 <div className="text-center">
                   <div className="text-3xl font-serif font-bold text-white">{timeLeft.s}</div>
                   <div className="text-[10px] uppercase tracking-widest text-[#C6A23A]">Secs</div>
                 </div>
               </div>
             )}

             {isRegistered ? (
               <div className="space-y-6">
                 <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-6 py-4 rounded-lg inline-flex items-center gap-3">
                   <span className="text-xl">✓</span>
                   <span className="font-medium">Registration Confirmed</span>
                 </div>
                 <div className="flex gap-4">
                   <button 
                     onClick={addToCalendar}
                     className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-sm font-medium flex items-center gap-2"
                   >
                     <span>📅</span> Add to Google Calendar
                   </button>
                   <button 
                     onClick={handleShare}
                     className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-sm font-medium flex items-center gap-2"
                   >
                     <span>🔗</span> Share Event
                   </button>
                 </div>
               </div>
             ) : isRegistrationLocked ? (
               <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-8 py-4 rounded-lg inline-block">
                 <span className="font-bold uppercase tracking-wider">{isSoldOut ? "Sold Out" : "Registration Closed"}</span>
               </div>
             ) : (
               <div className="flex flex-col gap-3 items-start">
                 <button 
                   onClick={handleRegister}
                   disabled={registering}
                   className="bg-[#C6A23A] text-white px-10 py-5 rounded-sm text-lg font-bold hover:bg-[#b08d2b] transition disabled:opacity-50 shadow-[0_0_30px_rgba(198,162,58,0.3)] uppercase tracking-wider"
                 >
                   {registering ? "Processing..." : "Secure Your Seat"}
                 </button>
                 {seatsRemaining !== null && seatsRemaining < 50 && (
                   <span className="text-red-400 text-sm font-medium flex items-center gap-2">
                     <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                     Only {seatsRemaining} seats remaining
                   </span>
                 )}
               </div>
             )}
           </div>
           
           {/* Hero Image / Visual */}
           <div className="hidden lg:block relative h-[500px] w-full">
              <div className="absolute inset-0 border border-[#C6A23A]/30 rounded-sm transform translate-x-4 translate-y-4"></div>
              <img 
                src={webinar.hero_image || webinar.image_url} 
                className="absolute inset-0 w-full h-full object-cover rounded-sm shadow-2xl grayscale hover:grayscale-0 transition duration-700"
                alt="Event Visual"
              />
           </div>
         </div>
       </div>

       {/* 2️⃣ SOCIAL PROOF BAR */}
       <div className="bg-gray-50 border-b border-gray-200">
         <div className="container mx-auto px-6 py-6 flex flex-wrap justify-center md:justify-between items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#0E1A2B] text-lg">{registrations}</span>
              <span>Professionals Registered</span>
            </div>
            {webinar.venue && (
              <div className="flex items-center gap-2">
                <span className="text-[#C6A23A]">📍</span>
                <span className="font-medium uppercase tracking-wide">{webinar.venue}</span>
              </div>
            )}
            {webinar.hotel_sponsor && (
              <div className="flex items-center gap-2">
                <span className="text-[#C6A23A]">🏨</span>
                <span>Official Hotel: <span className="font-bold">{webinar.hotel_sponsor}</span></span>
              </div>
            )}
         </div>
       </div>

       <div className="container mx-auto px-6 py-20">
         
         {/* 3️⃣ KEYNOTE & SPEAKERS */}
         {speakers.length === 0 && (
            <div className="mb-24 text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <h3 className="text-xl font-serif text-gray-400">Speakers Announcing Soon</h3>
              <p className="text-gray-400 text-sm mt-2">Check back later for the full lineup.</p>
            </div>
         )}

         {keynoteSpeakers.length > 0 && (
           <div className="mb-24">
             <div className="text-center mb-16">
               <span className="text-[#C6A23A] font-bold tracking-widest uppercase text-sm">World Class Insight</span>
               <h2 className="text-4xl font-serif text-[#0E1A2B] mt-3">Keynote Speakers</h2>
             </div>
             
             <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
               {keynoteSpeakers.map(speaker => (
                 <div key={speaker.id} className="flex flex-col md:flex-row gap-8 items-center bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-xl transition duration-500">
                   <div className="w-40 h-40 flex-shrink-0 rounded-full overflow-hidden border-4 border-[#C6A23A]/20">
                     <img src={speaker.image_url} alt={speaker.name} className="w-full h-full object-cover" />
                   </div>
                   <div className="text-center md:text-left">
                     <h3 className="text-2xl font-serif font-bold text-[#0E1A2B]">{speaker.name}</h3>
                     <p className="text-[#C6A23A] font-medium mb-4">{speaker.role} {speaker.company && `at ${speaker.company}`}</p>
                     <p className="text-gray-500 text-sm leading-relaxed">{speaker.bio}</p>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         )}

         {regularSpeakers.length > 0 && (
           <div className="mb-24">
             <h3 className="text-2xl font-serif text-[#0E1A2B] mb-10 text-center">Industry Experts</h3>
             <div className="grid md:grid-cols-4 gap-8">
               {regularSpeakers.map(speaker => (
                 <div key={speaker.id} className="text-center group">
                   <div className="w-32 h-32 mx-auto mb-4 overflow-hidden rounded-full border-2 border-gray-100 group-hover:border-[#C6A23A] transition grayscale group-hover:grayscale-0">
                     <img src={speaker.image_url} alt={speaker.name} className="w-full h-full object-cover" />
                   </div>
                   <h4 className="font-bold text-[#0E1A2B]">{speaker.name}</h4>
                   <p className="text-gray-500 text-xs mt-1">{speaker.role}</p>
                   <p className="text-[#C6A23A] text-xs">{speaker.company}</p>
                 </div>
               ))}
             </div>
           </div>
         )}

         {/* 4️⃣ AGENDA TIMELINE */}
         {agenda.length > 0 && (
           <div className="mb-24 max-w-4xl mx-auto">
             <div className="text-center mb-12">
               <span className="text-[#C6A23A] font-bold tracking-widest uppercase text-sm">Schedule</span>
               <h2 className="text-3xl font-serif text-[#0E1A2B] mt-3">Event Agenda</h2>
             </div>
             
             <div className="relative border-l-2 border-gray-100 ml-6 space-y-12">
               {agenda.map((item: any, i) => (
                 <div key={i} className="relative pl-8">
                   <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[#C6A23A] border-4 border-white shadow-sm"></div>
                   <div className="flex flex-col md:flex-row md:items-start gap-4">
                     <div className="min-w-[100px] font-bold text-[#C6A23A]">{item.time_label}</div>
                     <div className="bg-gray-50 p-6 rounded-lg flex-1 hover:bg-white hover:shadow-lg transition border border-gray-100">
                       <h4 className="font-bold text-[#0E1A2B] text-lg">{item.topic}</h4>
                       {item.speaker && <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                         <span className="w-6 h-6 rounded-full bg-gray-200 inline-block"></span>
                         {item.speaker}
                       </p>}
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </div>
         )}

         {/* 5️⃣ SPONSORS */}
         {sponsors.length > 0 && (
           <div className="text-center mb-24 bg-[#0E1A2B] text-white py-20 -mx-6 px-6">
             <h2 className="text-2xl font-serif mb-16">Strategic Partners</h2>
             
             {/* Gold Tier */}
             {goldSponsors.length > 0 && (
               <div className="mb-12">
                 <p className="text-[#C6A23A] text-xs font-bold tracking-widest uppercase mb-8">Platinum & Gold</p>
                 <div className="flex flex-wrap justify-center gap-16 items-center">
                   {goldSponsors.map(s => (
                     <a key={s.id} href={s.website || "#"} target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 transition">
                       <img src={s.logo_url} alt={s.name} className="h-16 md:h-20 object-contain brightness-0 invert" />
                     </a>
                   ))}
                 </div>
               </div>
             )}

             {/* Silver & Bronze */}
             {(silverSponsors.length > 0 || bronzeSponsors.length > 0) && (
               <div className="flex flex-wrap justify-center gap-12 items-center opacity-50">
                 {silverSponsors.map(s => (
                   <img key={s.id} src={s.logo_url} alt={s.name} className="h-10 md:h-12 object-contain brightness-0 invert" />
                 ))}
                 {bronzeSponsors.map(s => (
                   <img key={s.id} src={s.logo_url} alt={s.name} className="h-8 md:h-10 object-contain brightness-0 invert" />
                 ))}
               </div>
             )}
           </div>
         )}

         {/* 7️⃣ FAQ ACCORDION */}
         {faqs.length > 0 && (
           <div className="mb-24 max-w-3xl mx-auto">
             <h2 className="text-3xl font-serif text-[#0E1A2B] mb-12 text-center">Frequently Asked Questions</h2>
             <div className="space-y-4">
               {faqs.map((faq, index) => (
                 <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                   <button
                     onClick={() => setOpenFaq(openFaq === index ? null : index)}
                     className="w-full flex justify-between items-center p-6 bg-white hover:bg-gray-50 transition text-left"
                   >
                     <span className="font-medium text-[#0E1A2B]">{faq.question}</span>
                     <span className="text-[#C6A23A] text-xl">{openFaq === index ? "−" : "+"}</span>
                   </button>
                   <AnimatePresence>
                     {openFaq === index && (
                       <motion.div
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: "auto", opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="overflow-hidden"
                       >
                         <div className="p-6 pt-0 bg-white text-gray-600 leading-relaxed text-sm">
                           {faq.answer}
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>
               ))}
             </div>
             <div className="text-center mt-8">
               <p className="text-gray-500 text-sm">
                 Are you an industry expert? 
                 <a href="/speakers/apply" className="text-[#C6A23A] font-bold ml-1 hover:underline">Apply to Speak</a>
               </p>
             </div>
           </div>
         )}

         {/* 8️⃣ FINAL CTA */}
         <div className="text-center bg-[#0E1A2B] rounded-sm p-16 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-serif text-white mb-6">Ready to elevate your trading?</h2>
                <p className="text-gray-400 mb-10 max-w-xl mx-auto text-lg">Join institutional leaders and industry experts for this exclusive event.</p>
                {!isRegistered && !isRegistrationLocked && (
                    <button 
                        onClick={handleRegister}
                        disabled={registering}
                        className="bg-[#C6A23A] text-white px-12 py-4 rounded-sm text-lg font-bold hover:bg-[#b08d2b] transition disabled:opacity-50 uppercase tracking-widest"
                    >
                        {registering ? "Registering..." : "Secure Your Spot Now"}
                    </button>
                )}
            </div>
         </div>

       </div>
    </div>
  )
}