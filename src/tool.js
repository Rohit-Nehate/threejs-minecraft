import * as THREE from "three";

export class Tool extends THREE.Group {
  animate = false;

  animationStart = 0;

  animationSpeed = 0.01;

  animation = undefined;

  toolMesh = undefined;

  setMesh(mesh) {
    this.clear();
    this.toolMesh = mesh;
    this.add(this.toolMesh);
    mesh.receiveShadow = true;
    mesh.castShadow = true;

    this.position.set(0.6, -0.3, -0.5);
    this.scale.set(0.35, 0.35, 0.35);
  }

  get animationTime() {
    return performance.now() - this.animationStart;
  }

  startAnimation() {

    // if(this.animate) return
    this.toolMesh.rotation.x = 0;
    this.toolMesh.rotation.y = 0;
    this.animate = true;
    this.animationStart = performance.now();
    clearTimeout(this.animate);

    // Set a timer
    this.animation = setTimeout(() => {
      this.animate = false;
      this.toolMesh.rotation.x = 0;
    }, 300);
  }

  update() {
    if (this.animate && this.toolMesh) {
      this.toolMesh.rotation.x =
        -(0.5 * Math.sin(this.animationTime * this.animationSpeed));
      this.toolMesh.rotation.y =
        -(0.3 * Math.sin(this.animationTime * this.animationSpeed));
      this.toolMesh.position.z =
        -(0.4 * Math.sin(this.animationTime * this.animationSpeed));
    }
  }
}
