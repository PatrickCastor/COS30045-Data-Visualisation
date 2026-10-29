// ===== 6.1 Load the data =====
// d3.csv reads every value as a string, so the numbers are converted with +
d3.csv("data/W6_TVdata.csv", d => ({
  brand: d.brand,
  model: d.model,
  screenSize: +d.screenSize,               // convert screenSize to a number
  screenTech: d.screenTech,
  energyConsumption: +d.energyConsumption, // convert energyConsumption to a number
  star: +d.star                            // convert star to a number
})).then(data => {
  console.log(data);                       // check the data loaded (4233 rows)

  // Call functions after data is loaded
  drawHistogram(data);
  populateFilters(data);
  drawScatterplot(data);   // 6.3

  // 6.4 called here, after the charts are drawn, so the circles already exist when the events are attached
  createTooltip();
  handleMouseEvents();
}).catch(error => {
  console.error("Error loading the CSV file:", error);
});
