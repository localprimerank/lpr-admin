'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import DataTable from '@/components/ui/DataTable';
import FormFields from '@/components/ui/FormFields';
import { api } from '@/lib/api';

const fieldConfigs = [
  { name: 'name', label: 'Name', type: 'text', placeholder: 'Full name' },
  { name: 'role', label: 'Role / Title', type: 'text', placeholder: 'CEO, Company Inc.' },
  { name: 'avatar', label: 'Avatar', type: 'image' },
  { name: 'text', label: 'Testimonial', type: 'textarea', placeholder: 'What they said about us', rows: 4 },
  { name: 'stars', label: 'Stars (1-5)', type: 'number', placeholder: '5' },
];

const columns = [
  { header: 'Name', accessor: 'name' },
  { header: 'Role', accessor: 'role' },
  { header: 'Stars', accessor: 'stars', render: (val) => <span className="text-yellow-500">{'★'.repeat(val || 0)}{'☆'.repeat(5 - (val || 0))}</span> },
];

export default function TestimonialsPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: '', avatar: '', text: '', stars: 5 });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getTestimonials();
      setData(res.data || []);
    } catch (err) {
      alert(`Failed to load: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditingItem(null); setFormData({ name: '', role: '', avatar: '', text: '', stars: 5 }); setShowForm(true); };
  const openEdit = (item) => { setEditingItem(item); setFormData({ name: item.name || '', role: item.role || '', avatar: item.avatar || '', text: item.text || '', stars: item.stars || 5 }); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingItem) await api.updateTestimonial(editingItem._id, formData);
      else await api.createTestimonial(formData);
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete testimonial from "${item.name}"?`)) return;
    try {
      await api.deleteTestimonial(item._id);
      fetchData();
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-64">
        <Header title="Testimonials" />
        <main className="p-6">
          {!showForm ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <div><h2 className="text-xl font-semibold text-gray-900">All Testimonials</h2><p className="text-gray-500 text-sm">Manage client testimonials</p></div>
                <button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors"><span className="text-xl">+</span> Add Testimonial</button>
              </div>
              {loading ? <div className="flex justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div> : (
                <DataTable data={data} columns={columns} onEdit={openEdit} onDelete={handleDelete} searchable />
              )}
            </>
          ) : (
            <div className="max-w-2xl mx-auto">
              <button onClick={() => setShowForm(false)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">← Back to list</button>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{editingItem ? 'Edit Testimonial' : 'Create Testimonial'}</h2>
                <form onSubmit={handleSubmit}>
                  <FormFields fields={formData} setFields={setFormData} config={{ fields: fieldConfigs, allowImages: true }} />
                  <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                    <button type="submit" disabled={saving} className="flex-1 bg-primary text-white px-4 py-3 rounded-lg font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Save Testimonial'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
