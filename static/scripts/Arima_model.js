$(document).ready(function(){
    $("a[id *= nav-link]").removeClass("active");
    $("#nav-link-Arima-model").addClass("active");

    ready();
});

function ready() {
    // enter code to append the game options to the dropdown
    var dropDown = d3.select("#dropdown_container")
        .append("select")
        .attr("class", "selection");

    var options = dropDown.selectAll('option')
        .data(["New Cases", "Death Cases"])
        .enter()
        .append('option')
        .text(function(d) {
            return d;
        }).attr("value", function(d) {
            return d;
        });

    d3.select('.selection')
        .on('change', function() {
            var selected_data_source = d3.select(this).property('value');
            fetch_data_and_draw_linechart(selected_data_source);
        });

    fetch_data_and_draw_linechart("New Cases");
}

function fetch_data_and_draw_linechart(data_source) {
    $.getJSON("/ArimaPredictionData", {data_source: data_source, use_cache: true}, function(data){
        var arima_original_predict_data = new Map(Object.entries(data));

        arima_original_data = arima_original_predict_data.get("original_data")
        arima_predict_data = arima_original_predict_data.get("predict_data")

        console.log(arima_original_predict_data);
        console.log(arima_original_data);
        console.log(arima_predict_data);

        // get date from string
        for (d of arima_original_data.values()) {
            d_tmp = new Date(d.date);
            d.date = new Date(d_tmp.getFullYear(), d_tmp.getMonth(), d_tmp.getDate());
        }

        for (d of arima_predict_data.values()) {
            d_tmp = new Date(d.date);
            d.date = new Date(d_tmp.getFullYear(), d_tmp.getMonth(), d_tmp.getDate());
        }

        /* Draw map view here */
        draw_Arima_linechart(arima_original_data.values(), arima_predict_data.values(), data_source)
    });
}

function draw_Arima_linechart(original_data, predict_data, data_source) {
    //Data from "https://github.com/owid/covid-19-data/blob/master/public/data/jhu/total_cases.csv"
    var lineData = [];
    var original_lineData = [];
    var predict_lineData = [];

    for (d of original_data) {
        lineData.push(d);
        original_lineData.push(d);
    }

    for (d of predict_data) {
        lineData.push(d);
        predict_lineData.push(d);
    }

    // map_container can be found in Arima_model.html
    var chart_width = $("#map_container").width()
    var chart_height = $("#map_container").height()

    var margin = {top: 50, right: 10, bottom: 50, left: 75};
    var width = chart_width - margin.left - margin.right;
    var height = chart_height - margin.top - margin.bottom;

    d3.select("svg").remove();

    var svg = d3.select("#map_container")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);

    // Add the title of the chart
    svg.append("text")
        .attr("id", "title")
        .attr("transform", "translate(" + (chart_width / 2) + "," + (chart_height/15) + ")")
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text(data_source + " in the US");

    var plotlines = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var legend = svg.append("g")
        .attr("id", "legend")
        .attr("transform","translate(" + (chart_width - 180) + "," + (margin.top + 30) + ")")

    var x = d3.scaleTime()
              .domain(d3.extent(lineData, function(d) { return d.date; }))
              .range([0, width]);
    var y = d3.scaleLinear()
              .domain([0, d3.max(lineData, function(d) { return d.cases; })])
              .range([height, 0]);
    var xAxis = d3.axisBottom(x)
                  .ticks(d3.timeMonth.every(1))
                  .tickFormat(d3.timeFormat("%b %Y"));
    var yAxis = d3.axisLeft(y);


    // Add line chart
    var line = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.cases);  })
    .curve(d3.curveMonotoneX);

    plotlines.append("path")
    .data([original_lineData])
    .attr("class", "line")
    .attr("d", line)
    .attr("fill", "none")
    .style("stroke-width", 2)
    .style("stroke", "blue");

    plotlines.append("path")
    .data([predict_lineData])
    .attr("class", "line")
    .attr("d", line)
    .attr("fill", "none")
    .style("stroke-width", 2)
    .style("stroke", "red");

    // Add the X Axis
    plotlines.append("g")
    .attr("class", "axis")
    .attr("id", "x_axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

    // Add the Y Axis
    plotlines.append("g")
    .attr("class", "axis")
    .attr("id", "y_axis")
    .call(yAxis)

    // Add the X label
    plotlines.append("text")
    .attr("transform", "translate(" + (width/2) + "," + (height + margin.bottom - 10) + ")")
    .attr("id", "x_axis_label")
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Date");


    colors = ["blue", "red"]
    // Add legend
    legend.selectAll("rect")
        .data(colors)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", function(d, i){
            return i * 25;
        })
        .attr("height", 15)
        .attr("width", 15)
        .attr("fill", function(d, i){
            return d;
        });

    legend.append("text")
            .attr("transform", "translate(" + 25 + "," + (0 * 25 + 12) + ")")
            .text("original_data");

    legend.append("text")
            .attr("transform", "translate(" + 25 + "," + (1 * 25 + 12) + ")")
            .text("predict_data");
}