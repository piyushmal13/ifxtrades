'use client'
import { useAdmin } from "@/lib/useAdmin"
import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
export default function AdminPage() {

  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    setUsers(data || [])
    setLoading(false)
  }

  const activateUser = async (userId: string, plan: string, expiry: string, license: string) => {

    await supabase
      .from("profiles")
      .update({
        active_plan: plan,
        plan_status: "active",
        plan_expiry: expiry,
        license_key: license,
        is_verified: true
      })
      .eq("id", userId)

    alert("User Activated Successfully")
    loadUsers()
  }

  if (loading) return <div className="p-10">Loading...</div>

  return (
    <main className="p-10 min-h-screen">

      <h1 className="text-4xl gold-text display-serif mb-12">
        Admin Subscription Control
      </h1>

      <div className="space-y-10">

        {users.map(user => {

          let plan = ""
          let expiry = ""
          let license = ""

          return (
            <div key={user.id} className="card p-8">

              <div className="mb-6">
                <p><strong>Email:</strong> {user.email}</p>
                <p className="mt-2">
                  <strong>Status:</strong> {user.plan_status || "inactive"}
                </p>
                <p className="mt-2">
                  <strong>Current Plan:</strong> {user.active_plan || "None"}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">

                <input
                  placeholder="Plan Name (e.g. Algo Monthly)"
                  className="border p-3 rounded-lg"
                  onChange={e => plan = e.target.value}
                />

                <input
                  type="date"
                  className="border p-3 rounded-lg"
                  onChange={e => expiry = e.target.value}
                />

                <input
                  placeholder="License Key"
                  className="border p-3 rounded-lg"
                  onChange={e => license = e.target.value}
                />

              </div>

              <button
                className="btn-primary mt-6"
                onClick={() => activateUser(user.id, plan, expiry, license)}
              >
                Activate User
              </button>

            </div>
          )
        })}

      </div>

    </main>
  )
}
