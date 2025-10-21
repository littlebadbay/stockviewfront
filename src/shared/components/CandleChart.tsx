import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { CandlestickChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, DataZoomComponent, ToolboxComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([CandlestickChart, TitleComponent, TooltipComponent, GridComponent, DataZoomComponent, ToolboxComponent, CanvasRenderer]);

function splitData(rawData: (string | number)[][]) {
  const categoryData: string[] = [];
  const values: number[][] = [];
  for (let i = 0; i < rawData.length; i += 1) {
    const d = rawData[i];
    categoryData.push(String(d[0]));
    values.push([Number(d[1]), Number(d[2]), Number(d[3]), Number(d[4])]);
  }
  return { categoryData, values };
}

const sampleData = splitData([
  ['2024-08-01', 2320.26, 2320.26, 2287.3, 2362.94],
  ['2024-08-02', 2300, 2291.3, 2288.26, 2308.38],
  ['2024-08-05', 2295.35, 2346.5, 2295.35, 2346.92],
  ['2024-08-06', 2347.22, 2358.98, 2337.35, 2363.8],
  ['2024-08-07', 2360.75, 2382.48, 2347.89, 2383.76],
  ['2024-08-08', 2383.43, 2385.42, 2371.23, 2391.82],
  ['2024-08-09', 2377.41, 2419.02, 2369.57, 2421.15],
  ['2024-08-12', 2425.92, 2428.15, 2417.58, 2440.38],
  ['2024-08-13', 2411, 2433.13, 2403.3, 2437.42],
  ['2024-08-14', 2432.68, 2434.48, 2427.7, 2441.73],
  ['2024-08-15', 2430.69, 2418.53, 2394.22, 2433.89],
  ['2024-08-16', 2416.62, 2432.4, 2414.4, 2443.03],
  ['2024-08-19', 2441.91, 2421.56, 2415.43, 2444.8],
  ['2024-08-20', 2420.26, 2382.91, 2373.53, 2427.07],
  ['2024-08-21', 2383.49, 2397.18, 2370.61, 2397.94],
  ['2024-08-22', 2378.82, 2325.95, 2309.17, 2378.82],
  ['2024-08-23', 2322.94, 2314.16, 2308.76, 2330.88],
  ['2024-08-26', 2320.62, 2325.82, 2315.01, 2338.78],
  ['2024-08-27', 2313.74, 2293.34, 2289.89, 2340.71],
  ['2024-08-28', 2297.77, 2313.22, 2292.03, 2324.63]
]);

export default function CandleChart({ height = 360 }: { height?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (import.meta.env.MODE === 'test') return undefined;
    if (!ref.current) return undefined;
    const chart = echarts.init(ref.current);

    const option = {
      title: { text: 'Sample Candlestick', left: 0 },
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      toolbox: { feature: { saveAsImage: {}, dataZoom: {} } },
      grid: { left: '10%', right: '10%', bottom: '15%' },
      xAxis: {
        type: 'category',
        data: sampleData.categoryData,
        scale: true,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        splitNumber: 20,
        min: 'dataMin',
        max: 'dataMax'
      },
      yAxis: { scale: true, splitArea: { show: true } },
      dataZoom: [
        { type: 'inside', start: 50, end: 100 },
        { show: true, type: 'slider', top: '90%', start: 50, end: 100 }
      ],
      series: [
        {
          type: 'candlestick',
          name: 'Price',
          data: sampleData.values
        }
      ]
    } as echarts.EChartsCoreOption;

    chart.setOption(option);

    const onResize = () => chart.resize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      chart.dispose();
    };
  }, []);

  return <div ref={ref} style={{ width: '100%', height }} data-testid="candle-chart" />;
}
