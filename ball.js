import { Mesh, MeshNormalMaterial, SphereGeometry, Vector3 } from 'three'
import scene from './Scene'
import grid from './Grid'

export default class Ball extends Mesh {
	constructor(radius) {
		const geometry = new SphereGeometry(radius, 12, 12)
		const material = new MeshNormalMaterial()

		super(geometry, material)

		this.radius = radius
		this.position.y = this.radius

		this.maxSpeed = 30

		this.initVelocity()

		this.scene.add(this)
	}

	get scene() {
		return scene
	}

	update(dt, handlers) {
		this.checkBoundaries(this.getNextPosition(dt), dt)

		const handler = handlers.find((h) => {
			const hSide = Math.sign(h.position.z)
			const bSide = Math.sign(this.position.z)
			const vDir = Math.sign(this.velocity.z)

			return hSide == bSide && vDir == hSide
		})

		if (handler) {
			this.checkHandlerCollision(handler, dt)
		}

		// this.position.add(this.velocity.clone().multiplyScalar(dt))
	}

	checkHandlerCollision(handler, dt) {
		const v = this.velocity.clone().multiplyScalar(dt)
		const diff =
			Math.abs(handler.position.z) -
			handler.depth / 2 -
			this.radius -
			Math.abs(this.position.z)

		// console.log(diff)

		if (diff <= 0 && Math.abs(diff) <= Math.abs(v.z)) {
			const pct = diff / v.z
			const hDirection = Math.sign(v.x)

			const collision = new Vector3()
				.copy(this.position)
				.sub(new Vector3(-hDirection * v.x * pct, 0, -diff))

			console.log(collision, hDirection, v.x, pct)

			// const mesh = new Mesh(
			// 	new SphereGeometry(0.1, 5, 5),
			// 	new MeshNormalMaterial()
			// )
			// scene.add(mesh)
			// mesh.position.copy(collision)

			if (
				collision.x > handler.position.x - (handler.length + 1) / 2 &&
				collision.x < handler.position.x + (handler.length + 1) / 2
			) {
				this.position.z -= Math.sign(this.velocity.z) * diff
				this.velocity.z *= -1
			}

			const dfc = (-2 * (handler.position.x - collision.x)) / handler.length

			console.log(dfc)
			if (Math.abs(dfc) > 0.25) {
				this.velocity.x += 20 * dfc
			}

			this.maxSpeed += 0.5

			this.velocity.normalize().multiplyScalar(this.maxSpeed)
		}
	}

	checkBoundaries(position, dt) {
		this.position.z += this.velocity.z * dt
		this.position.x += this.velocity.x * dt

		const { width, height } = this.resolution

		let hDiff = width / 2 - (Math.abs(position.x) + this.radius)
		// console.log(hDiff)
		if (hDiff <= 0) {
			this.velocity.x *= -1
			this.position.x = this.position.x + Math.sign(this.position.x) * 2 * hDiff
		}

		let vDiff = height / 2 - (Math.abs(position.z) + this.radius)

		// console.log(vDiff)

		if (vDiff <= 0) {
			this.position.x = 0
			this.position.z = 0
			this.initVelocity()
		}
	}

	getNextPosition(dt) {
		return this.position.clone().add(this.velocity.clone().multiplyScalar(dt))
	}

	initVelocity() {
		this.maxSpeed = 20
		this.velocity = new Vector3(Math.random() * 0.3 - 0.15, 0, -5)
			.normalize()
			.multiplyScalar(this.maxSpeed)
	}

	get resolution() {
		return grid.resolution
	}
}
