import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { DollarSign, TrendingUp, ShoppingBag, Users, Sparkles, Award } from 'lucide-react';

export default function ExecutiveOverview() {
  const [data, setData] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/overview');
      const json = await res.json();
      setData(json);

      const aiRes = await fetch('/api/ai/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area: 'overview' })
      });
      const aiJson = await aiRes.json();
      setAiData(aiJson);
    } catch (err) {
      console.error('Failed to load overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <div className="loading-spinner"><Sparkles className="spin" /> Analyzing Cross-Domain Brand Datasets...</div>;
  }

  const { summary, monthly_trend } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Metric Cards Row */}
      <div className="grid-cols-4">
        <div className="metric-card">
          <div className="metric-label">Total Brand Revenue</div>
          <div className="metric-value">${summary.total_revenue.toLocaleString()}</div>
          <div className="metric-sub positive">
            <TrendingUp size={14} /> Overall ROAS: {summary.overall_roas}x
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Total Marketing Spend</div>
          <div className="metric-value">${summary.total_spend.toLocaleString()}</div>
          <div className="metric-sub">
            Net Profit: <strong style={{ color: '#34d399', marginLeft: '4px' }}>${summary.net_profit.toLocaleString()}</strong>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Total Orders & AOV</div>
          <div className="metric-value">{summary.total_orders.toLocaleString()}</div>
          <div className="metric-sub">
            <ShoppingBag size={14} /> Average Order Value: ${summary.aov.toFixed(2)}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Customer Retention</div>
          <div className="metric-value">{summary.repeat_purchase_rate}%</div>
          <div className="metric-sub">
            <Users size={14} /> {summary.returning_customers.toLocaleString()} Returning / {summary.new_customers.toLocaleString()} New
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <TrendingUp size={18} color="#3b82f6" /> 2025 Monthly Revenue vs Marketing Spend Trend
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>12-Month Performance Scale</span>
        </div>
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={monthly_trend} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#23314e" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#131b2e', borderColor: '#23314e', borderRadius: '8px', color: '#fff' }} 
                formatter={(val) => `$${Number(val).toLocaleString()}`}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="revenue" name="Total Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spend" name="Marketing Spend" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Reasoning Evidence Panel */}
      {aiData && (
        <div className="ai-panel">
          <div className="ai-panel-title">
            <Sparkles size={20} color="#06b6d4" /> Executive AI Reasoning & Evidence Synthesis
          </div>

          <div className="ai-section">
            <div className="ai-section-header">
              <span className="badge-observed">OBSERVED FINDINGS</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Directly supported by calculated empirical data</span>
            </div>
            <ul className="ai-list">
              {aiData.observed.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>

          <div className="ai-section">
            <div className="ai-section-header">
              <span className="badge-inferred">INFERRED PATTERNS</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Logical cross-domain interpretations</span>
            </div>
            <ul className="ai-list">
              {aiData.inferred.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>

          <div className="ai-section">
            <div className="ai-section-header">
              <span className="badge-recommended">STRATEGIC RECOMMENDATIONS</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Actionable next steps</span>
            </div>
            <ul className="ai-list">
              {aiData.recommended.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
