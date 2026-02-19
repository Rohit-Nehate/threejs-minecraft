import * as THREE from "three";
import { World } from "./world";
import { Player } from "./player";
import { blocks } from "./blocks";

export class Physics {
  gravity = 32;
  simulationRate = 200;
  timeStep = 1 / this.simulationRate;
  accumlator = 0;

  highlighterGeo = new THREE.BoxGeometry(1.001, 1.001, 1.001);
  highlighterMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    transparent: true,
    opacity: 0.2,
  });
  contactMaterial = new THREE.MeshBasicMaterial({
    wireframe: true,
    color: 0x0000ff,
  });
  contactGeometry = new THREE.SphereGeometry(0.05, 6, 6);

  constructor(scene) {
    this.highlighter = new THREE.Group();
    scene.add(this.highlighter);
    this.highlighter.visible = false;
  }

  /**
   * @param {number} dt
   * @param {World} world
   * @param {Player} player
   */

  update(dt, world, player) {
    this.accumlator += dt;

    while (this.accumlator >= this.timeStep) {
      player.velocity.y -= this.gravity * this.timeStep;
      player.movePlayer(this.timeStep);
      player.updatePlayerHelper();
      this.detectcollison(world, player);
      this.accumlator -= this.timeStep;
    }
  }

  /**
   * @param {World} world
   * @param {Player} player
   */

  detectcollison(world, player) {
    player.canJump = false;
    const candidates = this.broadPhase(world, player);
    const collisions = this.narrowPhase(player, candidates);

    if (collisions.length > 0) {
      this.resolvePhase(collisions, player);
    }
  }

  broadPhase(world, player) {
    this.highlighter.clear();
    const candidates = [];

    const extents = {
      Xmin: Math.floor(player.position.x - player.radius),
      Xmax: Math.ceil(player.position.x + player.radius),
      Ymin: Math.floor(player.position.y - player.height),
      Ymax: Math.ceil(player.position.y),
      Zmin: Math.floor(player.position.z - player.radius),
      Zmax: Math.ceil(player.position.z + player.radius),
    };

    for (let x = extents.Xmin; x <= extents.Xmax; x++) {
      for (let y = extents.Ymin; y <= extents.Ymax; y++) {
        for (let z = extents.Zmin; z <= extents.Zmax; z++) {
          const block = world.getBlock(x, y, z);
          if (block && block.id !== blocks.empty.id&&block.id !== blocks.cloud.id) {
            const blockPos = { x, y, z };
            candidates.push(blockPos);
            this.highlightBlocks(blockPos);
          }
        }
      }
    }

    //   console.log(candidates)

    return candidates;
  }

  narrowPhase(player, candidates) {
    const collisions = [];

    for (const block of candidates) {
      // Get the point on the block that is closest to the center of the player's
      const p = player.position;
      const collisionPoints = {
        x: Math.max(block.x - 0.4, Math.min(p.x, block.x + 0.4)),
        y: Math.max(
          block.y - 0.5,
          Math.min(p.y - player.height / 2, block.y + 0.5),
        ),
        z: Math.max(block.z - 0.4, Math.min(p.z, block.z + 0.4)),
      };

      // collisionPoints

      const dx = collisionPoints.x - player.position.x;
      const dy = collisionPoints.y - (player.position.y - player.height / 2);
      const dz = collisionPoints.z - player.position.z;

      // if the player is collisding
      if (this.playerCollidingWithPoint(collisionPoints, player)) {
        const overlapY = player.height / 2 - Math.abs(dy);
        const overlapXZ = player.radius - Math.sqrt(dx * dx + dz * dz);

        // calculate the smallest overlap and normal

        let overlap, normal;
        if (overlapY < overlapXZ) {
          normal = new THREE.Vector3(0, -Math.sign(dy), 0);
          overlap = overlapY;
          player.canJump = true;
        } else {
          normal = new THREE.Vector3(-dx, 0, -dz).normalize();
          overlap = overlapXZ;
        }

        collisions.push({
          block,
          contactPoint: collisionPoints,
          normal,
          overlap,
        });

        this.highlightCollisions(collisionPoints);
      }
    }

    // console.log(collisions.length)

    return collisions;
  }

  resolvePhase(collisions, player) {
    //sorting the collisions by smallest to highest overlap

    collisions.sort((a, b) => {
      return a.overlap < b.overlap;
    });

    for (const collision of collisions) {
      if (!this.playerCollidingWithPoint(collision.contactPoint, player))
        continue;
      //pushing the player away from the collision point
      let deltaPosition = collision.normal.clone();
      deltaPosition.multiplyScalar(collision.overlap);
      player.position.add(deltaPosition);

      //preventing player to fall from the blocks
      let magnitude = player.worldVelocity.dot(collision.normal);
      let velocityAdjustment = collision.normal
        .clone()
        .multiplyScalar(magnitude);
      //applying the deltavelocity

      player.applyVelocity(velocityAdjustment.negate());
    }
  }

  //highlight blocks near

  highlightBlocks(blockPos) {
    const highlighterMesh = new THREE.Mesh(
      this.highlighterGeo,
      this.highlighterMat,
    );
    highlighterMesh.position.copy(blockPos);
    this.highlighter.add(highlighterMesh);
  }

  //highlight collisionPoints

  highlightCollisions(collisionPoints) {
    const collisionMesh = new THREE.Mesh(
      this.contactGeometry,
      this.contactMaterial,
    );
    collisionMesh.position.copy(collisionPoints);
    this.highlighter.add(collisionMesh);
  }
  // delecting ig player colliding returns true or false

  playerCollidingWithPoint(collisionPoints, player) {
    const dx = collisionPoints.x - player.position.x;
    const dy = collisionPoints.y - (player.position.y - player.height / 2);
    const dz = collisionPoints.z - player.position.z;
    const rSquare = dx * dx + dz * dz;

    return (
      Math.abs(dy) < player.height / 2 &&
      rSquare < player.radius * player.radius
    );
  }
}
