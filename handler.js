import {
	BoxGeometry,
	CapsuleGeometry,
	MathUtils,
	Mesh,
	MeshNormalMaterial,
	Vector2,
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
	}

	update(cursorX, factor = 0.3) {
		const x =
			(MathUtils.clamp(cursorX * 2, -1, 1) *
				(grid.resolution.width - this.length - 1)) /
			2

		this.position.x = MathUtils.lerp(this.position.x, x, factor)
	}
}
