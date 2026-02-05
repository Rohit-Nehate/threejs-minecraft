import {GUI} from "three/examples/jsm/libs/lil-gui.module.min.js";
import { resources } from "./blocks";

export const createGUI = (world, player)=>{

const gui = new GUI()

gui.close()

const worldFolder = gui.addFolder('World');

const playerFolder = gui.addFolder("Player")

playerFolder.add(player , 'maxSpeed', 1, 20).name("Player Speed")
playerFolder.add(player.cameraHelper, 'visible').name("player camera helper")

const terrainFolder = worldFolder.addFolder('Terrain');
terrainFolder.add(world.size, 'width', 1, 128,1).name('chunk width')
terrainFolder.add(world.size, 'height', 1, 64,1).name('chunk height')

  terrainFolder.add(world.params, 'seed', 0, 10000, 1).name('Seed');
  terrainFolder.add(world.params.terrain, 'scale', 10, 100).name('Chunk Scale');
  terrainFolder.add(world.params.terrain, 'magnitude', 0, 3, 0.1).name('Chunk Magnitude');
  terrainFolder.add(world.params.terrain, 'offset', 0, 1).name('Chunk Offset');

  const resourcesFolder = gui.addFolder("Resourced")

  resources.forEach( res =>{
    const resFolder = resourcesFolder.addFolder(res.name)

    resFolder.add(res.scale, 'x', 0, 50, 1).name("scale x")
    resFolder.add(res.scale, 'y', 0, 50, .1).name("scale y")
    resFolder.add(res.scale, 'z', 0, 50, 1).name("scale z")
    resFolder.add(res, 'rarity', 0, 1, 0.01).name("rarity")
  })


gui.onChange(()=>{
    world.generateWorld()
})
}