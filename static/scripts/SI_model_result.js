$(document).ready(function () {
  $.getJSON("/SIModelPrediction", function (data) {
    console.log(data);
    dataset = [];
    for (let i = 0; i < 99; i++) {
      dataset.push(data[data.length - 99 + i]);
    }
    console.log(data.length);
    console.log(dataset);

    var parseTime = d3.timeParse("%Y-%m-%d");
    var timeConv = d3.timeFormat("%b %d");
    dataset.forEach(function (d) {
      // d.date = parseTime(d.date);
      d.date = parseTime(d.date);
      d.infection = +d.infection;
      d.removed = +d.removed;
      d.susception = +d.susception;
    });
    console.log(dataset);

    //SVG
    var margin = { top: 50, right: 100, bottom: 50, left: 200 },
      width = $("#si_model_result").width() - margin.left - margin.right,
      height = 300;

    var svg = d3
      .select("#si_model_result")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //XAXIS
    var x = d3.scaleTime().range([0, width]);
    xScale = x
      .domain(
        d3.extent(dataset, function (d) {
          //return parseTime(d.date);
          return d.date;
        })
      )
      .nice();

    var xaxis = d3
      .axisBottom()
      .tickFormat(d3.timeFormat("%b %d"))
      .scale(xScale);

    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(xaxis);

    //YAXIS
    var y = d3.scaleLinear().rangeRound([height, 0]);

    yScale = y
      .domain([
        0,
        d3.max(data, function (c) {
          return d3.max(data, function (d) {
            return d3.max([d.removed, d.infection, d.susception]);
          });
        }),
      ])
      .nice();
    var yaxis = d3.axisLeft().scale(yScale);

    svg.append("g").call(yaxis);

    //LINES-INFECTION
    var valueline = d3
      .line()
      .x(function (d) {
        return x(d.date);
      })
      .y(function (d) {
        return y(d.infection);
      });
    svg
      .append("path")
      .data([dataset])
      .attr("class", "line")
      .attr("d", valueline)
      .style("stroke", "blue")
      .style("fill", "none");

    //LINES-REMOVED
    var valueline1 = d3
      .line()
      .x(function (d) {
        return x(d.date);
      })
      .y(function (d) {
        return y(d.removed);
      });
    svg
      .append("path")
      .data([dataset])
      .attr("class", "line")
      .attr("d", valueline1)
      .style("stroke", "purple")
      .style("fill", "none");

    //LINES-SUSCEPTION
    var valueline2 = d3
      .line()
      .x(function (d) {
        return x(d.date);
      })
      .y(function (d) {
        return y(d.susception);
      });
    svg
      .append("path")
      .data([dataset])
      .attr("class", "line")
      .attr("d", valueline2)
      .style("stroke", "red")
      .style("fill", "none");

    //XAXIS TEXT
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("id", "x_axis_label")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom / 2 + 10)
      .text("Months");

    //YAXIS TEXT
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("id", "y_axis_label")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 120)
      .attr("x", -height / 2)
      .text("Count");

    //LEGEND
    var size = 15;
    svg
      .append("rect")
      .attr("x", 100)
      .attr("y", -40)
      .attr("width", size)
      .attr("height", size)
      .style("fill", "red");

    svg
      .append("text")
      .attr("x", 130)
      .attr("y", -30)
      .text("Susceptible People")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");

    svg
      .append("rect")
      .attr("x", 100)
      .attr("y", -20)
      .attr("width", size)
      .attr("height", size)
      .style("fill", "blue");

    svg
      .append("text")
      .attr("x", 130)
      .attr("y", -10)
      .text("Infectious People")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");

    svg
      .append("rect")
      .attr("x", 100)
      .attr("y", 0)
      .attr("width", size)
      .attr("height", size)
      .style("fill", "purple");

    svg
      .append("text")
      .attr("x", 130)
      .attr("y", 10)
      .text("Removed (Immune/Dead) People")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");
  });
});
