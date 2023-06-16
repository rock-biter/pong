import './style.css'
import {
	Clock,
	Mesh,
	MeshNormalMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	Vector2,
	Vector3,
	WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import scene from './Scene'
import grid from './Grid'
import Ball from './ball'
import { Handler } from './handler'
import { createNoise2D } from 'simplex-noise'

const noise2D = createNoise2D()

/**
 * Camera
 */

const camera = new PerspectiveCamera(90)
camera.position.set(0, grid.resolution.height / 4, grid.resolution.height / 1.8)

/**
 * Renderer
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
}

const ball = new Ball(0.5)

const renderer = new WebGLRenderer({ antialias: true })
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableRotate = false
controls.enablePan = false
controls.maxDistance = 10 + grid.resolution.height / 2
controls.minDistance = grid.resolution.height / 3

const cursor = new Vector2()
const playerHandler = new Handler({ x: 0, y: grid.resolution.height / 2 - 10 })
const pcHandler = new Handler({ x: 0, y: -grid.resolution.height / 2 + 10 })

onresize()

function onresize() {
	sizes.width = window.innerWidth
	sizes.height = window.innerHeight

	renderer.setSize(sizes.width, sizes.height)
	renderer.setPixelRatio(window.devicePixelRatio)

	camera.aspect = sizes.width / sizes.height
	camera.updateProjectionMatrix()
}

window.addEventListener('resize', onresize)

const clock = new Clock()

function animate() {
	const deltaTime = clock.getDelta() || 0

	controls.update()

	if (ball.position.z <= 10 && ball.velocity.z < 0) {
		pcHandler.update(
			ball.position.x / (grid.resolution.width / 2) +
				noise2D(playerHandler.position.x / 10, 0.1) * 0.1,
			0.4
		)
	}

	playerHandler.update(cursor.x)

	ball.update(deltaTime, [pcHandler, playerHandler])

	renderer.render(scene, camera)
}

renderer.setAnimationLoop(animate)
// setInterval(animate, 100)

window.addEventListener('mousemove', (event) => {
	cursor.x =
		(event.clientX - window.innerWidth / 2) /
		Math.min(window.innerWidth * 0.9, 750)
	cursor.y = 2 * (event.clientY / window.innerHeight) - 1

	// console.log(cursor.x)
})

// window.addEventListener('click', animate)

// animate()
