import {LoadingManager} from "three";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import AssetManager from "./asset-manager.js";
import { PI } from "three/webgpu";

export class ArEngine {

    // Homography Matrix
    homography;

    // Frame Canvas of the video
    frameCanvas;

    // WebGL renderer for rendering the scene
    renderer;

    // Perspective camera for viewing the scene
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
     * @param camera - FPS Camera to provide a view of the scene.
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
                        object.scale.set(1, 1, 1);
                        object.name = "farm";

                        this.scene.add(object);

                        const axesHelper = new THREE.AxesHelper( 5 );
                        this.scene.add( axesHelper );

                        const directionalLight = new THREE.DirectionalLight( 0xffffff, 11 );

                        directionalLight.target = object;
                        directionalLight.position.set(3, 3, 3);
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

        this.renderer.domElement.width = width;
        this.renderer.domElement.height = height;

        // Resize the renderer and update the camera's aspect ratio
        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        if (window.sharedData) {
            this.camera.fov = 2 * Math.atan(36/(2 * window.sharedData.focal_length)) * 180 / Math.PI;
        }
    }

    /**
     * Updates the game engine each frame. This includes updating the camera and rendering the scene.
     */
    Update(deltaTime) {
        this._deltaTime = deltaTime;
        // const speed = 0.5;
        // const farm = this.scene.getObjectByName("farm");

        this.Resize(); // Ensure the renderer matches the canvas size

        // farm?.rotateY(deltaTime * speed);

        this.SetCameraTransform();

        this.renderer.render(this.scene, this.camera); // Render the scene
    }

    SetCameraTransform() {
        if (!window.sharedData) return;

        // console.log("[ArEngine] Updating Camera Transform");

        // Conversion de la rotation et translation OpenCV vers une matrice 4x4 pour THREE.js
        // const rotation = window.sharedData.rotation;
        // const translation = window.sharedData.translation;
        // const K = window.sharedData.K;

        this.camera.fov = window.sharedData.FOV;
        this.camera.aspect = window.sharedData.video_width/window.sharedData.video_height;
        this.camera.updateProjectionMatrix();

        // const matrix = [rotation[0], rotation[1], rotation[2], translation[0],
        //     rotation[3], rotation[5], rotation[6], translation[1],
        //     rotation[6], rotation[7], rotation[8], translation[2]];
        // const projection = Array(12).fill(0);

        // for (let i = 0; i < 3; i++) {
        //     for (let j = 0; j < 4; j++){
        //         for (let k = 0; k < 3; k++){
        //             projection[i*4 + j] += K[i*3 + k] * matrix[k*4 + j];
        //         }
        //     }
        // }

        // // console.log("Result : -------", projection);

        // projection.push(0);
        // projection.push(0);
        // projection.push(0);
        // projection.push(1);

        // const transform_matrix = new THREE.Matrix4().fromArray(projection);

        // const farm = this.scene.getObjectByName("farm");
        // farm.applyMatrix4(transform_matrix);


        const rotation = window.sharedData.rotation;
        const translation = window.sharedData.translation;

        const transform_matrix = new THREE.Matrix4().set(
            rotation[0], rotation[3], rotation[6], translation[0],
            rotation[1], rotation[4], rotation[7], translation[1],
            rotation[2], rotation[5], rotation[8], translation[2],
            0, 0, 0, 1
        );
        
        // Ajustement des coordonnées d'OpenCV à THREE.js
        
        // Application la transformation sur la caméra
        // this.camera.matrix.copy(transform_matrix);
        // this.camera.matrixAutoUpdate = false;
        // this.camera.matrixWorldNeedsUpdate = true;

        // console.log("Final Transform Matrix:", transform_matrix.elements);

        this.scene.traverse((model) => {
            if (model instanceof THREE.Object3D) {
                model.position.set( 0, 0, 0 );
                model.rotation.set( 0, 0, 0 );
                model.updateMatrix();
                model.applyMatrix4(transform_matrix);
            }
        });

        const center_pos = new THREE.Vector3(0, 0, 0);
        center_pos.applyMatrix4(transform_matrix);
        this.camera.lookAt(center_pos);
        console.log(center_pos);
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
