import Shapes from '@/shape.js';
import Measure from '@/measure.js';
import Graph from '@/graph.js';
import Springy from '@/lib/springy.js';

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

function realTranslator(roots) {
  let scale = 1, ox = 0, oy = 0;

  for (const parent of roots) {
    ox += scale * (parent.box.x + parent.children.box.x);
    oy += scale * (parent.box.y + parent.children.box.y);
    scale *= parent.children.scale;
  }

  return (box) => Shapes.Box(ox + scale * box.x,
    oy + scale * box.y,
    scale * box.w,
    scale * box.h
  );
}

function trueBoundingBox(shapes, id) {
  const roots = getRootShapes(shapes, id);
  const shape = roots.pop();

  return realTranslator(roots)(shape.box);
}

function truePorts(shapes, id) {
  const roots = getRootShapes(shapes, id);
  const shape = roots.pop();

  return shape.ports.map(realTranslator(roots));
}

function closestPorts(shapes, idA, idB) {
  const sq = (x) => x * x;

  // Closest by euclids
  let closest = {distance: Number.MAX_VALUE};
  for (const p1 of truePorts(shapes, idA)) {
    for (const p2 of truePorts(shapes, idB)) {
      const distance = sq(p1.x - p2.x) + sq(p1.y - p2.y);
      if (distance < closest.distance)
        closest = {p1, p2, distance}
    }
  }

  return closest;
}

function randomCoord(viewbox, occupied, c) {
  const totalIntersection = (box) => occupied.reduce((s, b) => s + Shapes.intersection(b, box), 0);
  const b = { ...c.box };

  let lowest = { 'i': Number.MAX_VALUE, 'b': b };
  for (let attempts = 20; attempts > 0 && lowest.i > 0; attempts--)
  {
    b.x = Math.random() * (viewbox.w - b.w);
    b.y = Math.random() * (viewbox.h - b.h);

    const i = totalIntersection(b);
    if (i < lowest.i)
      lowest = {i, b: { ...b }};
  }

  return lowest.b;
}

function randomxy(id, ref, label, childShapes) {
  const viewbox = ref[metaKey].viewbox ?? {
    w: childShapes.reduce((w, c) => w + c.box.w, 0) + padding * childShapes.length,
    h: childShapes.reduce((h, c) => h + c.box.h, 0) + padding * childShapes.length
  }

  const biggestFirst = [...childShapes].sort((c1, c2) => c2.box.w * c2.box.h - c1.box.w * c1.box.h);
  const occupied = [];
  for (const c of biggestFirst) {
    const b = randomCoord(viewbox, occupied, c);
    
    c.box.x = b.x;
    c.box.y = b.y;

    occupied.push(b);
  }

  const children = new Shapes.Children(childShapes, Shapes.Box(0, label.bottom, viewbox.w, viewbox.h), 1);
  return new Shapes.Shape(id, label, Shapes.Box(0, 0, viewbox.w, children.box.h + label.bottom), children, style);
}

function getChildLinksFlattened(parent, ref) { // Returns all links of children, truncated to children of id
  let links = {};
  Graph.walk(ref, (id, n) => {
    const linkIds = n['__meta']?.links?.map(l => Graph.idForPath(l.to)) ?? [];
    for (const l of linkIds) {
      if (Graph.isChildOf(parent, l)) {
        const newEdge = {
          from: Graph.asChildOf(parent, id),
          to: Graph.asChildOf(parent, l)
        }

        links[newEdge.from.path + '|' + newEdge.to.path] = newEdge;
      }
    }

    return true;
  }, parent);

  return Object.values(links);
}

function runGraphLayout(layout, id) {
  var energy = 9999;
  var i;
  for (i = 0; i < 1000 && energy > 0.01; i++) {
    layout.tick(0.03);
    energy = layout.totalEnergy();
  }
  console.log(id, i);
}

function translateToMidpoint(layout, nodes, shape) {
  var {x, y} = layout.point(nodes[shape.id.path]).p;
  var {w, h} = shape.box;
  return { 'x': x*20 + w / 2, 'y': y*20 + h / 2 };
}

function springy(id, ref, label, childShapes) {
  const edges = getChildLinksFlattened(id, ref);

  const g = new Springy.Graph();
  const nodes = {};
  const shapes = {};
  for (const s of childShapes) {
    nodes[s.id.path] = g.newNode();
    shapes[s.id.path] = s;
  }

  for (const e of edges) {
    g.newEdge(nodes[e.from.path], nodes[e.to.path]);
  }

  var layout = new Springy.Layout.ForceDirected(g, 650.0, 10000.0, 0.5);
  runGraphLayout(layout, id, g);

  const points = childShapes.reduce((p, s) => ({ ...p, [s.id.path]: translateToMidpoint(layout, nodes, s)}), {});
  const translateX = Object.entries(points).reduce((a, [k, v]) => Math.min(a, v.x), Number.MAX_VALUE);
  const translateY = Object.entries(points).reduce((a, [k, v]) => Math.min(a, v.y), Number.MAX_VALUE);
  
  for (const s of childShapes) {
    const { x, y } = points[s.id.path];
    s.box.x = (x - translateX) - s.box.w/2;
    s.box.y = (y - translateY) - s.box.h/2;
  }

  const maxOf = (f) => childShapes.reduce((a, c) => Math.max(a, f(c)), 0);
  const minOf = (f) => childShapes.reduce((a, c) => Math.min(a, f(c)), Number.MAX_VALUE)

  const yMax = maxOf(c => c.box.y + c.box.h);
  const xMax = maxOf(c => c.box.x + c.box.w);

  const children = new Shapes.Children(childShapes, Shapes.Box(5, label.bottom, xMax, yMax), 1);
  const shapeBox = Shapes.Box(
    0, 0,
    Math.max(label.box.w + label.box.x, children.box.w),
    label.bottom + children.box.h
  );

  return new Shapes.Shape(id, label, shapeBox, children, style);
}

function stack(id, ref, label, childShapes) {
  const innerWidth = childShapes.reduce((w, c) => Math.max(w, c.box.w), 0);
  const childWidth = (ref[metaKey].viewbox?.w ?? innerWidth);
  const scale = childWidth / innerWidth;
  
  let lastY = 0;
  for (const c of childShapes) {
    c.allowedPorts = ['left', 'right'];

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
    label.bottom + childBox.h + padding,
  );

  const children = new Shapes.Children(childShapes, childBox, scale);
  return new Shapes.Shape(id, label, shapeBox, children, style);
}

function toLabel(text, viewport) {
  const size = Measure.text(text);
  const scale = (viewport && viewport.w < size.w) ? viewport.w / size.w : 1;

  return new Shapes.Label(text, size, scale);
}

var layouts = { stack, randomxy, springy };
function shapes(id, ref) {
  const meta = ref[metaKey];
  const childShapes = [];
  for (var key in ref) {
    if (key == metaKey)
      continue;

    childShapes.push(shapes(Graph.join(id, key), ref[key]));
  }

  const label = toLabel(meta?.caption ?? Graph.friendlyId(id), meta?.viewport);
  if (childShapes.length == 0) {
    const {x, y, w, h} = label.box;

    return new Shapes.Shape(id, label, Shapes.Box(0, 0, w + x, y + h), new Shapes.Children([], Shapes.Box(0,0,0,0), 1), style);
  }

  return layouts[meta.layout ?? "springy"](id, ref, label, childShapes);
}

export default { shapes, trueBoundingBox, closestPorts }