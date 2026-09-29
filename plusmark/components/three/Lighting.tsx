"use client";

import { Environment, Lightformer } from "@react-three/drei";

/**
 * Photo-studio lighting: a large soft key, fill and rim plus a locally generated environment
 * (Lightformers, no HDR download). The environment mimics a softbox studio — a big overhead
 * strip, two tall side softboxes and a warm bounce card — so the brushed aluminium frames,
 * chrome corners and glossy HPL surfaces pick up long, clean highlights like catalogue photos.
 */
export function Lighting({ quality = "high" }: { quality?: "low" | "mid" | "high" }) {
  return (
    <>
      <hemisphereLight args={["#ffffff", "#d9d4cb", 0.35]} />
      {/* key: front-right, high — keeps the front rail (and its brand stickers) well lit */}
      <directionalLight position={[3, 4.5, 6]} intensity={1.55} color="#fffaf2" />
      {/* fill */}
      <directionalLight position={[-4.5, 1.5, 3.5]} intensity={0.5} color="#e6edf7" />
      {/* rim / kicker for edge separation */}
      <directionalLight position={[-1, 3, -5]} intensity={1.15} color="#dfe7f2" />
      <Environment resolution={quality === "low" ? 128 : quality === "mid" ? 256 : 512} frames={1}>
        <color attach="background" args={["#e9e8e4"]} />
        {/* overhead strip softbox */}
        <Lightformer form="rect" intensity={3} position={[0, 4, 2]} scale={[10, 1.6, 1]} rotation-x={Math.PI / 2.3} />
        {/* front key softbox */}
        <Lightformer form="rect" intensity={1.4} position={[2.5, 1.5, 6]} scale={[4, 3, 1]} />
        {/* tall side softboxes → long vertical highlights on rails */}
        <Lightformer form="rect" intensity={2} position={[-6, 1, 1]} scale={[2.5, 7, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.5} position={[6, 0.5, 0.5]} scale={[2, 7, 1]} rotation-y={-Math.PI / 2} />
        {/* rim ring behind */}
        <Lightformer form="ring" intensity={0.9} position={[2, 2.5, -5]} scale={2.5} />
        {/* warm floor bounce */}
        <Lightformer form="rect" intensity={0.55} color="#f3e6d2" position={[0, -3, 2]} scale={[12, 1.5, 1]} rotation-x={-Math.PI / 2} />
      </Environment>
    </>
  );
}
