import Shapes from '@/shape.js';
import Graph from '@/graph.js';
import Springy from 'springy';

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

function layout(id, ref, label, childShapes, style) {
    const maxOf = (f) => childShapes.reduce((a, c) => Math.max(a, f(c)), 0);
  
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
  
    const largestDim = maxOf(c => Math.max(c.box.h, c.box.w));
    var layout = new Springy.Layout.ForceDirected(g, largestDim, largestDim*10, 0.5);
    runGraphLayout(layout, id, g);
  
    const points = childShapes.reduce((p, s) => ({ ...p, [s.id.path]: translateToMidpoint(layout, nodes, s)}), {});
    const translateX = Object.entries(points).reduce((a, [k, v]) => Math.min(a, v.x), Number.MAX_VALUE);
    const translateY = Object.entries(points).reduce((a, [k, v]) => Math.min(a, v.y), Number.MAX_VALUE);
    
    for (const s of childShapes) {
      const { x, y } = points[s.id.path];
      s.box.x = (x - translateX);
      s.box.y = (y - translateY);
    }
  
    const yMax = maxOf(c => c.box.y + c.box.h);
    const xMax = maxOf(c => c.box.x + c.box.w);
  
    const padding = 5;
    const children = new Shapes.Children(childShapes, Shapes.Box(padding, label.bottom + padding, xMax + 2 * padding, yMax + 2 * padding), 1);
    const shapeBox = Shapes.Box(
      0, 0,
      Math.max(label.box.w + label.box.x, children.box.w),
      label.bottom + children.box.h
    );
  
    return new Shapes.Shape(id, label, shapeBox, children, style);
  }

  export default { layout }