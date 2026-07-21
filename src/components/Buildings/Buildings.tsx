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
            "#c7ead2",
            25,
            "#83d6a6",
            70,
            "#ffd49a",
            180,
            "#ff9d43",
          ],
          "fill-extrusion-height": ["get", "render_height"],
          "fill-extrusion-base": ["get", "render_min_height"],
          "fill-extrusion-opacity": 0.92,
        }}
      />
    </Source>
  );
}

export default Buildings;
