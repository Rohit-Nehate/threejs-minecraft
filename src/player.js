import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/Addons.js";

const crosshair = new THREE.Vector2();

export class Player {
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.1,
    200,
  );
  control = new PointerLockControls(this.camera, document.body);

  cameraHelper = new THREE.CameraHelper(this.camera);
  activeBlockId = 2; //block id player can place

  input = new THREE.Vector3();
  velocity = new THREE.Vector3();
  #worldVelocity = new THREE.Vector3();
  speedMultiplyer = 1;
  maxSpeed = 10;
  radius = 0.5;
  height = 1.75;
  jumpVelocity = 10;
  canJump = false;
  placeBlock = false;

  cordsparagraph = document.querySelector(".cords");
  raycaster = new THREE.Raycaster(
    new THREE.Vector3(),
    new THREE.Vector3(),
    0,
    8,
  );
  selectedCoords = null;

  constructor(scene) {
    this.camera.position.set(32, 64, 32);
    scene.add(this.camera);
    scene.add(this.cameraHelper);
    this.cameraHelper.visible = false;

    document.addEventListener("keyup", this.onKeyUP.bind(this));
    document.addEventListener("keydown", this.onKeyDown.bind(this));

    this.playerHelper = new THREE.Mesh(
      new THREE.CylinderGeometry(this.radius, this.radius, this.height, 32),
      new THREE.MeshStandardMaterial({ wireframe: true }),
    );
    scene.add(this.playerHelper);
    this.playerHelper.visible = false;

    const geometry = new THREE.BoxGeometry(1.001, 1.001, 1.001);

    this.selectionHighlight = new THREE.Mesh(
      new THREE.BoxGeometry(1.01, 1.01, 1.01),
      new THREE.MeshBasicMaterial({
        wireframe: true,
        transparent: true,
        opacity: 0,
      }),
    );
    scene.add(this.selectionHighlight);

    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

    const outline = new THREE.LineSegments(edges, lineMaterial);
    this.selectionHighlight.add(outline);
  }

  update(world) {
    this.updateRaycaster(world);
  }

  updateRaycaster(world) {
    this.raycaster.setFromCamera(crosshair, this.camera);
    const intersections = this.raycaster.intersectObject(world, true);

    if (intersections.length > 0) {
      const intersection = intersections[0];

      const chunk = intersection.object.parent;

      const objectMatrix = new THREE.Matrix4();
      intersection.object.getMatrixAt(intersection.instanceId, objectMatrix);

      // world position of the hit block
      this.selectedCoords = chunk.position.clone();
      this.selectedCoords.applyMatrix4(objectMatrix);

      // store face normal for placement
      this.selectedNormal = intersection.normal.clone();

      this.selectionHighlight.position.copy(this.selectedCoords);
      this.selectionHighlight.visible = true;
    } else {
      this.selectedCoords = null;
      this.selectedNormal = null;
      this.selectionHighlight.visible = false;
    }
  }

  /** @type {THREE.Vector3} */
  get position() {
    return this.camera.position;
  }

  //handeling world velocity

  get worldVelocity() {
    this.#worldVelocity.copy(this.velocity);
    this.#worldVelocity.applyEuler(
      new THREE.Euler(0, this.camera.rotation.y, 0),
    );
    return this.#worldVelocity;
  }

  //applying wolrd velocity

  applyVelocity(deltaVelocity) {
    deltaVelocity.applyEuler(new THREE.Euler(0, -this.camera.rotation.y, 0));
    this.velocity.add(deltaVelocity);
  }

  /** @param {onKeyDown} event */

  onKeyDown(event) {
    if (!this.control.isLocked) {
      this.control.lock();
    }
    this.speedMultiplyer = 1;
    switch (event.code) {
      case "Digit1":
      case "Digit2":
      case "Digit3":
      case "Digit4":
      case "Digit5":
      case "Digit6":
      case "Digit7":
      case "Digit8":
        this.activeBlockId = Number(event.key);
        break;
      case "KeyW":
        this.input.z = this.maxSpeed;
        break;
      case "KeyS":
        this.input.z = -this.maxSpeed;
        break;
      case "KeyA":
        this.input.x = -this.maxSpeed;
        break;
      case "KeyD":
        this.input.x = this.maxSpeed;
        break;
      case "KeyR":
        this.camera.position.set(32, 64, 32);
        this.speedMultiplyer = 0;
        break;
      case "ShiftLeft":
        this.speedMultiplyer = 1.5;
        break;
      case "Space":
        if (this.canJump) {
          this.velocity.y += this.jumpVelocity;
        }
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
        this.speedMultiplyer = 1;
        break;
    }
  }

  movePlayer(dt) {
    if (this.control.isLocked) {
      this.velocity.x = this.input.x;
      this.velocity.z = this.input.z;

      this.control.moveRight(this.velocity.x * dt * this.speedMultiplyer);
      this.control.moveForward(this.velocity.z * dt * this.speedMultiplyer);
      this.position.y += this.velocity.y * dt;
      this.setCords();
    }
  }

  updatePlayerHelper() {
    this.playerHelper.position.copy(this.position);
    this.playerHelper.position.y -= this.height / 2;
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
