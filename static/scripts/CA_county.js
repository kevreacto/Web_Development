$(document).ready(function(){
    d3.csv("../static/lib/CA_county_level.csv").then(function(data){
        var myArray = [];
        data.forEach(function(d, i){
            d.totalCaseData = +d.confirmed_cases;
            d.totalDeathData = +d.deaths;

            // Add a new array with the values of each:
            myArray.push([d.county, d.totalCaseData, d.totalDeathData]);
        });

        //Make the Table
        var table = d3.select("#table_container")
                        .append("table")
                        .style("border", "5px black solid");

        var header = table.append("thead").append("tr");
        header.selectAll("th")
            .data(["County", "Total COVID-19 Cases", "Total COVID-19 Deaths"])
            .enter()
            .append("th")
            .text(function(d) { return d; });

        var tablebody = table.append("tbody");
        rows = tablebody
                .selectAll("tr")
                .data(myArray)
                .enter()
                .append("tr");


        cells = rows.selectAll("td")
                .data(function(d) {
                    return d;
                })
                .enter()
                .append("td")
                .text(function(d) {
                    return d;
                });
    })

    //Front-End Edit Starts Here:
    //New Code for CA County Map and Covid-19 Cases
    //Data from:
    // (1) "https://raw.githubusercontent.com/datadesk/california-coronavirus-data/master/latimes-county-totals.csv"
    // (2) "https://github.com/datadesk/california-coronavirus-data/blob/master/latimes-county-totals.csv"

    var chart_width = $("#map_container").width()
    var chart_height = $("#map_container").height()

    var margin = {top: 50, right: 10, bottom: 50, left: 75};
    var width = chart_width - margin.left - margin.right;
    var height = chart_height - margin.top - margin.bottom;

    var projection = d3.geoMercator()
                        .scale(width*3)
                        .center([-110, 33])
                        // .rotate([0, 0])
                        // .center([0, 0])


                        // .center([-110, 36])
                        // .scale(2500)
                        .translate([width/2 +width / 2, height / 1.45 - height / 50]);

    var path = d3.geoPath()
                 .projection(projection);

    var svg = d3.select("#map_container").append("svg")
                .attr("width", width)
                .attr("height", height)

    var tip = d3.tip()
                .offset([5,5])
                .style("background-color", "black")
                .style("font-size", "18px")
                .style("color", "white")
                .html(function(d){

                    //Set to N/A if missing data
                    if(d.properties.confirmed_cases == null){
                        d.properties.confirmed_cases = "N/A";
                    }
                    if(d.properties.deaths == null){
                        d.properties.deaths = "N/A";
                    }
                        return "Country: " + d.properties.name
                                        + "<br/> Total COVID-19 Cases: " + d.properties.confirmed_cases
                                        + "<br/> Total COVID-19 Deaths: " + d.properties.deaths
                });

    var county_List = [];
    var county_Data = [];
    var cases_color_array = [];
    var formatDecimal = d3.format(".2f");

    Promise.all([
        d3.dsv(",", "../static/lib/CA_county_level.csv"),
        d3.json("../static/lib/caCountiesTopoSimple.json")
    ]).then(function (values){
        console.log(values);
        county_Data.push(values[0]);
        countries = values[1].objects.subunits.geometries;
        for (var i = 0; i < countries.length; i++) {
            county_List.push(countries[i]);
        }

        var dataB = values[1];

        //Added the Choropleth Scales
        for (var i = 0; i < county_Data[0].length; i++) {
            cases_color_array.push(parseFloat(county_Data[0][i].confirmed_cases));
        }
        cases_color_array.sort(d3.ascending);

        var color = d3.scaleQuantile()
        .domain([d3.quantile(cases_color_array, 0),d3.quantile(cases_color_array, 0.2),d3.quantile(cases_color_array, 0.4),d3.quantile(cases_color_array, 0.6),d3.quantile(cases_color_array, 0.8), d3.quantile(cases_color_array, 1)])
        .range(["#feedde", "#fdbe85", "#fd8d3c", "#e6550d","#a63603"]);

        svg.append("g")
        .attr("class", "legenditem")
        .attr("transform", "translate(10,500)");

        var legend = d3.legendColor()
                        .shapeWidth(20)
                        .labelFormat(d3.format('.0f'))
                        .scale(color);

        svg.select(".legenditem")
             .call(legend);
        svg.append("text")
            .attr("transform", "translate(5,480)")
            .text("Total COVID-19 Cases: ");

        svg.append("path")
            .datum(topojson.feature(dataB, dataB.objects.subunits))
            .attr("class", "land")
            .attr("d", path);


        svg.selectAll(".subunit")
            .data(topojson.feature(dataB, dataB.objects.subunits).features)
            .enter().append("path")
            .style("fill", function(d) {
                var initialColor = "steelblue";
                for (var i = 0; i < county_Data[0].length; i++) {
                        if (d.properties.name == county_Data[0][i].county) {
                                d.properties["confirmed_cases"] =  county_Data[0][i].confirmed_cases
                                d.properties["deaths"] = county_Data[0][i].deaths
                                return color(county_Data[0][i].confirmed_cases);
                        }
                }
                return initialColor;
            })
            .style("stroke", "white")
            .style("stroke-width", "1.5px")
            .attr("d", path)
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .call(tip);


        svg.append("path")
            .datum(topojson.mesh(dataB, dataB.objects.subunits, function(a, b) { return a === b;}))
            .attr("d", path)
            .style("fill", "none")
            .style("stroke", "black")
            .style("stroke-linejoin", "round")
            .style("stroke-width", "3px");
    })
});
