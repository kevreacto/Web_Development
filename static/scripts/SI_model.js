$(document).ready(function () {
  //   $("a[id *= nav-link]").removeClass("active");
  //   $("#nav-link-SI-model").addClass("active");
  // Create fake data here, fake_data can be an array or a dictionary
  $.getJSON("/SIPredictionData", function (data) {
    //var si_prediction_data = [new Map(Object.values(data))];
    var parseTime = d3.timeParse("%Y-%m-%d");
    var timeConv = d3.timeFormat("%b %y");
    var dataset = [];
    data.forEach(function (d) {
      dataset.push({ cases: d.cases, date: parseTime(d.date) });
    });
    console.log(dataset);

    //SVG
    var margin = { top: 50, right: 100, bottom: 50, left: 100 },
      width =
        $("#SI_model_linechart").width() - margin.left * 2 - margin.right * 2;
    let height = 500;
    //$("#SI_model_linechart").height() - margin.top * 2 - margin.bottom * 2;

    var svg = d3
      .select("#SI_model_linechart")
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
      .tickFormat(d3.timeFormat("%b %y"))
      .scale(xScale);

    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(xaxis);

    //YAXIS-0
    var y = d3.scaleLinear().rangeRound([height, 0]);

    yScale = y
      .domain([
        0,
        d3.max(dataset, function (c) {
          return d3.max(dataset, function (d) {
            return d.cases;
          });
        }),
      ])
      .nice();
    var yaxis = d3.axisLeft().scale(yScale);

    svg.append("g").call(yaxis);

    //LINES-TOTAL CASES
    var valueline = d3
      .line()
      .x(function (d) {
        return x(d.date);
      })
      .y(function (d) {
        return y(d.cases);
      });
    console.log(data);

    svg
      .append("path")
      .data([dataset])
      .attr("class", "line")
      .attr("d", valueline)
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

    //YAXIS TEXT-0
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("id", "y_axis_label")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -height / 2)
      .text("Total Cases");
  });

  //adjust a & b
  //   $("form").submit(function (event) {
  //     var formData = {
  //       a: $("#a").val(),
  //       b: $("#b").val(),
  //     };
  //     console.log(formData);

  //     $.ajax({
  //       type: "POST",
  //       url: "/SISubmit",
  //       data: formData,
  //       dataType: "json",
  //       encode: true,
  //     }).done(function (data) {
  //       console.log(data);
  //     });

  //event.preventDefault();
  //   });
});
