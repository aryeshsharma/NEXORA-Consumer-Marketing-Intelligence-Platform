import React, { useState, useEffect } from 'react';
import { Target, DollarSign, BarChart2, CheckCircle, AlertTriangle, Sparkles, Layers } from 'lucide-react';

export default function CampaignAnalysis() {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCmpId, setSelectedCmpId] = useState('');
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/campaigns');
      const json = await res.json();
      setCampaigns(json);
      if (json.length > 0) {
        setSelectedCmpId(json[0].campaign_id);
      }

      const aiRes = await fetch('/api/ai/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area: 'campaigns' })
      });
      const aiJson = await aiRes.json();
      setAiData(aiJson);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || campaigns.length === 0) {
    return <div className="loading-spinner"><Sparkles className="spin" /> Loading Campaign Datasets & Analytical History...</div>;
  }

  const selectedCmp = campaigns.find(c => c.campaign_id === selectedCmpId) || campaigns[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Campaign Workspace Header */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Historical Campaign Workspace
          </div>
          <h2 style={{ fontSize: '1.4rem', color: '#fff', fontWeight: 700 }}>
            {selectedCmp.campaign_name}
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
            ID: {selectedCmp.campaign_id} | Dates: {selectedCmp.intention.start_date} to {selectedCmp.intention.end_date}
          </span>
        </div>

        {/* Campaign Selector Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {campaigns.map(c => (
            <button
              key={c.campaign_id}
              onClick={() => setSelectedCmpId(c.campaign_id)}
              className={`btn ${selectedCmpId === c.campaign_id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem' }}
            >
              {c.campaign_name}
            </button>
          ))}
        </div>
      </div>

      {/* Intention vs Execution vs Result 3-Column Grid */}
      <div className="grid-cols-3">
        {/* 1. CAMPAIGN INTENTION */}
        <div className="card" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
          <div className="card-header">
            <div className="card-title">
              <Target size={18} color="#8b5cf6" /> 1. Campaign Intention
            </div>
            <span className="badge-observed">Planned Strategy</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.875rem' }}>
            <div>
              <strong style={{ color: 'var(--text-muted)' }}>Objective:</strong>
              <div style={{ color: '#fff', fontWeight: 600 }}>{selectedCmp.intention.objective}</div>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)' }}>Planned Budget:</strong>
              <div style={{ color: '#fff', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>${selectedCmp.intention.budget.toLocaleString()}</div>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)' }}>Planned Target ROAS:</strong>
              <div style={{ color: 'var(--accent-emerald)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{selectedCmp.intention.planned_roas}x</div>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)' }}>Target Audience:</strong>
              <div style={{ color: '#e5e7eb' }}>{selectedCmp.intention.target_audience}</div>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)' }}>Campaign Message:</strong>
              <div style={{ color: '#9ca3af', fontStyle: 'italic' }}>"{selectedCmp.intention.campaign_message}"</div>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)' }}>Offer / Discount:</strong>
              <div style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>{selectedCmp.intention.offer_discount}</div>
            </div>
          </div>
        </div>

        {/* 2. CAMPAIGN EXECUTION */}
        <div className="card" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
          <div className="card-header">
            <div className="card-title">
              <BarChart2 size={18} color="#06b6d4" /> 2. Campaign Execution
            </div>
            <span className="badge-observed">Delivery & Spend</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.875rem' }}>
            <div>
              <strong style={{ color: 'var(--text-muted)' }}>Actual Spend:</strong>
              <div style={{ color: '#fff', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '1.2rem' }}>
                ${selectedCmp.execution.actual_spend.toLocaleString()}
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                  ({selectedCmp.execution.budget_utilized_percent}% budget used)
                </span>
              </div>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)' }}>Impressions & Reach:</strong>
              <div style={{ color: '#fff', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                {selectedCmp.execution.impressions.toLocaleString()} imps / {selectedCmp.execution.reach.toLocaleString()} reach
              </div>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)' }}>Frequency:</strong>
              <div style={{ color: '#fff', fontWeight: 600 }}>{selectedCmp.execution.frequency}x</div>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)' }}>Channels Spend Split:</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.3rem' }}>
                {selectedCmp.execution.channels_breakdown.map((ch, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', background: '#0f1626', padding: '0.3rem 0.6rem', borderRadius: '4px' }}>
                    <span>{ch.channel}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>${ch.spend.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. CAMPAIGN RESULT */}
        <div className="card" style={{ borderLeft: '4px solid var(--accent-emerald)' }}>
          <div className="card-header">
            <div className="card-title">
              <DollarSign size={18} color="#10b981" /> 3. Campaign Result
            </div>
            <span className="badge-observed">Attributed Commercial Return</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.875rem' }}>
            <div>
              <strong style={{ color: 'var(--text-muted)' }}>Attributed Revenue:</strong>
              <div style={{ color: 'var(--accent-emerald)', fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: '1.4rem' }}>
                ${selectedCmp.results.attributed_revenue.toLocaleString()}
              </div>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)' }}>Actual ROAS:</strong>
              <div style={{ color: '#fff', fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {selectedCmp.results.actual_roas}x
                <span style={{ fontSize: '0.8rem', color: selectedCmp.results.roas_delta >= 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                  ({selectedCmp.results.roas_delta >= 0 ? `+${selectedCmp.results.roas_delta}` : selectedCmp.results.roas_delta} vs planned)
                </span>
              </div>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)' }}>Clicks & CTR:</strong>
              <div style={{ color: '#fff', fontWeight: 600 }}>
                {selectedCmp.results.clicks.toLocaleString()} clicks ({selectedCmp.results.ctr}% CTR)
              </div>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)' }}>Conversions & CPA:</strong>
              <div style={{ color: '#fff', fontWeight: 600 }}>
                {selectedCmp.results.conversions.toLocaleString()} orders ({selectedCmp.results.conversion_rate}% Conv Rate, ${selectedCmp.results.cpa} CPA)
              </div>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)' }}>Net Profit:</strong>
              <div style={{ color: '#34d399', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                ${selectedCmp.results.net_profit.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Evidence Synthesis for Campaigns */}
      {aiData && (
        <div className="ai-panel">
          <div className="ai-panel-title">
            <Sparkles size={20} color="#06b6d4" /> Campaign Analytical Interpretation & Pattern Analysis
          </div>

          <div className="ai-section">
            <div className="ai-section-header">
              <span className="badge-observed">OBSERVED CAMPAIGN METRICS</span>
            </div>
            <ul className="ai-list">
              {aiData.observed.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>

          <div className="ai-section">
            <div className="ai-section-header">
              <span className="badge-inferred">INFERRED BEHAVIOR PATTERNS</span>
            </div>
            <ul className="ai-list">
              {aiData.inferred.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>

          <div className="ai-section">
            <div className="ai-section-header">
              <span className="badge-recommended">CAMPAIGN STRATEGIC RECOMMENDATIONS</span>
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
