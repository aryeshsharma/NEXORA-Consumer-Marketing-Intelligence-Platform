import React, { useState, useEffect } from 'react';
import { Columns, Award, AlertCircle, Sparkles, Filter, ChevronDown } from 'lucide-react';

export default function CampaignComparison() {
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [selectedCmpIds, setSelectedCmpIds] = useState([]);
  const [selectedMetrics, setSelectedMetrics] = useState(['actual_roas', 'attributed_revenue', 'actual_spend', 'conversion_rate', 'cpa', 'ctr']);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMetricDropdown, setShowMetricDropdown] = useState(false);

  const availableMetrics = [
    { key: 'actual_roas', label: 'ROAS (Return on Ad Spend)' },
    { key: 'attributed_revenue', label: 'Attributed Revenue ($)' },
    { key: 'actual_spend', label: 'Marketing Spend ($)' },
    { key: 'net_profit', label: 'Net Profit ($)' },
    { key: 'conversion_rate', label: 'Conversion Rate (%)' },
    { key: 'cpa', label: 'Cost Per Acquisition (CPA)' },
    { key: 'ctr', label: 'Click-Through Rate (CTR %)' },
    { key: 'acquisitions', label: 'New Customer Acquisitions' }
  ];

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/campaigns');
      const json = await res.json();
      setAllCampaigns(json);
      const allIds = json.map(c => c.campaign_id);
      setSelectedCmpIds(allIds);

      await runComparison(allIds, selectedMetrics);
    } catch (err) {
      console.error('Failed to load comparison setup:', err);
    } finally {
      setLoading(false);
    }
  };

  const runComparison = async (cmpIds, metrics) => {
    try {
      const res = await fetch('/api/analytics/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_ids: cmpIds, selected_metrics: metrics })
      });
      const json = await res.json();
      setComparisonData(json);
    } catch (err) {
      console.error('Comparison call failed:', err);
    }
  };

  const toggleCampaign = (id) => {
    let next;
    if (selectedCmpIds.includes(id)) {
      if (selectedCmpIds.length === 1) return;
      next = selectedCmpIds.filter(x => x !== id);
    } else {
      next = [...selectedCmpIds, id];
    }
    setSelectedCmpIds(next);
    runComparison(next, selectedMetrics);
  };

  const toggleMetric = (key) => {
    let next;
    if (selectedMetrics.includes(key)) {
      if (selectedMetrics.length === 1) return;
      next = selectedMetrics.filter(x => x !== key);
    } else {
      next = [...selectedMetrics, key];
    }
    setSelectedMetrics(next);
    runComparison(selectedCmpIds, next);
  };

  if (loading || !comparisonData) {
    return <div className="loading-spinner"><Sparkles size={16} className="spin" /> Computing Campaign Comparison Matrix...</div>;
  }

  const { campaigns_compared, rankings, tradeoff_analysis } = comparisonData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Compact Restrained Filter Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', background: '#ffffff', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        
        {/* Compact Campaign Selection Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '0.2rem' }}>
            Campaigns:
          </span>
          {allCampaigns.map(c => {
            const active = selectedCmpIds.includes(c.campaign_id);
            return (
              <button 
                key={c.campaign_id} 
                onClick={() => toggleCampaign(c.campaign_id)}
                className={`btn ${active ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
              >
                {c.campaign_name}
              </button>
            );
          })}
        </div>

        {/* Compact Metric Dropdown / Selector */}
        <div style={{ position: 'relative' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowMetricDropdown(!showMetricDropdown)}
            style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
          >
            <Filter size={12} /> Customize Metrics ({selectedMetrics.length}) <ChevronDown size={12} />
          </button>

          {showMetricDropdown && (
            <div style={{ position: 'absolute', right: 0, top: '110%', background: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, display: 'flex', flexDirection: 'column', gap: '0.3rem', width: '220px' }}>
              {availableMetrics.map(m => {
                const active = selectedMetrics.includes(m.key);
                return (
                  <label 
                    key={m.key}
                    onClick={() => toggleMetric(m.key)}
                    style={{ fontSize: '0.78rem', padding: '0.3rem 0.5rem', borderRadius: '4px', cursor: 'pointer', background: active ? 'var(--bg-subtle)' : 'transparent', color: active ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: active ? 600 : 400, display: 'flex', justifyContent: 'space-between' }}
                  >
                    <span>{m.label}</span>
                    {active && <span>✓</span>}
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Primary Visual Focus: Comparison Matrix Table */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div className="card-header" style={{ marginBottom: '0.75rem' }}>
          <div className="card-title" style={{ fontSize: '0.95rem' }}>
            Side-by-Side Performance Comparison
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--badge-observed-text)', fontWeight: 600 }}>
            Top ROAS: {rankings.highest_roas} | Top Revenue: {rankings.highest_revenue}
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Campaign Name</th>
                <th>Objective</th>
                {selectedMetrics.includes('actual_roas') && <th>ROAS</th>}
                {selectedMetrics.includes('attributed_revenue') && <th>Attributed Rev</th>}
                {selectedMetrics.includes('actual_spend') && <th>Spend</th>}
                {selectedMetrics.includes('net_profit') && <th>Net Profit</th>}
                {selectedMetrics.includes('conversion_rate') && <th>Conv Rate</th>}
                {selectedMetrics.includes('cpa') && <th>CPA</th>}
                {selectedMetrics.includes('ctr') && <th>CTR</th>}
                {selectedMetrics.includes('acquisitions') && <th>Acquisition</th>}
              </tr>
            </thead>
            <tbody>
              {campaigns_compared.map((row, idx) => {
                const isBestRoas = row.campaign_name === rankings.highest_roas;
                const isBestRev = row.campaign_name === rankings.highest_revenue;
                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {row.campaign_name}
                      {isBestRoas && <span className="badge-observed" style={{ marginLeft: '6px' }}>BEST ROAS</span>}
                      {isBestRev && <span className="badge-inferred" style={{ marginLeft: '6px' }}>BEST REVENUE</span>}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{row.objective}</td>
                    {selectedMetrics.includes('actual_roas') && (
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)' }}>
                        {row.actual_roas}x
                      </td>
                    )}
                    {selectedMetrics.includes('attributed_revenue') && (
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        ${row.attributed_revenue.toLocaleString()}
                      </td>
                    )}
                    {selectedMetrics.includes('actual_spend') && (
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        ${row.actual_spend.toLocaleString()}
                      </td>
                    )}
                    {selectedMetrics.includes('net_profit') && (
                      <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--badge-observed-text)', fontWeight: 600 }}>
                        ${row.net_profit.toLocaleString()}
                      </td>
                    )}
                    {selectedMetrics.includes('conversion_rate') && (
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{row.conversion_rate}%</td>
                    )}
                    {selectedMetrics.includes('cpa') && (
                      <td style={{ fontFamily: 'var(--font-mono)' }}>${row.cpa}</td>
                    )}
                    {selectedMetrics.includes('ctr') && (
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{row.ctr}%</td>
                    )}
                    {selectedMetrics.includes('acquisitions') && (
                      <td style={{ fontFamily: 'var(--font-mono)' }}>{row.acquisitions}</td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Tradeoff Explanation */}
        {tradeoff_analysis && (
          <div style={{ marginTop: '0.85rem', padding: '0.75rem 0.9rem', background: 'var(--bg-subtle)', borderRadius: '6px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <strong>Analytical Trade-Off Insight: </strong> {tradeoff_analysis}
          </div>
        )}
      </div>
    </div>
  );
}
