import {
	BoxGeometry,
	CapsuleGeometry,
	MathUtils,
	Mesh,
	MeshNormalMaterial,
	Vector2,
	Vector3,
} from 'three'
import scene from './Scene'
import grid from './Grid'

export class Handler extends Mesh {
	constructor(position = new Vector2()) {
		const length = 5
		const geometry = new CapsuleGeometry(0.25, length, 10, 15, 2, 2)
		geometry.rotateZ(Math.PI * 0.5)
		const material = new MeshNormalMaterial()

		super(geometry, material)

		const { x, y } = position
		this.position.set(x, 0.5, y)

		this.length = length
		this.depth = 0.25

		scene.add(this)

		this.geometry.computeBoundingBox()
	}

	update(cursorX, factor = 0.3) {
		const x =
			(MathUtils.clamp(cursorX * 2, -1, 1) *
				(grid.resolution.width - this.length - 1)) /
			2

		this.position.x = MathUtils.lerp(this.position.x, x, factor)
	}

	setPosition(x, factor) {
		const limit = grid.resolution.width / 2 - (this.length + 1) / 2
		this.position.x = MathUtils.lerp(
			this.position.x,
			MathUtils.clamp(x, -limit, limit),
			factor
		)
	}

	isInside(pos = new Vector3(), radius = 0.5) {
		const d = this.position.clone().sub(pos)
		const absDx = Math.abs(d.x) - radius
		const absDz = Math.abs(d.z)

		if (absDx < this.length / 2 && absDz < this.depth) {
			// is inside the central part of the handler
			console.log('inside center', absDx, absDz)
			return true
		}

		const pz = (absDx - this.length / 2) / this.depth

		if (Math.abs(pz) > 1) {
			return false
		}

		const angle = Math.acos((absDx - this.length / 2) / this.depth)
		const z = this.depth * Math.sin(angle)

		if (
			absDx > this.length / 2 &&
			absDx < this.length / 2 + this.depth &&
			absDz < Math.abs(z)
		) {
			// in inside of the rounded head
			console.log('inside head', absDx, absDz)

			console.log('outside')
			console.log('DZ:', absDz)
			console.log('z:', Math.abs(z), (absDx - this.length / 2) / this.depth)
			console.log('DX:', absDx)
			return true
		}

		return false
	}
}
