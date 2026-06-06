'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import DataTable from '@/components/ui/DataTable';
import FormFields from '@/components/ui/FormFields';
import { api } from '@/lib/api';

const fieldConfigs = [
  { name: 'title', label: 'Title', type: 'text', placeholder: 'Project title' },
  { name: 'desc', label: 'Description', type: 'textarea', placeholder: 'Project description' },
  { name: 'type', label: 'Type', type: 'select', options: ['Website', 'Web App', 'Mobile App', 'Branding'] },
  { name: 'tags', label: 'Tags', type: 'textarea', placeholder: 'React, Node.js, etc. (one per line for admin - use array)', allowArray: true, arrayField: 'tags' },
  { name: 'img', label: 'Image URL / Upload', type: 'image' },
  { name: 'accent', label: 'Accent Color', type: 'text', placeholder: '#4f6ffd' },
  { name: 'published', label: 'Published', type: 'toggle' },
];

const columns = [
  { header: 'Title', accessor: 'title' },
  { header: 'Type', accessor: 'type' },
  { header: 'Status', accessor: 'published', render: (val) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${val ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
      {val ? 'Published' : 'Draft'}
    </span>
  )},
  { header: 'Tags', accessor: 'tags', render: (val) => val?.length > 0 ? `${val.length} tags` : '-' },
];

export default function ProjectsPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '', desc: '', type: '', tags: [''], img: '', accent: '#4f6ffd', published: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getProjects({ auth: false });
      setData(res.data || []);
    } catch (err) {
      alert(`Failed to load: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingItem(null);
    setFormData({ title: '', desc: '', type: '', tags: [''], img: '', accent: '#4f6ffd', published: true });
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      desc: item.desc || '',
      type: item.type || '',
      tags: item.tags?.length ? item.tags : [''],
      img: item.img || '',
      accent: item.accent || '#4f6ffd',
      published: item.published ?? true,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData, tags: formData.tags.filter((t) => t.trim() !== '') };
      if (editingItem) await api.updateProject(editingItem._id, payload);
      else await api.createProject(payload);
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await api.deleteProject(item._id);
      fetchData();
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-64">
        <Header title="Projects" />
        <main className="p-6">
          {!showForm ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">All Projects</h2>
                  <p className="text-gray-500 text-sm">Manage portfolio projects</p>
                </div>
                <button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors">
                  <span className="text-xl">+</span> Add Project
                </button>
              </div>
              {loading ? (
                <div className="flex justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
              ) : (
                <DataTable data={data} columns={columns} onEdit={openEdit} onDelete={handleDelete} searchable />
              )}
            </>
          ) : (
            <div className="max-w-2xl mx-auto">
              <button onClick={() => setShowForm(false)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
                ← Back to list
              </button>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{editingItem ? 'Edit Project' : 'Create Project'}</h2>
                <form onSubmit={handleSubmit}>
                  <FormFields fields={formData} setFields={setFormData} config={{ fields: fieldConfigs, allowImages: true, allowArray: true, arrayField: 'tags' }} />
                  <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                    <button type="submit" disabled={saving} className="flex-1 bg-primary text-white px-4 py-3 rounded-lg font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Save Project'}</button>
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
