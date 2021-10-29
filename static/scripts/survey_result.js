$(document).ready(function () {
  $.getJSON("/SurveyResultData", function (data) {
    console.log(data);
    console.log(data.length);

    //policy data
    let policy = [
      { policy: "Shelter-in-place", count: 0 },
      { policy: "Wearing Masks", count: 0 },
      { policy: "Work from Home", count: 0 },
    ];
    for (let i = 0; i < data.length; i++) {
      if (data[i].policy === "shelter") {
        policy[0].count += 1;
      } else if (data[i].policy === "mask") {
        policy[1].count += 1;
      } else {
        policy[2].count += 1;
      }
    }

    console.log(policy);

    //expectation data
    let expectation = [
      { expectation: "Within the next 6 months", count: 0 },
      { expectation: "Within 1 year", count: 0 },
      { expectation: "Never", count: 0 },
    ];
    for (let i = 0; i < data.length; i++) {
      if (data[i].expectation === "1_year") {
        expectation[0].count += 1;
      } else if (data[i].expectation === "next_6_mos") {
        expectation[1].count += 1;
      } else {
        expectation[2].count += 1;
      }
    }
    console.log(expectation);

    //website data
    let website = [
      { website: "Good", count: 0 },
      { website: "Fair", count: 0 },
      { website: "Poor", count: 0 },
    ];
    for (let i = 0; i < data.length; i++) {
      if (data[i].website === "good") {
        website[0].count += 1;
      } else if (data[i].website === "fair") {
        website[1].count += 1;
      } else {
        website[2].count += 1;
      }
    }
    console.log(website);

    //------POLICY-----
    //add svg
    var margin = { top: 20, right: 20, bottom: 70, left: 40 },
      width = 600 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

    var svg = d3
      .select("#survey_result")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //range
    var x = d3.scaleBand().range([0, width]).padding(0.1);
    var y = d3.scaleLinear().range([height, 0]);

    policy.forEach(function (d) {
      console.log(d);
      //domain
      x.domain(
        policy.map(function (d) {
          return d.policy;
        })
      );
      y.domain([
        0,
        d3.max(policy, function (d) {
          return d.count;
        }),
      ]);

      //x axis
      svg
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      //y axis
      svg.append("g").call(d3.axisLeft(y));

      //bar
      svg
        .selectAll(".bar")
        .data(policy)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
          return x(d.policy);
        })
        .attr("width", x.bandwidth())
        .attr("y", function (d) {
          return y(d.count);
        })
        .attr("height", function (d) {
          return height - y(d.count);
        })
        .style("fill", "#ABDDA4");

      svg
        .append("text")
        .attr("text-anchor", "middle")
        .attr("id", "y_axis_label")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 10)
        .attr("x", -height / 2)
        .text("Count");
    });

    //------EXPECTATION-----
    //add svg

    var svg1 = d3
      .select("#survey_result_covid_expection")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //range
    var x1 = d3.scaleBand().range([0, width]).padding(0.1);
    var y1 = d3.scaleLinear().range([height, 0]);

    expectation.forEach(function (d) {
      console.log(d);
      //domain
      x1.domain(
        expectation.map(function (d) {
          return d.expectation;
        })
      );
      y1.domain([
        0,
        d3.max(expectation, function (d) {
          return d.count;
        }),
      ]);

      //x axis
      svg1
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x1));

      //y axis
      svg1.append("g").call(d3.axisLeft(y1));

      //bar
      svg1
        .selectAll(".bar")
        .data(expectation)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
          return x1(d.expectation);
        })
        .attr("width", x.bandwidth())
        .attr("y", function (d) {
          return y1(d.count);
        })
        .attr("height", function (d) {
          return height - y1(d.count);
        })
        .style("fill", "#ABDDA4");

      svg1
        .append("text")
        .attr("text-anchor", "middle")
        .attr("id", "y_axis_label")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 10)
        .attr("x", -height / 2)
        .text("Count");
    });

    //------WEBSITE-----
    //add svg

    var svg2 = d3
      .select("#survey_result_website")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //range
    var x2 = d3.scaleBand().range([0, width]).padding(0.1);
    var y2 = d3.scaleLinear().range([height, 0]);

    website.forEach(function (d) {
      console.log(d);
      //domain
      x2.domain(
        website.map(function (d) {
          return d.website;
        })
      );
      y2.domain([
        0,
        d3.max(website, function (d) {
          return d.count;
        }),
      ]);

      //x axis
      svg2
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x2));

      //y axis
      svg2.append("g").call(d3.axisLeft(y2));

      //bar
      svg2
        .selectAll(".bar")
        .data(website)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function (d) {
          return x2(d.website);
        })
        .attr("width", x.bandwidth())
        .attr("y", function (d) {
          return y2(d.count);
        })
        .attr("height", function (d) {
          return height - y2(d.count);
        })
        .style("fill", "#ABDDA4");

      svg2
        .append("text")
        .attr("text-anchor", "middle")
        .attr("id", "y_axis_label")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 10)
        .attr("x", -height / 2)
        .text("Count");
    });
  });
});
