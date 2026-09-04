'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import DataTable from '@/components/ui/DataTable';
import FormFields from '@/components/ui/FormFields';
import { api } from '@/lib/api';
import { 
  Plus, 
  X, 
  Trash2, 
  ArrowLeft,
  GripVertical 
} from 'lucide-react';

const fieldConfigs = [
  { name: 'title', label: 'Title', type: 'text', placeholder: 'Service name' },
  { name: 'price', label: 'Price', type: 'text', placeholder: 'e.g. $99/month' },
  { name: 'features', label: 'Features', type: 'textarea', placeholder: 'Feature description', allowArray: true, arrayField: 'features' },
  { name: 'image', label: 'Image', type: 'image' },
  { name: 'imageAlt', label: 'Image Alt Text', type: 'text', placeholder: 'Describe the image' },

  // NEW: main video shown alongside the main image on the service page
  { name: 'video', label: 'Video', type: 'video', placeholder: 'Video URL' },

  // NEW: short description shown under the service title
  { name: 'description', label: 'Short Description', type: 'textarea', placeholder: 'A short sentence or two shown right under the service title' },

  // NEW: plain info block (no heading), shown right after the image/video
  { name: 'aboutText', label: 'Info Block (shown after the media, no heading)', type: 'textarea', placeholder: 'Additional info about this service' },

  { name: 'buttonText', label: 'Button Text', type: 'text', placeholder: 'Get in touch' },
  { name: 'order', label: 'Sort Order', type: 'number', placeholder: '0' },

  // NEW: Case Studies section
  { name: 'caseStudyHeading', label: 'Case Study Heading', type: 'text', placeholder: 'CASE STUDIES' },
  { name: 'caseStudyDescription', label: 'Case Study Description', type: 'textarea', placeholder: 'A short description of the case study' },
  { name: 'caseStudyImage', label: 'Case Study Image', type: 'image' },
  { name: 'caseStudyVideo', label: 'Case Study Video', type: 'video', placeholder: 'Video URL' },
];

const columns = [
  { header: 'Title', accessor: 'title' },
  { header: 'Price', accessor: 'price' },
  { header: 'Features', accessor: 'features', render: (val) => `${val?.length || 0} items` },
  { header: 'Order', accessor: 'order' },
];

const emptyFormData = {
  title: '',
  price: '',
  features: [''],
  image: '',
  imageAlt: '',
  video: '',
  description: '',
  aboutText: '',
  buttonText: 'Get in touch',
  order: 0,
  caseStudyHeading: '',
  caseStudyDescription: '',
  caseStudyImage: '',
  caseStudyVideo: '',
};

export default function ServicesPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyFormData);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getServices();
      setData(res.data || []);
    } catch (err) {
      alert(`Failed to load: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingItem(null);
    setFormData(emptyFormData);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      price: item.price || '',
      features: Array.isArray(item.features) && item.features.length ? item.features : [''],
      image: item.image || '',
      imageAlt: item.imageAlt || '',
      video: item.video || '',
      description: item.description || '',
      aboutText: item.aboutText || '',
      buttonText: item.buttonText || 'Get in touch',
      order: item.order || 0,
      caseStudyHeading: item.caseStudyHeading || '',
      caseStudyDescription: item.caseStudyDescription || '',
      caseStudyImage: item.caseStudyImage || '',
      caseStudyVideo: item.caseStudyVideo || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const featuresArray = Array.isArray(formData.features) 
        ? formData.features 
        : typeof formData.features === 'string' 
          ? [formData.features] 
          : [];
      const payload = {
        ...formData,
        features: featuresArray.filter((f) => f.trim() !== ''),
      };
      if (editingItem) {
        await api.updateService(editingItem._id, payload);
      } else {
        await api.createService(payload);
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
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await api.deleteService(item._id);
      fetchData();
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-64">
        <Header title="Services" />
        <main className="p-6">
          {!showForm ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">All Services</h2>
                  <p className="text-gray-500 text-sm">Manage your service offerings</p>
                </div>
                <button
                  onClick={openCreate}
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                  <Plus size={20} />
                  Add Service
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
                  {editingItem ? 'Edit Service' : 'Create Service'}
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
                    config={{ fields: fieldConfigs, allowImages: true, allowArray: true, arrayField: 'features' }}
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
                      {saving ? 'Saving...' : editingItem ? 'Update Service' : 'Create Service'}
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
