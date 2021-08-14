import 'jointjs/dist/joint.core.css';

import { dia } from 'jointjs/src/core.mjs';
import * as standard from 'jointjs/src/shapes/standard.mjs';
import * as uml from 'jointjs/src/shapes/uml.mjs'

export default {
	install: function (app) {
		let joint = { dia };
		joint.shapes = { standard , uml };
		app.config.globalProperties.$joint = joint;
	}
};