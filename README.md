# The Playgarden

Een levende 3D-speeltuin op een echte kaart. Verken de omgeving rond een Gentse speeltuin via een MapLibre-kaart met een Three.js-scene erbovenop, klik op points of interest om er naartoe te vliegen en meer info te zien, of trap een balletje op het middenveld.

## Concept

The Playgarden zet een echte speeltuin om in een interactieve 3D-belevenis, geankerd op zijn echte GPS-locatie. Bij het binnenkomen krijgt de bezoeker een korte, interactieve intro (scrollen, pannen, roteren, een PoI aanklikken) waarna de scene vrij te verkennen is:

- **Points of interest** — de voetbaldoelen, de wip, de schommel en het klimhuis. Elk heeft een naambordje; aanklikken vliegt de camera ernaartoe en toont een infokaart (beschrijving, geschiedenis, weetjes, foto en een live "veilig om te gebruiken"-indicatie op basis van het actuele weer).
- **Mini-game** — bij de voetbaldoelen wordt een fysica-gedreven schietspelletje geactiveerd: bal aanklikken, aim slepen, loslaten om te schieten, score bijhouden per kant.
- **Dag/nacht-cyclus en live weer** — de belichting, lucht en omgevingsgeluid volgen een dag/nacht-cyclus en het actuele weer op de locatie (regen, sneeuw, onweer met bliksem).
- **Sfeer** — achtergrondmuziek en weer-afhankelijke ambient audio, gestrooide natuur (gras, bloemen, bomen, paddenstoelen), wolken en grondmist.

## Technische aanpak

**Stack:** Vite + React 19 + TypeScript, React Three Fiber, `react-three-map` (bindt een R3F-scene aan een MapLibre-kaart via `react-map-gl`), `@react-three/rapier` voor physics, Zustand voor state, Leva voor live-tuning, GSAP voor camera-animaties.

**Kaart + 3D-scene (`App.tsx`)** — één top-level component zonder routing: de MapLibre-kaart, de Three.js-canvas erbovenop (via `react-three-map`) en de HUD. De kaart en de scene delen dezelfde coördinaten (`COORDS` in `constants.ts`), zodat 3D-objecten precies op hun echte GPS-positie staan. `App.tsx` regelt ook de pan-fencing: vrij pannen buiten een PoI, een strak kadertje rond een gefocuste PoI, en de speelveld-grenzen tijdens de mini-game.

**Scene-opbouw (`components/Experience/Experience.tsx`)** — bouwt de lichten (dag/nacht-gestuurde ambient + directional light), de gestrooide natuur (`PlantInstances`), de weer-particles, wolken, grondmist, bliksem, en rendert alle `PointOfInterest`-modellen. De voetbal-mini-game (`GoalGame`) wordt hier conditioneel gemount, alleen wanneer die PoI actief is — de physics-wereld draait dus niet mee als je hem niet nodig hebt.

**Points of interest (`components/PointOfInterest`, `hooks/usePoiPresentation.ts`)** — elke PoI is een los GLB-model met een klikbaar naambordje (`Html` van drei). Klikken zet de actieve PoI in `poiStore` en berekent de wereld → lng/lat-conversie voor de camera-fly-to. `usePoiPresentation` houdt het model op de grond (raycast naar beneden elk frame) en plaatst het label boven de bounding box.

**UI & state (`store/*.ts`)** — vijf kleine Zustand-stores, elk met één verantwoordelijkheid: `appStore` (intro/onboarding/audio-toggle), `poiStore` (welke PoI actief/gefocust is + zijn cameraview), `gameStore` (score, aiming, play-bounds van de mini-game), `mapStore` (pan-grenzen van de scene), `weatherStore` (actueel weerbeeld + Leva-override). UI-componenten (`PoiInfo`, `Hud`, `WelcomeScreen`, `Onboarding`) lezen puur via selectors uit deze stores — geen prop-drilling.

**Physics (Rapier) — `components/GoalGame`, `lib/goalPhysics.ts`** — de voetbal-mini-game draait in een eigen `<Physics>`-wereld. De bal is een dynamic rigid body met een `BallCollider`; de twee doelen zijn sensor-colliders die uit de geometrie van het GLB-model worden afgeleid (`splitGoals` splitst het model links/rechts in twee bounding boxes en bouwt daar cuboid-colliders voor). Klik-en-sleep op de bal (`useAimAndShoot`) berekent richting + kracht en past een impulse toe; een score-sensor detecteert wanneer de bal een doel binnenkomt en reset de bal naar zijn startpositie.

**Camera & animatie (`hooks/useCameraFocus.ts`)** — bij het focussen van een PoI tweent GSAP de camera (lengtegraad/breedtegraad/zoom/pitch/bearing) in ~1,2s naar de PoI's ingestelde view; bij het loslaten keert hij terug naar de vorige "home"-positie. Rotatie blijft mogelijk maar wordt tijdens focus geclampt tot een smalle boog rond de PoI's kijkhoek, zodat je niet kunt "wegdraaien" van waar je naar kijkt.

**Audio (`hooks/useAudio.ts`, `lib/audioLoop.ts`)** — achtergrondmuziek loopt continu op laag volume zolang je binnen bent en audio hebt toegestaan; een ambient-laag (regen/sneeuw) wordt gekozen op basis van het actuele weer of een Leva-override. Bliksem triggert los een eenmalige donderklap (`lib/thunderAudio.ts`).

**Weer & dag/nacht (`lib/weatherApi.ts`, `lib/dayNight.ts`, `hooks/useWeatherUpdater.ts`, `hooks/useDayNightCycle.ts`)** — het actuele weer op de locatie wordt opgehaald bij Open-Meteo en stuurt regen/sneeuw/onweer-particles, mist en de "veilig te gebruiken"-status per PoI. De dag/nacht-cyclus stuurt losstaand de belichtingskleur en -intensiteit.

**Beleving & flow (`WelcomeScreen`, `Onboarding`)** — een laadscherm met voortgangsbalk en audio-toggle voordat je binnenkomt; daarna een korte, gedetecteerde (geen timers) onboarding die vier gestures afvinkt (zoomen, pannen, roteren, een PoI aanklikken) zodat een nieuwe bezoeker nooit stuurloos in de scene start, met een "Skip tour"-optie voor wie dat niet nodig heeft.

## Credits

- **Speeltuin-installaties** (voetbaldoelen, wip, schommel, klimhuis) — zelf gemodelleerd in Blender (`theplayground.blend`).
- **Natuur/scatter-modellen** (plant, boom, paddenstoel, bloemen, boomstronk) — asset pack van Sketchfab (exacte pack nog te achterhalen — zie `public/scatter`).
- **PoI-foto's** — gegenereerd via een Apify-connector (FLUX-model), gestileerd naar een modern groen stadspark (zie `public/poi/README.txt`).
- **Audio** — achtergrondmuziek en ambient loops (regen, sneeuw, onweer) gegenereerd met ElevenLabs (zie `public/audio/README.txt`).
- **Kaarttiles** — [OpenFreeMap](https://openfreemap.org) (Liberty-stijl), gerenderd via MapLibre GL.
- **Weerdata** — [Open-Meteo](https://open-meteo.com).
- **Kernlibraries** — React Three Fiber, `@react-three/drei`, `@react-three/rapier`, `react-three-map`, MapLibre GL, GSAP, Zustand, Leva.

## Lokaal draaien

Vereisten: Node.js (LTS) en npm.

```bash
npm install
cp .env.example .env   # VITE_IS_PROD=false laat de Leva-tuning panelen zien
npm run dev            # start de dev-server (Vite)
```

Overige scripts:

```bash
npm run build     # type-check + productie-build
npm run preview   # bekijk de productie-build lokaal
npm run lint      # ESLint
```
