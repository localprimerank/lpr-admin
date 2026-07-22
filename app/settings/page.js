'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import { ArrowLeft, Plus, X } from 'lucide-react';

const TABS = ['Hero', 'Stories', 'Contact Info', 'Social Links'];

const INPUT = 'w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm';
const LABEL = 'block text-sm font-medium text-gray-700 mb-1.5';

function Field({ label, name, value, onChange, type = 'text', placeholder = '', rows }) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      {type === 'textarea' ? (
        <textarea
          name={name}
          value={value || ''}
          onChange={onChange}
          rows={rows || 4}
          placeholder={placeholder}
          className={INPUT + ' resize-none'}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          className={INPUT}
        />
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState('Hero');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [hero, setHero] = useState({
    title: '',
    titleHighlight: '',
    description: '',
    username: 'LOCAL PRIME RANK',
    storyTimeOffset: '3h',
    avatar: '',
    videoMute: true,
    stories: [],
  });
  const [site, setSite] = useState({
    email: '', phone: '', whatsapp: '', address: '',
    instagram: '', twitter: '', linkedin: '', facebook: '',
    tiktok: '', pinterest: '', threads: '', youtube: '',
  });

  useEffect(() => {
    Promise.all([api.getHero(), api.getSiteSettings()])
      .then(([heroRes, siteRes]) => {
        if (heroRes?.data) setHero(heroRes.data);
        if (siteRes?.data) setSite(siteRes.data);
      })
      .catch((err) => alert(`Failed to load: ${err.message}`))
      .finally(() => setLoading(false));
  }, []);

  const handleHeroChange = (e) => setHero({ ...hero, [e.target.name]: e.target.value });
  const handleSiteChange = (e) => setSite({ ...site, [e.target.name]: e.target.value });

  const addStory = () => {
    setHero({ ...hero, stories: [...hero.stories, { url: '', type: 'image', allowAudio: false }] });
  };

  const updateStory = (index, field, value) => {
    const updated = [...hero.stories];
    updated[index] = { ...updated[index], [field]: value };
    setHero({ ...hero, stories: updated });
  };

  const removeStory = (index) => {
    setHero({ ...hero, stories: hero.stories.filter((_, i) => i !== index) });
  };

  const handleStoryUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const data = await api.uploadImage(formData);
      if (data.success) {
        updateStory(index, 'url', data.url);
        const isVideo = data.url?.match(/\.(mp4|webm|ogg|mov)/i);
        const isGif = data.url?.match(/\.(gif)/i);
        if (isGif) updateStory(index, 'type', 'gif');
        else if (isVideo) updateStory(index, 'type', 'video');
        else updateStory(index, 'type', 'image');
      }
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (tab === 'Hero') {
        const { stories, username, storyTimeOffset, avatar, videoMute, ...heroPayload } = hero;
        await api.updateHero({ ...heroPayload, videoMute });
      } else if (tab === 'Stories') {
        await api.updateHero({ ...hero });
      } else {
        await api.updateSiteSettings(site);
      }
      alert('Saved successfully!');
    } catch (err) {
      alert(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-64">
        <Header title="Settings" />
        <main className="p-6">
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Site Settings</h2>
                <p className="text-sm text-gray-500">Manage your brand, hero section, and contact information.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-200 bg-gray-50/50">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                      tab === t ? 'text-primary bg-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t}
                    {tab === t && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center h-32 items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {tab === 'Hero' && (
                      <div className="space-y-6">
                        <div className="pb-4 border-b border-gray-100">
                          <h3 className="text-base font-semibold text-gray-900">Hero Section</h3>
                          <p className="text-xs text-gray-500 mt-1">Main content displayed in the hero banner on your homepage.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <Field label="Main Title" name="title" value={hero.title} onChange={handleHeroChange} placeholder="TURNING IDEAS INTO" />
                          <Field label="Highlighted Title" name="titleHighlight" value={hero.titleHighlight} onChange={handleHeroChange} placeholder="MASTERPIECES" />
                        </div>
                        <Field label="Description" name="description" value={hero.description} onChange={handleHeroChange} type="textarea" placeholder="We combine brand vision..." rows={3} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <Field label="Username / Brand Name" name="username" value={hero.username} onChange={handleHeroChange} placeholder="LOCAL PRIME RANK" />
                          <Field label="Story Time Offset" name="storyTimeOffset" value={hero.storyTimeOffset} onChange={handleHeroChange} placeholder="3h" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Avatar Image</label>
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <input
                                type="text"
                                name="avatar"
                                value={hero.avatar}
                                onChange={handleHeroChange}
                                placeholder="https://..."
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                              />
                            </div>
                            {hero.avatar && (
                              <img src={hero.avatar} alt="Avatar preview" className="w-12 h-12 rounded-full object-cover border border-gray-200 flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {tab === 'Stories' && (
                      <div className="space-y-6">
                        <div className="pb-4 border-b border-gray-100">
                          <h3 className="text-base font-semibold text-gray-900">Hero Stories</h3>
                          <p className="text-xs text-gray-500 mt-1">Media shown in the stories viewer. Supports images, GIFs, and videos. Each video can have its own audio setting.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {hero.stories.map((story, idx) => (
                            <div key={idx} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors flex flex-col gap-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">#{idx + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => removeStory(idx)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                                <select
                                  value={story.type}
                                  onChange={(e) => updateStory(idx, 'type', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white"
                                >
                                  <option value="image">Image</option>
                                  <option value="gif">GIF</option>
                                  <option value="video">Video</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Media URL</label>
                                <input
                                  type="text"
                                  value={story.url}
                                  onChange={(e) => updateStory(idx, 'url', e.target.value)}
                                  placeholder="https://..."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Upload Media</label>
                                <input
                                  type="file"
                                  accept="image/*,video/*"
                                  onChange={(e) => handleStoryUpload(e, idx)}
                                  className="text-sm block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                />
                              </div>
                              {story.type === 'video' && (
                                <div className="p-3 bg-gray-50 rounded-lg">
                                  <label className="block text-xs font-semibold text-gray-700 mb-2">Video Audio</label>
                                  <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`videoAudio-${idx}`}
                                        checked={story.allowAudio === true}
                                        onChange={() => updateStory(idx, 'allowAudio', true)}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                                      />
                                      <span className="text-xs text-gray-700">Allow Audio</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                      <input
                                        type="radio"
                                        name={`videoAudio-${idx}`}
                                        checked={story.allowAudio !== true}
                                        onChange={() => updateStory(idx, 'allowAudio', false)}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                                      />
                                      <span className="text-xs text-gray-700">Don't Allow Audio</span>
                                    </label>
                                  </div>
                                </div>
                              )}
                              {story.url && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Preview</label>
                                  {story.type === 'video' ? (
                                    <video src={story.url} className="w-full max-h-40 rounded-lg border border-gray-200 object-contain bg-black" controls />
                                  ) : (
                                    <img src={story.url} alt="Story preview" className="w-full max-h-40 rounded-lg border border-gray-200 object-contain bg-gray-50" />
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={addStory}
                          className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium"
                        >
                          <Plus size={16} />
                          Add Story
                        </button>
                      </div>
                    )}

                    {tab === 'Contact Info' && (
                      <div className="space-y-6">
                        <div className="pb-4 border-b border-gray-100">
                          <h3 className="text-base font-semibold text-gray-900">Contact Information</h3>
                          <p className="text-xs text-gray-500 mt-1">How customers can reach you. These details are shown on the website.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <Field label="Email Address" name="email" value={site.email} onChange={handleSiteChange} type="email" placeholder="hello@lpr.agency" />
                          <Field label="Phone Number" name="phone" value={site.phone} onChange={handleSiteChange} placeholder="+1 (555) 000-0000" />
                          <Field label="WhatsApp Number" name="whatsapp" value={site.whatsapp} onChange={handleSiteChange} placeholder="+1234567890" />
                          <Field label="Address" name="address" value={site.address} onChange={handleSiteChange} type="textarea" rows={2} placeholder="New York, NY 10001" />
                        </div>
                      </div>
                    )}

                    {tab === 'Social Links' && (
                      <div className="space-y-6">
                        <div className="pb-4 border-b border-gray-100">
                          <h3 className="text-base font-semibold text-gray-900">Social Media Links</h3>
                          <p className="text-xs text-gray-500 mt-1">Add your social media profiles. Leave empty to hide from the website.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {[
                            { label: 'Instagram', name: 'instagram', placeholder: 'https://instagram.com/...' },
                            { label: 'Twitter / X', name: 'twitter', placeholder: 'https://twitter.com/...' },
                            { label: 'LinkedIn', name: 'linkedin', placeholder: 'https://linkedin.com/company/...' },
                            { label: 'Facebook', name: 'facebook', placeholder: 'https://facebook.com/...' },
                            { label: 'TikTok', name: 'tiktok', placeholder: 'https://tiktok.com/@...' },
                            { label: 'Pinterest', name: 'pinterest', placeholder: 'https://pinterest.com/...' },
                            { label: 'Threads', name: 'threads', placeholder: 'https://threads.net/@...' },
                            { label: 'YouTube', name: 'youtube', placeholder: 'https://youtube.com/@...' },
                          ].map((s) => (
                            <Field key={s.name} label={s.label} name={s.name} value={site[s.name]} onChange={handleSiteChange} placeholder={s.placeholder} />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-6 border-t border-gray-200">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
