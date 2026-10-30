"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : "";

const COLORS = ["#16a34a","#ea580c","#2563eb","#9333ea","#0891b2","#d97706","#dc2626","#ca8a04","#7c3aed","#0e7490"];
const EMOJIS = ["🥦","🍎","🥛","🍿","🧃","🌾","🌶️","🍞","🧴","🧹","🛒","🥕","🍌","🧀","🥚"];

export default function AdminCategoriesPage() {
  const [cats,    setCats]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm,setShowForm]= useState(false);
  const [editItem,setEditItem]= useState(null);
  const [saving,  setSaving]  = useState(false);

  const emptyForm = { name:"", slug:"", description:"", icon:"🛒", color:"#16a34a", sortOrder:0, isActive:true, isFeatured:false };
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(() => {
    setLoading(true);
    axios.get(`${API}/api/store/categories/admin/all`, { headers:{ Authorization:`Bearer ${getToken()}` } })
      .then(r => setCats(r.data.data||[]))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setEditItem(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (c) => {
    setEditItem(c);
    setForm({ name:c.name, slug:c.slug, description:c.description||"", icon:c.icon||"🛒", color:c.color||"#16a34a", sortOrder:c.sortOrder||0, isActive:c.isActive, isFeatured:c.isFeatured });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await axios.put(`${API}/api/store/categories/admin/${editItem._id}`, form, { headers:{ Authorization:`Bearer ${getToken()}` } });
        toast.success("Updated!");
      } else {
        await axios.post(`${API}/api/store/categories/admin`, form, { headers:{ Authorization:`Bearer ${getToken()}` } });
        toast.success("Category created!");
      }
      setShowForm(false); load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await axios.delete(`${API}/api/store/categories/admin/${id}`, { headers:{ Authorization:`Bearer ${getToken()}` } });
      toast.success("Deleted"); load();
    } catch { toast.error("Delete failed"); }
  };

  const autoSlug = (n) => n.toLowerCase().trim().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");

  return (
    <div style={{ padding:24 }}>
      <Toaster position="top-right" />
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:"#111827", margin:"0 0 4px" }}>🗂️ Grocery Categories</h1>
          <p style={{ fontSize:13, color:"#6b7280", margin:0 }}>{cats.length} categories</p>
        </div>
        <button onClick={openAdd} style={btnGreen}>+ Add Category</button>
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:60, color:"#9ca3af" }}>Loading...</div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:14 }}>
          {cats.length === 0 ? (
            <div style={{ gridColumn:"1/-1", textAlign:"center", padding:60, color:"#9ca3af" }}>
              No categories yet. Add your first category!
            </div>
          ) : cats.map(cat => (
            <div key={cat._id} style={{
              background:"#fff", borderRadius:16, padding:18,
              border:"2px solid #f3f4f6", position:"relative",
            }}>
              <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:10 }}>
                <div style={{
                  width:48, height:48, borderRadius:12,
                  background:`${cat.color}20`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:24, flexShrink:0,
                }}>
                  {cat.icon}
                </div>
                <div>
                  <div style={{ fontSize:15, fontWeight:800, color:"#111827" }}>{cat.name}</div>
                  <div style={{ fontSize:11, color:"#9ca3af" }}>/{cat.slug}</div>
                </div>
              </div>
              {cat.description && (
                <p style={{ fontSize:12, color:"#6b7280", margin:"0 0 10px", lineHeight:1.5 }}>{cat.description}</p>
              )}
              <div style={{ display:"flex", gap:6, justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:20,
                  background:cat.isActive?"#f0fdf4":"#f3f4f6", color:cat.isActive?"#16a34a":"#6b7280" }}>
                  {cat.isActive?"Active":"Inactive"}
                </span>
                <div style={{ display:"flex", gap:6 }}>
                  <button onClick={() => openEdit(cat)} style={btnSmBlue}>Edit</button>
                  <button onClick={() => handleDelete(cat._id, cat.name)} style={btnSmRed}>Del</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.5)", zIndex:1000,
          display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div style={{ background:"#fff", borderRadius:20, padding:28, width:"100%", maxWidth:520, maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ fontSize:18, fontWeight:800, margin:0 }}>{editItem?"Edit":"Add"} Category</h2>
              <button onClick={() => setShowForm(false)} style={{ border:"none", background:"none", fontSize:22, cursor:"pointer" }}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div>
                  <label style={lbl}>Name *</label>
                  <input required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value,slug:autoSlug(e.target.value)}))} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Slug *</label>
                  <input required value={form.slug} onChange={e=>setForm(f=>({...f,slug:e.target.value}))} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Description</label>
                  <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} rows={2} style={{ ...inp, resize:"vertical" }} />
                </div>

                {/* Icon picker */}
                <div>
                  <label style={lbl}>Icon (click to select)</label>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    {EMOJIS.map(em => (
                      <button key={em} type="button" onClick={() => setForm(f=>({...f,icon:em}))} style={{
                        width:36, height:36, fontSize:20, border:form.icon===em?"2px solid #16a34a":"1px solid #e5e7eb",
                        borderRadius:8, background:form.icon===em?"#f0fdf4":"#fff", cursor:"pointer",
                      }}>
                        {em}
                      </button>
                    ))}
                    <input value={form.icon} onChange={e=>setForm(f=>({...f,icon:e.target.value}))}
                      style={{ ...inp, width:60 }} placeholder="or type" />
                  </div>
                </div>

                {/* Color picker */}
                <div>
                  <label style={lbl}>Color</label>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
                    {COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setForm(f=>({...f,color:c}))} style={{
                        width:28, height:28, borderRadius:"50%", background:c, border:form.color===c?"3px solid #111":"none", cursor:"pointer",
                      }} />
                    ))}
                    <input type="color" value={form.color} onChange={e=>setForm(f=>({...f,color:e.target.value}))}
                      style={{ width:32, height:32, border:"none", borderRadius:6, cursor:"pointer", padding:0 }} />
                  </div>
                </div>

                <div>
                  <label style={lbl}>Sort Order</label>
                  <input type="number" value={form.sortOrder} onChange={e=>setForm(f=>({...f,sortOrder:Number(e.target.value)}))} style={inp} />
                </div>

                <div style={{ display:"flex", gap:16 }}>
                  <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:13, fontWeight:600 }}>
                    <input type="checkbox" checked={form.isActive}   onChange={e=>setForm(f=>({...f,isActive:e.target.checked}))} style={{ accentColor:"#16a34a" }} />
                    Active
                  </label>
                  <label style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:13, fontWeight:600 }}>
                    <input type="checkbox" checked={form.isFeatured} onChange={e=>setForm(f=>({...f,isFeatured:e.target.checked}))} style={{ accentColor:"#16a34a" }} />
                    Featured
                  </label>
                </div>
              </div>

              <div style={{ display:"flex", gap:10, marginTop:20 }}>
                <button type="button" onClick={()=>setShowForm(false)} style={btnGray}>Cancel</button>
                <button type="submit" disabled={saving} style={btnGreen}>
                  {saving ? "Saving..." : editItem ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const lbl = { fontSize:12, fontWeight:700, color:"#6b7280", display:"block", marginBottom:4 };
const inp = { width:"100%", border:"1px solid #e5e7eb", borderRadius:8, padding:"9px 12px", fontSize:13, outline:"none", boxSizing:"border-box" };
const btnGreen = { background:"#16a34a", color:"#fff", border:"none", borderRadius:8, padding:"9px 18px", fontSize:14, fontWeight:700, cursor:"pointer" };
const btnGray  = { background:"#f3f4f6", color:"#374151", border:"1px solid #e5e7eb", borderRadius:8, padding:"9px 18px", fontSize:14, fontWeight:700, cursor:"pointer" };
const btnSmBlue = { background:"#eff6ff", color:"#2563eb", border:"none", borderRadius:6, padding:"4px 10px", fontSize:12, fontWeight:700, cursor:"pointer" };
const btnSmRed  = { background:"#fef2f2", color:"#dc2626", border:"none", borderRadius:6, padding:"4px 10px", fontSize:12, fontWeight:700, cursor:"pointer" };
