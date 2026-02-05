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
};

export const blocks = {
  empty: {
    id: 0,
  },
  grass: {
    id: 1,
    name: "grass",
    color: 0x559020,
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
    color: 0x807020,
    material: new THREE.MeshLambertMaterial({
      map: textures.dirt,
      normalMap: textures.normal,
    }),
  },
  stone: {
    id: 3,
    name: "stone",
    color: 0x808080,
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
    color: 0x000000,
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
    color: 0x968969,
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
};

export const resources = [blocks.stone, blocks.coalOre, blocks.ironOre];
