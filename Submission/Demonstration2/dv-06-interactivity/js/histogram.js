// ===== 6.1 Histogram =====
const drawHistogram = (data) => {
  // svg container + inner chart group with margins
  const svg = d3.select("#histogram")
    .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`);   // responsive svg

  const innerChart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Get the bins for our data set using the bin generator.
  // Each bin is an array of the TVs in that energy range, with x0 (min) and x1 (max).
  const bins = binGenerator(data);
  console.log(bins);   // 14 bins

  // Lower and upper bounds of the bins -> xScale domain
  const minEng = bins[0].x0;                  // lower bound of the first bin
  const maxEng = bins[bins.length - 1].x1;    // upper bound of the last bin
  // Tallest bin (most TVs) -> yScale domain
  const binsMaxLength = d3.max(bins, d => d.length);
  console.log("minEng:", minEng, "maxEng:", maxEng, "binsMaxLength:", binsMaxLength);

  // Set the domains and ranges (the scales themselves are made in shared-constants.js)
  xScale
    .domain([minEng, maxEng])
    .range([0, innerWidth]);

  yScale
    .domain([0, binsMaxLength])
    .range([innerHeight, 0])   // reversed: more TVs = taller bar
    .nice();                   // round the axis to clean numbers

  // Draw the bars: one rect per bin
  innerChart
    .selectAll("rect")
    .data(bins)
    .join("rect")
      .attr("x", d => xScale(d.x0))
      .attr("y", d => yScale(d.length))
      .attr("width", d => xScale(d.x1) - xScale(d.x0))
      .attr("height", d => innerHeight - yScale(d.length))
      .attr("fill", barColor)
      .attr("stroke", bodyBackgroundColor)   // stroke the same colour as the background gives the gaps
      .attr("stroke-width", 2);

  // Tooltip: one HTML div, moved to the mouse and filled with the hovered bin's numbers.
  // It reads d when the mouse moves, so after a filter (new bins bound in updateHistogram) it shows the filtered counts.
  const tooltip = d3.select("#histogram")
    .append("div")
      .attr("class", "histogram-tooltip");

  innerChart.selectAll("rect")
    .on("mousemove", (e, d) => {
      const [x, y] = d3.pointer(e, document.querySelector("#histogram"));   // mouse position inside the chart div
      tooltip
        .html(`<strong>${d.x0}–${d.x1} kWh/year</strong><br>${d3.format(",")(d.length)} TVs`)
        .style("left", `${x + 14}px`)
        .style("top", `${y - 14}px`)
        .style("opacity", 1);
      d3.select(e.currentTarget).attr("fill", "#1f6b6b");   // darker teal on the hovered bar
    })
    .on("mouseleave", (e) => {
      tooltip.style("opacity", 0);
      d3.select(e.currentTarget).attr("fill", barColor);
    });

  // Axes (same pattern as Exercise 5.1)
  innerChart.append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(xScale));

  innerChart.append("g")
    .call(d3.axisLeft(yScale));

  // Axis labels
  svg.append("text")
    .attr("class", "axis-label")
    .attr("x", width - margin.right)
    .attr("y", height - 8)
    .attr("text-anchor", "end")
    .text("Labeled Energy Consumption (kWh/year)");

  svg.append("text")
    .attr("class", "axis-label")
    .attr("x", 10)
    .attr("y", 20)
    .text("Frequency");
};
