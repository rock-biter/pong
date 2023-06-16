import { Scene as THREEScene } from 'three'

/**
 * Scene singleton class
 */
class Scene extends THREEScene {
	static el

	constructor() {
		if (Scene.el) {
			return Scene.el
		}

		super()
		Scene.el = this
	}
}

export default new Scene()
