$(document).ready(function () {
    $.getJSON("/LatestWorldData", function (data) {
        var latest_world_data = new Map(Object.entries(data));
        console.log(latest_world_data);

        /* Draw map view here */
        d3.json("../static/lib/world_countries.json")
            .then(function (data) {
                draw_world_map(data, latest_world_data);
            });

    });
});

function draw_world_map(world, latest_world_data) {
    var chart_width = $("#map_container").width()
    var chart_height = $("#map_container").height()

    var margin = { top: 30, right: 30, bottom: 20, left: 20 };
    var width = chart_width - margin.left - margin.right;
    var height = chart_height - margin.top - margin.bottom;

    var colors = ['#fff5f0', '#fee0d2', '#fcbba1', '#fc9272', '#fb6a4a', '#ef3b2c', '#cb181d', '#a50f15', '#67000d']
    var case_number = Array.from(latest_world_data.values()).map(num_str => parseInt(num_str));

    quantile = d3.scaleQuantile()
        .domain(case_number)
        .range(colors)

    var projection = d3.geoNaturalEarth1()
        .scale(230)
        .translate([width / 2, height / 2 - height / 50]);

    var path = d3.geoPath()
        .projection(projection);

    // Define SVG
    var svg = d3.select("#map_container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    // Add title
    svg.append("text")
        .attr("transform", "translate(" + (chart_width / 2) + "," + (margin.top * 1.2) + ")")
        .attr("id", "title")
        .attr("text-anchor", "middle")
        .style("font-size", "25px")
        .style("font-weight", "bold")
        .text("Total COVID-19 Cases All Over The World");

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(function (d) {
            var country = d.properties.name;
            if (latest_world_data.has(country)) {
                var cases = parseInt(latest_world_data.get(country));
                return "<span style='color:white'>" +
                    "Country: " + country +
                    "<br>Casesssss: " + d3.format(',')(cases) +
                    "</span>";
            } else {
                return "<span style='color:white'>" +
                    "Country: " + country +
                    "<br>Cases: " + "N/A" +
                    "</span>";
            }
        });
    svg.call(tip);

    // Draw map and fill color
    var choro = svg.append("g")
        .attr("class", "states")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .selectAll("path")
        .data(world.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("fill", function (d) {
            if (latest_world_data.has(d.properties.name)) {
                return quantile(latest_world_data.get(d.properties.name));
            } else {
                return "grey";
            }
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    // Add legend
    var legend = svg.append("g")
        .attr("id", "legend")
        .attr("transform", "translate(" + (margin.left) + "," + (height) + ")");

    quantile_intervals = new Array();
    quantiles = quantile.quantiles().map(num_str => parseInt(num_str));
    for (var i = 0; i < quantiles.length; i++) {
        if (i == 0) {
            quantile_intervals.push([d3.min(case_number), quantiles[i]]);
            quantile_intervals.push([quantiles[i], quantiles[i + 1]]);
        } else if (i == quantiles.length - 1) {
            quantile_intervals.push([quantiles[i], d3.max(case_number)]);
        } else {
            quantile_intervals.push([quantiles[i], quantiles[i + 1]]);
        }
    }
    quantile_intervals.push([]); // add an empty array as no data placeholder

    legend.selectAll("rect")
        .data(quantile_intervals)
        .enter()
        .append("rect")
        .attr("x", function (d, i) {
            if (i == quantile_intervals.length - 1) {
                return width / quantile_intervals.length * i + 20;
            } else {
                return width / quantile_intervals.length * i;
            }
        })
        .attr("y", 0)
        .attr("height", 15)
        .attr("width", 15)
        .attr("fill", function (d, i) {
            if (i == quantile_intervals.length - 1) {
                return "grey";
            } else {
                return quantile(d[0]);
            }
        });

    for (let i = 0; i < quantile_intervals.length; i++) {
        var interval = quantile_intervals[i];
        if (i < quantile_intervals.length - 1) {
            legend.append("text")
                .attr("transform", "translate(" + (width / quantile_intervals.length * i + 20) + "," + 10 + ")")
                .style("font-size", "10px")
                .text(interval[0] + " - " + interval[1]);
        } else {
            legend.append("text")
                .attr("transform", "translate(" + (width / quantile_intervals.length * i + 45) + "," + 10 + ")")
                .style("font-size", "10px")
                .text("No data");
        }
    }
}