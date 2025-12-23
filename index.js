import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";

const width = window.innerWidth;
const height = window.innerHeight;

var food = { x: null, z: null, foodsphere: null, foodType: null };

// Snake movement
let step = true;

// Score
let score = 0;

// Camera state
let cameraState = 1;

// State of Falling
let gameOver = false;

// State of heating itself
let heatGameOver = false;
// Renerer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Scene
export const scene = new THREE.Scene();

// Score Text
const loader = new FontLoader();

loader.load("./assets/fonts/Exo 2_Regular.json", function (font) {
    const scoreGeo = new TextGeometry(`Score : `, {
        font: font,
        size: 8,
        height: 1.5,
    });
    var textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    var text = new THREE.Mesh(scoreGeo, textMaterial);
    text.position.set(-25, 0, -35);
    scene.add(text);

    const nameGeo = new TextGeometry("Snake game", {
        font: font,
        size: 8,
        height: 1.5,
    });
    let nameMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    let name = new THREE.Mesh(nameGeo, nameMaterial);
    name.position.set(-35, 0, 28);
    name.rotateY((90 * Math.PI) / 180);
    name.rotateX((-5 * Math.PI) / 180);
    scene.add(name);
});
// Camera
const camera = new THREE.PerspectiveCamera(50, width / height, 0.01, 1000);
camera.position.set(10, 50, 45);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

const groundMesh = new THREE.Mesh(new THREE.BoxGeometry(54, 1, 54), new THREE.MeshStandardMaterial({ color: 0xffffff }));
groundMesh.receiveShadow = true;
groundMesh.position.y = -1.5;
scene.add(groundMesh);

// Light
const light = new THREE.PointLight(0xffffff, 1.5, 1000, 0);
light.position.set(0, 50, 0);
light.castShadow = true;
scene.add(light);

const light2 = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
scene.add(light2);

class Sphere extends THREE.Mesh {
    constructor({ x, y, z }, radius, color = "#00ff00") {
        super(new THREE.SphereGeometry(radius, 32, 32), new THREE.MeshStandardMaterial({ color }));
        this.radius = radius;

        this.x = x;
        this.y = y;
        this.z = z;

        this.position.set(x, y, z);

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
        this.parts = [new Sphere({ x: 0, y: 0, z: 0 }, 1, 0x00ff00), new Sphere({ x: 2, y: 0, z: 0 }, 1, 0x00ff00), new Sphere({ x: 4, y: 0, z: 0 }, 1, 0x00ff00)];
        this.up = true;
        this.down = false;
        this.right = false;
        this.left = false;

        this.unit = 2;
        this.velocity = 1;
        this.gravity = 0.5;
    }

    move(state) {
        if (!state) {
            scene.remove(this.parts[0]);
            this.parts.shift();
        }
        if (!gameOver) {
            this.head = this.parts[this.parts.length - 1];
            if (this.up) {
                if (this.head.position.z - this.unit < -27) gameOver = true;
                var sphere = new Sphere({ x: this.head.x, y: this.head.y, z: this.head.z - this.unit }, 1);
            }
            if (this.down) {
                if (this.head.position.z + this.unit > 27) gameOver = true;
                var sphere = new Sphere({ x: this.head.x, y: this.head.y, z: this.head.z + this.unit }, 1);
            }
            if (this.right) {
                if (this.head.position.x + this.unit > 27) gameOver = true;

                var sphere = new Sphere({ x: this.head.x + this.unit, y: this.head.y, z: this.head.z }, 1);
            }
            if (this.left) {
                if (this.head.position.x - this.unit < -27) gameOver = true;
                var sphere = new Sphere({ x: this.head.x - this.unit, y: this.head.y, z: this.head.z }, 1);
            }
            this.parts.push(sphere);
            this.parts.forEach((part) => {
                part.castShadow = true;
                scene.add(part);
            });

            scene.add(sphere);
        }
    }
    fall() {
        this.head = this.parts[this.parts.length - 1];
        if (this.parts[0].position.y < -200) {
            this.parts.forEach((part) => {
                scene.remove(part);
            });
            return;
        }
        this.velocity += this.gravity;
        scene.remove(this.parts[0]);
        this.parts.shift();
        var sphere = new Sphere({ x: this.head.x, y: this.head.y - this.velocity, z: this.head.z }, 1);

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
                color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            })
        );
        starMesh.position.set(x, y, z);
        scene.add(starMesh);
    }
}
createStars();

function createFood() {
    let xIndex = Math.floor((Math.random() - 0.5) * 25) * 2;
    let zIndex = Math.floor((Math.random() - 0.5) * 25) * 2;

    for (let i = 0; i < snake.parts.length; i++) {
        if (snake.parts[i].position.x == xIndex && snake.parts[i].position.z == zIndex) {
            createFood();
            return false;
        }
    }
    if (Math.random() > 0.1 || cameraState != 1) {
        var foodsphere = new Sphere({ x: xIndex, y: 0, z: zIndex }, 1, 0xff0000);
        scene.add(foodsphere);
        food.x = xIndex;
        food.z = zIndex;
        food.foodsphere = foodsphere;
        food.castShadow = true;
        food.foodType = 1;
    } else {
        var foodsphere = new Sphere({ x: xIndex, y: 0, z: zIndex }, 1, 0x0000ff);
        scene.add(foodsphere);
        food.x = xIndex;
        food.z = zIndex;
        food.foodsphere = foodsphere;
        food.castShadow = true;
        food.foodType = 2;
    }
}

createFood();
let text;

function scoreFunc() {
    let loader = new FontLoader();
    loader.load("./assets/fonts/Exo 2_Regular.json", (font) => {
        const geometry = new TextGeometry(`${score}`, {
            font: font,
            size: 8,
            height: 1.5,
        });
        let textMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        let textMesh = new THREE.Mesh(geometry, textMaterial);
        textMesh.position.set(11, 0, -35);
        scene.add(textMesh);
        text = textMesh;
    });
}
scoreFunc();

function checkEndGame() {
    let head = snake.parts[snake.parts.length - 1];
    snake.parts.forEach((part) => {
        if (head.position.x == part.position.x && head.position.z == part.position.z && part != head) {
            heatGameOver = true;
            return;
        }
    });
}

// function rotateCamera() {
//     camera.position.x = Math.sin(Date.now() * 0.001) * 10;
//     camera.rotateZ(0.001);
//     camera.rotateX(0.001);
//     camera.position.z = Math.cos(Date.now() * 0.001) * 10;
// }

function changeCameraAngle(state) {
    var xStep = 20 / 100;
    var yStep = 100 / 100;
    var zStep = 90 / 100;
    let counter = 0;
    let change = setInterval(() => {
        if (state == "goBack") {
            camera.position.x += xStep;
            camera.position.y += yStep;
            camera.position.z += zStep;
        } else if (state == "goForward") {
            camera.position.x -= xStep;
            camera.position.y -= yStep;
            camera.position.z -= zStep;
        }
        if (counter == 500) {
            clearInterval(change);
        }
        counter += 5;
    }, 5);
}
addEventListener("keydown", (event) => {
    if ((event.key == "w" || event.key == "W") && !snake.down && step) {
        snake.right = false;
        snake.left = false;
        snake.up = true;
        step = false;
    } else if ((event.key == "s" || event.key == "S") && !snake.up && step) {
        snake.right = false;
        snake.left = false;
        snake.down = true;
        step = false;
    }
    if ((event.key == "a" || event.key == "A") && !snake.right && step) {
        snake.up = false;
        snake.down = false;
        snake.left = true;
        step = false;
    }
    if ((event.key == "d" || event.key == "D") && !snake.left && step) {
        snake.up = false;
        snake.down = false;
        snake.right = true;
        step = false;
    }
});

let counter = 0;
let foodEatenCountInState2 = 0;

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    if (!gameOver && !heatGameOver) {
        if (snake.up) {
            camera.position.z -= 1 / 5;
        } else if (snake.down) {
            camera.position.z += 1 / 5;
        } else if (snake.right) {
            camera.position.x += 1 / 5;
        } else {
            camera.position.x -= 1 / 5;
        }
    } else if (gameOver) {
        if (counter % 5 == 0 && snake.parts.length > 0) {
            snake.fall();
        } else {
            if (cameraState == 1) {
                // changeCameraAngle("goBack");
                // cameraState = 2;
            }
            // rotateCamera();
        } 
    }
    if (counter % 5 == 0 && !gameOver && !heatGameOver) {
        step = true;
        let head = snake.parts[snake.parts.length - 1];

        if (head.position.x == food.x && head.position.z == food.z) {
            if (food.foodType == 1) {
                score += 10;
                if (cameraState == 2) {
                    foodEatenCountInState2++;
                    score += 40;
                }
                if (foodEatenCountInState2 == 5) {
                    changeCameraAngle("goForward");
                    cameraState = 1;
                    foodEatenCountInState2 = 0;
                }
            } else if (food.foodType == 2) {
                cameraState = 2;
                changeCameraAngle("goBack");
                score += 100;
            }
            scene.remove(text);
            text = scoreFunc();
            scene.remove(food.foodsphere);
            createFood();
            snake.move(true);
            checkEndGame();
        } else {
            snake.move(false);
            checkEndGame();
        }
    }
    counter++;
}
animate();
