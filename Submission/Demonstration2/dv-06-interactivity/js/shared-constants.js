// ===== Shared constants: used by histogram.js AND interactions.js =====

// Set up dimensions and margins (Dufour & Meeks inner chart)
const margin = { top: 40, right: 30, bottom: 50, left: 70 };
const width = 800;    // total width of the chart
const height = 400;   // total height of the chart
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// 6.3 set up inner chart variable for scatterplot.
// "S" = scatterplot, so it doesn't clash with the histogram's innerChart. let, because drawScatterplot fills it in.
let innerChartS;

// 6.4 set up tooltip dimensions (minimum size; the tooltip grows to fit brand + model + size)
const tooltipWidth = 65;
const tooltipHeight = 32;

// Set up colours accessible globally
const barColor = "#2d8b8b";   // theme teal
const bodyBackgroundColor = "#ffffff";   // same as the chart card background -> looks like gaps between bars

// Set up the scales (domains and ranges are set in drawHistogram)
const xScale = d3.scaleLinear();
const yScale = d3.scaleLinear();

// 6.3 Set up the scatterplot scales and colour scale (domains and ranges are set in drawScatterplot)
const xScaleS = d3.scaleLinear();
const yScaleS = d3.scaleLinear();
const colorScale = d3.scaleOrdinal();

// Create a bin generator using d3.bin.
// Here so updateHistogram (interactions.js) can re-bin filtered data the same way.
// Fixed 200 kWh bins from 0 to 2800, so filtered data always gives the SAME 14 bins
// (otherwise d3 picks new bin edges for each filter and the bars stop matching the x axis).
const binGenerator = d3.bin()
  .value(d => d.energyConsumption)       // accessor for energyConsumption
  .domain([0, 2800])
  .thresholds(d3.range(200, 2800, 200)); // bin edges: 200, 400, ... 2600

// 6.2 Array of filter options for screen types
// id = matches the screenTech value in the data, label = button text, isActive = selected?
const filters_screen = [
  { id: "all",  label: "All",  isActive: true },
  { id: "LED",  label: "LED",  isActive: false },
  { id: "LCD",  label: "LCD",  isActive: false },
  { id: "OLED", label: "OLED", isActive: false }
];

// Extension: filter options for the most common screen sizes (inches)
const filters_size = [
  { id: "all", label: "All", isActive: true },
  { id: 24,  label: '24"', isActive: false },
  { id: 32,  label: '32"', isActive: false },
  { id: 55,  label: '55"', isActive: false },
  { id: 65,  label: '65"', isActive: false },
  { id: 98,  label: '98"', isActive: false }
];
