import * as d3 from 'd3';


export async function loadChart(data, margens = { left: 50, right: 25, top: 25, bottom: 50 }) {
    const svg = d3.select('svg');

if (!svg) {
    return;
}

// ---- Escalas
const distExtent = d3.extent(data, d => d.hour);
const mapX = d3.scaleBand()  // Mudança: scaleBand para barras
    .domain(data.map(d => d.hour))  // Domínio com todos os valores de hora
    .range([0, +svg.style("width").split("px")[0] - margens.left - margens.right])
    .padding(0.1);  // Espaçamento entre as barras

const tipExtent = d3.extent(data, d => d.tip_amount);
const mapY = d3.scaleLinear()
    .domain([0, tipExtent[1]])  // Começar do 0 para barras
    .range([+svg.style("height").split("px")[0] - margens.bottom - margens.top, 0]);

// ---- Eixos
const xAxis = d3.axisBottom(mapX);
const groupX = svg.selectAll('#axisX').data([0]);

groupX.join('g')
    .attr('id', 'axisX')
    .attr('class', 'x axis')
    .attr('transform', `translate(${margens.left}, ${+svg.style('height').split('px')[0] - margens.bottom})`)
    .call(xAxis);

const yAxis = d3.axisLeft(mapY);
const groupY = svg.selectAll('#axisY').data([0]);

groupY.join('g')
    .attr('id', 'axisY')
    .attr('class', 'y axis')
    .attr('transform', `translate(${margens.left}, ${margens.top})`)
    .call(yAxis);

// ---- Barras (substituindo círculos)
const selection = svg.selectAll('#group').data([0]);
const cGroup = selection.join('g')
        .attr('id', 'group');

const bars = cGroup.selectAll('rect')  // rect em vez de circle
    .data(data);

bars.enter()
    .append('rect')
    .attr('x', d => mapX(d.hour))
    .attr('y', d => mapY(d.tip_amount))
    .attr('width', mapX.bandwidth())  // Largura da barra
    .attr('height', d => +svg.style("height").split("px")[0] - margens.bottom - margens.top - mapY(d.tip_amount))  // Altura da barra
    .attr('fill', 'steelblue');  // Cor das barras

bars.exit()
    .remove();

bars
    .attr('x', d => mapX(d.hour))
    .attr('y', d => mapY(d.tip_amount))
    .attr('width', mapX.bandwidth())
    .attr('height', d => +svg.style("height").split("px")[0] - margens.bottom - margens.top - mapY(d.tip_amount))
    .attr('fill', 'steelblue');

d3.select('#group')
    .attr('transform', `translate(${margens.left}, ${margens.top})`);

}

export function clearChart() {
    d3.select('#group')
        .selectAll('circle')
        .remove();

    d3.select('#axisX')
        .selectAll('*')
        .remove();

    d3.select('#axisY')
        .selectAll('*')
        .remove();
    }