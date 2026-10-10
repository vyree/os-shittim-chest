/**
 * ba-viewer.ts — faithful standalone port of the Blue Archive wiki 3D model viewer.
 *
 * Renders .glb characters with Three.js:
 *  - inverted-hull black outline (wiki "25%")
 *  - wiki camera framing (FOV 35, azimuth 0, elevation 5, ~92.6% frame height)
 *  - unlit materials (raw texture colors, no shadows, no tone mapping)
 *  - THREE.AnimationMixer playback with per-clip facing corrections
 *  - OrbitControls manual rotate (no auto-rotate), slider zoom
 *
 * Framework-agnostic (no React). Tested against three@0.185.1 (pinned).
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export interface BaClipInfo {
  name: string;
  duration: number;
}

export interface BaCharacterDef {
  id: string;
  name: string;
  /** URL of the .glb, e.g. '/airi_band.glb' (served from public/) or https://cdn.jsdelivr.net/... */
  url: string;
  /** clip names to expose, in order — ONLY clips from this character's own GLB.
   * If empty and loadAllClips is true, all animations in the GLB are exposed. */
  clips: string[];
  /** If true and clips is empty, expose all animations found in the GLB. */
  loadAllClips?: boolean;
  /** per-clip Y-rotation correction in radians (e.g. Airi Normal_Idle spins -90°) */
  facingCorrections?: Record<string, number>;
  /**
   * Node names to remove from the scene. For props whose bones aren't animated
   * in the exposed clips (e.g. Airi's piano + piano bag) — they'd otherwise
   * render stuck at bind pose, floating over the character. The wiki viewer
   * hides such parts via its hide-parts system; this is our equivalent.
   */
  hiddenMeshes?: string[];
}

export interface BaStats {
  time: number;
  duration: number;
  fps: number;
  playing: boolean;
}

const FOV_DEG = 35;
const AZIM_DEG = 0;
const ELEV_DEG = 5;
const OUTLINE_WIDTH = 0.0005; // wiki "25%": 0.002 * 25 / 100
const OUTLINE_COLOR = 0x000000;

/** Inverted-hull outline vertex shader (same include sequence as three's own lit shaders). */
const OUTLINE_VERT = /* glsl */ `
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
uniform float outlineWidth;
void main() {
  #include <beginnormal_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  vec3 transformed = vec3( position );
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
  vec3 viewNormal = normalize( normalMatrix * objectNormal );
  // scale by view depth -> near-constant line width on screen
  mvPosition.xyz += viewNormal * outlineWidth * max( - mvPosition.z, 0.05 );
  gl_Position = projectionMatrix * mvPosition;
}
`;

const OUTLINE_FRAG = /* glsl */ `
uniform vec3 outlineColor;
void main() {
  gl_FragColor = vec4( outlineColor, 1.0 );
}
`;

export class BaViewer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private clock = new THREE.Clock();
  private raf = 0;
  private ro: ResizeObserver | null = null;

  private loader = new GLTFLoader();
  private modelRoot: THREE.Group | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private clips = new Map<string, THREE.AnimationClip>();
  private action: THREE.AnimationAction | null = null;
  private def: BaCharacterDef | null = null;

  private playing = true;
  private speedPct = 100;
  private loop = true;
  private baseDistance = 5;
  private zoomPct = 100;
  private loadToken = 0;
  private fpsEMA = 60;
  private lastStatsPush = 0;
  private disposed = false;

  constructor(
    private container: HTMLElement,
    private onStats: (s: BaStats) => void,
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0); // transparent canvas
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;
    const w = Math.max(container.clientWidth, 1);
    const h = Math.max(container.clientHeight, 1);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h, false);
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(FOV_DEG, w / h, 0.01, 1000);
    this.camera.position.set(0, 1, 5);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    this.controls.enableZoom = false; // zoom is driven by the slider
    this.controls.enabled = false; // enabled in ROTATE mode
    this.controls.target.set(0, 1, 0);

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(container);

    this.tick();
  }

  // ------------------------------------------------------------------ loading

  /** Load a character's GLB; returns the exposed clips with real durations. */
  async loadCharacter(def: BaCharacterDef): Promise<BaClipInfo[]> {
    const token = ++this.loadToken;
    this.clearModel();
    this.def = def;
    const gltf = await this.loader.loadAsync(def.url);
    if (token !== this.loadToken || this.disposed) return [];

    const root = new THREE.Group();
    root.add(gltf.scene);
    this.applyWikiLook(gltf.scene);
    // Remove unanimated prop nodes (bind-pose floaters) per character config.
    // (Removed from the scene graph entirely — more robust than visible=false.)
    console.log('[BaViewer] loadCharacter:', def.id, 'hiddenMeshes=', def.hiddenMeshes);
    if (def.hiddenMeshes && def.hiddenMeshes.length > 0) {
      const hide = new Set(def.hiddenMeshes);
      const doomed: THREE.Object3D[] = [];
      const allNames: string[] = [];
      root.traverse((o) => {
        allNames.push(o.name || '(unnamed:' + o.type + ')');
        if (hide.has(o.name)) doomed.push(o);
      });
      console.log('[BaViewer] scene node names:', JSON.stringify(allNames));
      for (const o of doomed) {
        o.parent?.remove(o);
        // Dispose geometry/materials of the removed subtree.
        o.traverse((c) => {
          const mesh = c as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.geometry.dispose();
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((m) => m.dispose());
          }
        });
      }
      console.log('[BaViewer] removed hidden nodes:', doomed.map((d) => d.name), 'count=', doomed.length);
    }
    this.modelRoot = root;
    this.scene.add(root);

    this.mixer = new THREE.AnimationMixer(root);
    this.clips.clear();
    const infos: BaClipInfo[] = [];
    // If loadAllClips is set and no specific clips listed, expose all animations in the GLB
    const clipNames = (def.loadAllClips && def.clips.length === 0)
      ? gltf.animations.map((c) => c.name)
      : def.clips;
    for (const name of clipNames) {
      const clip = gltf.animations.find((c) => c.name === name);
      if (clip) {
        this.clips.set(name, clip);
        infos.push({ name, duration: clip.duration });
      }
    }
    this.frameCamera();
    if (infos.length > 0) this.playClip(infos[0].name);
    return infos;
  }

  /** Convert every material to unlit (raw texture colors) + add inverted-hull outline. */
  private applyWikiLook(obj: THREE.Object3D) {
    const matCache = new Map<THREE.Material, THREE.Material>();
    const outlineMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        outlineWidth: { value: OUTLINE_WIDTH },
        outlineColor: { value: new THREE.Color(OUTLINE_COLOR) },
      },
      vertexShader: OUTLINE_VERT,
      fragmentShader: OUTLINE_FRAG,
    });

    // IMPORTANT: preserve the original texture map — this is what makes the
    // character look right. Never drop `map` or replace colors wholesale.
    const toUnlit = (orig: THREE.Material): THREE.Material => {
      const hit = matCache.get(orig);
      if (hit) return hit;
      const o = orig as THREE.MeshStandardMaterial;
      const u = new THREE.MeshBasicMaterial();
      if (o.map) u.map = o.map;
      if ((o as unknown as { color?: THREE.Color }).color) {
        u.color.copy((o as unknown as { color: THREE.Color }).color);
      }
      u.transparent = !!o.transparent;
      if (typeof o.opacity === 'number') u.opacity = o.opacity;
      u.side = o.side;
      const alphaTest = (o as unknown as { alphaTest?: number }).alphaTest;
      u.alphaTest = typeof alphaTest === 'number' ? alphaTest : 0;
      if ((o as unknown as { vertexColors?: boolean }).vertexColors) u.vertexColors = true;
      const alphaMap = (o as unknown as { alphaMap?: THREE.Texture | null }).alphaMap;
      if (alphaMap) u.alphaMap = alphaMap;
      u.toneMapped = false; // bypass tone mapping, like the wiki's unlit mode
      matCache.set(orig, u);
      return u;
    };

    // TWO-PHASE: collect meshes first, THEN attach outlines.
    // (Attaching a child Mesh during traverse() makes traverse visit the new
    // child too -> infinite recursion -> "Maximum call stack size exceeded".)
    const meshes: THREE.Mesh[] = [];
    obj.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) meshes.push(child as THREE.Mesh);
    });
    for (const mesh of meshes) {
      const origMats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const unlit = origMats.map(toUnlit);
      mesh.material = Array.isArray(mesh.material) ? unlit : unlit[0];

      // Outline: skip meshes with any transparent material (same as the wiki).
      if (!origMats.every((mm) => !mm.transparent)) continue;
      let outline: THREE.Mesh;
      const skinned = mesh as THREE.SkinnedMesh;
      if (skinned.isSkinnedMesh) {
        const o = new THREE.SkinnedMesh(mesh.geometry, outlineMat);
        o.bind(skinned.skeleton, skinned.bindMatrix);
        outline = o;
      } else {
        outline = new THREE.Mesh(mesh.geometry, outlineMat);
      }
      outline.renderOrder = -1;
      outline.frustumCulled = false;
      mesh.add(outline);
    }
  }

  private clearModel() {
    if (this.mixer) this.mixer.stopAllAction();
    this.mixer = null;
    this.action = null;
    this.clips.clear();
    if (this.modelRoot) {
      this.scene.remove(this.modelRoot);
      this.modelRoot.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry.dispose();
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => m.dispose());
        }
      });
      this.modelRoot = null;
    }
  }

  // ------------------------------------------------------------------- camera

  /** Wiki framing: FOV 35, az 0 / el 5, character ~92.6% of viewport height. */
  private frameCamera() {
    if (!this.modelRoot) return;
    const box = new THREE.Box3().setFromObject(this.modelRoot);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const w = Math.max(this.container.clientWidth, 1);
    const h = Math.max(this.container.clientHeight, 1);
    const t = Math.tan(THREE.MathUtils.degToRad(FOV_DEG) / 2);
    const l =
      (Math.max(size.y / h, size.x / w) * h) / (2 * t) * 1.08 + 0.6 * size.z;
    this.baseDistance = l;
    this.controls.target.copy(center);
    const az = THREE.MathUtils.degToRad(AZIM_DEG);
    const el = THREE.MathUtils.degToRad(ELEV_DEG);
    const dir = new THREE.Vector3(
      Math.cos(el) * Math.sin(az),
      Math.sin(el),
      Math.cos(el) * Math.cos(az),
    );
    this.camera.position.copy(center).addScaledVector(dir, l / (this.zoomPct / 100));
    this.camera.near = l / 200;
    this.camera.far = l * 20;
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(center);
    this.controls.update();
  }

  resetView() {
    this.zoomPct = 100;
    this.frameCamera();
  }

  /** Slider zoom 75..140 (%). Dollies along the current view direction. */
  setZoom(pct: number) {
    this.zoomPct = THREE.MathUtils.clamp(pct, 50, 200);
    const dir = this.camera.position.clone().sub(this.controls.target).normalize();
    this.camera.position
      .copy(this.controls.target)
      .addScaledVector(dir, this.baseDistance / (this.zoomPct / 100));
  }

  /** ROTATE mode: manual drag orbit (no auto-rotate). */
  setOrbitEnabled(enabled: boolean) {
    this.controls.enabled = enabled;
  }

  /** Arrow-button nudge: rotate azimuth by 15°. */
  nudgeAzimuth(dir: 1 | -1) {
    const off = this.camera.position.clone().sub(this.controls.target);
    const sph = new THREE.Spherical().setFromVector3(off);
    sph.theta += dir * Math.PI / 12;
    off.setFromSpherical(sph);
    this.camera.position.copy(this.controls.target).add(off);
  }

  // ---------------------------------------------------------------- animation

  playClip(name: string) {
    const clip = this.clips.get(name);
    if (!clip || !this.mixer) return;
    this.mixer.stopAllAction();
    this.action = this.mixer.clipAction(clip);
    this.action.setLoop(this.loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
    this.action.clampWhenFinished = !this.loop;
    this.action.play();
    if (this.modelRoot && this.def?.facingCorrections) {
      this.modelRoot.rotation.y = this.def.facingCorrections[name] ?? 0;
    }
    this.playing = true;
    this.pushStats();
  }

  setPlaying(playing: boolean) {
    this.playing = playing;
    this.pushStats();
  }

  togglePlaying() {
    this.setPlaying(!this.playing);
  }

  /** 0..200 (%). 0% = frozen. */
  setSpeed(pct: number) {
    this.speedPct = Math.max(0, pct);
  }

  /** Scrub to a fraction of the clip; pauses while scrubbing (wiki behavior). */
  seek01(f: number) {
    if (!this.action) return;
    const d = this.action.getClip().duration;
    this.action.time = THREE.MathUtils.clamp(f, 0, 1) * d;
    this.mixer?.update(0);
    this.playing = false;
    this.pushStats();
  }

  setLoop(loop: boolean) {
    this.loop = loop;
    if (this.action) {
      this.action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
      this.action.clampWhenFinished = !loop;
    }
  }

  getDuration(): number {
    return this.action ? this.action.getClip().duration : 0;
  }

  getTime(): number {
    return this.action ? this.action.time : 0;
  }

  // --------------------------------------------------------------------- loop

  private tick = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.tick);
    const dt = Math.min(this.clock.getDelta(), 0.1);
    if (dt > 0) this.fpsEMA += (1 / dt - this.fpsEMA) * 0.05;
    if (this.playing && this.speedPct > 0 && this.mixer) {
      this.mixer.update((dt * this.speedPct) / 100);
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    const now = performance.now();
    if (now - this.lastStatsPush > 250) {
      this.lastStatsPush = now;
      this.pushStats();
    }
  };

  private pushStats() {
    this.onStats({
      time: this.getTime(),
      duration: this.getDuration(),
      fps: Math.round(this.fpsEMA),
      playing: this.playing,
    });
  }

  private resize() {
    const w = Math.max(this.container.clientWidth, 1);
    const h = Math.max(this.container.clientHeight, 1);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.ro?.disconnect();
    this.clearModel();
    this.controls.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
