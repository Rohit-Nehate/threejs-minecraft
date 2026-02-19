import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { resources } from "./blocks";

export const createGUI = (world, player, physics, scene) => {
  const gui = new GUI();

  gui.close();

  //world folder

  const worldFolder = gui.addFolder("World");

  // player folder

  const playerFolder = gui.addFolder("Player").close();

  playerFolder.add(player, "maxSpeed", 1, 20).name("Player Speed");

  playerFolder.add(player.cameraHelper, "visible").name("player camera helper");
  playerFolder
    .add(physics.highlighter, "visible")
    .name("collision blocks helper");

  playerFolder.add(player.playerHelper, "visible").name("player helper");

  // terrain folder

  const terrainFolder = worldFolder.addFolder("Terrain").close();
  terrainFolder.add(world.size, "width", 1, 128, 1).name("chunk width");
  terrainFolder.add(world.size, "height", 1, 64, 1).name("chunk height");

  terrainFolder.add(scene.fog, "near", 10, 200, 5).name("fog near");
  terrainFolder.add(scene.fog, "far", 10, 200, 5).name("fog far");

  terrainFolder.add(world, "asyncLoading").name("Async Loading");

  terrainFolder.add(world.params, "seed", 0, 10000, 1).name("Seed");
  terrainFolder.add(world.params.terrain, "scale", 10, 100).name("Chunk Scale");
  terrainFolder
    .add(world.params.terrain, "magnitude", 0, 1, 0.1)
    .name("Chunk Magnitude");
  terrainFolder.add(world.params.terrain, "offset", 0, 1).name("Chunk Offset");
  terrainFolder.add(world, "renderDistance", 0, 5, 1).name("render Distance");

  //resources folder

  const resourcesFolder = gui.addFolder("Resourced").close();

  resources.forEach((res) => {
    const resFolder = resourcesFolder.addFolder(res.name);

    resFolder.add(res.scale, "x", 0, 50, 1).name("scale x");
    resFolder.add(res.scale, "y", 0, 50, 0.1).name("scale y");
    resFolder.add(res.scale, "z", 0, 50, 1).name("scale z");
    resFolder.add(res, "rarity", 0, 1, 0.01).name("rarity");
  });

  //trees folder

  const treesFolder = gui.addFolder("Trees").close();
  treesFolder
    .add(world.params.trees, "generateTrees")
    .name("toogle Generate trees");
  treesFolder
    .add(world.params.trees.trunk, "minHeight", 2, 10, 1)
    .name("minimun truck hight");
  treesFolder
    .add(world.params.trees.trunk, "maxHeight", 4, 15, 1)
    .name("maximum truck hight");
  treesFolder
    .add(world.params.trees, "frequency", 0.0001, 0.05, 0.0001)
    .name("tree frequency");

  treesFolder
    .add(world.params.trees.leaves, "density", 0, 1, 0.01)
    .name("leaves density");
  treesFolder
    .add(world.params.trees.leaves, "minRadius", 2, 4, 1)
    .name("leaves min radius");
  treesFolder
    .add(world.params.trees.leaves, "maxRadius", 4, 8, 1)
    .name("leaves max radius");

  // clouds folder

  const cloudsFolder = gui.addFolder("Clouds").close();
  cloudsFolder.add(world.params.clouds, "scale", 10, 50, 5).name("cloud Scale");
  cloudsFolder
    .add(world.params.clouds, "density", 0, 1, 0.1)
    .name("cloud density");
  cloudsFolder
    .add(world.params.clouds, "generateClouds")
    .name("generate clouds");

  gui.onChange(() => {
    world.generateWorld(true);
  });
};
