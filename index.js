import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

const width = window.innerWidth;
const height = window.innerHeight;

class Sphere extends THREE.Mesh{
    constructor({x , y , z} , radius , color = "#00ff00"){
        super(
            new THREE.SphereGeometry(radius , 32 , 32),
            new THREE.MeshStandardMaterial({color})
        );
        this.radius = radius;
        
        this.x = x;
        this.y = y;
        this.z = z;

        this.position.set(x , y , z)

        this.top = this.position.y + this.radius;
        this.bottom = this.position.y - this.radius;
        this.right = this.position.x + this.radius;
        this.left = this.position.x - this.radius;
        this.front = this.position.z + this.radius;
        this.back = this.position.z - this.radius;
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

let parts = [
    new Sphere({x : 0 , y : 0 , z : 0} , 1 , 0x00ff00) ,
    new Sphere({x : 2 , y : 0 , z : 0} , 1 , 0x00ff00) ,
    new Sphere({x : 4 , y : 0 , z : 0} , 1 , 0x00ff00)
];

parts.forEach((part) => {
    part.castShadow = true;
    scene.add(part);
});

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