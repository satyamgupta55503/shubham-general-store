"use client";
import React, { useState, useEffect } from 'react';
import { Heading, Link2, Type, Tag, Users, UploadCloud, Image as ImageIcon, RefreshCw, Save } from 'lucide-react';
import { API } from './BlogAPI';

export default function NewPost({ showFeedback, goToPosts, triggerDataSync }) {
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const emptyForm = {
    title: '', slug: '', content: '', category: '',
    author: '', status: 'draft', tags: '',
    metaTitle: '', metaDescription: '', metaTags: ''
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    API.get('/categories')
      .then(res => {
        const cats = Array.isArray(res.data) ? res.data : res.data.categories || [];
        setCategories(cats);
      })
      .catch(() => {});
  }, []);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleTitle = (e) => {
    const v = e.target.value;
    set('title', v);
    set('slug', v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    set('metaTitle', v ? `${v} | BlogHub` : '');
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('slug', form.slug);
      fd.append('content', form.content);
      fd.append('category', form.category);
      fd.append('author', form.author);
      fd.append('status', form.status);
      fd.append('tags', form.tags);
      fd.append('metaTitle', form.metaTitle);
      fd.append('metaTags', form.metaDescription);
      if (imageFile) fd.append('image', imageFile);

      await API.post('/posts', fd);
      showFeedback('success', `Post "${form.title}" saved as [${form.status}]!`);
      setForm(emptyForm);
      setImageFile(null);
      setImagePreview('');
      triggerDataSync(); // Notify dataset changes across tables
      goToPosts();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save post.';
      showFeedback('error', `Error: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="section-header">
        <h1 className="section-title">Create New Post</h1>
        <p className="section-subtitle">Draft, optimize and publish your content.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ opacity: submitting ? .6 : 1, pointerEvents: submitting ? 'none' : 'auto' }}>
        <div className="editor-layout">
          <div className="editor-main-stack">
            <div className="card">
              <div className="form-group">
                <label className="form-label">Post Title *</label>
                <input className="form-input title-input" placeholder="Write a catchy title..." value={form.title} onChange={handleTitle} required />
              </div>

              <div className="form-group" style={{ marginTop: '1.25rem' }}>
                <label className="form-label">Content *</label>
                <div className="editor-wrap">
                  <div className="toolbar-bar">
                    {[{ Icon: Heading, title: 'Heading' }, { label: 'B', title: 'Bold', style: { fontWeight: 800 } }, { label: 'I', title: 'Italic', style: { fontStyle: 'italic', fontFamily: 'serif' } }, { Icon: Link2, title: 'Link' }, { Icon: Type, title: 'Font' }].map((item, i) => (
                      <button key={i} type="button" className="toolbar-btn" title={item.title} style={item.style}>
                        {item.Icon ? <item.Icon size={15} /> : item.label}
                      </button>
                    ))}
                    <span className="toolbar-div" /><span className="toolbar-hint">Markdown Supported</span>
                  </div>
                  <textarea className="content-textarea" rows={12} placeholder="Write your article content here..." value={form.content} onChange={e => set('content', e.target.value)} required />
                </div>
              </div>

              <div className="seo-block">
                <div className="seo-grid">
                  <div className="form-group">
                    <label className="form-label">URL Slug *</label>
                    <input className="form-input" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Meta Title</label>
                    <input className="form-input" value={form.metaTitle} onChange={e => set('metaTitle', e.target.value)} />
                  </div>
                  <div className="form-group full-span">
                    <label className="form-label">Tags</label>
                    <div className="icon-input">
                      <Tag size={16} className="ico" />
                      <input className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="react, javascript, web" value={form.tags} onChange={e => set('tags', e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group full-span">
                    <label className="form-label">
                      <span className="label-row">
                        <span>Meta Description</span>
                        <span className={`char-count ${form.metaDescription.length > 160 ? 'char-over' : ''}`}>{form.metaDescription.length}/160</span>
                      </span>
                    </label>
                    <textarea className="form-textarea" rows={3} placeholder="Short snippet under 160 characters..." value={form.metaDescription} onChange={e => set('metaDescription', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sidebar-sticky">
            <div className="sidebar-card">
              <div className="sidebar-title">Publishing Settings</div>
              <div className="form-stack">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)} required>
                    <option value="" disabled>— Choose category —</option>
                    {categories.map(c => <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Author *</label>
                  <div className="icon-input">
                    <Users size={16} className="ico" />
                    <input className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="Author name" value={form.author} onChange={e => set('author', e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Featured Image</label>
                  <div className="icon-input">
                    <UploadCloud size={16} className="ico" />
                    <input type="file" accept="image/*" className="form-input file-input" style={{ paddingLeft: '2.5rem' }} onChange={handleImage} />
                  </div>
                  <div className="image-preview">
                    {imagePreview ? <img src={imagePreview} alt="preview" /> : <div className="img-empty"><ImageIcon size={28} opacity={.3} /><span>No image selected</span></div>}
                  </div>
                </div>
              </div>
            </div>
            <button type="submit" className="btn-save" disabled={submitting}>
              {submitting ? <><RefreshCw size={17} className="spin" /> Processing...</> : <><Save size={17} /> Save & Commit Post</>}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}