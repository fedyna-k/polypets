import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.0/build/three.module.js';

// Scene Setup
const scene = new THREE.Scene();

// Camera Setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// WebGL Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Creating cube geometry
const geometry = new THREE.BoxGeometry();

// Create a texture loader
const loader = new THREE.TextureLoader();

// Define materials for each face
const materials = [
    createMaterial('/static/resources/textures/cobblestone.png'), // Face 1
    createMaterial('/static/resources/textures/cobblestone.png'), // Face 2
    createMaterial('/static/resources/textures/cobblestone.png'), // Face 3
    createMaterial('/static/resources/textures/cobblestone.png'), // Face 5
    createMaterial('/static/resources/textures/cobblestone.png'), // Face 4
    createMaterial('/static/resources/textures/cobblestone.png')  // Face 6
];

// Create the cube with different materials for each face
const cube = new THREE.Mesh(geometry, materials);
scene.add(cube);
// Cube animation
const animate = () => {
    requestAnimationFrame(animate);

    // Movement (rotation)
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);
};

// Dynamic camera resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

function createMaterial(texturePath) {
    const texture = loader.load(texturePath);
    texture.magFilter = THREE.NearestFilter; // Mag filter
    texture.minFilter = THREE.NearestFilter; // Min filter
    return new THREE.MeshBasicMaterial({ map: texture });
}


// Start animation
animate();
