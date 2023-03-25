/* References
    - Teardrop SVG: https://www.w3docs.com/snippets/html/how-to-create-a-teardrop-in-html.html
    - Favicon: https://favicon.io/emoji-favicons/cloud-with-rain/
    - Rounding function: https://www.jacklmoore.com/notes/rounding-in-javascript/
*/
var dataset;
var filteredData;

// Global function called when select element is changed (taken from lab 5)
function onCategoryChanged() {
    var select = d3.select('#categorySelect').node();
    var category = select.options[select.selectedIndex].value;

    updateChart(category);
}

var round = function(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

// Function to create teardrop shaped SVGs (from w3docs)
const teardropPath = "M15 3 Q16.5 6.8 25 18 A12.8 12.8 0 1 1 5 18 Q13.5 6.8 15 3z";
function teardrop(size) {
    size = size / 2;
    return "M " + size + " 0" +
            " Q " + size + " " + (size * 0.6) + " " + (size * 1.6) + " " + (size * 2) +
            " A " + (size * 1.28) + " " + (size * 1.28) + " 0 1 1 " + (size * 0.4) + " " + (size * 2) +
            " Q " + size + " " + (size * 0.6) + " " + size + " 0" +
            " Z";
}

// Colour scheme for cities
const colours = {
    "KSEA": "grey",
    "CLT": "teal",
    "CQT": "aqua",
    "IND": "darkseagreen",
    "JAX": "violet",
    "MDW": "blue",
    "PHL": "indigo",
    "PHX": "mediumslateblue",
    "KHOU": "cornflowerblue",
    "KNYC": "lightgreen"
  };

var svg = d3.select("svg");
var chartG = svg.append('g');

// **** D3 Code ****

d3.csv("/data/precip.csv").then(function(data) {
    dataset = data;

    updateChart("all");
    addLegend();
});

var updateChart = function(selectedCity) {
    size = 5;

    if (selectedCity === "all") {
        filteredData = dataset;
    } else {
        filteredData = dataset.filter(function(d) {
            return d.city === selectedCity;
        });
    }

    var drops = chartG.selectAll('.dropGroup')
        .data(filteredData);

    drops.exit().remove();

    drops.enter()
        .append("g")
        .attr("class", "dropGroup")
        .merge(drops)
        .attr("transform", (d, i) => `translate(${scaleMonth(d.month)}, ${scalePrecip(d.actual_precipitation)})`)
        .attr("width", 5)
        .each(function(d) {
            singleDrop = d3.select(this);
            singleDrop.append("path")
                .attr("d", function(d) { return teardrop(size); })
                .attr("class", "rain")
                .attr("title", function(d) { return d.actual_precipitation; }) // Add tooltip with actual_precipitation value
                .each(function(d) {
                    path = d3.select(this);
                    path.style("fill", function(d) {return colours[d.city];})
            })
        });;
}

var addLegend = function() {
    legend = d3.select("svg")
        .append("g")
        .attr("class", "legend")
        .attr("transform", "translate(730, 50)");

    const legendItem = legend.selectAll("g")
        .data(Object.keys(colours))
        .enter()
        .append("g")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    legendItem.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => colours[d]);

    legendItem.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text(d => d)
        .style("font-size", "12px");
}


// **** Functions to call for scaled values ****

function scaleMonth(month) {
    return monthScale(month);
}

function scalePrecip(actual_precipitation) {
    return precipScale(actual_precipitation);
}

// **** Code for creating scales, axes and labels ****

var monthScale = d3.scaleLinear()
    .domain([1, 12]).range([60,700]);

var precipScale = d3.scaleLinear()
    .domain([0, 0.5]).range([340,20]);

chartG.append('g').attr('class', 'x axis')
    .attr('transform', 'translate(0,345)')
    .call(d3.axisBottom(monthScale).tickFormat(function(d){return d;}));

chartG.append('text')
    .attr('transform','translate(360,380)')
    .text('Month')

chartG.append('g').attr('class', 'y axis')
    .attr('transform', 'translate(55,0)')
    .call(d3.axisLeft(precipScale));

chartG.append('text')
    .attr('transform','translate(10,125) rotate(90)')
    .text('Precipitation (mm)');

chartG.append('text')
    .attr('class', 'title')
    .attr('transform','translate(200,30)')
    .text('Average Monthly Precipitation Worldwide 2015-2016')
    .style('font-weight', 'bold');