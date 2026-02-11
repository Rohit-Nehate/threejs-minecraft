import * as THREE from "three";
import { RNG } from "./rng";
import { blocks, resources } from "./blocks.js";
import { SimplexNoise } from "three/examples/jsm/Addons.js";
import { instance } from "three/tsl";

// objects

const geometry = new THREE.BoxGeometry(1, 1, 1);

export class WorldChunk extends THREE.Group {
  /**
   * @type {{
   *  id: number,
   *  instanceId: number
   * }[][][]}
   */
  data = [];

  threshold = 0.5;

  constructor(size, params, dataStore) {
    super();
    this.isLoaded = false;
    this.size = size;
    this.params = params;
    this.dataStore = dataStore;
  }

  /**
   * Generates the world data and meshes
   */
  generateWorld() {
    const rng = new RNG(this.params.seed);
    this.initialize();
    this.generateResource(rng);
    this.generateTerrain(rng);
    this.loadPlayerChanges()
    this.generateMeshes();

    this.isLoaded = true;
  }

  initialize() {
    this.data = [];
    for (let x = 0; x < this.size.width; x++) {
      const slice = [];
      for (let y = 0; y < this.size.height; y++) {
        const row = [];
        for (let z = 0; z < this.size.width; z++) {
          row.push({
            id: blocks.empty.id,
            instanceId: null,
          });
        }
        slice.push(row);
      }
      this.data.push(slice);
    }
  }

  // resource generation

  generateResource(rng) {
    const noiseGenerator = new SimplexNoise(rng);

    resources.forEach((res) => {
      for (let x = 0; x < this.size.width; x++) {
        for (let y = 0; y < this.size.height; y++) {
          for (let z = 0; z < this.size.width; z++) {
            const value = noiseGenerator.noise3d(
              (x + this.position.x) / res.scale.x,
              (y + this.position.y) / res.scale.y,
              (z + this.position.z) / res.scale.z,
            );
            if (value > res.rarity) {
              this.setBlockId(x, y, z, res.id);
            }
          }
        }
      }
    });
  }

  //terrain generation
  generateTerrain(rng) {
    const noiseGenerator = new SimplexNoise(rng);
    for (let x = 0; x < this.size.width; x++) {
      for (let z = 0; z < this.size.width; z++) {
        // Compute noise value at this x-z location
        const value = noiseGenerator.noise(
          (x + this.position.x) / this.params.terrain.scale,
          (z + this.position.z) / this.params.terrain.scale,
        );

        // Scale noise based on the magnitude and add in the offset
        const scaledNoise =
          this.params.terrain.offset + this.params.terrain.magnitude * value;

        // Compute final height of terrain at this location
        let height = this.size.height * scaledNoise;

        // Clamp between 0 and max height
        height = Math.max(
          0,
          Math.min(Math.floor(height), this.size.height - 1),
        );

        // Starting at the terrain height, fill in all the blocks below that height
        for (let y = 0; y < this.size.height; y++) {
          if (y === height) {
            this.setBlockId(x, y, z, blocks.grass.id);
          } else if (
            y < height &&
            this.getBlock(x, y, z).id === blocks.empty.id
          ) {
            this.setBlockId(x, y, z, blocks.dirt.id);
          } else if (y > height) {
            this.setBlockId(x, y, z, blocks.empty.id);
          }
        }
      }
    }
  }

  //this function load all the chnages made by player that is stored in terraformingData 

  loadPlayerChanges(){
    for(let x=0; x<this.size.width;x++){
      for(let y =0; y<this.size.height;y++){
        for(let z=0; z<this.size.width;z++){
          if(this.dataStore.contains(this.position.x, this.position.z, x,y,z)){
            const blockId = this.dataStore.get(this.position.x, this.position.z, x,y,z)
            this.setBlockId(x,y,x, blockId)
          }
        }
      }
    }
  }

  generateMeshes() {
    this.disposeChildren();
    // Initialize instanced mesh to total size of world
    const maxCount = this.size.width * this.size.width * this.size.height;

    // map pf the meshesh

    const meshes = {};

    Object.values(blocks)
      .filter((block) => block.id !== blocks.empty.id)
      .forEach((block) => {
        const mesh = new THREE.InstancedMesh(
          geometry,
          block.material,
          maxCount,
        );
        mesh.name = block.id;
        mesh.count = 0;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        meshes[block.id] = mesh;
      });

    // Add instances for each non-empty block
    const matrix = new THREE.Matrix4();
    for (let x = 0; x < this.size.width; x++) {
      for (let y = 0; y < this.size.height; y++) {
        for (let z = 0; z < this.size.width; z++) {
          const blockId = this.getBlock(x, y, z).id;
          if (blockId === blocks.empty.id) continue;

          const mesh = meshes[blockId];

          const instanceId = mesh.count;

          // Create a new instance if

          if (!this.isBlockObscured(x, y, z)) {
            matrix.setPosition(x, y, z);
            mesh.setMatrixAt(instanceId, matrix);
            this.setBlockInstanceId(x, y, z, instanceId);
            mesh.count++;
          }
        }
      }
    }

    this.add(...Object.values(meshes));
  }

  /**
   * Gets the block data at (x, y, z)
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {{id: number, instanceId: number}}
   */
  getBlock(x, y, z) {
    if (this.inBounds(x, y, z)) {
      return this.data[x][y][z];
    } else {
      return null;
    }
  }

  /**
   * Sets the block id for the block at (x, y, z)
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} id
   */
  setBlockId(x, y, z, id) {
    if (this.inBounds(x, y, z)) {
      this.data[x][y][z].id = id;
    }
  }

  /**
   * Sets the block instance id for the block at (x, y, z)
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @param {number} instanceId
   */
  setBlockInstanceId(x, y, z, instanceId) {
    if (this.inBounds(x, y, z)) {
      this.data[x][y][z].instanceId = instanceId;
    }
  }

  /**
   * Checks if the (x, y, z) coordinates are within bounds
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {boolean}
   */
  inBounds(x, y, z) {
    if (
      x >= 0 &&
      x < this.size.width &&
      y >= 0 &&
      y < this.size.height &&
      z >= 0 &&
      z < this.size.width
    ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Returns true if this block is completely hidden by other blocks
   * @param {number} x
   * @param {number} y
   * @param {number} z
   * @returns {boolean}
   */
  isBlockObscured(x, y, z) {
    const up = this.getBlock(x, y + 1, z)?.id ?? blocks.empty.id;
    const down = this.getBlock(x, y - 1, z)?.id ?? blocks.empty.id;
    const left = this.getBlock(x + 1, y, z)?.id ?? blocks.empty.id;
    const right = this.getBlock(x - 1, y, z)?.id ?? blocks.empty.id;
    const forward = this.getBlock(x, y, z + 1)?.id ?? blocks.empty.id;
    const back = this.getBlock(x, y, z - 1)?.id ?? blocks.empty.id;

    // If any of the block's sides is exposed, it is not obscured
    if (
      up === blocks.empty.id ||
      down === blocks.empty.id ||
      left === blocks.empty.id ||
      right === blocks.empty.id ||
      forward === blocks.empty.id ||
      back === blocks.empty.id
    ) {
      return false;
    } else {
      return true;
    }
  }

  disposeChildren() {
    this.traverse((obj) => {
      if (obj.dispose) obj.dispose();
    });
    this.clear();
  }

  // to dispose already existing chunks

  disposeInstances() {
    this.traverse((instance) => {
      if (instance.dispose) instance.dispose();
    });
    this.clear();
  }

  //this function is used to add a block instance

  addBlockInstance(x, y, z) {
    const block = this.getBlock(x, y, z);

    // If this block is non-empty and does not already have an instance, create a new one
    if (!block || block.id === blocks.empty.id) return;
    if (block.instanceId !== null) return;

    // Append a new instance to the end of our InstancedMesh
    const mesh = this.children.find(
      (instanceMesh) => instanceMesh.name === block.id,
    );
    const instanceId = mesh.count++;
    this.setBlockInstanceId(x, y, z, instanceId);
    const matrix = new THREE.Matrix4();
    matrix.setPosition(x, y, z);
    mesh.setMatrixAt(instanceId, matrix);
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }

  //this function performes the remove operation

  deleteBlockInstance(x, y, z) {
    const block = this.getBlock(x, y, z);

    if (block.id === blocks.empty.id || block.instanceId === null) return;
    // if not returned

    const mesh = this.children.find(
      (intantMesh) => intantMesh.name === block.id,
    );
    const instanceId = block.instanceId;

    // We can't remove an instance directly so we will swap it with the last instance
    // and decrease the count by 1. We need to do two things:
    //   1. Swap the matrix of the last instance with the matrix at `instanceId`
    //   2. Set the instanceId for the last instance to `instanceId`

    const matrix = new THREE.Matrix4();
    mesh.getMatrixAt(mesh.count - 1, matrix);

    const vector = new THREE.Vector3();
    vector.setFromMatrixPosition(matrix);

    this.setBlockInstanceId(vector.x, vector.y, vector.z, instanceId);

    mesh.setMatrixAt(instanceId, matrix);

    mesh.count--;

    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();

    this.setBlockInstanceId(x, y, z, null);
  }

  addBlock(x, y, z, blockId) {
    // Safety check that we aren't adding a block for one that
    // already has an instance

    const block = this.getBlock(x, y, z);
    if (block.id === blocks.empty.id) {
      this.setBlockId(x, y, z, blockId);
      this.addBlockInstance(x, y, z);
      this.dataStore.set(this.position.x, this.position.z, x, y, z, blockId);
    }
  }

  // this function removes block from the world

  removeBlock(x, y, z) {
    const block = this.getBlock(x, y, z);

    if (block && block.id !== blocks.empty.id) {
      this.deleteBlockInstance(x, y, z);
      this.setBlockId(x, y, z, blocks.empty.id);
      this.dataStore.set(this.position.x, this.position.z, x, y, z, blocks.empty.id);
    
    }
  }
}
