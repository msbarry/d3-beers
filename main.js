(function () {
  "use strict";

  var margin = [30, 0, 10, 20],
      normalAxis = d3.svg.axis().orient("left"),
      percentFormat = d3.format(".0%"),
      percentAxis = d3.svg.axis().orient("left").tickFormat(percentFormat),
      dimensions = ["SRM", "IBU", "ABV", "Rating"],
      w, h, x, y, line, lines, beers, axis, searchString = "", hovering = [];

  // read input data, render chart, and setup listener to re-render on resize
  d3.csv("beer.csv", function (data) {
    beers = data;
    window.onresize = render;
    render();
  });

  // clear the chart and render a new one, maximizing the height/width
  function render() {
    // Remove the old chart
    d3.selectAll("svg").remove();

    // Setup dimensions and scales
    axis = {};
    w = document.width * 0.7 - margin[1] - margin[3],
    h = document.height - 10 - margin[0] - margin[2],
    x = d3.scale.ordinal().rangePoints([0, w], 0.3),
    y = y || {},
    line = d3.svg.line().interpolate("cardinal");

    // Create the main SVG container
    var svg = d3.select("#chart").append("svg")
        .attr("width", w + margin[1] + margin[3])
        .attr("height", h + margin[0] + margin[2])
      .append("g")
        .attr("transform", "translate(" + margin[3] + "," + margin[0] + ")");

    // Extract the list of dimensions and create a scale for each.
    x.domain(dimensions);
    dimensions.forEach(function (d) {
      y[d] = (y[d] || d3.scale.linear())
        .domain(d3.extent(beers, function (p) { return +p[d]; }))
        .range([h, 0]);
      axis[d] = normalAxis;
    });
    axis['ABV'] = percentAxis;

    // Create and render all of the lines
    lines = svg.append("g")
      .attr("class", "linecontainer")
      .selectAll("path")
        .data(beers)
      .enter().append("path")
        .attr("stroke", srmColor)
        .each(function (d) { d.line = d3.select(this); })
        .attr("d", path);

    // Add a group element for each dimension.
    var g = svg.selectAll(".dimension")
        .data(dimensions)
      .enter().append("g")
        .attr("class", function (d) { return "dimension " + d; })
        .attr("transform", function (d) { return "translate(" + x(d) + ")"; });

    // Add an axis and title.
    g.append("g")
        .attr("class", "axis")
        .each(function (d) { d3.select(this).call(axis[d].scale(y[d])); })
      .append("text")
        .attr("text-anchor", "middle")
        .attr("y", -9)
        .text(String);

    // Add and store a brush for each axis.
    g.append("g")
        .attr("class", "brush")
        .each(function (d) {
          y[d].brush = (y[d].brush || d3.svg.brush());
          d3.select(this).call(y[d].brush.y(y[d]).on("brush", brush));
          d3.select("." + d + " .brush").call(y[d].brush.extent(y[d].brush.extent()));
        })
      .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);

    brush();
  }

  // apply the correct color to use for a beer based on its SRM
  function srmColor(d) {
    return window.srm2rgb(d['SRM']);
  }

  // Returns the path for a given data point.
  function path(d) {
    return line(dimensions.map(function (p) { return [x(p), y[p](d[p])]; }));
  }

  // Handles a brush event, toggling the display of foreground lines and updating list
  function brush() {
    var actives = dimensions.filter(function (p) { return !y[p].brush.empty(); }),
        extents = actives.map(function (p) { return y[p].brush.extent(); }),
        re = new RegExp("\\b" + d3.requote(searchString), "i"),
        activelist = [];

    lines.classed("fade", function (d) {
      return !actives.every(function (p, i) {
        return extents[i][0] <= d[p] && d[p] <= extents[i][1];
      }) || !re.test(d.name) || !activelist.push(d);
    });
    updateBeerList(activelist);
    hovering.forEach(hoveroutcell);
  }

  // display the beer list
  function updateBeerList(activelist) {
    d3.select("#count").text(activelist.length);
    d3.select("#total").text(beers.length);
    activelist
      .sort(function (a, b) { return d3.ascending(a.name, b.name); })
      .sort(function (a, b) { return d3.descending(a.Rating, b.Rating); });
    activelist = activelist.slice(0, h / 15);

    // update existing rows
    var list = d3.select("#beer-list")
      .selectAll(".beer")
      .data(activelist)
      .call(createTableRow);

    // create new rows
    list.enter()
      .append('div')
      .call(createTableRow);

    // remove old rows
    list.exit().remove();
  }

  // on mouseover data, add hover class to line and row
  function hoverovercell(d) {
    d.line.classed('hover', true).moveToFront();
    if (d.row) { d.row.classed('hover', true); }
    hovering.push(d);
  }

  // on mouseout of data, remove hover class from line and row
  function hoveroutcell(d) {
    d.line.classed('hover', false);
    if (d.row) { d.row.classed('hover', false); }
    hovering = hovering.filter(function (e) { return d != e; });
  }

  // creates a table row
  function createTableRow(row) {
    row.attr('class', 'beer')
      .style('color', srmColor)
      .html("")
      .on('mouseover', hoverovercell)
      .on('mouseout', hoveroutcell)
      .each(function (d) { d.row = d3.select(this); });

    addCell(row, 'name', 'name');
    dimensions.forEach(function (d) { addCell(row, d, d, axis[d].tickFormat()); });
  }

  // creates a cell in the table
  function addCell(row, clazz, attr, format) {
    format = format || function (d) { return d; };
    row.append("div")
      .attr('class', clazz)
      .text(function (d) { return format(d[attr]); });
  }


  // setup search

  var searchInput = d3.select(".search input")
      .on("keyup", function () {
        if (d3.event.keyCode === 27) {
          this.value = "";
          this.blur();
        }
        search(this.value.trim());
      });

  var searchClear = d3.select(".search .search-clear")
      .on("click", function () {
        searchInput.property("value", "").node().blur();
        search();
      });

  function search(value) {
    searchString = value || "";
    searchClear.style("display", value ? null : "none");
    brush();
  }

  // add utility to move an SVG selection to the front
  d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
      this.parentNode.appendChild(this);
    });
  };
}());