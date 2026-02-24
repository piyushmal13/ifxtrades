"use client";

import { useEffect, useMemo, useState } from "react";

function getRemaining(targetIso: string | null) {
  if (!targetIso) return null;
  const target = new Date(targetIso).getTime();
  if (Number.isNaN(target)) return null;

  const diff = target - Date.now();
  const totalSeconds = Math.max(Math.floor(diff / 1000), 0);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const isComplete = diff <= 0;

  return { days, hours, minutes, seconds, isComplete };
}

export default function Countdown({
  deadlineIso,
  startsAtIso,
}: {
  deadlineIso: string | null;
  startsAtIso: string | null;
}) {
  const targetIso = useMemo(() => startsAtIso || deadlineIso, [startsAtIso, deadlineIso]);
  const [remaining, setRemaining] = useState(() => getRemaining(targetIso));

  useEffect(() => {
    setRemaining(getRemaining(targetIso));
    if (!targetIso) return;

    const timer = window.setInterval(() => {
      setRemaining(getRemaining(targetIso));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [targetIso]);

  if (!targetIso || !remaining) {
    return <p className="text-sm text-white/30 italic">Countdown unavailable.</p>;
  }

  if (remaining.isComplete) {
    return <p className="text-sm text-jpm-gold/80 italic">Registration closed.</p>;
  }

  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      <TimeBox label="Days" value={remaining.days} />
      <TimeBox label="Hrs" value={remaining.hours} />
      <TimeBox label="Min" value={remaining.minutes} />
      <TimeBox label="Sec" value={remaining.seconds} />
    </div>
  );
}

function TimeBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-white/10 rounded-sm py-2 px-1 bg-black/40 backdrop-blur-sm">
      <p className="font-serif text-lg text-white tabular-nums">{String(value).padStart(2, "0")}</p>
      <p className="text-[8px] uppercase tracking-[0.1em] text-white/30">{label}</p>
    </div>
  );
}

