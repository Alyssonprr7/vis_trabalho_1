import * as d3 from 'd3';

export async function loadChartQuestion2(data, margens = { left: 75, right: 50, top: 50, bottom: 75 }) {
    const treatedData = data.map(d => ({ x: d.hour, y: d.tip_amount }));
    plotBarChart(treatedData, margens, { x: 'Hora do dia', y: 'Gorjeta ($)' });
}

export async function loadChartQuestion1(data, margens = { left: 75, right: 50, top: 50, bottom: 75 }) {
    const treatedData = data.map(d => ({ x: d.day_type, y: d.trip_distance }));
    plotBarChart(treatedData, margens, { x: 'Dia', y: 'Média da distância (Milhas)' });
}

export async function loadChartQuestion1PickupHour(data, margens = { left: 75, right: 50, top: 50, bottom: 75 }) {
    const svg = d3.select('svg');

    if (!svg) {
        return;
    }

    const svgWidth = +svg.style("width").split("px")[0] - margens.left - margens.right
    const svgHeight = +svg.style("height").split("px")[0] - margens.top - margens.bottom;

    const series = d3.groups(data, d => d.day_type);

    const xExtent = d3.extent(data, d => d.hour);
    const yMax = d3.max(data, d => d.quantity);

    const mapX = d3.scaleLinear()
    .domain(xExtent)
    .range([0, svgWidth]);

    const mapY = d3.scaleLinear()
    .domain([0, yMax])
    .range([svgHeight, 0]);

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
        .text("Hora");

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
        .text("Quantidade de corridas");

    const line = d3.line()
        .x(d => mapX(d.hour))
        .y(d => mapY(d.quantity));

    const selection = svg.selectAll('#group2').data([0]);
    const cGroup = selection.join('g')
            .attr('id', 'group2');

    cGroup.selectAll('.line')
        .data(series)
        .join('path')
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('transform', `translate(${margens.left}, ${margens.top})`)
        .attr('stroke', (d, i) => d3.schemeCategory10[i]) // cores diferentes por tipo
        .attr('stroke-width', 2)
        .attr('d', d => line(d[1]));
   
    // labels
    cGroup.selectAll('.label')
    .data(series)
    .join('text')
    .attr('class', 'label')
    .attr('x', d => mapX(d[1].at(-1).hour + 1.6))
    .attr('y', d => mapY(d[1].at(-1).quantity - 3500))
    .attr('dy', '0.35em')
    .style('fill', (d, i) => d3.schemeCategory10[i])
    .style('font-size', '0.9em')
    .text(d => d[0]);
};

const plotBarChart = (data, margens = { left: 75, right: 50, top: 50, bottom: 75 }, labels) => {
    const svg = d3.select('svg');

    if (!svg) {
        return;
    }

    const svgWidth = +svg.style("width").split("px")[0] - margens.left - margens.right
    const svgHeight = +svg.style("height").split("px")[0] - margens.top - margens.bottom;

    // ---- Escalas
    const mapX = d3.scaleBand()
        .domain(data.map(d => d.x))
        .range([0, svgWidth])
        .padding(0.1);

    const tipExtent = d3.extent(data, d => d.y);
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
        .text(labels.x);

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
        .text(labels.y);

    const selection = svg.selectAll('#group').data([0]);
    const cGroup = selection.join('g')
            .attr('id', 'group');

    const bars = cGroup.selectAll('rect')
        .data(data);

    bars.enter()
        .append('rect')
        .attr('x', d => mapX(d.x))
        .attr('y', d => mapY(d.y))
        .attr('width', mapX.bandwidth()) 
        .attr('height', d => svgHeight - mapY(d.y))
        .attr('fill', 'steelblue');

    bars.exit()
        .remove();

    bars
        .attr('x', d => mapX(d.x))
        .attr('y', d => mapY(d.y))
        .attr('width', mapX.bandwidth())
        .attr('height', d => svgHeight - mapY(d.y))
        .attr('fill', 'steelblue');

    d3.select('#group')
        .attr('transform', `translate(${margens.left}, ${margens.top})`);
}

export function clearChart() {
    d3.select('#group')
        .selectAll('rect')
        .remove();

    d3.select('#group2')
        .selectAll('.line')
        .remove();

    d3.select('#group2')
        .selectAll('text')
        .remove();

    d3.select('#axisX')
        .selectAll('*')
        .remove();

    d3.select('#axisY')
        .selectAll('*')
        .remove();
    }