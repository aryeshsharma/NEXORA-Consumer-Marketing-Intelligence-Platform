import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, 
  Calendar, 
  ArrowRight, 
  Sparkles, 
  X, 
  Plus, 
  UploadCloud, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Tag, 
  DollarSign, 
  TrendingUp, 
  Layers,
  Database,
  Play,
  RotateCcw
} from 'lucide-react';

export default function ProjectsView({ activeDataset, onDatasetChange }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProject, setActiveProject] = useState(null);
  const [cmpDetail, setCmpDetail] = useState(null);
  const [activatingId, setActivatingId] = useState(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [projectName, setProjectName] = useState('');
  const [category, setCategory] = useState('Home Office');
  const [campaignId, setCampaignId] = useState('');
  const [budget, setBudget] = useState('');
  const [targetRoas, setTargetRoas] = useState('');
  const [description, setDescription] = useState('');
  const [stagedFiles, setStagedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const categoryPresets = [
    'Home Office',
    'Aesthetics & Lighting',
    'Wellness & Aromatherapy',
    'Festive Gifting',
    'Retargeting & Retention',
    'Audio & Electronics',
    'Creator & Influencer',
    'Product Launch',
    'Custom Growth Initiative'
  ];

  const datasetTypeOptions = [
    'Marketing Spend',
    'Marketing Metrics',
    'Orders & Transactions',
    'Customer Profiles',
    'Social Posts & Reach',
    'Social Engagement Metrics',
    'Product Catalog & Margins',
    'Attribution Touchpoints',
    'Custom Raw CSV'
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      const json = await res.json();
      setProjects(json);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const openProjectDetails = async (prj) => {
    setActiveProject(prj);
    try {
      const res = await fetch('/api/analytics/campaigns');
      const json = await res.json();
      const match = json.find(c => c.campaign_id === prj.campaign_id);
      setCmpDetail(match || null);
    } catch (err) {
      console.error('Error fetching campaign detail for project:', err);
    }
  };

  const handleActivateDataset = async (projectId) => {
    setActivatingId(projectId);
    try {
      const res = await fetch(`/api/projects/${projectId}/activate`, { method: 'POST' });
      if (!res.ok) {
        const errJson = await res.json();
        alert(`Failed to activate dataset: ${errJson.detail || 'Error'}`);
        return;
      }
      const data = await res.json();
      setSuccessMsg(`Dataset for project ${projectId} activated successfully (${data.total_records} records)!`);
      setTimeout(() => setSuccessMsg(''), 4000);
      await fetchProjects();
      if (onDatasetChange) onDatasetChange();
    } catch (err) {
      console.error('Error activating project dataset:', err);
      alert('Error activating project dataset.');
    } finally {
      setActivatingId(null);
    }
  };

  const handleResetToBaseline = async () => {
    try {
      const res = await fetch('/api/dataset/activate-baseline', { method: 'POST' });
      if (res.ok) {
        setSuccessMsg('Active dataset restored to NEXORA Baseline Demo Dataset.');
        setTimeout(() => setSuccessMsg(''), 4000);
        await fetchProjects();
        if (onDatasetChange) onDatasetChange();
      }
    } catch (err) {
      console.error('Error resetting baseline:', err);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (files) => {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const lines = typeof text === 'string' ? text.split('\n').filter(l => l.trim().length > 0) : [];
        const rowCount = Math.max(0, lines.length - 1);

        // Guess dataset classification from file name
        let guessedType = 'Custom Raw CSV';
        const lowerName = file.name.toLowerCase();
        if (lowerName.includes('spend')) guessedType = 'Marketing Spend';
        else if (lowerName.includes('metric')) guessedType = 'Marketing Metrics';
        else if (lowerName.includes('order_item')) guessedType = 'Order Items';
        else if (lowerName.includes('order')) guessedType = 'Orders & Transactions';
        else if (lowerName.includes('cust')) guessedType = 'Customer Profiles';
        else if (lowerName.includes('post_metric')) guessedType = 'Social Post Metrics';
        else if (lowerName.includes('post') || lowerName.includes('social')) guessedType = 'Social Posts & Reach';
        else if (lowerName.includes('prod')) guessedType = 'Product Catalog & Margins';
        else if (lowerName.includes('attr')) guessedType = 'Attribution Touchpoints';

        setStagedFiles(prev => [
          ...prev,
          {
            id: Math.random().toString(36).substring(7),
            name: file.name,
            size: file.size,
            dataset_type: guessedType,
            row_count: rowCount,
            content: typeof text === 'string' ? text : ''
          }
        ]);
      };
      reader.readAsText(file);
    });
  };

  const removeStagedFile = (id) => {
    setStagedFiles(prev => prev.filter(f => f.id !== id));
  };

  const updateStagedFileType = (id, newType) => {
    setStagedFiles(prev => prev.map(f => f.id === id ? { ...f, dataset_type: newType } : f));
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!projectName.trim() || !description.trim()) {
      setErrorMsg('Please provide a Project Name and Description.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        project_name: projectName.trim(),
        description: description.trim(),
        category: category,
        campaign_id: campaignId.trim() || undefined,
        budget: budget ? parseFloat(budget) : 0,
        target_roas: targetRoas ? parseFloat(targetRoas) : 0,
        status: 'Active',
        uploaded_files: stagedFiles.map(f => ({
          name: f.name,
          size: f.size,
          dataset_type: f.dataset_type,
          row_count: f.row_count,
          content: f.content
        }))
      };

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || 'Failed to create project');
      }
      const data = await res.json();
      const newProj = data.project || data;

      setSuccessMsg(`Project "${newProj.project_name}" created and dataset activated successfully (${stagedFiles.length} files)!`);
      setTimeout(() => setSuccessMsg(''), 5000);

      // Reset form
      setProjectName('');
      setDescription('');
      setCampaignId('');
      setBudget('');
      setTargetRoas('');
      setStagedFiles([]);
      setShowAddModal(false);

      // Refresh list & signal change
      await fetchProjects();
      if (onDatasetChange) onDatasetChange();
    } catch (err) {
      console.error('Error creating project:', err);
      setErrorMsg(err.message || 'Failed to save project. Please check dataset format.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this custom project?')) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      if (res.ok) {
        setActiveProject(null);
        await fetchProjects();
        if (onDatasetChange) onDatasetChange();
      } else {
        alert('Cannot delete standard template project.');
      }
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) {
    return <div className="loading-spinner"><Sparkles size={16} className="spin" /> Loading Projects Workspace...</div>;
  }

  const isCustomDatasetActive = activeDataset?.active_dataset_type === 'custom';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header with Title and Add Project Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            NEXORA Projects Workspace
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Organized analytical projects linking marketing strategy, operational datasets, and commercial outcomes.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {isCustomDatasetActive && (
            <button 
              className="btn btn-secondary"
              onClick={handleResetToBaseline}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}
              title="Switch active engine back to baseline NEXORA dataset"
            >
              <RotateCcw size={14} /> Restore NEXORA Baseline
            </button>
          )}

          <button 
            className="btn btn-primary"
            onClick={() => { setErrorMsg(''); setShowAddModal(true); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1rem', fontSize: '0.85rem' }}
          >
            <Plus size={16} /> Add New Project & Dataset
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div style={{ padding: '0.75rem 1rem', background: 'var(--badge-observed-bg)', border: '1px solid var(--badge-observed-border)', borderRadius: 'var(--radius-md)', color: 'var(--badge-observed-text)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {/* Grid of Projects */}
      <div className="grid-cols-2">
        {projects.map(prj => {
          const filesCount = prj.uploaded_files ? prj.uploaded_files.length : 0;
          const isActive = (activeDataset?.active_project_id === prj.project_id);
          const canActivate = prj.has_dataset && !isActive;

          return (
            <div 
              key={prj.project_id} 
              className="card" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                border: isActive ? '2px solid #0284c7' : '1px solid var(--border-color)',
                boxShadow: isActive ? '0 0 0 1px #0284c7' : 'none'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    {isActive ? (
                      <span style={{ background: '#dbeafe', color: '#0369a1', border: '1px solid #93c5fd', borderRadius: '4px', padding: '0.15rem 0.5rem', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Database size={11} /> ACTIVE DATASET
                      </span>
                    ) : (
                      <span className={prj.status === 'Active' ? 'badge-inferred' : 'badge-observed'}>
                        {prj.status || 'Active'}
                      </span>
                    )}
                    {prj.category && (
                      <span className="category-tag">
                        {prj.category}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={12} /> {prj.created_at}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                  {prj.project_name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {prj.description}
                </p>

                {/* Key Project Specs Badges */}
                <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  {prj.budget > 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--bg-subtle)', padding: '0.2rem 0.45rem', borderRadius: '4px' }}>
                      <DollarSign size={12} color="var(--accent-primary)" />
                      <span>${prj.budget.toLocaleString()} Budget</span>
                    </div>
                  )}
                  {prj.target_roas > 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--bg-subtle)', padding: '0.2rem 0.45rem', borderRadius: '4px' }}>
                      <TrendingUp size={12} color="var(--badge-observed-text)" />
                      <span>{prj.target_roas}x Target ROAS</span>
                    </div>
                  )}
                  {filesCount > 0 && (
                    <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--accent-primary-light)', color: 'var(--accent-primary)', padding: '0.2rem 0.45rem', borderRadius: '4px', fontWeight: 600 }}>
                      <Database size={12} />
                      <span>{filesCount} Dataset{filesCount > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {prj.campaign_id || prj.project_id}
                </span>
                
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {canActivate && (
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handleActivateDataset(prj.project_id)}
                      disabled={activatingId === prj.project_id}
                      style={{ fontSize: '0.78rem', color: '#0369a1', borderColor: '#93c5fd', background: '#f0f9ff' }}
                    >
                      <Play size={12} /> {activatingId === prj.project_id ? 'Activating...' : 'Activate'}
                    </button>
                  )}
                  <button 
                    className="btn btn-secondary"
                    onClick={() => openProjectDetails(prj)}
                    style={{ fontSize: '0.8rem' }}
                  >
                    Details <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================
          MODAL 1: ADD NEW PROJECT & DATA UPLOAD
      ======================================================== */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => !submitting && setShowAddModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <UploadCloud size={20} color="var(--accent-primary)" />
                Create New Project & Ingest Dataset
              </div>
              <button 
                className="btn btn-secondary" 
                onClick={() => !submitting && setShowAddModal(false)}
                style={{ padding: '0.25rem 0.5rem' }}
                disabled={submitting}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              <div className="modal-body">
                {/* Validation Error Banner */}
                {errorMsg && (
                  <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', border: '1px solid #f87171', borderRadius: 'var(--radius-md)', color: '#b91c1c', fontSize: '0.82rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <AlertCircle size={16} style={{ marginTop: '0.1rem', flexShrink: 0 }} />
                    <div>
                      <strong>Validation Error:</strong>
                      <div style={{ marginTop: '0.15rem' }}>{errorMsg}</div>
                    </div>
                  </div>
                )}

                {/* Project Name & Category */}
                <div className="grid-cols-2" style={{ gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Project / Brand Name *</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="e.g. Apex Audio Expansion"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select 
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {categoryPresets.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {/* Campaign ID & Budget / Target ROAS */}
                <div className="grid-cols-3" style={{ gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Campaign ID (Optional)</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="e.g. CMP-2026-06"
                      value={campaignId}
                      onChange={(e) => setCampaignId(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Planned Budget ($)</label>
                    <input 
                      type="number" 
                      className="form-input"
                      placeholder="e.g. 35000"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Target ROAS (x)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="form-input"
                      placeholder="e.g. 4.0"
                      value={targetRoas}
                      onChange={(e) => setTargetRoas(e.target.value)}
                      min="0"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">Project Description & Strategic Objectives *</label>
                  <textarea 
                    className="form-textarea"
                    placeholder="Describe the campaign focus, target channels, brand objectives, and uploaded dataset details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                {/* Data Upload Dropzone */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Upload Dataset Files (15 CSVs for full analytical engine ingestion)</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>Supports CSV drag & drop</span>
                  </label>

                  <div 
                    className={`dropzone ${isDragOver ? 'drag-active' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  >
                    <UploadCloud size={28} className="dropzone-icon" />
                    <div className="dropzone-text">Click to choose files or drag & drop here</div>
                    <div className="dropzone-subtext">Drop all 15 CSV files (e.g. products.csv, orders.csv, campaigns.csv, etc.)</div>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      multiple 
                      accept=".csv,.json,.txt"
                      style={{ display: 'none' }}
                      onChange={handleFileSelect}
                    />
                  </div>

                  {/* Staged files list */}
                  {stagedFiles.length > 0 && (
                    <div className="uploaded-files-list">
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: stagedFiles.length >= 15 ? 'var(--badge-observed-text)' : 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{stagedFiles.length} file{stagedFiles.length > 1 ? 's' : ''} staged:</span>
                        {stagedFiles.length >= 15 && <span style={{ color: 'var(--badge-observed-text)' }}>✓ Ready for Full Analytical Ingestion</span>}
                      </div>
                      {stagedFiles.map(file => (
                        <div key={file.id} className="uploaded-file-item">
                          <div className="file-info">
                            <FileText size={16} color="var(--accent-primary)" />
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{file.name}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {formatFileSize(file.size)} • {file.row_count} rows detected
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <select 
                              className="form-select"
                              style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem', width: 'auto' }}
                              value={file.dataset_type}
                              onChange={(e) => updateStagedFileType(file.id, e.target.value)}
                            >
                              {datasetTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>

                            <button 
                              type="button" 
                              className="btn btn-secondary"
                              onClick={() => removeStagedFile(file.id)}
                              style={{ padding: '0.25rem 0.4rem', color: '#f43f5e' }}
                              title="Remove file"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {submitting ? <Sparkles size={14} className="spin" /> : <Plus size={14} />}
                  {submitting ? 'Validating & Ingesting...' : stagedFiles.length >= 15 ? 'Validate & Activate Dataset' : 'Create Project & Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: VIEW PROJECT DETAILS
      ======================================================== */}
      {activeProject && (
        <div className="modal-overlay" onClick={() => setActiveProject(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Folder size={18} color="var(--accent-primary)" /> {activeProject.project_name}
              </div>
              <button className="btn btn-secondary" onClick={() => setActiveProject(null)} style={{ padding: '0.2rem 0.5rem' }}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  {activeDataset?.active_project_id === activeProject.project_id ? (
                    <span style={{ background: '#dbeafe', color: '#0369a1', border: '1px solid #93c5fd', borderRadius: '4px', padding: '0.15rem 0.5rem', fontSize: '0.7rem', fontWeight: 700 }}>
                      ACTIVE DATASET
                    </span>
                  ) : (
                    <span className={activeProject.status === 'Active' ? 'badge-inferred' : 'badge-observed'}>
                      {activeProject.status || 'Active'}
                    </span>
                  )}
                  {activeProject.category && (
                    <span className="category-tag">{activeProject.category}</span>
                  )}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Created {activeProject.created_at}</span>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {activeProject.description}
              </p>

              {/* Project Specs */}
              <div className="grid-cols-2" style={{ gap: '0.75rem' }}>
                {activeProject.budget > 0 && (
                  <div className="metric-card">
                    <div className="metric-label">Planned Budget</div>
                    <div className="metric-value">${activeProject.budget.toLocaleString()}</div>
                  </div>
                )}
                {activeProject.target_roas > 0 && (
                  <div className="metric-card">
                    <div className="metric-label">Target ROAS</div>
                    <div className="metric-value" style={{ color: 'var(--accent-primary)' }}>{activeProject.target_roas}x</div>
                  </div>
                )}
              </div>

              {/* Linked Historical Campaign Analytics if available */}
              {cmpDetail && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                    Linked Campaign Performance ({cmpDetail.campaign_id})
                  </div>
                  <div className="grid-cols-2" style={{ gap: '0.75rem' }}>
                    <div className="metric-card">
                      <div className="metric-label">Attributed Revenue</div>
                      <div className="metric-value">${cmpDetail.results.attributed_revenue.toLocaleString()}</div>
                    </div>
                    <div className="metric-card">
                      <div className="metric-label">Actual ROAS</div>
                      <div className="metric-value" style={{ color: 'var(--accent-primary)' }}>{cmpDetail.results.actual_roas}x</div>
                    </div>
                  </div>

                  <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: '6px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div><strong>Target Audience:</strong> {cmpDetail.intention.target_audience}</div>
                    <div><strong>Campaign Message:</strong> "{cmpDetail.intention.campaign_message}"</div>
                    <div><strong>Offer / Discount:</strong> {cmpDetail.intention.offer_discount}</div>
                  </div>
                </div>
              )}

              {/* Uploaded Datasets Section */}
              {activeProject.uploaded_files && activeProject.uploaded_files.length > 0 && (
                <div style={{ marginTop: '0.25rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Database size={14} color="var(--accent-primary)" /> Attached Datasets & Files ({activeProject.uploaded_files.length})
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {activeProject.uploaded_files.map((file, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0.75rem', background: 'var(--bg-subtle)', borderRadius: '6px', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FileText size={15} color="var(--accent-primary)" />
                          <div>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{file.name}</span>
                            <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>({formatFileSize(file.size)})</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span className="file-badge">{file.dataset_type}</span>
                          {file.row_count > 0 && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                              {file.row_count} rows
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {activeProject.has_dataset && activeDataset?.active_project_id !== activeProject.project_id && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => { handleActivateDataset(activeProject.project_id); setActiveProject(null); }}
                    style={{ fontSize: '0.78rem', color: '#0369a1', borderColor: '#93c5fd' }}
                  >
                    <Play size={12} /> Activate This Dataset
                  </button>
                )}
                {activeProject.project_id.startsWith('PRJ-0') && parseInt(activeProject.project_id.split('-')[1]) > 5 && (
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => handleDeleteProject(activeProject.project_id)}
                    style={{ color: '#f43f5e', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <Trash2 size={13} /> Delete Project
                  </button>
                )}
              </div>
              <button className="btn btn-primary" onClick={() => setActiveProject(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
