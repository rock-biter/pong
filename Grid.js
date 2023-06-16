import { Mesh, MeshNormalMaterial, PlaneGeometry } from 'three'
import scene from './Scene'

/**
 * Scene singleton class
 */
class Grid extends Mesh {
	static el

	constructor(resolution) {
		if (Grid.el) {
			return Grid.el
		}

		const { width, height } = resolution
		const geometry = new PlaneGeometry(width, height, width, height)
		geometry.rotateX(Math.PI * 0.5)
		const material = new MeshNormalMaterial({ wireframe: true })

		super(geometry, material)

		this.resolution = resolution
		scene.add(this)

		const leftSide = new Mesh(geometry, material.clone())
		leftSide.scale.x = 1000
		const rightSide = leftSide.clone()
		leftSide.rotateZ(Math.PI * 0.5)
		rightSide.rotateZ(Math.PI * -0.5)
		leftSide.position.x = this.resolution.width / 2
		rightSide.position.x = -this.resolution.width / 2

		this.material.transparent = true
		this.material.opacity = 0

		scene.add(leftSide, rightSide)

		Grid.el = this
	}
}

/**
 * Resolution
 */
const res = {
	width: 30,
	height: 60,
}

export default new Grid(res)
