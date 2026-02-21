import * as THREE from "three";
import { normalLocal } from "three/tsl";

const loader = new THREE.TextureLoader();

const loadTextures = (path) => {
  const texture = loader.load(path);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  return texture;
};

const textures = {
  dirt: loadTextures("textures/dirt.png"),
  dirtSide: loadTextures("textures/grass_side.png"),
  grass: loadTextures("textures/grass2.png"),
  stone: loadTextures("textures/stone.png"),
  ironOre: loadTextures("textures/iron_ore.png"),
  coalOre: loadTextures("textures/coal_ore.png"),
  normal: loadTextures("textures/normal.png"),
  oakLogSide: loadTextures("textures/oak_log_side.png"),
  oakLogTop: loadTextures("textures/oak_log_top.png"),
  oakLeaves: loadTextures("textures/oak_leaves.png"),
  sand: loadTextures("textures/sand.png"),
  oakPlanks: loadTextures("textures/oak_planks.png"),
};

export const blocks = {
  empty: {
    id: 0,
  },
  grass: {
    id: 1,
    name: "grass",
    material: [
      new THREE.MeshLambertMaterial({
        map: textures.dirtSide,
        normalMap: textures.normal,
      }),
      new THREE.MeshLambertMaterial({
        map: textures.dirtSide,
        normalMap: textures.normal,
      }),
      new THREE.MeshLambertMaterial({
        map: textures.grass,
        normalMap: textures.normal,
      }),
      new THREE.MeshLambertMaterial({
        map: textures.dirt,
        normalMap: textures.normal,
      }),
      new THREE.MeshLambertMaterial({
        map: textures.dirtSide,
        normalMap: textures.normal,
      }),
      new THREE.MeshLambertMaterial({
        map: textures.dirtSide,
        normalMap: textures.normal,
      }),
    ],
  },
  dirt: {
    id: 2,
    name: "dirt",
    material: new THREE.MeshLambertMaterial({
      map: textures.dirt,
      normalMap: textures.normal,
    }),
  },
  stone: {
    id: 3,
    name: "stone",
    scale: {
      x: 30,
      y: 30,
      z: 30,
    },
    rarity: 0.4,
    material: new THREE.MeshLambertMaterial({
      map: textures.stone,
      normalMap: textures.normal,
    }),
  },
  coalOre: {
    id: 4,
    name: "coalOre",
    scale: {
      x: 30,
      y: 2,
      z: 8,
    },
    rarity: 0.9,
    material: new THREE.MeshLambertMaterial({
      map: textures.coalOre,
      normalMap: textures.normal,
    }),
  },
  ironOre: {
    id: 5,
    name: "ironOre",
    scale: {
      x: 10,
      y: 10,
      z: 10,
    },
    rarity: 0.95,
    material: new THREE.MeshLambertMaterial({
      map: textures.ironOre,
      normalMap: textures.normal,
    }),
  },
  oakLog: {
    id: 6,
    name: "oakLog",
    material: [
      new THREE.MeshLambertMaterial({ map: textures.oakLogSide }),
      new THREE.MeshLambertMaterial({ map: textures.oakLogSide }),
      new THREE.MeshLambertMaterial({ map: textures.oakLogTop }),
      new THREE.MeshLambertMaterial({ map: textures.oakLogTop }),
      new THREE.MeshLambertMaterial({ map: textures.oakLogSide }),
      new THREE.MeshLambertMaterial({ map: textures.oakLogSide }),
    ],
  },
  oakLeaves: {
    id: 7,
    name: "oakLeaves",
    material: new THREE.MeshLambertMaterial({ map: textures.oakLeaves }),
  },
  sand: {
    id: 8,
    name: "sand",
    material: new THREE.MeshLambertMaterial({ map: textures.sand }),
  },
  oakPlanks: {
    id: 9,
    name: "oakPlanks",
    material: new THREE.MeshLambertMaterial({ map: textures.oakPlanks }),
  },
  cloud: {
    id: 9,
    name: "cloud",
    material: new THREE.MeshLambertMaterial({ transparent: true }),
  },
};

export const resources = [blocks.stone, blocks.coalOre, blocks.ironOre];

