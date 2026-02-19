import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { World } from "./world";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { createGUI } from "./gui";
import { Player } from "./player";
import { Physics } from "./physics";
import { ModelLoader } from "./modelLoader";

const stats = new Stats();
document.body.append(stats.dom);

//event listener
document.addEventListener("contextmenu", (e) => e.preventDefault());

document.addEventListener("mousedown", (e) => {
  if (!player.control.isLocked) return;
  if (!player.selectedCoords) return;
player.tool.startAnimation()
  const { x, y, z } = player.selectedCoords;

  if (e.button === 0) {
    world.handleRemoveBlock(x, y, z);
  }

  //  RIGHT CLICK TO PLACE
  if (e.button === 2) {
    const n = player.selectedNormal;

    world.handleAddBlock(x + n.x, y + n.y, z + n.z, player.activeBlockId);
  }
});

// document.addEventListener("mousedown", onMouseDown);
// create scene
const scene = new THREE.Scene();

// creating camera

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
);
camera.position.set(-32, 100, -10);
camera.layers.enable(1);

//create renderer

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(0x87ceeb);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.set = THREE.PCFShadowMap;
//append

document.body.appendChild(renderer.domElement);

//create world

const world = new World();
world.generateWorld();
scene.add(world);
const player = new Player(scene);
const physics = new Physics(scene);

//modelloader

const modelLoader = new ModelLoader();
modelLoader.loadModels((models) => {

  player.inventory= {
    1: models.grass,
    2: models.dirt,
    3: models.stone,
    4: models.coalOre,
    5: models.ironOre,
    6: models.oakLog,
    7: models.oakLeaves,
    8: models.sand
  }

  player.tool.setMesh(models.grass);
});

//lights
const abientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(abientLight);

const directionalLight1 = new THREE.DirectionalLight(0xfffff0, 2);

directionalLight1.castShadow = true;
directionalLight1.shadow.camera.top = 50;
directionalLight1.shadow.camera.bottom = -50;
directionalLight1.shadow.camera.left = 50;
directionalLight1.shadow.camera.right = -50;
directionalLight1.shadow.camera.near = 1;
directionalLight1.shadow.camera.far = 100;
directionalLight1.shadow.bias = -0.01;
directionalLight1.shadow.mapSize = new THREE.Vector2(2048, 2048);

scene.add(directionalLight1);
scene.add(directionalLight1.target);

// fog
scene.fog = new THREE.Fog(0x87ceeb, 20, 100);

// const shadowHelper = new THREE.CameraHelper(directionalLight1.shadow.camera)
// scene.add(shadowHelper)

//resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
 
  player.camera.aspect =  window.innerWidth / window.innerHeight;
  player.camera.updateProjectionMatrix();
  

  renderer.setSize(window.innerWidth, window.innerHeight);
});

///controls

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

let prevTime = performance.now();
const animate = () => {
  requestAnimationFrame(animate);
  let currentTime = performance.now();
  const dt = Math.floor(currentTime - prevTime) / 1000;

  renderer.render(scene, player.control.isLocked ? player.camera : camera);

  //shadow updation

  directionalLight1.position.copy(player.camera.position);
  directionalLight1.position.sub(new THREE.Vector3(-20, -50, -40));
  directionalLight1.target.position.copy(player.camera.position);

  //updates

  physics.update(dt, world, player); // simulating physics

  world.update(player); //calling the world update function

  stats.update(); // fps rendering on each render

  controls.update(); // updating controls on each render

  player.update(world); // update the player related operations

 

  prevTime = currentTime;
};

createGUI(world, player, physics, scene);
animate();
