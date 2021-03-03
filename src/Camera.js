import * as THREE from "three";
//import OrbitControls from "three-orbitcontrols";


export default class CameraSwitcher {
    constructor(scene, renderer, perspective, orthographic, controls) {
        this.scene = scene;
        this.renderer = renderer;

        this.perspective = perspective;
        this.orthographic = orthographic;
        this.onSwitch = null;
        this.controls = controls;

        renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
    }

    onMouseDown() {
        this.toPerspective();
    }

    toOrtho() {
        if(!!this.scene.activeCamera && this.scene.activeCamera !== this.orthographic) {
            this.orthographic.position.copy(this.perspective.position);
            /*
            // Update Depth
            var look_direction = this.perspective.getWorldDirection(new THREE.Vector3());
            var distance = this.controls.target.clone().sub( this.perspective.position );
            var depth = distance.dot( look_direction );

            var size = this.renderer.getSize(new THREE.Vector2());
            var aspect = size.x / size.y;

            var height_ortho = depth * 2 * Math.atan(this.perspective.fov * (Math.PI / 180) / 2);
            var width_ortho = height_ortho * aspect;

            this.orthographic.zoom = 1;
            this.orthographic.left = width_ortho / -2;
            this.orthographic.right = width_ortho / 2;
            this.orthographic.top = height_ortho / 2;
            this.orthographic.bottom = height_ortho / -2;
            */

            this.orthographic.updateProjectionMatrix();
            this.orthographic.position.copy(this.perspective.position);
            this.orthographic.quaternion.copy(this.perspective.quaternion);
            
        }

        this.scene.activeCamera = this.orthographic;

        if(!!this.onSwitch && typeof this.onSwitch == "function") {
            this.onSwitch(this.scene.activeCamera);
        }
    }

    toPerspective() {
        if(!!this.scene.activeCamera && this.scene.activeCamera !== this.perspective) {
            this.perspective.position.copy(this.orthographic.position);
        }

        this.scene.activeCamera = this.perspective;

        if(!!this.onSwitch && typeof this.onSwitch == "function") {
            this.onSwitch(this.scene.activeCamera);
        }
    }

    toggle() {
        if(this.scene.activeCamera == null) {
            this.scene.activeCamera = this.perspective;
        } else if(this.scene.activeCamera === this.perspective) {
            this.toOrtho();
        } else {
            this.toPerspective();
        }
    }

    onWindowResize(aspect) {
        this.perspective.aspect = aspect;
        this.perspective.updateProjectionMatrix();
    }

}
