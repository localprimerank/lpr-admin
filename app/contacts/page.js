'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import DataTable from '@/components/ui/DataTable';
import { api } from '@/lib/api';
import { Mail, Eye, EyeOff, Trash2 } from 'lucide-react';

const columns = [
  { header: 'Name', accessor: 'name' },
  { header: 'Email', accessor: 'email' },
  { header: 'Message', accessor: 'message', render: (val) => val ? (val.length > 60 ? val.slice(0, 60) + '...' : val) : '-' },
  { header: 'Status', accessor: 'status', render: (val) => {
    const colors = { new: 'bg-blue-100 text-blue-700', read: 'bg-yellow-100 text-yellow-700', replied: 'bg-green-100 text-green-700' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[val] || 'bg-gray-100 text-gray-600'}`}>{val}</span>;
  }},
  { header: 'Date', accessor: 'createdAt', render: (val) => val ? new Date(val).toLocaleDateString() : '-' },
];

export default function ContactsPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getContacts();
      setData(res.data || []);
    } catch (err) {
      alert(`Failed to load: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (item, status) => {
    try {
      await api.updateContact(item._id, { status });
      fetchData();
    } catch (err) {
      alert(`Failed to update: ${err.message}`);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete this contact?`)) return;
    try {
      await api.deleteContact(item._id);
      fetchData();
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  const viewContact = (item) => {
    setSelected(item);
    if (item.status === 'new') updateStatus(item, 'read');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-64">
        <Header title="Contacts" />
        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div><h2 className="text-xl font-semibold text-gray-900">Contact Submissions</h2><p className="text-gray-500 text-sm">View and manage contact form submissions</p></div>
          </div>

          {loading ? (
            <div className="flex justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
          ) : (
            <DataTable
              data={data}
              columns={columns}
              onView={viewContact}
              onDelete={handleDelete}
              searchable
            />
          )}

          {selected && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
              <div className="bg-white rounded-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Message Details</h3>
                  <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600"><Trash2 size={20} /></button>
                </div>
                <div className="space-y-4">
                  <div><p className="text-sm text-gray-500">From</p><p className="font-medium text-gray-900">{selected.name}</p><p className="text-sm text-gray-600">{selected.email}</p></div>
                  <div><p className="text-sm text-gray-500">Message</p><p className="text-gray-700 whitespace-pre-wrap">{selected.message}</p></div>
                  <div><p className="text-sm text-gray-500">Received</p><p className="text-sm text-gray-700">{selected.createdAt ? new Date(selected.createdAt).toLocaleString() : '-'}</p></div>
                </div>
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => { updateStatus(selected, 'replied'); setSelected(null); }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                  >
                    Mark as Replied
                  </button>
                  <button onClick={() => setSelected(null)} className="flex-1 border border-gray-300 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50">Close</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
