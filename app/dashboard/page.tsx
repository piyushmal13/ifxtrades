import { useProtected } from "@/lib/useProtected"
const { session, loading } = useProtected()

if (loading) return <div className="p-20">Loading...</div>
