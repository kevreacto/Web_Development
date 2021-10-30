/* Draw us map view here */
$(document).ready(function () {
  $.getJSON("/US_Table_VaccineData", function (data) {
    var us_vaccine_data = new Map(Object.entries(data));
    var lineData = [];

    for (d of us_vaccine_data.values()) {
      lineData.push(d);
    }

    // console.log(us_vaccine_data)


    var myArray = [];
    data.forEach(function (d, i) {
      // d.total_vaccine = +d.confirmed_cases;
      // Add a new array with the values of each:
      myArray.push([d.Location, d3.format(',')(d.Total_vaccinations)]);
    });

    // console.log(myArray)

    //Revised Version of Table starts from here
    //Make the Table of the number of vaccination at each county
    var table = d3.select("#us_vaccine_container")
      .append("table")
      .style("border", "5px black solid");

    var header = table.append("thead").append("tr");
    header.selectAll("th")
      .data(["State", "Total_vaccinations"])
      .enter()
      .append("th")
      .text(function (d) { return d; });

    var tablebody = table.append("tbody");
    rows = tablebody
      .selectAll("tr")
      .data(myArray)
      .enter()
      .append("tr");


    cells = rows.selectAll("td")
      .data(function (d) {
        return d;
      })
      .enter()
      .append("td")
      .text(function (d) {
        return d;
      });





    // Make the table of US Vaccination at the bottom

    // function tabulate(data, columns) {
    //   var table = d3.select('#us_vaccine_container').append('table')
    //   var thead = table.append('thead')
    //   var tbody = table.append('tbody');

    //   // append the header row
    //   thead.append('tr')
    //     .selectAll('th')
    //     .data(columns).enter()
    //     .append('th')
    //     .text(function (column) { return column; });

    //   // create a row for each object in the data
    //   var rows = tbody.selectAll('tr')
    //     .data(data)
    //     .enter()
    //     .append('tr');

    //   // create a cell in each row for each column
    //   var cells = rows.selectAll('td')
    //     .data(function (row) {
    //       return columns.map(function (column) {
    //         // console.log(column)
    //         // return { column: column, value: d3.format(',')(row.Total_vaccinations) };
    //         return { column: column, value: row[column] };
    //       });
    //     })
    //     .enter()
    //     .append('td')
    //     .text(function (d) { return d.value; });

    //   return table;
    // }

    // tabulate(lineData, ['Location', 'Total_vaccinations'])



    //How to get a bar chart for this 
    var margin = { top: 50, right: 100, bottom: 100, left: 100 },
      width = $("#us_bar_container").width() - margin.left * 2 - margin.right * 2,
      height = $("#us_bar_container").height() - margin.top * 2 - margin.bottom * 2;


    // Filter out data United States
    var barData = lineData.filter(function (d) {
      return d["Location"] !== "United States"
    })

    // append the svg object to the body of the page
    var svg = d3.select("#us_bar_container")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    // X axis
    var x = d3.scaleBand()
      .range([0, width])
      .domain(barData.map(function (d) { return d.Location; }))
      .padding(0.2);

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, d3.max(barData.map(function (d) { return d.Total_vaccinations; }))])
      .range([height, 0]);

    svg.append("g")
      .call(d3.axisLeft(y));

    // Bars
    svg.selectAll("bar-chart")
      .data(barData)
      .enter()
      .filter(function (d) { return d.Location != "United States" })
      .append("rect")
      .attr("x", function (d) { return x(d.Location); })
      .attr("y", function (d) { return y(d.Total_vaccinations); })
      .attr("width", x.bandwidth())
      .attr("height", function (d) { return height - y(d.Total_vaccinations); })
      .attr("fill", "#69b3a2")

    // Add the title of the bar chart 
    svg.append("text")
      .attr("transform", "translate(" + (width / 2) + "," + margin.top + ")")
      .attr("id", "title")
      .attr("text-anchor", "middle")
      .style("font-size", "25px")
      .style("font-weight", "bold")
      .text("U.S. Total Vaccinations Bar Chart");

  });
});


