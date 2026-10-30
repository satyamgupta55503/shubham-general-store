"use client";
import React, { useState, useEffect } from 'react';
import { FolderPlus, Layers, RefreshCw, Edit3, Trash2 } from 'lucide-react';
import { API } from './BlogAPI';

export default function CategoriesAuthors({ showFeedback, triggerDataSync }) {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [catName, setCatName] = useState('');
  const [submittingCat, setSubmittingCat] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const res = await API.get('/categories').catch(() => ({ data: [] }));
    setCategories(Array.isArray(res.data) ? res.data : res.data.categories || []);
  } catch {
    showFeedback('error', 'Failed to load data.');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { 
    fetchData(); 
  }, []);

  const handleAddCat = async (e) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setSubmittingCat(true);
    try {
      await API.post('/categories', {
        name: catName,
        slug: catName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        parent: null
      });
      showFeedback('success', `Category "${catName}" added!`);
      setCatName('');
      triggerDataSync(); // Notify remaining components to update selections
      fetchData();
    } catch (err) {
      showFeedback('error', err?.response?.data?.message || 'Failed to add category.');
    } finally {
      setSubmittingCat(false);
    }
  };

  const handleDeleteCat = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await API.delete(`/categories/${id}`);
      showFeedback('success', 'Category removed.');
      triggerDataSync();
      fetchData();
    } catch {
      showFeedback('error', 'Delete failed.');
    }
  };

  const rootCats = categories.filter(c => !c.parent);

  return (
    <>
      <div className="section-header">
        <h1 className="section-title">Taxonomy & Categories</h1>
        <p className="section-subtitle">Manage system structures and post parameters.</p>
      </div>

      <div className="two-col" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-head">
            <div className="card-icon ci-teal"><FolderPlus size={18} /></div>
            <span className="card-title">Add New Category</span>
          </div>

          <form onSubmit={handleAddCat} className="form-stack">
            <div className="form-group">
              <label className="form-label">Category Name</label>
              <input
                className="form-input"
                placeholder="e.g. Tech Reviews, Lifestyle"
                value={catName}
                onChange={e => setCatName(e.target.value)}
                disabled={submittingCat || loading}
                required
              />
            </div>
            <button type="submit" className="btn-primary btn-teal" disabled={submittingCat || loading}>
              {submittingCat ? <><RefreshCw size={15} className="spin" /> Creating...</> : 'Create Category'}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-head">
            <div className="card-icon ci-purple"><Layers size={18} /></div>
            <span className="card-title">Categories Structure</span>
          </div>

          <div className="tree-wrapper">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <RefreshCw size={20} className="spin" />
              </div>
            ) : rootCats.length === 0 ? (
              <div className="tree-empty">
                <FolderPlus size={30} opacity={.3} />
                <span>No categories yet.</span>
              </div>
            ) : rootCats.map(root => (
              <div className="tree-group" key={root._id || root.id}>
                <div className="tree-row root-row">
                  <div className="row-left">
                    <span className="root-dot" />
                    <span className="item-name">{root.name}</span>
                    <span className="badge">{root.postCount || 0} posts</span>
                  </div>
                  <div className="row-right">
                    <button className="btn-icon-sm edit" title="Edit"><Edit3 size={14} /></button>
                    <button className="btn-icon-sm del" title="Delete" onClick={() => handleDeleteCat(root._id || root.id, root.name)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}