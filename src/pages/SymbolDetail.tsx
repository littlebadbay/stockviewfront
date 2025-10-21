import { useParams } from 'react-router-dom';
import CandleChart from '../shared/components/CandleChart';

export default function SymbolDetail() {
  const { code } = useParams<{ code: string }>();
  return (
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Symbol: {code}</h3>
          </div>
          <div className="card-body">
            <CandleChart height={420} />
          </div>
        </div>
      </div>
    </div>
  );
}
