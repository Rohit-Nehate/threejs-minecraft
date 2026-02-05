import {GUI} from "three/examples/jsm/libs/lil-gui.module.min.js";

export const createGUI = (world)=>{

const gui = new GUI()

const worldFolder = gui.addFolder('World');
worldFolder.add(world.size, 'width', 1, 128,1).name('chunk width')
worldFolder.add(world.size, 'height', 1, 64,1).name('chunk height')



const terrainFolder = worldFolder.addFolder('Terrain');

  terrainFolder.add(world.params, 'seed', 0, 10000, 1).name('Seed');
  terrainFolder.add(world.params.terrain, 'scale', 10, 100).name('Chunk Scale');
  terrainFolder.add(world.params.terrain, 'magnitude', 0, 1).name('Chunk Magnitude');
  terrainFolder.add(world.params.terrain, 'offset', 0, 1).name('Chunk Offset');


gui.onChange(()=>{
    world.generateWorld()
})
}