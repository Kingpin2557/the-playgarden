import PlantLayer from "./PlantLayer";

export interface PlantConfig {
  url: string;
  nodeName: string;
  scale: number;
  // Future: add a weightMap property here
}

interface InstancesProps {
  models: PlantConfig[];
}

function PlantInstances({ models }: InstancesProps) {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {models.map((config) => (
        <PlantLayer key={config.url + config.nodeName} config={config} />
      ))}
    </group>
  );
}

export default PlantInstances;
