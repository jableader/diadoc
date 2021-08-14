<template>
	<div ref="joint"></div>
</template>

<script>
import svgPanZoom from 'svg-pan-zoom'
import $ from 'jquery'

function setupPanAndZoom(paper, targetElement) {
    const viewport = $(targetElement).children('.joint-layers')[0];
    const panAndZoom = svgPanZoom(targetElement, 
    {
        viewportSelector: viewport,
        fit: true,
        zoomScaleSensitivity: 0.4,
        panEnabled: false,
        dblClickZoomEnabled: false,
    });

    //Enable pan when a blank area is click (held) on
    paper.on('blank:pointerdown', function () {
        panAndZoom.enablePan();
    });

    //Disable pan when the mouse button is released
    paper.on('cell:pointerup blank:pointerup', function() {
        panAndZoom.disablePan();
    });

    return panAndZoom;
}

function centerElement(model, panAndZoom){
    // We want our element to take up 80% of the vertical space
    // but no more than 50% of the horizontal space
    let elementPosition = model.attributes.position;
    let elementSize = model.attributes.size;
    let pzSizes = panAndZoom.getSizes();
    var desiredZoom = Math.min(
        (pzSizes.width / elementSize.width) * 0.5,
        (pzSizes.height / elementSize.height) * 0.8
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

export default {
	name: 'JointPaper',
	props: {
		width: {
			type: [String, Number],
			default: 800
		},
		height: {
			type: [String, Number],
			default: 600
		},
		gridSize: {
			type: Number,
			default: 1
		},
		drawGrid: {
			type: [Object, Boolean],
			default: false
		},
		background: {
			type: [Object, Boolean],
			default: false
		},
		readonly: {
			type: Boolean,
			default: false
		},
	},
	created() {
		this.name = this.$options.name;
		console.log(`[${this.name}] Created`);
		this.graph = new this.$joint.dia.Graph({}, { cellNamespace: this.$joint.shapes });
	},
	mounted() {
        var container = this.$refs.joint;
		console.log(`[${this.name}] Mounted:`, container);
		this.paper = new this.$joint.dia.Paper({
			el: container,
			cellViewNamespace: this.$joint.shapes,
			model: this.graph,
			width: this.width,
			height: this.height,
			gridSize: this.gridSize,
			drawGrid: this.drawGrid,
			background: this.background,
			interactive: !this.readonly
		});
        this.$emit('init', this.graph);

        this.panAndZoom = setupPanAndZoom(this.paper, $(container).children('svg')[0]);

        $(container).resize(function() {
            this.paper.setDimensions($(container).width()-10, $(container).height()-10);
            this.panAndZoom.resize();
        });

        const _this = this;
        this.paper.on('element:pointerdblclick', function(elementView) {
            centerElement(elementView.model, _this.panAndZoom);
            _this.$emit('focus-requested', elementView.model);
        });

        // The paper initialiser overwrites our css width & height, gotta set them back
        $(container)
            .width('100%')
            .height('100%');
	},
    getSizes() {
        return this.panAndZoom.getSizes();
    },
};
</script>

<style scoped>
div {
    position: absolute;
    width: 100%;
    height: 100%;
}
</style>