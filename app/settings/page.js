'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { api } from '@/lib/api';

const TABS = ['Hero', 'Contact Info', 'Social Links'];

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

  const [hero, setHero] = useState({ title: '', titleHighlight: '', description: '' });
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

  const handleSave = async () => {
    setSaving(true);
    try {
      if (tab === 'Hero') {
        await api.updateHero(hero);
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
          <div className="max-w-2xl">
            {/* Tab bar */}
            <div className="flex gap-1 mb-6 bg-white rounded-xl border border-gray-200 p-1 w-fit">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tab === t ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {loading ? (
                <div className="flex justify-center h-32 items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <>
                  {/* ── HERO TAB ── */}
                  {tab === 'Hero' && (
                    <div className="space-y-5">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Hero Section</h2>
                      <Field label="Main Title" name="title" value={hero.title} onChange={handleHeroChange} placeholder="TURNING IDEAS INTO" />
                      <Field label="Highlighted Title (italic, blue)" name="titleHighlight" value={hero.titleHighlight} onChange={handleHeroChange} placeholder="MASTERPIECES" />
                      <Field label="Description" name="description" value={hero.description} onChange={handleHeroChange} type="textarea" placeholder="We combine brand vision..." />
                    </div>
                  )}

                  {/* ── CONTACT INFO TAB ── */}
                  {tab === 'Contact Info' && (
                    <div className="space-y-5">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                      <Field label="Email Address" name="email" value={site.email} onChange={handleSiteChange} type="email" placeholder="hello@lpr.agency" />
                      <Field label="Phone Number" name="phone" value={site.phone} onChange={handleSiteChange} placeholder="+1 (555) 000-0000" />
                      <Field label="WhatsApp Number (with country code)" name="whatsapp" value={site.whatsapp} onChange={handleSiteChange} placeholder="+1234567890" />
                      <Field label="Address" name="address" value={site.address} onChange={handleSiteChange} type="textarea" rows={2} placeholder="New York, NY 10001" />
                    </div>
                  )}

                  {/* ── SOCIAL LINKS TAB ── */}
                  {tab === 'Social Links' && (
                    <div className="space-y-5">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media Links</h2>
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
                  )}

                  <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
