"use client"

import { useAdmin } from "@/lib/useAdmin"
import { useAuth } from "@/lib/auth-provider"
import { useState, useEffect } from "react"

export const dynamic = "force-dynamic"

export default function AdminPage() {

  const { role, loading: adminLoading } = useAdmin()
  const { supabase } = useAuth()

  const [tab, setTab] = useState("webinars")
  const [data, setData] = useState<any[]>([])
  const [webinars, setWebinars] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState<any>({})

  useEffect(() => {
    if (role === "admin") {
      fetchData()
      if (tab !== "webinars") fetchWebinarList()
    }
  }, [role, tab])

  const fetchWebinarList = async () => {
    const { data } = await supabase.from("webinars").select("id, title").order("created_at", { ascending: false })
    setWebinars(data || [])
  }

  const fetchData = async () => {
    setLoading(true)
    const table = tab === "webinars" ? "webinars" : `webinar_${tab}`
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: false })
    
    if (!error) setData(data || [])
    setLoading(false)
  }

  const handleUpload = async (e: any, field: string) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const fileName = `${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from("images").upload(fileName, file)

    if (error) {
      alert("Upload failed: " + error.message)
    } else {
      const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(fileName)
      setForm({ ...form, [field]: publicUrl })
    }
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const table = tab === "webinars" ? "webinars" : `webinar_${tab}`
    const { error } = await supabase.from(table).insert(form)

    if (error) alert(error.message)
    else {
      setForm({})
      fetchData()
      alert("Item Created Successfully")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return
    const table = tab === "webinars" ? "webinars" : `webinar_${tab}`
    await supabase.from(table).delete().eq("id", id)
    fetchData()
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    if (tab !== "webinars") return
    // Deactivate all others first if we are activating one
    if (!currentStatus) {
      await supabase.from("webinars").update({ is_active: false }).neq("id", id)
    }
    await supabase.from("webinars").update({ is_active: !currentStatus }).eq("id", id)
    fetchData()
  }

  if (adminLoading) return <div className="p-20 text-center">Verifying Admin Access...</div>
  if (role !== "admin") return <div className="p-20 text-center text-red-500">Access Denied</div>

  const tabs = ["webinars", "speakers", "sponsors", "agenda"]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#0F172A]">Admin Dashboard</h1>
          <div className="flex gap-2 bg-white p-1 rounded-lg shadow-sm">
            {tabs.map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setForm({}); }}
                className={`px-4 py-2 rounded-md capitalize text-sm font-medium transition ${
                  tab === t ? "bg-[#C6A23A] text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* CREATE FORM */}
          <div className="bg-white p-6 rounded-xl shadow-sm h-fit">
            <h2 className="text-xl font-semibold mb-6 capitalize">Add New {tab.slice(0, -1)}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {tab !== "webinars" && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Webinar</label>
                  <select 
                    className="w-full border p-2 rounded bg-gray-50"
                    onChange={e => setForm({...form, webinar_id: e.target.value})}
                    required
                  >
                    <option value="">-- Select Webinar --</option>
                    {webinars.map(w => <option key={w.id} value={w.id}>{w.title}</option>)}
                  </select>
                </div>
              )}

              {tab === "webinars" && (
                <>
                  <input placeholder="Title" className="w-full border p-2 rounded" onChange={e => setForm({...form, title: e.target.value})} required />
                  <textarea placeholder="Description" className="w-full border p-2 rounded" onChange={e => setForm({...form, description: e.target.value})} />
                  <input type="datetime-local" className="w-full border p-2 rounded" onChange={e => setForm({...form, event_date: e.target.value})} required />
                  <input type="number" placeholder="Max Seats" className="w-full border p-2 rounded" onChange={e => setForm({...form, max_seats: e.target.value})} />
                  <div className="flex gap-4 items-center bg-gray-50 p-2 rounded border">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input type="checkbox" onChange={e => setForm({...form, is_premium: e.target.checked})} />
                      Premium Event?
                    </label>
                    <input type="number" placeholder="Price ($)" className="border p-1 rounded w-32" onChange={e => setForm({...form, price: e.target.value})} />
                  </div>
                  <div className="border p-2 rounded bg-gray-50">
                    <label className="block text-xs mb-1">Hero Image</label>
                    <input type="file" onChange={e => handleUpload(e, "hero_image")} />
                    {uploading && <span className="text-xs text-blue-500">Uploading...</span>}
                  </div>
                </>
              )}

              {tab === "speakers" && (
                <>
                  <input placeholder="Name" className="w-full border p-2 rounded" onChange={e => setForm({...form, name: e.target.value})} required />
                  <input placeholder="Role (e.g. CEO)" className="w-full border p-2 rounded" onChange={e => setForm({...form, role: e.target.value})} />
                  <input placeholder="Company" className="w-full border p-2 rounded" onChange={e => setForm({...form, company: e.target.value})} />
                  <textarea placeholder="Bio" className="w-full border p-2 rounded" onChange={e => setForm({...form, bio: e.target.value})} />
                  <div className="border p-2 rounded bg-gray-50">
                    <label className="block text-xs mb-1">Speaker Photo</label>
                    <input type="file" onChange={e => handleUpload(e, "image_url")} />
                  </div>
                </>
              )}

              {tab === "sponsors" && (
                <div className="space-y-4">
                  <input placeholder="Sponsor Name" className="w-full border p-2 rounded" onChange={e => setForm({...form, name: e.target.value})} required />
                  <input placeholder="Website URL" className="w-full border p-2 rounded" onChange={e => setForm({...form, website: e.target.value})} />
                  <select className="w-full border p-2 rounded" onChange={e => setForm({...form, tier: e.target.value})}>
                    <option value="">Select Tier</option>
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                    <option value="bronze">Bronze</option>
                  </select>
                  <div className="border p-2 rounded bg-gray-50">
                    <label className="block text-xs mb-1">Sponsor Logo</label>
                    <input type="file" onChange={e => handleUpload(e, "logo_url")} />
                  </div>
                </div>
              )}

              {tab === "agenda" && (
                <>
                  <input placeholder="Topic" className="w-full border p-2 rounded" onChange={e => setForm({...form, topic: e.target.value})} required />
                  <input placeholder="Time Label (e.g. 10:00 AM)" className="w-full border p-2 rounded" onChange={e => setForm({...form, time_label: e.target.value})} />
                  <input placeholder="Speaker Name" className="w-full border p-2 rounded" onChange={e => setForm({...form, speaker: e.target.value})} />
                </>
              )}

              <button disabled={uploading} className="w-full bg-[#0F172A] text-white py-3 rounded hover:opacity-90 transition">
                {uploading ? "Uploading..." : "Save Item"}
              </button>
            </form>
          </div>

          {/* LIST VIEW */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? <div className="text-center py-10">Loading Data...</div> : data.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-[#0F172A]">{item.title || item.name || item.question || "Sponsor Logo"}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()} 
                    {(item.role || item.company) && ` • ${item.role || item.company}`}
                    {item.time_label && ` • ${item.time_label}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {tab === "webinars" && (
                    <button 
                      onClick={() => toggleActive(item.id, item.is_active)}
                      className={`px-3 py-1 rounded text-xs font-bold ${item.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {item.is_active ? "ACTIVE" : "INACTIVE"}
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {data.length === 0 && !loading && <div className="text-center text-gray-400 py-10">No items found.</div>}
          </div>

        </div>
      </div>
    </div>
  )
}
