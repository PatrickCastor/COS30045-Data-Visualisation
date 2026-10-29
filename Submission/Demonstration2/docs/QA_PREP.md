# Q&A cheat sheet – read this before the demo

## 4.1 SVG house (`dv-04-svg-house/index.html`)
- SVG origin (0,0) is TOP-LEFT; y grows DOWNWARD.
- rect: x, y, width, height · circle: cx, cy, r · line: x1,y1,x2,y2 · polygon: "x,y x,y ...".
- Later elements draw on top of earlier ones.
- D3 manipulation: the button does `d3.selectAll("#window-left, #window-right").attr("fill", ...)`.

## 4.3–4.7 horizontal bar chart (`dv-04-bar-chart-exercise/js/main.js`)
- 4.3 `viewBox` gives the svg its own coordinate system -> responsive.
- 4.4 `d3.csv(file, rowFn).then(...)` – asynchronous; values are strings so `+d.count`.
  Console: `data.length`, `d3.max`, `d3.min`, `d3.extent`. Data sorted biggest first.
- 4.5 `selectAll("rect").data(data).join("rect")` -> one rect per row; `y = i * (barHeight + spacing)`.
- 4.6 `xScale` linear (numbers -> pixels), `yScale` band (brands -> positions, `bandwidth()` = thickness, `padding(0.2)`).
- 4.7 one `<g>` per brand moved with `translate`, holding the bar + 2 labels; brand uses `text-anchor: end`.
- Data made in KNIME (`knime/2026 TV Data.knwf`, top branch): available + sold in Australia, count per brand, keep brands with 20+ models.

## 5.1 vertical bar chart (`dv-05-multichart-webpage/js/bar-chart.js`)
- Margin convention: `innerChart` group translated by margin.left/top; scales use innerWidth/innerHeight.
- x = `scaleBand` (screen types), y = `scaleLinear` with range `[innerHeight, 0]` (bigger = higher).
- Bar height = `innerHeight - yScale(value)`; bottom axis moved down with `translate(0, innerHeight)`.
- Data made in KNIME (55" branch): cm -> inches with `ceil(screensize/2.54)`, keep 55", GroupBy screen type, Mean energy.

## 5.2 scatter + line chart (`js/line-chart.js`)
- Both scales linear (continuous). `d3.extent` = [min, max] in one call. `tickFormat(d3.format("d"))` -> 2000 not 2,000.
- Circles: one per year (`.data`). Line: `d3.line().x(...).y(...)` builds the path `d` string for the whole array.

## 5.3 donut chart (`js/donut-chart.js`)
- `radius = min(width, height)/2 - 20` so it fits. innerChart moved to the centre (arcs draw around 0,0).
- `scaleOrdinal` + `schemeSet2` = colour per category.
- `d3.pie().value(d => d.Count).sort(null)` -> angles; `d3.arc().innerRadius(radius*0.6)` -> shapes. Pie chart = `innerRadius(0)`.
- Inside the slices the original row is `d.data`. Labels at `arcGenerator.centroid(d)`.
- Data made in KNIME (Rule Engine branch): <43" small, >65" large, else medium; GroupBy count.

## 6.1 histogram (`dv-06-interactivity/js/`)
- Files split by job: `load-data.js` (CSV), `shared-constants.js` (sizes, colours, scales, binGenerator, filter arrays), `histogram.js`, `interactions.js`. Script order matters: d3 first.
- `d3.bin()` groups TVs into ranges; each bin is an array with `x0`/`x1`; bar height = `bin.length`.
- xScale domain `[bins[0].x0, bins[last].x1]` = 0–2800; yScale max = tallest bin (1387).
- Gaps between bars = stroke in the background colour.
- Bins are fixed at 200 kWh so filtered data gives the same 14 bins as the axis.
- Data: supplied by tutor (`knime/W6 TV Data.knwf`: remove duplicates, available + Australia, rename "LCD (LED)" to "LED", cm -> inches, rename columns).

## 6.2 filters (`js/interactions.js`)
- Buttons built from `filters_screen` array with `.data().join("button")`.
- Click: set `isActive` (only the clicked one true), `.classed("active", ...)` restyles buttons, `updateHistogram`.
- `updateHistogram`: filter data -> `binGenerator` -> update rect y/height with `.transition().duration(500).ease(d3.easeCubicInOut)`.
- Axes stay fixed so screen types are compared on the same scale (downside: small groups look tiny).
- Extension: screen-size buttons, combined with screen type (both must match).

## Likely live changes
1. Change a colour (`barColor`, bar `fill`, roof colour).
2. Thicker/thinner bars: `.padding(0.2)` -> 0.5.
3. Donut -> pie: `innerRadius(0)`.
4. Slower transition: `.duration(2000)`.
5. Remove the circles from the line chart (delete the circle block).
6. Explain why the y range is reversed.
