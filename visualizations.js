// Constants for the plot
const PLOT_WIDTH = 1400;
const PLOT_HEIGHT = 800;
const ROTATION_SENSITIVITY = 75;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];


let svg, mainGroup, mapPath, mapProjection, colorMapping, mapTitle, infoTooltip, hoveredCountry, hoveredData;
let isCountryHovered = false;

function rotateMap(event) {
  const rotation = mapProjection.rotate();
  const k = ROTATION_SENSITIVITY / mapProjection.scale();
  mapProjection.rotate([rotation[0] + event.dx * k, rotation[1] - event.dy * k]);
  mainGroup.selectAll("path").attr("d", mapPath);
}

function updatechart(topo, data, month) {
  const transition = d3.transition().duration(100);
  const currentYear = data.values().next().value[0].Year;
  //mapTitle.text(`${MONTHS[month]}, ${currentYear}`);
  mapTitle.text(`${currentYear}`);

  const choroMap = mainGroup.selectAll("path").data(topo.features);
  choroMap.exit().remove();

  choroMap.enter().append("path").merge(choroMap).attr("class", "Country").transition(transition).attr("d", mapPath).attr("fill", function (d) {
    d.total = data.get(d.properties["iso_a3"]);
    return d.total ? colorMapping(d.total[month].Temperature) : "#808080"; //default color to gray
  });

  choroMap.on("pointermove", function (event, d) {
    isCountryHovered = true;
    hoveredCountry = d.total ? d.total[0].ISO3 : null;
    hoveredData = hoveredCountry ? data.get(hoveredCountry)[month] : { Country: "No available data", Temperature: "" };
    infoTooltip.html(hoveredData.Country + "<br/>" + hoveredData.Temperature + "℃");
    infoTooltip.style("left", event.pageX + 10 + "px").style("top", event.pageY - 28 + "px").transition().duration(100).style("opacity", 0.9).style("font-size", "10px");
    d3.selectAll(".Country").transition().duration(50).style("opacity", 0.5);
    d3.select(this).transition().duration(50).style("opacity", 1).style("stroke", "#0A0A0A").style("stroke-width", "0.5px");
  }).on("pointerleave", function (event) {
    isCountryHovered = false;
    d3.selectAll(".Country").transition().duration(50).style("opacity", 1);
    d3.select(this).transition().duration(50).style("stroke", "none");
    infoTooltip.transition().duration(100).style("opacity", 0);
  });

  if (isCountryHovered) {
    hoveredData = hoveredCountry ? data.get(hoveredCountry)[month] : { Country: "No available data", Temperature: "" };
    infoTooltip.html(hoveredData.Country + "<br/>" + hoveredData.Temperature + "℃");
  }
}

function initializeChart(canvasElement) {
  svg = d3.select(canvasElement).append("svg").attr("width", PLOT_WIDTH).attr("height", PLOT_HEIGHT);
  mainGroup = svg.append("g");

  mapProjection = d3.geoOrthographic().scale(250).center([0, 0]).translate([PLOT_WIDTH / 2, PLOT_HEIGHT / 2]);
  mapPath = d3.geoPath().projection(mapProjection);

  mapTitle = mainGroup.append("text").attr("class", "x-label").attr("x", PLOT_WIDTH / 2).attr("y", PLOT_HEIGHT - 100).attr("font-size", "20px").attr("text-anchor", "middle");

  colorMapping = d3.scaleLinear().domain([-30, 0, 35]).range(["#008000", "#FFD700", "#FF4500"]); // the color mapping :red, orange, and green

  const legend = mainGroup.append("defs").append("svg:linearGradient").attr("id", "gradient").attr("x1", "100%").attr("y1", "0%").attr("x2", "100%").attr("y2", "100%").attr("spreadMethod", "pad");

  legend.append("stop").attr("offset", "0%").attr("stop-color", "#FF4500").attr("stop-opacity", 1);
  legend.append("stop").attr("offset", "100%").attr("stop-color", "#008000").attr("stop-opacity", 1); // Changed the color to red

  const legendWidth = 110, legendHeight = 300;
  const yScale = d3.scaleLinear().domain([-30, 35]).range([legendHeight, 0]);
  mainGroup.append("rect").attr("width", legendWidth - 100).attr("height", legendHeight).style("fill", "url(#gradient)").attr("transform", "translate(0,200)");

  const yAxis = d3.axisRight(yScale).tickFormat((d) => d + "℃");
  mainGroup.append("g").attr("class", "y axis").attr("transform", "translate(10,200)").call(yAxis);

  svg.call(d3.drag().on("drag", rotateMap));

  infoTooltip = d3.select(".tooltip");
}

export { initializeChart, updatechart };

//////////////////////

// Constants
const MARGIN = { LEFT: 50, RIGHT: 10, TOP: 10, BOTTOM: 50 };
const WIDTH = 500 - MARGIN.LEFT - MARGIN.RIGHT;
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM;

let svg0, x, y, colorScale, xAxisGroup, yAxisGroup, tooltip;
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function initChart(canvasElement) {
  // Visualization canvas
  svg0 = d3.select(canvasElement)
    .append("svg")
    .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
    .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)
    .append("g")
    .attr("transform", "translate(" + MARGIN.LEFT + "," + MARGIN.TOP + ")");

  // Scales
  x = d3.scaleBand().range([0, WIDTH]).padding(0.1).domain(monthNames);
  y = d3.scaleLinear().range([HEIGHT, 0]).domain([-40, 35]);

  // Color scale
  colorScale = d3.scaleLinear().domain([-30, 0, 35]).range(["#FF4500", "#FFD700", "#008000"]); // Using the same color scheme as the last modified code

  // Axes initialization
  xAxisGroup = svg0.append("g").attr("class", "x axis").attr("transform", "translate(0," + HEIGHT + ")");
  yAxisGroup = svg0.append("g").attr("class", "y axis");

  // Tooltip placeholder
  tooltip = d3.select(".tooltip");
}

function updateChart(data) {
  // Update scales
  x.domain(data.map(d => d.Statistics.slice(0, 3)));
  y.domain([0, d3.max(data, d => d.Temperature)]);

  // Update axes
  xAxisGroup.transition().duration(500).call(d3.axisBottom(x));
  yAxisGroup.transition().duration(500).call(d3.axisLeft(y));

  // Update bars
  const bars = svg0.selectAll(".Bar").data(data);

  bars.exit().remove();

  bars.enter()
    .append("rect")
    .attr("class", "Bar")
    .merge(bars)
    .on("pointermove", function(event, d) {
      tooltip.html(d.Statistics + "<br/>" + d.Temperature + "℃")
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 28 + "px")
        .transition()
        .duration(100)
        .style("opacity", 0.9)
        .style("font-size", "10px");
      d3.select(this)
        .transition()
        .duration(50)
        .style("opacity", 1)
        .style("stroke", "black");
    })
    .on("pointerleave", function() {
      d3.select(this).transition().duration(50).style("stroke", "none");
      tooltip.transition().duration(100).style("opacity", 0);
    })
    .transition()
    .duration(500)
    .attr("x", d => x(d.Statistics.slice(0, 3)))
    .attr("y", d => y(d.Temperature))
    .attr("width", x.bandwidth())
    .attr("height", d => HEIGHT - y(d.Temperature))
    .attr("fill", d => colorScale(d.Temperature));
}

export { initChart, updateChart };


///////////////////////
let svgCanvas, mainGroup1, xAxisLabel, yAxisLabel, xScale, yScale, xAxisGroup1, yAxisGroup1, timeFormatParser, monthDateRange, temperatureGradient;

const CHART_MARGIN = { LEFT: 50, RIGHT: 10, TOP: 10, BOTTOM: 50 };
const CHART_WIDTH = 700 - CHART_MARGIN.LEFT - CHART_MARGIN.RIGHT;
const CHART_HEIGHT = 500 - CHART_MARGIN.TOP - CHART_MARGIN.BOTTOM;

function initializeAreaChart(containerID) {
  svgCanvas = d3
    .select(containerID)
    .append('svg')
    .attr('width', CHART_WIDTH + CHART_MARGIN.LEFT + CHART_MARGIN.RIGHT)
    .attr('height', CHART_HEIGHT + CHART_MARGIN.TOP + CHART_MARGIN.BOTTOM);

  mainGroup1 = svgCanvas
    .append('g')
    .attr('transform', `translate(${CHART_MARGIN.LEFT}, ${CHART_MARGIN.TOP})`);
  mainGroup1.append('path').attr('class', 'area-path');

  xAxisLabel = mainGroup1
    .append('text')
    .attr('class', 'x axis-label')
    .attr('x', CHART_WIDTH / 2)
    .attr('y', CHART_HEIGHT + 40)
    .attr('font-size', '30px')
    .attr('text-anchor', 'middle');

  yAxisLabel = mainGroup1
    .append('text')
    .attr('class', 'y axis-label')
    .attr('x', -CHART_HEIGHT / 2)
    .attr('y', -30)
    .attr('font-size', '30px')
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .text('Temperature (℃)');

  // Initialize scales
  timeFormatParser = d3.timeParse('%b');
  monthDateRange = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => timeFormatParser(m));

  xScale = d3.scaleTime().range([0, CHART_WIDTH]).domain(d3.extent(monthDateRange));
  yScale = d3.scaleLinear().range([CHART_HEIGHT, 0]).domain([-30, 35]);

  // Define the gradient
  defineAreaGradient(mainGroup1);

  // Axes
  xAxisGroup1 = mainGroup1.append('g').attr('class', 'x axis').attr('transform', `translate(0, ${CHART_HEIGHT})`);
  yAxisGroup1 = mainGroup1.append('g').attr('class', 'y axis');

  // Initialize the axes
  initializeAxes();
}

// Define the area chart gradient
function defineAreaGradient(group) {
  temperatureGradient = group
    .append('linearGradient')
    .attr('id', 'area-gradient')
    .attr('gradientUnits', 'userSpaceOnUse')
    .attr('x1', 0)
    .attr('y1', yScale(-30))
    .attr('x2', 0)
    .attr('y2', yScale(35));

  temperatureGradient
    .selectAll('stop')
    .data([
      { offset: '0%', color: '#008000' }, // Green for low temperatures
      { offset: '50%', color: '#FFD700' }, // Orange for medium temperatures
      { offset: '100%', color: '#FF4500' } // Red for high temperatures
    ])
    .enter()
    .append('stop')
    .attr('offset', (d) => d.offset)
    .attr('stop-color', (d) => d.color);
}

function initializeAxes() {
  const xAxisCall = d3.axisBottom(xScale).ticks(d3.timeMonth, 1).tickFormat(d3.timeFormat('%b'));
  xAxisGroup1.call(xAxisCall);

  const yAxisCall = d3.axisLeft(yScale);
  yAxisGroup1.call(yAxisCall);
}

// Updates the Area Chart with new data
function updateAreaChart(data) {
  const t = d3.transition().duration(400);

  // Update labels
  xAxisLabel.text(`${data[0].Country}, ${data[0].Year}`);

  // Update domain
  yScale.domain([d3.min(data, (d) => Number(d.Temperature)) < 0 ? -30 : 0, 35]);

  // Path generators for line and area
  const lineGenerator = d3.line().curve(d3.curveMonotoneX).x((d) => xScale(timeFormatParser(d.Statistics.slice(0, 3)))).y((d) => yScale(d.Temperature));

  const areaGenerator = d3.area().curve(d3.curveMonotoneX).x((d) => xScale(timeFormatParser(d.Statistics.slice(0, 3)))).y0(yScale(0)).y1((d) => yScale(d.Temperature));

  // Update the paths
  updatePaths(mainGroup1, data, t, lineGenerator, areaGenerator);

  // Refresh the gradient position
  refreshGradient();
}

// Update the paths for the line and area
function updatePaths(group, data, transition, lineGen, areaGen) {
  const linePath = group.selectAll('path.area-path').datum(data);

  // Update the line path
  linePath
    .merge(linePath.enter().append('path').attr('class', 'line'))
    .transition(transition)
    .attr('fill', 'none')
    .attr('stroke', '#FF4500') // Red for the line stroke
    .attr('stroke-width', 1.5)
    .attr('d', lineGen);

  // Update the area path
  linePath
    .merge(linePath.enter().append('path').attr('class', 'area'))
    .transition(transition)
    .attr('fill', 'url(#area-gradient)')
    .attr('opacity', 0.8)
    .attr('d', areaGen);
}

// Refresh gradient positions based on the new yScale domain
function refreshGradient() {
  temperatureGradient
    .attr('y1', yScale(-30))
    .attr('y2', yScale(35));
}

// Export the setup and update functions
export { initializeAreaChart, updateAreaChart };
