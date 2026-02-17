"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export default function Home() {

  return (
    <main>

      <section className="relative overflow-hidden py-32">

        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#F9F7F2] to-white"></div>

        <div className="relative max-w-7xl mx-auto px-8 grid md:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl leading-tight font-serif"
            >
              Institutional <span className="text-[#C6A23A]">Capital</span><br/>
              Intelligence
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 text-lg text-gray-600 max-w-xl"
            >
              Structured execution. Algorithmic systems.
              Institutional discipline.
            </motion.p>

            <motion.div
              className="mt-10 flex gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Link
                href="/webinars"
                className="bg-[#C6A23A] text-white px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition"
              >
                Reserve Webinar Seat
              </Link>

              <Link
                href="/algo"
                className="border border-[#C6A23A] px-8 py-4 rounded-lg hover:bg-[#C6A23A] hover:text-white transition"
              >
                Explore Algo Systems
              </Link>
            </motion.div>

          </div>

          {/* RIGHT METRICS */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-10 grid grid-cols-2 gap-10 text-center"
          >
            <div>
              <div className="text-4xl font-bold text-[#C6A23A]">12M+</div>
              <div className="text-sm text-gray-500 mt-2">
                Institutional Track Record
              </div>
            </div>

            <div>
              <div className="text-4xl font-bold text-[#C6A23A]">Global</div>
              <div className="text-sm text-gray-500 mt-2">
                Community Presence
              </div>
            </div>

            <div>
              <div className="text-4xl font-bold text-[#C6A23A]">Weekly</div>
              <div className="text-sm text-gray-500 mt-2">
                Broker Webinars
              </div>
            </div>

            <div>
              <div className="text-4xl font-bold text-[#C6A23A]">Structured</div>
              <div className="text-sm text-gray-500 mt-2">
                Risk Framework
              </div>
            </div>

          </motion.div>

        </div>

      </section>

    </main>
  )
}
