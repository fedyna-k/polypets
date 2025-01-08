import {LoadingManager} from "three";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import AssetManager from "./asset-manager.js";

export class ArEngine {

    // Homography Matrix
    homography;

    // Frame Canvas of the video
    frameCanvas;

    // WebGL renderer for rendering the scene
    renderer;

    // Orbit camera for viewing the scene
    camera;

    // Three.js scene object
    scene;

    // Texture loader for loading textures used in materials
    texLoader;

    // Obj loader for loading .obj models
    objLoader;

    // Obj loader for loading .mtl files
    mtlLoader;

    // Loading manager for obj loader handling
    loadingManager;

    /**
     * Constructs a new instance of the GameEngine.
     * @param renderer - WebGLRenderer to render the scene.
     * @param camera - OrbitCamera to provide a view of the scene.
     * @param scene - The Three.js scene that contains objects.
     */
    constructor(canvas, renderer, camera, scene) {
        this.renderer = renderer;
        this.camera = camera;
        this.scene = scene;
        this.frameCanvas = canvas;

        // Initialize the texture loader for creating materials
        this.loadingManager = new LoadingManager();
        this.SetupLoadingManagerEvents();
        this.texLoader = new THREE.TextureLoader();
        this.objLoader = new OBJLoader(this.loadingManager);
        this.mtlLoader = new MTLLoader();
        this.mtlLoader.setMaterialOptions( { invertTrProperty: false } );
    }

    /**
     * Starts the game engine, sets up the scene, and initiates event handling.
     * Creates a cube, sets up the camera, and initializes input handling.
     */
    Start(sceneId) {
        this.mtlLoader.load(
            AssetManager.getMaterial("farm.mtl"),
            (materials) => {
                materials.preload();
                console.log(materials);
                this.objLoader.setMaterials(materials);
                this.objLoader.load(
                    AssetManager.getModel("farm.obj"),
                    (object) => {
                        object.scale.set(0.1, 0.1, 0.1);
                        object.name = "farm";

                        this.scene.add(object);

                        // Set the camera to orbit around the cube
                        this.camera.SetTarget(object);

                        this.camera.SetRadius(50);
                        this.camera.Rotate(0, 35);

                        const directionalLight = new THREE.DirectionalLight( 0xffffff, 11 );

                        directionalLight.target = object;
                        directionalLight.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z);
                        directionalLight.castShadow = false;

                        this.scene.add(directionalLight);
                    },
                    (xhr) => {
                        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
                    },
                    (error) => {
                        console.log(error);
                    }
                );
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
            },
            () => {
                console.log("An error happened");
            }
        );

        // this.scene.background = new Color(0.169,1,1, 0);
        this.renderer.setClearColor( 0xffffff , 0);

        // Get the container element where the scene will be rendered
        const container = document.getElementById(sceneId);

        // Append the renderer's canvas to the container
        container?.appendChild(this.renderer.domElement);
        this.renderer.domElement.classList.add("three-canva");

        // Setup a resize observer for handling dynamic resizing of the renderer
        const resizeRenderer = () => {
            if (!container) return;
            this.Resize();
        };

        // Observe the container's size and trigger the resize handler
        if (container) {
            const observer = new ResizeObserver(() => {
                resizeRenderer();
            });
            observer.observe(container);
        }

        // Perform the initial resizing of the renderer
        resizeRenderer();
    }

    Resize() {
        const width = this.frameCanvas.width;
        const height = this.frameCanvas.height;

        // Resize the renderer and update the camera's aspect ratio
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    /**
     * Updates the game engine each frame. This includes updating the camera and rendering the scene.
     */
    Update(deltaTime) {
        const speed = 0.5;
        const farm = this.scene.getObjectByName("farm");

        this.Resize(); // Ensure the renderer matches the canvas size

        farm?.rotateY(deltaTime * speed);

        this.camera.Update(); // Update the camera
        this.renderer.render(this.scene, this.camera); // Render the scene
    }


    SetHomography(h) {
        if (h == null) return;
        this.homography = h;
    }

    ApplyHomography(H, point) {
        if (!H || H.length !== 3 || !point || typeof point.x !== "number" || typeof point.y !== "number") {
            console.error("Invalid homography matrix or point:", { H, point });
            return point; // Return the original point as a fallback
        }

        const [x, y, z] = [
            H[0][0] * point.x + H[0][1] * point.y + H[0][2],
            H[1][0] * point.x + H[1][1] * point.y + H[1][2],
            H[2][0] * point.x + H[2][1] * point.y + H[2][2],
        ];

        if (z === 0) {
            console.error("Homography resulted in an invalid transformation (z=0)");
            return point; // Return the original point as a fallback
        }

        return { x: x / z, y: y / z };
    }


    /**
     * Method to initialize the behavior of the loading manager
     */
    SetupLoadingManagerEvents() {

    }
}
