"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, type RefObject } from "react";
import * as THREE from "three";
import { DRACO_PATH } from "./capabilities";

interface ProductModelProps {
  url: string;
  /** Largest dimension the model is normalised to, in scene units. */
  fitSize?: number;
  /** Optional per-frame opacity source (0–1) for cross-fade transitions. */
  opacityRef?: RefObject<number>;
  onReady?: () => void;
  envMapIntensity?: number;
  /** Called with the normalised bounding-box size once the model is ready. */
  onSize?: (size: THREE.Vector3) => void;
}

type FadeMaterial = THREE.MeshStandardMaterial & { userData: { baseOpacity: number; baseTransparent: boolean } };

/**
 * Data-driven GLB model. Clones the cached scene so the same model can be used
 * in multiple canvases, normalises size/centre, and prepares materials for fading.
 */
export function ProductModel({ url, fitSize = 2.2, opacityRef, onReady, envMapIntensity = 1, onSize }: ProductModelProps) {
  const { scene } = useGLTF(url, DRACO_PATH);
  const maxAnisotropy = useThree((s) => s.gl.capabilities.getMaxAnisotropy());

  const { object, materials, fitted } = useMemo(() => {
    const object = scene.clone(true);
    const materials: FadeMaterial[] = [];
    const anisotropy = Math.min(maxAnisotropy, 8);
    object.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      const src = mesh.material as THREE.MeshStandardMaterial;
      const mat = src.clone() as FadeMaterial;
      mat.envMapIntensity = envMapIntensity;
      // Corner caps: tone down studio reflections so the black insert stays black and the
      // signature red stays saturated instead of turning grey / pink under the softboxes.
      if (mat.name === "cap-black" || mat.name === "abs-dark") mat.envMapIntensity = envMapIntensity * 0.3;
      else if (mat.name === "cap-red") mat.envMapIntensity = envMapIntensity * 0.6;
      // Sharper textures at grazing angles (brand stickers on the rail, fabric/chalk grain,
      // the PLUSMARK emboss on the Metallic Premium corner caps).
      for (const tex of [mat.map, mat.roughnessMap, mat.metalnessMap, mat.normalMap]) {
        if (tex && tex.anisotropy !== anisotropy) {
          tex.anisotropy = anisotropy;
          tex.needsUpdate = true;
        }
      }
      if (mat.name.startsWith("decal-")) {
        // Brand stickers: keep true print colours (skip filmic tone mapping, which washes out
        // the navy/orange/red), avoid z-fighting with the rail, and let them draw over it.
        mat.toneMapped = false;
        mat.envMapIntensity = Math.min(envMapIntensity, 0.35);
        mat.polygonOffset = true;
        mat.polygonOffsetFactor = -2;
        mat.polygonOffsetUnits = -2;
        mat.alphaTest = 0.02;
        mesh.renderOrder = 2;
      }
      mat.userData = { baseOpacity: src.opacity, baseTransparent: src.transparent };
      mesh.material = mat;
      materials.push(mat);
    });
    // normalise: centre at origin, scale largest side to fitSize
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const s = fitSize / Math.max(size.x, size.y, size.z * 1.4);
    object.position.sub(center.multiplyScalar(s));
    object.scale.setScalar(s);
    return { object, materials, fitted: size.clone().multiplyScalar(s) };
  }, [scene, fitSize, envMapIntensity, maxAnisotropy]);
  useLayoutEffect(() => {
    onSize?.(fitted);
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [object]);

  useEffect(
    () => () => {
      // Dispose cloned materials; geometry stays cached by useGLTF for re-use.
      materials.forEach((m) => m.dispose());
    },
    [materials],
  );

  useFrame(() => {
    if (!opacityRef) return;
    const o = opacityRef.current ?? 1;
    for (const m of materials) {
      const target = m.userData.baseOpacity * o;
      if (Math.abs(m.opacity - target) < 1e-3) continue;
      m.opacity = target;
      const needsTransparent = m.userData.baseTransparent || o < 0.999;
      if (m.transparent !== needsTransparent) {
        m.transparent = needsTransparent;
        m.depthWrite = !m.userData.baseTransparent;
        m.needsUpdate = true;
      }
    }
  });

  return <primitive object={object} />;
}

export function preloadModel(url?: string) {
  if (url) useGLTF.preload(url, DRACO_PATH);
}
