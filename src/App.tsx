import React, { useState, useEffect } from 'react';
import {
  calculateMoneyValue,
  fetchExchangeRates,
  convertCurrency,
  fetchCurrentCPI,
  calculateInflationLoss,
  BASE_CPI_2001_01,
  HISTORICAL_CPI_FALLBACK,
  type MoneyValueCalculationResult,
  type CPIDataPoint
} from 'millennial-dollar';
import {
  Percent,
  Activity,
  Calculator,
  Clock,
  ExternalLink,
  ArrowRightLeft,
  Flame,
  Zap,
  CheckCircle2
} from 'lucide-react';
import './App.css';

const COMMON_CURRENCIES = ['USD', 'EUR', 'GBP', 'PLN', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL', 'MXN'];

export const App: React.FC = () => {
  // 1. Calculator state
  const [calcAmount, setCalcAmount] = useState<number>(100);
  const [calcCurrency, setCalcCurrency] = useState<string>('PLN');
  const [calcResult, setCalcResult] = useState<MoneyValueCalculationResult | null>(null);
  const [loadingCalc, setLoadingCalc] = useState<boolean>(false);

  // 2. Exchange Rates & Converter state
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [convertAmount, setConvertAmount] = useState<number>(100);
  const [convertFrom, setConvertFrom] = useState<string>('EUR');
  const [convertTo, setConvertTo] = useState<string>('USD');

  // 3. Summarised Inflation state
  const [currentCPI, setCurrentCPI] = useState<number>(315.5);
 

  // 4. Compounding Inflation Simulator state
  const [year1Rate, setYear1Rate] = useState<number>(3.0);
  const [year2Rate, setYear2Rate] = useState<number>(3.0);
  const [yearsCount, setYearsCount] = useState<number>(5);
  const [annualRate, setAnnualRate] = useState<number>(3.5);

  // Load initial exchange rates & CPI from package
  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      try {
        const ratesRes = await fetchExchangeRates();
        if (isMounted && ratesRes && ratesRes.rates) {
          setExchangeRates(ratesRes.rates);
        }
      } catch (err) {
        console.error("Error fetching exchange rates:", err);
        // Fallback default rates if fetch fails
        if (isMounted) {
          setExchangeRates({ USD: 1, EUR: 0.92, GBP: 0.79, PLN: 4.0, JPY: 150, CAD: 1.35, AUD: 1.52, CHF: 0.88, CNY: 7.23, INR: 82.9 });
        }
      }

      try {
        const cpiVal = await fetchCurrentCPI();
        if (isMounted && cpiVal) {
          setCurrentCPI(cpiVal);
        }
      } catch (err) {
        console.error("Error fetching CPI:", err);
      }
    }
    loadInitialData();
    return () => { isMounted = false; };
  }, []);

  // Run calculateMoneyValue when inputs change
  useEffect(() => {
    let isMounted = true;
    async function performCalculation() {
      setLoadingCalc(true);
      try {
        const res = await calculateMoneyValue({
          amount: calcAmount || 0,
          currency: calcCurrency,
          rates: Object.keys(exchangeRates).length > 0 ? exchangeRates : undefined,
          currentCPI
        });
        if (isMounted) {
          setCalcResult(res);
          setLoadingCalc(false);
        }
      } catch (err) {
        console.error("Calculation error:", err);
        if (isMounted) setLoadingCalc(false);
      }
    }

    performCalculation();
  }, [calcAmount, calcCurrency, exchangeRates, currentCPI]);

  // Calculations for Inflation compounding demo
  const simpleSum = (year1Rate + year2Rate);
  const compoundedVal = ((1 + year1Rate / 100) * (1 + year2Rate / 100) - 1) * 100;
  const compoundingDifference = compoundedVal - simpleSum;

  // Multi-year compounding: (1 + r)^n - 1
  const multiYearCompoundedPercent = (Math.pow(1 + annualRate / 100, yearsCount) - 1) * 100;
  const multiYearSimplePercent = annualRate * yearsCount;

  // Conversion output
  const conversionResult = (exchangeRates[convertFrom] && exchangeRates[convertTo])
    ? convertCurrency(convertAmount || 0, convertFrom, convertTo, exchangeRates)
    : null;

 

  return (
    <div className="app-container">
      {/* Wall Street Ticker Marquee */}
      <div className="ticker-bar">
        <div className="ticker-content">
          <span className="ticker-item"><Flame size={14} color="#ff007f" /> WALL STREET VAPOR-INDEX</span>
          <span className="ticker-item"><Zap size={14} color="#ffe600" /> BASELINE: JAN 1, 2001 (CPI: 175.1)</span>
          <span className="ticker-item"><Activity size={14} color="#00f3ff" /> CURRENT CPI: {currentCPI}</span>
          {Object.entries(exchangeRates).slice(0, 10).map(([symbol, rate]) => (
            <span key={symbol} className="ticker-item">
              <span className="ticker-symbol">{symbol}/USD:</span>
              <span className="ticker-rate">{rate.toFixed(4)}</span>
            </span>
          ))}
          <span className="ticker-item"><CheckCircle2 size={14} color="#00ff66" /> POWERED BY millennial-dollar</span>
        </div>
      </div>

      {/* Hero Header */}
      <header className="app-header">
        <h1 className="app-title">MILLENNIAL DOLLAR</h1>
        <p className="app-subtitle">⚡ Check how much worth your money was in 2001y. ⚡</p>

        {/* Prominent Powered By Badge */}
        <a
          href="https://www.npmjs.com/package/millennial-dollar"
          target="_blank"
          rel="noopener noreferrer"
          className="powered-by-badge"
        >
          <span>Powered by</span>
          <span className="pkg-tag">millennial-dollar</span>
          <span>npm package</span>
          <ExternalLink size={14} />
        </a>
      </header>

      {/* Main Grid Content */}
      <main className="main-content">
        {/* Module 1: Millennial Dollar Calculator */}
        <section className="vapor-card">
          <h2 className="card-title">
            <Calculator size={22} />
            Millennial Dollar Calculator
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.2rem', fontSize: '0.95rem' }}>
            Calculate how much your money in any currency is worth in <strong>2001 Millennial Dollars</strong> and measure real inflation loss.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Today's Amount</label>
              <input
                type="number"
                min="0"
                step="any"
                className="cyber-input"
                aria-label="Today's Amount"
                value={calcAmount}
                onChange={(e) => setCalcAmount(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Currency</label>
              <select
                className="cyber-select"
                aria-label="Currency"
                value={calcCurrency}
                onChange={(e) => setCalcCurrency(e.target.value)}
              >
                {COMMON_CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                {Object.keys(exchangeRates).filter(c => !COMMON_CURRENCIES.includes(c)).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {loadingCalc ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--neon-cyan)' }}>
              Calculating purchasing power...
            </div>
          ) : calcResult ? (
            <div style={{ marginTop: '1rem' }}>
              <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-label">Real Value (2001 USD)</div>
                  <div className="stat-value highlight-cyan">
                    ${calcResult.realValueIn2001USD.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--neon-gold)', marginTop: '4px' }}>
                    "Millennial Dollars"
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-label">Value Lost ({calcResult.originalCurrency})</div>
                  <div className="stat-value highlight-pink">
                    -{calcResult.valueLostInOriginalCurrency.toFixed(2)} {calcResult.originalCurrency}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    (${calcResult.valueLostInUSD.toFixed(2)} USD)
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-label">Today's USD Value</div>
                  <div className="stat-value highlight-green">
                    ${calcResult.amountInUSD.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Rate: {calcResult.exchangeRateToUSD.toFixed(4)}
                  </div>
                </div>

                <div className="stat-box">
                  <div className="stat-label">Purchasing Power Loss</div>
                  <div className="stat-value highlight-pink">
                    -{calcResult.purchasingPowerLossPercent.toFixed(1)}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Since Jan 1, 2001
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: '1.2rem',
                padding: '0.8rem',
                background: 'rgba(0,0,0,0.4)',
                borderRadius: '6px',
                borderLeft: '3px solid var(--neon-gold)',
                fontFamily: 'Fira Code',
                fontSize: '0.85rem'
              }}>
                <div>Baseline Date: <strong>{calcResult.referenceDate}</strong> (Base CPI: {calcResult.baseCPI})</div>
                <div>Current US CPI: <strong>{calcResult.currentCPI}</strong> (Cumulative Inflation: +{calcResult.cumulativeInflationPercent.toFixed(1)}%)</div>
              </div>
            </div>
          ) : null}
        </section>

        {/* Module 2: Summarised Inflation & Compounding Explainer */}
        <section className="vapor-card">
          <h2 className="card-title">
            <Percent size={22} />
            Summarised Inflation & Compounding
          </h2>

         

          {/* Interactive Compounding Inflation Section */}
          <div className="compounding-demo">
            <h3 style={{ color: 'var(--neon-gold)', fontSize: '1.05rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={16} /> Non-Linear Inflation Compounding Rules
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#e0e0ff', lineHeight: 1.4 }}>
              <strong>Why 3% + 3% ≠ 6% inflation:</strong> Inflation compounds on top of previous inflated values. The second 3% is calculated from <strong>103%</strong> of the original base value, not 100%!
            </p>

            {/* Interactive 2-year compounding tool */}
            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="input-label">Year 1 Inflation: {year1Rate}%</label>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.5"
                  className="cyber-slider"
                  value={year1Rate}
                  onChange={(e) => setYear1Rate(parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label className="input-label">Year 2 Inflation: {year2Rate}%</label>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.5"
                  className="cyber-slider"
                  value={year2Rate}
                  onChange={(e) => setYear2Rate(parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="formula-box">
              <div>Simple Addition (Incorrect): {year1Rate}% + {year2Rate}% = <strong>{simpleSum.toFixed(2)}%</strong></div>
              <div style={{ color: 'var(--neon-cyan)', marginTop: '4px' }}>
                True Compounded Inflation: (1 + {year1Rate/100}) × (1 + {year2Rate/100}) - 1 = <strong style={{ color: 'var(--neon-pink)', fontSize: '1.1rem' }}>{compoundedVal.toFixed(2)}%</strong>
              </div>
              {compoundingDifference > 0 && (
                <div style={{ fontSize: '0.8rem', color: 'var(--neon-gold)', marginTop: '4px' }}>
                  +{(compoundingDifference).toFixed(2)}% extra inflation due to baseline compounding from 103%!
                </div>
              )}
            </div>

            {/* Multi-Year Slider */}
            <div style={{ marginTop: '1rem', borderTop: '1px dashed rgba(255,255,255,0.15)', paddingTop: '0.8rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--neon-cyan)', marginBottom: '0.5rem' }}>
                Multi-Year Compound Inflation Effect ({yearsCount} years @ {annualRate}%/yr):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="input-label">Annual Rate: {annualRate}%</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    className="cyber-slider"
                    value={annualRate}
                    onChange={(e) => setAnnualRate(parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="input-label">Years: {yearsCount}</label>
                  <input
                    type="range"
                    min="1"
                    max="25"
                    step="1"
                    className="cyber-slider"
                    value={yearsCount}
                    onChange={(e) => setYearsCount(parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontFamily: 'Fira Code', marginTop: '6px' }}>
                <span>Simple Sum: {multiYearSimplePercent.toFixed(1)}%</span>
                <span style={{ color: 'var(--neon-pink)', fontWeight: 700 }}>
                  Actual Compounded: {multiYearCompoundedPercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Module 3: Wall Street Exchange Desk & Converter */}
        <section className="vapor-card">
          <h2 className="card-title">
            <ArrowRightLeft size={22} />
            Wall Street Currency Converter Desk
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.2rem', fontSize: '0.95rem' }}>
            Instant multi-currency exchange conversion using millennial-dollar API.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem', alignItems: 'flex-end' }}>
            <div className="input-group">
              <label className="input-label">Amount</label>
              <input
                type="number"
                min="0"
                step="any"
                className="cyber-input"
                aria-label="Conversion Amount"
                value={convertAmount}
                onChange={(e) => setConvertAmount(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">From</label>
              <select
                className="cyber-select"
                aria-label="From Currency"
                value={convertFrom}
                onChange={(e) => setConvertFrom(e.target.value)}
              >
                {COMMON_CURRENCIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">To</label>
              <select
                className="cyber-select"
                aria-label="To Currency"
                value={convertTo}
                onChange={(e) => setConvertTo(e.target.value)}
              >
                {COMMON_CURRENCIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {conversionResult && (
            <div className="stat-box" style={{ marginTop: '1.2rem', background: 'rgba(0, 243, 255, 0.05)', border: '1px solid var(--neon-cyan)' }}>
              <div className="stat-label">Converted Result</div>
              <div className="stat-value highlight-cyan" style={{ fontSize: '1.8rem' }}>
                {conversionResult.convertedAmount.toFixed(2)} {conversionResult.toCurrency}
              </div>
              <div style={{ fontFamily: 'Fira Code', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                1 {conversionResult.fromCurrency} = {conversionResult.rate.toFixed(4)} {conversionResult.toCurrency}
              </div>
            </div>
          )}
        </section>

        {/* Module 4: Historical CPI & Purchasing Power Timeline */}
        <section className="vapor-card">
          <h2 className="card-title">
            <Clock size={22} />
            Historical Purchasing Power Timeline
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.2rem', fontSize: '0.95rem' }}>
            Historical US CPI fallback data (<code>HISTORICAL_CPI_FALLBACK</code>) analyzed via <code>calculateInflationLoss()</code>.
          </p>

          <div className="timeline-list">
            {HISTORICAL_CPI_FALLBACK.map((dp: CPIDataPoint, idx: number) => {
              const lossInfo = calculateInflationLoss(100, dp.cpi, BASE_CPI_2001_01);
              return (
                <div key={idx} className="timeline-item">
                  <div>
                    <strong style={{ color: 'var(--neon-cyan)', fontSize: '1rem' }}>{dp.year}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '8px' }}>
                      (CPI: {dp.cpi})
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--neon-gold)', fontFamily: 'Orbitron', fontWeight: 600 }}>
                      ${lossInfo.realValueIn2001USD.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--neon-pink)' }}>
                      -{lossInfo.purchasingPowerLossPercent.toFixed(1)}% power
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Full Width Footer Section / Powered By Banner */}
        <section className="vapor-card full-width" style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(255,0,127,0.15) 0%, rgba(0,243,255,0.15) 100%)' }}>
          <h3 style={{ color: 'var(--neon-gold)', marginBottom: '0.5rem' }}>⚡ POWERED BY MILLENNIAL-DOLLAR NPM PACKAGE ⚡</h3>
          <p style={{ color: '#e0e0ff', maxWidth: '700px', margin: '0 auto 1rem auto', fontSize: '0.95rem' }}>
            This application uses the <code>millennial-dollar</code> library functions (<code>calculateMoneyValue</code>, <code>fetchExchangeRates</code>, <code>convertCurrency</code>, <code>calculateInflationLoss</code>, <code>fetchCurrentCPI</code>) to deliver exact currency conversion and 2001 US Consumer Price Index baseline inflation calculations.
          </p>
          <a
            href="https://www.npmjs.com/package/millennial-dollar"
            target="_blank"
            rel="noopener noreferrer"
            className="powered-by-badge"
            style={{ fontSize: '0.95rem', padding: '8px 20px' }}
          >
            <span>View millennial-dollar on npm</span>
            <ExternalLink size={16} />
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div>
          Millennial Dollar Vaporwave Desk • Powered by <strong>millennial-dollar</strong> npm package
        </div>
        <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>
          Baseline Reference Date: January 1, 2001 (Baseline CPI: 175.1)
        </div>
      </footer>
    </div>
  );
};

export default App;
