'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import DataTable from '@/components/ui/DataTable';
import FormFields from '@/components/ui/FormFields';
import { api } from '@/lib/api';

const fieldConfigs = [
  { name: 'title', label: 'Title', type: 'text', placeholder: 'Blending creativity with' },
  { name: 'titleHighlight', label: 'Highlighted Title', type: 'text', placeholder: 'technical precision.' },
  { name: 'image', label: 'Image', type: 'image' },
  {
    name: 'content',
    label: 'Content',
    type: 'textarea',
    rows: 8,
    placeholder: 'Use a blank line between paragraphs',
  },
  { name: 'stats', label: 'Stats / Tagline', type: 'text', placeholder: 'Optional highlight line' },
];

const emptyForm = {
  title: '',
  titleHighlight: '',
  image: '',
  content: '',
  stats: '',
};

export default function AboutPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getAbout();
      setData(res.data ? [res.data] : []);
    } catch (err) {
      alert(`Failed to load: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    if (data.length > 0) {
      openEdit(data[0]);
      return;
    }
    setEditingItem(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      titleHighlight: item.titleHighlight || '',
      image: item.image || '',
      content: item.content || '',
      stats: item.stats || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingItem) {
        await api.updateAbout(editingItem._id, formData);
      } else {
        await api.createAbout(formData);
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm('Delete this About entry?')) return;
    try {
      await api.deleteAbout(item._id);
      fetchData();
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  const columns = [
    { header: 'Title', accessor: 'title', render: (val) => val || '-' },
    {
      header: 'Image',
      accessor: 'image',
      render: (val) =>
        val ? (
          <img src={val} alt="About" className="w-16 h-16 object-cover rounded-lg" />
        ) : (
          '-'
        ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-64">
        <Header title="About" />
        <main className="p-6">
          {!showForm ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">About Section</h2>
                  <p className="text-gray-500 text-sm">Manage the about content shown on the website</p>
                </div>
                <button
                  onClick={openCreate}
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                  <span className="text-xl">+</span> {data.length > 0 ? 'Edit About' : 'Add About'}
                </button>
              </div>
              {loading ? (
                <div className="flex justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <DataTable data={data} columns={columns} onEdit={openEdit} onDelete={handleDelete} />
              )}
            </>
          ) : (
            <div className="max-w-2xl mx-auto">
              <button
                onClick={() => setShowForm(false)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
              >
                ← Back to list
              </button>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {editingItem ? 'Edit About' : 'Create About'}
                </h2>
                <form onSubmit={handleSubmit}>
                  <FormFields fields={formData} setFields={setFormData} config={{ fields: fieldConfigs, allowImages: true }} />
                  <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-primary text-white px-4 py-3 rounded-lg font-medium disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save About'}
                    </button>
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
