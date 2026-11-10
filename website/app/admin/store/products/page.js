"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import MediaUploader from "@/components/admin/MediaUploader";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : "";

export default function AdminProductsPage() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands,     setBrands]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [search,     setSearch]     = useState("");
  const [page,       setPage]       = useState(1);
  const [total,      setTotal]      = useState(0);

  const LIMIT = 20;

  const emptyForm = {
    name:"", slug:"", description:"", shortDesc:"",
    price:"", salePrice:"", costPrice:"",
    category:"", brand:"", brandRef:"", brandLine:"", packSize:"", unit:"piece",
    stockQty:"", sku:"", weight:"",
    isActive:true, isFeatured:false, isNewArrival:false, isBestSeller:false, isOrganic:false, isVeg:true,
    tags:"",
    thumbnail:"", images:[], video:"", brochure:"",
  };
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit:LIMIT });
    if (search) params.set("search", search);
    axios.get(`${API}/api/store/products/admin/all?${params}`, { headers:{ Authorization:`Bearer ${getToken()}` } })
      .then(r => { setProducts(r.data.data||[]); setTotal(r.data.pagination?.total||0); })
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => {
    load();
    axios.get(`${API}/api/store/categories/admin/all`, { headers:{ Authorization:`Bearer ${getToken()}` } })
      .then(r => setCategories(r.data.data||[]))
      .catch(() => {});
    axios.get(`${API}/api/store/brands/admin/all`, { headers:{ Authorization:`Bearer ${getToken()}` } })
      .then(r => setBrands(r.data.data||[]))
      .catch(() => {});
  }, [load]);

  const openAdd = () => { setEditItem(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (p) => {
    setEditItem(p);
    setForm({
      name:p.name, slug:p.slug, description:p.description||"", shortDesc:p.shortDesc||"",
      price:p.price, salePrice:p.salePrice||"", costPrice:p.costPrice||"",
      category:p.category?._id||p.category||"", brand:p.brand||"",
      brandRef:p.brandRef?._id||p.brandRef||"", brandLine:p.brandLine||"",
      packSize:p.packSize||"", unit:p.unit||"piece",
      stockQty:p.stockQty, sku:p.sku||"", weight:p.weight||"",
      isActive:p.isActive, isFeatured:p.isFeatured, isNewArrival:p.isNewArrival,
      isBestSeller:p.isBestSeller, isOrganic:p.isOrganic, isVeg:p.isVeg,
      tags:p.tags?.join(", ")||"",
      thumbnail:p.thumbnail||"", images:p.images||[], video:p.video||"", brochure:p.brochure||"",
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      ...form,
      price:      Number(form.price),
      salePrice:  form.salePrice ? Number(form.salePrice) : null,
      costPrice:  Number(form.costPrice)||0,
      stockQty:   Number(form.stockQty)||0,
      weight:     Number(form.weight)||0,
      tags:       form.tags ? form.tags.split(",").map(t=>t.trim()).filter(Boolean) : [],
      // Main image falls back to the first gallery image
      thumbnail:  form.thumbnail || form.images?.[0] || "",
    };
    try {
      if (editItem) {
        await axios.put(`${API}/api/store/products/admin/${editItem._id}`, body, { headers:{ Authorization:`Bearer ${getToken()}` } });
        toast.success("Product updated!");
      } else {
        await axios.post(`${API}/api/store/products/admin`, body, { headers:{ Authorization:`Bearer ${getToken()}` } });
        toast.success("Product created!");
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
      await axios.delete(`${API}/api/store/products/admin/${id}`, { headers:{ Authorization:`Bearer ${getToken()}` } });
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const autoSlug = (name) => name.toLowerCase().trim().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"");

  return (
    <div style={{ padding:24, fontFamily:"Inter,sans-serif" }}>
      <Toaster position="top-right" />
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:"#111827", margin:"0 0 4px" }}>🛒 Products</h1>
          <p style={{ fontSize:13, color:"#6b7280", margin:0 }}>{total} products in store</p>
        </div>
        <button onClick={openAdd} style={btnGreen}>+ Add Product</button>
      </div>

      {/* Search */}
      <input type="text" placeholder="Search products..." value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }}
        style={{ border:"1px solid #e5e7eb", borderRadius:8, padding:"8px 14px", fontSize:13, outline:"none", marginBottom:16, width:280 }} />

      {/* Table */}
      {loading ? (
        <div style={{ textAlign:"center", padding:60, color:"#9ca3af" }}>Loading...</div>
      ) : (
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #e5e7eb", overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"#f9fafb", borderBottom:"1px solid #e5e7eb" }}>
                {["Product","Category","Price","Sale Price","Stock","Status","Actions"].map(h => (
                  <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:12, fontWeight:700, color:"#6b7280", textTransform:"uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign:"center", padding:40, color:"#9ca3af" }}>No products yet. Add your first product!</td></tr>
              ) : products.map(p => (
                <tr key={p._id} style={{ borderBottom:"1px solid #f3f4f6" }}>
                  <td style={{ padding:"12px 14px" }}>
                    <div style={{ fontSize:14, fontWeight:700, color:"#111827" }}>{p.name}</div>
                    <div style={{ fontSize:11, color:"#9ca3af" }}>/{p.slug}</div>
                  </td>
                  <td style={{ padding:"12px 14px", fontSize:13, color:"#6b7280" }}>{p.category?.name||"—"}</td>
                  <td style={{ padding:"12px 14px", fontSize:14, fontWeight:700 }}>₹{p.price}</td>
                  <td style={{ padding:"12px 14px", fontSize:13, color:p.salePrice?"#16a34a":"#9ca3af" }}>
                    {p.salePrice ? `₹${p.salePrice}` : "—"}
                  </td>
                  <td style={{ padding:"12px 14px" }}>
                    <span style={{
                      fontSize:12, fontWeight:700, padding:"2px 8px", borderRadius:20,
                      background: p.stockQty>10?"#f0fdf4":p.stockQty>0?"#fff7ed":"#fef2f2",
                      color: p.stockQty>10?"#16a34a":p.stockQty>0?"#d97706":"#dc2626",
                    }}>
                      {p.stockQty}
                    </span>
                  </td>
                  <td style={{ padding:"12px 14px" }}>
                    <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:20,
                      background:p.isActive?"#f0fdf4":"#f3f4f6", color:p.isActive?"#16a34a":"#6b7280" }}>
                      {p.isActive?"Active":"Inactive"}
                    </span>
                  </td>
                  <td style={{ padding:"12px 14px" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => openEdit(p)} style={btnSmBlue}>Edit</button>
                      <button onClick={() => handleDelete(p._id, p.name)} style={btnSmRed}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {Math.ceil(total/LIMIT) > 1 && (
        <div style={{ display:"flex", gap:6, marginTop:16 }}>
          {Array(Math.ceil(total/LIMIT)).fill(0).map((_,i) => (
            <button key={i} onClick={() => setPage(i+1)} style={{
              width:32, height:32, borderRadius:6,
              border: page===i+1?"none":"1px solid #e5e7eb",
              background: page===i+1?"#16a34a":"#fff",
              color: page===i+1?"#fff":"#374151",
              cursor:"pointer", fontSize:13, fontWeight:700,
            }}>
              {i+1}
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div style={{
          position:"fixed", inset:0, background:"rgba(0,0,0,.5)",
          zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20,
        }}>
          <div style={{
            background:"#fff", borderRadius:20, padding:28, width:"100%", maxWidth:720,
            maxHeight:"90vh", overflowY:"auto",
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ fontSize:18, fontWeight:800, margin:0 }}>{editItem?"Edit Product":"Add New Product"}</h2>
              <button onClick={() => setShowForm(false)} style={{ border:"none", background:"none", fontSize:22, cursor:"pointer" }}>×</button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <FormField label="Name *" value={form.name} onChange={v => setForm(f=>({...f,name:v,slug:autoSlug(v)}))} full />
                <FormField label="Slug *" value={form.slug} onChange={v => setForm(f=>({...f,slug:v}))} full />
                <FormField label="Short Description" value={form.shortDesc} onChange={v => setForm(f=>({...f,shortDesc:v}))} full />
                <div style={{ gridColumn:"1/-1" }}>
                  <label style={lbl}>Description</label>
                  <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}
                    rows={3} style={{ ...inp, resize:"vertical" }} />
                </div>
                <FormField label="Price (₹) *" value={form.price}     type="number" onChange={v => setForm(f=>({...f,price:v}))} />
                <FormField label="Sale Price (₹)"value={form.salePrice}type="number" onChange={v => setForm(f=>({...f,salePrice:v}))} />
                <FormField label="Cost Price (₹)" value={form.costPrice}type="number"onChange={v => setForm(f=>({...f,costPrice:v}))} />
                <div>
                  <label style={lbl}>Category *</label>
                  <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} style={inp} required>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Dealer brand</label>
                  <select value={form.brandRef} style={inp}
                    onChange={e=>setForm(f=>({...f, brandRef:e.target.value, brandLine:""}))}>
                    <option value="">— None / other brand —</option>
                    {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Product type (inside brand)</label>
                  <select value={form.brandLine} style={inp} disabled={!form.brandRef}
                    onChange={e=>setForm(f=>({...f, brandLine:e.target.value}))}>
                    <option value="">{form.brandRef ? "— Select type —" : "Select a brand first"}</option>
                    {(brands.find(b => b._id === form.brandRef)?.productLines || []).map(l =>
                      <option key={l._id} value={l.slug}>{l.name}</option>)}
                  </select>
                </div>
                {!form.brandRef && (
                  <FormField label="Other brand name (text)" value={form.brand} onChange={v => setForm(f=>({...f,brand:v}))} placeholder="Only if the brand is not in the list above" full />
                )}
                <FormField label="SKU"       value={form.sku}      onChange={v => setForm(f=>({...f,sku:v}))} />
                <FormField label="Pack Size" value={form.packSize}  onChange={v => setForm(f=>({...f,packSize:v}))} placeholder="e.g. 500g, 1L" />
                <div>
                  <label style={lbl}>Unit</label>
                  <select value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))} style={inp}>
                    {["piece","kg","g","L","ml","pack","dozen","box"].map(u=><option key={u}>{u}</option>)}
                  </select>
                </div>
                <FormField label="Stock Qty" value={form.stockQty}  type="number" onChange={v => setForm(f=>({...f,stockQty:v}))} />
                <FormField label="Weight (g)"value={form.weight}    type="number" onChange={v => setForm(f=>({...f,weight:v}))} />
                <FormField label="Tags (comma separated)" value={form.tags} onChange={v=>setForm(f=>({...f,tags:v}))} full placeholder="e.g. fresh, organic, local" />

                {/* Media — stored on Cloudinary */}
                <div style={{ gridColumn:"1/-1", borderTop:"1px solid #f3f4f6", paddingTop:14 }}>
                  <div style={{ fontSize:13, fontWeight:800, color:"#111827", marginBottom:12 }}>Media</div>
                  <div style={{ display:"grid", gap:16 }}>
                    <MediaUploader kind="image" folder="products" label="Main image"
                      value={form.thumbnail} onChange={v=>setForm(f=>({...f,thumbnail:v}))} />
                    <MediaUploader kind="image" folder="products" multiple label="Gallery images"
                      value={form.images} onChange={v=>setForm(f=>({...f,images:v}))} />
                    <MediaUploader kind="video" folder="videos" label="Product video (optional)"
                      value={form.video} onChange={v=>setForm(f=>({...f,video:v}))} />
                    <MediaUploader kind="pdf" folder="documents" label="Brochure / spec sheet PDF (optional)"
                      value={form.brochure} onChange={v=>setForm(f=>({...f,brochure:v}))} />
                  </div>
                </div>

                {/* Toggles */}
                <div style={{ gridColumn:"1/-1", display:"flex", gap:16, flexWrap:"wrap" }}>
                  {[
                    { key:"isActive",    label:"Active"     },
                    { key:"isFeatured",  label:"Featured"   },
                    { key:"isNewArrival",label:"New Arrival" },
                    { key:"isBestSeller",label:"Best Seller" },
                    { key:"isOrganic",   label:"Organic"    },
                    { key:"isVeg",       label:"Vegetarian" },
                  ].map(t => (
                    <label key={t.key} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontSize:13, fontWeight:600, color:"#374151" }}>
                      <input type="checkbox" checked={!!form[t.key]}
                        onChange={e=>setForm(f=>({...f,[t.key]:e.target.checked}))}
                        style={{ accentColor:"#16a34a", width:15, height:15 }} />
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display:"flex", gap:10, marginTop:20 }}>
                <button type="button" onClick={() => setShowForm(false)} style={btnGray}>Cancel</button>
                <button type="submit" disabled={saving} style={btnGreen}>
                  {saving ? "Saving..." : editItem ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, value, onChange, type="text", full, placeholder="" }) {
  return (
    <div style={{ gridColumn: full?"1/-1":"auto" }}>
      <label style={lbl}>{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={inp} />
    </div>
  );
}

const lbl = { fontSize:12, fontWeight:700, color:"#6b7280", display:"block", marginBottom:4 };
const inp = { width:"100%", border:"1px solid #e5e7eb", borderRadius:8, padding:"9px 12px", fontSize:13, outline:"none", boxSizing:"border-box" };
const btnGreen = { background:"#16a34a", color:"#fff", border:"none", borderRadius:8, padding:"9px 18px", fontSize:14, fontWeight:700, cursor:"pointer" };
const btnGray  = { background:"#f3f4f6", color:"#374151", border:"1px solid #e5e7eb", borderRadius:8, padding:"9px 18px", fontSize:14, fontWeight:700, cursor:"pointer" };
const btnSmBlue = { background:"#eff6ff", color:"#2563eb", border:"none", borderRadius:6, padding:"4px 10px", fontSize:12, fontWeight:700, cursor:"pointer" };
const btnSmRed  = { background:"#fef2f2", color:"#dc2626", border:"none", borderRadius:6, padding:"4px 10px", fontSize:12, fontWeight:700, cursor:"pointer" };
