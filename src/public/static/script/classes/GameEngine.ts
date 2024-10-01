import {Scene, TextureLoader, WebGLRenderer} from "three";
import * as THREE from "three";
import {OrbitCamera} from "./OrbitCamera.js";

export class GameEngine
{
    renderer: WebGLRenderer;
    camera: OrbitCamera;
    scene: Scene;
    texLoader: TextureLoader;

    public constructor(renderer: WebGLRenderer, camera: OrbitCamera, scene: Scene)
    {
        this.renderer = renderer;
        this.camera = camera;
        this.scene = scene;
        this.texLoader = new THREE.TextureLoader();
    }

    public Start ()
    {
        // Creating cube geometry
        const _geometry = new THREE.BoxGeometry();

        const texturePath = "/static/resources/textures/cobblestone.png";
        const material = this.CreateMaterial(texturePath);

        // Define textures for each face of the cube
        const _materials = [
            material,
            material,
            material,
            material,
            material,
            material
        ];

        const cube = new THREE.Mesh(_geometry, _materials);
        this.scene.add(cube);

        this.camera.position.set(0, 0, 5);

        // Scene container
        let container = document.getElementById("scene-container");

        // Append the canvas on the web page inside the container
        container?.appendChild(this.renderer.domElement);

        // Setup a resize observer and its callback for the container

        // Dynamic Resizing
        const resizeRenderer = () => {
            if (!container) return;

            const width = container.clientWidth;
            const height = container.clientHeight;

            // Redimensionner le renderer en fonction des dimensions du parent
            this.renderer.setSize(width, height);

            // Mettre à jour l'aspect ratio et la matrice de projection de la caméra
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        };

        if (container) {
            const observer = new ResizeObserver(() => {
                resizeRenderer();
            });

            observer.observe(container);
        }

        resizeRenderer();

        this.camera.SetTarget(cube);

        this.Input();
    }

    private Input()
    {
        const sensivity = 10;
        const canvas = this.renderer.domElement;

        let onMouseMove = (event: MouseEvent) => {
            // Calcul des coordonnées de la souris dans l'espace du canevas
            const mouse = {
                x: (event.clientX / window.innerWidth) * sensivity - 1,
                y: -(event.clientY / window.innerHeight) * sensivity + 1
            };

            console.log("Mouse moved at:", mouse);

            this.camera.Rotate(this.camera.cameraYaw + mouse.x, this.camera.cameraPitch + mouse.y);
        }

        let onMouseDown = (_event : Event) => {
            console.log('Mouse button pressed');
        }

        let onMouseUp = (_event : Event) => {
            console.log('Mouse button released');
        }

        let onMouseWheel = (event : WheelEvent) => {
            console.log('Mouse wheel scrolled:', event.deltaY);

            this.camera.SetRadius(this.camera.GetRadius() + event.deltaY);
        }

        // Mouse events
        canvas.addEventListener('mousemove', onMouseMove, false);
        canvas.addEventListener('mousedown', onMouseDown, false);
        canvas.addEventListener('mouseup', onMouseUp, false);
        canvas.addEventListener('wheel', onMouseWheel, false);
    }

    public Update ()
    {
        this.camera.Update();
        this.renderer.render(this.scene, this.camera);
    }

    // Function to create a material with nearest filtering
    private CreateMaterial(texturePath: string) {
        const texture = this.texLoader.load(texturePath);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        return new THREE.MeshBasicMaterial({ map: texture });
    }
}