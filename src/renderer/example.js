import * as THREE from 'three';
// Création de la scène
const scene = new THREE.Scene();
// Création de la caméra (PerspectiveCamera)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;
// Création du rendu (WebGLRenderer)
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Création d'un cube (BoxGeometry avec MeshBasicMaterial)
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
// Fonction pour animer le cube
const animate = () => {
    requestAnimationFrame(animate);
    // Rotation du cube
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    // Rendu de la scène avec la caméra
    renderer.render(scene, camera);
};
// Redimensionnement dynamique du rendu lors du changement de la taille de la fenêtre
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
// Lancer l'animation
animate();
