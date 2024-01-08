import React, { useEffect, useState } from 'react';
import { usePNCMonitorContext } from '@dreamview/dreamview-core/src/components/panels/PncMonitor/PNCMonitorContext';
import { fill0 } from '@dreamview/dreamview-core/src/util/misc';
import ChartBase, { initOptions } from '@dreamview/dreamview-core/src/components/panels/PncMonitor/Chart/ChartBase';

function Kappa() {
    const [options, setOptions] = useState<any>();
    const { planningData } = usePNCMonitorContext();

    const triggerUIUpdate = (graph: any) => {
        const { dataset, series } = Object.entries(graph)
            .filter(([id]: any) => id === 'ReferenceLine')
            .reduce(
                (result, [key, value]: any) => ({
                    dataset: [...result.dataset, { id: key, source: [['x', 'y'], ...value] }],
                    series: [
                        ...result.series,
                        {
                            datasetId: key,
                            smooth: true,
                            name: key,
                            type: 'line',
                            showSymbol: false,
                            encode: {
                                x: 'x',
                                y: 'y',
                            },
                        },
                    ],
                }),
                {
                    dataset: [],
                    series: [],
                },
            );
        setOptions(
            initOptions({
                dataset,
                series,
                scale: true,
                xAxis: {
                    type: 'value',
                    name: 'S (m)',
                },
                yAxis: {
                    name: 'Kappa',
                    max: 0.2,
                    min: -0.2,
                    interval: 0.05,
                },
                yAxisFormatter(value) {
                    if (Number(value) === 0) {
                        return '0';
                    }
                    const symbol = Number(value) > 0 ? '' : '-';
                    return `${symbol}0.${fill0(Math.abs(value) * 100, 2)}`;
                },
            }),
        );
    };

    useEffect(() => {
        triggerUIUpdate(planningData.referenceKappa);
    }, [planningData]);

    return <ChartBase title='Reference Line Kappa' options={options} />;
}
export default React.memo(Kappa);
