// ===== Exercise 5.2: Scatter plot and line chart =====
// Data: average electricity spot price ($ per MWh) in Australia, 1998-2024

// Load the data. Column names must match the CSV header exactly.
// year must be a NUMBER so the line chart treats it as continuous.
d3.csv("data/ARE_Spot_Prices.csv", d => {
  return {
    year: +d["Year"],
    averagePrice: +d["Average Price (notTas-Snowy)"]
  };
}).then(data => {
  console.log(data);
  drawLineChart(data);
});

const drawLineChart = data => {
  // Same margins and size as the 5.1 bar chart, so both charts line up
  const margin = { top: 40, right: 170, bottom: 25, left: 40 };
  const width = 1000;
  const height = 500;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Create scales - both linear, because years and prices are continuous
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.year))   // extent = [min, max] in one go: [1998, 2024]
    .range([0, innerWidth]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.averagePrice)])
    .range([innerHeight, 0]);               // reversed so bigger prices go UP

  // Set up axes
  const bottomAxis = d3.axisBottom(xScale)
    .tickFormat(d3.format("d"));            // format ticks as integers: 2000 not 2,000
  const leftAxis = d3.axisLeft(yScale);

  // svg container and inner chart (same as 5.1)
  const svg = d3.select("#line-chart")
    .append("svg")
      .attr("viewBox", `0, 0, ${width}, ${height}`);   // border + background now come from the theme in site.css

  const innerChart = svg
    .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Add axes
  innerChart
    .append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(bottomAxis);

  innerChart
    .append("g")
      .call(leftAxis);

  // Add y axis label
  innerChart
    .append("text")
      .text("Average Price ($ per MWh)")
      .attr("x", -margin.left)
      .attr("y", -20)
      .attr("text-anchor", "start");

  // Draw a scatter plot: one circle per year
  innerChart
    .selectAll("circle")
    .data(data)
    .join("circle")
      .attr("r", 4)
      .attr("cx", d => xScale(d.year))
      .attr("cy", d => yScale(d.averagePrice))
      .attr("fill", "#2d8b8b");   // theme teal

  // Draw a line. d3.line() turns the data into the "d" path string,
  // using the scales to work out the x and y position of each point.
  const lineGenerator = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.averagePrice));

  innerChart
    .append("path")
      .attr("d", lineGenerator(data))
      .attr("fill", "none")
      .attr("stroke", "#2d8b8b")
      .attr("stroke-width", 2);

  // Label at the end of the line (uses the empty right margin)
  const last = data[data.length - 1];
  innerChart
    .append("text")
      .text("Average Price ($ per MWh)")
      .attr("x", xScale(last.year) + 8)
      .attr("y", yScale(last.averagePrice) + 4)
      .attr("fill", "#3f4d5c")   // text in ink colour, the line itself carries the teal
      .style("font-size", "12px");
};
