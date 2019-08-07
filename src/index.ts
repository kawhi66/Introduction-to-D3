import data from "./census.json";
import { unique, Row, isYearAndSex } from "./utils";
import * as d3 from "d3";
import d3Legend from "d3-svg-legend";

const width: number = 600;
const height: number = 400;
const margin: { top: number; right: number; bottom: number; left: number } = {
  top: 50,
  right: 50,
  bottom: 50,
  left: 100
};
const container: any = d3
  .select("svg#chart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);
const chart: any = container
  .append("g")
  .attr("id", "chart")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

const ageDomain: Array<any> = unique(data.map(row => row.age_group));
const x: any = d3
  .scaleBand()
  .rangeRound([0, width])
  .padding(0.1)
  .domain(ageDomain);

const peopleDomain: Array<any> = [0, d3.max(data, row => row.people)];
const y: any = d3
  .scaleLinear()
  .range([height, 0])
  .domain(peopleDomain);

const sexDomain: Array<any> = [1, 2];
const maleColor: string = "#42adf4";
const femaleColor: string = "#ff96ca";
const color: any = d3
  .scaleOrdinal()
  .range([maleColor, femaleColor])
  .domain(sexDomain);

const xaxis: any = chart
  .append("g")
  .attr("class", "axis axis--x")
  .attr("transform", `translate(0, ${height})`)
  .call(d3.axisBottom(x));

const yaxis: any = chart
  .append("g")
  .attr("class", "axis axis--y")
  .call(d3.axisLeft(y));

// Add titles
container.selectAll("text").style("font-family", "sans-serif");
const title: any = container
  .append("text")
  .attr("transform", `translate(${(width + margin.left + margin.right) / 2}, 20)`)
  .style("text-anchor", "middle")
  .style("font-weight", 700)
  .text("Census Age Group and Population by Sex");
const ytitle: any = chart
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - height / 2)
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .text("Population");
const xtitle: any = chart
  .append("text")
  .attr("transform", `translate(${width / 2}, ${height + margin.top - 10})`)
  .style("text-anchor", "middle")
  .text("Age Group");

// add legends 1 auto legend
// const legend_auto: any = d3Legend
//   .legendColor()
//   .labels(["Male", "Female"])
//   .scale(color);
// container
//   .append("g")
//   .attr("class", "legend_auto")
//   .style("font-size", 12)
//   .style("font-family", "sans-serif")
//   .attr("transform", "translate(650, 100)")
//   .call(legend_auto);

// add legends 2 manual legend
// const legend: any = chart
//   .selectAll(".legend")
//   .data(color.domain())
//   .enter()
//   .append("g")
//   .attr("class", "legend")
//   .attr("transform", function(i: number) {
//     return `translate(0, ${i * 20})`;
//   })
//   .style("font-family", "sans-serif");
// legend
//   .append("rect")
//   .attr("class", "legend-rect")
//   .attr("x", width + margin.right - 12)
//   .attr("y", 65)
//   .attr("width", 12)
//   .attr("height", 12)
//   .style("fill", color);
// legend
//   .append("text")
//   .attr("class", "legend-text")
//   .attr("x", width + margin.right - 22)
//   .attr("y", 70)
//   .style("font-size", "12px")
//   .attr("dy", ".35em")
//   .style("text-anchor", "end")
//   .text(function(d: number) {
//     return d === 1 ? "Male" : "Female";
//   });

// Creating bars
const state: { year: number; sex: number } = { year: 1900, sex: 2 };
const filteredData: Row[] = data.filter(row => isYearAndSex(row, state.year, state.sex));
const bars: any = chart.selectAll(".bar").data(filteredData);
const enterbars: any = bars
  .enter()
  .append("rect")
  .attr("class", "bar")
  .attr("x", (d: Row) => x(d.age_group))
  .attr("y", (d: Row) => y(d.people))
  .attr("width", x.bandwidth())
  .attr("height", (d: Row) => height - y(d.people))
  .attr("fill", (d: Row) => color(d.sex));

// Creating a dynamic visualization with Update
function updateNaive(sex: number, step: number) {
  state.year += step;
  state.sex = sex;

  const newData = data.filter(row => isYearAndSex(row, state.year, state.sex));
  const bars = chart.selectAll(".bar").data(newData);
  bars
    .transition("update")
    .duration(500)
    .attr("x", (d: Row) => x(d.age_group))
    .attr("y", (d: Row) => y(d.people))
    .attr("height", (d: Row) => height - y(d.people))
    .attr("fill", (d: Row) => color(d.sex));

  const currYearNaive: any = document.getElementById("curr-year-naive");
  if (currYearNaive !== null) {
    currYearNaive.textContent = state.year;
  }
}

const decrement: any = document.getElementById("decrement");
if (decrement !== null) {
  decrement.onclick = () => {
    if (state.year > 1900) {
      updateNaive(state.sex, -10);
    }
  };
}

const increment: any = document.getElementById("increment");
if (increment !== null) {
  increment.onclick = () => {
    if (state.year < 2000) {
      updateNaive(state.sex, 10);
    }
  };
}

const switchSexButton: any = document.getElementById("switch-sex");
if (switchSexButton !== null) {
  switchSexButton.onclick = () => {
    updateNaive(state.sex === 2 ? 1 : 2, 0);
  };
}

const currYearNaive: any = document.getElementById("curr-year-naive");
if (currYearNaive !== null) {
  currYearNaive.textContent = state.year;
}
