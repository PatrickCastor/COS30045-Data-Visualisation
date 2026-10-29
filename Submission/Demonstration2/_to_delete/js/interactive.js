// Exercise 6: tooltip on hover + filter buttons

const W = 650, H = 400;
const M = { top: 20, right: 20, bottom: 50, left: 60 };

const svg = d3.select("#interactive").append("svg").attr("width", W).attr("height", H);
const tooltip = d3.select("#tooltip");

d3.csv("data/tvs.csv", d => ({ ...d, screenSize: +d.screenSize, energy: +d.energy, star: +d.star }))
  .then(data => {
    console.log(data);

    // Scales use ALL data so the axes stay fixed while filtering
    const x = d3.scaleLinear().domain(d3.extent(data, d => d.screenSize)).nice()
      .range([M.left, W - M.right]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.energy)]).nice()
      .range([H - M.bottom, M.top]);
    const techs = [...new Set(data.map(d => d.screenTech))];
    const color = d3.scaleOrdinal().domain(techs).range(d3.schemeTableau10);

    svg.append("g").attr("transform", `translate(0,${H - M.bottom})`).call(d3.axisBottom(x));
    svg.append("g").attr("transform", `translate(${M.left},0)`).call(d3.axisLeft(y));
    svg.append("text").attr("x", W / 2).attr("y", H - 10).attr("text-anchor", "middle")
      .text("Screen size (inches)");
    svg.append("text").attr("transform", "rotate(-90)").attr("x", -H / 2).attr("y", 15)
      .attr("text-anchor", "middle").text("Energy (kWh/year)");

    // Draw (or redraw) the dots for whatever data is passed in
    function update(rows) {
      svg.selectAll("circle")
        .data(rows, d => d.brand + d.screenTech + d.screenSize)   // key keeps each dot matched to its row
        .join(
          enter => enter.append("circle")
            .attr("cx", d => x(d.screenSize))
            .attr("cy", d => y(d.energy))
            .attr("r", 0)
            .attr("fill", d => color(d.screenTech))
            .call(e => e.transition().duration(500).attr("r", 7)),
          update => update,
          exit => exit.transition().duration(500).attr("r", 0).remove()
        )
        // Tooltip: show on mouseover, follow the mouse, hide on mouseout
        .on("mouseover", (event, d) => {
          tooltip.style("opacity", 1)
            .html(`<b>${d.brand}</b> ${d.screenTech}<br>${d.screenSize}" · ${d.energy} kWh/yr<br>${d.star} stars`);
          d3.select(event.currentTarget).attr("stroke", "#000").attr("stroke-width", 2);
        })
        .on("mousemove", event => {
          tooltip.style("left", event.pageX + 12 + "px").style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", event => {
          tooltip.style("opacity", 0);
          d3.select(event.currentTarget).attr("stroke", null);
        });
    }

    // Filter buttons: "All" plus one per screen technology
    d3.select("#filters").selectAll("button")
      .data(["All", ...techs])
      .join("button")
      .text(d => d)
      .classed("active", d => d === "All")
      .on("click", (event, choice) => {
        d3.selectAll("#filters button").classed("active", d => d === choice);
        update(choice === "All" ? data : data.filter(d => d.screenTech === choice));
      });

    update(data);
  });
