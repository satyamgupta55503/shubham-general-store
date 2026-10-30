"use client";
import React, { useState } from 'react';
import { BookOpen, PenSquare, FolderTree, CheckCircle2, XCircle } from 'lucide-react';
import "./Blog.css";

// Import modular child views
import AllPosts from './AllPosts';
import NewPost from './NewPost';
import CategoriesAuthors from './CategoriesAuthors';

export default function BlogAdmin() {
  const [activeTab, setActiveTab] = useState('posts');
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  
  // Data sharing controller - forces re-fetch when other views make changes
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const triggerDataSync = () => setRefreshTrigger(prev => prev + 1);

  const showFeedback = (type, text) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback({ type: '', text: '' }), 4000);
  };

  return (
    <div className="blog-admin">
      {/* ── TABS ── */}
      <nav className="tabs-bar">
        {[
          { id: 'posts',      label: 'All Posts',             Icon: BookOpen },
          { id: 'new-post',   label: 'Add New Post',          Icon: PenSquare },
          { id: 'categories', label: 'Categories & Taxonomy', Icon: FolderTree },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`tab-btn ${activeTab === id ? 'active' : ''}`}
            onClick={() => setActiveTab(id)}
          >
            <Icon size={16} className="tab-icon" />
            {label}
          </button>
        ))}
      </nav>

      {/* ── MAIN RENDER CONTENT ── */}
      <main className="tab-content">
        {feedback.text && (
          <div className={`feedback-banner ${feedback.type === 'success' ? 'fb-success' : 'fb-error'}`}>
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            {feedback.text}
          </div>
        )}

        {activeTab === 'posts' && (
          <AllPosts 
            showFeedback={showFeedback} 
            goToNewPost={() => setActiveTab('new-post')} 
            refreshTrigger={refreshTrigger}
          />
        )}
        {activeTab === 'new-post' && (
          <NewPost 
            showFeedback={showFeedback} 
            goToPosts={() => setActiveTab('posts')} 
            triggerDataSync={triggerDataSync}
          />
        )}
        {activeTab === 'categories' && (
          <CategoriesAuthors 
            showFeedback={showFeedback} 
            triggerDataSync={triggerDataSync}
          />
        )}
      </main>
    </div>
  );
}