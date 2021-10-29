$(document).ready(function () {
  // Create fake data here, fake_data can be an array or a dictionary
  var n = 10;
  var fake_data = d3.range(n).map(function (d) {
    return d3.randomUniform(1)();
  });

  // Create line chart here
  /* example:*/
  // linechart_container_2 can be found in mainmenu.html
  var chart_width = $("#linechart_container_2").width();
  var chart_height = $("#linechart_container_2").height();
  console.log("hh");

  var margin = { top: 50, right: 10, bottom: 50, left: 25 };
  var width = chart_width - margin.left - margin.right;
  var height = chart_height - margin.top - margin.bottom;

  var svg = d3
    .select("#linechart_container_2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

  // Add the title of the chart
  svg
    .append("text")
    .attr("id", "title")
    .attr(
      "transform",
      "translate(" + chart_width / 2 + "," + chart_height / 15 + ")"
    )
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .text("Total Covid-19 Death Cases");

  var plotlines = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var xScale = d3.scaleLinear().range([0, width]);
  var yScale = d3.scaleLinear().range([height, 0]);
  var xAxis = d3.axisBottom().scale(xScale);
  var yAxis = d3.axisLeft().scale(yScale);

  // Set the domains of X and Y scales based on data
  xScale.domain([0, fake_data.length - 1]);
  yScale.domain([0, d3.max(fake_data)]);

  // Add line chart
  var line = d3
    .line()
    .x(function (d, i) {
      return xScale(i);
    })
    .y(function (d) {
      return yScale(d);
    })
    .curve(d3.curveMonotoneX);

  plotlines
    .append("path")
    .datum(fake_data)
    .attr("class", "line")
    .attr("d", line)
    .attr("fill", "none")
    .style("stroke-width", 3)
    .style("stroke", "red");

  // Add the X Axis
  plotlines
    .append("g")
    .attr("class", "axis")
    .attr("id", "x_axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  // Add the Y Axis
  plotlines.append("g").attr("class", "axis").attr("id", "y_axis").call(yAxis);
});
