import * as THREE from "three";
import { WorldChunk } from "./worldChunk";
import { DataStore } from "./terraformingData";

export class World extends THREE.Group {
  // render distance - 1 render == player chunk + 1-1 chunk around player chunk

  renderDistance = 2;
  asyncLoading = true;

  /**
   * Parameters for terrain generation
   */
  params = {
    seed: 1,
    terrain: {
      scale: 50,
      magnitude: 5,
      offset: 10,
      waterOffset: 8,
    },
    trees: {
      generateTrees: true,
      trunk: {
        minHeight: 4,
        maxHeight: 7,
      },
      leaves: {
        minRadius: 2,
        maxRadius: 4,
        density: 0.5,
      },
      frequency: 0.001,
    },
    clouds: {
      scale: 20,
      density: 0.2,
      generateClouds: true,
    },
  };

  size = {
    width: 32,
    height: 32,
  };

  dataStore = new DataStore();

  constructor(seed = 0) {
    super();
    this.seed = seed;

    this.notification = document.querySelector(".notification");

    document.addEventListener("keydown", (e) => {
      switch (e.code) {
        case "F1":
          this.saveWorld();
          break;
        case "F2":
          this.loadWorld();
          break;
      }
    });
  }

  saveWorld() {
    localStorage.setItem("world_params", JSON.stringify(this.params));
    localStorage.setItem("world_data", JSON.stringify(this.dataStore.data));
    this.notification.innerHTML = "WORLD SAVED";

    setTimeout(() => {
      this.notification.innerHTML = "";
    }, 2000);
  }

  loadWorld() {
    const params = localStorage.getItem("world_params");
    const data = localStorage.getItem("world_data");

    if (!params || !data) {
      this.notification.innerHTML = "NO SAVE FOUND";
      return;
    }

    this.params = JSON.parse(params);
    this.dataStore.data = JSON.parse(data);

    this.notification.innerHTML = "WORLD LOADED";

    setTimeout(() => {
      this.notification.innerHTML = "";
    }, 2000);

    this.generateWorld();
  }

  generateWorld(clearDatastore = false) {
    if (clearDatastore) {
      this.dataStore.clear();
    }

    this.disposeChunks();
    for (let x = -this.renderDistance; x <= this.renderDistance; x++) {
      for (let z = -this.renderDistance; z <= this.renderDistance; z++) {
        this.chunk = new WorldChunk(this.size, this.params, this.dataStore);
        this.chunk.position.set(x * this.size.width, 0, z * this.size.width);
        this.chunk.generateWorld();
        this.chunk.userData = { x, z };
        this.add(this.chunk);
      }
    }
  }

  // update function to dynamically generarte and delete chunks on each render based on player position

  update(player) {
    const renderedChunks = this.getRenderedChunks(player);
    const chunkToRender = this.chunksToRender(renderedChunks);
    // console.log("add",chunkToRender);
    this.removeChunksOutOfRender(renderedChunks);
    // console.log(chunksToRemove)

    for (const chunk of chunkToRender) {
      this.renderChunk(chunk.x, chunk.z);
    }
  }

  //function to get chucks that are being rendered in players render area

  getRenderedChunks(player) {
    const renderedChunks = [];
    const coords = this.chunkCoordsRelativeToWorld(
      player.position.x,
      0,
      player.position.z,
    );
    for (
      let x = coords.chunk.x - this.renderDistance;
      x <= coords.chunk.x + this.renderDistance;
      x++
    ) {
      for (
        let z = coords.chunk.z - this.renderDistance;
        z <= coords.chunk.z + this.renderDistance;
        z++
      ) {
        renderedChunks.push({ x, z });
      }
    }

    return renderedChunks;
  }

  // chunks to render

  chunksToRender(renderedChunks) {
    return renderedChunks.filter((chunkToRender) => {
      const chunkExists = this.children
        .map((obj) => obj.userData)
        .find(({ x, z }) => {
          return chunkToRender.x === x && chunkToRender.z === z;
        });

      return !chunkExists;
    });
  }

  //remove chunks out of render distence
  removeChunksOutOfRender(renderedChunks) {
    const chunksToRemove = this.children.filter((chunkToRemove) => {
      const { x, z } = chunkToRemove.userData;
      const chunkExists = renderedChunks.find((renderedChunks) => {
        return renderedChunks.x === x && renderedChunks.z === z;
      });

      return !chunkExists;
    });

    for (const chunk of chunksToRemove) {
      chunk.disposeInstances();
      this.remove(chunk);
    }
  }

  // function to render new chunks

  renderChunk(x, z) {
    const chunk = new WorldChunk(this.size, this.params, this.dataStore);
    chunk.position.set(x * this.size.width, 0, z * this.size.width);
    if (this.asyncLoading) {
      requestIdleCallback(chunk.generateWorld.bind(chunk), { timeout: 1000 });
    } else {
      chunk.generateWorld();
    }
    chunk.userData = { x, z };
    this.add(chunk);
  }

  //get block position
  getBlock(x, y, z) {
    const coordinates = this.chunkCoordsRelativeToWorld(x, y, z);
    const chunk = this.getChunk(coordinates.chunk.x, coordinates.chunk.z);

    if (chunk && chunk.isLoaded) {
      return chunk.getBlock(coordinates.block.x, y, coordinates.block.z);
    } else {
      return null;
    }
  }

  //get the chunk and block position relative to the world - returns an object of chunk and block coordinates

  chunkCoordsRelativeToWorld(x, y, z) {
    const chunkCoords = {
      x: Math.floor(x / this.size.width),
      z: Math.floor(z / this.size.width),
    };

    const blockCoords = {
      x: x - this.size.width * chunkCoords.x,
      y,
      z: z - this.size.width * chunkCoords.z,
    };

    return {
      chunk: chunkCoords,
      block: blockCoords,
    };
  }

  //get chunk function gives the object of the chunk player currently prsemt in

  getChunk(chunkX, chunkZ) {
    return this.children.find((chunk) => {
      return chunk.userData.x === chunkX && chunk.userData.z === chunkZ;
    });
  }

  disposeChunks() {
    this.traverse((chunk) => {
      if (chunk.disposeInstances) chunk.disposeInstances();
    });
    this.clear();
  }

  //handle addBlock function

  handleAddBlock(x, y, z, blockId) {
    const coords = this.chunkCoordsRelativeToWorld(x, y, z);
    const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

    if (chunk) {
      // console.log(blockId);
      chunk.addBlock(coords.block.x, coords.block.y, coords.block.z, blockId);
      this.hideBlock(x - 1, y, z);
      this.hideBlock(x + 1, y, z);
      this.hideBlock(x, y - 1, z);
      this.hideBlock(x, y + 1, z);
      this.hideBlock(x, y, z - 1);
      this.hideBlock(x, y, z + 1);
    }
  }

  // this function handeles block removing

  handleRemoveBlock(x, y, z) {
    const coords = this.chunkCoordsRelativeToWorld(x, y, z);
    const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

    if (chunk) {
      chunk.removeBlock(coords.block.x, coords.block.y, coords.block.z);

      this.revealBlock(x - 1, y, z);
      this.revealBlock(x + 1, y, z);
      this.revealBlock(x, y - 1, z);
      this.revealBlock(x, y + 1, z);
      this.revealBlock(x, y, z - 1);
      this.revealBlock(x, y, z + 1);
    }
  }

  revealBlock(x, y, z) {
    const coords = this.chunkCoordsRelativeToWorld(x, y, z);
    const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

    if (chunk) {
      chunk.addBlockInstance(coords.block.x, coords.block.y, coords.block.z);
    }
  }
  hideBlock(x, y, z) {
    const coords = this.chunkCoordsRelativeToWorld(x, y, z);
    const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

    if (
      chunk &&
      chunk.isBlockObscured(coords.block.x, coords.block.y, coords.block.z)
    ) {
      chunk.deleteBlockInstance(coords.block.x, coords.block.y, coords.block.z);
    }
  }
}
