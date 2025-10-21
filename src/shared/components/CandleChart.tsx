import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts/core';
import { CandlestickChart, LineChart, BarChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  ToolboxComponent,
  LegendComponent,
  DatasetComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { Interval } from '../api/history';
import { fetchHistory } from '../api/history';
import { BOLL, EMA as calcEMA, MACD as calcMACD, RSI as calcRSI, SMA as calcSMA, extractCloses } from '../indicators';

echarts.use([
  CandlestickChart,
  LineChart,
  BarChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DataZoomComponent,
  ToolboxComponent,
  LegendComponent,
  DatasetComponent,
  CanvasRenderer
]);

export interface CandleChartProps {
  symbol: string;
  interval: Interval;
  showMA?: boolean;
  showEMA?: boolean;
  showBOLL?: boolean;
  showMACD?: boolean;
  showRSI?: boolean;
  height?: number;
}

export default function CandleChart({
  symbol,
  interval,
  showMA = true,
  showEMA = false,
  showBOLL = false,
  showMACD = false,
  showRSI = false,
  height = 520
}: CandleChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.EChartsType | null>(null);
  const [loading, setLoading] = useState(false);

  const upColor = '#26a69a';
  const downColor = '#ef5350';

  // fetch data when symbol/interval changes
  useEffect(() => {
    if (import.meta.env.MODE === 'test') return; // do nothing in tests
    let alive = true;
    (async () => {
      setLoading(true);
      const data = await fetchHistory(symbol, interval, 1500);
      if (!alive) return;
      setLoading(false);
      const closes = extractCloses(data);

      const source = data.map((d) => [
        d.time,
        +d.open.toFixed(4),
        +d.high.toFixed(4),
        +d.low.toFixed(4),
        +d.close.toFixed(4),
        +d.volume.toFixed(2),
        d.close >= d.open ? 1 : -1
      ]);

      const ma5 = calcSMA(closes, 5);
      const ma10 = calcSMA(closes, 10);
      const ma20 = calcSMA(closes, 20);
      const ma50 = calcSMA(closes, 50);
      const ema12 = calcEMA(closes, 12);
      const ema26 = calcEMA(closes, 26);
      const boll = BOLL(closes, 20, 2);
      const macd = calcMACD(closes, 12, 26, 9);
      const rsi = calcRSI(closes, 14);

      // build option
      const grids: echarts.EChartsOption['grid'] = [];
      const xAxes: echarts.EChartsOption['xAxis'] = [];
      const yAxes: echarts.EChartsOption['yAxis'] = [];
      const series: echarts.EChartsOption['series'] = [];

      // dynamic heights
      const macdOn = showMACD;
      const rsiOn = showRSI;
      const nExtra = (macdOn ? 1 : 0) + (rsiOn ? 1 : 0);
      const priceH = nExtra === 0 ? 68 : nExtra === 1 ? 60 : 55;
      const volH = nExtra === 0 ? 32 : nExtra === 1 ? 22 : 18;
      const remain = 100 - priceH - volH;

      const pushGrid = (topPct: number, heightPct: number) =>
        grids!.push({ left: 55, right: 20, top: `${topPct}%`, height: `${heightPct}%`, containLabel: false });
      const pushAxes = (gridIndex: number, withYAxisSplit = true) => {
        xAxes!.push({
          type: 'time',
          gridIndex,
          axisLine: { lineStyle: { color: '#888' } },
          axisLabel: { color: '#888' },
          splitLine: { show: false }
        });
        yAxes!.push({
          scale: true,
          gridIndex,
          axisLine: { lineStyle: { color: '#888' } },
          axisLabel: { color: '#888' },
          splitLine: { show: withYAxisSplit, lineStyle: { color: '#333' } }
        });
      };

      // price grid 0
      pushGrid(4, priceH);
      pushAxes(0);

      // volume grid 1
      pushGrid(4 + priceH + 2, volH - 2);
      pushAxes(1, false);

      let nextTop = 4 + priceH + volH + 2;
      let gridIndex = 2;
      if (macdOn) {
        const h = nExtra === 2 ? remain / 2 - 2 : remain - 2;
        pushGrid(nextTop, h);
        pushAxes(gridIndex, false);
        nextTop += h + 2;
        gridIndex += 1;
      }
      if (rsiOn) {
        const h = nExtra === 2 ? remain / 2 - 2 : remain - 2;
        pushGrid(nextTop, h);
        pushAxes(gridIndex, false);
        gridIndex += 1;
      }

      // dataset
      const dataset = { source };

      // series - price
      series!.push({
        type: 'candlestick',
        name: 'Price',
        encode: { x: 0, y: [1, 2, 3, 4] },
        xAxisIndex: 0,
        yAxisIndex: 0,
        itemStyle: { color: upColor, color0: downColor, borderColor: upColor, borderColor0: downColor },
        large: true
      });

      // overlays
      const mkLineSeries = (name: string, dataArr: (number | null)[], color: string) => ({
        type: 'line' as const,
        name,
        xAxisIndex: 0,
        yAxisIndex: 0,
        showSymbol: false,
        smooth: true,
        sampling: 'lttb' as const,
        lineStyle: { width: 1.25, color },
        connectNulls: false,
        data: dataArr.map((v, i) => [source[i][0], v])
      });

      if (showMA) {
        series!.push(mkLineSeries('MA5', ma5, '#9e9e9e'));
        series!.push(mkLineSeries('MA10', ma10, '#ffb300'));
        series!.push(mkLineSeries('MA20', ma20, '#42a5f5'));
        series!.push(mkLineSeries('MA50', ma50, '#ab47bc'));
      }
      if (showEMA) {
        series!.push(mkLineSeries('EMA12', ema12, '#66bb6a'));
        series!.push(mkLineSeries('EMA26', ema26, '#ef5350'));
      }
      if (showBOLL) {
        series!.push(mkLineSeries('BOLL Upper', boll.upper, '#ff7043'));
        series!.push(mkLineSeries('BOLL Mid', boll.mid, '#8d6e63'));
        series!.push(mkLineSeries('BOLL Lower', boll.lower, '#29b6f6'));
      }

      // volume series
      series!.push({
        type: 'bar',
        name: 'Volume',
        encode: { x: 0, y: 5 },
        xAxisIndex: 1,
        yAxisIndex: 1,
        barWidth: '60%',
        itemStyle: {
          color: (params: any) => (params.data[6] >= 0 ? upColor : downColor)
        },
        large: true
      });

      // MACD grid
      if (macdOn) {
        const macdStartIdx = 2; // after price and volume grids
        const macdGridIdx = 2;
        series!.push({
          type: 'bar',
          name: 'MACD Hist',
          xAxisIndex: macdGridIdx,
          yAxisIndex: macdGridIdx,
          barWidth: '40%',
          itemStyle: {
            color: (p: any) => (macd.hist[p.dataIndex] != null && macd.hist[p.dataIndex]! >= 0 ? upColor : downColor)
          },
          data: macd.hist.map((v, i) => [source[i][0], v]),
          large: true
        });
        series!.push({
          type: 'line',
          name: 'MACD',
          xAxisIndex: macdGridIdx,
          yAxisIndex: macdGridIdx,
          showSymbol: false,
          sampling: 'lttb',
          lineStyle: { width: 1, color: '#42a5f5' },
          data: macd.macd.map((v, i) => [source[i][0], v])
        });
        series!.push({
          type: 'line',
          name: 'Signal',
          xAxisIndex: macdGridIdx,
          yAxisIndex: macdGridIdx,
          showSymbol: false,
          sampling: 'lttb',
          lineStyle: { width: 1, color: '#ffa726' },
          data: macd.signal.map((v, i) => [source[i][0], v])
        });
      }

      // RSI grid (last grid if enabled)
      if (rsiOn) {
        const rsiGridIdx = (macdOn ? 3 : 2);
        series!.push({
          type: 'line',
          name: 'RSI(14)',
          xAxisIndex: rsiGridIdx,
          yAxisIndex: rsiGridIdx,
          showSymbol: false,
          sampling: 'lttb',
          lineStyle: { width: 1, color: '#26a69a' },
          data: rsi.map((v, i) => [source[i][0], v])
        });
      }

      const option: echarts.EChartsOption = {
        animation: false,
        legend: { top: 0, left: 80, textStyle: { color: '#999' } },
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        toolbox: { right: 10, feature: { saveAsImage: {}, dataZoom: {} } },
        axisPointer: { link: [{ xAxisIndex: 'all' }] },
        dataZoom: [
          { type: 'inside', xAxisIndex: 'all', start: 70, end: 100, minValueSpan: 10 },
          { type: 'slider', xAxisIndex: 'all', bottom: 0, start: 70, end: 100 }
        ],
        grid: grids,
        xAxis: xAxes,
        yAxis: yAxes,
        dataset,
        series
      };

      // init / update chart
      if (!chartRef.current) {
        if (!ref.current) return;
        chartRef.current = echarts.init(ref.current);
        const onResize = () => chartRef.current?.resize();
        window.addEventListener('resize', onResize);
      }
      chartRef.current.setOption(option, true);
    })();
    return () => {
      // cancel pending
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      alive = false;
    };
  }, [symbol, interval, showMA, showEMA, showBOLL, showMACD, showRSI]);

  useEffect(() => {
    return () => {
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  return <div ref={ref} style={{ width: '100%', height }} data-testid="candle-chart" />;
}
