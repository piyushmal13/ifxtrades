"use client"
export const dynamic = "force-dynamic"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-provider"

export default function WebinarPage() {

  const { session, supabase } = useAuth()

  const [webinar, setWebinar] = useState<any>(null)
  const [registered, setRegistered] = useState(false)

  useEffect(() => {
    fetchWebinar()
  }, [])

  const fetchWebinar = async () => {
    const { data } = await supabase
      .from("webinars")
      .select("*")
      .eq("is_active", true)
      .single()

    if (data) {
      setWebinar(data)
    }
  }

  const register = async () => {

    if (!session) {
      window.location.href = "/login?redirect=/webinars"
      return
    }

    await supabase.from("webinar_registrations").insert({
      webinar_id: webinar.id,
      user_id: session.user.id,
      email: session.user.email
    })

    setRegistered(true)
  }

  if (!webinar) {
    return <div className="p-20">Loading webinar...</div>
  }

  return (
    <div className="min-h-screen bg-white p-20">

      <h1 className="text-4xl font-semibold text-[#0F172A]">
        {webinar.title}
      </h1>

      <p className="mt-6 text-gray-600">
        {webinar.description}
      </p>

      <div className="mt-6 text-sm text-gray-500">
        {new Date(webinar.event_date).toLocaleString()}
      </div>

      <div className="mt-10">
        {registered ? (
          <div className="bg-green-50 border p-6 rounded-xl">
            Registered successfully.
          </div>
        ) : (
          <button
            onClick={register}
            className="bg-[#C6A23A] text-white px-8 py-4 rounded-lg"
          >
            Reserve Your Seat
          </button>
        )}
      </div>

    </div>
  )
}
