import Shapes from '@/shape.js';

const padding = 5.0;

function layout(id, ref, label, childShapes, style) {
    const innerWidth = childShapes.reduce((w, c) => Math.max(w, c.box.w), 0);
    const childWidth = (ref['__meta'].viewbox?.w ?? innerWidth);
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

  export default { layout }