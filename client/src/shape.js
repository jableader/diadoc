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
      this.allowedPorts = ['top', 'bottom', 'left', 'right'];
    }

    get ports() {
        const {x, y, w, h} = this.box;
        const xMid = x + w / 2;
        const yMid = y + h / 2;

        return this.allowedPorts.map(function (type) {
            switch (type) {
                case 'top': return { 'x': xMid, 'y': y };
                case 'bottom': return { 'x': xMid, 'y': y + h };
                case 'left': return { 'x': x, 'y': yMid };
                case 'right': return { 'x': x + w, 'y': yMid };
            }
        });
    }
}

export default { Shape, Label, Children, Box };