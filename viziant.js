const LETTER_SIZE = 10;
const VARIANT = 'atex.onecms.variantmodel';
const PROXY = 'http://localhost:1337/';

//var viziant = {
//    shapes: {}
//};

//viziant.shapes.Rect = joint.shapes.basic.Rect.extend({
//
//    initialize: function(options) {
//        console.log('viziant.shapes.Rect.initialize', options);
//        var label = options.id;
//        var maxLineLength = _.max(label.split('\n'), function(l) { return l.length; }).length;
//        var width = 1.1 * (LETTER_SIZE * (0.6 * maxLineLength + 1));
//        var height = 1.3 * ((label.split('\n').length + 1) * LETTER_SIZE);
//
//        this.set({
//            id: options.id,
//            attrs: {
//                rect: { width: width, height: height },
//                text: { text: label }
//            }
//        });
//    },
//
//    defaults: joint.util.deepSupplement({
//        type: 'viziant.Rect',
//        attrs: {
//            rect: { rx: 5, ry: 5, stroke: 'black' },
//            text: { 'font-size': LETTER_SIZE, 'font-family': 'monospace' }
//        }
//
//    }, joint.shapes.basic.Rect.prototype.defaults),
//
//    MY_FUNCTION: function(argument) {
//        console.log('this is MY_FUNCTION');
//    }
//});
//
//viziant.shapes.ContentManager = viziant.shapes.Rect.extend({
//
//    //initialize: function(options) {
//    //    console.log('viziant.shapes.ContentManager.initialize', options);
//    //    this.set({
//    //        id: options.id
//    //    });
//    //},
//
//    defaults: joint.util.deepSupplement({
//        type: 'viziant.ContentManager',
//        attrs: {
//            'rect': { fill: '#6F9CDC' },
//            'text': { fill: 'white' }
//        }
//
//    }, viziant.shapes.Rect.prototype.defaults)
//});
//
//viziant.shapes.Variant = viziant.shapes.Rect.extend({
//
//    defaults: joint.util.deepSupplement({
//        type: 'viziant.Variant',
//        attrs: {
//            'rect': { fill: '#8BCA6B' },
//            'text': { fill: 'white' }
//        }
//
//    }, viziant.shapes.Rect.prototype.defaults)
//});
//
//viziant.shapes.Mapper = viziant.shapes.Rect.extend({
//
//    defaults: joint.util.deepSupplement({
//        type: 'viziant.Mapper',
//        attrs: {
//            'rect': { fill: '#FFD559' },
//            'text': { fill: 'black' }
//        }
//
//    }, viziant.shapes.Rect.prototype.defaults)
//});
//
//viziant.shapes.Composer = viziant.shapes.Rect.extend({
//
//    defaults: joint.util.deepSupplement({
//        type: 'viziant.Composer',
//        attrs: {
//            'rect': { fill: '#FFAD60' },
//            'text': { fill: 'black' }
//        }
//
//    }, viziant.shapes.Rect.prototype.defaults)
//});
//
//viziant.shapes.Class = viziant.shapes.Rect.extend({
//
//    defaults: joint.util.deepSupplement({
//        type: 'viziant.Class',
//        attrs: {
//            'rect': { fill: 'white', rx: 5, ry: 5 },
//            'text': { fill: 'black' }
//        }
//
//    }, viziant.shapes.Rect.prototype.defaults)
//});



var graph = new joint.dia.Graph;

const OVERVIEW_SCALE = .2;

var paper = new joint.dia.Paper({
    el: $('#paper'),
    width: $(window).width(),
    height: $(window).height(),
    //perpendicularLinks: true,
    snapLinks: { radius: 50 },
    markAvailable: true,
    //validateConnection: validateConnection,
    gridSize: 1,
    model: graph
});

var overviewPaper = new joint.dia.Paper({
    el: $('#overviewPaper'),
    width: $(window).width() * OVERVIEW_SCALE,
    height: $(window).height() * OVERVIEW_SCALE,
    gridSize: 1,
    interactive: false,
    model: graph
});

overviewPaper.scale(OVERVIEW_SCALE);
overviewPaper.$el.css('pointer-events', 'none');

//
//  Event handlers
//
graph.on('change', function() {
    //console.log('on change', arguments);
    var bbox = graph.getBBox(graph.getElements());
    paper.setDimensions(
        bbox.width,
        bbox.height
    );
    overviewPaper.setDimensions(
        bbox.width * OVERVIEW_SCALE,
        bbox.height * OVERVIEW_SCALE
    );
});

$('#saveButton').click(function() {
    var variantModel = toVariantModel(graph);
    var blob = new Blob([JSON.stringify(variantModel)], {type: 'application/json'});
    saveAs(blob, 'variantModel.json');
});

function authenticate(host, user, password) {
    return new Promise(function(resolve, reject) {
        var service = '/content-hub/onecms/security/token';
        var url = PROXY + host + service;
        var data = {
            "username": user,
            "password": password
        };
        $.ajax({
            type: 'post',
            url: url,
            contentType: 'application/json',
            data: JSON.stringify(data),
            dataType: 'json',
            crossDomain: true,
            success: function (result) {
                if (typeof result.token !== "undefined") {
                    resolve(result.token);
                } else {
                    reject("Failed to authenticate: " + result);
                }
            },
            error: reject
        });
    });
}

//function fetchVariantModel2(host) {
//    return new Promise(function(resolve, reject) {
//        authenticate(host, "sysadmin", "sysadmin").then(function(token) {
//            var service = '/onecms/content/externalid/';
//            var contentManagerId = 'atex.onecms.ContentManager.DefaultConfig';
//            var format = '&format=json+pretty+noTypes';
//            var url = host + service + contentManagerId /*+ '?variant=' + VARIANT + format */;
//            $.ajax({
//                type: 'get',
//                url: url,
//                headers: {
//                    'X-Auth-Token': token
//                },
//                dataType: 'json',
//                success: function(data, textStatus, jqHXR) {
//                    console.log('successfully read content', data);
//                    resolve(data);
//                },
//                error: function(jqHXR, textStatus, errorThrown) {
//                    console.log('failed', textStatus);
//                    reject(textStatus);
//                }
//            });
//        });
//    });
//}

function searchByInputTemplate(host, token, inputTemplate) {
    return new Promise(function(resolve, reject) {
        var query = 'q=inputTemplate:' + inputTemplate;
        var path = '/content-hub/onecms/search/internal/select';
        var variant = '&variant=atex.onecms.variantmodel';
        var format = '&format=json+noTypes';
        var url = PROXY + host + path + '?' + query + variant + format;
        $.ajax({
            type: 'get',
            url: url,
            headers: {
                'X-Auth-Token': token
            },
            dataType: 'json',
            success: resolve,
            error: reject
        });
    });
}

function fetchContentManagers(host, token) {
    return searchByInputTemplate(host, token, 'com.atex.onecms.content.ContentManager.config');
}

function fetchVariants(host, token) {
    return searchByInputTemplate(host, token, 'com.polopoly.data.Variant.config');
}

function fetchComposers(host, token) {
    return searchByInputTemplate(host, token, 'atex.onecms.ReadComposerHook');
}

function fetchMappers(host, token) {
    return searchByInputTemplate(host, token, 'atex.onecms.AspectMapperHook');
}

function fetchVariantModel(host) {
    console.log('fetching variant model...');
    return authenticate(host, "sysadmin", "sysadmin").then(function(token) {
        return fetchContentManagers(host, token).then(function(variantModel) {
            return fetchVariants(host, token, variantModel);
        }).then(function (variantModel) {
            return fetchComposers(host, token, variantModel);
        }).then(function (variantModel) {
            return fetchMappers(host, token, variantModel);
        });
    });
}

$('#fetchButton').click(function() {
    fetchVariantModel('localhost:8081').then(function(variantModel) {
        fromVariantModel(graph, variantModel);
        layout(graph);
    }).catch(function(err) {
        alert(err);
    })
});

$('#createContentManagerButton').click(function() {
    var createDialog = document.getElementById('createDialog');
    createDialog.inputData = 'ContentManager';
    createDialog.showModal();
});

//graph.on('all', function(eventName, cell) {
//    console.log("graph on all:", arguments);
//});
//
//paper.on('all', function() {
//    console.log("paper on all:", arguments);
//});

paper.on('cell:pointerclick', function(child, event, x, y) {
    console.log("paper on cell:pointerclick:", child, event, x, y);
    //event.stopImmediatePropagation();
});

paper.on('cell:pointerdblclick', function(child, event, x, y) {
    console.log("paper on cell:pointerdblclick:", child, event, x, y);
    //event.stopImmediatePropagation();
    var elements = [];
    elements.push(child.model);

    // Inbound links
    var links = graph.getConnectedLinks(child.model, { inbound: true, outbound: false });
    if (typeof links !== 'undefined') {
        _.each(links, function(link) {
            var inboundElement = graph.getCell(link.attributes.source.id).clone();

            elements.push(inboundElement);
        });
    }

    // Outbound links
    links = graph.getConnectedLinks(child.model, { inbound: false, outbound: true });
    if (typeof links !== 'undefined') {
        _.each(links, function(link) {
            elements.push(graph.getCell(link.attributes.target.id))
        });
    }
    var gurka;

    var variantModel = toVariantModel(graph, elements);
    var blob = JSON.stringify(variantModel);

    graph.clear();
    fromVariantModel(graph, variantModel);
    layout(graph);
});

var panning = {
    isPanning: false,
    previousX: 0,
    previousY: 0
};

paper.on('blank:pointerdown', function(e, x, y) {
    e.preventDefault();
    panning.isPanning = true;
    panning.previousX = x;
    panning.previousY = y;
});

var body = $('body');
var view = $('#view');

body.mousemove(function(e) {
    if (panning.isPanning) {
        e.preventDefault();
        view.scrollLeft(view.scrollLeft() + (panning.previousX - e.clientX));
        view.scrollTop(view.scrollTop() + (panning.previousY - e.clientY));
        panning.previousX = e.clientX;
        panning.previousY = e.clientY;
    }
});

body.mouseup(function(event) {
    panning.isPanning = false;
});

//viziant.Graph = function(jointGraph) {
//    console.log('viziant.Graph ctor');
//    this.jgraph = jointGraph;
//};
//
//viziant.Graph.prototype = {
//
//    constructor: viziant.Graph,
//
//    importVariantModel: function(model) {
//        // TODO: maybe clear first?
//        var jgraph = this.jgraph;
//        // Import Content Manager elements
//        _.each(model.contentmanagers, function(data, id) {
//            var cell = new viziant.shapes.ContentManager({
//                id: id,
//
//                viziant: {
//                    defaultAccessStrategy: data.defaultAccessStrategy || 'NONE'
//                }
//            });
//            console.log(cell);
//            jgraph.addCell(cell);
//        });
//
//        // Import Variant elements
//        _.each(model.variants, function(data, id) {
//            jgraph.addCell(new viziant.shapes.Variant({ id: id, data: data }));
//        });
//
//        // Import Mapper elements
//        _.each(model.mappers, function(data, id) {
//            jgraph.addCell(new viziant.shapes.Mapper({ id: id, data: data }));
//        });
//
//        // Import Composer elements
//        _.each(model.composers, function(data, id) {
//            jgraph.addCell(new viziant.shapes.Composer({ id: id, data: data }));
//        });
//
//    },
//
//    exportVariantModel: function() {
//
//    }
//};



const CLASS_ID_PREFIX = 'class-';

function createRect(id, label, background, foreground, properties) {
    var maxLineLength = _.max(label.split('\n'), function(l) { return l.length; }).length;
    var width = 1.1 * (LETTER_SIZE * (0.6 * maxLineLength + 1));
    var height = 1.3 * ((label.split('\n').length + 1) * LETTER_SIZE);

    var rect = new joint.shapes.basic.Rect({
        id: id,
        size: { width: width, height: height },
        attrs: {
            rect: { fill: background, width: width, height: height, rx: 5, ry: 5, stroke: '#555' },
            text: { text: label, fill: foreground, 'font-size': LETTER_SIZE, 'font-family': 'monospace' }
        }
    });
    rect.prop(properties);
    return rect;
}

function createLink(id, name, from, to, properties) {
    //console.log('createLink', [from, to, name, id]);
    var link = new joint.dia.Link({
        id: id,
        //smooth: true,
        source: { id: from },
        target: { id: to }
    });
    link.label(0, {
        position: .5,
        attrs: {
            text: { text: name, 'font-size': LETTER_SIZE, 'font-family': 'monospace' }
        }
    });
    //link.set('router', { name: 'metro' });
    //link.set('connector', { name: 'rounded' });
    link.attr({
        '.connection': { stroke: 'black' },
        '.marker-target': { fill: 'grey', d: 'M 10 0 L 0 5 L 10 10 z' }
    });
    link.prop(properties);
    return link;
}

function addContentManagerElements(graph, model) {
    _.each(model.contentmanagers, function(data, id) {
        var rect = createRect(id, id, '#6F9CDC', 'white', {
            onecmsVariantData: {
                category: 'contentManager',
                defaultAccessStrategy: data.defaultAccessStrategy
            }
        });
        rect.on('all', function(event) {
           console.log("cm rect on all", event);
        });
        graph.addCell(rect);
        var view = paper.findViewByModel(rect);
        console.log(view);
        if (typeof view !== "undefined") {
            view.on('mouseover', function(event) {
                console.log('gurka mouseover', event);
            });
        }
    });
}

function addVariantElements(graph, model) {
    _.each(model.variants, function(data, id) {
        graph.addCell(createRect(id, id, '#8BCA6B', 'white', {
            onecmsVariantData: {
                category: 'variant'
            }
        }));
    });
}

function addMapperElements(graph, model) {
    _.each(model.mappers, function(data, id) {
        graph.addCell(createRect(id, id, '#FFD559', 'black', {
            onecmsVariantData: {
                category: 'mapper',
                config: data.config
            }
        }));
    });
}

function addComposerElements(graph, model) {
    _.each(model.composers, function(data, id) {
        graph.addCell(createRect(id, id, '#FFAD60', 'black', {
            onecmsVariantData: {
                category: 'composer',
                config: data.config
            }
        }));
    });
}

function addClassElements(graph, model) {
    var converters = {};
    _.extend(converters, model.mappers);
    _.extend(converters, model.composers);
    _.each(converters, function(converterData) {
        if (typeof converterData.classpath !== "undefined") {
            var label = afterLastPositionOf('.', converterData.classpath);
            // Class names could collide with external ids, adding prefix...
            var id = CLASS_ID_PREFIX + converterData.classpath;
            if (typeof graph.getCell(id) == "undefined") {
                graph.addCell(createRect(id, label, 'white', 'black', {
                    onecmsVariantData: {
                        category: 'javaClass'
                    }
                }));
            }
        }
    });
}

function addLink(graph, name, from, to, shortname) {
    var id = generateLinkId(name, from, to);
    validateLink(graph, id, from, to);
    var properties = { onecmsVariantData: { name: name } };
    var label = name;
    if (typeof shortname !== "undefined") {
        _.extend(properties.onecmsVariantData, { shortname: shortname });
        label = shortname;
    }
    graph.addCell(createLink(id, label, from, to, properties));
}

function afterLastPositionOf(delimeter, str) {
    var pos = str.lastIndexOf(delimeter);
    return str.substr(pos + 1);
}

function generateLinkId(name, from, to) {
    return from + '-(' + name + ')-' + to;
}

function validateLinkNotExists(graph, id) {
    var cell = graph.getCell(id);
    if (typeof cell !== "undefined" && cell.isLink()) {
        throw 'Link already exists: ' + id;
    }
}

function validateNodeExists(graph, id) {
    var cell = graph.getCell(id);
    if (typeof cell == "undefined" || cell.isLink()) {
        throw 'No such node: ' + id;
    }
}

function validateLink(graph, id, from, to) {
    validateLinkNotExists(graph, id);
    validateNodeExists(graph, from);
    validateNodeExists(graph, to);
}

function addContentManagerLinks(graph, model) {
    _.each(model.contentmanagers, function(cmData, cmId) {
        _.each(cmData.variants, function(variantConfigId, name) {
            addLink(graph, name, cmId, variantConfigId);
        });
    });
}

function addVariantLinks(graph, model) {
    _.each(model.variants, function(variantConfigData, variantConfigId) {
        if (typeof variantConfigData.defaultComposer !== "undefined") {
            addLink(graph, 'defaultComposer', variantConfigId, variantConfigData.defaultComposer);
        }
        _.each(variantConfigData.mappers, function(mapperConfigId, type) {
            var label = afterLastPositionOf('.', type);
            addLink(graph, type, variantConfigId, mapperConfigId, label);
        });
        _.each(variantConfigData.composers, function(composerConfigId, type) {
            var label = afterLastPositionOf('.', type);
            addLink(graph, type, variantConfigId, composerConfigId, label);
        });
    });
}

function addMapperLinks(graph, model) {
    _.each(model.mappers, function(mapperData, mapperId) {
        if (typeof mapperData.classpath !== "undefined") {
            addLink(graph, '', mapperId, CLASS_ID_PREFIX + mapperData.classpath);
        }
    });
}

function addComposerLinks(graph, model) {
    _.each(model.composers, function(composerData, composerId) {
        if (typeof composerData.classpath !== "undefined") {
            addLink(graph, '', composerId, CLASS_ID_PREFIX + composerData.classpath);
        }
    });
}

function fromVariantModel(graph, model) {
    console.log('transforming variant model to graph model 3...');
    addContentManagerElements(graph, model);
    addVariantElements(graph, model);
    addMapperElements(graph, model);
    addComposerElements(graph, model);
    addClassElements(graph, model);

    addContentManagerLinks(graph, model);
    addVariantLinks(graph, model);
    addMapperLinks(graph, model);
    addComposerLinks(graph, model);
}

//fromVariantModel(graph, variantModel);

//var viziantGraph = new viziant.Graph(graph);
//viziantGraph.importVariantModel(variantModel);


//console.log('Rect', new viziant.shapes.Rect());
//
//graph.addCell(new viziant.shapes.ContentManager({
//    id: 'MY_ID',
//    size: { width: 25, height: 25 },
//    attrs: {
//        //rect: { fill: background, width: width, height: height, rx: 5, ry: 5, stroke: '#555' },
//        text: { text: 'GURKA' }
//    }
//}));
//
//var cell = graph.getCell('MY_ID');
//console.log(cell);
//cell.MY_FUNCTION();

function toVariantModel(graph, elements) {

    var variantModel = {
        "contentmanagers": {},
        "variants": {},
        "mappers": {},
        "composers": {}
    };

    var elementsArray;
    if (typeof elements !== 'undefined') {
        elementsArray = elements
    } else {
        elementsArray = graph.getElements();
    }

    _.each(elementsArray, function(element) {
        var variantData = element.attributes.onecmsVariantData;
        if (typeof variantData !== 'undefined') {
            var links, link, output;
            switch (variantData.category) {
                case 'contentManager':
                    output = variantModel.contentmanagers[element.id] = {};
                    if (typeof variantData.defaultAccessStrategy !== 'undefined') {
                        output.defaultAccessStrategy = variantData.defaultAccessStrategy;
                    }
                    links = graph.getConnectedLinks(element, { outbound: true });
                    if (typeof links !== 'undefined') {
                        output.variants = {};
                        _.each(links, function (link) {
                            var variantName = link.attributes.onecmsVariantData.name;
                            output.variants[variantName] = link.attributes.target.id;
                        });
                    }
                    break;
                case 'variant':
                    output = variantModel.variants[element.id] = {};
                    links = graph.getConnectedLinks(element, { outbound: true });
                    if (typeof links !== 'undefined') {
                        _.each(links, function(link) {
                            var type = link.attributes.onecmsVariantData.name;
                            if (typeof type !== "undefined") {
                                var converterId = link.attributes.target.id;
                                var converter = graph.getCell(converterId);
                                var variantData = converter.attributes.onecmsVariantData;
                                if (type === 'defaultComposer') {
                                    output.defaultComposer = converterId;
                                } else {
                                    var target;
                                    if (variantData.category === 'composer') {
                                        if (typeof output.composers === 'undefined') {
                                            output.composers = {};
                                        }
                                        target = output.composers;
                                    } else if (variantData.category === 'mapper') {
                                        if (typeof output.mappers === 'undefined') {
                                            output.mappers = {};
                                        }
                                        target = output.mappers;
                                    }
                                    target[type] = converterId;
                                }
                            }
                        });
                    }
                    break;
                case 'mapper':
                    output = variantModel.mappers[element.id] = {};
                    links = graph.getConnectedLinks(element, { outbound: true });
                    if (typeof links !== 'undefined') {
                        if (links.length > 1) {
                            throw "Mapper ", element.id, " refers to more than one class!";
                        }
                        link = links[0];
                        if (typeof link !== 'undefined') {
                            output.classpath = link.attributes.target.id.substring(6);
                        }
                    }

                    if (typeof variantData.config !== 'undefined') {
                        output.config = variantData.config;
                    }
                    break;
                case 'composer':
                    output = variantModel.composers[element.id] = {};
                    links = graph.getConnectedLinks(element, { outbound: true });
                    if (typeof links !== 'undefined') {
                        if (links.length > 1) {
                            throw "Composer ", element.id, " refers to more than one class!";
                        }
                        link = links[0];
                        if (typeof link !== 'undefined') {
                            output.classpath = link.attributes.target.id.substring(6);
                        }
                    }

                    if (typeof variantData.config !== 'undefined') {
                        output.config = variantData.config;
                    }
                    break;
            }
        }

    });

    return variantModel;
}

function readRemoteFile(filename) {
    return new Promise(function(resolve, reject) {
        var fileRequest = new XMLHttpRequest();
        fileRequest.open("GET", filename, true);
        fileRequest.onreadystatechange = function () {
            if (fileRequest.readyState === 4) {
                if (fileRequest.status === 200 || fileRequest.status == 0) {
                    console.log("resolving");
                    resolve(fileRequest.responseText);
                } else {
                    console.log("rejecting");
                    reject("Failed to read file", filename, "status:", fileRequest.status);
                }
            }
        };
        fileRequest.send();
    });
}

function layout(graph) {
    console.log('starting layout of graph model...');
    joint.layout.DirectedGraph.layout(graph, {
        nodeSep: 60,
        edgeSep: 30,
        rankSep: 70,
        rankDir: 'LR'
    });
}


readRemoteFile('variantModel.json').then(function(jsonVariantModel) {
    var variantModel = JSON.parse(stripJsonComments(jsonVariantModel));
    fromVariantModel(graph, variantModel);
    layout(graph);
}).catch(function(reason) {
    console.log(reason);
});





