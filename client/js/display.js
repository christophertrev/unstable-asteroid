
var width = 960,
    height = 500,
    root;

var force = d3.layout.force()
    .size([width, height])
    .on("tick", tick);

var zoom = function() {
  svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
};

//Overall container for D3 graph
var svg = d3.select(".d3box").append("svg")
    .attr("class",'graph')
    .append('g')
    .call(d3.behavior.zoom().scaleExtent([0.7 , 8]).center([480, 250]).on('zoom', zoom))
    .append('g');

svg.append('rect')
  .attr('width', 10000)
  .attr('height', 10000)
  .attr('x', -5000)
  .attr('y', -5000)
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
      .linkDistance(75)
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

  // Update the nodes, keying off of the id
  node = node.data(nodes, function(d) { return [d.id,d.message]; });
  // Necessary so both the svg g element and the circles have access to the data
  // Removing this breaks the updating of the coloring with increasing children
  node.selectAll("circle").data(nodes, function(d) { return d.id; });

  // Exit any old nodes
  node.exit().remove();

  // Enter any new nodes, by creating a svg g element, will contain circle and text
  var g = node.enter().append('g')
      .attr("transform", transform)
      //Register click event on overall element so text or circle can be clicked to select node
      .on("click", click)

  // Add circle inside g element 
  g.attr("class", "node")
    .append("circle")
    .attr("r", radius);

  // Update ALL circle color on update because color changes with number of children
  // Can remove if color no longer depends on dynamic property like number of children
  node.selectAll("circle").style("fill", color); 

  // Add text (on top of circle) inside g element
  g.append("text")
    .attr("class", "label")
    .attr("dx", dx)
    .attr("dy", dy)
    .attr("text-anchor", textAnchor)
    .text(function(d){return d.message}); 

  // Add 'selected' class to one node only 
  // This could probably be moved to the node.selectAll("circle") instead
  node.attr("class", function(d){
    if(nodeSelected !== null){
      if(d._id === nodeSelected._id) {
        return "node selected";
      }else{
        return "node";
      }
    }
  });
}

//Updates the link and nodes positions as nodes move
function tick() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("transform", transform);
}

// Color depends on number of children, up to 10 children
// More children, more red
function color(d) {
  var maxChildren = 10;
  var maxChildrenColor = "#ff3300"; //redish orange
  var noChildrenColor = "#FBB03B"; //yellowish orange
  var interpolateColor  = d3.scale.linear().domain([0,maxChildren]).range([noChildrenColor,maxChildrenColor]);
  return interpolateColor(Math.min(maxChildren, d.children.length));
}

// Size of cirlce depends how far away from original root, unless more than 5 away from root
// Root is largest, getting smaller as further from root
function radius(d) {
  var maxDepth = 5;
  var maxSize = 40;
  var minSize = 20;
  var interpolateSize = d3.scale.linear().domain([0,maxDepth]).range([maxSize, minSize]);
  return interpolateSize(Math.min(maxDepth, d.depth));
}

// Sets position of g element relative to containing box
function transform(d) {
  return "translate(" + d.x + "," + d.y + ")";
}

// Text properties for svg text
function dx(d) {
  return 0;
}

function dy(d) {
  return ".35em";
}

function textAnchor(d){
  return "middle";
}

// This is not used, but scales text size according to length of message
function fontSize(d){
  var minFontSize = 6;
  var maxFontSize = 30;
  var maxCharLength = 20;
  var minCharLength = 1;
  var textLength = d.message.length;
  var interpolateSize = d3.scale.linear().domain([maxCharLength,minCharLength]).range([minFontSize,maxFontSize]);
  return interpolateSize(textLength);
}

// Holds node that is currently selected on screen 
var nodeSelected = null;

// Toggle children on click.
function click(d) {
  if (!d3.event.defaultPrevented) {
    // If node clicked is already selected, deselect, otherwise node selected is node clicked
    nodeSelected = nodeSelected === d ? null : d;

    //If not just deselected, if the node has children it cannot be deleted
    if(nodeSelected !== null && nodeSelected.children.length === 0){
        allowRemoval();
    }else{
      disallowRemoval();
    }
    update();
  }
}

// Returns a flattened list of all nodes 
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

