// ===== 6.3 Scatterplot: energy consumption by star rating, coloured by screen type =====
const drawScatterplot = (data) => {
  // Set the dimensions and margins of the chart area (width, height, margin are in shared-constants.js)
  const svg = d3.select("#scatterplot")
    .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`);   // responsive svg

  // Create an inner chart group with margins.
  // No const here: innerChartS is declared in shared-constants.js so interactions.js can use it too.
  innerChartS = svg
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Set up x and y scales (same pattern as the histogram; the scales were made in shared-constants.js)
  // x = star rating, y = energy consumption
  const maxStar = d3.max(data, d => d.star);
  const maxEng = d3.max(data, d => d.energyConsumption);
  console.log("maxStar:", maxStar, "maxEng:", maxEng);

  xScaleS
    .domain([0, maxStar])
    .range([0, innerWidth]);

  yScaleS
    .domain([0, maxEng])
    .range([innerHeight, 0])   // reversed: more energy = higher up
    .nice();

  // Set up colour scale: one HUE per screen type, because screen types are categories, not amounts.
  // Custom colours instead of d3.schemeCategory10 so they match the site theme
  // (teal, orange, violet - checked to stay distinguishable for colour-blind readers).
  // Domain written out (not data.map(d => d.screenTech)) so each type always gets the same colour
  // and the legend reads LED, LCD, OLED - the same order as the filter buttons.
  colorScale
    .domain(["LED", "LCD", "OLED"])
    .range(["#00908a", "#eb6834", "#6250d6"]);

  // Draw the circles: one per TV
  innerChartS
    .selectAll("circle")
    .data(data)
    .join("circle")
      .attr("r", 4)
      .attr("cx", d => xScaleS(d.star))
      .attr("cy", d => yScaleS(d.energyConsumption))
      .attr("fill", d => colorScale(d.screenTech))
      .attr("opacity", 0.5);   // see-through, so overlapping TVs show up darker. No stroke.

  // Add bottom and left axis (same pattern as the histogram)
  innerChartS.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(xScaleS));

  innerChartS.append("g")
    .call(d3.axisLeft(yScaleS));

  // Axis labels. The y label runs vertically along the y axis: rotate(-90) turns it on its side.
  svg.append("text")
    .attr("class", "axis-label")
    .attr("x", width - margin.right)
    .attr("y", height - 8)
    .attr("text-anchor", "end")
    .text("Star Rating");

  svg.append("text")
    .attr("class", "axis-label")
    .attr("transform", `translate(18, ${margin.top + innerHeight / 2}) rotate(-90)`)
    .attr("text-anchor", "middle")
    .text("Labeled Energy Consumption (kWh/year)");

  // Add a legend for the colour scale, in the top right corner of the svg
  const legend = svg
    .append("g")
      .attr("transform", `translate(${width - 100}, ${margin.top})`);   // position the legend

  // Loop through the colour scale domain to create legend entries
  colorScale.domain().forEach((screenTech, i) => {
    // Create a group for each legend entry, spaced 20px apart
    const legendRow = legend
      .append("g")
        .attr("transform", `translate(0, ${i * 20})`);

    // Coloured rectangle for each screenTech
    legendRow.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", colorScale(screenTech));

    // Text next to the rectangle
    legendRow.append("text")
      .attr("x", 20)                       // to the right of the rectangle
      .attr("y", 10)                       // aligned with the rectangle
      .attr("text-anchor", "start")
      .style("alignment-baseline", "middle")
      .style("font-size", "13px")
      .text(screenTech);
  });
};
