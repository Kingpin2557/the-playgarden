import { Source, Layer } from "react-map-gl/maplibre";

function Buildings() {
  return (
    <Source type="vector" url="https://tiles.openfreemap.org/planet">
      <Layer
        id="3d-buildings"
        type="fill-extrusion"
        source-layer="building"
        minzoom={15}
        paint={{
          "fill-extrusion-color": [
            "interpolate",
            ["linear"],
            ["get", "render_height"],
            0,
            "#e3e6ec",
            50,
            "#b9c2d6",
            150,
            "#8e9cc4",
            300,
            "#5f6f9e",
          ],
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15,
            0,
            16,
            ["get", "render_height"],
          ],
          "fill-extrusion-base": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15,
            0,
            16,
            ["get", "render_min_height"],
          ],
          "fill-extrusion-opacity": 0.9,
        }}
      />
    </Source>
  );
}

export default Buildings;
