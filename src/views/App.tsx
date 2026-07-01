import { useWeatherStore } from "../store/weatherStore";

function App() {
  const weather = useWeatherStore((state) => state.weather);

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        left: 16,
        zIndex: 10, // sit on top of the map/canvas
        padding: "10px 14px",
        borderRadius: 12,
        background: "rgba(0, 0, 0, 0.55)",
        color: "white",
        font: "14px/1.2 sans-serif",
        display: "flex",
        alignItems: "center",
        gap: 8,
        backdropFilter: "blur(6px)",
      }}
    >
      {weather ? (
        <>
          <span style={{ fontSize: 22 }}>{weather.icon}</span>
          <span>
            <strong>{Math.round(weather.temperature)}°C</strong> {weather.label}
          </span>
        </>
      ) : (
        <span>Loading weather…</span>
      )}
    </div>
  );
}

export default App;
