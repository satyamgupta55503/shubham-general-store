"use client";
import React, { useState, useEffect } from 'react';
import { Search, Plus, RefreshCw, Edit3, Trash2 } from 'lucide-react';
import { API } from './BlogAPI';

export default function AllPosts({ showFeedback, goToNewPost, refreshTrigger }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/posts');
      const data = Array.isArray(res.data) ? res.data : res.data.posts || [];
      setPosts(data);
    } catch (e) {
      showFeedback('error', 'Failed to load posts.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchPosts(); 
  }, [refreshTrigger]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await API.delete(`/posts/${id}`);
      showFeedback('success', `Post "${title}" deleted.`);
      fetchPosts();
    } catch {
      showFeedback('error', 'Delete failed.');
    }
  };

  const filtered = posts.filter(p => {
    const titleMatch = (p.title || '').toLowerCase().includes(search.toLowerCase());
    const statusMatch = statusFilter === 'All' || p.status === statusFilter;
    return titleMatch && statusMatch;
  });

  const getAuthorName = (author) => {
    if (!author) return '—';
    return typeof author === 'object' ? author.name || '—' : author;
  };

  const getCatName = (category) => {
    if (!category) return '—';
    return typeof category === 'object' ? category.name || '—' : category;
  };

  return (
    <>
      <div className="section-header">
        <h1 className="section-title">All Posts</h1>
        <p className="section-subtitle">Manage, filter and delete your blog content.</p>
      </div>

      <div className="posts-toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search posts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        <button className="btn-new-post" onClick={goToNewPost}>
          <Plus size={16} /> New Post
        </button>
      </div>

      <div className="posts-table-wrap">
        <table className="posts-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Author</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <RefreshCw size={20} className="spin" style={{ display: 'inline' }} />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr className="empty-table-row">
                <td colSpan="6">
                  {posts.length === 0 ? 'No posts yet. Create your first post!' : 'No posts match your filters.'}
                </td>
              </tr>
            ) : filtered.map(post => (
              <tr key={post._id}>
                <td className="post-title-cell">
                  <div>{post.title || 'Untitled'}</div>
                  <div className="slug">/{post.slug || '—'}</div>
                </td>
                <td><span className="cat-tag">{getCatName(post.category)}</span></td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{getAuthorName(post.author)}</td>
                <td>
                  <span className={`status-pill ${post.status === 'published' ? 'pill-published' : 'pill-draft'}`}>
                    <span className="pill-dot" />{post.status || 'draft'}
                  </span>
                </td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                  {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                </td>
                <td>
                  <div className="actions-cell">
                    <button className="btn-icon-sm edit" title="Edit"><Edit3 size={15} /></button>
                    <button className="btn-icon-sm del" title="Delete" onClick={() => handleDelete(post._id, post.title)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}