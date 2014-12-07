
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
  var nodes = flatten(treeData);
  // console.log('tree',treeData);
 console.log('nodes',treeData);
  var links = d3.layout.tree().links(nodes);
  // console.log('links',links)

  // Restart the force layout.
  force
      .nodes(nodes)
      .links(links)
      .charge(-500)
      .linkDistance(100)
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

  node = node.data(nodes, function(d) { return d.id; });



  // Exit any old nodes.
  node.exit().remove();

  // Enter any new nodes.
  var g = node.enter().append('g')
      .attr("transform", function(d){
        return "translate(" + d.x + "," + d.y + ")";
      })
      .call(force.drag);

  g.attr("class", "node")
    .append("rect")
    .attr('width',100)
    .attr('height',10)
    // .attr("r", function(d) { return Math.sqrt(d.size) / 10 || 15; })
    .style("fill", color)
    .on("click", click);
  g.append("text")
    .attr("class", "label")
    .attr("dx", 0)
    .attr("dy", ".35em")
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

  node.attr("transform", function(d){
        return "translate(" + d.x + "," + d.y + ")";
      });

}

// Color leaf nodes orange, and packages white or blue.
function color(d) {
  // return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
  return "#fd8d3c"
}

var nodeSelected;
// Toggle children on click.
function click(d) {
  // d.attr("class", "selected");
  //console.log(force.nodes());
  // console.log('obj',d)
  nodeSelected = nodeSelected === d._id ? null : d._id;
  console.log('SELECTED NODE',nodeSelected)
  update();
  //d.selected = !d.selected;
  // if (!d3.event.defaultPrevented) {
  //   if (d.children) {
  //     d._children = d.children;
  //     d.children = null;
  //   } else {
  //     d.children = d._children;
  //     d._children = null;
  //   }
  //   update();
  // }
}

// Returns a list of all nodes under the root.
function flatten(roots) {
  var i = 0;
  var nodes = [];
  roots.forEach(function(root){
    recurse(root);
  });

  function recurse(node) {
    if (node.children) node.children.forEach(recurse);
    node.id = node._id;
    nodes.push(node);
  }
  //console.log(nodes)
  return nodes;
}

