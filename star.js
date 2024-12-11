import * as THREE from "three";
import { BLOOM_LAYER } from "./config/renderConfig.js";

const texture = new THREE.TextureLoader().load("./resources/sprite120.png");
const material = new THREE.SpriteMaterial({ map: texture, color: "#fff" });

export class Star {
  constructor(position) {
    this.position = position;
    this.obj = null;
  }

  toThreeObject(scene) {
    let star = new THREE.Sprite(material);
    star.layers.set(BLOOM_LAYER);
    star.scale.multiplyScalar(0.5);
    star.position.copy(this.position);

    this.obj = star;

    scene.add(star);
  }
}
