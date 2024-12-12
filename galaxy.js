import * as THREE from "three";
import { Star } from "./star.js";
import {
  ARMS,
  ARM_X_DIST,
  ARM_X_MEAN,
  ARM_Y_DIST,
  ARM_Y_MEAN,
  CORE_X_DIST,
  CORE_Y_DIST,
  GALAXY_THICKNESS,
  NUM_STARS,
  OUTER_CORE_X_DIST,
  OUTER_CORE_Y_DIST,
} from "../config/galaxyConfig.js";
import { gaussianRandom, spiral } from "../utils.js";

//galaxy class
export class Galaxy {
  constructor(scene) {
    this.scene = scene;
    this.stars = this.generateStars();
    this.stars.forEach((star) => star.toThreeObject(scene));
  }
  generateStars() {
    let stars = [];

    for (let i = 0; i < NUM_STARS / 4; i++) {
      let pos = new THREE.Vector3(
        gaussianRandom(0, CORE_X_DIST),
        gaussianRandom(0, CORE_Y_DIST),
        gaussianRandom(0, GALAXY_THICKNESS)
      );
      let star = new Star(pos);
      stars.push(star);
    }

    for (let i = 0; i < NUM_STARS / 4; i++) {
      let pos = new THREE.Vector3(
        gaussianRandom(0, OUTER_CORE_X_DIST),
        gaussianRandom(0, OUTER_CORE_Y_DIST),
        gaussianRandom(0, GALAXY_THICKNESS)
      );
      let star = new Star(pos);
      stars.push(star);
    }

    for (let j = 0; j < ARMS; j++) {
      for (let i = 0; i < NUM_STARS / 4; i++) {
        let pos = spiral(
          gaussianRandom(ARM_X_MEAN, ARM_X_DIST),
          gaussianRandom(ARM_Y_MEAN, ARM_Y_DIST),
          gaussianRandom(0, GALAXY_THICKNESS),
          (j * 2 * Math.PI) / ARMS
        );
        let star = new Star(pos);
        stars.push(star);
      }
    }

    return stars;
  }
}
