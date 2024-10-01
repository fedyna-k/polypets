import {GameEngine} from "../classes/GameEngine.js";
import * as THREE from "three";
import {OrbitCamera} from "../classes/OrbitCamera.js";

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
const camera = new OrbitCamera(5, window.innerWidth / window.innerHeight, 0.1, 1000);
const scene3d = new THREE.Scene();

const gameEngine = new GameEngine(renderer, camera, scene3d);

// Start
gameEngine.Start();

// Update
const update = () => {
    requestAnimationFrame(update);

    // gameEngine.Input();
    gameEngine.Update();
};

update();