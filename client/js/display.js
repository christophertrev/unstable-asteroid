
var width = 960,
    height = 500,
    root;

var force = d3.layout.force()
    .size([width, height])
    .on("tick", tick);

var zoom = function() {
  svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
};

var svg = d3.select(".d3box").append("svg")
    // .attr("width", width)
    // .attr("height", height)
    .attr("class",'graph')
    .append('g')
      .call(d3.behavior.zoom().scaleExtent([0.7 , 8]).center([480, 250]).on('zoom', zoom))
    .append('g');

svg.append('rect')
  .attr('width', 1000)
  .attr('height', 1000)
  .attr('x', 0)
  .attr('y', 0)
  .attr('class', 'overlay');

var link = svg.selectAll(".link"),
    node = svg.selectAll(".node");

function update() {
  var oldNodes = force.nodes();
  var newNodes = flatten(treeData);

  //copy over position properties from old nodes
  for (var i = 0; i < oldNodes.length; ++i) {
    for (var j = 0; j < newNodes.length; ++j) {
      if (oldNodes[i].id === newNodes[j].id) {
        newNodes[j].x = oldNodes[i].x;
        newNodes[j].y = oldNodes[i].y;
        break;
      }
    }
  }

  var nodes = newNodes;

  var links = d3.layout.tree().links(nodes);
  // Restart the force layout.
  force
      .nodes(nodes)
      .links(links)
      .charge(-1000)
      .linkDistance(200)
      .start();

 

  // Update the links…
  link = link.data(links, function(d) { return d.target.id; });

  // Exit any old links.
  link.exit().remove();

  // Enter any new links.
  link.enter().insert("line", ".node")
      .attr("class", "link")
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  // Update the nodes…
  //node = node.data(nodes).style("fill", color);

  node = node.data(nodes, function(d) { return [d.id,d.message]; });
  node.selectAll("circle").data(nodes, function(d) { return d.id; });

  // Exit any old nodes.
  node.exit().remove();

  // Enter any new nodes.
  var g = node.enter().append('g')
      .attr("transform", transform)
      .on("click", click)

  g.attr("class", "node")
    .append("circle")
    .attr("r", radius);

  node.selectAll("circle").style("fill", color); 

  g.append("text")
    .attr("class", "label")
    .attr("dx", dx)
    .attr("dy", dy)
    .attr("text-anchor", textAnchor)
    .attr("font-size",fontSize)
    .text(function(d){return d.message}); 

  node.attr("class", function(d){
    if(d._id === nodeSelected) {
      return "node selected";
    }else{
      return "node";
    }
  });
}

function tick() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("transform", transform);

}

// Color leaf nodes orange, and packages white or blue.
function color(d) {
  var maxChildren = 10;
  var maxChildrenColor = "#ff3300";
  var noChildrenColor = "#FBB03B";
  var interpolateColor  = d3.scale.linear().domain([0,maxChildren]).range([noChildrenColor,maxChildrenColor]);

  return interpolateColor(Math.min(maxChildren, d.children.length));

}

function radius(d) {
  var maxDepth = 5;
  var maxSize = 40;
  var minSize = 20;
  var interpolateSize = d3.scale.linear().domain([0,maxDepth]).range([maxSize, minSize]);
  return interpolateSize(Math.min(maxDepth, d.depth));
}

function transform(d) {
  return "translate(" + d.x + "," + d.y + ")";
}

function dx(d) {
  return 0;
}

function dy(d) {
  return ".35em";
}

function textAnchor(d){
  return "middle";
}

function fontSize(d){
  var minFontSize = 6;
  var maxFontSize = 30;
  var textLength = d.message.length;
  var interpolateSize = d3.scale.linear().domain([15,1]).range([minFontSize,maxFontSize]);
  return interpolateSize(textLength);
}
var nodeSelected;
// Toggle children on click.
function click(d) {
  if (!d3.event.defaultPrevented) {
    nodeSelected = nodeSelected === d._id ? null : d._id;
    console.log('SELECTED NODE',nodeSelected)
    update();
  }
}

// Returns a list of all nodes under the root.
function flatten(roots) {
  var i = 0;
  var nodes = [];
  roots.forEach(function(root){
    recurse(root);
  });

  function recurse(node, depth) {
    depth = depth || 0;
    if (node.children){
      for(var i = 0; i < node.children.length; i++){
        recurse(node.children[i], depth+1);
      }
    } 

    node.depth = depth;
    node.id = node._id;
    nodes.push(node);
  }
  return nodes;
}

