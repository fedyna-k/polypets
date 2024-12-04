import {Color, LoadingManager} from "three";
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import AssetManager from "./asset-manager.js";

export class GameEngine {
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
    constructor(renderer, camera, scene) {
        this.renderer = renderer;
        this.camera = camera;
        this.scene = scene;

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

        this.scene.background = new Color(0.169,1,1);

        // Get the container element where the scene will be rendered
        const container = document.getElementById(sceneId);

        // Append the renderer's canvas to the container
        container?.appendChild(this.renderer.domElement);
        this.renderer.domElement.classList.add("three-canva");

        // Setup a resize observer for handling dynamic resizing of the renderer
        const resizeRenderer = () => {
            if (!container) return;

            const width = container.clientWidth;
            const height = container.clientHeight;

            // Resize the renderer and update the camera's aspect ratio
            this.renderer.setSize(width, height);
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
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

        // Initialize mouse input handling
        this.Input();
    }

    /**
     * Sets up input handling for mouse events, including camera rotation and zooming.
     */
    Input() {
        const sensivity = 0.2;  // Lowered sensitivity to improve control
        const canvas = this.renderer.domElement;

        // Store previous mouse position to calculate deltas
        let prevMouse = { x: 0, y: 0 };
        let isDragging = false;

        // Mouse move event handler for rotating the camera
        const onMouseMove = (event) => {
            if (!isDragging) return;

            // Calculate the mouse movement (delta) from the last recorded position
            const deltaX = (event.clientX - prevMouse.x) * sensivity;
            const deltaY = (event.clientY - prevMouse.y) * sensivity;

            // Update the camera's yaw and pitch based on the mouse movement
            this.camera.SetRotation(this.camera.cameraYaw + deltaX, this.camera.cameraPitch + deltaY);

            // Store the current mouse position
            prevMouse = { x: event.clientX, y: event.clientY };
        };

        // Mouse down event handler to start camera movement
        const onMouseDown = (event) => {
            isDragging = true;
            prevMouse = { x: event.clientX, y: event.clientY };
            console.log("Mouse button pressed");
        };

        // Mouse up event handler to stop camera movement
        const onMouseUp = () => {
            isDragging = false;
            console.log("Mouse button released");
        };

        // Mouse wheel event handler to adjust the camera's distance from the target
        const onMouseWheel = (event) => {
            console.log("Mouse wheel scrolled:", event.deltaY);

            // Update the camera's radius based on the scroll wheel input
            this.camera.SetRadius(this.camera.GetRadius() + event.deltaY * 0.1);
        };

        // Attach mouse event listeners to the canvas
        canvas.addEventListener("mousemove", onMouseMove, false);
        canvas.addEventListener("mousedown", onMouseDown, false);
        canvas.addEventListener("mouseup", onMouseUp, false);
        canvas.addEventListener("wheel", onMouseWheel, false);
    }

    /**
     * Updates the game engine each frame. This includes updating the camera and rendering the scene.
     */
    Update(deltaTime) {
        const speed = 0.5;

        const farm = this.scene.getObjectByName("farm");

        farm?.rotateY(deltaTime * speed);

        // this.camera.Rotate(deltaTime * 10 * speed, 0);
        this.camera.Update();  // Update the camera to ensure it looks at the target

        this.renderer.render(this.scene, this.camera);  // Render the scene using the camera
    }

    /**
     * Method to initialize the behavior of the loading manager
     */
    SetupLoadingManagerEvents() {
        this.loadingManager.onLoad = function ( ) {
            console.log( "Loading complete!");
            document.getElementById("loader").style.display = "none";
        };

        this.loadingManager.onProgress = function ( url, itemsLoaded, itemsTotal ) {
            document.getElementById("loading-bar").style.setProperty("--progress", `${100 * (1 - itemsLoaded / itemsLoaded)}%`)
            console.log( "Loading file: " + url + ".\nLoaded " + itemsLoaded + " of " + itemsTotal + " files." );
        };

        this.loadingManager.onError = function ( url ) {
            console.log( "There was an error loading " + url );
        };
    }
}
