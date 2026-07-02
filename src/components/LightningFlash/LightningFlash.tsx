import { useEffect, useRef } from "react";

import "./LightningFlash.css";
import { useWeatherStore } from "../../store/weatherStore";

function LightningFlash() {
  const strikeCount = useWeatherStore((state) => state.strikeCount);
  const flashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (strikeCount === 0) return;
    const element = flashRef.current;
    if (!element) return;

    element.classList.remove("lightning-flash--active");
    void element.offsetWidth;
    element.classList.add("lightning-flash--active");
  }, [strikeCount]);

  return <div ref={flashRef} className="lightning-flash" />;
}

export default LightningFlash;
