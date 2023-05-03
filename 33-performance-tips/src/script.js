import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'stats.js'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'


/**
 * stats
 */
const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const displacementTexture = textureLoader.load('/textures/displacementMap.png')

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(2, 2, 6)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    powerPreference: 'high-performance',
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(window.devicePixelRatio)

/**
 * Test meshes
 */
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshStandardMaterial()
)
cube.castShadow = true
cube.receiveShadow = true
cube.position.set(- 5, 0, 0)
//scene.add(cube)

const torusKnot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.4, 128, 32),
    new THREE.MeshStandardMaterial()
)
torusKnot.castShadow = true
torusKnot.receiveShadow = true
//scene.add(torusKnot)

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 32, 32),
    new THREE.MeshStandardMaterial()
)
sphere.position.set(5, 0, 0)
sphere.castShadow = true
sphere.receiveShadow = true
//scene.add(sphere)

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial()
)
floor.position.set(0, - 2, 0)
floor.rotation.x = - Math.PI * 0.5
floor.castShadow = true
floor.receiveShadow = true
//scene.add(floor)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 3, 2.25)
scene.add(directionalLight)

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    stats.begin()
    const elapsedTime = clock.getElapsedTime()

    // Update test mesh
    torusKnot.rotation.y = elapsedTime * 0.1

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)


    stats.end()
}

tick()

/**
 * Tips
 */
//!!!!!!keep eye on fps
/**
 * # Unix (Terminal)
open -a "Google Chrome" --args --disable-gpu-vsync --disable-frame-rate-limit

# Windows (Command prompt)
start chrome --args --disable-gpu-vsync --disable-frame-rate-limit
 */

//MONITOR DRAW CALLS! could use spector.js

// // Tip 4
console.log(renderer.info)
//Look at renderer info

//KEEP PERFORMANT NATIVE JS CODE ESPECIALLY IN THE TICK FUNCTION
//like dont loop in the tic

// // Tip 6
// scene.remove(cube)
// cube.geometry.dispose()
// cube.material.dispose()
//Dispose to free memory
//https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects

//Avoid to much lights (or any?)
//Use baked in cheap lights like ambientLight, DirectionalLight, HemisphereLight
//Avoid adding or removing lights

//Avoid shadows
//use baked in shadows

//Optimize shadow maps and mapsize
// // Tip 10
directionalLight.shadow.camera.top = 3
directionalLight.shadow.camera.right = 6
directionalLight.shadow.camera.left = - 6
directionalLight.shadow.camera.bottom = - 3
directionalLight.shadow.camera.far = 10
directionalLight.shadow.mapSize.set(1024, 1024)

const cameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
//scene.add(cameraHelper)

//use cast/receive shadow wisely
// // Tip 11
cube.castShadow = true
cube.receiveShadow = false

torusKnot.castShadow = true
torusKnot.receiveShadow = false

sphere.castShadow = true
sphere.receiveShadow = false

floor.castShadow = false
floor.receiveShadow = true

// // Tip 12
//deactivate shadow auto update
renderer.shadowMap.autoUpdate = false
renderer.shadowMap.needsUpdate = true

//resize textures
//Only resolution matters, try to reduce resolution to a minimum while keeping a decent result
//Keep a power of 2 resolution
//Online tools like tinyPNG to reduce the weight
//can try basis format, powerful lossy compression and gpu can more easily read format

//Use right format to reduce loading time
// .jpg or .png according to the image and compression but also the alpha channel


//dont update vertices


// // Tip 18
//Mutualize geometries \/ \/ \/
//const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
//Spector.js shows that there is only one call to draw!
// const geometries = []
// for(let i = 0; i < 50; i++)
// {
//     const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)

//     geometry.rotateX((Math.random() - 0.5) * Math.PI * 2)
//     geometry.rotateY((Math.random() - 0.5) * Math.PI * 2)

//     geometry.translate(
//         (Math.random() - 0.5) * 10,
//         (Math.random() - 0.5) * 10,
//         (Math.random() - 0.5) * 10
//     )

//     geometries.push(geometry)
// }

// const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries)
// console.log(mergedGeometry)

// const material = new THREE.MeshNormalMaterial()

// const mesh = new THREE.Mesh(mergedGeometry, material)
// scene.add(mesh)

// // Tip 19
// for(let i = 0; i < 50; i++)
// {
//     const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)

//     const material = new THREE.MeshNormalMaterial()
    
//     const mesh = new THREE.Mesh(geometry, material)
//     mesh.position.x = (Math.random() - 0.5) * 10
//     mesh.position.y = (Math.random() - 0.5) * 10
//     mesh.position.z = (Math.random() - 0.5) * 10
//     mesh.rotation.x = (Math.random() - 0.5) * Math.PI * 2
//     mesh.rotation.y = (Math.random() - 0.5) * Math.PI * 2

//     scene.add(mesh)
// }

// // Tip 20
//Mutualize materials
// const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
// const material = new THREE.MeshNormalMaterial() // This is correct compared to above
    
// for(let i = 0; i < 50; i++)
// {
    

//     const mesh = new THREE.Mesh(geometry, material)
//     mesh.position.x = (Math.random() - 0.5) * 10
//     mesh.position.y = (Math.random() - 0.5) * 10
//     mesh.position.z = (Math.random() - 0.5) * 10
//     mesh.rotation.x = (Math.random() - 0.5) * Math.PI * 2
//     mesh.rotation.y = (Math.random() - 0.5) * Math.PI * 2

//     scene.add(mesh)
// }

//USE CHEAP MATERIALS!

// // Tip 22
//Use InstancedMesh
const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)

const material = new THREE.MeshNormalMaterial()
    
const mesh = new THREE.InstancedMesh(geometry,material,50) // instanced!
//scene.add(mesh)

for(let i = 0; i < 50; i++)
{
    const position = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
    )

    const quaternion = new THREE.Quaternion()
    quaternion.setFromEuler(new THREE.Euler((Math.random() - 0.5) * Math.PI * 2, (Math.random() - 0.5) * Math.PI * 2, 0))

    const matrix = new THREE.Matrix4()
    matrix.makeRotationFromQuaternion(quaternion)
    matrix.setPosition(position)

    mesh.setMatrixAt(i, matrix)
    // const mesh = new THREE.Mesh(geometry, material)
    // mesh.position.x = (Math.random() - 0.5) * 10
    // mesh.position.y = (Math.random() - 0.5) * 10
    // mesh.position.z = (Math.random() - 0.5) * 10
    // mesh.rotation.x = (Math.random() - 0.5) * Math.PI * 2
    // mesh.rotation.y = (Math.random() - 0.5) * Math.PI * 2

    // scene.add(mesh)
}
//ONE DRAW CALL AND WE CAN STILL MOVE VIA MATRICES

//USE LOW POLY MODELS (FEWER.. The better) USE NORMAL MAPS
//draco compression good for very complex geometries
//use gzip, compression on server side
//objects out of FOV wont get rendered, some people shrink FOV to make more performant
//Adjust near and far

// // Tip 29
//Limit pixel ration to 2
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//Power prefrences, choose best tool for the job
// const renderer = new THREE.WebGLRenderer({
//     canvas: canvas,
//     powerPreference: 'high-performance' //don't use if you dont have framerate issues 
// })

// // Tip 31, 32, 34 and 35
//Antialias takes away some performance, only add if visible aliasing and no performance issues
//LIMIT PASSES!
//SPECIFY SHADER PRECISON
//Keep shader code simple, avoid ifs
//Make good use of swizzles and built-in functions
//Use textures, perlin noise is not performant
//USE DEFINES
//do calculations in the vertex shader
const shaderGeometry = new THREE.PlaneGeometry(10, 10, 256, 256)

const shaderMaterial = new THREE.ShaderMaterial({
    precison: 'lowp',
    uniforms:
    {
        uDisplacementTexture: { value: displacementTexture },
        //uDisplacementStrength: { value: 1.5 }
    },
    defines:{
        DISPLACEMENT_STRENGTH: 1.5
    },
    vertexShader: `
        uniform sampler2D uDisplacementTexture;
        

        varying vec2 vUv;
        varying vec3 vColor;

        void main()
        {
            //position
            vec4 modelPosition = modelMatrix * vec4(position, 1.0);
            float elevation = texture2D(uDisplacementTexture, uv).r;
            modelPosition.y += max(elevation, 0.5) * DISPLACEMENT_STRENGTH;
            gl_Position = projectionMatrix * viewMatrix * modelPosition;

            //color
            float colorElevation = max(elevation, 0.25);

            vec3 color =mix(vec3(1.0, 0.1, 0.1), vec3(0.1, 0.0, 0.5), colorElevation);

            vUv = uv;
            vColor = color;
        }
    `,
    fragmentShader: `
        uniform sampler2D uDisplacementTexture;

        varying vec2 vUv;
        varying vec3 vColor;

        void main()
        {
            float elevation = texture2D(uDisplacementTexture, vUv).r;
            if(elevation < 0.25)
            {
                elevation = 0.25;
            }

            //vec3 finalColor = vec3(0.0);
            //finalColor.r += depthColor.r + (surfaceColor.r - depthColor.r) * elevation;
            //finalColor.g += depthColor.g + (surfaceColor.g - depthColor.g) * elevation;
            //finalColor.b += depthColor.b + (surfaceColor.b - depthColor.b) * elevation;
            gl_FragColor = vec4(vColor, 1.0);
        }
    `
})

const shaderMesh = new THREE.Mesh(shaderGeometry, shaderMaterial)
shaderMesh.rotation.x = - Math.PI * 0.5
scene.add(shaderMesh)

//https://discoverthreejs.com/tips-and-tricks/ for more tips and tricks