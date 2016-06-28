var graph = new joint.dia.Graph;

graph.on('all', function(eventName, cell) {
   console.log(arguments);
});

var paper = new joint.dia.Paper({
    el: $('#paper'),
    width: 600,
    height: 200,
    model: graph,
    gridSize: 1
});

var smallPaper = new joint.dia.Paper({
    el: $('#smallPaper'),
    width: 300,
    height: 100,
    model: graph,
    gridSize: 1
});

smallPaper.scale(.5);
//smallPaper.$el.css('pointer-events', 'none');

var rect = new joint.shapes.basic.Rect({
    position: { x: 100, y: 30 },
    size: { width: 100, height: 30 },
    attrs: {
        rect: {
            fill: 'green'
        },
        text: {
            text: 'gurka',
            fill: 'white'
        }
    }
});

var rect2 = rect.clone();
rect2.translate(300);

var link = new joint.dia.Link({
    source: { id: rect.id },
    target: { id: rect2.id }
});

graph.addCells([rect, rect2, link]);

console.log(JSON.stringify(graph.toJSON()));