import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

const width = window.innerWidth;
const height = window.innerHeight;

class Sphere extends THREE.Mesh{
    constructor(radius , color = "#00ff00"){
        super(
            new THREE.SphereGeometry(radius , 32 , 32),
            new THREE.MeshStandardMaterial({color})
        );
        this.radius = radius;

        this.top = this.position.y + this.radius;
        this.bottom = this.position.y - this.radius;
    }
}

// Renerer
const renderer = new THREE.WebGLRenderer({ antialias : true});
renderer.setSize(width , height);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(75 , width/height , 0.01 , 1000);
camera.position.set(6 , 20 , 22);

const controls = new OrbitControls(camera , renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

const player = new Sphere(1 , 0x00ff00);
player.castShadow = true;
scene.add(player);

const groundMesh = new THREE.Mesh(
    new THREE.BoxGeometry(30 , 1 , 30),
    new THREE.MeshStandardMaterial({color: 0xffffff})
);
groundMesh.receiveShadow = true;
groundMesh.position.y = -1;
scene.add(groundMesh);

// Light
const light = new THREE.DirectionalLight(0xffffff , 1);
light.position.set(5 , 5 , 5);
light.castShadow = true;
scene.add(light);

const light2 = new THREE.HemisphereLight( 0xffffff , 0x000000 , 1);
scene.add(light2);

function animate(){
    requestAnimationFrame(animate);
    renderer.render(scene , camera);
}
animate();