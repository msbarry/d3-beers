d3.csv("beer.csv", function(beers) {
  var SRM_TO_RGB = [];
  SRM_TO_RGB[0] = 'rgb(250, 250, 210)';
  SRM_TO_RGB[1] = 'rgb(250, 250, 160)';
  SRM_TO_RGB[2] = 'rgb(250, 250, 105)';
  SRM_TO_RGB[3] = 'rgb(245, 246, 50)';
  SRM_TO_RGB[4] = 'rgb(235, 228, 47)';
  SRM_TO_RGB[5] = 'rgb(225, 208, 50)';
  SRM_TO_RGB[6] = 'rgb(215, 188, 52)';
  SRM_TO_RGB[7] = 'rgb(205, 168, 55)';
  SRM_TO_RGB[8] = 'rgb(198, 148, 56)';
  SRM_TO_RGB[9] = 'rgb(193, 136, 56)';
  SRM_TO_RGB[10] = 'rgb(192, 129, 56)';
  SRM_TO_RGB[11] = 'rgb(192, 121, 56)';
  SRM_TO_RGB[12] = 'rgb(192, 114, 56)';
  SRM_TO_RGB[13] = 'rgb(190, 106, 56)';
  SRM_TO_RGB[14] = 'rgb(180, 99, 56)';
  SRM_TO_RGB[15] = 'rgb(167, 91, 54)';
  SRM_TO_RGB[16] = 'rgb(152, 84, 51)';
  SRM_TO_RGB[17] = 'rgb(138, 75, 48)';
  SRM_TO_RGB[18] = 'rgb(124, 68, 41)';
  SRM_TO_RGB[19] = 'rgb(109, 60, 34)';
  SRM_TO_RGB[20] = 'rgb(95, 53, 23)';
  SRM_TO_RGB[21] = 'rgb(81, 45, 11)';
  SRM_TO_RGB[22] = 'rgb(67, 38, 12)';
  SRM_TO_RGB[23] = 'rgb(52, 30, 17)';
  SRM_TO_RGB[24] = 'rgb(38, 23, 22)';
  SRM_TO_RGB[25] = 'rgb(33, 19, 18)';
  SRM_TO_RGB[26] = 'rgb(28, 16, 15)';
  SRM_TO_RGB[27] = 'rgb(23, 13, 12)';
  SRM_TO_RGB[28] = 'rgb(18, 9, 8)';
  SRM_TO_RGB[29] = 'rgb(13, 6, 5)';
  SRM_TO_RGB[30] = 'rgb(8, 3, 2)';
  for (var i = 31; i < 100; i++) {
    SRM_TO_RGB[i] = 'rgb(8, 3, 2)';
  }
  var m = [40, 40, 40, 40];
  var percentFormat = d3.format(".0%");
  var leftAxis = d3.svg.axis().orient("left");
  var percentAxis = d3.svg.axis().orient("left").tickFormat(percentFormat);
  var axes = {
    ABV: percentAxis,
    IBU: leftAxis,
    SRM: leftAxis,
    Rating: leftAxis
  };
  var traits = ["SRM", "ABV", "IBU", "Rating"];
  var percent = d3.format(".0%");

  // create the chart
  var draw = function () {
    d3.selectAll("svg").remove();

    var w = window.innerWidth * 0.7 - m[1] - m[3],
        h = window.innerHeight - m[0] - m[2] - 20;

    var x = d3.scale.ordinal().domain(traits).rangePoints([0, w]),
        y = {};

    var line = d3.svg.line().interpolate("cardinal"),
        foreground;

    var svg = d3.select("body").append("svg")
        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
      .append("g")
        .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    // Create a scale and brush for each trait.
    traits.forEach(function(trait) {
      // Coerce values to numbers.
      beers.forEach(function(p) { p[trait] = +p[trait]; });

      y[trait] = d3.scale.linear()
          .domain(d3.extent(beers, function(p) { return p[trait]; }))
          .range([h, 0]);

      y[trait].brush = d3.svg.brush()
          .y(y[trait])
          .on("brush", brush);
    });

    // Add foreground lines.
    foreground = svg.append("g")
        .attr("class", "foreground")
      .selectAll("path")
        .data(beers)
      .enter().append("path")
        .attr("d", path)
        .attr("stroke", function(d) { return SRM_TO_RGB[d.SRM]; })
        .each(function (d) { d.line = d3.select(this); })
        .on('mouseover', hoverover)
        .on('mouseout', hoverout);

    // add hover title to each line
    foreground
      .append("title").text(function (d) {
        return [
          d.name,
          'ABV: ' + percentFormat(d.ABV),
          'SRM: ' + d.SRM,
          'IBU: ' + d.IBU,
          'Rating: ' + d.Rating
        ].join('\n'); 
      });

    // Add a group element for each trait.
    var g = svg.selectAll(".trait")
        .data(traits)
      .enter().append("g")
        .attr("class", "trait")
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        .call(d3.behavior.drag()
        .origin(function(d) { return {x: x(d)}; })
        .on("dragstart", dragstart)
        .on("drag", drag)
        .on("dragend", dragend));

    // Add an axis and title.
    g.append("g")
        .attr("class", "axis")
        .each(function(d) { d3.select(this).call(axes[d].scale(y[d])); })
      .append("text")
        .attr("text-anchor", "middle")
        .attr("y", -9)
        .text(String);

    // Add a brush for each axis.
    g.append("g")
        .attr("class", "brush")
        .each(function(d) { d3.select(this).call(y[d].brush); })
      .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);

    function dragstart(d) {
      i = traits.indexOf(d);
    }

    function drag(d) {
      x.range()[i] = d3.event.x;
      traits.sort(function(a, b) { return x(a) - x(b); });
      g.attr("transform", function(d) { return "translate(" + x(d) + ")"; });
      foreground.attr("d", path);
    }

    function dragend(d) {
      x.domain(traits).rangePoints([0, w]);
      var t = d3.transition().duration(500);
      t.selectAll(".trait").attr("transform", function(d) { return "translate(" + x(d) + ")"; });
      t.selectAll(".foreground path").attr("d", path);
    }

    // Returns the path for a given data point.
    function path(d) {
      return line(traits.map(function(p) { return [x(p), y[p](d[p])]; }));
    }

    // Handles a brush event, toggling the display of foreground lines.
    function brush() {
      var actives = traits.filter(function(p) { return !y[p].brush.empty(); }),
          extents = actives.map(function(p) { return y[p].brush.extent(); });
      var activedata = [];
      foreground.classed("fade", function(d) {
        var filteredOut = !actives.every(function(p, i) {
          return extents[i][0] <= d[p] && d[p] <= extents[i][1];
        });
        if (!filteredOut) {
          activedata.push(d);
        }
        return filteredOut;
      });
      displayBeerList(activedata);
    }

    // creates a cell in the table
    function addCell(row, clazz, attr, format) {
      format = format || function (d) { return d };
      row.append("div")
        .attr('class', clazz)
        .text(function (d) { return format(d[attr]); });
    }

    // on mouseover data, add hover class to line and row
    function hoverover(d) {
      if (d.row) {
        d.row.classed('hover', true);
        d.line.classed('hover', true);
      }
    }

    // on mouseout of data, remove hover class from line and row
    function hoverout(d) {
      d.line.classed('hover', false);
      if (d.row) d.row.classed('hover', false);
    }

    // creates a table row
    function createTableRow(row) {
      row
        .attr('class', 'beer')
        .style('color', function (d) { return SRM_TO_RGB[d.SRM]; })
        .each(function (d) { d.row = d3.select(this); })
        .html("")
        .on('mouseover', hoverover)
        .on('mouseout', hoverout);

      addCell(row, 'name', 'name');
      addCell(row, 'stat', 'SRM');
      addCell(row, 'stat', 'ABV', percentFormat);
      addCell(row, 'stat', 'IBU');
      addCell(row, 'stat', 'Rating');
    }

    // update the beer list table with the array passed in
    function displayBeerList(activedata) {
      activedata.sort(function (a, b) { return d3.descending(a.Rating, b.Rating); })
      activedata = activedata.slice(0, h / 25);
      var list = d3.select("#beer-list")
        .selectAll(".beer")
        .data(activedata)
        .call(createTableRow);

      list.enter()
        .append('div')
        .call(createTableRow);

      list.exit().each(function (d) { delete d.row; }).remove();
    }

    // initialize
    displayBeerList(beers);
  };

  // initialize
  draw();

  // redraw on window resize
  window.onresize = draw;
});