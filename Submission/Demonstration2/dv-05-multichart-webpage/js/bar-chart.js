// ===== Exercise 5.1: Vertical bar chart with axis =====
// Data: average energy use of 55-inch TVs for each screen type (made from the 2026 TV data)

// Load in data (same procedure as Exercise 4.4)
d3.csv("data/tv55_screen_tech_energy.csv", d => {
  return {
    Screen_Tech: d.Screen_Tech,
    Energy_Consumption: +d.Energy_Consumption   // => converts to number
  };
}).then(data => {
  console.log(data);

  // sort the energy consumption data, highest first
  data.sort((a, b) => b.Energy_Consumption - a.Energy_Consumption);

  drawBarChart(data);
});

const drawBarChart = data => {
  // Set up inner chart margins and dimensions (D3 margin convention)
  const margin = { top: 40, right: 170, bottom: 25, left: 40 };
  const width = 1000;
  const height = 500;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // svg container for the chart
  const svg = d3.select("#bar-chart")
    .append("svg")
      .attr("viewBox", `0, 0, ${width}, ${height}`);   // border + background now come from the theme in site.css

  // Inner chart group: moves (0,0) in by the left and top margins
  const innerChart = svg
    .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Create scales (ranges are relative to the innerChart, not the svg)
  // x = categories (screen types) -> band scale
  const xScale = d3.scaleBand()
    .domain(data.map(d => d.Screen_Tech))
    .range([0, innerWidth])
    .padding(0.1);

  // y = numbers (energy) -> linear scale. Range is reversed [innerHeight, 0]
  // because svg y grows DOWNWARD; this makes bigger values go UP.
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.Energy_Consumption)])
    .range([innerHeight, 0]);

  // Axes. tickSizeOuter(0) and tickSize(0) remove the x tick marks;
  // tickFormat shows "led" as "LED".
  const bottomAxis = d3.axisBottom(xScale)
    .tickSize(0)
    .tickPadding(8)
    .tickFormat(d => d.toUpperCase());
  const leftAxis = d3.axisLeft(yScale);

  // Add axes. The bottom axis is moved down to the bottom of the inner chart;
  // without the transform it would sit at (0,0), the top.
  innerChart
    .append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(bottomAxis);

  innerChart
    .append("g")
      .call(leftAxis);

  // Add axis label (negative x/y = into the margin area, outside the inner chart)
  innerChart
    .append("text")
      .text("Energy Consumption (kWh)")
      .attr("x", -margin.left)
      .attr("y", -20)
      .attr("text-anchor", "start");

  // Draw bars
  innerChart
    .selectAll(".bar")
    .data(data)
    .join("rect")
      .attr("class", "bar")
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerHeight - yScale(d.Energy_Consumption))  // y scale is 'upside down'
      .attr("x", d => xScale(d.Screen_Tech))
      .attr("y", d => yScale(d.Energy_Consumption))                     // top of the bar
      .attr("fill", "#2d8b8b");   // theme teal

  // Value labels on top of each bar
  innerChart
    .selectAll(".bar-label")
    .data(data)
    .join("text")
      .attr("class", "bar-label")
      .text(d => `${Math.round(d.Energy_Consumption)} kWh`)
      .attr("x", d => xScale(d.Screen_Tech) + xScale.bandwidth() / 2)   // middle of the bar
      .attr("y", d => yScale(d.Energy_Consumption) - 6)                 // just above it
      .attr("text-anchor", "middle")
      .style("font-size", "12px");
};
