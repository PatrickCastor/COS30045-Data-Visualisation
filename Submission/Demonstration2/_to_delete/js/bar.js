// Exercises 4.3–4.6: bind data to SVG, load CSV, scales, axes

const width = 600, height = 380;
const margin = { top: 20, right: 20, bottom: 50, left: 60 };

// 4.4 Load data from CSV. d3.csv returns a Promise; every value arrives as a string,
// so the row function converts numbers with the unary + operator.
d3.csv("data/tvs.csv", d => ({
  brand: d.brand,
  screenTech: d.screenTech,
  screenSize: +d.screenSize,
  energy: +d.energy
})).then(data => {
  console.log("Loaded rows:", data);            // writing data to console

  // Group rows by screen technology and average the energy column
  const averages = d3.rollups(data, v => d3.mean(v, d => d.energy), d => d.screenTech)
    .map(([tech, energy]) => ({ tech, energy }));
  console.table(averages);

  drawBars(averages);
});

function drawBars(data) {
  const svg = d3.select("#bar").append("svg")
    .attr("width", width).attr("height", height);

  // 4.5 Scales map data values (domain) to pixels (range)
  const x = d3.scaleBand()
    .domain(data.map(d => d.tech))
    .range([margin.left, width - margin.right])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.energy)]).nice()
    .range([height - margin.bottom, margin.top]);   // flipped: SVG y grows downward

  // 4.3 Data binding: selectAll + data + join creates one <rect> per data item
  svg.selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", d => x(d.tech))
    .attr("y", d => y(d.energy))
    .attr("width", x.bandwidth())
    .attr("height", d => y(0) - y(d.energy))
    .attr("fill", "steelblue");

  // Value labels on top of each bar
  svg.selectAll(".label")
    .data(data)
    .join("text")
    .attr("class", "label")
    .attr("x", d => x(d.tech) + x.bandwidth() / 2)
    .attr("y", d => y(d.energy) - 5)
    .attr("text-anchor", "middle")
    .text(d => d.energy.toFixed(0));

  // 4.6 Axes are drawn inside a <g> moved into place with transform
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  // Axis titles
  svg.append("text").attr("x", width / 2).attr("y", height - 10)
    .attr("text-anchor", "middle").text("Screen technology");
  svg.append("text").attr("transform", "rotate(-90)")
    .attr("x", -height / 2).attr("y", 15)
    .attr("text-anchor", "middle").text("Average energy (kWh/year)");
}
