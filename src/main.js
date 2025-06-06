import { Taxi } from "./taxi";
import { loadChartQuestion1, loadChartQuestion2, loadChartQuestion1PickupHour, clearChart, loadChartQuestion1TotalAmount, loadChartQuestion1AvgRaceDuration } from './plot';

function callbacksQuestion2(dataAvg, dataSum) {
    const avgBtn  = document.querySelector('#avgBtn');
    const sumBtn  = document.querySelector('#sumBtn');
    const clearBtn = document.querySelector('#clearBtn');

    if (!avgBtn || !sumBtn || !clearBtn) {
        return;
    }

    avgBtn.addEventListener('click', async () => {
        clearChart();
        await loadChartQuestion2(dataAvg);
    });

    sumBtn.addEventListener('click', async () => {
        clearChart();
        await loadChartQuestion2(dataSum);
    });

    clearBtn.addEventListener('click', async () => {
        clearChart();
    });
}

const buildChartQuestion2 = async (taxi) => {
    let sql = `
        SELECT
            avg(tip_amount) as tip_amount,
            cast(hour(lpep_pickup_datetime) as int) as hour
        FROM
            taxi_2023
        GROUP BY
            hour
        ORDER BY hour
    `;

    const dataAvg = await taxi.query(sql);
    console.log(dataAvg);

    sql = sql.replace('avg', 'sum');
    const dataSum = await taxi.query(sql);
    console.log(dataSum);

    callbacksQuestion2(dataAvg, dataSum);
}

function callbacksQuestion1(dataDistance, dataPickupHour, dataTotalAmount, AvgRaceDurationData) {
    const distanceBtn  = document.querySelector('#distanceBtn');
    const pickupHourBtn  = document.querySelector('#pickupHourBtn');
    const totalAmountBtn = document.querySelector('#totalAmountBtn');
    const AvgRaceDuration = document.querySelector('#AvgRaceDuration');
    const clearBtn = document.querySelector('#clearBtn');

    if (!distanceBtn || !pickupHourBtn || !totalAmountBtn || !AvgRaceDuration) {
        return;
    }

    distanceBtn.addEventListener('click', async () => {
        clearChart();
        await loadChartQuestion1(dataDistance);
    });

    pickupHourBtn.addEventListener('click', async () => {
        clearChart();
        await loadChartQuestion1PickupHour(dataPickupHour);
    });

    totalAmountBtn.addEventListener('click', async () => {
        clearChart();
        await loadChartQuestion1TotalAmount(dataTotalAmount); // fazer o dataTotalAmount
    })

    AvgRaceDuration.addEventListener('click', async() => {
        clearChart();
        await loadChartQuestion1AvgRaceDuration(AvgRaceDurationData);
    } )

    clearBtn.addEventListener('click', async () => {
        clearChart();
    });
}

const buildChartQuestion1 = async (taxi) => {
    let sqlAvgDistance = `
        SELECT
            avg(trip_distance) as trip_distance,
            CASE
                WHEN dayofweek(lpep_pickup_datetime) IN (0, 6) THEN 'Fim de semana'
                ELSE 'Dia útil'
            END AS day_type
        FROM
            taxi_2023
        GROUP BY
            day_type
        ORDER BY day_type
    `;

    const distanceAvgByDay = await taxi.query(sqlAvgDistance);


    let sqlPickupHour = `
        SELECT
            cast(count(*) as int) as quantity,
            CASE
                WHEN dayofweek(lpep_pickup_datetime) IN (0, 6) THEN 'weekend'
                ELSE 'week_day'
            END AS day_type,
            cast(hour(lpep_pickup_datetime) as int) as hour
        FROM
            taxi_2023
        GROUP BY
            day_type,hour
        ORDER BY day_type, hour
    `;

    const pickupHourData = await taxi.query(sqlPickupHour);
    console.log("sqlPickupHour", pickupHourData);

    let sqlTotalAmount = `
        SELECT
            AVG(total_amount) AS avg_fare,
            CASE
                WHEN DAYOFWEEK(lpep_pickup_datetime) IN (1, 7) THEN 'Fim de semana'
                ELSE 'Dia útil'
        END AS day_type
    FROM
        taxi_2023
    GROUP BY
        day_type
    ORDER BY
        day_type;

    `;

    let sqlAvgRaceDuration = ` 
        SELECT
            avg(EXTRACT(EPOCH FROM (lpep_dropoff_datetime - lpep_pickup_datetime))/60) as trip_duration,
            CASE
                WHEN dayofweek(lpep_pickup_datetime) = 1 THEN 'Segunda'
                WHEN dayofweek(lpep_pickup_datetime) = 2 THEN 'Terça'
                WHEN dayofweek(lpep_pickup_datetime) = 3 THEN 'Quarta'
                WHEN dayofweek(lpep_pickup_datetime) = 4 THEN 'Quinta'
                WHEN dayofweek(lpep_pickup_datetime) = 5 THEN 'Sexta'
                WHEN dayofweek(lpep_pickup_datetime) = 6 THEN 'Sábado'
                WHEN dayofweek(lpep_pickup_datetime) = 0 THEN 'Domingo'
            END AS day_name,
            CASE
                WHEN dayofweek(lpep_pickup_datetime) = 0 THEN 7
                ELSE dayofweek(lpep_pickup_datetime)
            END as day_order
        FROM
            taxi_2023
        GROUP BY
            day_name, day_order
        ORDER BY day_order`;
    
    const totalAmountData = await taxi.query(sqlTotalAmount);
    const AvgRaceDurationData = await taxi.query(sqlAvgRaceDuration);

    callbacksQuestion1(distanceAvgByDay, pickupHourData, totalAmountData, AvgRaceDurationData);
}


const hideButtons = async (selectedQuestion) => {
    const buttonContainerQuestion1 = document.querySelector('.question-1-button-container');
    const buttonContainerQuestion2 = document.querySelector('.question-2-button-container');

    if (selectedQuestion === '1') {
        buttonContainerQuestion2.style.display = 'none';
        buttonContainerQuestion1.style.display = 'flex';

    } else if (selectedQuestion === '2') {
        buttonContainerQuestion1.style.display = 'none';
        buttonContainerQuestion2.style.display = 'flex';
    }
}

const selectListener = () => {
    const select = document.getElementById('question-select');
    if (!select) {
        return;
    }

    hideButtons(select.value);
    select.addEventListener('change', () => {
        clearChart();
        hideButtons(select.value);
    });
}

window.onload = async () => {
    selectListener();
    const taxi = new Taxi();
    
    await taxi.init();
    await taxi.loadTaxi();
    
    await buildChartQuestion1(taxi);
    await buildChartQuestion2(taxi);
};

