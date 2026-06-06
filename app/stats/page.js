'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import DataTable from '@/components/ui/DataTable';
import FormFields from '@/components/ui/FormFields';
import { api } from '@/lib/api';

const fieldConfigs = [
  { name: 'label', label: 'Label', type: 'text', placeholder: 'Projects completed' },
  { name: 'value', label: 'Value', type: 'text', placeholder: '120' },
  { name: 'prefix', label: 'Prefix', type: 'text', placeholder: '+' },
  { name: 'suffix', label: 'Suffix', type: 'text', placeholder: '%' },
];

const columns = [
  { header: 'Label', accessor: 'label' },
  { header: 'Value', accessor: 'value', render: (val, item) => `${item.prefix || ''}${val || ''}${item.suffix || ''}` || '-' },
];

export default function StatsPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ label: '', value: '', prefix: '', suffix: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getStats();
      setData(res.data || []);
    } catch (err) {
      alert(`Failed to load: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingItem(null);
    setFormData({ label: '', value: '', prefix: '', suffix: '' });
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({
      label: item.label || '',
      value: item.value || '',
      prefix: item.prefix || '',
      suffix: item.suffix || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingItem) await api.updateStat(editingItem._id, formData);
      else await api.createStat(formData);
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.label}"?`)) return;
    try {
      await api.deleteStat(item._id);
      fetchData();
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-64">
        <Header title="Stats" />
        <main className="p-6">
          {!showForm ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">All Stats</h2>
                  <p className="text-gray-500 text-sm">Manage homepage counters and metrics</p>
                </div>
                <button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors">
                  <span className="text-xl">+</span> Add Stat
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
              <button onClick={() => setShowForm(false)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">Back to list</button>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">{editingItem ? 'Edit Stat' : 'Create Stat'}</h2>
                <form onSubmit={handleSubmit}>
                  <FormFields fields={formData} setFields={setFormData} config={{ fields: fieldConfigs }} />
                  <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                    <button type="submit" disabled={saving} className="flex-1 bg-primary text-white px-4 py-3 rounded-lg font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Save Stat'}</button>
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
