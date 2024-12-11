import * as THREE from "three";

// Data and visualization
import { CompositionShader } from "./shaders/CompositionShader.js";
import {
  BASE_LAYER,
  BLOOM_LAYER,
  BLOOM_PARAMS,
  OVERLAY_LAYER,
} from "./config/renderConfig.js";

// Rendering
import { MapControls } from "three/addons/controls/OrbitControls.js";

import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

import { Star } from "./star.js";

let canvas,
  renderer,
  camera,
  scene,
  orbit,
  baseComposer,
  bloomComposer,
  overlayComposer;

function initThree() {
  // grab canvas
  canvas = document.querySelector("#canvas");

  // scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xebe2db, 0.00003);

  // camera
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    5000000
  );
  camera.position.set(0, 50, 50);
  camera.up.set(0, 0, 1);
  camera.lookAt(0, 0, 0);

  // map orbit
  orbit = new MapControls(camera, canvas);
  orbit.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  orbit.dampingFactor = 0.05;
  orbit.screenSpacePanning = false;
  orbit.minDistance = 1;
  orbit.maxDistance = 16384;
  orbit.maxPolarAngle = Math.PI / 2 - Math.PI / 360;

  initRenderPipeline();
}

function initRenderPipeline() {
  // Assign Renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas,
    logarithmicDepthBuffer: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5;

  // General-use rendering pass for chaining
  const renderScene = new RenderPass(scene, camera);

  // Rendering pass for bloom
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5,
    0.4,
    0.85
  );
  bloomPass.threshold = BLOOM_PARAMS.bloomThreshold;
  bloomPass.strength = BLOOM_PARAMS.bloomStrength;
  bloomPass.radius = BLOOM_PARAMS.bloomRadius;

  // bloom composer
  bloomComposer = new EffectComposer(renderer);
  bloomComposer.renderToScreen = false;
  bloomComposer.addPass(renderScene);
  bloomComposer.addPass(bloomPass);

  // overlay composer
  overlayComposer = new EffectComposer(renderer);
  overlayComposer.renderToScreen = false;
  overlayComposer.addPass(renderScene);

  // Shader pass to combine base layer, bloom, and overlay layers
  const finalPass = new ShaderPass(
    new THREE.ShaderMaterial({
      uniforms: {
        baseTexture: { value: null },
        bloomTexture: { value: bloomComposer.renderTarget2.texture },
        overlayTexture: { value: overlayComposer.renderTarget2.texture },
      },
      vertexShader: CompositionShader.vertex,
      fragmentShader: CompositionShader.fragment,
      defines: {},
    }),
    "baseTexture"
  );
  finalPass.needsSwap = true;

  // base layer composer
  baseComposer = new EffectComposer(renderer);
  baseComposer.addPass(renderScene);
  baseComposer.addPass(finalPass);
}

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

async function render() {
  orbit.update();

  // fix buffer size
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  // fix aspect ratio
  const canvas = renderer.domElement;
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();

  // Run each pass of the render pipeline
  renderPipeline();

  requestAnimationFrame(render);
}

function renderPipeline() {
  // Render bloom
  camera.layers.set(BLOOM_LAYER);
  bloomComposer.render();

  // Render overlays
  camera.layers.set(OVERLAY_LAYER);
  overlayComposer.render();

  // Render normal
  camera.layers.set(BASE_LAYER);
  baseComposer.render();
}

initThree();
let axes = new THREE.AxesHelper(5.0);
scene.add(axes);

const gridHelper = new THREE.GridHelper(100, 50);
gridHelper.rotateX(Math.PI / 2);
scene.add(gridHelper);

let position = new THREE.Vector3(5.0, 5.0, 5.0);
let star = new Star(position);
star.toThreeObject(scene);

function guassianRandom(mean = 0, stdev = 1) {
  let u = 1 - Math.random();
  let v = Math.random();
  let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

  return z * stdev + mean;
}

let mean = 0;
let stdev = 20;

for (let i = 0; i < 100; i++) {
  let pos = new THREE.Vector3(
    guassianRandom(mean, stdev),
    guassianRandom(mean, stdev),
    guassianRandom(mean, stdev)
  );
  let star = new Star(pos);
  star.toThreeObject(scene);
}

requestAnimationFrame(render);
