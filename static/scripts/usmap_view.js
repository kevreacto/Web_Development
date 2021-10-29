$(document).ready(function () {

    d3.json("../static/lib/states-10m.json")
        .then(function (json) {


            $.getJSON("/US_Table_VaccineData", function (data) {


                for (var i = 0; i < data.length; i++) {

                    //Grab state name
                    var dataState = data[i].Location;

                    //Grab data value, and convert from string to float
                    var dataValue = parseFloat(data[i].Total_vaccinations);

                    //Find the corresponding state inside the GeoJSON
                    for (var j = 0; j < json.features.length; j++) {

                        var jsonState = json.features[j].properties.name;

                        if (dataState == jsonState) {

                            //Copy the data value into the JSON
                            json.features[j].properties.value = dataValue;

                            //Stop looking through the JSON
                            break;

                        }
                    }
                }

                var chart_width = $("#us_map").width()
                var chart_height = $("#us_map").height()

                var margin = { top: 30, right: 30, bottom: 20, left: 20 };
                var width = chart_width - margin.left - margin.right;
                var height = chart_height - margin.top - margin.bottom;


                // Define map projection
                var projection = d3.geoAlbersUsa().translate([width / 2, height / 2]).scale([800]);

                // Degine path generator
                var path = d3.geoPath().projection(projection);

                var svg = d3.select('#us_map').append("svg")
                    .attr('width', width)
                    .attr('height', height)

                var vaccination = []
                data.forEach(function (element) {
                    vaccination.push(element.Total_vaccinations)
                })

                // Define the color range
                var color = d3.scaleQuantile()
                    .domain([d3.quantile(vaccination, 0), d3.quantile(vaccination, 0.2), d3.quantile(vaccination, 0.4), d3.quantile(vaccination, 0.6), d3.quantile(vaccination, 0.8), d3.quantile(vaccination, 1)])
                    .range(["#b3cde0", "#6497b1", "#005b96", "#03396c", "#011f4b"]);

                // Add title
                svg.append("text")
                    .attr("transform", "translate(" + (chart_width / 2) + "," + margin.top + ")")
                    .attr("id", "title")
                    .attr("text-anchor", "middle")
                    .style("font-size", "25px")
                    .style("font-weight", "bold")
                    .text("Total Vaccination in the U.S.");

                // Add legend
                svg.append("g")
                    .attr("class", "legenditem")
                    .attr("transform", "translate(20,50)");

                var legend = d3.legendColor()
                    .shapeWidth(20)
                    .labelFormat(d3.format('.0f'))
                    .scale(color);

                svg.select(".legenditem")
                    .call(legend);

                // Add tip 
                var tool_tip = d3.tip()
                    .attr("class", "d3-tip")
                    .offset([-8, 0])
                    .html(function (d) { return d.properties.name + " : " + d3.format(',')(d.properties.value); });
                svg.call(tool_tip);

                // Create the map
                svg.selectAll("path")
                    .data(json.features)
                    .enter()
                    .append("path")
                    .attr("d", path)
                    .attr("stroke", "white")
                    .attr("stroke-width", 1)
                    .style("fill", function (d) {
                        //Get data value
                        var value = d.properties.value;

                        if (value) {
                            //If value exists…
                            return color(value);
                        } else {
                            //If value is undefined…
                            return "#ccc";
                        }
                    })
                    .on('mouseover', tool_tip.show)
                    .on('mouseout', tool_tip.hide);


            });
        });

});