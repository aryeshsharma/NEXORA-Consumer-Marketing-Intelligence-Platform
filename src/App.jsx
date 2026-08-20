import React, { useState, useEffect } from 'react';
import OverviewView from './components/OverviewView';
import AnalyzeView from './components/AnalyzeView';
import ProjectsView from './components/ProjectsView';
import StrategyView from './components/StrategyView';

import { LayoutDashboard, BarChart2, Folder, Compass, RefreshCw, Database } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'analyze' | 'projects' | 'strategy'
  const [analyzeDomain, setAnalyzeDomain] = useState('campaigns');
  const [reloading, setReloading] = useState(false);
  const [reloadMsg, setReloadMsg] = useState('');
  const [activeDataset, setActiveDataset] = useState(null);
  const [datasetVersion, setDatasetVersion] = useState(0);

  useEffect(() => {
    fetchActiveDataset();
  }, [datasetVersion]);

  const fetchActiveDataset = async () => {
    try {
      const res = await fetch('/api/dataset/active');
      if (res.ok) {
        const json = await res.json();
        setActiveDataset(json);
      }
    } catch (err) {
      console.error('Failed to fetch active dataset:', err);
    }
  };

  const handleReloadData = async () => {
    setReloading(true);
    setReloadMsg('Reloading...');
    try {
      const res = await fetch('/api/ingest/reload', { method: 'POST' });
      const json = await res.json();
      setReloadMsg(`[OK] Reloaded ${json.total_records} records`);
      setDatasetVersion(v => v + 1);
      setTimeout(() => setReloadMsg(''), 4000);
    } catch (err) {
      setReloadMsg('Reload error');
      console.error(err);
    } finally {
      setReloading(false);
    }
  };

  const handleDatasetChange = () => {
    setDatasetVersion(v => v + 1);
  };

  const handleNavigateToAnalyze = (domainKey) => {
    setAnalyzeDomain(domainKey);
    setActiveTab('analyze');
  };

  return (
    <div className="app-layout">
      {/* Header Bar */}
      <header className="app-header">
        <div className="brand-badge">
          <div className="brand-logo">N</div>
          <div className="brand-info">
            <h1>NEXORA Intelligence</h1>
            <span>Consumer & Marketing Intelligence</span>
          </div>
        </div>

        <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Subtle Active Dataset Indicator */}
          {activeDataset && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.25rem 0.6rem',
              borderRadius: '4px',
              background: activeDataset.active_dataset_type === 'custom' ? '#e0f2fe' : 'var(--bg-subtle)',
              border: `1px solid ${activeDataset.active_dataset_type === 'custom' ? '#0284c7' : 'var(--border-color)'}`,
              fontSize: '0.75rem',
              color: activeDataset.active_dataset_type === 'custom' ? '#0369a1' : 'var(--text-secondary)',
              fontWeight: 600
            }}>
              <Database size={12} />
              <span>Dataset: <strong>{activeDataset.active_brand_name || activeDataset.active_project_name}</strong></span>
            </div>
          )}

          {reloadMsg && (
            <span style={{ fontSize: '0.8rem', color: 'var(--badge-observed-text)', fontFamily: 'var(--font-mono)' }}>
              {reloadMsg}
            </span>
          )}
          <button 
            className="btn btn-secondary" 
            onClick={handleReloadData}
            disabled={reloading}
            style={{ fontSize: '0.78rem' }}
          >
            <RefreshCw size={14} className={reloading ? 'spin' : ''} />
            {reloading ? 'Ingesting...' : 'Reload Data'}
          </button>
        </div>
      </header>

      {/* ONLY 4 PRIMARY NAVIGATION TABS */}
      <nav className="nav-tabs">
        <button 
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <LayoutDashboard size={16} /> Overview
        </button>

        <button 
          className={`nav-tab ${activeTab === 'analyze' ? 'active' : ''}`}
          onClick={() => setActiveTab('analyze')}
        >
          <BarChart2 size={16} /> Analyze
        </button>

        <button 
          className={`nav-tab ${activeTab === 'projects' ? 'active' : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          <Folder size={16} /> Projects
        </button>

        <button 
          className={`nav-tab ${activeTab === 'strategy' ? 'active' : ''}`}
          onClick={() => setActiveTab('strategy')}
        >
          <Compass size={16} /> Strategy
        </button>
      </nav>

      {/* Main Workspace */}
      <main className="main-content">
        {activeTab === 'overview' && (
          <OverviewView 
            key={datasetVersion}
            activeDataset={activeDataset} 
            onNavigateToAnalyze={handleNavigateToAnalyze} 
          />
        )}
        {activeTab === 'analyze' && (
          <AnalyzeView 
            key={datasetVersion}
            initialDomain={analyzeDomain} 
          />
        )}
        {activeTab === 'projects' && (
          <ProjectsView 
            key={datasetVersion}
            activeDataset={activeDataset}
            onDatasetChange={handleDatasetChange} 
          />
        )}
        {activeTab === 'strategy' && (
          <StrategyView 
            key={datasetVersion}
            activeDataset={activeDataset}
          />
        )}
      </main>
    </div>
  );
}
