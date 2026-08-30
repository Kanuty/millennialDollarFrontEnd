import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('Millennial Dollar App', () => {
  it('renders title and powered by millennial-dollar branding', async () => {
    render(<App />);

    const titles = screen.getAllByText(/MILLENNIAL DOLLAR/i);
    expect(titles.length).toBeGreaterThan(0);

    // Check for "Powered by millennial-dollar npm package" elements
    const brandingBadges = screen.getAllByText(/millennial-dollar/i);
    expect(brandingBadges.length).toBeGreaterThan(0);
  });

  it('renders all key feature sections', async () => {
    render(<App />);

    expect(screen.getByText(/Millennial Dollar Calculator/i)).toBeInTheDocument();
    expect(screen.getByText(/Summarised Inflation & Compounding/i)).toBeInTheDocument();
    expect(screen.getByText(/Non-Linear Inflation Compounding Rules/i)).toBeInTheDocument();
    expect(screen.getByText(/Wall Street Currency Converter Desk/i)).toBeInTheDocument();
    expect(screen.getByText(/Historical Purchasing Power Timeline/i)).toBeInTheDocument();
  });

  it('calculates millennial dollar values correctly', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Real Value \(2001 USD\)/i)).toBeInTheDocument();
      expect(screen.getByText(/"Millennial Dollars"/i)).toBeInTheDocument();
    });
  });
});
