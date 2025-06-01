import * as d3 from 'd3';


export async function loadChart(data, margens = { left: 75, right: 50, top: 50, bottom: 75 }) {
    const svg = d3.select('svg');

if (!svg) {
    return;
}

const svgWidth = +svg.style("width").split("px")[0] - margens.left - margens.right
const svgHeight = +svg.style("height").split("px")[0] - margens.top - margens.bottom;

// ---- Escalas
const mapX = d3.scaleBand()
    .domain(data.map(d => d.hour))
    .range([0, svgWidth])
    .padding(0.1);

const tipExtent = d3.extent(data, d => d.tip_amount);
const maxTip = tipExtent[1];
const mapY = d3.scaleLinear()
    .domain([0, maxTip]) 
    .range([svgHeight, 0]); // O eixo é invertido

// ---- Eixos
const xAxis = d3.axisBottom(mapX);
const groupX = svg.selectAll('#axisX').data([0]);

groupX.join('g')
    .attr('id', 'axisX')
    .attr('class', 'x axis')
    .attr('transform', `translate(${margens.left}, ${+svg.style('height').split('px')[0] - margens.bottom})`)
    .call(xAxis)
    .append("text") // Label
    .attr("x", svgWidth / 2)
    .attr("y", 60)
    .style("text-anchor", "middle")
    .style("fill", "black")
    .style("font-size", "1.5em")
    .text("Hora do Dia");;

const yAxis = d3.axisLeft(mapY);
const groupY = svg.selectAll('#axisY').data([0]);

groupY.join('g')
    .attr('id', 'axisY')
    .attr('class', 'y axis')
    .attr('transform', `translate(${margens.left}, ${margens.top})`)
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(svgHeight / 2))
    .attr("y", -70)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", "1.5em")
    .style("fill", "black")
    .text("Gorjeta ($)");

const selection = svg.selectAll('#group').data([0]);
const cGroup = selection.join('g')
        .attr('id', 'group');

const bars = cGroup.selectAll('rect')
    .data(data);

bars.enter()
    .append('rect')
    .attr('x', d => mapX(d.hour))
    .attr('y', d => mapY(d.tip_amount))
    .attr('width', mapX.bandwidth()) 
    .attr('height', d => svgHeight - mapY(d.tip_amount))
    .attr('fill', 'steelblue');

bars.exit()
    .remove();

bars
    .attr('x', d => mapX(d.hour))
    .attr('y', d => mapY(d.tip_amount))
    .attr('width', mapX.bandwidth())
    .attr('height', d => svgHeight - mapY(d.tip_amount))
    .attr('fill', 'steelblue');

d3.select('#group')
    .attr('transform', `translate(${margens.left}, ${margens.top})`);

}

export function clearChart() {
    d3.select('#group')
        .selectAll('rect')
        .remove();

    d3.select('#axisX')
        .selectAll('*')
        .remove();

    d3.select('#axisY')
        .selectAll('*')
        .remove();
    }