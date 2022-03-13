import Shapes from '@/shape.js';

const padding = 5.0;

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
  
  function layout(id, ref, label, childShapes, style) {
    const viewbox = ref['__meta'].viewbox ?? {
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

  export default { layout }