import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Share2, Video, Image, Layers, Sparkles, Heart } from 'lucide-react';

export default function ContentAnalytics() {
  const [data, setData] = useState(null);
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContentData();
  }, []);

  const fetchContentData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analytics/content');
      const json = await res.json();
      setData(json);

      const aiRes = await fetch('/api/ai/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area: 'content' })
      });
      const aiJson = await aiRes.json();
      setAiData(aiJson);
    } catch (err) {
      console.error('Failed to fetch content data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <div className="loading-spinner"><Sparkles className="spin" /> Analyzing Social Media Posts & Content Formats...</div>;
  }

  const { leaderboard, by_format, by_theme } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Format & Theme Performance Overview */}
      <div className="grid-cols-2">
        {/* Format Performance Bar Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Video size={18} color="#3b82f6" /> Engagement Rate by Content Format
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reels vs Carousel vs Static</span>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={by_format} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#23314e" />
                <XAxis dataKey="format" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#131b2e', borderColor: '#23314e', borderRadius: '8px', color: '#fff' }}
                  formatter={(v) => `${v}% Avg Engagement`} 
                />
                <Bar dataKey="avg_engagement_rate" name="Avg Engagement Rate (%)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Theme Breakdown */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Layers size={18} color="#8b5cf6" /> Content Theme Effectiveness
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Top Performing Creative Angles</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
            {by_theme.map((t, idx) => (
              <div key={idx} style={{ background: '#0d1424', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{t.theme}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {t.post_count} posts | {t.total_impressions.toLocaleString()} impressions | {t.total_clicks.toLocaleString()} clicks
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                    {t.avg_engagement_rate}%
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Engagement</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Post Leaderboard Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Share2 size={18} color="#10b981" /> Social Media Post Leaderboard
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ranked by Impressions & Audience Response</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Post ID / Caption</th>
                <th>Platform</th>
                <th>Format</th>
                <th>Theme</th>
                <th>Impressions</th>
                <th>Reach</th>
                <th>Likes / Comments</th>
                <th>Saves</th>
                <th>Clicks</th>
                <th>Engagement Rate</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.slice(0, 10).map((post, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>
                      {post.post_id} - <span style={{ fontStyle: 'italic', fontWeight: 400, color: 'var(--text-muted)' }}>"{post.caption.substring(0, 45)}..."</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>{post.campaign_name}</div>
                  </td>
                  <td><span className="checkbox-pill" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>{post.platform}</span></td>
                  <td>{post.format}</td>
                  <td>{post.content_theme}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{post.impressions.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{post.reach.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{post.likes.toLocaleString()} / {post.comments.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', fontWeight: 600 }}>{post.saves.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{post.link_clicks.toLocaleString()}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-emerald)' }}>{post.engagement_rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Content Intelligence Panel */}
      {aiData && (
        <div className="ai-panel">
          <div className="ai-panel-title">
            <Sparkles size={20} color="#06b6d4" /> Content & Social Intelligence Synthesis
          </div>

          <div className="ai-section">
            <div className="ai-section-header">
              <span className="badge-observed">OBSERVED CONTENT METRICS</span>
            </div>
            <ul className="ai-list">
              {aiData.observed.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>

          <div className="ai-section">
            <div className="ai-section-header">
              <span className="badge-inferred">INFERRED AUDIENCE BEHAVIOR</span>
            </div>
            <ul className="ai-list">
              {aiData.inferred.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>

          <div className="ai-section">
            <div className="ai-section-header">
              <span className="badge-recommended">CREATIVE STRATEGY RECOMMENDATIONS</span>
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
