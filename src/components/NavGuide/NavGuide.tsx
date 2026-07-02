import "./NavGuide.css";

const STEPS = [
  { icon: "🖱️", text: "Scroll to zoom in and out" },
  { icon: "👆", text: "Click a sign to explore a spot" },
  { icon: "🔄", text: "Drag to look around a spot" },
  { icon: "←", text: "Press Back to return to the park" },
];

function NavGuide() {
  return (
    <div className="nav-guide fit">
      <div className="nav-guide__title">How to explore</div>
      {STEPS.map((step) => (
        <div className="nav-guide__row" key={step.text}>
          <span className="nav-guide__icon">{step.icon}</span>
          <span className="nav-guide__text">{step.text}</span>
        </div>
      ))}
    </div>
  );
}

export default NavGuide;
