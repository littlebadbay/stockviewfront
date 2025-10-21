import { Link, Outlet, useLocation } from 'react-router-dom';
import { useMemo } from 'react';

function Header() {
  return (
    <nav className="main-header navbar navbar-expand navbar-white navbar-light">
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link to="#" className="nav-link">
            <i className="fas fa-bars"></i>
          </Link>
        </li>
        <li className="nav-item d-none d-sm-inline-block">
          <Link to="/" className="nav-link">
            Home
          </Link>
        </li>
      </ul>
      <ul className="navbar-nav ml-auto">
        <li className="nav-item">
          <span className="nav-link">AdminLTE + React + ECharts</span>
        </li>
      </ul>
    </nav>
  );
}

function Sidebar() {
  const location = useLocation();
  const activePath = useMemo(() => location.pathname, [location.pathname]);

  return (
    <aside className="main-sidebar sidebar-dark-primary elevation-4">
      <Link to="/" className="brand-link">
        <span className="brand-text font-weight-light">Trader Dashboard</span>
      </Link>
      <div className="sidebar">
        <nav className="mt-2">
          <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
            <li className="nav-item">
              <Link to="/" className={`nav-link ${activePath === '/' ? 'active' : ''}`}>
                <i className="nav-icon fas fa-list"></i>
                <p>Watchlist</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/symbol/DEMO" className={`nav-link ${activePath.startsWith('/symbol') ? 'active' : ''}`}>
                <i className="nav-icon fas fa-chart-line"></i>
                <p>Symbol Detail</p>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}

export default function AdminLayout() {
  return (
    <div className="wrapper">
      <Header />
      <Sidebar />
      <div className="content-wrapper">
        <div className="content-header">
          <div className="container-fluid">
            <div className="row mb-2">
              <div className="col-sm-6">
                <h1 className="m-0">Dashboard</h1>
              </div>
            </div>
          </div>
        </div>
        <section className="content">
          <div className="container-fluid">
            <Outlet />
          </div>
        </section>
      </div>
      <footer className="main-footer">
        <strong>
          Copyright &copy; {new Date().getFullYear()} <a href="#">Your Company</a>.
        </strong>{' '}
        All rights reserved.
      </footer>
    </div>
  );
}
