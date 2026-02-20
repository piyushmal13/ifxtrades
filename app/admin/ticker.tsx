"use client"

import { motion } from "framer-motion"

const TICKER_DATA = [
  { symbol: "BTC", price: "64,230.50", change: "+2.4%" },
  { symbol: "ETH", price: "3,450.10", change: "-1.2%" },
  { symbol: "SOL", price: "145.20", change: "+5.1%" },
  { symbol: "XAU", price: "2,350.00", change: "+0.5%" },
  { symbol: "EUR/USD", price: "1.0845", change: "-0.1%" },
  { symbol: "GBP/USD", price: "1.2650", change: "-0.3%" },
  { symbol: "SPX", price: "5,200.00", change: "+0.8%" },
  { symbol: "NDX", price: "18,100.00", change: "-0.5%" },
]

export function Ticker() {
  return (
    <div className="w-full bg-white border-t border-b border-gray-200 py-3 overflow-hidden flex items-center relative z-40">
      {/* Black Logo Area */}
      <div className="absolute left-0 top-0 bottom-0 bg-white z-10 px-4 flex items-center border-r border-gray-100 shadow-sm">
        <div className="font-serif font-bold text-xl text-black tracking-tighter">
          IFX<span className="text-[#C6A23A]">.</span>
        </div>
      </div>

      {/* Moving Ticker */}
      <div className="flex whitespace-nowrap pl-24">
        <motion.div
          className="flex gap-12 items-center"
          animate={{ x: "-50%" }}
          transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
        >
          {[...TICKER_DATA, ...TICKER_DATA, ...TICKER_DATA, ...TICKER_DATA].map((item, i) => {
            const isPositive = item.change.startsWith("+")
            return (
              <div key={i} className="flex items-center gap-3 text-sm font-medium">
                <span className="font-bold text-gray-900">{item.symbol}</span>
                <span className="text-gray-600">{item.price}</span>
                <span className={isPositive ? "text-green-600 font-bold" : "text-black font-bold"}>
                  {item.change}
                </span>
              </div>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}