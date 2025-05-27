import { Taxi } from "./taxi";
import { loadChart, clearChart } from './plot';

function callbacks(dataAvg, dataSum) {
    const avgBtn  = document.querySelector('#avgBtn');
    const sumBtn  = document.querySelector('#sumBtn');
    const clearBtn = document.querySelector('#clearBtn');

    if (!avgBtn || !sumBtn || !clearBtn) {
        return;
    }

    avgBtn.addEventListener('click', async () => {
        clearChart();
        await loadChart(dataAvg);
    });

    sumBtn.addEventListener('click', async () => {
        clearChart();
        await loadChart(dataSum);
    });

    clearBtn.addEventListener('click', async () => {
        clearChart();
    });
}

window.onload = async () => {
    const taxi = new Taxi();

    await taxi.init();
    await taxi.loadTaxi();

    let sql = `
        SELECT
            avg(tip_amount) as tip_amount,
            cast(hour(lpep_pickup_datetime) as int) as hour
        FROM
            taxi_2023
        GROUP BY
            hour
        ORDER BY hour
        LIMIT ${100}
    `;

    const dataAvg = await taxi.query(sql);
    console.log(dataAvg);

    sql = sql.replace('avg', 'sum');
    const dataSum = await taxi.query(sql);
    console.log(dataSum);

    callbacks(dataAvg, dataSum);
};

