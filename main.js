(function () {
  "use strict";

  var margin = {top: 30, right: 20, bottom: 10, left: 20},
      TABLE_MAX_SIZE = 10,
      w = 970 - margin.left - margin.right,
      h = 400 - margin.top - margin.bottom,
      legendHeight = 20,
      normalAxis = d3.svg.axis().orient("left"),
      percentFormat = d3.format(".0%"),
      percentAxis = d3.svg.axis().orient("left").tickFormat(percentFormat),
      rightAxis = d3.svg.axis().orient("right"),
      dimensions = ["SRM", "IBU", "ABV", "Rating"],
      searchString = "", hovering = [];
  var axis = {
    SRM: {
      title: "Darkness",
      axis: normalAxis
    },
    IBU: {
      title: "Bitterness",
      axis: normalAxis
    },
    ABV: {
      title: "Alcohol Content",
      axis: percentAxis
    },
    Rating: {
      title: "User Rating",
      axis: rightAxis
    }
  };

  // Create the main SVG container
  var svg = d3.select("#chart").append("svg")
      .attr("width", w + margin.right + margin.left)
      .attr("height", h + margin.bottom + margin.top)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var tip = d3.select(".tip");
  
  var legend = d3.select("#legend").append("svg")
      .attr("height", legendHeight)
      .attr("width", w)
    .append("g")
      .attr("transform", "translate(" + margin.left + ",0)");

  legend.selectAll("rect")
      .data(d3.range(0, 30))
      .enter()
    .append("rect")
      .attr("y", 0)
      .attr("x", function (d) { return (30 - d) * 2; })
      .attr("height", legendHeight)
      .attr("width", 2)
      .attr("fill", window.srm2rgb);

  var legendLeft = legend.append("text")
      .style("text-anchor", "start")
      .style("font-size", 12)
      .attr("x", 70)
      .attr("y", legendHeight / 2 + 6);

  legendLeft.append("tspan").text("Line Color").attr("class", "em");
  legendLeft.append("tspan").text(" indicates beer color");

  var legendMiddle = legend.append("text")
      .style("text-anchor", "middle")
      .style("font-size", 12)
      .attr("x", (w - margin.right) / 2)
      .attr("y", legendHeight / 2 + 6);

  legendMiddle.append("tspan").text("Click and drag on the axes").attr("class", "em");
  legendMiddle.append("tspan").text(" to filter");

  var legendRight = legend.append("text")
      .style("text-anchor", "end")
      .style("font-size", 12)
      .attr("x", w - margin.left)
      .attr("y", legendHeight / 2 + 6);

  legendRight.append("tspan").text("Type in the search box").attr("class", "em");
  legendRight.append("tspan").text(" to find a beer");

  // read input data, render chart, and setup listener to re-render on resize
  d3.csv("beer.csv", function (beers) {
    // Setup dimensions and scales
    var x = d3.scale.ordinal().rangePoints([0, w], 0.1),
        y = y || {},
        line = d3.svg.line().interpolate("cardinal");

    // Extract the list of dimensions and create a scale for each.
    x.domain(dimensions);
    dimensions.forEach(function (d) {
      y[d] = (y[d] || d3.scale.linear())
        .domain(d3.extent(beers, function (p) { return +p[d]; }))
        .range([h, 0]);
    });

    // Create and render all of the faded lines
    svg.append("g")
      .attr("class", "background")
      .selectAll("path")
        .data(beers)
      .enter().append("path")
        .attr("d", path);

    // Create and render all of the foreground lines
    var lines = svg.append("g")
      .attr("class", "foreground")
      .selectAll("path")
        .data(beers)
      .enter().append("path")
        .attr("stroke", srmColor)
        .each(function (d) { d.line = d3.select(this); })
        .attr("d", path)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mouseleave", mouseout);

    // Add a group element for each dimension.
    var g = svg.selectAll(".dimension")
        .data(dimensions)
      .enter().append("g")
        .attr("class", function (d) { return "dimension " + d; })
        .attr("transform", function (d) { return "translate(" + x(d) + ")"; });

    // Add an axis and title.
    g.append("g")
        .attr("class", "axis")
        .each(function (d) { d3.select(this).call(axis[d].axis.scale(y[d])); })
      .append("text")
        .attr("text-anchor", "middle")
        .attr("y", -9)
        .text(function (d) { return axis[d].title; });

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
      mouseout();
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
      activelist = activelist.slice(0, TABLE_MAX_SIZE);

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
      hovering = hovering.filter(function (e) { return d !== e; });
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
      dimensions.forEach(function (d) { addCell(row, d, d, axis[d].axis.tickFormat()); });
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

    function mouseover(d) {
      if (d.mouseover) { return; }
      mouseout();
      d.mouseover = true;
      lines.filter(function (c) { return c === d; })
        .classed("active", true)
        .each(function () {
          this.parentNode.appendChild(this);
        });

      var dx = d3.mouse(svg.node())[0],
          dy = d3.mouse(svg.node())[1];

      tip.style("display", null)
          .style("top", (dy + margin.top - (+tip.style("height").replace("px", "")) - 5) + "px")
          .style("left", (dx + margin.left - (+tip.style("width").replace("px", "")) - 5) + "px");

      tip.selectAll(".abv").text(percentFormat(d.ABV));
      tip.selectAll(".ibu").text(d.IBU);
      tip.selectAll(".rating").text(d.Rating);
      var name = d.name.length > 40 ? d.name.substr(0, 40) + "..." : d.name;
      tip.selectAll(".name").text(name);
      tip.selectAll(".srm").text(d.SRM);
    }

    function mouseout() {
      tip.style("display", "none");
      lines.filter(".active")
        .classed("active", false)
        .each(function (d) { d.mouseover = false; });
    }
  });

  // add utility to move an SVG selection to the front
  d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
      this.parentNode.appendChild(this);
    });
  };
}());