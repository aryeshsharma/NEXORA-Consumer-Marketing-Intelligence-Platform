import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function OverviewView({ activeDataset, onNavigateToAnalyze }) {
  const [data, setData] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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
      console.error('Error fetching overview:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <div className="loading-spinner"><Sparkles size={16} className="spin" /> Loading Business Overview...</div>;
  }

  const { summary } = data;
  const brandName = activeDataset?.active_brand_name || 'Brand';

  const analysisEntryPoints = [
    { id: 'campaigns', title: 'Campaign Performance', description: 'Historical campaign return, spend vs. revenue, ROAS, and campaign comparisons.' },
    { id: 'content', title: 'Content & Social', description: 'Post performance, short video vs. carousel engagement, and creative theme impact.' },
    { id: 'commerce', title: 'Commerce & Merchandising', description: 'Product sales leaderboard, unit margins, and customer sentiment themes.' },
    { id: 'customers', title: 'Customer Segments', description: 'Demographics, purchase frequency, segment AOV, and customer lifetime value.' },
    { id: 'funnel', title: 'Traffic & Funnel', description: '5-stage ad impression to completed order conversion drop-off analysis.' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Business Context */}
      <div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Business Overview &mdash; {brandName}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.15rem', maxWidth: '750px', lineHeight: '1.4' }}>
          Intelligence workspace for <strong>{brandName}</strong>. Synthesizes cross-domain historical data into evidence-based strategic insights.
        </p>
      </div>

      {/* 4 Quiet Key Business Metrics */}
      <div className="grid-cols-4" style={{ gap: '0.75rem' }}>
        <div className="metric-card">
          <div className="metric-label">Revenue</div>
          <div className="metric-value">${(summary.total_revenue / 1000).toFixed(1)}K</div>
          <div className="metric-sub">${summary.total_revenue.toLocaleString()}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">ROAS</div>
          <div className="metric-value" style={{ color: 'var(--accent-primary)' }}>{summary.overall_roas}x</div>
          <div className="metric-sub">${summary.total_spend.toLocaleString()} spend</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Orders</div>
          <div className="metric-value">{summary.total_orders.toLocaleString()}</div>
          <div className="metric-sub">${summary.aov.toFixed(0)} AOV</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Retention</div>
          <div className="metric-value">{summary.repeat_purchase_rate}%</div>
          <div className="metric-sub">{summary.returning_customers.toLocaleString()} repeat</div>
        </div>
      </div>

      {/* Main Analytical Finding (Visual Anchor) */}
      <div className="card" style={{ padding: '0.85rem 1.1rem', background: '#ffffff', borderLeft: '3px solid var(--accent-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              KEY ANALYTICAL FINDING
            </span>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500, marginTop: '0.2rem', lineHeight: '1.4' }}>
              {aiData && aiData.observed && aiData.observed[0] ? aiData.observed[0] : `Top campaign '${summary.top_campaign}' led revenue generation with ${summary.overall_roas}x ROAS, supporting a ${summary.repeat_purchase_rate}% repeat purchase rate across ${summary.total_orders.toLocaleString()} orders.`}
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => onNavigateToAnalyze('campaigns')}
            style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', flexShrink: 0 }}
          >
            Explore Analysis <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Primary Gateway into Product */}
      <div style={{ marginTop: '0.25rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.65rem', letterSpacing: '0.02em' }}>
          WHAT DO YOU WANT TO ANALYZE?
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {analysisEntryPoints.map(ep => (
            <div 
              key={ep.id} 
              className="entry-card"
              onClick={() => onNavigateToAnalyze(ep.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent-primary)' }}></div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{ep.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{ep.description}</div>
                </div>
              </div>
              <ArrowRight size={14} color="var(--text-muted)" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
