import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/Addons.js";

export class Player {
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    200,
  );
  control = new PointerLockControls(this.camera, document.body);

  cameraHelper = new THREE.CameraHelper(this.camera)

  input = new THREE.Vector3();
  velocity = 1;
  maxSpeed = 10;

  cordsparagraph = document.querySelector(".cords");

  constructor(scene) {
    this.camera.position.set(32, 16, 32);
    scene.add(this.camera);
    scene.add(this.cameraHelper)

    document.addEventListener("keyup", this.onKeyUP.bind(this));
    document.addEventListener("keydown", this.onKeyDown.bind(this));
  }

  /** @type {THREE.Vector3} */
  get position() {
    return this.camera.position;
  }

  /** @param {onKeyDown} event */

  onKeyDown(event) {
    if (!this.control.isLocked) {
      this.control.lock();
    }
this.velocity = 1
    switch (event.code) {
      case "KeyW":
        this.input.z = 1;
        break;
      case "KeyS":
        this.input.z = -1;
        break;
      case "KeyA":
        this.input.x = -1;
        break;
      case "KeyD":
        this.input.x = 1;
        break;
      case "KeyR":
        this.camera.position.set(32, 16, 32)
        this.velocity = 0
        break;
      case "ShiftLeft":
        this.velocity = 1.5;
        break;
    }
  }

  /** @param {onKeyUP} event */

  onKeyUP(event) {
    switch (event.code) {
      case "KeyW":
      case "KeyS":
        this.input.z = 0;
        break;
      case "KeyA":
      case "KeyD":
        this.input.x = 0;
        break;
      case "ShiftLeft":
        this.velocity = 1;
        break;
    }
  }

  movePlayer(dt) {
    if (this.control.isLocked) {
      this.control.moveRight(this.input.x * this.maxSpeed * dt * this.velocity);
      this.control.moveForward(
        this.input.z * this.maxSpeed * dt * this.velocity,
      );
      this.setCords();
    }
  }

  setCords() {
    if (this.control.isLocked) {
      this.cordsparagraph.innerHTML = this.getCords();
    }
  }
  getCords() {
    let str = "";
    str += `x: ${this.position.x.toFixed(2)} `;
    str += `y: ${this.position.y.toFixed(2)} `;
    str += `z: ${this.position.z.toFixed(2)}`;
    return str;
  }
}
