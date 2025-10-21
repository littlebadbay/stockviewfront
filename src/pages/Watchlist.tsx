import { Link } from 'react-router-dom';
import { config } from '../shared/config';

export default function Watchlist() {
  const sample = ['AAPL', 'MSFT', 'TSLA', 'BTCUSD'];

  return (
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Watchlist</h3>
          </div>
          <div className="card-body">
            <p className="text-muted mb-3">API: {config.apiBaseUrl || 'not set'} | WS: {config.wsUrl || 'not set'}</p>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sample.map((code) => (
                    <tr key={code}>
                      <td>{code}</td>
                      <td>
                        <Link className="btn btn-sm btn-primary" to={`/symbol/${code}`}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
