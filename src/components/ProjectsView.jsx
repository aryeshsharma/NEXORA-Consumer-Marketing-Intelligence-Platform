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
  Tag, 
  DollarSign, 
  TrendingUp, 
  Layers,
  Database
} from 'lucide-react';

export default function ProjectsView() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeProject, setActiveProject] = useState(null);
  const [cmpDetail, setCmpDetail] = useState(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

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
        else if (lowerName.includes('order')) guessedType = 'Orders & Transactions';
        else if (lowerName.includes('cust')) guessedType = 'Customer Profiles';
        else if (lowerName.includes('post') || lowerName.includes('social')) guessedType = 'Social Posts & Reach';
        else if (lowerName.includes('prod') || lowerName.includes('catalog')) guessedType = 'Product Catalog & Margins';
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
    if (!projectName.trim() || !description.trim()) {
      alert('Please provide a Project Name and Description.');
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

      if (!res.ok) throw new Error('Failed to create project');
      const newProj = await res.json();

      setSuccessMsg(`Project "${newProj.project_name}" created with ${stagedFiles.length} dataset(s) attached!`);
      setTimeout(() => setSuccessMsg(''), 4000);

      // Reset form
      setProjectName('');
      setDescription('');
      setCampaignId('');
      setBudget('');
      setTargetRoas('');
      setStagedFiles([]);
      setShowAddModal(false);

      // Refresh list
      await fetchProjects();
    } catch (err) {
      console.error('Error creating project:', err);
      alert('Failed to save project. Please try again.');
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
        fetchProjects();
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

        <button 
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.55rem 1rem', fontSize: '0.85rem' }}
        >
          <Plus size={16} /> Add New Project
        </button>
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
          return (
            <div key={prj.project_id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <span className={prj.status === 'Active' ? 'badge-inferred' : 'badge-observed'}>
                      {prj.status || 'Active'}
                    </span>
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
                      <span>{filesCount} Dataset{filesCount > 1 ? 's' : ''} Attached</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {prj.campaign_id || prj.project_id}
                </span>
                <button 
                  className="btn btn-secondary"
                  onClick={() => openProjectDetails(prj)}
                  style={{ fontSize: '0.8rem' }}
                >
                  View Project Details <ArrowRight size={14} />
                </button>
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
                Create New Project & Upload Data
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
                {/* Project Name & Category */}
                <div className="grid-cols-2" style={{ gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Project Name *</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="e.g. Q3 Smart Living Launch"
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
                      placeholder="e.g. 25000"
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
                      placeholder="e.g. 4.2"
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
                    placeholder="Describe the campaign focus, target channels, expected outcomes, and creative strategy..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                {/* Data Upload Dropzone */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Upload Dataset Files (CSV, JSON)</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>Attach operational records to project</span>
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
                    <div className="dropzone-subtext">Supports .csv, .json datasets (e.g. Marketing Spend, Orders, Metrics)</div>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      multiple 
                      accept=".csv,.json,.txt,.xlsx"
                      style={{ display: 'none' }}
                      onChange={handleFileSelect}
                    />
                  </div>

                  {/* Staged files list */}
                  {stagedFiles.length > 0 && (
                    <div className="uploaded-files-list">
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {stagedFiles.length} file{stagedFiles.length > 1 ? 's' : ''} staged for ingestion:
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
                  {submitting ? 'Creating & Ingesting...' : 'Create Project & Upload Data'}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <span className={activeProject.status === 'Active' ? 'badge-inferred' : 'badge-observed'}>
                    {activeProject.status || 'Active'}
                  </span>
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
              <div>
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
