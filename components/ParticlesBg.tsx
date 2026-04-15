"use client";

import Particles from "react-tsparticles";

export default function ParticlesBg() {
  return (
    <Particles
      options={{
        background: { color: "transparent" },
        particles: {
          number: { value: 50 },
          size: { value: 2 },
          move: { speed: 0.5 },
          opacity: { value: 0.3 },
        },
      }}
    />
  );
}