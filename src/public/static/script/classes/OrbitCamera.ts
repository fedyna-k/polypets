import {Object3D, PerspectiveCamera} from "three";

export class OrbitCamera extends PerspectiveCamera
{
    private target : Object3D = new Object3D();
    private radius : number = 10;

    public cameraYaw : number = 0;
    public cameraPitch : number = 0;


    constructor(fov: number, aspect: number, near: number, far: number) {
        super(fov, aspect, near, far);
        this.target = new Object3D();
    }

    public LookAtTarget() {
        // this.up.set(0, 1, 0);
        this.lookAt(this.target.position);
    }

    public Rotate(yaw : number, pitch : number) {
        this.cameraYaw = yaw;
        this.cameraPitch = pitch;

        const degreesToRads = (deg : number) => (deg * Math.PI) / 180.0;
        const clamp = (value : number, a : number, b : number) => Math.max(a, Math.min(value, b));
        const targetPosition = this.target.position;

        const yawRadians = degreesToRads(yaw);
        let pitchRadians = degreesToRads(pitch);

        pitchRadians = clamp(pitchRadians, -Math.PI / 2 + 0.1, Math.PI / 2 - 0.1);

        this.position.set(
            targetPosition.x + this.radius * Math.cos(pitchRadians) * Math.sin(yawRadians),
            targetPosition.y + this.radius * Math.sin(pitchRadians),
            targetPosition.z + this.radius * Math.cos(pitchRadians) * Math.cos(yawRadians)
        );
    }

    public GetRadius() : number {
        return this.radius;
    }

    public SetRadius(value : number) {
        this.radius = value;
    }

    public GetTarget() : Object3D {
        return this.target;
    }

    public SetTarget(object : Object3D) {
        this.target = object;
    }

    public Update() {
        this.LookAtTarget();
    }
}