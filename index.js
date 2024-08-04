import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

const width = window.innerWidth;
const height = window.innerHeight;

var food = { x: null, z: null, foodsphere: null };

// Renerer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(50, width / height, 0.01, 1000);
camera.position.set(10, 50, 45);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

const groundMesh = new THREE.Mesh(
  new THREE.BoxGeometry(54, 1, 54),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
groundMesh.receiveShadow = true;
groundMesh.position.y = -1.5;
scene.add(groundMesh);

// Light
const light = new THREE.PointLight(0xffffff, 1.5, 1000, 0);
light.position.set(0, 50, 0);
light.castShadow = true;
scene.add(light);

const light2 = new THREE.HemisphereLight(0xffff00, 1);
scene.add(light2);

class Sphere extends THREE.Mesh {
  constructor({ x, y, z }, radius, color = "#00ff00") {
    super(
      new THREE.SphereGeometry(radius, 32, 32),
      new THREE.MeshStandardMaterial({ color })
    );
    this.radius = radius;

    this.x = x;
    this.y = y;
    this.z = z;

    this.position.set(x, y, z);
    this.pos = this.position;

    this.top = this.position.y + this.radius;
    this.bottom = this.position.y - this.radius;
    this.right = this.position.x + this.radius;
    this.left = this.position.x - this.radius;
    this.front = this.position.z + this.radius;
    this.back = this.position.z - this.radius;
  }
}

class Snake {
  constructor() {
    this.parts = [
      new Sphere({ x: 0, y: 0, z: 0 }, 1, 0x00ff00),
      new Sphere({ x: 2, y: 0, z: 0 }, 1, 0x00ff00),
      new Sphere({ x: 4, y: 0, z: 0 }, 1, 0x00ff00),
    ];
    this.up = true;
    this.down = false;
    this.right = false;
    this.left = false;

    this.unit = 2;
  }

  move(state) {
    if (!state) {
      scene.remove(this.parts[0]);
      this.parts.shift();
    }

    this.head = this.parts[this.parts.length - 1];
    if (this.up) {
      var sphere = new Sphere(
        { x: this.head.x, y: this.head.y, z: this.head.z - this.unit },
        1
      );
    }
    if (this.down) {
      var sphere = new Sphere(
        { x: this.head.x, y: this.head.y, z: this.head.z + this.unit },
        1
      );
    }
    if (this.right) {
      var sphere = new Sphere(
        { x: this.head.x + this.unit, y: this.head.y, z: this.head.z },
        1
      );
    }
    if (this.left) {
      var sphere = new Sphere(
        { x: this.head.x - this.unit, y: this.head.y, z: this.head.z },
        1
      );
    }
    this.parts.push(sphere);
    this.parts.forEach((part) => {
      part.castShadow = true;
      scene.add(part);
    });

    scene.add(sphere);
  }
}

const snake = new Snake();

function createStars() {
  for (let i = 0; i < 2000; i++) {
    let x = Math.floor((Math.random() + 0.1) * (Math.random() + 0.2) * 500);
    if (Math.random() > 0.5) {
      x *= -1;
    }
    let y = Math.floor((Math.random() + 0.1) * (Math.random() + 0.2) * 500);
    if (Math.random() > 0.5) {
      y *= -1;
    }
    let z = Math.floor((Math.random() + 0.1) * (Math.random() + 0.2) * 500);
    if (Math.random() > 0.5) {
      z *= -1;
    }
    if (x > 1000 || y > 1000 || z > 1000) {
      return;
    }
    let starMesh = new THREE.Mesh(
      new THREE.SphereGeometry(Math.floor(Math.random() * 2), 32, 32),
      new THREE.MeshStandardMaterial({
        color: `hsl(${Math.random() * 360}, 50%, 50%)`,
      })
    );
    starMesh.position.set(x, y, z);
    scene.add(starMesh);
  }
}
createStars();

addEventListener("keydown", (event) => {
  if (event.key == "w" && !snake.down) {
    snake.right = false;
    snake.left = false;
    snake.up = true;
  } else if (event.key == "s" && !snake.up) {
    snake.right = false;
    snake.left = false;
    snake.down = true;
  }
  if (event.key == "a" && !snake.right) {
    snake.up = false;
    snake.down = false;
    snake.left = true;
  }
  if (event.key == "d" && !snake.left) {
    snake.up = false;
    snake.down = false;
    snake.right = true;
  }
});

function createFood() {
  let xIndex = Math.floor((Math.random() - 0.5) * 25) * 2;
  let zIndex = Math.floor((Math.random() - 0.5) * 25) * 2;

  for (let i = 0; i < snake.parts.length; i++) {
    if (
      snake.parts[i].position.x == xIndex &&
      snake.parts[i].position.z == zIndex
    ) {
      createFood();
      return false;
    }
  }

  var foodsphere = new Sphere({ x: xIndex, y: 0, z: zIndex }, 1, 0xff0000);
  scene.add(foodsphere);
  food.x = xIndex;
  food.z = zIndex;
  food.foodsphere = foodsphere;
  food.castShadow = true;
}

createFood();
let counter = 0;
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  let head = snake.parts[snake.parts.length - 1];
  if (snake.up) {
    camera.position.z -= 1 / 5;
  } else if (snake.down) {
    camera.position.z += 1 / 5;
  } else if (snake.right) {
    camera.position.x += 1 / 5;
  } else {
    camera.position.x -= 1 / 5;
  }
  if (counter % 5 == 0) {
    if (head.position.x == food.x && head.position.z == food.z) {
      scene.remove(food.foodsphere);
      createFood();
      snake.move(true);
    } else {
      snake.move(false);
    }
  }
  counter++;
}
animate();
