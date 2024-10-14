import { Scene, TextureLoader, WebGLRenderer } from "three";
import * as THREE from "three";
import { OrbitCamera } from "./OrbitCamera.js";

export class GameEngine {
    // WebGL renderer for rendering the scene
    renderer: WebGLRenderer;

    // Orbit camera for viewing the scene
    camera: OrbitCamera;

    // Three.js scene object
    scene: Scene;

    // Texture loader for loading textures used in materials
    texLoader: TextureLoader;

    /**
     * Constructs a new instance of the GameEngine.
     * @param renderer - WebGLRenderer to render the scene.
     * @param camera - OrbitCamera to provide a view of the scene.
     * @param scene - The Three.js scene that contains objects.
     */
    public constructor(renderer: WebGLRenderer, camera: OrbitCamera, scene: Scene) {
        this.renderer = renderer;
        this.camera = camera;
        this.scene = scene;

        // Initialize the texture loader for creating materials
        this.texLoader = new THREE.TextureLoader();
    }

    /**
     * Starts the game engine, sets up the scene, and initiates event handling.
     * Creates a cube, sets up the camera, and initializes input handling.
     */
    public Start(sceneId : string) {
        // Creating cube geometry
        const _geometry = new THREE.BoxGeometry();

        // Texture path for the cube material
        const texturePath = "/static/resources/textures/cobblestone.png";
        const material = this.CreateMaterial(texturePath);

        // Apply the material to all faces of the cube
        const _materials = [
            material,
            material,
            material,
            material,
            material,
            material
        ];

        // Create a cube mesh and add it to the scene
        const cube = new THREE.Mesh(_geometry, _materials);
        this.scene.add(cube);

        // Set the initial camera position
        this.camera.position.set(0, 0, 5);

        // Get the container element where the scene will be rendered
        let container = document.getElementById(sceneId);

        // Append the renderer's canvas to the container
        container?.appendChild(this.renderer.domElement);

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

        // Set the camera to orbit around the cube
        this.camera.SetTarget(cube);

        // Initialize mouse input handling
        this.Input();
    }

    /**
     * Sets up input handling for mouse events, including camera rotation and zooming.
     */
    private Input() {
        const sensivity = 0.2;  // Lowered sensitivity to improve control
        const canvas = this.renderer.domElement;

        // Store previous mouse position to calculate deltas
        let prevMouse = { x: 0, y: 0 };
        let isDragging = false;

        // Mouse move event handler for rotating the camera
        let onMouseMove = (event: MouseEvent) => {
            if (!isDragging) return;

            // Calculate the mouse movement (delta) from the last recorded position
            const deltaX = (event.clientX - prevMouse.x) * sensivity;
            const deltaY = (event.clientY - prevMouse.y) * sensivity;

            // Update the camera's yaw and pitch based on the mouse movement
            this.camera.Rotate(this.camera.cameraYaw + deltaX, this.camera.cameraPitch + deltaY);

            // Store the current mouse position
            prevMouse = { x: event.clientX, y: event.clientY };
        };

        // Mouse down event handler to start camera movement
        let onMouseDown = (event: MouseEvent) => {
            isDragging = true;
            prevMouse = { x: event.clientX, y: event.clientY };
            console.log("Mouse button pressed");
        };

        // Mouse up event handler to stop camera movement
        let onMouseUp = (_event: Event) => {
            isDragging = false;
            console.log("Mouse button released");
        };

        // Mouse wheel event handler to adjust the camera's distance from the target
        let onMouseWheel = (event: WheelEvent) => {
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
    public Update() {
        this.camera.Update();  // Update the camera to ensure it looks at the target
        this.renderer.render(this.scene, this.camera);  // Render the scene using the camera
    }

    /**
     * Creates a material with a texture, applying nearest filtering for both magnification and minification.
     * @param texturePath - Path to the texture image file.
     * @returns A Three.js material with the applied texture.
     */
    private CreateMaterial(texturePath: string) {
        // Load the texture from the specified path
        const texture = this.texLoader.load(texturePath);

        // Apply nearest filtering for both magnification and minification
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;

        // Return a basic material with the texture applied
        return new THREE.MeshBasicMaterial({ map: texture });
    }
}
