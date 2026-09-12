import { useEffect, useState } from 'react';
import { CalendarDays, UserRound, ReceiptText, WalletCards } from 'lucide-react';
import RepresentativeLayout from '../components/RepresentativeLayout';
import { supabase } from '../lib/supabase';

const RepresentativeSales = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (active) setLoading(false); return; }
      const { data } = await supabase
        .from('commission_sales')
        .select('*')
        .eq('representative_id', user.id)
        .order('sale_date', { ascending: false });
      if (active) { setRows(data || []); setLoading(false); }
    };
    load();
    return () => { active = false; };
  }, []);

  const total = rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const commission = rows.reduce((sum, r) => sum + Number(r.commission_amount || 0), 0);

  return (
    <RepresentativeLayout>
      <section className="rep-page rep-sales-page">
        <div className="rep-page-title">
          <span className="rep-eyebrow">SALES</span>
          <h1>مبيعاتي</h1>
          <p>العمليات المسجلة باسمك والعمولة الناتجة عنها.</p>
        </div>

        <div className="rep-sales-summary">
          <div><span><ReceiptText size={17}/></span><small>عدد العمليات</small><strong>{rows.length}</strong></div>
          <div><span><WalletCards size={17}/></span><small>إجمالي المبيعات</small><strong>{total.toFixed(2)} <i>JOD</i></strong></div>
          <div><span><WalletCards size={17}/></span><small>إجمالي العمولة</small><strong>{commission.toFixed(2)} <i>JOD</i></strong></div>
        </div>

        <div className="rep-sales-list">
          {loading ? <div className="rep-empty">جاري تحميل المبيعات...</div> :
            !rows.length ? <div className="rep-empty"><ReceiptText size={25}/><br/>لا توجد مبيعات مسجلة.</div> :
            rows.map(r => (
              <article className="rep-sale-card" key={r.id}>
                <div className="rep-sale-icon"><ReceiptText size={18}/></div>
                <div className="rep-sale-main">
                  <strong>{r.service_name || 'عملية بيع'}</strong>
                  <span><CalendarDays size={13}/> {r.sale_date}</span>
                  <span><UserRound size={13}/> {r.customer_name || 'عميل'}</span>
                </div>
                <div className="rep-sale-values">
                  <small>قيمة البيع</small><b>{Number(r.amount || 0).toFixed(2)} <i>JOD</i></b>
                  <small>عمولتي</small><em>{Number(r.commission_amount || 0).toFixed(2)} <i>JOD</i></em>
                </div>
              </article>
            ))
          }
        </div>
      </section>
    </RepresentativeLayout>
  );
};

export default RepresentativeSales;
