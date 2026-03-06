import { Suspense, useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Float, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { Group } from 'three'

const MODEL_PATH = '/models/vault.glb'

function useGlassMaterial() {
  return useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#9FE870'),
        emissive: new THREE.Color('#9FE870'),
        emissiveIntensity: 0.15,
        metalness: 0.3,
        roughness: 0.12,
        transmission: 0.2,                        // no transmission (nothing to refract)
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        reflectivity: 1,
        sheen: 1,
        sheenRoughness: 0.3,
        sheenColor: new THREE.Color('#d4ffc4'),
        transparent: true,
        opacity: 0.88,
        envMapIntensity: 2,
        side: THREE.FrontSide,
      }),
    [],
  )
}

function Model() {
  const { scene } = useGLTF(MODEL_PATH)
  const ref = useRef<Group>(null)
  const glassMat = useGlassMaterial()

  // Replace all mesh materials with the glass material
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        ;(child as THREE.Mesh).material = glassMat
      }
    })
  }, [scene, glassMat])

  // Gentle auto-rotate
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.2
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={ref} dispose={null}>
        <primitive object={scene} scale={2} position={[0, -0.5, 0]} />
      </group>
    </Float>
  )
}

// Preload model so it's ready before Canvas mounts
useGLTF.preload(MODEL_PATH)

export function VaultModel() {
  const [interacting, setInteracting] = useState(false)

  return (
    <div className="h-full w-full">
      <Canvas
        camera={{ position: [0, 0.5, 6], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        style={{ background: 'transparent', cursor: 'grab' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-4, 3, -3]} intensity={0.6} color="#d4ffc4" />
        {/* Key highlight — top-front for specular kick */}
        <spotLight position={[0, 5, 4]} angle={0.4} penumbra={0.6} intensity={3} color="#ffffff" />
        {/* Rim lights — green-tinted for cohesion */}
        <pointLight position={[3, 1, -3]} intensity={2} color="#9FE870" />
        <pointLight position={[-3, -1, 2]} intensity={1.5} color="#6ee750" />
        <pointLight position={[0, -2, 3]} intensity={1} color="#b8f5a0" />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={interacting ? 0 : 1.5}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
          onStart={() => setInteracting(true)}
          onEnd={() => setInteracting(false)}
        />
        <Suspense fallback={null}>
          <Model />
        </Suspense>
      </Canvas>
    </div>
  )
}
