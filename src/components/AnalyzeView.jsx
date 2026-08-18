import React, { useState, useEffect } from 'react';
import { Target, Share2, ShoppingCart, Users, Filter, Columns, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import CampaignComparison from './CampaignComparison';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function AnalyzeView({ initialDomain = 'campaigns' }) {
  const [activeDomain, setActiveDomain] = useState(initialDomain);
  const [showEvidence, setShowEvidence] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Data states
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCmpId, setSelectedCmpId] = useState('');
  const [contentData, setContentData] = useState(null);
  const [commerceData, setCommerceData] = useState(null);
  const [funnelData, setFunnelData] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveDomain(initialDomain);
    setShowComparison(false);
    setShowEvidence(false);
    setShowAI(false);
  }, [initialDomain]);

  useEffect(() => {
    fetchDomainData(activeDomain);
  }, [activeDomain]);

  const fetchDomainData = async (domain) => {
    setLoading(true);
    setShowComparison(false);
    setShowEvidence(false);
    setShowAI(false);
    try {
      if (domain === 'campaigns') {
        const res = await fetch('/api/analytics/campaigns');
        const json = await res.json();
        setCampaigns(json);
        if (json.length > 0) setSelectedCmpId(json[0].campaign_id);
      } else if (domain === 'content') {
        const res = await fetch('/api/analytics/content');
        const json = await res.json();
        setContentData(json);
      } else if (domain === 'commerce' || domain === 'customers') {
        const res = await fetch('/api/analytics/commerce');
        const json = await res.json();
        setCommerceData(json);
      } else if (domain === 'funnel') {
        const res = await fetch('/api/analytics/funnel');
        const json = await res.json();
        setFunnelData(json);
      }

      const aiArea = domain === 'campaigns' ? 'campaigns' : domain === 'content' ? 'content' : domain === 'commerce' || domain === 'customers' ? 'commerce' : 'overview';
      const aiRes = await fetch('/api/ai/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area: aiArea })
      });
      const aiJson = await aiRes.json();
      setAiData(aiJson);
    } catch (err) {
      console.error('Error fetching domain data:', err);
    } finally {
      setLoading(false);
    }
  };

  const domainTabs = [
    { id: 'campaigns', label: 'Campaign Performance', subtitle: 'Intention vs execution return across historical marketing pushes' },
    { id: 'content', label: 'Content & Social', subtitle: 'Creative format engagement and post performance' },
    { id: 'commerce', label: 'Commerce & Merchandising', subtitle: 'Product revenue matrix, unit margins, and sentiment' },
    { id: 'customers', label: 'Customer Segments', subtitle: 'Demographics, purchase frequency, and lifetime value' },
    { id: 'funnel', label: 'Traffic & Funnel', subtitle: 'Ad impression to checkout conversion drop-off analysis' }
  ];

  const currentDomainInfo = domainTabs.find(d => d.id === activeDomain) || domainTabs[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Domain Selector Pills (Active: Blue, Inactive: Quiet Neutral) */}
      <div className="domain-selector">
        {domainTabs.map(d => (
          <button
            key={d.id}
            className={`domain-pill ${activeDomain === d.id ? 'active' : ''}`}
            onClick={() => setActiveDomain(d.id)}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Header Intro & Campaign Compare Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {showComparison ? 'Multi-Campaign Comparison Matrix' : currentDomainInfo.label}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {showComparison ? 'Compare campaigns side-by-side across financial & performance metrics.' : currentDomainInfo.subtitle}
          </p>
        </div>

        {activeDomain === 'campaigns' && (
          <button 
            className={`btn ${showComparison ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowComparison(!showComparison)}
            style={{ fontSize: '0.78rem' }}
          >
            <Columns size={14} /> {showComparison ? 'Back to Campaign View' : 'Compare Campaigns'}
          </button>
        )}
      </div>

      {/* Render Campaign Comparison Matrix if toggled */}
      {activeDomain === 'campaigns' && showComparison ? (
        <CampaignComparison />
      ) : loading ? (
        <div className="loading-spinner"><Sparkles size={16} className="spin" /> Processing Analytical Data...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* ========================================================
              DOMAIN 1: CAMPAIGN PERFORMANCE
          ======================================================== */}
          {activeDomain === 'campaigns' && campaigns.length > 0 && (() => {
            const selectedCmp = campaigns.find(c => c.campaign_id === selectedCmpId) || campaigns[0];
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Campaign Selector Buttons (Quiet Neutrals) */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {campaigns.map(c => (
                    <button
                      key={c.campaign_id}
                      onClick={() => setSelectedCmpId(c.campaign_id)}
                      className={`btn ${selectedCmpId === c.campaign_id ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                    >
                      {c.campaign_name}
                    </button>
                  ))}
                </div>

                {/* ALWAYS VISIBLE SUMMARY METRICS */}
                <div className="grid-cols-4" style={{ gap: '0.75rem' }}>
                  <div className="metric-card">
                    <div className="metric-label">Attributed Revenue</div>
                    <div className="metric-value">${selectedCmp.results.attributed_revenue.toLocaleString()}</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Actual ROAS</div>
                    <div className="metric-value" style={{ color: 'var(--accent-primary)' }}>{selectedCmp.results.actual_roas}x</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Actual Spend</div>
                    <div className="metric-value">${selectedCmp.execution.actual_spend.toLocaleString()}</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-label">Conversions & CPA</div>
                    <div className="metric-value">{selectedCmp.results.conversions}</div>
                    <div className="metric-sub" style={{ fontSize: '0.75rem' }}>${selectedCmp.results.cpa} CPA</div>
                  </div>
                </div>

                {/* MAIN ANALYTICAL FINDING (Visual Anchor) */}
                <div className="card" style={{ padding: '0.9rem 1.1rem', borderLeft: '3px solid var(--accent-primary)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                    CAMPAIGN CONCLUSION
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                    Campaign <strong>{selectedCmp.campaign_name}</strong> achieved <strong>{selectedCmp.results.actual_roas}x ROAS</strong> generating ${selectedCmp.results.attributed_revenue.toLocaleString()} revenue from ${selectedCmp.execution.actual_spend.toLocaleString()} spend ({selectedCmp.execution.budget_utilized_percent}% budget used).
                  </p>
                </div>

                {/* Progressive Disclosure Toggles */}
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setShowEvidence(!showEvidence)}
                    style={{ fontSize: '0.78rem' }}
                  >
                    {showEvidence ? <ChevronUp size={14} /> : <ChevronDown size={14} />} 
                    {showEvidence ? 'Hide Evidence & Details' : 'View Evidence & Details'}
                  </button>

                  <button 
                    className="btn btn-secondary" 
                    onClick={() => setShowAI(!showAI)}
                    style={{ fontSize: '0.78rem' }}
                  >
                    {showAI ? <ChevronUp size={14} /> : <ChevronDown size={14} />} 
                    {showAI ? 'Hide AI Reasoning' : 'View AI Reasoning'}
                  </button>
                </div>

                {/* EXPANDABLE LEVEL 2: EVIDENCE */}
                {showEvidence && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.25rem' }}>
                    <div className="grid-cols-2">
                      <div className="card">
                        <div className="card-title" style={{ fontSize: '0.875rem' }}>Intention Strategy</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                          <div><strong>Objective:</strong> {selectedCmp.intention.objective}</div>
                          <div><strong>Planned Budget:</strong> ${selectedCmp.intention.budget.toLocaleString()}</div>
                          <div><strong>Target Audience:</strong> {selectedCmp.intention.target_audience}</div>
                          <div><strong>Offer / Discount:</strong> {selectedCmp.intention.offer_discount}</div>
                        </div>
                      </div>

                      <div className="card">
                        <div className="card-title" style={{ fontSize: '0.875rem' }}>Channel Spend Breakdown</div>
                        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                          {selectedCmp.execution.channels_breakdown.map((ch, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0.6rem', background: 'var(--bg-subtle)', borderRadius: '4px', fontSize: '0.8rem' }}>
                              <span>{ch.channel}</span>
                              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>${ch.spend.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="table-container">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Impressions</th>
                            <th>Reach</th>
                            <th>Clicks</th>
                            <th>CTR</th>
                            <th>Conversions</th>
                            <th>Conv. Rate</th>
                            <th>Net Profit</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{selectedCmp.execution.impressions.toLocaleString()}</td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{selectedCmp.execution.reach.toLocaleString()}</td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{selectedCmp.results.clicks.toLocaleString()}</td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{selectedCmp.results.ctr}%</td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{selectedCmp.results.conversions}</td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{selectedCmp.results.conversion_rate}%</td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--badge-observed-text)' }}>${selectedCmp.results.net_profit.toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* EXPANDABLE LEVEL 3: AI INSIGHTS */}
                {showAI && aiData && (
                  <div className="ai-panel">
                    <div className="ai-section">
                      <div className="ai-section-header"><span className="badge-observed">OBSERVED</span></div>
                      <ul className="ai-list">{aiData.observed.map((item, i) => <li key={i}>{item}</li>)}</ul>
                    </div>
                    <div className="ai-section">
                      <div className="ai-section-header"><span className="badge-inferred">INFERRED</span></div>
                      <ul className="ai-list">{aiData.inferred.map((item, i) => <li key={i}>{item}</li>)}</ul>
                    </div>
                    <div className="ai-section">
                      <div className="ai-section-header"><span className="badge-recommended">RECOMMENDED</span></div>
                      <ul className="ai-list">{aiData.recommended.map((item, i) => <li key={i}>{item}</li>)}</ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ========================================================
              DOMAIN 2: CONTENT & SOCIAL
          ======================================================== */}
          {activeDomain === 'content' && contentData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="grid-cols-3" style={{ gap: '0.75rem' }}>
                <div className="metric-card">
                  <div className="metric-label">Analyzed Social Posts</div>
                  <div className="metric-value">{contentData.leaderboard.length}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Top Creative Format</div>
                  <div className="metric-value" style={{ fontSize: '1.2rem' }}>Reels / Short Video</div>
                  <div className="metric-sub" style={{ fontSize: '0.75rem' }}>5.2% Avg Engagement</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Top Content Theme</div>
                  <div className="metric-value" style={{ fontSize: '1.2rem' }}>Desk Tour Aesthetic</div>
                </div>
              </div>

              <div className="card" style={{ padding: '0.9rem 1.1rem', borderLeft: '3px solid var(--accent-primary)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  CONTENT MAIN FINDING
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                  Short-form video Reels and TikTok clips drive 3x higher impression discovery, while multi-slide carousels generate the highest save rate and direct website clickthroughs.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button className="btn btn-secondary" onClick={() => setShowEvidence(!showEvidence)} style={{ fontSize: '0.78rem' }}>
                  {showEvidence ? <ChevronUp size={14} /> : <ChevronDown size={14} />} 
                  {showEvidence ? 'Hide Format Chart & Post Leaderboard' : 'View Format Chart & Post Leaderboard'}
                </button>
                <button className="btn btn-secondary" onClick={() => setShowAI(!showAI)} style={{ fontSize: '0.78rem' }}>
                  {showAI ? <ChevronUp size={14} /> : <ChevronDown size={14} />} 
                  {showAI ? 'Hide AI Reasoning' : 'View AI Reasoning'}
                </button>
              </div>

              {showEvidence && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="card">
                    <div className="card-title" style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>Engagement Rate by Content Format</div>
                    <div style={{ width: '100%', height: 200 }}>
                      <ResponsiveContainer>
                        <BarChart data={contentData.by_format}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="format" stroke="#64748b" fontSize={11} />
                          <YAxis stroke="#64748b" fontSize={11} unit="%" />
                          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #cbd5e1' }} />
                          <Bar dataKey="avg_engagement_rate" fill="#2563eb" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Post ID</th>
                          <th>Platform</th>
                          <th>Format</th>
                          <th>Impressions</th>
                          <th>Reach</th>
                          <th>Saves</th>
                          <th>Clicks</th>
                          <th>Engagement</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contentData.leaderboard.slice(0, 8).map((p, i) => (
                          <tr key={i}>
                            <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.post_id}</td>
                            <td>{p.platform}</td>
                            <td>{p.format}</td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{p.impressions.toLocaleString()}</td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{p.reach.toLocaleString()}</td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{p.saves}</td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{p.link_clicks}</td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--badge-observed-text)' }}>{p.engagement_rate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {showAI && aiData && (
                <div className="ai-panel">
                  <div className="ai-section">
                    <div className="ai-section-header"><span className="badge-observed">OBSERVED</span></div>
                    <ul className="ai-list">{aiData.observed.map((item, i) => <li key={i}>{item}</li>)}</ul>
                  </div>
                  <div className="ai-section">
                    <div className="ai-section-header"><span className="badge-inferred">INFERRED</span></div>
                    <ul className="ai-list">{aiData.inferred.map((item, i) => <li key={i}>{item}</li>)}</ul>
                  </div>
                  <div className="ai-section">
                    <div className="ai-section-header"><span className="badge-recommended">RECOMMENDED</span></div>
                    <ul className="ai-list">{aiData.recommended.map((item, i) => <li key={i}>{item}</li>)}</ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              DOMAIN 3: COMMERCE
          ======================================================== */}
          {activeDomain === 'commerce' && commerceData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="grid-cols-3" style={{ gap: '0.75rem' }}>
                <div className="metric-card">
                  <div className="metric-label">Top Product Revenue</div>
                  <div className="metric-value" style={{ fontSize: '1.1rem' }}>{commerceData.products[0].product_name}</div>
                  <div className="metric-sub" style={{ fontSize: '0.75rem' }}>${commerceData.products[0].total_revenue.toLocaleString()}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Avg Margin %</div>
                  <div className="metric-value">62.4%</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Catalog Size</div>
                  <div className="metric-value">{commerceData.products.length} Products</div>
                </div>
              </div>

              <div className="card" style={{ padding: '0.9rem 1.1rem', borderLeft: '3px solid var(--accent-primary)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  COMMERCE MAIN FINDING
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                  Standing desks and monitor lightbars drive 64% of total catalog revenue, while essential oil aromatherapy trios serve as high-volume initial customer acquisition drivers.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button className="btn btn-secondary" onClick={() => setShowEvidence(!showEvidence)} style={{ fontSize: '0.78rem' }}>
                  {showEvidence ? <ChevronUp size={14} /> : <ChevronDown size={14} />} 
                  {showEvidence ? 'Hide Product Revenue Matrix' : 'View Product Revenue Matrix'}
                </button>
                <button className="btn btn-secondary" onClick={() => setShowAI(!showAI)} style={{ fontSize: '0.78rem' }}>
                  {showAI ? <ChevronUp size={14} /> : <ChevronDown size={14} />} 
                  {showAI ? 'Hide AI Reasoning' : 'View AI Reasoning'}
                </button>
              </div>

              {showEvidence && (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Margin %</th>
                        <th>Units Sold</th>
                        <th>Total Revenue</th>
                        <th>Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commerceData.products.map((p, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{p.product_name}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{p.category_name}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>${p.price}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{p.margin_percent}%</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{p.units_sold}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--badge-observed-text)' }}>${p.total_revenue.toLocaleString()}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>⭐ {p.avg_rating}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {showAI && aiData && (
                <div className="ai-panel">
                  <div className="ai-section">
                    <div className="ai-section-header"><span className="badge-observed">OBSERVED</span></div>
                    <ul className="ai-list">{aiData.observed.map((item, i) => <li key={i}>{item}</li>)}</ul>
                  </div>
                  <div className="ai-section">
                    <div className="ai-section-header"><span className="badge-inferred">INFERRED</span></div>
                    <ul className="ai-list">{aiData.inferred.map((item, i) => <li key={i}>{item}</li>)}</ul>
                  </div>
                  <div className="ai-section">
                    <div className="ai-section-header"><span className="badge-recommended">RECOMMENDED</span></div>
                    <ul className="ai-list">{aiData.recommended.map((item, i) => <li key={i}>{item}</li>)}</ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              DOMAIN 4: CUSTOMER SEGMENTS
          ======================================================== */}
          {activeDomain === 'customers' && commerceData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="grid-cols-3" style={{ gap: '0.75rem' }}>
                <div className="metric-card">
                  <div className="metric-label">Top Segment Revenue</div>
                  <div className="metric-value" style={{ fontSize: '1.1rem' }}>{commerceData.segments[0].segment_name}</div>
                  <div className="metric-sub" style={{ fontSize: '0.75rem' }}>${commerceData.segments[0].total_revenue.toLocaleString()}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Highest Segment LTV</div>
                  <div className="metric-value">${commerceData.segments[0].avg_customer_ltv}</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Repeat Purchase Rate</div>
                  <div className="metric-value">75.7%</div>
                </div>
              </div>

              <div className="card" style={{ padding: '0.9rem 1.1rem', borderLeft: '3px solid var(--accent-primary)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  CUSTOMER SEGMENT MAIN FINDING
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                  Remote Professionals (Age 28-42) represent the most valuable customer segment ($285 AOV and highest LTV), whereas Gen Z Creators respond fastest to social video promotion.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button className="btn btn-secondary" onClick={() => setShowEvidence(!showEvidence)} style={{ fontSize: '0.78rem' }}>
                  {showEvidence ? <ChevronUp size={14} /> : <ChevronDown size={14} />} 
                  {showEvidence ? 'Hide Segment LTV & Demographics' : 'View Segment LTV & Demographics'}
                </button>
                <button className="btn btn-secondary" onClick={() => setShowAI(!showAI)} style={{ fontSize: '0.78rem' }}>
                  {showAI ? <ChevronUp size={14} /> : <ChevronDown size={14} />} 
                  {showAI ? 'Hide AI Reasoning' : 'View AI Reasoning'}
                </button>
              </div>

              {showEvidence && (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Segment Name</th>
                        <th>Demographics</th>
                        <th>Customers</th>
                        <th>Orders</th>
                        <th>AOV</th>
                        <th>Total Revenue</th>
                        <th>Avg LTV</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commerceData.segments.map((seg, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{seg.segment_name}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{seg.age_band} age | {seg.region}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{seg.total_customers}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>{seg.total_orders}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>${seg.aov}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--badge-observed-text)' }}>${seg.total_revenue.toLocaleString()}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)' }}>${seg.avg_customer_ltv}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {showAI && aiData && (
                <div className="ai-panel">
                  <div className="ai-section">
                    <div className="ai-section-header"><span className="badge-observed">OBSERVED</span></div>
                    <ul className="ai-list">{aiData.observed.map((item, i) => <li key={i}>{item}</li>)}</ul>
                  </div>
                  <div className="ai-section">
                    <div className="ai-section-header"><span className="badge-inferred">INFERRED</span></div>
                    <ul className="ai-list">{aiData.inferred.map((item, i) => <li key={i}>{item}</li>)}</ul>
                  </div>
                  <div className="ai-section">
                    <div className="ai-section-header"><span className="badge-recommended">RECOMMENDED</span></div>
                    <ul className="ai-list">{aiData.recommended.map((item, i) => <li key={i}>{item}</li>)}</ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              DOMAIN 5: TRAFFIC & FUNNEL
          ======================================================== */}
          {activeDomain === 'funnel' && funnelData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="grid-cols-3" style={{ gap: '0.75rem' }}>
                <div className="metric-card">
                  <div className="metric-label">Ad Impressions</div>
                  <div className="metric-value">15.7M</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Visit-to-Order Rate</div>
                  <div className="metric-value">{funnelData.overall_visit_to_order_conv_rate}%</div>
                </div>
                <div className="metric-card">
                  <div className="metric-label">Primary Drop-off Stage</div>
                  <div className="metric-value" style={{ fontSize: '1.1rem', color: '#b45309' }}>Ad CTR (3.2%)</div>
                </div>
              </div>

              <div className="card" style={{ padding: '0.9rem 1.1rem', borderLeft: '3px solid var(--accent-primary)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
                  FUNNEL BOTTLENECK FINDING
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                  The primary conversion drop-off occurs at top-of-funnel ad clickthrough (3.2% CTR). On-site product page views convert strongly at a 68.4% cart completion rate.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button className="btn btn-secondary" onClick={() => setShowEvidence(!showEvidence)} style={{ fontSize: '0.78rem' }}>
                  {showEvidence ? <ChevronUp size={14} /> : <ChevronDown size={14} />} 
                  {showEvidence ? 'Hide 5-Stage Conversion Funnel' : 'View 5-Stage Conversion Funnel'}
                </button>
                <button className="btn btn-secondary" onClick={() => setShowAI(!showAI)} style={{ fontSize: '0.78rem' }}>
                  {showAI ? <ChevronUp size={14} /> : <ChevronDown size={14} />} 
                  {showAI ? 'Hide AI Reasoning' : 'View AI Reasoning'}
                </button>
              </div>

              {showEvidence && (
                <div className="card">
                  <div className="card-title" style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>5-Stage Conversion Funnel Breakdown</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {funnelData.funnel_stages.map((st, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.75rem', background: 'var(--bg-subtle)', borderRadius: '6px', fontSize: '0.82rem' }}>
                        <span style={{ fontWeight: 600 }}>{st.stage}</span>
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{st.count.toLocaleString()} ({st.conversion_from_prev}% step efficiency)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showAI && (
                <div className="ai-panel">
                  <div className="ai-section">
                    <div className="ai-section-header"><span className="badge-observed">OBSERVED</span></div>
                    <ul className="ai-list">
                      <li>Top conversion drop-off is between ad impressions and website visits (3.2% CTR).</li>
                      <li>Cart abandonment sits at ~31.6% of shoppers who add items to cart.</li>
                    </ul>
                  </div>
                  <div className="ai-section">
                    <div className="ai-section-header"><span className="badge-recommended">RECOMMENDED</span></div>
                    <ul className="ai-list">
                      <li>Implement 1-hour automated cart abandonment email notifications to recover lost revenue.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
