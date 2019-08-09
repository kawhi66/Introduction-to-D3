import data from "./census.json";
import { unique, Row, isYearAndSex } from "./utils";
import * as d3 from "d3";
import d3Legend from "d3-svg-legend";
import d3Tip from "d3-tip";

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
const legend: any = chart
  .selectAll(".legend")
  .data(color.domain())
  .enter()
  .append("g")
  .attr("class", "legend")
  .attr("transform", function(i: number) {
    return `translate(0, ${i * 20})`;
  })
  .style("font-family", "sans-serif");
legend
  .append("rect")
  .attr("class", "legend-rect")
  .attr("x", width + margin.right - 12)
  .attr("y", 65)
  .attr("width", 12)
  .attr("height", 12)
  .style("fill", color);
legend
  .append("text")
  .attr("class", "legend-text")
  .attr("x", width + margin.right - 22)
  .attr("y", 70)
  .style("font-size", "12px")
  .attr("dy", ".35em")
  .style("text-anchor", "end")
  .text(function(d: number) {
    return d === 1 ? "Male" : "Female";
  });

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

// Displaying the selected sex
legend.selectAll(".legend-rect").style("opacity", (d: number) => (d === state.sex ? 1 : 0.5));
legend
  .selectAll(".legend-text")
  .style("opacity", (d: number) => (d === state.sex ? 1 : 0.5))
  .style("font-weight", (d: number) => (d === state.sex ? 700 : 400));
legend.on("click", (d: number) => update(d, 0));
legend.style("cursor", "pointer");

// Creating a dynamic visualization with Update
function updateNaive(sex: number, step: number) {
  state.sex = sex;
  state.year += step;
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

function updateBetter(sex: number, step: number) {
  // Step 1. Data.
  state.sex = sex;
  state.year += step;
  const newData = data.filter(row => isYearAndSex(row, state.year, state.sex));

  // Step 2. Join.
  const bars = chart.selectAll(".bar").data(newData, (d: Row) => {
    if (d.year === state.year) {
      // the age for the current year should match the age - step for the previous year.
      return d.age_group - step;
    } else {
      return d.age_group;
    }
  });

  // Step 3. Enter.
  bars
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d: Row) => x(d.age_group))
    .attr("y", (d: Row) => y(0))
    .attr("width", x.bandwidth())
    .attr("height", 0)
    .attr("fill", (d: Row) => color(d.sex))
    .on("mouseover", function(this: HTMLElement, d: Row) {
      // show the tooltip on mouse over
      tip.show(d, this);
      // when the bar is mouse-overed, we slightly decrease opacity of the bar.
      d3.select(this).style("opacity", 0.7);
    })
    .on("mouseout", function(this: HTMLElement, d: Row) {
      // hide the tooltip on mouse out
      tip.hide();
      d3.select(this).style("opacity", 1);
    })
    .transition("enter-transition")
    .duration(500)
    .attr("y", (d: Row) => y(d.people))
    .attr("height", (d: Row) => height - y(d.people));

  // Step 4. Update.
  bars
    .transition("update-transition")
    .duration(500)
    .attr("x", (d: Row) => x(d.age_group))
    .attr("y", (d: Row) => y(d.people))
    .attr("height", (d: Row) => height - y(d.people))
    .attr("fill", (d: Row) => color(d.sex));

  // Step 5. Exit.
  bars
    .exit()
    .transition("exit-transition")
    .duration(500)
    .attr("height", 0)
    .attr("y", y(0))
    .remove();

  // update legend
  legend.selectAll(".legend-rect").style("opacity", (d: number) => (d === state.sex ? 1 : 0.5));
  legend
    .selectAll(".legend-text")
    .style("opacity", (d: number) => (d === state.sex ? 1 : 0.5))
    .style("font-weight", (d: number) => (d === state.sex ? 700 : 400));

  // update the year text
  const currYearNaive: any = document.getElementById("curr-year-naive");
  if (currYearNaive !== null) {
    currYearNaive.textContent = state.year;
  }
}

const update = updateBetter; // 切换 updateNaive or updateBetter
const decrement: any = document.getElementById("decrement");
if (decrement !== null) {
  decrement.onclick = () => {
    if (state.year > 1900) {
      update(state.sex, -10);
    }
  };
}

const increment: any = document.getElementById("increment");
if (increment !== null) {
  increment.onclick = () => {
    if (state.year < 2000) {
      update(state.sex, 10);
    }
  };
}

const switchSexButton: any = document.getElementById("switch-sex");
if (switchSexButton !== null) {
  switchSexButton.onclick = () => {
    update(state.sex === 2 ? 1 : 2, 0);
  };
}

const currYearNaive: any = document.getElementById("curr-year-naive");
if (currYearNaive !== null) {
  currYearNaive.textContent = state.year;
}

// Creating tooltips
const tip: any = d3Tip()
  .attr("class", "d3-tip")
  .style("color", "white")
  .style("background-color", "black")
  .style("padding", "6px")
  .style("border-radius", "4px")
  .style("font-size", "12px")
  .offset([-10, 0])
  .html(function(d: Row) {
    return `<strong>${d3.format(",")(d.people)}</strong> people`;
  });
container.call(tip);

chart
  .selectAll(".bar")
  .on("mouseover", function(this: HTMLElement, d: Row) {
    // show the tooltip on mouse over
    tip.show(d, this);
    // when the bar is mouse-overed, we slightly decrease opacity of the bar.
    d3.select(this).style("opacity", 0.7);
  })
  .on("mouseout", function(this: HTMLElement, d: Row) {
    // hide the tooltip on mouse out
    tip.hide();
    d3.select(this).style("opacity", 1);
  });
