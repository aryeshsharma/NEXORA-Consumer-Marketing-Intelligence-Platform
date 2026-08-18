import React, { useState, useEffect } from 'react';
import { ShoppingCart, Users, Star, MessageSquare, Sparkles, TrendingUp } from 'lucide-react';

export default function CommerceAnalytics() {
  const [data, setData] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommerceData();
  }, []);

  const fetchCommerceData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/commerce');
      const json = await res.json();
      setData(json);

      const aiRes = await fetch('/api/ai/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area: 'commerce' })
      });
      const aiJson = await aiRes.json();
      setAiData(aiJson);
    } catch (err) {
      console.error('Failed to fetch commerce data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <div className="loading-spinner"><Sparkles className="spin" /> Analyzing Commerce & Customer Datasets...</div>;
  }

  const { products, segments } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Product Performance Leaderboard */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <ShoppingCart size={18} color="#3b82f6" /> Product Performance Matrix & Revenue Leaderboard
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Catalog Revenue, Margin %, & Units Sold</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Retail Price</th>
                <th>Cost Price</th>
                <th>Margin %</th>
                <th>Units Sold</th>
                <th>Total Revenue</th>
                <th>Est. Profit</th>
                <th>Rating</th>
                <th>Sentiment</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: '#fff' }}>{p.product_name}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{p.category_name}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>${p.price.toFixed(2)}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>${p.cost_price.toFixed(2)}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: p.margin_percent > 65 ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                    {p.margin_percent}%
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{p.units_sold.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                    ${p.total_revenue.toLocaleString()}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#34d399' }}>
                    ${p.estimated_gross_profit.toLocaleString()}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>⭐ {p.avg_rating}</td>
                  <td>
                    <span className={p.review_sentiment === 'Positive' ? 'badge-observed' : 'badge-recommended'}>
                      {p.review_sentiment}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Segments & LTV Matrix */}
      <div className="grid-cols-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Users size={18} color="#8b5cf6" /> Customer Segments & Lifetime Value (LTV)
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Demographics & Spend Behavior</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {segments.map((seg, idx) => (
              <div key={idx} style={{ background: '#0d1424', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{seg.segment_name}</div>
                  <span className="badge-inferred">Avg LTV: ${seg.avg_customer_ltv}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Demographics: {seg.age_band} age | {seg.gender_focus} | Region: {seg.region}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#d1d5db', fontStyle: 'italic', marginBottom: '0.4rem' }}>
                  "{seg.purchasing_behavior}"
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', borderTop: '1px solid #1f293d', paddingTop: '0.4rem' }}>
                  <span>Customers: <strong>{seg.total_customers}</strong></span>
                  <span>Orders: <strong>{seg.total_orders}</strong></span>
                  <span>AOV: <strong style={{ color: 'var(--accent-cyan)' }}>${seg.aov}</strong></span>
                  <span>Revenue: <strong style={{ color: 'var(--accent-emerald)' }}>${seg.total_revenue.toLocaleString()}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Review Voice & Feedback */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <MessageSquare size={18} color="#f59e0b" /> Customer Voice & Review Feedback
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Qualitative Sentiment Themes</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {products.slice(0, 5).map((p, idx) => (
              <div key={idx} style={{ background: '#0d1424', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>{p.product_name}</span>
                  <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>⭐ {p.avg_rating} / 5 ({p.review_count} reviews)</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#d1d5db', fontStyle: 'italic', background: '#131b2e', padding: '0.5rem', borderRadius: '4px', borderLeft: '3px solid var(--accent-primary)' }}>
                  "{p.sample_review}"
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Commercial Reasoning Panel */}
      {aiData && (
        <div className="ai-panel">
          <div className="ai-panel-title">
            <Sparkles size={20} color="#06b6d4" /> Commercial & Consumer Behavioral Reasoning
          </div>

          <div className="ai-section">
            <div className="ai-section-header">
              <span className="badge-observed">OBSERVED COMMERCE METRICS</span>
            </div>
            <ul className="ai-list">
              {aiData.observed.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>

          <div className="ai-section">
            <div className="ai-section-header">
              <span className="badge-inferred">INFERRED CUSTOMER PREFERENCES</span>
            </div>
            <ul className="ai-list">
              {aiData.inferred.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>

          <div className="ai-section">
            <div className="ai-section-header">
              <span className="badge-recommended">MERCHANDISING & BUNDLING RECOMMENDATIONS</span>
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
