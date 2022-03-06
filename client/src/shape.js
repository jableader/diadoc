const style = {
    fill: '#BBBBFF',
    stroke: '#625ad8',
    strokeWidth: 1,
    fillOpacity: 0.5,
}

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
}

class Shape {
    constructor(id, label, box, children, _style) {
      this.id = id;
      this.label = label;
      this.style = style;
      this.box = box;
      
      this.children = children;
    }
}

export default { Shape, Label, Box };