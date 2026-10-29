// ===== Exercise 5.3: Donut chart =====
// Data: number of TV models in each screen size category
// (made in KNIME: small < 43", medium 43-65", large > 65")

d3.csv("data/tv_screensize_category.csv", d => {
  return {
    Screensize_Category: d.Screensize_Category,
    Count: +d.Count
  };
}).then(data => {
  console.log(data);
  // Not sorted: small/medium/large are categories, and d3.pie() below keeps the file order
  drawDonutChart(data);
});

const drawDonutChart = data => {
  // Set up chart dimensions (same width/height as the other charts)
  const width = 1000;
  const height = 500;
  // Shortest side / 2 = biggest circle that fits; - 20 leaves some padding
  const radius = Math.min(width, height) / 2 - 20;

  // Colour scale: one colour per category.
  // scaleOrdinal maps categories to colours (no position, unlike scaleBand)
  // small -> large is an order, so one hue light -> dark (theme teals) instead of unrelated colours
  const color = d3.scaleOrdinal()
    .domain(["small", "medium", "large"])
    .range(["#a8dadc", "#2d8b8b", "#1a4d5c"]);
  const total = d3.sum(data, d => d.Count);

  // d3.pie() works out the start and end angle of each slice from Count
  const pie = d3.pie()
    .value(d => d.Count)
    .sort(null);                 // disable sorting to keep the original data order

  // d3.arc() turns those angles into a path shape
  const arcGenerator = d3.arc()
    .innerRadius(radius * 0.6)   // inner radius = 60% -> the hole. Set to 0 for a pie chart
    .outerRadius(radius * 1);    // outer radius = 100% of available radius

  // svg container
  const svg = d3.select("#donut-chart")
    .append("svg")
      .attr("viewBox", `0, 0, ${width}, ${height}`);   // border + background now come from the theme in site.css

  // Move (0,0) to the centre of the svg, because arcs are drawn around (0,0)
  const innerChart = svg
    .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // Bind data and create the donut chart
  innerChart
    .selectAll("path")
    .data(pie(data))
    .join("path")
      .attr("d", arcGenerator)
      .attr("fill", d => color(d.data.Screensize_Category))   // pie() puts the original row in d.data
      .attr("stroke", "white")
      .attr("stroke-width", 2);

  // Labels in the middle of each slice. centroid() = centre point of the arc
  innerChart
    .selectAll("text")
    .data(pie(data))
    .join("text")
      .text(d => `${d.data.Screensize_Category} ${Math.round(d.data.Count / total * 100)}%`)
      .attr("transform", d => `translate(${arcGenerator.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("fill", d => d.data.Screensize_Category === "small" ? "#1a2332" : "#ffffff")  // dark text on the light slice
      .style("font-size", "16px")
      .style("font-weight", "600");
};
