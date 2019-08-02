import data from "./census.json";
import * as d3 from "d3";

console.log(data);
const width: number = 600;
const height: number = 400;
const margin: { top: number; right: number; bottom: number; left: number } = {
  top: 50,
  right: 50,
  bottom: 50,
  left: 100
};
const container: any = d3
  .create("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);
