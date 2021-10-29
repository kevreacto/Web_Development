$(document).ready(function () {
  // Create fake data here, fake_data can be an array or a dictionary
  var dataset = d3.csv("../static/lib/full_data.csv");
  console.log(typeof dataset);
  //  var parseTime = d3.timeParse("%m/%d/%Y");
  var parseTime = d3.timeParse("%Y-%m-%d");
  var timeConv = d3.timeFormat("%b %y");

  // Create line chart here
  /* example:*/
  // us_line_container can be found in usmap.html
  dataset.then(function (data) {
    data.forEach(function (d) {
      d.date = parseTime(d.date);
      d.new_cases = +d.new_cases;
      d.new_deaths = +d.new_deaths;
      d.total_cases = +d.total_cases;
      d.total_deaths = +d.total_deaths;
      d.weekly_cases = +d.weekly_cases;
      d.weekly_deaths = +d.weekly_deaths;
      d.biweekly_cases = +d.biweekly_cases;
      d.biweekly_deaths = +d.biweekly_deaths;
    });
    console.log(dataset);

    //SVG
    var margin = { top: 50, right: 100, bottom: 50, left: 100 },
      width =
        $("#us_line_container_cases").width() -
        margin.left * 1.5 -
        margin.right * 1.5,
      height =
        $("#us_line_container_cases").height() -
        margin.top * 1.5 -
        margin.bottom * 1.5;

    var svg = d3
      .select("#us_line_container_cases")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //XAXIS
    var x = d3.scaleTime().range([0, width]);

    xScale = x
      .domain(
        d3.extent(data, function (d) {
          //return parseTime(d.date);
          return d.date;
        })
      )
      .nice();

    var xaxis = d3
      .axisBottom()
      .tickFormat(d3.timeFormat("%b %y"))
      .scale(xScale);

    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(xaxis)
      .selectAll("text")
      .attr("y", 0)
      .attr("x", 9)
      .attr("transform", "rotate(60)")
      .style("text-anchor", "start");

    //YAXIS-0
    var y = d3.scaleLinear().rangeRound([height, 0]);

    yScale = y
      .domain([
        0,
        d3.max(data, function (c) {
          return d3.max(data, function (d) {
            return d.new_cases;
          });
        }),
      ])
      .nice();
    var yaxis = d3.axisLeft().scale(yScale);

    svg.append("g").call(yaxis);

    //YAXIS-1
    var y1 = d3.scaleLinear().rangeRound([height, 0]);

    yScale1 = y1
      .domain([
        0,
        d3.max(data, function (c) {
          return d3.max(data, function (d) {
            return d.total_cases;
          });
        }),
      ])
      .nice();
    var yaxis1 = d3.axisRight().scale(yScale1);

    svg
      .append("g")
      .attr("transform", "translate(" + width + " ,0)")
      .call(yaxis1);

    //LINES-NEW CASES
    var valueline1 = d3
      .line()
      .x(function (d) {
        return x(d.date);
      })
      .y(function (d) {
        return y(d.new_cases);
      });
    console.log(data);

    svg
      .append("path")
      .data([data])
      .attr("class", "line")
      .attr("d", valueline1)
      .style("stroke", "red")
      .style("fill", "none");

    // //LINES-NEW DEATHS
    // var valueline2 = d3
    //   .line()
    //   .x(function (d) {
    //     return x(d.date);
    //   })
    //   .y(function (d) {
    //     return y(d.new_deaths);
    //   });
    // console.log(data);

    // svg
    //   .append("path")
    //   .data([data])
    //   .attr("class", "line")
    //   .attr("d", valueline2)
    //   .style("stroke", "blue")
    //   .style("fill", "none");

    //LINES-TOTAL-CASES
    var valueline3 = d3
      .line()
      .x(function (d) {
        return x(d.date);
      })
      .y(function (d) {
        return y1(d.total_cases);
      });
    console.log(data);

    svg
      .append("path")
      .data([data])
      .attr("class", "line")
      .attr("d", valueline3)
      .style("stroke", "purple")
      .style("fill", "none");

    // //LINES-TOTAL-DEATHS
    // var valueline4 = d3
    //   .line()
    //   .x(function (d) {
    //     return x(d.date);
    //   })
    //   .y(function (d) {
    //     return y1(d.total_deaths);
    //   });
    // console.log(data);

    // svg
    //   .append("path")
    //   .data([data])
    //   .attr("class", "line")
    //   .attr("d", valueline4)
    //   .style("stroke", "green")
    //   .style("fill", "none");

    //XAXIS TEXT
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("id", "x_axis_label")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom / 2 + 25)
      .text("Months");

    //YAXIS TEXT-0
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("id", "y_axis_label")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -height / 2)
      .text("New Cases");

    //YAXIS TEXT-1
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("id", "y_axis_label")
      .attr("transform", "rotate(-90)")
      .attr("y", width + margin.right)
      .attr("x", -height / 2)
      .text("Total Cases");

    //LEGEND
    var size = 15;
    svg
      .append("rect")
      .attr("x", 100)
      .attr("y", 10)
      .attr("width", size)
      .attr("height", size)
      .style("fill", "red");

    svg
      .append("text")
      .attr("x", 130)
      .attr("y", 20)
      .text("New Cases")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");

    // svg
    //   .append("rect")
    //   .attr("x", 100)
    //   .attr("y", -10)
    //   .attr("width", size)
    //   .attr("height", size)
    //   .style("fill", "blue");

    // svg
    //   .append("text")
    //   .attr("x", 130)
    //   .attr("y", 0)
    //   .text("New Deaths")
    //   .style("font-size", "15px")
    //   .attr("alignment-baseline", "middle");

    svg
      .append("rect")
      .attr("x", 100)
      .attr("y", 40)
      .attr("width", size)
      .attr("height", size)
      .style("fill", "purple");

    svg
      .append("text")
      .attr("x", 130)
      .attr("y", 50)
      .text("Total Cases")
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");

    // svg
    //   .append("rect")
    //   .attr("x", 100)
    //   .attr("y", 30)
    //   .attr("width", size)
    //   .attr("height", size)
    //   .style("fill", "green");

    // svg
    //   .append("text")
    //   .attr("x", 130)
    //   .attr("y", 40)
    //   .text("Total Deaths")
    //   .style("font-size", "15px")
    //   .attr("alignment-baseline", "middle");

    //TITLE
    svg
      .append("text")
      .attr("x", (width - margin.left * 2 - margin.right * 2) / 2)
      .attr("y", -20)
      .text("United States New Cases & Total Cases");
  });
});
