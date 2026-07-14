import React, { useState, useEffect } from 'react';
import { supabase, uploadFile } from '../lib/supabase';
import { useSiteSettings } from '../context/SiteSettingsContext';
import AdminLayout from '../components/AdminLayout';
import '../styles/admin.css';

const AdminSettings = () => {
  const { settings, refreshSettings, updateSettingsLocally } = useSiteSettings();
  const [activeTab, setActiveTab] = useState('branding');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Form Fields State
  const [sloganLine1, setSloganLine1] = useState('');
  const [sloganLine2, setSloganLine2] = useState('');
  const [supportingText, setSupportingText] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [facebookLink, setFacebookLink] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [studioAddress, setStudioAddress] = useState('');
  const [locationMapUrl, setLocationMapUrl] = useState('');
  const [officeHours, setOfficeHours] = useState('');
  const [preloaderText, setPreloaderText] = useState('');

  // Brand Asset Files State
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [desktopVideoFile, setDesktopVideoFile] = useState(null);
  const [mobileVideoFile, setMobileVideoFile] = useState(null);

  // Sync state with context settings on load
  useEffect(() => {
    if (settings) {
      setSloganLine1(settings.slogan_line_1 || '');
      setSloganLine2(settings.slogan_line_2 || '');
      setSupportingText(settings.supporting_text || '');
      setWhatsappNumber(settings.whatsapp_number || '');
      setFacebookLink(settings.facebook_link || '');
      setInstagramLink(settings.instagram_link || '');
      setStudioAddress(settings.studio_address || '');
      setLocationMapUrl(settings.location_map_url || '');
      setOfficeHours(settings.office_hours || '');
      setLogoPreview(settings.logo_url || '');
      setPreloaderText(settings.preloader_text || '');
    }
  }, [settings]);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'logo') {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    } else if (type === 'desktop_video') {
      setDesktopVideoFile(file);
    } else if (type === 'mobile_video') {
      setMobileVideoFile(file);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress('جاري معالجة وحفظ البيانات...');

    try {
      const updates = {
        slogan_line_1: sloganLine1.trim(),
        slogan_line_2: sloganLine2.trim(),
        supporting_text: supportingText.trim(),
        whatsapp_number: whatsappNumber.trim(),
        facebook_link: facebookLink.trim(),
        instagram_link: instagramLink.trim(),
        studio_address: studioAddress.trim(),
        location_map_url: locationMapUrl.trim(),
        office_hours: officeHours.trim(),
        preloader_text: preloaderText.trim(),
      };

      // Upload Logo if provided
      if (logoFile) {
        setUploadProgress('جاري رفع الشعار الجديد...');
        const path = `branding/logo-${Date.now()}-${logoFile.name}`;
        const logoUrl = await uploadFile('packages', path, logoFile);
        updates.logo_url = logoUrl;
      }

      // Upload Desktop Video if provided
      if (desktopVideoFile) {
        setUploadProgress('جاري رفع فيديو الخلفية (نسخة الديسكتوب)... قد يستغرق ذلك دقيقة.');
        const path = `branding/hero-desktop-${Date.now()}-${desktopVideoFile.name}`;
        const desktopVideoUrl = await uploadFile('packages', path, desktopVideoFile);
        updates.hero_desktop_video_url = desktopVideoUrl;
      }

      // Upload Mobile Video if provided
      if (mobileVideoFile) {
        setUploadProgress('جاري رفع فيديو الخلفية (نسخة الجوال)... قد يستغرق ذلك دقيقة.');
        const path = `branding/hero-mobile-${Date.now()}-${mobileVideoFile.name}`;
        const mobileVideoUrl = await uploadFile('packages', path, mobileVideoFile);
        updates.hero_mobile_video_url = mobileVideoUrl;
      }

      // Upsert rows in site_settings
      const settingsData = Object.keys(updates).map(key => ({
        key,
        value: updates[key]
      }));

      // Insert or update all rows
      for (const row of settingsData) {
        const { error } = await supabase
          .from('site_settings')
          .upsert(row, { onConflict: 'key' });
        
        if (error) throw error;
      }

      alert('تم حفظ إعدادات الموقع بنجاح!');
      setLogoFile(null);
      setDesktopVideoFile(null);
      setMobileVideoFile(null);
      await refreshSettings();
    } catch (err) {
      console.error('Error saving settings, falling back to local storage:', err);
      
      if (updateSettingsLocally) {
        const localUpdates = {
          slogan_line_1: sloganLine1.trim(),
          slogan_line_2: sloganLine2.trim(),
          supporting_text: supportingText.trim(),
          whatsapp_number: whatsappNumber.trim(),
          facebook_link: facebookLink.trim(),
          instagram_link: instagramLink.trim(),
          studio_address: studioAddress.trim(),
          location_map_url: locationMapUrl.trim(),
          office_hours: officeHours.trim(),
          preloader_text: preloaderText.trim(),
        };
        if (logoPreview) localUpdates.logo_url = logoPreview;
        
        updateSettingsLocally(localUpdates);
        alert('تم حفظ الإعدادات محلياً في المتصفح بنجاح! (تنبيه: خادم قاعدة البيانات السحابية غير متصل حالياً، لذا تم الحفظ في ذاكرة هذا الجهاز فقط لتشغيل الموقع بمحتواه الجديد).');
      } else {
        alert('حدث خطأ أثناء حفظ الإعدادات: ' + err.message);
      }
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  return (
    <AdminLayout>
      <section className="admin-dashboard admin-settings-page">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">إعدادات الموقع العامة</h2>
            <p className="section-subtitle">قم بتحديث وتغيير محتوى صفحات الزبون والشعار ووسائل الاتصال ديناميكياً.</p>
          </div>
        </div>

        {/* Custom Tabs Navigation */}
        <div className="settings-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'branding' ? 'active' : ''}`}
            onClick={() => setActiveTab('branding')}
          >
            الهوية والشعار
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'socials' ? 'active' : ''}`}
            onClick={() => setActiveTab('socials')}
          >
            روابط التواصل
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'studio' ? 'active' : ''}`}
            onClick={() => setActiveTab('studio')}
          >
            معلومات الاستوديو
          </button>
        </div>

        {/* Forms Content */}
        <form className="admin-form settings-form" onSubmit={handleSaveSettings}>
          {activeTab === 'branding' && (
            <div className="tab-pane">
              <h3 className="tab-pane-title">تخصيص الهوية البصرية والهيرو</h3>

              <div className="form-group-row">
                <div className="form-group">
                  <label>السطر الأول من السلوجان (سوسنة الهيرو)</label>
                  <input
                    type="text"
                    value={sloganLine1}
                    onChange={(e) => setSloganLine1(e.target.value)}
                    placeholder="مثال: من زهرة نادرة"
                  />
                </div>
                <div className="form-group">
                  <label>السطر الثاني من السلوجان</label>
                  <input
                    type="text"
                    value={sloganLine2}
                    onChange={(e) => setSloganLine2(e.target.value)}
                    placeholder="مثال: إلى علامة تجارية لا تُنسى"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>النص التعريفي المساعد (Supporting Text)</label>
                <textarea
                  value={supportingText}
                  onChange={(e) => setSupportingText(e.target.value)}
                  placeholder="نص يظهر تحت السلوجان بالهيرو..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>نص الشاشة الافتتاحية (Preloader Slogan Text)</label>
                <input
                  type="text"
                  value={preloaderText}
                  onChange={(e) => setPreloaderText(e.target.value)}
                  placeholder="مثال: آيـرس • اسـتـوديـو إبـداعـي"
                />
              </div>

              <div className="divider-line" />

              <h4 className="form-sub-heading">رفع الوسائط والشعار</h4>

              <div className="form-group">
                <label>شعار الاستوديو (IRIS Logo)</label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'logo')}
                    id="logo-upload-input"
                    className="file-input-hidden"
                  />
                  <label htmlFor="logo-upload-input" className="file-upload-label">
                    <span>اختر شعار جديد...</span>
                  </label>
                  {logoPreview && (
                    <div className="preview-logo-box">
                      <img src={logoPreview} alt="Logo preview" className="logo-img-preview" />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>فيديو الخلفية للديسكتوب (Desktop Video)</label>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      accept="video/mp4"
                      onChange={(e) => handleFileChange(e, 'desktop_video')}
                      id="desktop-video-upload"
                      className="file-input-hidden"
                    />
                    <label htmlFor="desktop-video-upload" className="file-upload-label">
                      <span>{desktopVideoFile ? desktopVideoFile.name : 'اختر فيديو للكمبيوتر...'}</span>
                    </label>
                  </div>
                  {settings.hero_desktop_video_url && (
                    <span className="current-file-link">
                      الملف الحالي: <a href={settings.hero_desktop_video_url} target="_blank" rel="noreferrer">رابط الفيديو</a>
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label>فيديو الخلفية للجوال (Mobile Video)</label>
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      accept="video/mp4"
                      onChange={(e) => handleFileChange(e, 'mobile_video')}
                      id="mobile-video-upload"
                      className="file-input-hidden"
                    />
                    <label htmlFor="mobile-video-upload" className="file-upload-label">
                      <span>{mobileVideoFile ? mobileVideoFile.name : 'اختر فيديو للجوال...'}</span>
                    </label>
                  </div>
                  {settings.hero_mobile_video_url && (
                    <span className="current-file-link">
                      الملف الحالي: <a href={settings.hero_mobile_video_url} target="_blank" rel="noreferrer">رابط الفيديو</a>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'socials' && (
            <div className="tab-pane">
              <h3 className="tab-pane-title">إعدادات وسائل الاتصال والشبكات</h3>

              <div className="form-group">
                <label>رقم الواتساب الخاص بالاستوديو (بدون إشارات أو أصفار دولية)</label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="مثال: 962797303260"
                />
                <span className="field-hint">يرجى كتابة الرقم بالصيغة الدولية المباشرة لتشغيل رابط الدردشة الفوري.</span>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>رابط صفحة إنستغرام (Instagram Page Link)</label>
                  <input
                    type="url"
                    value={instagramLink}
                    onChange={(e) => setInstagramLink(e.target.value)}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="form-group">
                  <label>رابط صفحة فيسبوك (Facebook Page Link)</label>
                  <input
                    type="url"
                    value={facebookLink}
                    onChange={(e) => setFacebookLink(e.target.value)}
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'studio' && (
            <div className="tab-pane">
              <h3 className="tab-pane-title">تفاصيل الاستوديو والدوام</h3>

              <div className="form-group">
                <label>العنوان الجغرافي للاستوديو (يكتب باللغة العربية)</label>
                <input
                  type="text"
                  value={studioAddress}
                  onChange={(e) => setStudioAddress(e.target.value)}
                  placeholder="مثال: إربد – إشارة المحافظة"
                />
              </div>

              <div className="form-group">
                <label>رابط موقع جوجل مابز (Google Maps URL)</label>
                <input
                  type="url"
                  value={locationMapUrl}
                  onChange={(e) => setLocationMapUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                />
              </div>

              <div className="form-group">
                <label>أوقات وساعات الدوام الرسمية</label>
                <input
                  type="text"
                  value={officeHours}
                  onChange={(e) => setOfficeHours(e.target.value)}
                  placeholder="مثال: السبت - الخميس: 10:00 ص - 8:00 م"
                />
              </div>
            </div>
          )}

          {loading && (
            <div className="settings-progress-box">
              <div className="spinner-loader"></div>
              <p className="progress-text">{uploadProgress}</p>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-purple" disabled={loading}>
              {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات بالكامل'}
            </button>
          </div>
        </form>
      </section>
    </AdminLayout>
  );
};

export default AdminSettings;
