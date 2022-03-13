import Graph from "./graph";

const Box = function (x, y, w, h) { return { x, y, w, h }; }

function intersection(b1, b2) {
    var x_overlap = Math.max(0, Math.min(b1.x + b1.w, b2.x + b2.w) - Math.max(b1.x, b2.x));
    var y_overlap = Math.max(0, Math.min(b1.y + b1.h, b2.y + b2.h) - Math.max(b1.y, b2.y));
    return x_overlap * y_overlap;
}

class Label {
    constructor(text, size, scale) {
        this.text = text;
        this.size = size;
        this.scale = scale;
        this.padding = 5;
    }

    get bottom() {
        return this.box.h + this.box.y;
    }

    get box() {
        return Box(this.padding, this.padding, this.size.w * this.scale + this.padding, this.size.h * this.scale + this.padding);
    }

    get baseline() {
        return this.box.h * 0.8;
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
        const { x, y, w, h } = this.box;
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

    return (box) => Box(ox + scale * box.x,
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
    let closest = { distance: Number.MAX_VALUE };
    for (const p1 of truePorts(shapes, idA)) {
        for (const p2 of truePorts(shapes, idB)) {
            const distance = sq(p1.x - p2.x) + sq(p1.y - p2.y);
            if (distance < closest.distance)
                closest = { p1, p2, distance }
        }
    }

    return closest;
}

export default { Shape, Label, Children, Box, intersection, trueBoundingBox, closestPorts };