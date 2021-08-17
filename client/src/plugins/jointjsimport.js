import 'jointjs/dist/joint.core.css';

import { dia } from 'jointjs/src/core.mjs';
import * as standard from 'jointjs/src/shapes/standard.mjs';
import * as uml from 'jointjs/src/shapes/uml.mjs'
import * as basic from 'jointjs/src/shapes/basic.mjs'

export default {
	install: function (app) {
		let joint = { dia };
		joint.shapes = { standard , uml, basic };
		app.config.globalProperties.$joint = joint;
	}
};