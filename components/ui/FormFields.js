'use client';

import { useState } from 'react';
import { Upload, X, Plus, Trash2, GripVertical } from 'lucide-react';
import { api } from '@/lib/api';

export default function FormFields({ fields, setFields, config = {} }) {
  const { 
    fields: fieldConfigs = [],
    allowImages = false,
    allowArray = false,
    arrayField = null
  } = config;

  const [uploadingFields, setUploadingFields] = useState({});

  const handleArrayChange = (fieldName, index, value) => {
    const updated = [...fields[fieldName]];
    updated[index] = value;
    setFields({ ...fields, [fieldName]: updated });
  };

  const addArrayItem = (fieldName) => {
    setFields({ ...fields, [fieldName]: [...(fields[fieldName] || []), ''] });
  };

  const removeArrayItem = (fieldName, index) => {
    const updated = [...fields[fieldName]];
    updated.splice(index, 1);
    setFields({ ...fields, [fieldName]: updated });
  };

  const handleImageUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('image', file);

    setUploadingFields((prev) => ({ ...prev, [fieldName]: true }));
    
    try {
      const data = await api.uploadImage(formData);
      if (data.success) {
        setFields({ ...fields, [fieldName]: data.url });
      } else {
        alert('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Image upload failed: ' + error.message);
    } finally {
      setUploadingFields((prev) => ({ ...prev, [fieldName]: false }));
    }
  };

  const renderField = (field) => {
    const value = fields[field.name] || '';
    
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.name}
            value={value}
            onChange={(e) => setFields({ ...fields, [field.name]: e.target.value })}
            placeholder={field.placeholder}
            rows={field.rows || 4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            id={field.name}
            value={value}
            onChange={(e) => setFields({ ...fields, [field.name]: e.target.value === '' ? '' : Number(e.target.value) })}
            placeholder={field.placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
        );
      
      case 'select':
        return (
          <select
            id={field.name}
            value={value}
            onChange={(e) => setFields({ ...fields, [field.name]: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          >
            <option value="">Select an option</option>
            {field.options?.map((opt) => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        );
      
      case 'toggle':
        return (
          <button
            type="button"
            onClick={() => setFields({ ...fields, [field.name]: !value })}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${value ? 'bg-primary' : 'bg-gray-200'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${value ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        );
      
      case 'image':
        return (
          <div>
            {uploadingFields[field.name] ? (
              <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/40 rounded-lg bg-primary/5">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-sm text-primary font-medium">Uploading...</span>
              </div>
            ) : value ? (
              <div className="relative inline-block">
                <img src={value} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
                <button
                  type="button"
                  onClick={() => setFields({ ...fields, [field.name]: '' })}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                <Upload size={24} className="text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Click to upload image</span>
                <span className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP up to 10MB</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, field.name)} />
              </label>
            )}
          </div>
        );
      
      default:
        return (
          <input
            type={field.type || 'text'}
            id={field.name}
            value={value}
            onChange={(e) => setFields({ ...fields, [field.name]: e.target.value })}
            placeholder={field.placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
        );
    }
  };

  return (
    <div className="space-y-5">
      {fieldConfigs.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-2">
            {field.label}
          </label>
          {renderField(field)}
          
          {allowArray && arrayField === field.name && fields[field.name]?.length > 0 && (
            <div className="mt-3 space-y-2">
              {fields[field.name].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <GripVertical size={16} className="text-gray-400" />
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleArrayChange(field.name, index, e.target.value)}
                    placeholder={`${field.label} item ${index + 1}`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem(field.name, index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem(field.name)}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium mt-2"
              >
                <Plus size={16} />
                Add {field.label.slice(0, -1)}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
