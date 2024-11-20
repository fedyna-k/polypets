import { Object3D, PerspectiveCamera } from "three";

export class OrbitCamera extends PerspectiveCamera {
    // The target object that the camera will orbit around
    target = new Object3D();

    // The distance between the camera and the target object
    radius = 10;

    // Camera's rotation around the target on the horizontal axis (yaw)
    cameraYaw = 0;

    // Camera's rotation around the target on the vertical axis (pitch)
    cameraPitch = 0;

    /**
     * Creates an instance of OrbitCamera, inheriting from Three.js' PerspectiveCamera.
     * @param fov - Field of view of the camera (in degrees).
     * @param aspect - Aspect ratio of the camera (usually width / height of the viewport).
     * @param near - The near clipping plane.
     * @param far - The far clipping plane.
     */
    constructor(fov, aspect, near, far) {
        super(fov, aspect, near, far);
        this.target = new Object3D(); // Initialize a default target object.
    }

    /**
     * Adjusts the camera to look directly at the target object.
     * This method updates the camera's orientation to face the position of the target.
     */
    LookAtTarget() {
        // Optionally set the camera's up direction (commented out for now).
        // this.up.set(0, 1, 0);

        // Makes the camera look at the target's position.
        this.lookAt(this.target.position);
    }

    /**
     * Rotates the camera around the target by adjusting yaw (horizontal) and pitch (vertical).
     * @param yaw - The rotation around the Y-axis in degrees.
     * @param pitch - The rotation around the X-axis in degrees.
     */
    SetRotation(yaw, pitch) {
        this.cameraYaw = yaw;
        this.cameraPitch = pitch;

        // Helper function to convert degrees to radians.
        const degreesToRads = (deg) => (deg * Math.PI) / 180.0;

        // Helper function to clamp a value between two bounds.
        const clamp = (value, a, b) => Math.max(a, Math.min(value, b));

        // Get the target's current position.
        const targetPosition = this.target.position;

        // Convert yaw and pitch from degrees to radians.
        const yawRadians = degreesToRads(yaw);
        let pitchRadians = degreesToRads(pitch);

        // Clamp pitch to prevent the camera from flipping upside down.
        pitchRadians = clamp(pitchRadians, -Math.PI / 2 + 0.1, Math.PI / 2 - 0.1);

        // Update the camera's position based on yaw, pitch, and radius.
        this.position.set(
            targetPosition.x + this.radius * Math.cos(pitchRadians) * Math.sin(yawRadians),
            targetPosition.y + this.radius * Math.sin(pitchRadians),
            targetPosition.z + this.radius * Math.cos(pitchRadians) * Math.cos(yawRadians)
        );
    }

    /**
     * Adds a delta rotation to the current one.
     * @param yaw - The delta rotation around the Y-axis in degrees.
     * @param pitch - The delta rotation around the X-axis in degrees.
     */
    Rotate(yaw, pitch) {
        this.SetRotation(this.cameraYaw + yaw, this.cameraPitch + pitch);
    }

    /**
     * Gets the current radius (distance between the camera and the target).
     * @returns The current radius.
     */
    GetRadius() {
        return this.radius;
    }

    /**
     * Sets the radius (distance between the camera and the target).
     * @param value - The new radius value.
     */
    SetRadius(value) {
        this.radius = value;
    }

    /**
     * Gets the current target object that the camera is orbiting around.
     * @returns The current target object.
     */
    GetTarget() {
        return this.target;
    }

    /**
     * Sets a new target object for the camera to orbit around.
     * @param object - The new target object (an instance of `Object3D`).
     */
    SetTarget(object) {
        this.target = object;
    }

    /**
     * Updates the camera's orientation to ensure it is always looking at the target.
     * This should be called each frame to ensure the camera's orientation remains consistent
     * as it rotates around the target.
     */
    Update() {
        this.LookAtTarget();
    }
}
