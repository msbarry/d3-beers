d3.select('body')
  .append('div')
    .attr('id', 'beer-list');

d3.csv("beer.csv", function(beers) {
  var colors = [];
  // SRM to RGB
  colors[0] = 'rgb(250, 250, 210)';
  colors[1] = 'rgb(250, 250, 160)';
  colors[2] = 'rgb(250, 250, 105)';
  colors[3] = 'rgb(245, 246, 50)';
  colors[4] = 'rgb(235, 228, 47)';
  colors[5] = 'rgb(225, 208, 50)';
  colors[6] = 'rgb(215, 188, 52)';
  colors[7] = 'rgb(205, 168, 55)';
  colors[8] = 'rgb(198, 148, 56)';
  colors[9] = 'rgb(193, 136, 56)';
  colors[10] = 'rgb(192, 129, 56)';
  colors[11] = 'rgb(192, 121, 56)';
  colors[12] = 'rgb(192, 114, 56)';
  colors[13] = 'rgb(190, 106, 56)';
  colors[14] = 'rgb(180, 99, 56)';
  colors[15] = 'rgb(167, 91, 54)';
  colors[16] = 'rgb(152, 84, 51)';
  colors[17] = 'rgb(138, 75, 48)';
  colors[18] = 'rgb(124, 68, 41)';
  colors[19] = 'rgb(109, 60, 34)';
  colors[20] = 'rgb(95, 53, 23)';
  colors[21] = 'rgb(81, 45, 11)';
  colors[22] = 'rgb(67, 38, 12)';
  colors[23] = 'rgb(52, 30, 17)';
  colors[24] = 'rgb(38, 23, 22)';
  colors[25] = 'rgb(33, 19, 18)';
  colors[26] = 'rgb(28, 16, 15)';
  colors[27] = 'rgb(23, 13, 12)';
  colors[28] = 'rgb(18, 9, 8)';
  colors[29] = 'rgb(13, 6, 5)';
  colors[30] = 'rgb(8, 3, 2)';
  colors[31] = 'rgb(8, 3, 2)';
  colors[32] = 'rgb(8, 3, 2)';
  colors[33] = 'rgb(8, 3, 2)';
  colors[34] = 'rgb(8, 3, 2)';
  colors[35] = 'rgb(8, 3, 2)';
  colors[36] = 'rgb(8, 3, 2)';
  colors[37] = 'rgb(8, 3, 2)';
  colors[38] = 'rgb(8, 3, 2)';
  colors[39] = 'rgb(8, 3, 2)';
  colors[40] = 'rgb(8, 3, 2)';
  colors[41] = 'rgb(8, 3, 2)';
  colors[42] = 'rgb(8, 3, 2)';
  colors[43] = 'rgb(8, 3, 2)';
  colors[44] = 'rgb(8, 3, 2)';
  colors[45] = 'rgb(8, 3, 2)';
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

  var draw = function () {
    d3.selectAll("svg").remove();

    var w = window.innerWidth * 0.7 - m[1] - m[3],
        h = window.innerHeight - m[0] - m[2] - 20;

    var x = d3.scale.ordinal().domain(traits).rangePoints([0, w]),
        y = {};

    var line = d3.svg.line().interpolate("cardinal"),
        foreground;

    var svg = d3.select("body").append("svg:svg")
        .attr("width", w + m[1] + m[3])
        .attr("height", h + m[0] + m[2])
      .append("svg:g")
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
    foreground = svg.append("svg:g")
        .attr("class", "foreground")
      .selectAll("path")
        .data(beers)
      .enter().append("svg:path")
        .attr("d", path)
        .attr("stroke", function(d) { return colors[d.SRM]; });

    foreground
      .append("svg:title").text(function (d) { return d.name; });

    // Add a group element for each trait.
    var g = svg.selectAll(".trait")
        .data(traits)
      .enter().append("svg:g")
        .attr("class", "trait")
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        .call(d3.behavior.drag()
        .origin(function(d) { return {x: x(d)}; })
        .on("dragstart", dragstart)
        .on("drag", drag)
        .on("dragend", dragend));

    // Add an axis and title.
    g.append("svg:g")
        .attr("class", "axis")
        .each(function(d) { d3.select(this).call(axes[d].scale(y[d])); })
      .append("svg:text")
        .attr("text-anchor", "middle")
        .attr("y", -9)
        .text(String);

    // Add a brush for each axis.
    g.append("svg:g")
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

    function createTableRow(row) {
      row.append("div")
        .attr('class', 'name')
        .text(function (d) { return d.name; });
      row.append("div")
        .attr('class', 'stat')
        .text(function (d) { return d.SRM; });
      row.append("div")
        .attr('class', 'stat')
        .text(function (d) { return d.ABV; });
      row.append("div")
        .attr('class', 'stat')
        .text(function (d) { return d.IBU; });
      row.append("div")
        .attr('class', 'stat')
        .text(function (d) { return d.Rating; });
    }

    function displayBeerList(activedata) {
      var s = function (a, b) { return d3.descending(a.Rating, b.Rating); };
      var list = d3.select("#beer-list")
        .selectAll("div.beer")
        .data(activedata);

      list.enter()
        .append("div")
        .attr('class', 'beer')
        .call(createTableRow);

      list.exit().remove();
    }

    displayBeerList(beers);
  };
  draw();
  window.onresize = draw;
});