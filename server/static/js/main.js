function setupFocus(paper) {
    function focusOnModel(paper, panAndZoom, model) {
        // We want our element to take up 80% of the vertical space
        // but no more than 50% of the horizontal space
        let elementPosition = model.attributes.position;
        let elementSize = model.attributes.size;
        let pzSizes = panAndZoom.getSizes();
        let viewBox = pzSizes.viewBox;
        var desiredZoom = Math.min(
            (viewBox.width / elementSize.width) * 0.5,
            (viewBox.height / elementSize.height) * 0.8
        );

        panAndZoom.pan({x: 0, y: 0});

        var ox = elementPosition.x + elementSize.width / 2;
        var oy = elementPosition.y + elementSize.height / 2;
        
        var z = pzSizes.realZoom;
        var dx = -ox*z + pzSizes.width / 2; // + z*viewBox.x;
        var dy = -oy*z + pzSizes.height / 2; // + z*viewBox.y;
        
        panAndZoom.pan({x: dx, y: dy});
        panAndZoom.zoom(desiredZoom);
    }

    paper.on('element:pointerdblclick', function(elementView) {
        focusOnModel(elementView.paper, panAndZoom, elementView.model);
    });
}

function setupPanAndZoom(paper, targetElement) {
    panAndZoom = svgPanZoom(targetElement, 
    {
        viewportSelector: $(targetElement).children('.joint-layers')[0],
        fit: true,
        zoomScaleSensitivity: 0.4,
        panEnabled: false,
        dblClickZoomEnabled: false,
    });

    //Enable pan when a blank area is click (held) on
    paper.on('blank:pointerdown', function (evt, x, y) {
        panAndZoom.enablePan();
        //console.log(x + ' ' + y);
    });

    //Disable pan when the mouse button is released
    paper.on('cell:pointerup blank:pointerup', function(cellView, event) {
        panAndZoom.disablePan();
    });
}

function get_position(tableName) {
    return {x: Math.random() * 500, y: Math.random() * 500};
}

function asUml(name, table) {
    let attrs = [];
    for (const columnName in table.columns) {
        let column = table.columns[columnName];
        attrs.push(`${column.type.name}: ${columnName}`);
    }

    return new joint.shapes.uml.Class({
        position: get_position(name),
        size: { width: 240, height: 100 },
        name: name,
        attributes: attrs,
    });
}

function findLinks(reference_data) {
    var links = []
    for (const tableName in reference_data.tables) {
        let table = reference_data.tables[tableName];
        for (const columnName in table.columns) {
            var type = table.columns[columnName].type;
            if (type.name === "link") {
                links.push({from: tableName, to: type.to});
            }
        }
    }

    return links;
}

function buildGraph(graph, reference_data) {
    var classes = {};
    for (const tableName in reference_data.tables) {
        classes[tableName] = asUml(tableName, reference_data.tables[tableName]);
        graph.addCell(classes[tableName]);
    }

    var relations = findLinks(reference_data).map(l => 
        new joint.shapes.uml.Generalization({ 
            source: { id: classes[l.from].id },
            target: { id: classes[l.to].id },
        })
    );

    relations.forEach(r => graph.addCell(r));
}

$(function() {

    var graph = window.graph = new joint.dia.Graph();
    var canvas = $('#canvas');
    var paper = new joint.dia.Paper({
        el: canvas,
        width: $(window).width(),
        height: $(window).height(),
        model: graph,
        gridSize: 1
    });

    buildGraph(graph, get_reference());

    paper.setDimensions($(window).width()-20, $(window).height()-20);
    $(window).resize(function() {
        paper.setDimensions($(window).width()-20, $(window).height()-20);
        panAndZoom.resize();
    });

    setupPanAndZoom(paper, canvas.children('svg')[0]);
    setupFocus(paper);
})