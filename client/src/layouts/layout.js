import Shapes from '@/shape.js';
import Measure from '@/measure.js';
import Graph from '@/graph.js';
import randomxy from './randomxy';
import forceDirected from './forceDirected';
import stack from './stack';

const metaKey = '__meta';
const style = {
  fill: '#BBBBFF',
  stroke: '#625ad8',
  strokeWidth: 1,
  fillOpacity: 0.5,
};

function toLabel(text, viewport) {
  const size = Measure.text(text);
  const scale = (viewport && viewport.w < size.w) ? viewport.w / size.w : 1;

  return new Shapes.Label(text, size, scale);
}

var layouts = { stack: stack.layout, randomxy: randomxy.layout, springy: forceDirected.layout };
function shapes(id, ref) {
  const meta = ref[metaKey];
  const childShapes = [];
  for (var key in ref) {
    if (key == metaKey)
      continue;

    childShapes.push(shapes(Graph.join(id, key), ref[key]));
  }

  const label = toLabel(meta?.caption ?? Graph.leafName(id), meta?.viewport);
  if (childShapes.length == 0) {
    const {x, y, w, h} = label.box;

    return new Shapes.Shape(id, label, Shapes.Box(0, 0, w + x, y + h), new Shapes.Children([], Shapes.Box(0,0,0,0), 1), style);
  }

  return layouts[meta.layout ?? "randomxy"](id, ref, label, childShapes, style);
}

export default { shapes }