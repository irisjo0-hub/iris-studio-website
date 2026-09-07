import { useEffect, useState } from 'react';
import { getAllApprovedFeedbackAsync, getFlowFeedback, updateFeedbackStatus } from '../repositories/flowRepository';
import { Check, X, Clock } from 'lucide-react';

export const AdminFlowFeedback = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { supabase } = await import('../lib/supabase');
        const { data, error } = await supabase
          .from('flow_feedback')
          .select('id, flow_item_id, name, message, status, created_at')
          .order('created_at', { ascending: false });
        if (active) {
          setFeedbackList(error ? getFlowFeedback() : (data || []));
        }
      } catch {
        if (active) setFeedbackList(getFlowFeedback());
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setActionId(id);
    try {
      await updateFeedbackStatus(id, newStatus);
      const refreshed = await (async () => {
        try {
          const { supabase } = await import('../lib/supabase');
          const { data, error } = await supabase
            .from('flow_feedback')
            .select('id, flow_item_id, name, message, status, created_at')
            .order('created_at', { ascending: false });
          return error ? getFlowFeedback() : (data || []);
        } catch {
          return getFlowFeedback();
        }
      })();
      setFeedbackList(refreshed);
      await getAllApprovedFeedbackAsync();
    } catch (err) {
      alert('تعذر تحديث حالة التقييم: ' + (err?.message || 'خطأ غير معروف'));
    } finally {
      setActionId(null);
    }
  };

  const filteredItems = feedbackList.filter((item) => {
    if (filter === 'pending') return item.status === 'pending';
    if (filter === 'approved') return item.status === 'approved';
    if (filter === 'rejected') return item.status === 'rejected';
    return true;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto text-[#ECEBE7] dir-rtl" dir="rtl">
      <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">إشراف آراء IRIS Flow</h1>
          <p className="text-sm opacity-70">مراجعة واعتماد آراء وملاحظات الزوار قبل ظهورها في الصفحة الرئيسية</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'approved', 'rejected'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${filter === st ? 'bg-[#F5BD1A] text-[#044630]' : 'bg-white/5 hover:bg-white/10'}`}
            >
              {st === 'all' ? 'الكل' : st === 'pending' ? 'قيد الانتظار' : st === 'approved' ? 'معتمد' : 'مرفوض'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center rounded-3xl bg-[#1A0D18] border border-white/10 opacity-70">جاري تحميل التقييمات...</div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#1A0D18] border border-white/10 opacity-60">لا توجد آراء مطابقة للفئة المحددة.</div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((fb) => (
            <div key={fb.id} className="p-5 rounded-2xl bg-[#1A0D18] border border-[#ECEBE7]/15 flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-[#F5BD1A]">{fb.name}</span>
                  <span className="text-xs opacity-50 flex items-center gap-1"><Clock size={12} />{new Date(fb.created_at).toLocaleString('ar-JO')}</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${fb.status === 'approved' ? 'bg-green-500/20 text-green-400' : fb.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {fb.status}
                  </span>
                </div>
                <p className="text-sm opacity-90 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">"{fb.message}"</p>
                <span className="inline-block text-xs opacity-50">العنصر المرتبط: <code className="text-[#F5BD1A]">{fb.flow_item_id}</code></span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {fb.status !== 'approved' && (
                  <button
                    type="button"
                    disabled={actionId === fb.id}
                    onClick={() => handleStatusChange(fb.id, 'approved')}
                    className="p-2.5 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 flex items-center gap-1 text-xs font-bold disabled:opacity-50"
                    title="اعتماد"
                  ><Check size={16} /><span>اعتماد</span></button>
                )}
                {fb.status !== 'rejected' && (
                  <button
                    type="button"
                    disabled={actionId === fb.id}
                    onClick={() => handleStatusChange(fb.id, 'rejected')}
                    className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center gap-1 text-xs font-bold disabled:opacity-50"
                    title="رفض"
                  ><X size={16} /><span>رفض</span></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFlowFeedback;
