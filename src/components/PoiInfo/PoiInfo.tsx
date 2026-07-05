import "./PoiInfo.css";
import { usePoiStore } from "../../store/poiStore";
import { useWeatherStore, type WeatherMode } from "../../store/weatherStore";
import type { Weather } from "../../lib/weatherApi";

interface PoiFact {
  label: string;
  value: string;
}

interface PoiDetails {
  title: string;
  description: string;
  history: string;
  image?: string; // optional photo in /public (broken files hide themselves)
  facts: PoiFact[];
}

// Whether the spot is comfortable to use in the current weather. Uses the same
// live inputs as the visuals — the Leva "Weather" mode override plus the real
// forecast — so it changes the moment you switch mode in the Leva GUI.
function weatherSafety(mode: WeatherMode, weather: Weather | null) {
  if (mode === "auto" && !weather)
    return { label: "Checking the weather…", tone: "neutral" };

  const isSnow = mode === "snow" || (mode === "auto" && !!weather?.isSnow);
  const isThunder = mode === "auto" && !!weather?.isThunder;
  const isRain =
    mode === "rain" || (mode === "auto" && (weather?.precipitation ?? 0) > 0);

  if (isThunder)
    return { label: "Closed — thunderstorm nearby", tone: "unsafe" };
  if (isSnow) return { label: "Icy — take extra care", tone: "caution" };
  if (isRain) return { label: "Wet & slippery — take care", tone: "caution" };
  return { label: "Safe to use right now", tone: "safe" };
}

const POI_INFO: Record<string, PoiDetails> = {
  Goals: {
    title: "Football Goals",
    description:
      "The main pitch in the middle of the park. Two full-size goals and plenty of open grass — bring a ball and pick your team.",
    history:
      "The pitch has been the heart of the Playgarden since the park first opened. Generations of neighbourhood teams have played their weekend matches on this grass.",
    image: "/poi/goals.webp",
    facts: [
      { label: "Type", value: "Sports field" },
      { label: "Players", value: "Up to 22" },
      { label: "Surface", value: "Grass" },
      { label: "Best for", value: "Ages 6+" },
    ],
  },
  Seesaw: {
    title: "The Seesaw",
    description:
      "A classic two-seat seesaw. Grab a friend, sit on either end, and take turns pushing off the ground to bob up and down.",
    history:
      "One of the oldest rides in the park, the seesaw was restored a few years ago with sturdier timber while keeping its original shape.",
    image: "/poi/seesaw.webp",
    facts: [
      { label: "Type", value: "Playground" },
      { label: "Riders", value: "2 at a time" },
      { label: "You need", value: "A partner" },
      { label: "Best for", value: "Ages 4+" },
    ],
  },
  Climbhouse: {
    title: "The Climbhouse",
    description:
      "A timber climbing frame with nets, ropes and a lookout tower. Scramble up, cross the bridge, and head back down.",
    history:
      "Built by local volunteers, the Climbhouse replaced an older wooden fort and quickly became the park's favourite spot for adventurous climbers.",
    image: "/poi/climbhouse.webp",
    facts: [
      { label: "Type", value: "Climbing frame" },
      { label: "Height", value: "6 m" },
      { label: "Routes", value: "12" },
      { label: "Best for", value: "Ages 4+" },
    ],
  },
  Swing: {
    title: "The Swings",
    description:
      "A row of classic swings. Kick your legs to build height and see how far you can go — gentle for little ones, higher for the brave.",
    history:
      "The swing set is a Playgarden classic — the same row has welcomed children for decades, repainted fresh every spring.",
    image: "/poi/swings.webp",
    facts: [
      { label: "Type", value: "Playground" },
      { label: "Seats", value: "6" },
      { label: "Max height", value: "3 m" },
      { label: "Best for", value: "Ages 3+" },
    ],
  },
};

function PoiInfo() {
  const activePoi = usePoiStore((state) => state.activeName);
  const weather = useWeatherStore((state) => state.weather);
  const mode = useWeatherStore((state) => state.mode);
  if (!activePoi) return null;

  const details = POI_INFO[activePoi];
  if (!details) return null;

  const safety = weatherSafety(mode, weather);

  return (
    <div className="poi-info fit">
      {details.image && (
        <img
          className="poi-info__image"
          src={details.image}
          alt={details.title}
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      )}

      <div className="poi-info__title">{details.title}</div>

      <div className={`poi-info__safety poi-info__safety--${safety.tone}`}>
        <span className="poi-info__safety-dot" />
        {safety.label}
      </div>

      <p className="poi-info__description">{details.description}</p>

      <div className="poi-info__section-label">History</div>
      <p className="poi-info__history">{details.history}</p>

      <div className="poi-info__facts">
        {details.facts.map((fact) => (
          <div className="poi-info__fact" key={fact.label}>
            <span className="poi-info__fact-label">{fact.label}</span>
            <span className="poi-info__fact-value">{fact.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PoiInfo;
