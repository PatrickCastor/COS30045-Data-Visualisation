// ===== 6.2 Filters =====
const populateFilters = (data) => {

  // Draw one set of buttons from a filter array, into a div
  const makeButtons = (divId, filters) => {
    d3.select(divId)
      .selectAll(".filter")
      .data(filters)
      .join("button")
        .attr("class", d => `filter ${d.isActive ? "active" : ""}`)
        .text(d => d.label)
        .on("click", (e, d) => {
          console.log("Clicked filter:", e);
          console.log("Clicked filter data:", d);

          // If the clicked filter is not already active, update the active state of the filters
          if (!d.isActive) {
            // only the clicked button becomes active
            filters.forEach(filter => {
              filter.isActive = d.id === filter.id ? true : false;
            });

            // update the button styles: .classed() adds/removes the "active" class
            d3.selectAll(`${divId} .filter`)
              .classed("active", filter => filter.id === d.id ? true : false);

            updateHistogram(data);
            updateScatterplot();   // 6.3 extension: the same buttons filter the scatterplot
          }
        });
  };

  makeButtons("#filters_screen", filters_screen);
  makeButtons("#filters_size", filters_size);    // extension
};

// Does this TV match the selected buttons? Shared by the histogram and the scatterplot.
const matchesFilters = (tv) => {
  // which button is active in each group
  const techId = filters_screen.find(f => f.isActive).id;
  const sizeId = filters_size.find(f => f.isActive).id;
  // "all" = don't filter on that group
  return (techId === "all" || tv.screenTech === techId) &&
         (sizeId === "all" || tv.screenSize === sizeId);
};

// Redraw the bars using only the TVs that match the selected buttons
const updateHistogram = (data) => {
  // 1. Filter the data
  const updatedData = data.filter(matchesFilters);

  // 2. Re-bin the filtered data with the same bin generator (same 14 bins as the full chart)
  const updatedBins = binGenerator(updatedData);

  // 3. Update the bar heights with a transition. Axes stay fixed, so you can
  // compare screen types against the same scale.
  d3.selectAll("#histogram rect")
    .data(updatedBins)
    .transition()
    .duration(500)
    .ease(d3.easeCubicInOut)
    .attr("y", d => yScale(d.length))
    .attr("height", d => innerHeight - yScale(d.length));
};

// 6.3 extension: filter the scatterplot with the same buttons.
// Circles are faded out instead of removed, so they come back in the same place and keep their tooltip events.
const updateScatterplot = () => {
  innerChartS.selectAll("circle")
    .style("pointer-events", d => matchesFilters(d) ? null : "none")   // hidden dots can't show a tooltip
    .transition()
    .duration(500)
    .attr("opacity", d => matchesFilters(d) ? 0.5 : 0);
};

// ===== 6.4 Tooltip on the scatterplot =====
// Built once inside the scatterplot's innerChartS: a rounded rectangle with text on top.
// Starts invisible (opacity 0). .style is used, not .attr, so it overrides any other formatting.
const createTooltip = () => {
  const tooltip = innerChartS
    .append("g")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("pointer-events", "none");   // an invisible tooltip would otherwise still block the circles under it

  // Background rectangle: same colour as the histogram bars, round corners, a bit see-through.
  // tooltipWidth/Height are only the starting size: on hover it is resized to fit the text.
  tooltip
    .append("rect")
      .attr("width", tooltipWidth)
      .attr("height", tooltipHeight)
      .attr("rx", 3)
      .attr("ry", 3)
      .attr("fill", barColor)
      .attr("fill-opacity", 0.9);

  // Extension: three lines of text (brand, model, screen size), one <tspan> per line
  const text = tooltip
    .append("text")
      .attr("x", 10)
      .attr("y", 6)
      .attr("fill", "white")
      .style("font-size", "12px");
  text.append("tspan").attr("class", "tooltip-brand").attr("x", 10).attr("dy", "1.1em").style("font-weight", 900);
  text.append("tspan").attr("class", "tooltip-model").attr("x", 10).attr("dy", "1.3em");
  text.append("tspan").attr("class", "tooltip-size").attr("x", 10).attr("dy", "1.3em");
};

// Show / hide the tooltip when the mouse goes over a circle.
// e = the event (e.target is the circle), d = the TV bound to that circle.
const handleMouseEvents = () => {
  innerChartS.selectAll("circle")
    .on("mouseenter", (e, d) => {
      console.log("Mouse entered circle", d);

      // 1. Fill in the tooltip text. Some model names list many models, so long ones are cut short with "…"
      const model = d.model.length > 24 ? d.model.slice(0, 23) + "…" : d.model;
      d3.select(".tooltip-brand").text(d.brand.toUpperCase());   // capitals, because many brands are acronyms (LG, TCL, JVC)
      d3.select(".tooltip-model").text(model);
      d3.select(".tooltip-size").text(`${d.screenSize}" screen`);

      // Resize the rectangle to fit the text: getBBox() = the size the text takes up on screen
      const box = d3.select(".tooltip text").node().getBBox();
      const w = Math.max(tooltipWidth, box.width + 20);
      const h = Math.max(tooltipHeight, box.height + 14);
      d3.select(".tooltip rect").attr("width", w).attr("height", h);

      // 2. Read the circle centre from the circle itself (getAttribute gives a string, + makes it a number)
      const cx = +e.target.getAttribute("cx");
      const cy = +e.target.getAttribute("cy");

      // 3. Put the tooltip just above the circle, kept inside the svg:
      //    clamp x to the chart edges, and flip it below the circle when it would go off the top
      const x = Math.min(Math.max(cx - w / 2, -margin.left + 4), innerWidth + margin.right - w - 4);
      const y = cy - h - 10 < -margin.top + 4 ? cy + 10 : cy - h - 10;

      d3.select(".tooltip")
        .attr("transform", `translate(${x}, ${y})`)
        .transition()
        .duration(200)
        .style("opacity", 1);
    })
    .on("mouseleave", (e, d) => {
      console.log("Mouse left circle", d);

      // 4. Hide it again and park it out of the way so it can't block other circles
      d3.select(".tooltip")
        .style("opacity", 0)
        .attr("transform", `translate(0, 500)`);
    });
};
