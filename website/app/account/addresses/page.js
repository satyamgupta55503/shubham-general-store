"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import StoreLayout from "@/components/store/layout/StoreLayout";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const EMPTY = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

export default function AddressesPage() {
  const { customer, token, refreshMe } = useCustomerAuth();
  const router = useRouter();

  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) router.push("/account/login?redirect=/account/addresses");
  }, [token, router]);

  useEffect(() => {
    if (customer?.addresses) setAddresses(customer.addresses);
  }, [customer]);

  const set = (k) => (e) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const openNew = () => {
    setForm({ ...EMPTY, fullName: customer?.name || "", phone: customer?.phone || "" });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (a) => {
    setForm({
      label: a.label || "Home",
      fullName: a.fullName || "",
      phone: a.phone || "",
      line1: a.line1 || "",
      line2: a.line2 || "",
      city: a.city || "",
      state: a.state || "",
      pincode: a.pincode || "",
      isDefault: !!a.isDefault,
    });
    setEditingId(a._id);
    setShowForm(true);
  };

  const validate = () => {
    for (const k of ["fullName", "phone", "line1", "city", "state", "pincode"]) {
      if (!String(form[k]).trim()) {
        toast.error("Please fill all required fields");
        return false;
      }
    }
    return true;
  };

  const save = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editingId) {
        await axios.put(`${API}/api/store/customers/me/addresses/${editingId}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Address updated");
      } else {
        await axios.post(`${API}/api/store/customers/me/addresses`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Address added");
      }
      await refreshMe();
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not save address");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this address?")) return;
    try {
      await axios.delete(`${API}/api/store/customers/me/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Address removed");
      await refreshMe();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not delete");
    }
  };

  const makeDefault = async (a) => {
    try {
      await axios.put(
        `${API}/api/store/customers/me/addresses/${a._id}`,
        { ...a, isDefault: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Default address updated");
      await refreshMe();
    } catch {
      toast.error("Could not update");
    }
  };

  const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: 10,
    border: "1px solid #d1d5db", fontSize: 14, outline: "none",
  };
  const labelStyle = { fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6, display: "block" };

  if (!customer) {
    return (
      <StoreLayout>
        <div style={{ textAlign: "center", padding: 80, color: "#9ca3af" }}>Loading your addresses...</div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
          <div>
            <Link href="/account" style={{ color: "#16a34a", fontWeight: 600, textDecoration: "none", fontSize: 14 }}>
              &larr; My Account
            </Link>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#111827", margin: "8px 0 0" }}>My Addresses</h1>
          </div>
          {!showForm && (
            <button onClick={openNew} style={{
              padding: "11px 22px", background: "#16a34a", color: "#fff", border: "none",
              borderRadius: 50, fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}>
              + Add New Address
            </button>
          )}
        </div>

        {showForm && (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: 24, marginBottom: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: "0 0 18px" }}>
              {editingId ? "Edit Address" : "New Address"}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              <div>
                <label style={labelStyle}>Label</label>
                <select value={form.label} onChange={set("label")} style={inputStyle}>
                  <option>Home</option>
                  <option>Work</option>
                  <option>Shop</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input value={form.fullName} onChange={set("fullName")} style={inputStyle} placeholder="Receiver name" />
              </div>
              <div>
                <label style={labelStyle}>Phone *</label>
                <input value={form.phone} onChange={set("phone")} style={inputStyle} placeholder="Mobile number" />
              </div>
              <div>
                <label style={labelStyle}>Pincode *</label>
                <input value={form.pincode} onChange={set("pincode")} style={inputStyle} placeholder="e.g. 492001" />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Address Line 1 *</label>
                <input value={form.line1} onChange={set("line1")} style={inputStyle} placeholder="House / shop no, street" />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Address Line 2</label>
                <input value={form.line2} onChange={set("line2")} style={inputStyle} placeholder="Landmark, area (optional)" />
              </div>
              <div>
                <label style={labelStyle}>City *</label>
                <input value={form.city} onChange={set("city")} style={inputStyle} placeholder="City" />
              </div>
              <div>
                <label style={labelStyle}>State *</label>
                <input value={form.state} onChange={set("state")} style={inputStyle} placeholder="State" />
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, fontSize: 14, color: "#374151", cursor: "pointer" }}>
              <input type="checkbox" checked={form.isDefault} onChange={set("isDefault")} />
              Set as default delivery address
            </label>

            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button onClick={save} disabled={saving} style={{
                padding: "11px 26px", background: "#16a34a", color: "#fff", border: "none",
                borderRadius: 50, fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: saving ? 0.6 : 1,
              }}>
                {saving ? "Saving..." : editingId ? "Update Address" : "Save Address"}
              </button>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} style={{
                padding: "11px 26px", background: "#fff", color: "#374151", border: "1px solid #d1d5db",
                borderRadius: 50, fontWeight: 700, fontSize: 14, cursor: "pointer",
              }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {addresses.length === 0 && !showForm ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#f9fafb", borderRadius: 16, border: "1px dashed #d1d5db" }}>
            <p style={{ color: "#6b7280", fontSize: 15, margin: "0 0 18px" }}>You have no saved addresses yet.</p>
            <button onClick={openNew} style={{
              padding: "11px 24px", background: "#16a34a", color: "#fff", border: "none",
              borderRadius: 50, fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}>
              + Add Your First Address
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {addresses.map((a) => (
              <div key={a._id} style={{
                background: "#fff", border: a.isDefault ? "2px solid #16a34a" : "1px solid #e5e7eb",
                borderRadius: 16, padding: 18, position: "relative",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, background: "#f0fdf4", color: "#16a34a", padding: "3px 10px", borderRadius: 20 }}>
                    {a.label}
                  </span>
                  {a.isDefault && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#16a34a" }}>Default</span>
                  )}
                </div>
                <div style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>{a.fullName}</div>
                <div style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>{a.phone}</div>
                <p style={{ color: "#4b5563", fontSize: 14, lineHeight: 1.6, margin: "10px 0 0" }}>
                  {a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />
                  {a.city}, {a.state} - {a.pincode}
                </p>
                <div style={{ display: "flex", gap: 14, marginTop: 14, flexWrap: "wrap" }}>
                  <button onClick={() => openEdit(a)} style={linkBtn("#16a34a")}>Edit</button>
                  {!a.isDefault && (
                    <button onClick={() => makeDefault(a)} style={linkBtn("#2563eb")}>Set Default</button>
                  )}
                  <button onClick={() => remove(a._id)} style={linkBtn("#ef4444")}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}

const linkBtn = (color) => ({
  background: "none", border: "none", padding: 0, cursor: "pointer",
  color, fontWeight: 700, fontSize: 13,
});
