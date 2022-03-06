import Shapes from '@/shape.js';
import Measure from '@/measure.js';
import Graph from '@/graph.js'

const metaKey = '__meta';
const padding = 5;

function randomxy(id, ref, label, children) {
  const viewbox = ref[metaKey].viewbox ?? {
    w: children.reduce((w, c) => w + c.box.w, 0) + padding * children.length,
    h: children.reduce((h, c) => h + c.box.h, 0) + padding * children.length
  }

  for (const c of children) {
    c.box.x = Math.random() * (viewbox.w - c.box.w);
    c.box.y = Math.random() * (viewbox.h - c.box.h);
  }

  return new Shapes.Shape(id, label, Shapes.Box(0, 0, viewbox.w, viewbox.h), children, ref[metaKey].style);
}

function stack(id, ref, label, children) {
  const shapeWidth = children.reduce((w, c) => Math.max(w, c.box.w), 0);

  let lastY = 0;
  for (const c of children) {
    c.box.x = 0;
    c.box.y = lastY;
    c.box.w = shapeWidth;
    lastY += c.box.h;
  }

  return new Shapes.Shape(id, label, Shapes.Box(0, 0, Math.max(shapeWidth, label.box.w), label.box.h + lastY), children, ref[metaKey].style);
}

function toLabel(text, viewport) {
  const size = Measure.text(text);
  const scale = (viewport && viewport.w < size.w) ? viewport.w / size.w : 1;

  return new Shapes.Label(text, size, scale);
}

var layouts = { stack, randomxy };
function shapes(id, ref) {
  let meta = ref[metaKey];
  let children = [];
  for (var key in ref) {
    if (key == metaKey)
      continue;

    children.push(shapes(Graph.join(id, key), ref[key]));
  }

  const label = toLabel(meta.caption, meta.viewport);
  if (children.length == 0)
    return new Shapes.Shape(id, label, label.box, children, ref.style);

  return layouts[meta.layout](id, ref, label, children);
}

export default { shapes }