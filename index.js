import * as viz from "./visualizations.js";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const firstYear = 1920;
const lastYear = 2020;
let country = "ALB";
let year = firstYear;
let month = 0;

// Init slider variables
const slider = document.getElementById("yearSlider");
slider.min = firstYear;
slider.max = lastYear;

// Init charts
viz.initializeAreaChart("#areaChart");
viz.initChart("#polarArea");
viz.initializeChart("#choroplethMap");

// Datasets to load
const dataPromises = [
  d3.csv("data/TEMP2.csv"),
  d3.csv("data/HadCRUT4.csv"),
  d3.json("data/custom.geo-2.json"),
];

// Load datasets and start visualization
Promise.all(dataPromises).then(function (data) {
  const topoData = data[2];
  // Group data per country and per year
  const tempData = d3.group(
    data[0],
    (d) => d.Year,
    (d) => d.ISO3,
  );
  const anomalyData = d3.group(data[1], (d) => d.Year);

  function updateCharts() {
    const yearData = tempData.get(String(year));
    const countryData = yearData.get(country);
    viz.updateChart(countryData);
    viz.updateAreaChart(countryData);
    viz.updatechart(topoData, yearData, month);
  }
  updateCharts();

  let interval = d3.interval(() => {
    year = year < lastYear ? year + 1 : firstYear;
    slider.value = year;
    updateCharts();
  }, 400);

  // UI
  // Slider
  let moving = true;
  slider.addEventListener("input", (event) => {
    if (moving) {
      interval.stop();
    }
    year = +slider.value;
    updateCharts();
  });
  slider.addEventListener("pointerup", (event) => {
    if (moving) {
      interval = d3.interval(() => {
        year = year < lastYear ? year + 1 : firstYear;
        slider.value = year;
        updateCharts();
      }, 400);
    }
  });

  const playButton = d3.select("#play-button");
  playButton.on("click", function () {
    const button = d3.select(this);
    if (button.text() == "Pause") {
      moving = false;
      interval.stop();
      button.text("Play");
    } else {
      moving = true;
      interval = d3.interval(() => {
        year = year < lastYear ? year + 1 : firstYear;
        slider.value = year;
        updateCharts();
      }, 400);
      button.text("Pause");
    }
  });

  // Add years to years drop down menu
  for (let year of tempData.keys()) {
    document.getElementById("year-list").innerHTML +=
      `<li><a class="dropdown-item">${year}</a></li>`;
  }
  // Change year according to year menu
  document.querySelectorAll("#year-list li").forEach((item) =>
    item.addEventListener("click", (event) => {
      year = +event.target.innerHTML;
      slider.value = year;
      updateCharts();
    }),
  );

  // Add countries to countries drop down menu
  for (let [iso, isoData] of tempData.get(String(firstYear))) {
    const countryName = isoData[0].Country;
    document.getElementById("country-list").innerHTML +=
      `<li><a class="dropdown-item" value=${iso}>${countryName}</a></li>`;
  }
  // Change country according to country menu
  document.querySelectorAll("#country-list li").forEach((item) =>
    item.addEventListener("click", (event) => {
      country = event.target.getAttribute("value");
      updateCharts();
    }),
  );
});

