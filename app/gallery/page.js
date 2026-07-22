'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import DataTable from '@/components/ui/DataTable';
import FormFields from '@/components/ui/FormFields';
import { api } from '@/lib/api';
import { Plus, X, ArrowLeft, Image as ImageIcon } from 'lucide-react';

const fieldConfigs = [
  { name: 'title', label: 'Title', type: 'text', placeholder: 'Gallery title' },
  { name: 'visible', label: 'Visible', type: 'toggle' },
];

export default function GalleryPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedUrls, setUploadedUrls] = useState({});
  const [formData, setFormData] = useState({
    title: 'Gallery',
    items: [],
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
      const res = await api.getAllGalleries();
      setData(res.data || []);
    } catch (err) {
      alert(`Failed to load: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingItem(null);
    setFormData({ title: 'Gallery', items: [], visible: true });
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || 'Gallery',
      items: item.items || [],
      visible: item.visible ?? true,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const cleanedItems = (formData.items || [])
        .filter((it) => it && it.url && String(it.url).trim() !== '')
        .map(({ inputMethod, ...item }) => ({
          ...item,
          url: String(item.url).trim(),
          type: item.type || 'image',
          caption: item.caption || '',
        }));

      if (cleanedItems.length === 0) {
        alert('Please add at least one media item with a URL or uploaded file before saving.');
        setSaving(false);
        return;
      }

      const payload = {
        ...formData,
        items: cleanedItems,
      };

      if (editingItem) {
        await api.updateGallery(editingItem._id, payload);
      } else {
        await api.createGallery(payload);
      }
      setShowForm(false);
      setUploadedUrls({});
      setUploadProgress({});
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
      await api.deleteGallery(item._id);
      fetchData();
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  const addMediaItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { url: '', type: 'image', caption: '', inputMethod: 'url' }],
    });
  };

  const updateMediaItem = (index, field, value) => {
    const updated = [...formData.items];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, items: updated });
  };

  const removeMediaItem = (index) => {
    const updated = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updated });
    setUploadProgress((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
    setUploadedUrls((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleMediaUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIndex(index);
    setUploadProgress((prev) => ({ ...prev, [index]: 0 }));
    setUploadedUrls((prev) => ({ ...prev, [index]: '' }));

    const xhr = new XMLHttpRequest();
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    const token = localStorage.getItem('token');

    xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/upload`);

    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress((prev) => ({ ...prev, [index]: percent }));
      }
    });

    xhr.addEventListener('load', () => {
      setUploadingIndex(null);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data.success && data.url) {
            updateMediaItem(index, 'url', data.url);
            setUploadedUrls((prev) => ({ ...prev, [index]: data.url }));
            const isVideo = data.url?.match(/\.(mp4|webm|ogg|mov)/i);
            const isGif = data.url?.match(/\.(gif)/i);
            if (isGif) updateMediaItem(index, 'type', 'gif');
            else if (isVideo) updateMediaItem(index, 'type', 'video');
            else updateMediaItem(index, 'type', 'image');
          } else {
            alert('Upload failed: ' + (data.error || 'Unknown error'));
          }
        } catch {
          alert('Upload failed: Invalid server response');
        }
      } else {
        let errorMsg = `Upload failed with status ${xhr.status}`;
        try {
          const data = JSON.parse(xhr.responseText);
          errorMsg = data.error || errorMsg;
        } catch {
          // use default message
        }
        alert(errorMsg);
      }
    });

    xhr.addEventListener('error', () => {
      setUploadingIndex(null);
      alert('Upload failed: Network error');
    });

    xhr.send(formDataUpload);
  };

  const columns = [
    { header: 'Title', accessor: 'title' },
    { header: 'Items', accessor: 'items', render: (val) => `${val?.length || 0} media` },
    { header: 'Visible', accessor: 'visible', render: (val) => (val ? 'Yes' : 'No') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-64">
        <Header title="Gallery" />
        <main className="p-6">
          {!showForm ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">All Galleries</h2>
                  <p className="text-gray-500 text-sm">Manage your media galleries</p>
                </div>
                <button
                  onClick={openCreate}
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                  <Plus size={20} />
                  Add Gallery
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
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setUploadedUrls({});
                    setUploadProgress({});
                  }}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft size={20} />
                  Back to list
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={addMediaItem}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    <Plus size={18} />
                    Add Media Item
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingItem ? 'Update Gallery' : 'Create Gallery'}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {editingItem ? 'Edit Gallery' : 'Create New Gallery'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Organize your images, videos, and GIFs into a gallery collection.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormFields
                      fields={formData}
                      setFields={setFormData}
                      config={{
                        fields: fieldConfigs,
                      }}
                    />
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">Media Items</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Add images, videos, or GIFs. Each item needs either a URL or an uploaded file.</p>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        {formData.items.length} item{formData.items.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {formData.items.length === 0 ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                          <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <ImageIcon size={28} className="text-gray-400" />
                          </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">No media items yet</p>
                        <p className="text-xs text-gray-500 mb-4">Click "Add Media Item" above to get started.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.items.map((item, idx) => (
                          <div key={idx} className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                            <div className="flex items-start gap-4">
                              <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Type</label>
                                    <select
                                      value={item.type}
                                      onChange={(e) => updateMediaItem(idx, 'type', e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
                                    >
                                      <option value="image">Image</option>
                                      <option value="gif">GIF</option>
                                      <option value="video">Video</option>
                                    </select>
                                  </div>
                                  <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Caption</label>
                                    <input
                                      type="text"
                                      value={item.caption}
                                      onChange={(e) => updateMediaItem(idx, 'caption', e.target.value)}
                                      placeholder="Optional caption"
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-2">Media Source</label>
                                  <div className="flex gap-2 mb-3">
                                    <button
                                      type="button"
                                      onClick={() => updateMediaItem(idx, 'inputMethod', 'url')}
                                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                        item.inputMethod === 'url'
                                          ? 'bg-primary text-white border-primary'
                                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                      }`}
                                    >
                                      Paste URL
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateMediaItem(idx, 'inputMethod', 'upload')}
                                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                        item.inputMethod === 'upload'
                                          ? 'bg-primary text-white border-primary'
                                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                                      }`}
                                    >
                                      Upload File
                                    </button>
                                  </div>

                                  {item.inputMethod === 'url' ? (
                                    <div>
                                      <input
                                        type="text"
                                        value={item.url}
                                        onChange={(e) => updateMediaItem(idx, 'url', e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                      />
                                    </div>
                                  ) : (
                                    <div>
                                      <input
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={(e) => handleMediaUpload(e, idx)}
                                        className="text-sm block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                        disabled={uploadingIndex === idx}
                                      />
                                      {uploadingIndex === idx && (
                                        <div className="mt-3">
                                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div
                                              className="bg-primary h-2 rounded-full transition-all duration-200"
                                              style={{ width: `${uploadProgress[idx] || 0}%` }}
                                            />
                                          </div>
                                          <p className="text-xs text-gray-500 mt-1.5 font-medium">
                                            Uploading... {uploadProgress[idx] || 0}%
                                          </p>
                                        </div>
                                      )}
                                      {uploadedUrls[idx] && uploadingIndex !== idx && (
                                        <p className="text-xs text-green-600 mt-1.5 font-medium flex items-center gap-1.5">
                                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                          Uploaded successfully
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {(item.url || uploadedUrls[idx]) && (
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-2">Preview</label>
                                    <div className="relative inline-block">
                                      {item.type === 'video' ? (
                                        <video src={item.url} className="max-h-40 rounded-lg border border-gray-200" controls />
                                      ) : (
                                        <img src={item.url} alt="Preview" className="max-h-40 rounded-lg border border-gray-200 object-contain bg-gray-50" />
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => removeMediaItem(idx)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors self-start mt-1"
                                title="Remove item"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
