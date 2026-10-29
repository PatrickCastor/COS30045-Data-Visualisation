// ===== Exercise 4.3: D3 set up =====
// Create an svg inside the responsive container.
// viewBox "0 0 width height" = the svg's own coordinate system;
// the browser scales it to fit the div, which is what makes it responsive.
// 4.6: width shrunk from 1200 to 500 so raw counts (up to 1096) no longer fit -> scales fix that.
//      height dropped from 1600 to 600 so the chart isn't unreasonably long.
const width = 500;
const height = 600;

const svg = d3.select(".responsive-svg-container")
  .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`);   // border + background now come from the theme in site.css

// 4.3 Step 3: test rectangle with hard-coded attributes.
// Commented out now: selectAll("rect") in 4.5 would otherwise pick it up as one of the bars.
// svg
//   .append("rect")
//     .attr("x", 10)
//     .attr("y", 10)
//     .attr("width", 414)
//     .attr("height", 16)
//     .attr("fill", "#2d8b8b");   // theme teal

// ===== Exercise 4.4: Load data from CSV =====
// d3.csv reads every value as a string, so the row conversion function
// uses +d.count to turn count into a number. Column names must match the CSV header.
// Path is relative to index.html (not to this js file).
d3.csv("data/tvBrandCount.csv", d => {
  return {
    brand: d.brand,
    count: +d.count   // => converts to number
  };
}).then(data => {
  // 4.4 Step 3: finding information about the data set
  console.log(data);
  console.log(data.length);                      // number of rows
  console.log(d3.max(data, d => d.count));       // largest count
  console.log(d3.min(data, d => d.count));       // smallest count
  console.log(d3.extent(data, d => d.count));    // [min, max]

  // Sort from biggest to smallest count
  data.sort((a, b) => b.count - a.count);
  console.log(data);

  // Call drawBarChart INSIDE .then, because the data only exists once loading finishes
  drawBarChart(data);
});

// ===== Exercise 4.5: Binding and drawing with data =====
// ===== Exercise 4.6: Scaling charts =====
const drawBarChart = data => {
  // 4.5 values, no longer needed now the band scale works out thickness and spacing:
  // const barHeight = 20;
  // const spacing = 5;

  // 4.6 Step 1: linear scale for the counts (continuous, numerical data).
  // domain = data values in (0 to 1200, a bit above the max count of 1096, for extra space)
  // range  = pixels out (0 to 400; leaves 100px of the 500 viewBox free for labels later)
  const xScale = d3.scaleLinear()
    .domain([0, 1200])
    .range([0, 400]);

  // 4.6 Step 3: band scale for the brands (discrete, categorical data).
  // Splits the svg height into one equal band per brand; padding(0.2) = 20% of each band is a gap.
  const yScale = d3.scaleBand()
    .domain(data.map(d => d.brand))   // list of brand names
    .range([0, height])
    .padding(0.2);

  // ===== Exercise 4.7: Adding labels =====
  // 4.7 Step 1: make room for labels - bars now start 100px in from the left
  const labelSpace = 100;

  // 4.7 Step 2: one group <g> per brand holds its bar AND its labels, so they move together.
  // The group is moved down to the brand's position with transform/translate
  // (like grouping the windows in the 4.1 house).
  const barAndLabel = svg
    .selectAll("g")
    .data(data)
    .join("g")
      .attr("transform", d => `translate(0, ${yScale(d.brand)})`);

  // 4.7 Step 3: add the rectangles back, this time inside each group.
  // (4.5/4.6 version, replaced by the groups:)
  // svg.selectAll("rect").data(data).join("rect")
  barAndLabel
    .append("rect")
      .attr("class", d => `bar bar-${d.count}`)          // class holds the count (check the DOM)
      .attr("width", d => xScale(d.count))               // 4.6: count -> pixels via the scale
      .attr("height", yScale.bandwidth())                // 4.6: thickness from the band scale
      .attr("x", labelSpace)                             // 4.7: start after the label space
      .attr("y", 0)                                      // 4.7: 0, because the group already sets the y position
      .attr("fill", "#2d8b8b");   // theme teal

  // 4.7 Step 4: brand name, right-aligned just before the bar
  barAndLabel
    .append("text")
      .text(d => d.brand)
      .attr("x", labelSpace - 10)
      .attr("y", yScale.bandwidth() / 2 + 4)             // roughly vertically centred on the bar
      .attr("text-anchor", "end")                        // the END of the text sits at x -> right-justified
      .style("font-size", "13px");

  // 4.7 Step 5: the count value, just after the end of the bar
  barAndLabel
    .append("text")
      .text(d => d.count)
      .attr("x", d => labelSpace + xScale(d.count) + 4)
      .attr("y", yScale.bandwidth() / 2 + 4)
      .style("font-size", "13px");
};
