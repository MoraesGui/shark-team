// Ocean Background — Originkit

"use client"

import * as React from "react"
import { useEffect, useRef } from "react"
import * as THREE from "three"

const DEFAULTS = {
    deep: "#000824",
    mid: "#5F0B0B",
    surge: "#030124",
    crest: "#030B28",
    zoom: 19,
    warp: 16,
    ridge: 20,
    sway: 20,
    detail: 7,
    speed: 4,
    spin: 10,
    hover: 12,
}

type Config = {
    deep: string
    mid: string
    surge: string
    crest: string
    zoom: number
    warp: number
    ridge: number
    sway: number
    detail: number
    speed: number
    spin: number
    hover: number
}

const SHARPNESS = 0.4 + 1 * 0.3
const EXPOSURE = 0.3 + 10 * 0.1

function clamp(v: number, lo: number, hi: number, fallback: number): number {
    const n = typeof v === "number" && isFinite(v) ? v : fallback
    return Math.max(lo, Math.min(hi, n))
}

function settingsFor(cfg: Config) {
    return {
        speed: clamp(cfg.speed, 0, 20, DEFAULTS.speed) * 0.09,

        zoom: 0.6 + clamp(cfg.zoom, 1, 20, DEFAULTS.zoom) * 0.28,

        warp: clamp(cfg.warp, 0, 20, DEFAULTS.warp) * 0.31,

        ridge: clamp(cfg.ridge, 0, 20, DEFAULTS.ridge) * 0.05,

        sway: clamp(cfg.sway, 0, 20, DEFAULTS.sway) * 0.03,

        detail: 1.0 + clamp(cfg.detail, 1, 20, DEFAULTS.detail) * 0.2,
        sharpness: SHARPNESS,
        exposure: EXPOSURE,

        spin: clamp(cfg.spin, 0, 20, DEFAULTS.spin) * 0.06,

        hover: clamp(cfg.hover, 0, 200, DEFAULTS.hover) * 0.03,
    }
}

const QUAD_VERTEX =  `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
    }
`

const ABYSS_FRAGMENT =  `
    precision highp float;

    uniform vec2 uResolution;
    uniform vec3 uDeep;
    uniform vec3 uMid;
    uniform vec3 uSurge;
    uniform vec3 uCrest;
    uniform float uTime;
    uniform float uZoom;
    uniform float uWarp;
    uniform float uRidge;
    uniform float uSway;
    uniform float uSharpness;
    uniform float uDetail;
    uniform float uExposure;
    uniform float uYaw;
    uniform vec2 uPointer;
    uniform float uActive;
    uniform float uHover;

    varying vec2 vUv;

    float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
    }

    float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }

    float fbm(vec2 p, float oct) {
        float sum = 0.0;
        float amp = 0.5;
        float norm = 0.0;
        for (int i = 0; i < 5; i++) {
            float w = clamp(oct - float(i), 0.0, 1.0);
            if (w > 0.0) {
                sum += noise(p) * amp * w;
                norm += amp * w;
            }
            p *= 2.03;

            p = mat2(0.8, 0.6, -0.6, 0.8) * p;
            amp *= 0.5;
        }
        return sum / max(0.0001, norm);
    }

    float ridged(vec2 p, float oct) {
        float sum = 0.0;
        float amp = 0.5;
        float norm = 0.0;
        for (int i = 0; i < 5; i++) {
            float w = clamp(oct - float(i), 0.0, 1.0);
            if (w > 0.0) {
                float v = 1.0 - abs(noise(p) * 2.0 - 1.0);
                sum += v * v * amp * w;
                norm += amp * w;
            }
            p *= 2.03;
            p = mat2(0.8, 0.6, -0.6, 0.8) * p;
            amp *= 0.5;
        }
        return sum / max(0.0001, norm);
    }

    vec3 ramp(float t) {
        vec3 c = mix(uDeep, uMid, smoothstep(0.05, 0.45, t));
        c = mix(c, uSurge, smoothstep(0.42, 0.78, t));
        return mix(c, uCrest, smoothstep(0.74, 1.0, t));
    }

    void main() {
        vec2 uv = vUv - 0.5;

        uv.x *= uResolution.x / max(1.0, uResolution.y);

        vec2 p = uv * uZoom - vec2(uYaw, 0.0);

        vec2 toPointer = uv - uPointer;
        float influence = uActive * exp(-dot(toPointer, toPointer) * 5.0) * uHover;
        vec2 tangent = vec2(-toPointer.y, toPointer.x);
        p += tangent * influence;
        vec2 flow = vec2(0.0, uTime);
        vec2 lateral = vec2(uTime * 0.21, 0.0);

        float sway = sin(p.y * 1.9 - uTime * 1.3) * 0.55
                   + sin(p.y * 3.7 + uTime * 0.9 + 1.7) * 0.25;
        p.x += sway * uSway;
        p.y += sin(p.x * 2.3 + uTime * 1.1) * uSway * 0.35;

        vec2 wq = p * vec2(1.0, 0.32);
        vec2 warp = vec2(
            fbm(wq + lateral, uDetail),
            fbm(wq + lateral * 1.4 + vec2(4.3, 2.1), uDetail)
        );
        vec2 push = warp * uWarp;

        float calm = fbm(p + push - flow, uDetail);

        float veins = ridged(p * 1.35 + push * 0.8 - flow * 1.15, uDetail);

        float v = mix(calm, veins, uRidge);
        v = clamp(pow(clamp(v, 0.0, 1.0), uSharpness) * uExposure, 0.0, 1.0);

        v = clamp(v + influence * 0.6, 0.0, 1.0);

        vec3 col = ramp(v);
        gl_FragColor = vec4(col, 1.0);
    }
`

class AbyssScene {
    private container: HTMLElement
    private cfg: Config

    private renderer: THREE.WebGLRenderer
    private scene = new THREE.Scene()
    private camera = new THREE.Camera()
    private geometry = new THREE.PlaneGeometry(2, 2)
    private material: THREE.ShaderMaterial
    private mesh: THREE.Mesh

    private time = 0
    private yaw = 0

    private targetPointerX = 0
    private targetPointerY = 0
    private pointerX = 0
    private pointerY = 0
    private targetActive = 0
    private active = 0

    private frameId = 0
    private lastT = 0
    private disposed = false

    constructor(container: HTMLElement, cfg: Config) {
        this.container = container
        this.cfg = cfg
        const S = settingsFor(cfg)

        this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true })

        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
        this.renderer.outputColorSpace = THREE.SRGBColorSpace
        this.renderer.setClearColor(0x000000, 0)
        const el = this.renderer.domElement
        el.style.position = "absolute"
        el.style.inset = "0"
        el.style.width = "100%"
        el.style.height = "100%"
        container.appendChild(el)

        this.material = new THREE.ShaderMaterial({
            vertexShader: QUAD_VERTEX,
            fragmentShader: ABYSS_FRAGMENT,
            uniforms: {
                uResolution: { value: new THREE.Vector2(1, 1) },
                uDeep: { value: new THREE.Color(cfg.deep) },
                uMid: { value: new THREE.Color(cfg.mid) },
                uSurge: { value: new THREE.Color(cfg.surge) },
                uCrest: { value: new THREE.Color(cfg.crest) },
                uTime: { value: 0 },
                uZoom: { value: S.zoom },
                uWarp: { value: S.warp },
                uRidge: { value: S.ridge },
                uSway: { value: S.sway },
                uSharpness: { value: S.sharpness },
                uDetail: { value: S.detail },
                uExposure: { value: S.exposure },
                uYaw: { value: 0 },
                uPointer: { value: new THREE.Vector2(0, 0) },
                uActive: { value: 0 },
                uHover: { value: S.hover },
            },
            transparent: true,
            depthTest: false,
            depthWrite: false,
        })

        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.frustumCulled = false
        this.scene.add(this.mesh)
        this.bindEvents()
    }

    private bindEvents() {
        const el = this.container.closest('section') || this.container

        const move = (e: PointerEvent) => {
            const rect = el.getBoundingClientRect()
            if (rect.width <= 0 || rect.height <= 0) return
            const aspect = rect.width / Math.max(1, rect.height)
            this.targetPointerX = ((e.clientX - rect.left) / rect.width - 0.5) * aspect
            this.targetPointerY = 0.5 - (e.clientY - rect.top) / rect.height
            this.targetActive = 1
        }
        const leave = () => {
            this.targetActive = 0
        }

        el.addEventListener("pointermove", move)
        el.addEventListener("pointerleave", leave)
        el.addEventListener("pointercancel", leave)

        this.unbind = () => {
            el.removeEventListener("pointermove", move)
            el.removeEventListener("pointerleave", leave)
            el.removeEventListener("pointercancel", leave)
        }
    }

    private unbind = () => {}

    start() {
        this.stop()
        this.lastT = performance.now()
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.step()
            return
        }
        const loop = () => {
            this.frameId = requestAnimationFrame(loop)
            this.step()
        }
        loop()
    }

    stop() {
        cancelAnimationFrame(this.frameId)
    }

    setSize(width: number, height: number) {
        if (this.disposed || width <= 0 || height <= 0) return
        this.renderer.setSize(width, height, false)
        this.material.uniforms.uResolution.value.set(width, height)
        this.renderer.render(this.scene, this.camera)
    }

    updateConfig(cfg: Config) {
        if (this.disposed) return
        this.cfg = cfg
        const S = settingsFor(cfg)
        const u = this.material.uniforms

        u.uDeep.value.set(cfg.deep || DEFAULTS.deep)
        u.uMid.value.set(cfg.mid || DEFAULTS.mid)
        u.uSurge.value.set(cfg.surge || DEFAULTS.surge)
        u.uCrest.value.set(cfg.crest || DEFAULTS.crest)
        u.uZoom.value = S.zoom
        u.uWarp.value = S.warp
        u.uRidge.value = S.ridge
        u.uSway.value = S.sway
        u.uDetail.value = S.detail
    }

    private step() {
        if (this.disposed) return
        const now = performance.now()
        let dt = (now - this.lastT) / 1000
        this.lastT = now
        if (!isFinite(dt) || dt < 0) dt = 0

        if (dt > 0.05) dt = 0.05

        const S = settingsFor(this.cfg)
        this.time += dt * S.speed

        this.yaw += S.spin * dt

        const posEase = 1 - Math.exp(-dt * 8)
        const activeEase = 1 - Math.exp(-dt * 3)
        this.pointerX += (this.targetPointerX - this.pointerX) * posEase
        this.pointerY += (this.targetPointerY - this.pointerY) * posEase
        this.active += (this.targetActive - this.active) * activeEase

        const u = this.material.uniforms
        u.uTime.value = this.time
        u.uYaw.value = this.yaw
        u.uPointer.value.set(this.pointerX, this.pointerY)
        u.uActive.value = this.active
        u.uHover.value = S.hover
        this.renderer.render(this.scene, this.camera)
    }

    dispose() {
        this.disposed = true
        cancelAnimationFrame(this.frameId)
        this.unbind()
        this.geometry.dispose()
        this.material.dispose()
        this.renderer.dispose()
        const el = this.renderer.domElement
        if (el.parentNode === this.container) this.container.removeChild(el)
    }
}

interface AbyssOrbProps {
    deep?: string
    mid?: string
    surge?: string
    crest?: string
    zoom?: number
    warp?: number
    ridge?: number
    sway?: number
    detail?: number
    speed?: number
    spin?: number
    hover?: number
    style?: React.CSSProperties
}

function __OriginkitBase_AbyssOrb(props: AbyssOrbProps) {
    const {
        deep = DEFAULTS.deep,
        mid = DEFAULTS.mid,
        surge = DEFAULTS.surge,
        crest = DEFAULTS.crest,
        zoom = DEFAULTS.zoom,
        warp = DEFAULTS.warp,
        ridge = DEFAULTS.ridge,
        sway = DEFAULTS.sway,
        detail = DEFAULTS.detail,
        speed = DEFAULTS.speed,
        spin = DEFAULTS.spin,
        hover = DEFAULTS.hover,
        style,
    } = props

    const containerRef = useRef<HTMLDivElement | null>(null)
    const sceneRef = useRef<AbyssScene | null>(null)

    const cfgRef = useRef<Config>(null as any)
    cfgRef.current = {
        deep,
        mid,
        surge,
        crest,
        zoom,
        warp,
        ridge,
        sway,
        detail,
        speed,
        spin,
        hover,
    }

    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        let scene: AbyssScene
        try {
            scene = new AbyssScene(container, cfgRef.current)
        } catch {
            return
        }
        sceneRef.current = scene
        scene.setSize(container.clientWidth, container.clientHeight)
        scene.start()

        let visible = true
        const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
        const sync = () => {
            if (visible && !document.hidden) scene.start()
            else scene.stop()
        }
        const observer = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting
            sync()
        })
        observer.observe(container)
        document.addEventListener('visibilitychange', sync)
        motionPreference.addEventListener('change', sync)

        const ro = new ResizeObserver(() => {
            scene.setSize(container.clientWidth, container.clientHeight)
        })
        ro.observe(container)
        return () => {
            observer.disconnect()
            document.removeEventListener('visibilitychange', sync)
            motionPreference.removeEventListener('change', sync)
            ro.disconnect()
            scene.dispose()
            sceneRef.current = null
        }
    }, [])

    useEffect(() => {
        sceneRef.current?.updateConfig(cfgRef.current)
    }, [deep, mid, surge, crest, zoom, warp, ridge, sway, detail, speed, spin, hover])

    return (
        <div
            ref={containerRef}
            aria-hidden="true"
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                minWidth: 120,
                minHeight: 120,
                overflow: "hidden",
                ...style,
            }}
        />
    )
}

AbyssOrb.displayName = "Abyss Orb"
AbyssOrb.defaultProps = { ...DEFAULTS }

const __originkitPresetProps = {
  "deep": "#000824",
  "mid": "#5F0B0B",
  "surge": "#030124",
  "crest": "#030B28",
  "zoom": 19,
  "warp": 16,
  "ridge": 20,
  "sway": 20,
  "detail": 7,
  "speed": 4,
  "spin": 10,
  "hover": 12
};

export default function AbyssOrb(props: Record<string, unknown>) {
  return <__OriginkitBase_AbyssOrb {...(__originkitPresetProps as Record<string, unknown>)} {...props} />;
}
