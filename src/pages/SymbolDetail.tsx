import { useState } from 'react';
import { useParams } from 'react-router-dom';
import CandleChart from '../shared/components/CandleChart';
import type { Interval } from '../shared/api/history';

const intervals: { label: string; value: Interval }[] = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '60m', value: '60m' },
  { label: 'Daily', value: '1d' }
];

export default function SymbolDetail() {
  const { code } = useParams<{ code: string }>();
  const symbol = code || 'DEMO';

  const [interval, setInterval] = useState<Interval>('60m');
  const [showMA, setShowMA] = useState(true);
  const [showEMA, setShowEMA] = useState(false);
  const [showMACD, setShowMACD] = useState(false);
  const [showRSI, setShowRSI] = useState(false);
  const [showBOLL, setShowBOLL] = useState(false);

  return (
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap">
            <h3 className="card-title mb-0">Symbol: {symbol}</h3>
            <div className="d-flex align-items-center flex-wrap">
              <div className="form-inline mr-3 mb-2 mb-sm-0">
                <label className="mr-2">Interval</label>
                <select
                  className="form-control form-control-sm"
                  value={interval}
                  onChange={(e) => setInterval(e.target.value as Interval)}
                >
                  {intervals.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-check form-check-inline">
                <input id="tgl-ma" className="form-check-input" type="checkbox" checked={showMA} onChange={(e) => setShowMA(e.target.checked)} />
                <label className="form-check-label" htmlFor="tgl-ma">MA</label>
              </div>
              <div className="form-check form-check-inline">
                <input id="tgl-ema" className="form-check-input" type="checkbox" checked={showEMA} onChange={(e) => setShowEMA(e.target.checked)} />
                <label className="form-check-label" htmlFor="tgl-ema">EMA</label>
              </div>
              <div className="form-check form-check-inline">
                <input id="tgl-boll" className="form-check-input" type="checkbox" checked={showBOLL} onChange={(e) => setShowBOLL(e.target.checked)} />
                <label className="form-check-label" htmlFor="tgl-boll">BOLL</label>
              </div>
              <div className="form-check form-check-inline">
                <input id="tgl-macd" className="form-check-input" type="checkbox" checked={showMACD} onChange={(e) => setShowMACD(e.target.checked)} />
                <label className="form-check-label" htmlFor="tgl-macd">MACD</label>
              </div>
              <div className="form-check form-check-inline">
                <input id="tgl-rsi" className="form-check-input" type="checkbox" checked={showRSI} onChange={(e) => setShowRSI(e.target.checked)} />
                <label className="form-check-label" htmlFor="tgl-rsi">RSI</label>
              </div>
            </div>
          </div>
          <div className="card-body p-0">
            <CandleChart
              symbol={symbol}
              interval={interval}
              showMA={showMA}
              showEMA={showEMA}
              showBOLL={showBOLL}
              showMACD={showMACD}
              showRSI={showRSI}
              height={560}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
