import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

export class ModelLoader {
  loader = new GLTFLoader();
  models = {
    dirt: "models/dirt.glb",
    grass: "models/grass.glb",
    coalOre: "models/coal_ore.glb",
    ironOre: "models/iron_ore.glb",
    oakLeaves: "models/oak_leaves.glb",
    oakLog: "models/oak_log.glb",
    sand: "models/sand.glb",
    stone: "models/stone.glb",
  };

  loadModels(onLoad) {
    const keys = Object.keys(this.models);
    let loaded = 0;
    keys.forEach((key) => {
      this.loader.load(this.models[key], (model) => {
        this.models[key] = model.scene;
        loaded++;

        if (loaded === keys.length) {
          onLoad(this.models);
        }
      });
    });
  }
}
