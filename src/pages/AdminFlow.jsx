import React, { useState, useEffect } from 'react';
import { getFlowItems, saveFlowItems } from '../repositories/flowRepository';
import { Plus, Trash2, Edit2, Check, X, ArrowUp, ArrowDown } from 'lucide-react';

export const AdminFlow = () => {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    setItems(getFlowItems());
  }, []);

  const handleSave = () => {
    saveFlowItems(items);
    alert('Flow items saved successfully!');
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setFormData({ ...item });
  };

  const handleFormChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const updated = items.map((it) => (it.id === editingId ? { ...formData } : it));
    setItems(updated);
    saveFlowItems(updated);
    setEditingId(null);
  };

  const toggleEnabled = (id) => {
    const updated = items.map((it) => (it.id === id ? { ...it, enabled: !it.enabled } : it));
    setItems(updated);
    saveFlowItems(updated);
  };

  const moveOrder = (idx, dir) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const copy = [...items];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    copy.forEach((it, i) => (it.sort_order = i + 1));
    setItems(copy);
    saveFlowItems(copy);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto text-[#ECEBE7] dir-rtl" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">إدارة IRIS Flow</h1>
          <p className="text-sm opacity-70">إدارة عناصر القصص التفاعلية في الصفحة الرئيسية</p>
        </div>
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-full bg-[#F5BD1A] text-[#044630] font-bold hover:opacity-90"
        >
          حفظ التغييرات
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={item.id} className="p-5 rounded-2xl bg-[#1A0D18] border border-[#ECEBE7]/15 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <span className="text-lg font-bold text-[#F5BD1A]">0{idx + 1}</span>
              <img src={item.image} alt={item.category_label_ar} className="w-16 h-16 object-cover rounded-xl border border-white/10" />
              <div>
                <h3 className="font-bold text-lg">{item.category_label_ar} / {item.category_label_en}</h3>
                <p className="text-sm opacity-60 line-clamp-1">{item.headline_ar}</p>
                <span className="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-[#F5BD1A]">
                  {item.cta_label_ar} &rarr; {item.cta_url}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => moveOrder(idx, -1)}
                disabled={idx === 0}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30"
              >
                <ArrowUp size={16} />
              </button>
              <button
                onClick={() => moveOrder(idx, 1)}
                disabled={idx === items.length - 1}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30"
              >
                <ArrowDown size={16} />
              </button>
              <button
                onClick={() => toggleEnabled(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${item.enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}
              >
                {item.enabled ? 'مفعل' : 'معطل'}
              </button>
              <button
                onClick={() => handleEditClick(item)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#F5BD1A]"
              >
                <Edit2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <form onSubmit={handleFormSubmit} className="bg-[#1A0D18] border border-[#F5BD1A]/40 p-6 rounded-3xl max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">تعديل عنصر Flow</h2>
              <button type="button" onClick={() => setEditingId(null)} className="p-2 rounded-full hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold opacity-70">الفئة (عربي)</label>
                <input
                  type="text"
                  value={formData.category_label_ar || ''}
                  onChange={(e) => handleFormChange('category_label_ar', e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-white/5 border border-white/10"
                />
              </div>
              <div>
                <label className="text-xs font-bold opacity-70">Category (EN)</label>
                <input
                  type="text"
                  value={formData.category_label_en || ''}
                  onChange={(e) => handleFormChange('category_label_en', e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-white/5 border border-white/10"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold opacity-70">العنوان الرئيسي (عربي)</label>
              <textarea
                value={formData.headline_ar || ''}
                onChange={(e) => handleFormChange('headline_ar', e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl bg-white/5 border border-white/10"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold opacity-70">نص الزر CTA (عربي)</label>
                <input
                  type="text"
                  value={formData.cta_label_ar || ''}
                  onChange={(e) => handleFormChange('cta_label_ar', e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-white/5 border border-white/10"
                />
              </div>
              <div>
                <label className="text-xs font-bold opacity-70">رابط الوجهة CTA URL</label>
                <input
                  type="text"
                  value={formData.cta_url || ''}
                  onChange={(e) => handleFormChange('cta_url', e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl bg-white/5 border border-white/10"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold opacity-70">رابط الصورة الرئيسية</label>
              <input
                type="text"
                value={formData.image || ''}
                onChange={(e) => handleFormChange('image', e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl bg-white/5 border border-white/10"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#F5BD1A] text-[#044630] font-bold"
              >
                حفظ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminFlow;
