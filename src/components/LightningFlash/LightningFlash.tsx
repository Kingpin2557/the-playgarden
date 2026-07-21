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

    element.removeAttribute("data-active");
    void element.offsetWidth;
    element.setAttribute("data-active", "");
  }, [strikeCount]);

  return <div ref={flashRef} className="c-lightning-flash" />;
}

export default LightningFlash;
