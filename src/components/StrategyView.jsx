import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, CheckCircle2, AlertOctagon, Target, DollarSign, MessageSquare } from 'lucide-react';

export default function StrategyView() {
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStrategy();
  }, []);

  const fetchStrategy = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/recommend-next-campaign', { method: 'POST' });
      const json = await res.json();
      setStrategy(json.strategic_direction);
    } catch (err) {
      console.error('Error loading strategic report:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !strategy) {
    return <div className="loading-spinner"><Sparkles size={16} className="spin" /> Generating Strategic Intelligence Report...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* Editorial Report Header */}
      <div style={{ borderBottom: '2px solid var(--text-primary)', paddingBottom: '1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Strategic Intelligence Report
        </span>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
          {strategy.title}
        </h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Data-driven strategic direction for NEXORA's next growth campaign based on 2025 performance.
        </p>
      </div>

      {/* 1. Strategic Summary */}
      <div className="card">
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
          1. Strategic Summary & Position
        </div>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>
          Based on 2025 historical data, NEXORA achieves peak return when scaling mid-funnel creative assets (Reels & Carousels) to high-intent <strong>{strategy.target_audience.primary_segment}</strong> while enforcing tight cart-abandonment retargeting.
        </p>
      </div>

      {/* 2. Key Opportunities & What is Working */}
      <div className="grid-cols-2">
        <div className="card" style={{ borderTop: '3px solid var(--badge-observed-text)' }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={16} color="var(--badge-observed-text)" /> What is Working (High Impact)
          </div>
          <ul className="ai-list">
            <li><strong>Q4 Festive Gifting:</strong> Delivered ${strategy.messaging_concept.evidence_badge.split('$')[1] || '305K revenue'} at 5.24x ROAS.</li>
            <li><strong>Retention Workflows:</strong> 75.7% repeat rate with Remote Professionals driving $285 AOV.</li>
            <li><strong>Creative Format:</strong> Short video Reels achieve 5.2% avg engagement.</li>
          </ul>
        </div>

        <div className="card" style={{ borderTop: '3px solid #f43f5e' }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <AlertOctagon size={16} color="#f43f5e" /> What is Underperforming
          </div>
          <ul className="ai-list">
            <li>Top-of-funnel TikTok standalone ads without retargeting pixels (1.05% conversion rate).</li>
            <li>Single static image ads drive less than 1.2% CTR compared to 4.08% for video.</li>
          </ul>
        </div>
      </div>

      {/* 3. Recommended Blueprint & Target KPIs */}
      <div className="card">
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          3. Next-Campaign Execution Blueprint
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: '6px' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PRIMARY SEGMENT</span>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{strategy.target_audience.primary_segment}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RECOMMENDED BUDGET</span>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>${strategy.budget_and_kpis.recommended_budget.toLocaleString()}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TARGET ROAS</span>
              <div style={{ fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>{strategy.budget_and_kpis.target_roas}x</div>
            </div>
          </div>

          <div>
            <strong>Campaign Angle:</strong> <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>"{strategy.messaging_concept.angle}"</span>
          </div>

          <div>
            <strong>Channel Allocation:</strong> <span style={{ color: 'var(--text-secondary)' }}>{strategy.content_and_channels.channel_split}</span>
          </div>
        </div>
      </div>

      {/* 4. Priority Recommended Actions & Experiments */}
      <div className="card">
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          4. Priority Action Items & Experiments
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {strategy.key_experiments.map((exp, idx) => (
            <div key={idx} style={{ padding: '0.65rem 0.85rem', background: 'var(--bg-subtle)', borderRadius: '6px', borderLeft: '3px solid var(--accent-primary)', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              <strong>Priority {idx + 1}:</strong> {exp}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
