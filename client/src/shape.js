import { setTransitionHooks } from "vue";

const Box = function(x, y, w, h) { return {x,y,w,h}; }

class Label {
    constructor(text, size, scale) {
        this.text = text;
        this.size = size;
        this.scale = scale;
    }

    get bottom() {
        return this.size.h * this.scale;
    }

    get box() {
        return Box(0, 0, this.size.w, this.bottom)
    }

    get baseline() {
        return this.bottom * 0.8
    }
}

class Children {
    constructor(shapes, box, scale) {
        this.shapes = shapes;
        this.box = box;
        this.scale = scale;
    }

    get length() {
        return this.shapes.length;
    }

    [Symbol.iterator]() {
        return this.shapes[Symbol.iterator]();
    }
}

class Shape {
    constructor(id, label, box, children, style) {
      this.id = id;
      this.label = label;
      this.style = style;
      this.box = box;
      
      this.children = children;
    }
}

export default { Shape, Label, Children, Box };