"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export default function Home() {

  return (
    <main className="overflow-x-hidden">

      {/* ================= HERO SECTION ================= */}
      <section className="relative bg-gradient-to-br from-white via-[#F9F7F2] to-white">

        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20 sm:py-28 lg:py-32">

          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

            {/* LEFT SIDE */}
            <div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight"
              >
                Institutional{" "}
                <span className="text-[#C6A23A]">
                  Capital
                </span>
                <br />
                Intelligence
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 sm:mt-8 text-base sm:text-lg text-gray-600 max-w-xl"
              >
                Structured execution. Algorithmic systems.
                Institutional discipline. Built for serious
                traders who think beyond retail noise.
              </motion.p>

              <motion.div
                className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 sm:gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Link
                  href="/webinars"
                  className="bg-[#C6A23A] text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center"
                >
                  Reserve Webinar Seat
                </Link>

                <Link
                  href="/algo"
                  className="border border-[#C6A23A] text-[#C6A23A] px-8 py-4 rounded-xl hover:bg-[#C6A23A] hover:text-white transition-all duration-300 text-center"
                >
                  Explore Algo Systems
                </Link>
              </motion.div>

            </div>

            {/* RIGHT SIDE METRICS CARD */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 grid grid-cols-2 gap-6 sm:gap-10 text-center border border-gray-100"
            >
              <Metric number="12M+" label="Institutional Track Record" />
              <Metric number="Global" label="Community Presence" />
              <Metric number="Weekly" label="Broker Webinars" />
              <Metric number="Structured" label="Risk Framework" />
            </motion.div>

          </div>

        </div>

      </section>


      {/* ================= ECOSYSTEM SECTION ================= */}
      <section className="bg-white border-t border-gray-100 py-20 sm:py-28">

        <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center">

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl">
            The IFXTrades Ecosystem
          </h2>

          <p className="mt-6 text-gray-600 max-w-2xl mx-auto">
            Education, execution and capital strategy integrated into
            one unified institutional trading framework.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 mt-14 sm:mt-16">

            <Feature title="Algorithmic Intelligence" />
            <Feature title="Structured Education" />
            <Feature title="Broker Partnerships" />
            <Feature title="Capital Deployment Systems" />

          </div>

        </div>

      </section>


      {/* ================= CTA SECTION ================= */}
      <section className="bg-[#0E1A2B] text-white py-20 sm:py-28">

        <div className="max-w-4xl mx-auto px-4 sm:px-8 text-center">

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl">
            Build With Discipline.
          </h2>

          <p className="mt-6 text-gray-300">
            Join our institutional-grade trading university and weekly
            global webinars.
          </p>

          <Link
            href="/webinars"
            className="inline-block mt-10 bg-[#C6A23A] text-white px-10 py-4 rounded-xl shadow-xl hover:shadow-2xl transition"
          >
            Join Next Live Webinar
          </Link>

        </div>

      </section>

    </main>
  )
}


/* ================= COMPONENTS ================= */

function Metric({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#C6A23A]">
        {number}
      </div>
      <div className="text-xs sm:text-sm text-gray-500 mt-2">
        {label}
      </div>
    </div>
  )
}

function Feature({ title }: { title: string }) {
  return (
    <div className="bg-[#F9F7F2] p-8 rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300">
      <h3 className="text-lg font-semibold text-[#C6A23A]">
        {title}
      </h3>
      <p className="mt-4 text-sm text-gray-600">
        Designed around disciplined risk allocation and
        institutional-grade execution logic.
      </p>
    </div>
  )
}
