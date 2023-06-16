import {
	Mesh,
	MeshNormalMaterial,
	Plane,
	Ray,
	SphereGeometry,
	Vector3,
} from 'three'
import scene from './Scene'
import grid from './Grid'

export default class Ball extends Mesh {
	constructor(radius) {
		const geometry = new SphereGeometry(radius, 12, 12)
		const material = new MeshNormalMaterial()

		super(geometry, material)

		this.radius = radius
		// this.position.y = this.radius

		this.initVelocity()

		this.scene.add(this)

		const mesh = new Mesh(
			new SphereGeometry(0.5, 10, 10),
			new MeshNormalMaterial()
		)

		mesh.position.copy(this.position)

		this.collisionMesh = mesh
		this.collisionHandler = mesh.clone()

		// scene.add(this.collisionMesh, this.collisionHandler)
	}

	get scene() {
		return scene
	}

	update(dt, handlers) {
		const nVel = this.velocity.clone().normalize()
		const position = this.position.clone()
		// const ray = new Ray(position, nVel)

		const handler = handlers.find((h) => {
			const hSide = Math.sign(h.position.z)
			const bSide = Math.sign(position.z)
			const vDir = Math.sign(this.velocity.z)

			return hSide == bSide && vDir == hSide
		})

		const pointA = this.getWallCollisionPoint()
		const pointB = this.getHandlerCollisionPoint()
		const pointBReal = this.getHandlerCollisionPoint(true)

		if (pointA.length() > pointB.length()) {
			// console.log('collide first with handler')
			if (handler) {
				this.checkHandlerCollision(handler, dt, pointB, pointBReal)
			}
			this.checkBoundaries(this.getNextPosition(dt), dt)
		} else {
			// console.log('collide first with wall')
			this.checkBoundaries(this.getNextPosition(dt), dt)

			if (handler) {
				this.checkHandlerCollision(handler, dt, pointB, pointBReal)
			}
		}

		// this.position.add(this.velocity.clone().multiplyScalar(dt))
	}

	getHandlerCollisionPoint(real = false) {
		const nVel = this.velocity.clone().normalize()
		const position = this.position.clone()
		const ray = new Ray(position, nVel)
		const normal = Math.sign(this.velocity.z)

		const point = new Vector3()

		const offset = real ? 0 : this.radius + 0.25

		ray.intersectPlane(
			new Plane(
				new Vector3(0, 0, normal),
				-grid.resolution.height / 2 + 10 + offset
			),
			point
		)

		if (!real) {
			this.collisionHandler.position.copy(point)
		}

		return point
	}

	getWallCollisionPoint() {
		const nVel = this.velocity.clone().normalize()
		const position = this.position.clone()
		const ray = new Ray(position, nVel)
		const normal = Math.sign(this.velocity.x)

		const point = new Vector3()

		ray.intersectPlane(
			new Plane(
				new Vector3(normal, 0, 0),
				-grid.resolution.width / 2 + this.radius
			),
			point
		)

		this.collisionMesh.position.copy(point)

		return point
	}

	checkHandlerCollision(handler, dt, collision, virtualCollision) {
		const v = this.velocity.clone().multiplyScalar(dt)
		const position1 = this.position.clone()
		const position2 = this.position.clone().add(v)

		if (
			virtualCollision.x <
				handler.position.x - (handler.length + 1 + this.radius) / 2 ||
			virtualCollision.x >
				handler.position.x + (handler.length + 1 + this.radius) / 2 ||
			Math.abs(position2.z) < Math.abs(collision.z) ||
			Math.abs(this.position.z) > Math.abs(collision.z)
		) {
			return
		}

		console.log('collide')

		const velToCollision = collision.clone().sub(this.position)
		const newVel = v.clone().sub(velToCollision)
		newVel.z *= -1

		this.position.copy(collision.clone().add(newVel))

		this.velocity.z *= -1

		const dfc = (-2 * (handler.position.x - collision.x)) / handler.length

		// console.log(dfc)
		if (Math.abs(dfc) > 0.25) {
			this.velocity.x += 20 * dfc
		}

		this.maxSpeed += 0.5

		this.velocity.normalize().multiplyScalar(this.maxSpeed)
		// }
		// }
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
		this.maxSpeed = 30
		this.velocity = new Vector3(Math.random() * 0.3 - 0.15, 0, -5)
			.normalize()
			.multiplyScalar(this.maxSpeed)
	}

	get resolution() {
		return grid.resolution
	}
}
