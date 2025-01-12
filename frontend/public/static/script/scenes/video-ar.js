import * as THREE from "three";
import { ImprovedNoise } from "three/examples/jsm/Addons.js";
import {ArEngine} from "../classes/ar-engine.js";
import {PerspectiveCamera} from "three";

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
const camera = new PerspectiveCamera(20, 16/9, 0.1, 1000);
const scene3d = new THREE.Scene();

const frameCanvas = document.getElementById("frameCanvas");

const gameEngine = new ArEngine(frameCanvas, renderer, camera, scene3d);

// Start
gameEngine.Start("game-scene-container");

// Init first frame
let lastTime = 0;

// Update
const update = (time) => {
    const deltaTime = (time - lastTime) / 1000; // In Milliseconds
    lastTime = time;

    requestAnimationFrame(update);

    const test = new ImprovedNoise();
    test.noise(0, 1, 2);

    // gameEngine.Input();
    gameEngine.Update(deltaTime);
};

requestAnimationFrame(update);