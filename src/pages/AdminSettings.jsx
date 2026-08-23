import React, { useState, useEffect } from 'react';
import { supabase, uploadFile } from '../lib/supabase';
import { useSiteSettings, DEFAULT_HERO_MOTION_IMAGES } from '../context/SiteSettingsContext';
import AdminLayout from '../components/AdminLayout';
import '../styles/admin.css';

const AdminSettings = () => {
  const { settings, refreshSettings, updateSettingsLocally } = useSiteSettings();
  const [activeTab, setActiveTab] = useState('hero_motion');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Form Fields State — Branding & Slogans
  const [sloganLine1, setSloganLine1] = useState('');
  const [sloganLine2, setSloganLine2] = useState('');
  const [supportingText, setSupportingText] = useState('');
  const [preloaderText, setPreloaderText] = useState('');

  // Form Fields State — Contact & Socials
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [facebookLink, setFacebookLink] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [studioAddress, setStudioAddress] = useState('');
  const [locationMapUrl, setLocationMapUrl] = useState('');
  const [officeHours, setOfficeHours] = useState('');

  // Hero Display Count Control
  const [heroImageDisplayCount, setHeroImageDisplayCount] = useState(8);

  // 3 Divisions Customization State
  const [divisionMediaTitleAr, setDivisionMediaTitleAr] = useState('');
  const [divisionMediaSubtitleAr, setDivisionMediaSubtitleAr] = useState('');
  const [divisionMediaUrl, setDivisionMediaUrl] = useState('');
  const [divisionMediaImageFile, setDivisionMediaImageFile] = useState(null);
  const [divisionMediaImagePreview, setDivisionMediaImagePreview] = useState('');

  const [divisionStudioTitleAr, setDivisionStudioTitleAr] = useState('');
  const [divisionStudioSubtitleAr, setDivisionStudioSubtitleAr] = useState('');
  const [divisionStudioUrl, setDivisionStudioUrl] = useState('');
  const [divisionStudioImageFile, setDivisionStudioImageFile] = useState(null);
  const [divisionStudioImagePreview, setDivisionStudioImagePreview] = useState('');

  const [divisionPrintTitleAr, setDivisionPrintTitleAr] = useState('');
  const [divisionPrintSubtitleAr, setDivisionPrintSubtitleAr] = useState('');
  const [divisionPrintUrl, setDivisionPrintUrl] = useState('');
  const [divisionPrintImageFile, setDivisionPrintImageFile] = useState(null);
  const [divisionPrintImagePreview, setDivisionPrintImagePreview] = useState('');

  // Brand Asset Files State
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [desktopVideoFile, setDesktopVideoFile] = useState(null);
  const [mobileVideoFile, setMobileVideoFile] = useState(null);

  // Hero Motion Images State
  const [heroMotionImages, setHeroMotionImages] = useState([]);
  const [newMotionFile, setNewMotionFile] = useState(null);
  const [newMotionUrl, setNewMotionUrl] = useState('');
  const [newMotionTitleAr, setNewMotionTitleAr] = useState('');
  const [newMotionTitleEn, setNewMotionTitleEn] = useState('');
  const [newMotionLink, setNewMotionLink] = useState('/work');

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

      setHeroImageDisplayCount(settings.hero_image_display_count || 8);

      // Divisions sync
      setDivisionMediaTitleAr(settings.division_media_title_ar || 'ميديا');
      setDivisionMediaSubtitleAr(settings.division_media_subtitle_ar || 'صناعة المحتوى والحملات الإبداعية');
      setDivisionMediaUrl(settings.division_media_url || '/work');
      setDivisionMediaImagePreview(settings.division_media_image || '');

      setDivisionStudioTitleAr(settings.division_studio_title_ar || 'استوديو');
      setDivisionStudioSubtitleAr(settings.division_studio_subtitle_ar || 'التصوير الاحترافي ورواية القصة البصرية');
      setDivisionStudioUrl(settings.division_studio_url || '/booking');
      setDivisionStudioImagePreview(settings.division_studio_image || '');

      setDivisionPrintTitleAr(settings.division_print_title_ar || 'مطبوعات');
      setDivisionPrintSubtitleAr(settings.division_print_subtitle_ar || 'المطبوعات الفاخرة والتغليف الراقي');
      setDivisionPrintUrl(settings.division_print_url || '/printing-products');
      setDivisionPrintImagePreview(settings.division_print_image || '');

      let parsedMotionImages = [];
      if (Array.isArray(settings.hero_motion_images)) {
        parsedMotionImages = settings.hero_motion_images;
      } else if (typeof settings.hero_motion_images === 'string') {
        try {
          parsedMotionImages = JSON.parse(settings.hero_motion_images);
        } catch (e) {}
      }

      if (!Array.isArray(parsedMotionImages) || parsedMotionImages.length === 0) {
        parsedMotionImages = DEFAULT_HERO_MOTION_IMAGES;
      }

      setHeroMotionImages(parsedMotionImages);
    }
  }, [settings]);

  const handleMotionItemChange = (idx, field, val) => {
    const updated = [...heroMotionImages];
    updated[idx] = { ...updated[idx], [field]: val };
    setHeroMotionImages(updated);
  };

  const handleMotionItemReplaceImage = async (idx, file) => {
    if (!file) return;
    setLoading(true);
    setUploadProgress(`جاري رفع واستبدال الصورة رقم ${idx + 1}...`);
    try {
      const path = `hero-motion/photo-${Date.now()}-${file.name}`;
      const newUrl = await uploadFile('packages', path, file);
      const updated = [...heroMotionImages];
      updated[idx] = { ...updated[idx], image: newUrl };
      setHeroMotionImages(updated);
    } catch (err) {
      alert('حدث خطأ أثناء رفع الصورة: ' + err.message);
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'desktop_video') {
      setDesktopVideoFile(file);
      return;
    }
    if (type === 'mobile_video') {
      setMobileVideoFile(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      if (type === 'logo') {
        setLogoFile(file);
        setLogoPreview(dataUrl);
      } else if (type === 'division_media') {
        setDivisionMediaImageFile(file);
        setDivisionMediaImagePreview(dataUrl);
      } else if (type === 'division_studio') {
        setDivisionStudioImageFile(file);
        setDivisionStudioImagePreview(dataUrl);
      } else if (type === 'division_print') {
        setDivisionPrintImageFile(file);
        setDivisionPrintImagePreview(dataUrl);
      } else if (type === 'new_hero_motion') {
        setNewMotionFile(file);
        setNewMotionUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress('جاري معالجة وحفظ البيانات الإدارية...');

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
        hero_image_display_count: parseInt(heroImageDisplayCount, 10) || 8,
        hero_motion_images: JSON.stringify(heroMotionImages),
        division_media_title_ar: divisionMediaTitleAr.trim(),
        division_media_subtitle_ar: divisionMediaSubtitleAr.trim(),
        division_media_url: divisionMediaUrl.trim(),
        division_studio_title_ar: divisionStudioTitleAr.trim(),
        division_studio_subtitle_ar: divisionStudioSubtitleAr.trim(),
        division_studio_url: divisionStudioUrl.trim(),
        division_print_title_ar: divisionPrintTitleAr.trim(),
        division_print_subtitle_ar: divisionPrintSubtitleAr.trim(),
        division_print_url: divisionPrintUrl.trim()
      };

      // Upload Logo if provided
      if (logoFile) {
        setUploadProgress('جاري رفع الشعار الجديد...');
        const path = `branding/logo-${Date.now()}-${logoFile.name}`;
        const logoUrl = await uploadFile('packages', path, logoFile);
        updates.logo_url = logoUrl;
      } else if (logoPreview) {
        updates.logo_url = logoPreview;
      }

      // 1. Upload Division Media Image if provided
      if (divisionMediaImageFile) {
        setUploadProgress('جاري رفع غلاف قسم الميديا...');
        const path = `divisions/media-${Date.now()}-${divisionMediaImageFile.name}`;
        const mediaImgUrl = await uploadFile('packages', path, divisionMediaImageFile);
        updates.division_media_image = mediaImgUrl;
      } else if (divisionMediaImagePreview) {
        updates.division_media_image = divisionMediaImagePreview;
      }

      // 2. Upload Division Studio Image if provided
      if (divisionStudioImageFile) {
        setUploadProgress('جاري رفع غلاف قسم الاستوديو...');
        const path = `divisions/studio-${Date.now()}-${divisionStudioImageFile.name}`;
        const studioImgUrl = await uploadFile('packages', path, divisionStudioImageFile);
        updates.division_studio_image = studioImgUrl;
      } else if (divisionStudioImagePreview) {
        updates.division_studio_image = divisionStudioImagePreview;
      }

      // 3. Upload Division Print Image if provided
      if (divisionPrintImageFile) {
        setUploadProgress('جاري رفع غلاف قسم المطبوعات...');
        const path = `divisions/print-${Date.now()}-${divisionPrintImageFile.name}`;
        const printImgUrl = await uploadFile('packages', path, divisionPrintImageFile);
        updates.division_print_image = printImgUrl;
      } else if (divisionPrintImagePreview) {
        updates.division_print_image = divisionPrintImagePreview;
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

      // ALWAYS save locally FIRST so browser state & localStorage update immediately!
      if (updateSettingsLocally) {
        updateSettingsLocally(updates);
      }

      // Then attempt Supabase cloud save if connected
      try {
        const settingsData = Object.keys(updates).map(key => ({
          key,
          value: typeof updates[key] === 'object' ? JSON.stringify(updates[key]) : updates[key]
        }));

        for (const row of settingsData) {
          await supabase
            .from('site_settings')
            .upsert(row, { onConflict: 'key' });
        }
      } catch (dbErr) {
        console.warn('Supabase DB save skipped (running in local mode):', dbErr.message);
      }

      alert('تم حفظ كافة إعدادات وتخصيصات الموقع بنجاح!');
      setLogoFile(null);
      setDesktopVideoFile(null);
      setMobileVideoFile(null);
      setDivisionMediaImageFile(null);
      setDivisionStudioImageFile(null);
      setDivisionPrintImageFile(null);
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('حدث تنبيه أثناء الحفظ: ' + err.message);
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  const handleAddMotionImage = async (e) => {
    e.preventDefault();
    if (!newMotionFile && !newMotionUrl.trim()) {
      alert('يرجى اختيار صورة للرفع أو إضافة رابط صورة أولاً');
      return;
    }

    setLoading(true);
    setUploadProgress('جاري إضافة الصورة لقائمة الهيرو...');

    try {
      let finalUrl = newMotionUrl.trim();
      if (newMotionFile) {
        const path = `hero-motion/photo-${Date.now()}-${newMotionFile.name}`;
        finalUrl = await uploadFile('packages', path, newMotionFile);
      }

      const newItem = {
        id: `hm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        image: finalUrl,
        alt_ar: newMotionTitleAr.trim() || 'أعمال آيرس',
        alt_en: newMotionTitleEn.trim() || 'IRIS Showcase',
        url_optional: newMotionLink.trim() || '/work'
      };

      const updatedList = [...heroMotionImages, newItem];
      setHeroMotionImages(updatedList);

      await supabase
        .from('site_settings')
        .upsert({ key: 'hero_motion_images', value: JSON.stringify(updatedList) }, { onConflict: 'key' });

      if (updateSettingsLocally) {
        updateSettingsLocally({ hero_motion_images: updatedList });
      }

      setNewMotionFile(null);
      setNewMotionUrl('');
      setNewMotionTitleAr('');
      setNewMotionTitleEn('');
      alert('تمت إضافة الصورة بنجاح لقائمة حركة الهيرو!');
    } catch (err) {
      console.error('Error adding motion image:', err);
      alert('حدث خطأ أثناء إضافة الصورة: ' + err.message);
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  };

  const handleDeleteMotionImage = async (idToDelete) => {
    if (!window.confirm('هل أنت تأكد من رغبتك في حذف هذه الصورة من الهيرو؟')) return;

    const updatedList = heroMotionImages.filter(item => item.id !== idToDelete);
    setHeroMotionImages(updatedList);

    try {
      await supabase
        .from('site_settings')
        .upsert({ key: 'hero_motion_images', value: JSON.stringify(updatedList) }, { onConflict: 'key' });

      if (updateSettingsLocally) {
        updateSettingsLocally({ hero_motion_images: updatedList });
      }
    } catch (err) {
      console.error('Error deleting motion image:', err);
    }
  };

  return (
    <AdminLayout>
      <section className="admin-dashboard admin-settings-page">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">مركز تخصيص وإعدادات الموقع</h2>
            <p className="section-subtitle">إدارة ومزامنة الشعار، صور الهيرو، الأقسام الثلاثة، والهوية البصرية ديناميكياً.</p>
          </div>
        </div>

        {/* Custom Glassmorphic Tabs Navigation */}
        <div className="settings-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'hero_motion' ? 'active' : ''}`}
            onClick={() => setActiveTab('hero_motion')}
          >
            صور الهيرو والعدد ({heroMotionImages.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'divisions' ? 'active' : ''}`}
            onClick={() => setActiveTab('divisions')}
          >
            الأقسام الـ 3 (ميديا • استوديو • مطبوعات)
          </button>
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
          
          {/* TAB 1: HERO MOTION IMAGES & DISPLAY COUNT CONTROL */}
          {activeTab === 'hero_motion' && (
            <div className="tab-pane">
              <h3 className="tab-pane-title">إدارة وتحديد صور حركة الهيرو (Hero Living Stream)</h3>
              
              {/* Display Count Selector Card */}
              <div className="admin-sub-card count-control-card">
                <div className="count-control-header">
                  <h4 className="card-sub-title">🎯 عدد الصور المعروضة في الهيرو</h4>
                  <p className="tab-pane-desc">حدد عدد الصور التي تريد عرضها وتدويرها ديناميكياً للزائر في شاشة الهيرو.</p>
                </div>
                <div className="count-selector-box">
                  <label className="as-label">عدد الصور المعروضة حالياً:</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={heroImageDisplayCount}
                    onChange={(e) => setHeroImageDisplayCount(e.target.value)}
                    className="as-input count-number-input"
                  />
                  <span className="count-badge">من أصل {heroMotionImages.length || 8} صورة متوفرة</span>
                </div>
              </div>

              {/* Add New Motion Photo Box */}
              <div className="admin-sub-card add-motion-card">
                <h4 className="card-sub-title">+ إضافة صورة جديدة لـشريط الهيرو</h4>
                
                <div className="form-group-row">
                  <div className="form-group">
                    <label className="as-label">رفع صورة جديدة من جهازك</label>
                    <div className="file-upload-wrapper">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'new_hero_motion')}
                        id="new-hero-motion-upload"
                        className="file-input-hidden"
                      />
                      <label htmlFor="new-hero-motion-upload" className="file-upload-label">
                        <span>📷 اختيار صورة من الجهاز...</span>
                      </label>
                      {newMotionFile && (
                        <span className="file-name-badge">✓ {newMotionFile.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="as-label">أو إدخال رابط صورة مباشر (Image URL)</label>
                    <input
                      type="url"
                      value={newMotionUrl}
                      onChange={(e) => setNewMotionUrl(e.target.value)}
                      placeholder="https://..."
                      className="as-input"
                    />
                  </div>
                </div>

                <div className="form-group-row" style={{ marginTop: '14px' }}>
                  <div className="form-group">
                    <label className="as-label">عنوان العمل (بالعربية)</label>
                    <input
                      type="text"
                      value={newMotionTitleAr}
                      onChange={(e) => setNewMotionTitleAr(e.target.value)}
                      placeholder="مثال: تصوير جلسات تخرج"
                      className="as-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="as-label">عنوان العمل (بالإنجليزية)</label>
                    <input
                      type="text"
                      value={newMotionTitleEn}
                      onChange={(e) => setNewMotionTitleEn(e.target.value)}
                      placeholder="Example: Graduation Coverage"
                      className="as-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="as-label">رابط التوجيه عند الضغط</label>
                    <input
                      type="text"
                      value={newMotionLink}
                      onChange={(e) => setNewMotionLink(e.target.value)}
                      placeholder="/work أو /booking"
                      className="as-input"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-gold-action"
                  onClick={handleAddMotionImage}
                  disabled={loading}
                >
                  + حفظ وإضافة الصورة لشريط الهيرو
                </button>
              </div>

              <div className="divider-line" />

              {/* Active Hero Motion Photos List */}
              <h4 className="form-sub-heading">الصور المتاحة للتعديل والاستبدال (المجموع: {heroMotionImages.length})</h4>
              
              <div className="hero-motion-grid">
                {heroMotionImages.map((item, idx) => (
                  <div key={item.id || idx} className="motion-item-card editable-motion-card">
                    <div className="motion-card-img-wrap">
                      <img src={item.image} alt={item.alt_ar || 'صورة الهيرو'} className="motion-item-img" />
                      <input
                        type="file"
                        accept="image/*"
                        id={`replace-motion-img-${idx}`}
                        className="file-input-hidden"
                        onChange={(e) => handleMotionItemReplaceImage(idx, e.target.files[0])}
                      />
                      <label htmlFor={`replace-motion-img-${idx}`} className="btn-replace-img-badge">
                        📷 تغيير الصورة
                      </label>
                    </div>

                    <div className="motion-item-info">
                      <div className="motion-field">
                        <label className="as-label-xs">العنوان (بالعربية):</label>
                        <input
                          type="text"
                          value={item.alt_ar || ''}
                          onChange={(e) => handleMotionItemChange(idx, 'alt_ar', e.target.value)}
                          placeholder="عنوان العمل..."
                          className="as-input-xs"
                        />
                      </div>
                      <div className="motion-field">
                        <label className="as-label-xs">رابط التوجيه:</label>
                        <input
                          type="text"
                          value={item.url_optional || ''}
                          onChange={(e) => handleMotionItemChange(idx, 'url_optional', e.target.value)}
                          placeholder="/work"
                          className="as-input-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn-delete-small"
                      onClick={() => handleDeleteMotionImage(item.id)}
                      title="حذف هذه الصورة"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: THREE DIVISIONS (MEDIA • STUDIO • PRINT) */}
          {activeTab === 'divisions' && (
            <div className="tab-pane">
              <h3 className="tab-pane-title">تخصيص الأقسام الثلاثة الرئيسية (MEDIA • STUDIO • PRINT)</h3>
              <p className="tab-pane-desc">تعديل صور الغلاف والعناوين والنصوص الفرعية لأقسام الميديا والاسـتوديـو والمطبوعات ديناميكياً.</p>

              {/* Division 1: MEDIA */}
              <div className="admin-sub-card division-card">
                <div className="division-card-header">
                  <span className="division-badge">01</span>
                  <h4>قسم الميديا (MEDIA)</h4>
                </div>
                <div className="form-group-row">
                  <div className="form-group">
                    <label className="as-label">عنوان القسم (بالعربية)</label>
                    <input
                      type="text"
                      value={divisionMediaTitleAr}
                      onChange={(e) => setDivisionMediaTitleAr(e.target.value)}
                      className="as-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="as-label">الوصف الفرعي (Subtitle)</label>
                    <input
                      type="text"
                      value={divisionMediaSubtitleAr}
                      onChange={(e) => setDivisionMediaSubtitleAr(e.target.value)}
                      className="as-input"
                    />
                  </div>
                </div>
                <div className="form-group-row">
                  <div className="form-group">
                    <label className="as-label">رابط التوجيه (Route Link)</label>
                    <input
                      type="text"
                      value={divisionMediaUrl}
                      onChange={(e) => setDivisionMediaUrl(e.target.value)}
                      className="as-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="as-label">صورة غلاف قسم الميديا</label>
                    <div className="file-upload-wrapper">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'division_media')}
                        id="media-cover-upload"
                        className="file-input-hidden"
                      />
                      <label htmlFor="media-cover-upload" className="file-upload-label">
                        <span>تغيير صورة الميديا...</span>
                      </label>
                      {divisionMediaImagePreview && (
                        <div className="preview-division-box">
                          <img src={divisionMediaImagePreview} alt="Media preview" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Division 2: STUDIO */}
              <div className="admin-sub-card division-card">
                <div className="division-card-header">
                  <span className="division-badge">02</span>
                  <h4>قسم الاسـتوديـو (STUDIO)</h4>
                </div>
                <div className="form-group-row">
                  <div className="form-group">
                    <label className="as-label">عنوان القسم (بالعربية)</label>
                    <input
                      type="text"
                      value={divisionStudioTitleAr}
                      onChange={(e) => setDivisionStudioTitleAr(e.target.value)}
                      className="as-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="as-label">الوصف الفرعي (Subtitle)</label>
                    <input
                      type="text"
                      value={divisionStudioSubtitleAr}
                      onChange={(e) => setDivisionStudioSubtitleAr(e.target.value)}
                      className="as-input"
                    />
                  </div>
                </div>
                <div className="form-group-row">
                  <div className="form-group">
                    <label className="as-label">رابط التوجيه (Route Link)</label>
                    <input
                      type="text"
                      value={divisionStudioUrl}
                      onChange={(e) => setDivisionStudioUrl(e.target.value)}
                      className="as-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="as-label">صورة غلاف قسم الاستوديو</label>
                    <div className="file-upload-wrapper">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'division_studio')}
                        id="studio-cover-upload"
                        className="file-input-hidden"
                      />
                      <label htmlFor="studio-cover-upload" className="file-upload-label">
                        <span>تغيير صورة الاستوديو...</span>
                      </label>
                      {divisionStudioImagePreview && (
                        <div className="preview-division-box">
                          <img src={divisionStudioImagePreview} alt="Studio preview" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Division 3: PRINT */}
              <div className="admin-sub-card division-card">
                <div className="division-card-header">
                  <span className="division-badge">03</span>
                  <h4>قسم المطبوعات (PRINT)</h4>
                </div>
                <div className="form-group-row">
                  <div className="form-group">
                    <label className="as-label">عنوان القسم (بالعربية)</label>
                    <input
                      type="text"
                      value={divisionPrintTitleAr}
                      onChange={(e) => setDivisionPrintTitleAr(e.target.value)}
                      className="as-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="as-label">الوصف الفرعي (Subtitle)</label>
                    <input
                      type="text"
                      value={divisionPrintSubtitleAr}
                      onChange={(e) => setDivisionPrintSubtitleAr(e.target.value)}
                      className="as-input"
                    />
                  </div>
                </div>
                <div className="form-group-row">
                  <div className="form-group">
                    <label className="as-label">رابط التوجيه (Route Link)</label>
                    <input
                      type="text"
                      value={divisionPrintUrl}
                      onChange={(e) => setDivisionPrintUrl(e.target.value)}
                      className="as-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="as-label">صورة غلاف قسم المطبوعات</label>
                    <div className="file-upload-wrapper">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'division_print')}
                        id="print-cover-upload"
                        className="file-input-hidden"
                      />
                      <label htmlFor="print-cover-upload" className="file-upload-label">
                        <span>تغيير صورة المطبوعات...</span>
                      </label>
                      {divisionPrintImagePreview && (
                        <div className="preview-division-box">
                          <img src={divisionPrintImagePreview} alt="Print preview" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BRANDING & LOGO & VIDEOS */}
          {activeTab === 'branding' && (
            <div className="tab-pane">
              <h3 className="tab-pane-title">تخصيص الهوية البصرية وشاشة الترحيب</h3>

              <div className="form-group-row">
                <div className="form-group">
                  <label className="as-label">السطر الأول من السلوجان</label>
                  <input
                    type="text"
                    value={sloganLine1}
                    onChange={(e) => setSloganLine1(e.target.value)}
                    placeholder="مثال: من زهرة نادرة"
                    className="as-input"
                  />
                </div>
                <div className="form-group">
                  <label className="as-label">السطر الثاني من السلوجان</label>
                  <input
                    type="text"
                    value={sloganLine2}
                    onChange={(e) => setSloganLine2(e.target.value)}
                    placeholder="مثال: إلى علامة تجارية لا تُنسى"
                    className="as-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="as-label">النص التعريفي المساعد (Supporting Text)</label>
                <textarea
                  value={supportingText}
                  onChange={(e) => setSupportingText(e.target.value)}
                  placeholder="نص يظهر تحت السلوجان بالهيرو..."
                  rows={3}
                  className="as-textarea"
                />
              </div>

              <div className="form-group">
                <label className="as-label">نص الشاشة الافتتاحية (Preloader Slogan Text)</label>
                <input
                  type="text"
                  value={preloaderText}
                  onChange={(e) => setPreloaderText(e.target.value)}
                  placeholder="مثال: آيـرس • اسـتـوديـو إبـداعـي"
                  className="as-input"
                />
              </div>

              <div className="divider-line" />

              <h4 className="form-sub-heading">رفع الوسائط والشعار</h4>

              <div className="form-group">
                <label className="as-label">شعار الاستوديو (IRIS Logo)</label>
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
                  <label className="as-label">فيديو الخلفية للديسكتوب (Desktop Video)</label>
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
                  <label className="as-label">فيديو الخلفية للجوال (Mobile Video)</label>
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

          {/* TAB 4: SOCIALS & CONTACT */}
          {activeTab === 'socials' && (
            <div className="tab-pane">
              <h3 className="tab-pane-title">إعدادات وسائل الاتصال والشبكات</h3>

              <div className="form-group">
                <label className="as-label">رقم الواتساب المباشر للعميل (بدون إشارات أو أصفار دولية)</label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="مثال: 962797303260"
                  className="as-input"
                />
                <span className="field-hint">يرجى كتابة الرقم بالصيغة الدولية المباشرة لتشغيل رابط الدردشة الفوري.</span>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label className="as-label">رابط صفحة إنستغرام (Instagram Page Link)</label>
                  <input
                    type="url"
                    value={instagramLink}
                    onChange={(e) => setInstagramLink(e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="as-input"
                  />
                </div>
                <div className="form-group">
                  <label className="as-label">رابط صفحة فيسبوك (Facebook Page Link)</label>
                  <input
                    type="url"
                    value={facebookLink}
                    onChange={(e) => setFacebookLink(e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="as-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: STUDIO DETAILS */}
          {activeTab === 'studio' && (
            <div className="tab-pane">
              <h3 className="tab-pane-title">تفاصيل الاستوديو والدوام</h3>

              <div className="form-group">
                <label className="as-label">العنوان الجغرافي للاستوديو (يكتب باللغة العربية)</label>
                <input
                  type="text"
                  value={studioAddress}
                  onChange={(e) => setStudioAddress(e.target.value)}
                  placeholder="مثال: إربد – إشارة المحافظة"
                  className="as-input"
                />
              </div>

              <div className="form-group">
                <label className="as-label">رابط موقع جوجل مابز (Google Maps URL)</label>
                <input
                  type="url"
                  value={locationMapUrl}
                  onChange={(e) => setLocationMapUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                  className="as-input"
                />
              </div>

              <div className="form-group">
                <label className="as-label">أوقات وساعات الدوام الرسمية</label>
                <input
                  type="text"
                  value={officeHours}
                  onChange={(e) => setOfficeHours(e.target.value)}
                  placeholder="مثال: السبت - الخميس: 10:00 ص - 8:00 م"
                  className="as-input"
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
            <button type="submit" className="btn btn-save-main" disabled={loading}>
              {loading ? 'جاري الحفظ والتفعيل...' : 'حفظ ونشر جميع التعديلات'}
            </button>
          </div>
        </form>
      </section>
    </AdminLayout>
  );
};

export default AdminSettings;
