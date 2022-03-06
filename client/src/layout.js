import Shapes from '@/shape.js';
import Measure from '@/measure.js';
import Graph from '@/graph.js'

const metaKey = '__meta';
const padding = 5.0;
const style = {
  fill: '#BBBBFF',
  stroke: '#625ad8',
  strokeWidth: 1,
  fillOpacity: 0.5,
};

function findChild(shapes, id) {
  for (const s of shapes) {
    if (Graph.eq(s.id, id))
      return s;
  }

  throw `${Graph.friendlyId(id)} not found.`;
}

function getRootShapes(shapes, id) {
  const parents = [];
  for (const subId of Graph.roots(id)) {
    const child = findChild(shapes, subId);
    parents.push(child);

    shapes = child.children;
  }

  return parents;
}

function trueBoundingBox(shapes, id) {
  let scale = 1, ox = 0, oy = 0;
  const roots = getRootShapes(shapes, id);
  const shape = roots.pop();

  for (const parent of roots) {
    ox += scale * (parent.box.x + parent.children.box.x);
    oy += scale * (parent.box.y + parent.children.box.y);
    scale *= parent.children.scale;
  }

  return Shapes.Box(ox + scale * shape.box.x,
      oy + scale * shape.box.y,
      scale * shape.box.w,
      scale * shape.box.h
    );
}

function randomxy(id, ref, label, childShapes) {
  const viewbox = ref[metaKey].viewbox ?? {
    w: childShapes.reduce((w, c) => w + c.box.w, 0) + padding * childShapes.length,
    h: childShapes.reduce((h, c) => h + c.box.h, 0) + padding * childShapes.length
  }

  for (const c of childShapes) {
    c.box.x = Math.random() * (viewbox.w - c.box.w);
    c.box.y = Math.random() * (viewbox.h - c.box.h);
  }

  const children = new Shapes.Children(childShapes, Shapes.Box(0, label.bottom, viewbox.w, viewbox.h), 1);
  return new Shapes.Shape(id, label, Shapes.Box(0, 0, viewbox.w, viewbox.h), children, style);
}

function stack(id, ref, label, childShapes) {
  const innerWidth = childShapes.reduce((w, c) => Math.max(w, c.box.w), 0);
  const childWidth = (ref[metaKey].viewbox?.w ?? innerWidth);
  const scale = childWidth / innerWidth;
  
  let lastY = 0;
  for (const c of childShapes) {
    c.box.x = 0;
    c.box.y = lastY;
    c.box.w = innerWidth;
    lastY += c.box.h;
  }

  const childBox = Shapes.Box(
    padding,
    label.bottom,
    childWidth,
    lastY * scale
  );

  const shapeBox = Shapes.Box(0, 0,
    Math.max(label.box.w, childBox.w + 2 * padding),
    label.box.h + childBox.h + padding,
  );

  const children = new Shapes.Children(childShapes, childBox, scale);
  return new Shapes.Shape(id, label, shapeBox, children, style);
}

function toLabel(text, viewport) {
  const size = Measure.text(text);
  const scale = (viewport && viewport.w < size.w) ? viewport.w / size.w : 1;

  return new Shapes.Label(text, size, scale);
}

var layouts = { stack, randomxy };
function shapes(id, ref) {
  const meta = ref[metaKey];
  const childShapes = [];
  for (var key in ref) {
    if (key == metaKey)
      continue;

    childShapes.push(shapes(Graph.join(id, key), ref[key]));
  }

  const label = toLabel(meta.caption, meta.viewport);
  if (childShapes.length == 0)
    return new Shapes.Shape(id, label, label.box, new Shapes.Children([], Shapes.Box(0,0,0,0), 1), style);

  return layouts[meta.layout](id, ref, label, childShapes);
}

export default { shapes, trueBoundingBox }