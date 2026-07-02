import "./PoiInfo.css";
import { usePoiStore } from "../../store/poiStore";

interface PoiFact {
  label: string;
  value: string;
}

interface PoiDetails {
  title: string;
  description: string;
  facts: PoiFact[];
}

const POI_INFO: Record<string, PoiDetails> = {
  Goals: {
    title: "Football Goals",
    description: "The main pitch — jumpers for goalposts and endless matches.",
    facts: [
      { label: "Type", value: "Sports" },
      { label: "Players", value: "22" },
      { label: "Built", value: "1987" },
      { label: "Open", value: "All day" },
    ],
  },
  Whip: {
    title: "The Whip",
    description: "A spinning carousel that flings you outward — hold on tight.",
    facts: [
      { label: "Type", value: "Ride" },
      { label: "Riders", value: "8" },
      { label: "Thrill", value: "High" },
      { label: "Min age", value: "6+" },
    ],
  },
  Climbhouse: {
    title: "The Climbhouse",
    description: "A timber climbing frame with nets, ropes and a lookout tower.",
    facts: [
      { label: "Type", value: "Play" },
      { label: "Height", value: "6 m" },
      { label: "Routes", value: "12" },
      { label: "Min age", value: "4+" },
    ],
  },
  Swing: {
    title: "The Swings",
    description: "A row of classic swings — kick off and see how high you go.",
    facts: [
      { label: "Type", value: "Play" },
      { label: "Seats", value: "6" },
      { label: "Height", value: "3 m" },
      { label: "Min age", value: "3+" },
    ],
  },
};

function PoiInfo() {
  const activePoi = usePoiStore((state) => state.activeName);
  if (!activePoi) return null;

  const details = POI_INFO[activePoi];
  if (!details) return null;

  return (
    <div className="poi-info fit">
      <div className="poi-info__title">{details.title}</div>
      <p className="poi-info__description">{details.description}</p>

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
