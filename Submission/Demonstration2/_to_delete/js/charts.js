// Exercise 5: scatter, line, pie and histogram on one page

const W = 600, H = 350;
const M = { top: 20, right: 20, bottom: 50, left: 60 };

// Helper: make an SVG inside a div and return it
function makeSvg(id) {
  return d3.select(id).append("svg").attr("width", W).attr("height", H);
}

// Helper: draw both axes plus titles
function drawAxes(svg, x, y, xTitle, yTitle) {
  svg.append("g").attr("transform", `translate(0,${H - M.bottom})`).call(d3.axisBottom(x));
  svg.append("g").attr("transform", `translate(${M.left},0)`).call(d3.axisLeft(y));
  svg.append("text").attr("x", W / 2).attr("y", H - 10).attr("text-anchor", "middle").text(xTitle);
  svg.append("text").attr("transform", "rotate(-90)").attr("x", -H / 2).attr("y", 15)
    .attr("text-anchor", "middle").text(yTitle);
}

// Load both CSV files at the same time, then draw once both have arrived
Promise.all([
  d3.csv("data/tvs.csv", d => ({ ...d, screenSize: +d.screenSize, energy: +d.energy })),
  d3.csv("data/energy_by_year.csv", d => ({ year: +d.year, energy: +d.energy }))
]).then(([tvs, years]) => {
  console.log("TVs:", tvs);
  console.log("Years:", years);
  drawScatter(tvs);
  drawLine(years);
  drawPie(tvs);
  drawHistogram(tvs);
});

function drawScatter(data) {
  const svg = makeSvg("#scatter");
  const x = d3.scaleLinear().domain(d3.extent(data, d => d.screenSize)).nice()
    .range([M.left, W - M.right]);
  const y = d3.scaleLinear().domain([0, d3.max(data, d => d.energy)]).nice()
    .range([H - M.bottom, M.top]);

  svg.selectAll("circle").data(data).join("circle")
    .attr("cx", d => x(d.screenSize))
    .attr("cy", d => y(d.energy))
    .attr("r", 5)
    .attr("fill", "steelblue")
    .attr("opacity", 0.7);

  drawAxes(svg, x, y, "Screen size (inches)", "Energy (kWh/year)");
}

function drawLine(data) {
  const svg = makeSvg("#line");
  const x = d3.scaleLinear().domain(d3.extent(data, d => d.year)).range([M.left, W - M.right]);
  const y = d3.scaleLinear().domain([0, d3.max(data, d => d.energy)]).nice()
    .range([H - M.bottom, M.top]);

  // d3.line() turns an array of points into the "d" string of one <path>
  const line = d3.line().x(d => x(d.year)).y(d => y(d.energy));

  svg.append("path").datum(data)          // datum = the whole array bound to ONE element
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2);

  drawAxes(svg, x, y, "Year", "Average energy (kWh/year)");
  // Redraw the x axis with tickFormat(d3.format("d")) so years show as 2015, not 2,015
  svg.select("g").call(d3.axisBottom(x).tickFormat(d3.format("d")));
}

function drawPie(data) {
  const counts = d3.rollups(data, v => v.length, d => d.screenTech)
    .map(([tech, count]) => ({ tech, count }));
  const radius = Math.min(W, H) / 2 - 20;
  const color = d3.scaleOrdinal().domain(counts.map(d => d.tech)).range(d3.schemeTableau10);

  const g = makeSvg("#pie").append("g").attr("transform", `translate(${W / 2},${H / 2})`);

  // d3.pie() computes start/end angles; d3.arc() turns angles into a path
  const pie = d3.pie().value(d => d.count);
  const arc = d3.arc().innerRadius(0).outerRadius(radius);

  g.selectAll("path").data(pie(counts)).join("path")
    .attr("d", arc)
    .attr("fill", d => color(d.data.tech))
    .attr("stroke", "#fff");

  g.selectAll("text").data(pie(counts)).join("text")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("fill", "#fff")
    .text(d => `${d.data.tech} (${d.data.count})`);
}

function drawHistogram(data) {
  const svg = makeSvg("#histogram");
  const x = d3.scaleLinear().domain(d3.extent(data, d => d.energy)).nice()
    .range([M.left, W - M.right]);

  // d3.bin() groups values into ranges ("bins"); each bin has x0, x1 and length
  const bins = d3.bin().value(d => d.energy).domain(x.domain()).thresholds(x.ticks(8))(data);
  console.log("Bins:", bins);

  const y = d3.scaleLinear().domain([0, d3.max(bins, b => b.length)]).nice()
    .range([H - M.bottom, M.top]);

  svg.selectAll("rect").data(bins).join("rect")
    .attr("x", b => x(b.x0) + 1)
    .attr("y", b => y(b.length))
    .attr("width", b => Math.max(0, x(b.x1) - x(b.x0) - 2))
    .attr("height", b => y(0) - y(b.length))
    .attr("fill", "steelblue");

  drawAxes(svg, x, y, "Energy (kWh/year)", "Number of TV models");
}
