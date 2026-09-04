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

// Regular fields — handled by the existing FormFields component
const fieldConfigs = [
  { name: 'title', label: 'Title', type: 'text', placeholder: 'Service name' },
  { name: 'price', label: 'Price', type: 'text', placeholder: 'e.g. $99/month' },
  { name: 'features', label: 'Features', type: 'textarea', placeholder: 'Feature description', allowArray: true, arrayField: 'features' },
  { name: 'image', label: 'Image', type: 'image' },
  { name: 'imageAlt', label: 'Image Alt Text', type: 'text', placeholder: 'Describe the image' },
  { name: 'video', label: 'Video', type: 'video', placeholder: 'Video URL' },
  { name: 'description', label: 'Short Description', type: 'textarea', placeholder: 'A short sentence or two shown right under the service title' },
  { name: 'aboutText', label: 'Info Block (shown after the media, no heading)', type: 'textarea', placeholder: 'Additional info about this service' },
  { name: 'buttonText', label: 'Button Text', type: 'text', placeholder: 'Get in touch' },
  { name: 'order', label: 'Sort Order', type: 'number', placeholder: '0' },
  { name: 'caseStudyHeading', label: 'Case Studies Section Heading', type: 'text', placeholder: 'CASE STUDIES' },
];

const columns = [
  { header: 'Title', accessor: 'title' },
  { header: 'Price', accessor: 'price' },
  { header: 'Features', accessor: 'features', render: (val) => `${val?.length || 0} items` },
  { header: 'Order', accessor: 'order' },
];

const emptyCaseStudy = { title: '', description: '', image: '', video: '' };

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
  caseStudyHeading: 'CASE STUDIES',
  caseStudies: [],
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
      caseStudyHeading: item.caseStudyHeading || 'CASE STUDIES',
      caseStudies: Array.isArray(item.caseStudies) ? item.caseStudies : [],
    });
    setShowForm(true);
  };

  // ── Case Studies list helpers ──
  const addCaseStudy = () => {
    setFormData((prev) => ({
      ...prev,
      caseStudies: [...prev.caseStudies, { ...emptyCaseStudy }],
    }));
  };

  const removeCaseStudy = (idx) => {
    setFormData((prev) => ({
      ...prev,
      caseStudies: prev.caseStudies.filter((_, i) => i !== idx),
    }));
  };

  const updateCaseStudy = (idx, field, value) => {
    setFormData((prev) => ({
      ...prev,
      caseStudies: prev.caseStudies.map((cs, i) => (i === idx ? { ...cs, [field]: value } : cs)),
    }));
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

      // drop any completely empty case study rows before saving
      const cleanedCaseStudies = (formData.caseStudies || []).filter(
        (cs) => cs.title.trim() || cs.description.trim() || cs.image.trim() || cs.video.trim()
      );

      const payload = {
        ...formData,
        features: featuresArray.filter((f) => f.trim() !== ''),
        caseStudies: cleanedCaseStudies,
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

                  {/* ── Repeatable Case Studies list ── */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">Case Studies</h3>
                        <p className="text-gray-500 text-sm">Add as many case studies as you want for this service</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {formData.caseStudies.map((cs, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative">
                          <button
                            type="button"
                            onClick={() => removeCaseStudy(idx)}
                            className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                            title="Remove this case study"
                          >
                            <Trash2 size={18} />
                          </button>

                          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Case Study #{idx + 1}</p>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                              <input
                                type="text"
                                value={cs.title}
                                onChange={(e) => updateCaseStudy(idx, 'title', e.target.value)}
                                placeholder="e.g. How we grew Acme's traffic 3x"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                              <textarea
                                value={cs.description}
                                onChange={(e) => updateCaseStudy(idx, 'description', e.target.value)}
                                placeholder="Short description of this case study"
                                rows={3}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                              <input
                                type="text"
                                value={cs.image}
                                onChange={(e) => updateCaseStudy(idx, 'image', e.target.value)}
                                placeholder="https://..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                              <input
                                type="text"
                                value={cs.video}
                                onChange={(e) => updateCaseStudy(idx, 'video', e.target.value)}
                                placeholder="https://..."
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={addCaseStudy}
                      className="mt-4 flex items-center gap-2 text-primary font-medium text-sm hover:underline"
                    >
                      <Plus size={16} />
                      Add Case Study
                    </button>
                  </div>

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
