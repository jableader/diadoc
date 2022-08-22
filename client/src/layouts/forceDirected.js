import Shape from '@/shape.js';
import Graph from '@/graph.js';
import Springy, { Vector } from 'springy';

const maxOf = (l, f) => l.reduce((a, c) => Math.max(a, f(c)), 0);

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

function boxOf(node, point) {
  return { ...node.data.shape.box, x: point.p.x, y: point.p.y };
}

function mid(box) {
  return new Springy.Vector(box.x + box.w / 2, box.y + box.h / 2);
}

function repulseOverlappingBoxes() {
  this.eachNode(function(n1, p1) {
    const b1 = boxOf(n1, p1);
    this.eachNode(function (n2, p2) {
      if (n1 == n2)
        return;

      const b2 = boxOf(n2, p2);
      const intersection = Shape.intersection(b1, b2);
      if (intersection > 0) {
        const m1 = mid(b1);
        const m2 = mid(b2);
        
        let delta = m1.subtract(m2);
        if (delta.x == 0 && delta.y == 0) {
          delta = new Vector(1, 0);
        }
        
        let direction = delta.normalise();
        let weight = new Vector(direction.x * b1.w, direction.y * b1.h);
        let force = weight.multiply(this.repulsion);

        p1.applyForce(force);
        p2.applyForce(force.multiply(-1));
      }
    });
  });
}

function runGraphLayout(layout, id) {
  const limit = 100;
  for (var i = 0, energy = 9999; i < limit && energy > 0.01; i++) {
    layout.tick(0.03);
    energy = layout.totalEnergy();
    if (energy < 1 || i > 0.5 * limit)
      layout.repulseOverlappingBoxes = repulseOverlappingBoxes;
  }
  console.log(id, i);
}

function getSpringyLayout(g) {
  const boxes = g.nodes.map(n => n.data.shape.box);
  const yTop = boxes.reduce((s, b) => s + b.h, 0);
  const xTop = boxes.reduce((s, b) => s + b.w, 0);
  const largestDim = boxes.reduce((m, b) => Math.max(m, b.w, b.h), 0);

  const layout = new Springy.Layout.ForceDirected(g, 0, largestDim, 0.1, 0, 10 * largestDim);
  for (const n of g.nodes) {
    const p = new Springy.Vector(Math.random() * xTop, Math.random() * yTop);
    layout.nodePoints[n.id] = new Springy.Layout.ForceDirected.Point(p, 1);
  }

  const originalTick = layout.tick;
  layout.tick = function(ts) {
    if (this.repulseOverlappingBoxes) {
      this.repulseOverlappingBoxes.call(layout, ts);
    }
    originalTick.call(layout, ts);
  }

  return layout;
}

function layout(id, ref, label, childShapes, style) {
    const edges = getChildLinksFlattened(id, ref);
  
    const g = new Springy.Graph();
    const nodes = {};
    const shapes = {};
    for (const s of childShapes) {
      nodes[s.id.path] = g.newNode({ shape: s });
      shapes[s.id.path] = s;
    }
  
    for (const e of edges) {
      g.newEdge(nodes[e.from.path], nodes[e.to.path]);
    }
  
    var layout = getSpringyLayout(g);
    runGraphLayout(layout, id, g);

    var bbox = layout.getBoundingBox();
    const translateX = bbox.bottomleft.x;
    const translateY = bbox.bottomleft.y;

    layout.eachNode(function(n, p) {
      n.data.shape.box.x = p.p.x - translateX;
      n.data.shape.box.y = p.p.y - translateY;
    });
    
    const yMax = maxOf(childShapes, c => c.box.y + c.box.h);
    const xMax = maxOf(childShapes, c => c.box.x + c.box.w);
  
    const padding = 5;
    const children = new Shape.Children(childShapes, Shape.Box(padding, label.bottom + padding, xMax + 2 * padding, yMax + 2 * padding), 1);
    const shapeBox = Shape.Box(
      0, 0,
      Math.max(label.box.w + label.box.x, children.box.w),
      label.bottom + children.box.h
    );
  
    return new Shape.Shape(id, label, shapeBox, children, style);
  }

  export default { layout }