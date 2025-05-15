// CurrentTimeDisplay.tsx
"use client";

import { useEffect, useState } from "react";

export default function CurrentTimeDisplay() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString());
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return null; // don't show on server

  return (
    <div className="text-lg font-mono bg-white dark:bg-gray-800 px-3 py-1 rounded-md shadow">
      {time}
    </div>
  );
}
