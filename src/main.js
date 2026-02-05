import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/Addons.js'
import { World } from './world'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { bool } from 'three/tsl'
import { createGUI } from './gui'

const stats = new Stats()
document.body.append(stats.dom)

// // load textures
// const textureLoader = new TextureLoader()

// const dirtTexture = textureLoader.load('textures/dirt.png')
// const dirtNormal = textureLoader.load('textures/dirt-normal-high.png')

// dirtTexture.magFilter = THREE.NearestFilter;
// dirtTexture.minFilter = THREE.NearestFilter;
// dirtTexture.generateMipmaps = false
// dirtTexture.colorSpace = THREE.SRGBColorSpace

// create scene 
const scene = new THREE.Scene()

// creating camera 

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight)
camera.position.set(-32, 100, -10)

//create renderer 

const renderer= new THREE.WebGLRenderer()
renderer.setClearColor(0x87CEEB)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputColorSpace = THREE.SRGBColorSpace
//append 

document.body.appendChild(renderer.domElement)

//create world

const world = new World()
world.generateWorld()
console.log(world)
scene.add(world)

//lights
const abientLight = new THREE.AmbientLight(0xffffff, 1)
scene.add(abientLight)

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 2)
directionalLight1.position.set(10,5,10)
scene.add(directionalLight1)
const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1)
directionalLight1.position.set(-32, 100, -10)
scene.add(directionalLight2)


//resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})


///controls 

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true


const animate = ()=>{

  requestAnimationFrame(animate)

 renderer.render(scene, camera)


 //updates
stats.update()
 controls.update()

}

createGUI(world)
animate()