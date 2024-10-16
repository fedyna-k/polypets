import {GameEngine} from "../classes/game-engine.js";
import * as THREE from "three";
import {OrbitCamera} from "../classes/orbit-camera.js";

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
const camera = new OrbitCamera(20, window.innerWidth / window.innerHeight, 0.1, 1000);
const scene3d = new THREE.Scene();

const gameEngine = new GameEngine(renderer, camera, scene3d);

// Start
gameEngine.Start("scene-container");

// Init first frame
let lastTime = 0;

// Update
const update = (time : number) => {
    const deltaTime = (time - lastTime) / 1000; // In Milliseconds
    lastTime = time;

    requestAnimationFrame(update);

    // gameEngine.Input();
    gameEngine.Update(deltaTime);
};

requestAnimationFrame(update);