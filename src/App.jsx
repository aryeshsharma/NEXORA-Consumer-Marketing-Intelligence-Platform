import React, { useState } from 'react';
import OverviewView from './components/OverviewView';
import AnalyzeView from './components/AnalyzeView';
import ProjectsView from './components/ProjectsView';
import StrategyView from './components/StrategyView';

import { LayoutDashboard, BarChart2, Folder, Compass, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'analyze' | 'projects' | 'strategy'
  const [analyzeDomain, setAnalyzeDomain] = useState('campaigns');
  const [reloading, setReloading] = useState(false);
  const [reloadMsg, setReloadMsg] = useState('');

  const handleReloadData = async () => {
    setReloading(true);
    setReloadMsg('Reloading...');
    try {
      const res = await fetch('/api/ingest/reload', { method: 'POST' });
      const json = await res.json();
      setReloadMsg(`[OK] Reloaded ${json.total_records} records`);
      setTimeout(() => setReloadMsg(''), 4000);
    } catch (err) {
      setReloadMsg('Reload error');
      console.error(err);
    } finally {
      setReloading(false);
    }
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

        <div className="header-actions">
          {reloadMsg && (
            <span style={{ fontSize: '0.8rem', color: 'var(--badge-observed-text)', fontFamily: 'var(--font-mono)' }}>
              {reloadMsg}
            </span>
          )}
          <button 
            className="btn btn-secondary" 
            onClick={handleReloadData}
            disabled={reloading}
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
          <OverviewView onNavigateToAnalyze={handleNavigateToAnalyze} />
        )}
        {activeTab === 'analyze' && (
          <AnalyzeView initialDomain={analyzeDomain} />
        )}
        {activeTab === 'projects' && (
          <ProjectsView />
        )}
        {activeTab === 'strategy' && (
          <StrategyView />
        )}
      </main>
    </div>
  );
}
