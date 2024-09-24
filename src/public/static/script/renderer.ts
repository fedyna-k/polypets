import * as THREE from "three";

// Scene Setup
const scene = new THREE.Scene();

// Camera Setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// WebGL Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Creating cube geometry
const geometry = new THREE.BoxGeometry();

// Create a texture loader
const loader = new THREE.TextureLoader();

const texturePath = "/static/resources/textures/cobblestone.png";
const material = createMaterial(texturePath);

// Define textures for each face of the cube
const materials = [
    material,
    material,
    material,
    material,
    material,
    material
];

// Function to create a material with nearest filtering
function createMaterial(texturePath: string) {
    const texture = loader.load(texturePath);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return new THREE.MeshBasicMaterial({ map: texture });
}

// Create the cube with textures for each face
const cube = new THREE.Mesh(geometry, materials);
scene.add(cube);

// Add a background plane
const backgroundTexture = loader.load("https://images.photowall.com/products/42556/summer-landscape-with-river.jpg?h=699&q=85"); // Chemin de l"image de fond
const backgroundGeometry = new THREE.PlaneGeometry(16, 12); // Taille du plan
const backgroundMaterial = new THREE.MeshBasicMaterial({ map: backgroundTexture, side: THREE.DoubleSide });
const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
background.position.z = -5; // Positionne le plan derrière le cube
scene.add(background);

// Cube animation
const animate = () => {
    requestAnimationFrame(animate);

    // Movement (rotation)
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);
};

// Dynamic camera resizing
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Start animation
animate();
