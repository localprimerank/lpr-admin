'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import DataTable from '@/components/ui/DataTable';
import FormFields from '@/components/ui/FormFields';
import { api } from '@/lib/api';
import { Plus, X, ArrowLeft } from 'lucide-react';

const fieldConfigs = [
  { name: 'question', label: 'Question', type: 'text', placeholder: 'Enter FAQ question' },
  { name: 'answer', label: 'Answer', type: 'textarea', placeholder: 'Enter FAQ answer', rows: 4 },
  { name: 'order', label: 'Sort Order', type: 'number', placeholder: '0' },
  { name: 'visible', label: 'Visible', type: 'toggle' },
];

const columns = [
  { header: 'Question', accessor: 'question' },
  { header: 'Order', accessor: 'order' },
  { header: 'Visible', accessor: 'visible', render: (val) => (val ? 'Yes' : 'No') },
];

export default function FAQPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    order: 0,
    visible: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getAllFAQs();
      setData(res.data || []);
    } catch (err) {
      alert(`Failed to load: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingItem(null);
    setFormData({ question: '', answer: '', order: 0, visible: true });
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({
      question: item.question || '',
      answer: item.answer || '',
      order: item.order || 0,
      visible: item.visible ?? true,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingItem) {
        await api.updateFAQ(editingItem._id, formData);
      } else {
        await api.createFAQ(formData);
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
    if (!confirm(`Delete "${item.question}"?`)) return;
    try {
      await api.deleteFAQ(item._id);
      fetchData();
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-64">
        <Header title="FAQ" />
        <main className="p-6">
          {!showForm ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">All FAQs</h2>
                  <p className="text-gray-500 text-sm">Manage frequently asked questions</p>
                </div>
                <button
                  onClick={openCreate}
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                  <Plus size={20} />
                  Add FAQ
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : (
                <DataTable
                  data={data}
                  columns={columns}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  searchable
                />
              )}
            </>
          ) : (
            <div className="max-w-2xl mx-auto">
              <button
                onClick={() => setShowForm(false)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
              >
                <ArrowLeft size={20} />
                Back to list
              </button>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  {editingItem ? 'Edit FAQ' : 'Create FAQ'}
                </h2>

                {editingItem && (
                  <div className="mb-4 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <span className="font-medium">ID:</span> {editingItem._id}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <FormFields
                    fields={formData}
                    setFields={setFormData}
                    config={{ fields: fieldConfigs }}
                  />

                  <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-primary hover:bg-primary/90 text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : editingItem ? 'Update FAQ' : 'Create FAQ'}
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
