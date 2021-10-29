$(document).ready(function(){
    $.getJSON("/MainMenuLinechart1", function(data){
        var latest_10days_world_cases = new Map(Object.entries(data));

        // get date from string
        for (d of latest_10days_world_cases.values()) {
            d_tmp = new Date(d.date);
            d.date = new Date(d_tmp.getFullYear(), d_tmp.getMonth(), d_tmp.getDate());
        }

        /* Draw map view here */
        draw_main_menu_linechart_1(latest_10days_world_cases.values())
    });
});

function draw_main_menu_linechart_1(data) {
    //Data from "https://github.com/owid/covid-19-data/blob/master/public/data/jhu/total_cases.csv"
    var lineData = [];

    for (d of data) {
        lineData.push(d);
    }

//    console.log(lineData);

    // Create line chart here
    /* example:*/
    // linechart_container_1 can be found in mainmenu.html
    var chart_width = $("#linechart_container_1").width()
    var chart_height = $("#linechart_container_1").height()

//    console.log(chart_height)
//    console.log(chart_width)

    var margin = {top: 50, right: 30, bottom: 50, left: 75};
    var width = chart_width - margin.left - margin.right;
    var height = chart_height - margin.top - margin.bottom;

//    console.log(height)
//    console.log(width)

    var svg = d3.select("#linechart_container_1")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);

    // Add the title of the chart
    svg.append("text")
        .attr("id", "title")
        .attr("transform", "translate(" + (chart_width / 2) + "," + (chart_height/15) + ")")
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text("Total COVID-19 Cases");

    var plotlines = svg.append("g")
                       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var x = d3.scaleTime()
              .domain(d3.extent(lineData, function(d) { return d.date; }))
              .range([0, width]);
    var y = d3.scaleLinear()
            //   .domain([120000000, 140000000])
              .domain([d3.min(lineData, function(d) { return d.cases; })*0.99, d3.max(lineData, function(d) { return d.cases; })*1.01])
              .range([height, 0]);
    var xAxis = d3.axisBottom(x)
//                  .ticks(d3.timeDay.every(2))
                  .tickFormat(d3.timeFormat('%m/%d'));
    var yAxis = d3.axisLeft(y);


    // Add line chart
    var line = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.cases);  })
    .curve(d3.curveMonotoneX);

    plotlines.append("path")
    .data([lineData])
    .attr("class", "line")
    .attr("d", line)
    .attr("fill", "none")
    .style("stroke-width", 3)
    .style("stroke", "blue");

    // Add the X Axis
    plotlines.append("g")
    .attr("class", "axis")
    .attr("id", "x_axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .attr("dx", "-1.5em")
    .attr("dy", "0.7em")
    .attr("transform", "rotate(-45)");


    // Add the Y Axis
    plotlines.append("g")
    .attr("class", "axis")
    .attr("id", "y_axis")
    .call(yAxis)

    // Add the X label
    plotlines.append("text")
    .attr("id", "x_axis_label")
    .attr("x", width/2)
    .attr("y",height*1.15)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Date");
}