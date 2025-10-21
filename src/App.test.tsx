import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

describe('App routing', () => {
  it('renders watchlist on /', () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/watchlist/i)).toBeInTheDocument();
  });

  it('renders symbol detail on /symbol/TEST', () => {
    render(
      <MemoryRouter initialEntries={["/symbol/TEST"]}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/symbol: TEST/i)).toBeInTheDocument();
    expect(screen.getByTestId('candle-chart')).toBeInTheDocument();
  });
});
