<!--
  @component
  Renders a 2D clouds shader as a background with optional "moon" and top lighting.

  Usage:
  <Background
    enabled={true}
    speed={0.015}
    scale={1}
    density={0.4}
    opacity={0.3}
    color={[0.75, 0.75, 0.75]}
    resolutionScale={0.85}
    moonPosition={[0.6, 0.7]}
    moonRadius={0.4}
    moonIntensity={1}
    topLightStrength={0.8}
  />
  Optional: pass `class` to extend/override wrapper spacing.

  Parameters:
  - enabled: Whether the background is active. If false, resources are disposed and rendering stops. (default: true)
  - speed: Cloud drift speed (units per second). (default: 0.015)
  - scale: Base noise scale (higher = larger features). (default: 1)
  - density: 0 = very dense, 1 = very sparse; higher values yield sparser clouds. (default: 0.4)
  - opacity: Overall cloud opacity cap. (default: 0.3)
  - color: Subtle grey cloud color (linear-ish RGB). (default: [0.75, 0.75, 0.75])
  - resolutionScale: Internal render scale (0–1); lower improves performance; upscaled via CSS. (default: 0.85)
  - moonPosition: UV position (0..1) of the moon light center. (default: [0.6, 0.7])
  - moonRadius: Radius of the moon light in UV units. (default: 0.4)
  - moonIntensity: Brightness contribution of the moon light [0..1]. (default: 1)
  - topLightStrength: Additional gradient lighting from the top [0..1]. (default: 0.8)

  Notes:
  - Adaptive resolution scaling dynamically adjusts the internal resolution to maintain smooth frame times.
  - Toggling `enabled` from true to false after mount triggers a full teardown (RAF canceled, WebGL objects disposed).
  - Three.js is lazy-loaded inside `onMount`. Even for a static site, prerendered builds can execute in a non-browser context.
    Lazy import ensures this code only runs in the browser and keeps the initial bundle smaller by loading Three on demand.
-->

<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import vertexShader from "./shaders/clouds.vert.glsl?raw";
  import fragmentShader from "./shaders/clouds.frag.glsl?raw";

  let host: HTMLDivElement | null = null;

  // Public props to fine-tune the effect without editing shaders
  let {
    enabled = true,
    speed = 0.015, // Cloud drift speed (units per second)
    scale = 1, // Base noise scale (higher = larger features)
    density = 0.5, // 0 = very dense, 1 = very sparse
    opacity = 0.3, // Overall cloud opacity cap
    color = [0.75, 0.75, 0.75] as [number, number, number], // Subtle grey cloud color (linear-ish RGB)
    resolutionScale = 0.85, // Render at a lower internal resolution and upscale via CSS
    moonPosition = [0.6, 0.7] as [number, number], // UV position of the moon (0..1)
    moonRadius = 0.4, // Moon light radius in UV units
    moonIntensity = 1, // Brightness contribution [0..1]
    topLightStrength = 0.8, // Extra gradient light from top [0..1]
  } = $props();

  let teardown: (() => void) | undefined;

  onMount(async () => {
    if (!enabled || !host) return;

    // Lazy-load Three.js to avoid SSR issues
    const THREE = await import("three");

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.0));
    renderer.setClearColor(0x000000, 0); // fully transparent so it blends with page bg
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.pointerEvents = "none";
    renderer.domElement.style.willChange = "transform, opacity";
    renderer.domElement.style.transform = "translateZ(0)";

    host.appendChild(renderer.domElement);

    // Scene + Camera (screen-space quad)
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Uniforms
    const uniforms = {
      u_time: { value: 0.0 },
      u_aspect: { value: 1.0 },
      u_scale: { value: scale },
      u_speed: { value: speed },
      u_density: { value: density },
      u_opacity: { value: opacity },

      u_color: { value: new THREE.Color(color[0], color[1], color[2]) },
      u_moonPos: { value: new THREE.Vector2(moonPosition[0], moonPosition[1]) },
      u_moonRadius: { value: moonRadius },
      u_moonIntensity: { value: moonIntensity },
      u_topLightStrength: { value: topLightStrength },
    };

    // Shaders (imported from separate files)
    let currentScale = resolutionScale;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    // Resize handler
    const resize = () => {
      if (!host) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.0);
      renderer.setPixelRatio(dpr);
      const MAX_W = 1920;
      const MAX_H = 1080;
      const iw = Math.max(1, Math.min(MAX_W, Math.round(w * currentScale)));
      const ih = Math.max(1, Math.min(MAX_H, Math.round(h * currentScale)));
      renderer.setSize(iw, ih, false);
      uniforms.u_aspect.value = w / h;
    };

    resize();
    window.addEventListener("resize", resize);

    // Animation (auto-paused when hidden/offscreen)
    let raf = 0;
    let last = performance.now();
    let smoothedDt = 1 / 60;
    const dtSmoothing = 0.12;

    // Adaptive resolution scaling
    let adaptiveResolution = true;
    const scaleMin = 0.5;
    const scaleMax = resolutionScale;
    const scaleStep = 0.03;

    let running = true;
    let inView = true;

    const tick = (now: number) => {
      if (!running || !inView) return;
      const dt = (now - last) / 1000;
      last = now;

      smoothedDt = smoothedDt * (1 - dtSmoothing) + dt * dtSmoothing;
      uniforms.u_time.value += smoothedDt;
      renderer.render(scene, camera);

      // Adaptive resolution scaling based on smoothed frame time
      if (adaptiveResolution) {
        const ms = smoothedDt * 1000.0;
        let next = currentScale;
        if (ms > 19.0 && currentScale > scaleMin) {
          next = Math.max(scaleMin, currentScale - scaleStep);
        } else if (ms < 15.0 && currentScale < scaleMax) {
          next = Math.min(scaleMax, currentScale + scaleStep);
        }
        if (Math.abs(next - currentScale) > 0.001) {
          currentScale = next;
          resize();
        }
      }

      raf = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      const hidden = document.hidden;
      running = !hidden;
      if (hidden && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!hidden && inView && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        inView = entry?.isIntersecting ?? true;
        if (!inView && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        } else if (inView && running && !raf) {
          last = performance.now();
          raf = requestAnimationFrame(tick);
        }
      },
      { root: null, threshold: 0 },
    );

    io.observe(host!);

    raf = requestAnimationFrame(tick);

    teardown = () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
      io.disconnect();
      window.removeEventListener("resize", resize);
      quad.geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  });

  onDestroy(() => {
    teardown?.();
  });

  // React to runtime prop changes
  $effect(() => {
    if (teardown && !enabled) {
      teardown();
      teardown = undefined;
    }
  });
</script>

<div bind:this={host} class="clouds-layer" aria-hidden="true"></div>

<style>
  .clouds-layer {
    position: fixed;
    inset: 0;
    z-index: -10; /* sit beneath content layers */
    pointer-events: none;
    contain: strict;
  }
</style>
