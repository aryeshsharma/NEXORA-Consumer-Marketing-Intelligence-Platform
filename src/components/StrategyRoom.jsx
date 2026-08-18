import React, { useState, useEffect } from 'react';
import { Compass, Target, MessageCircle, DollarSign, Sparkles, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function StrategyRoom() {
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
      console.error('Failed to load strategic direction:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !strategy) {
    return <div className="loading-spinner"><Sparkles className="spin" /> Synthesizing Historical Evidence into Strategic Direction...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #131b2e 0%, #1e1b4b 100%)', border: '1px solid var(--accent-purple)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', uppercase: true, fontWeight: 700, letterSpacing: '0.05em' }}>
              Historical Data-Driven Blueprint
            </div>
            <h2 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 800, marginTop: '0.2rem' }}>
              {strategy.title}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
              Evidence-based strategic guidance for upcoming marketing campaigns derived from 2025 cross-domain performance.
            </p>
          </div>
          <Compass size={44} color="#8b5cf6" />
        </div>
      </div>

      {/* Blueprint Grid */}
      <div className="grid-cols-2">
        {/* 1. Target Audience & Segments */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Target size={18} color="#3b82f6" /> 1. Target Audience Strategy
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div>
              <strong style={{ color: 'var(--text-muted)' }}>Primary Target Segment:</strong>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>{strategy.target_audience.primary_segment}</div>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)' }}>Demographics & Location:</strong>
              <div style={{ color: '#d1d5db' }}>{strategy.target_audience.demographics}</div>
            </div>
            <div style={{ marginTop: '0.3rem' }}>
              <span className="badge-observed">{strategy.target_audience.evidence_badge}</span>
            </div>
          </div>
        </div>

        {/* 2. Core Messaging & Value Proposition */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <MessageCircle size={18} color="#06b6d4" /> 2. Core Messaging & Offer Concept
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div>
              <strong style={{ color: 'var(--text-muted)' }}>Campaign Angle:</strong>
              <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '1.05rem' }}>"{strategy.messaging_concept.angle}"</div>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)' }}>Value Proposition & Offer:</strong>
              <div style={{ color: '#d1d5db' }}>{strategy.messaging_concept.core_value_prop}</div>
              <div style={{ color: 'var(--accent-amber)', fontWeight: 600, marginTop: '0.2rem' }}>{strategy.messaging_concept.offer_strategy}</div>
            </div>
            <div style={{ marginTop: '0.3rem' }}>
              <span className="badge-observed">{strategy.messaging_concept.evidence_badge}</span>
            </div>
          </div>
        </div>

        {/* 3. Channels & Creative Formats */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Sparkles size={18} color="#8b5cf6" /> 3. Channels & Creative Formats
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div>
              <strong style={{ color: 'var(--text-muted)' }}>Channel Budget Allocation:</strong>
              <div style={{ color: '#fff', fontWeight: 600 }}>{strategy.content_and_channels.channel_split}</div>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)' }}>Recommended Creative Formats:</strong>
              <div style={{ color: '#d1d5db' }}>{strategy.content_and_channels.creative_formats}</div>
            </div>
            <div style={{ marginTop: '0.3rem' }}>
              <span className="badge-observed">{strategy.content_and_channels.evidence_badge}</span>
            </div>
          </div>
        </div>

        {/* 4. Budget & Planned Target KPIs */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <DollarSign size={18} color="#10b981" /> 4. Budget & Planned Target KPIs
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', gap: '1.5rem', fontFamily: 'var(--font-mono)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>BUDGET</span>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.2rem' }}>${strategy.budget_and_kpis.recommended_budget.toLocaleString()}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>TARGET ROAS</span>
                <div style={{ color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '1.2rem' }}>{strategy.budget_and_kpis.target_roas}x</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>TARGET CPA</span>
                <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '1.2rem' }}>${strategy.budget_and_kpis.target_cpa}</div>
              </div>
            </div>
            <div style={{ marginTop: '0.3rem' }}>
              <span className="badge-observed">{strategy.budget_and_kpis.evidence_badge}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Test Experiments & Approaches to Avoid */}
      <div className="grid-cols-2">
        {/* Recommended Experiments */}
        <div className="card" style={{ borderLeft: '4px solid var(--accent-emerald)' }}>
          <div className="card-header">
            <div className="card-title">
              <CheckCircle2 size={18} color="#10b981" /> Recommended Strategic Experiments
            </div>
            <span className="badge-recommended">Controlled A/B Tests</span>
          </div>
          <ul className="ai-list" style={{ marginTop: '0.5rem' }}>
            {strategy.key_experiments.map((exp, i) => (
              <li key={i} style={{ color: '#e5e7eb' }}>{exp}</li>
            ))}
          </ul>
        </div>

        {/* Pitfalls to Avoid */}
        <div className="card" style={{ borderLeft: '4px solid var(--accent-rose)' }}>
          <div className="card-header">
            <div className="card-title">
              <AlertOctagon size={18} color="#f43f5e" /> Strategic Pitfalls & Approaches to Avoid
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-rose)', fontWeight: 700 }}>DO NOT EXECUTE</span>
          </div>
          <ul className="ai-list" style={{ marginTop: '0.5rem' }}>
            {strategy.pitfalls_to_avoid.map((pitfall, i) => (
              <li key={i} style={{ color: '#fca5a5' }}>{pitfall}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
