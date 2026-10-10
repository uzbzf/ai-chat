import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import styles from '../../styles/widget.module.css'

function readAccentColor(): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue('--chat-accent')
    .trim()
  return value || '#2dbd8f'
}

export function ChatBackground3D() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const scene = new THREE.Scene()
    const fogColor = new THREE.Color(readAccentColor()).lerp(new THREE.Color('#0a0c10'), 0.88)
    scene.fog = new THREE.Fog(fogColor.getHex(), 4, 14)

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 30)
    camera.position.set(0, 0.2, 6.5)

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    host.appendChild(renderer.domElement)

    const accent = new THREE.Color(readAccentColor())
    const accentSoft = accent.clone().multiplyScalar(0.55)
    const wireMat = new THREE.MeshBasicMaterial({
      color: accent,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    })
    const fillMat = new THREE.MeshStandardMaterial({
      color: accentSoft,
      metalness: 0.35,
      roughness: 0.45,
      transparent: true,
      opacity: 0.22,
    })

    const group = new THREE.Group()
    const torus = new THREE.Mesh(new THREE.TorusKnotGeometry(1.1, 0.28, 96, 12), fillMat)
    torus.add(new THREE.Mesh(torus.geometry, wireMat))
    group.add(torus)

    const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85, 0), fillMat.clone())
    ico.position.set(-2.2, 0.6, -1.2)
    ico.add(new THREE.Mesh(ico.geometry, wireMat.clone()))
    group.add(ico)

    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.45, 0.04, 12, 64), wireMat.clone())
    ring.rotation.x = Math.PI / 2.4
    ring.position.set(1.8, -0.5, -0.8)
    group.add(ring)

    const particles = new THREE.Points(
      new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 48 }, () =>
          new THREE.Vector3(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 6,
          ),
        ),
      ),
      new THREE.PointsMaterial({
        color: accent,
        size: 0.045,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      }),
    )
    group.add(particles)

    scene.add(group)

    const ambient = new THREE.AmbientLight(0xffffff, 0.55)
    const key = new THREE.DirectionalLight(accent.getHex(), 1.1)
    key.position.set(3, 4, 5)
    scene.add(ambient, key)

    const resize = () => {
      const { width, height } = host.getBoundingClientRect()
      if (width < 1 || height < 1) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }

    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()

    let frameId = 0
    const clock = new THREE.Clock()

    const tick = () => {
      const t = clock.getElapsedTime()
      if (!reducedMotion) {
        group.rotation.y = t * 0.22
        group.rotation.x = Math.sin(t * 0.15) * 0.12
        torus.rotation.z = t * 0.35
        ico.rotation.y = -t * 0.4
        ring.rotation.z = t * 0.25
        particles.rotation.y = t * 0.08
      }
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(frameId)
      ro.disconnect()
      renderer.dispose()
      host.removeChild(renderer.domElement)
      torus.geometry.dispose()
      ico.geometry.dispose()
      ring.geometry.dispose()
      particles.geometry.dispose()
      ;[wireMat, fillMat, ico.material, ring.material, particles.material].forEach(
        (m) => {
          if (m && 'dispose' in m) (m as THREE.Material).dispose()
        },
      )
    }
  }, [])

  return <div ref={hostRef} className={styles.messagesBg3d} aria-hidden />
}
