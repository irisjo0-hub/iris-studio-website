import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, uploadFile } from '../lib/supabase';
import '../styles/graduation.css';

/* ── Constants ─────────────────────────────────────────────── */
const DEPOSIT = 5;

const PACKAGES = [
  {
    id: 'basic',
    name: 'دفتر تخرج — أساسي',
    price: 12,
    icon: '📖',
    features: ['200 ورقة', 'ستاند طاولة', 'غلاف اسفنجي'],
    popular: false,
  },
  {
    id: 'bw',
    name: 'دفتر تخرج — طباعة أبيض وأسود',
    price: 15,
    icon: '📒',
    features: ['طباعة داخلي أبيض وأسود', '200 ورقة', 'ستاند طاولة', 'غلاف اسفنجي'],
    popular: true,
  },
  {
    id: 'color',
    name: 'دفتر تخرج — طباعة ملون',
    price: 18,
    icon: '📔',
    features: ['طباعة داخلي ملون', '200 ورقة', 'ستاند طاولة', 'غلاف اسفنجي'],
    popular: false,
  },
];

/* ── Helpers ────────────────────────────────────────────────── */
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

/* ── Image Validation Helpers ───────────────────────────────── */
const validateFrontCover = (file) => {
  if (!file) return null;
  const isValidType = file.type && ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
  if (!isValidType) {
    return 'صورة الغلاف الأمامي يجب أن تكون صورة من نوع (JPG, PNG, WEBP).';
  }
  if (file.size < 1024 * 1024) {
    return 'صورة الغلاف الأمامي يجب أن تكون بدقة عالية لا تقل عن 1MB للحصول على أفضل جودة طباعة.';
  }
  return null;
};

const validateBackCover = (file) => {
  if (!file) return null;
  const isValidType = file.type && ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
  if (!isValidType) {
    return 'صور الغلاف الخلفي يجب أن تكون صورة من نوع (JPG, PNG, WEBP).';
  }
  if (file.size < 500 * 1024) {
    return 'صور الغلاف الخلفي يجب أن تكون بدقة عالية لا تقل عن 500KB.';
  }
  return null;
};

const validateInternal = (file) => {
  if (!file) return null;
  const isValidType = file.type && ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
  if (!isValidType) {
    return 'الصور الداخلية يجب أن تكون صورة من نوع (JPG, PNG, WEBP).';
  }
  if (file.size < 500 * 1024) {
    return 'الصور الداخلية يجب أن تكون بدقة عالية لا تقل عن 500KB.';
  }
  return null;
};

const validatePhotoPage = (file) => {
  if (!file) return null;
  const isValidType = file.type && ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
  if (!isValidType) {
    return 'الصور الإضافية يجب أن تكون صورة من نوع (JPG, PNG, WEBP).';
  }
  if (file.size < 500 * 1024) {
    return 'الصور الإضافية يجب أن تكون بدقة عالية لا تقل عن 500KB.';
  }
  return null;
};

const validateReceipt = (file) => {
  if (!file) return null;
  const isValidType = file.type && ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
  if (!isValidType) {
    return 'وصل العربون يجب أن يكون صورة من نوع (JPG, PNG, WEBP).';
  }
  return null;
};

/* ── Single Image Upload Component ─────────────────────────── */
const SingleImageUpload = ({ label, image, onChange, onFileChange, required, validateFile, onError }) => {
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    if (validateFile) {
      const err = validateFile(file);
      if (err) {
        if (onError) onError(err);
        return;
      } else {
        if (onError) onError('');
      }
    }
    const compressed = await compressImage(file);
    onChange(compressed);
    if (onFileChange) onFileChange(file);
  };

  return (
    <div>
      <div
        className={`grad-upload-zone${image ? ' has-file' : ''}`}
        onClick={() => inputRef.current?.click()}
      >
        <div className="grad-upload-icon">{image ? '✅' : '📄'}</div>
        <div className="grad-upload-text">
          {label} {required && <span className="grad-required">*</span>}
        </div>
        <div className="grad-upload-hint">JPG / PNG / WEBP — انقر للاختيار</div>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>
      {image && (
        <div className="grad-upload-preview" style={{ marginTop: 12 }}>
          <div className="grad-preview-thumb">
            <img src={image} alt="preview" />
            <button className="grad-preview-remove" onClick={(e) => { e.stopPropagation(); onChange(''); if (onFileChange) onFileChange(null); if (onError) onError(''); }}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Multi Image Upload Component ───────────────────────────── */
const MultiImageUpload = ({ label, images, onChange, onFilesChange, files, validateFile, onError }) => {
  const inputRef = useRef();

  const handleFiles = async (fileList) => {
    const newPreviews = [];
    const newFiles = [];
    let errMsg = null;
    for (const f of fileList) {
      if (validateFile) {
        const err = validateFile(f);
        if (err) {
          errMsg = err;
          continue;
        }
      }
      const compressed = await compressImage(f);
      newPreviews.push(compressed);
      newFiles.push(f);
    }
    if (errMsg) {
      if (onError) onError(errMsg);
    } else {
      if (onError) onError('');
    }
    if (newFiles.length > 0) {
      onChange([...images, ...newPreviews]);
      if (onFilesChange) onFilesChange([...(files || []), ...newFiles]);
    }
  };

  const remove = (i) => {
    onChange(images.filter((_, idx) => idx !== i));
    if (onFilesChange) onFilesChange((files || []).filter((_, idx) => idx !== i));
    if (onError) onError('');
  };

  return (
    <div>
      <div className="grad-upload-zone" onClick={() => inputRef.current?.click()}>
        <div className="grad-upload-icon">🖼️</div>
        <div className="grad-upload-text">{label}</div>
        <div className="grad-upload-hint">JPG / PNG / WEBP — انقر لاختيار صور متعددة</div>
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(Array.from(e.target.files))}
        />
      </div>
      {images.length > 0 && (
        <div className="grad-upload-preview" style={{ marginTop: 12 }}>
          {images.map((src, i) => (
            <div key={i} className="grad-preview-thumb">
              <img src={src} alt={`img-${i}`} />
              <button className="grad-preview-remove" onClick={(e) => { e.stopPropagation(); remove(i); }}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
const GraduationBookOrder = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderNum, setOrderNum] = useState('');
  const [selectedPkg, setSelectedPkg] = useState(null);

  useEffect(() => {
    const pkgPrice = parseInt(searchParams.get('package'), 10);
    const found = PACKAGES.find(p => p.price === pkgPrice);
    if (found) {
      setSelectedPkg(found);
      setStep(1); // Skip package selection if passed in URL
    } else {
      setSelectedPkg(null);
      setStep(0);
    }
  }, [searchParams]);

  // Step 1 — Cover & Inside Info
  const [extTplNum, setExtTplNum] = useState('');
  const [intTplNum, setIntTplNum] = useState('');
  const [customDedication, setCustomDedication] = useState('');

  // Step 2 — Customer info
  const [arabicName, setArabicName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [phone, setPhone] = useState('');
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');

  // Step 3 — Photos (previews + raw files)
  const [frontCoverPreview, setFrontCoverPreview] = useState('');
  const [frontCoverFile, setFrontCoverFile] = useState(null);
  const [backCoverPreviews, setBackCoverPreviews] = useState([]);
  const [backCoverFiles, setBackCoverFiles] = useState([]);
  const [internalPreviews, setInternalPreviews] = useState([]);
  const [internalFiles, setInternalFiles] = useState([]);

  // Step 4 — Extras & Delivery
  const [photoPagesQty, setPhotoPagesQty] = useState(0);
  const [photoPagesPreviews, setPhotoPagesPreviews] = useState([]);
  const [photoPagesFiles, setPhotoPagesFiles] = useState([]);
  const [deliverySelected, setDeliverySelected] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Step 5 — Deposit
  const [receiptPreview, setReceiptPreview] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);

  // Errors
  const [errors, setErrors] = useState({});

  /* ── Computed values ─────────────────────────────────────── */
  const stepsList = [
    'اختيار الباقة',
    selectedPkg ? (selectedPkg.price === 12 ? 'الغلاف الخارجي' : 'الغلاف والداخل') : 'معلومات القالب',
    'معلومات العميل',
    'الصور',
    'إضافات وتوصيل',
    'الدفع والتأكيد'
  ];

  const photographicPagesTotal = photoPagesQty * 1;
  const deliveryCost = deliverySelected ? 2 : 0;
  const subtotal = selectedPkg ? (selectedPkg.price + photographicPagesTotal + deliveryCost) : 0;
  const remaining = subtotal - DEPOSIT;

  /* ── Validation per step ─────────────────────────────────── */
  const validate = (checkAll = false) => {
    const e = {};
    const currentStep = checkAll ? 5 : step;

    if (currentStep >= 0) {
      if (!selectedPkg) e.package = 'يرجى اختيار باقة أولاً.';
    }
    if (currentStep >= 1 && selectedPkg) {
      if (!extTplNum.trim()) e.extTpl = 'يرجى إدخال رقم قالب الغلاف الخارجي.';
      if (selectedPkg.price === 15 || selectedPkg.price === 18) {
        if (!intTplNum.trim()) e.intTpl = 'يرجى إدخال رقم القالب الداخلي.';
      }
    }
    if (currentStep >= 2) {
      if (!arabicName.trim()) e.arabicName = 'يرجى إدخال الاسم بالعربي.';
      if (!englishName.trim()) e.englishName = 'يرجى إدخال الاسم بالإنجليزي.';
      if (!phone.trim()) e.phone = 'يرجى إدخال رقم الهاتف.';
      if (!university.trim()) e.university = 'يرجى إدخال اسم الجامعة.';
      if (!major.trim()) e.major = 'يرجى إدخال التخصص.';
    }
    if (currentStep >= 3) {
      if (!frontCoverPreview) {
        e.frontCover = 'يرجى رفع صورة الغلاف الأمامي.';
      } else if (frontCoverFile) {
        const err = validateFrontCover(frontCoverFile);
        if (err) e.frontCover = err;
      }

      if (backCoverFiles && backCoverFiles.length > 0) {
        for (const f of backCoverFiles) {
          const err = validateBackCover(f);
          if (err) {
            e.backCover = err;
            break;
          }
        }
      }

      if (internalFiles && internalFiles.length > 0) {
        for (const f of internalFiles) {
          const err = validateInternal(f);
          if (err) {
            e.internalImages = err;
            break;
          }
        }
      }
    }
    if (currentStep >= 4) {
      if (photoPagesQty > 0 && photoPagesFiles.length !== photoPagesQty) {
        e.photoPages = `يرجى رفع صور فوتوغرافية مساوية للكمية المحددة (${photoPagesFiles.length} من ${photoPagesQty}).`;
      } else if (photoPagesFiles && photoPagesFiles.length > 0) {
        for (const f of photoPagesFiles) {
          const err = validatePhotoPage(f);
          if (err) {
            e.photoPages = err;
            break;
          }
        }
      }
      if (deliverySelected && !deliveryAddress.trim()) {
        e.address = 'يرجى إدخال عنوان التوصيل بالتفصيل.';
      }
    }
    if (currentStep >= 5) {
      if (!receiptPreview) {
        e.receipt = 'يرجى رفع صورة وصل العربون.';
      } else if (receiptFile) {
        const err = validateReceipt(receiptFile);
        if (err) e.receipt = err;
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => { if (validate()) { setStep((s) => s + 1); window.scrollTo(0, 0); } };
  const prevStep = () => { setStep((s) => s - 1); window.scrollTo(0, 0); setErrors({}); };

  const handleSelectPackage = (pkg) => {
    setSelectedPkg(pkg);
    setStep(1);
    window.scrollTo(0, 0);
  };

  /* ── Upload helper for multiple files ──────────────────────── */
  const uploadMultipleFiles = async (files, prefix) => {
    const urls = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const ext = f.name.split('.').pop().toLowerCase();
      const path = `${prefix}-${i + 1}.${ext}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('graduation-orders')
        .upload(path, f, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('graduation-orders')
        .getPublicUrl(path);

      urls.push(data.publicUrl);
    }
    return urls;
  };

  /* ── Submit ──────────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!validate(true)) return;

    try {
      setSubmitting(true);
      setSubmitError('');

      console.log('Starting graduation order submit');

      const newOrderNum = `ORD-${Date.now().toString().slice(-6)}`;
      setOrderNum(newOrderNum);

      const orderId = Date.now().toString();

      // Upload all files to storage
      let frontCoverUrl = null;
      if (frontCoverFile) {
        const ext = frontCoverFile.name.split('.').pop().toLowerCase();
        const path = `${orderId}/front-cover.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('graduation-orders')
          .upload(path, frontCoverFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('graduation-orders')
          .getPublicUrl(path);

        frontCoverUrl = data.publicUrl;
      }

      const backCoverUrls = backCoverFiles.length > 0
        ? await uploadMultipleFiles(backCoverFiles, `${orderId}/back-cover`)
        : [];

      const internalImageUrls = internalFiles.length > 0
        ? await uploadMultipleFiles(internalFiles, `${orderId}/internal-image`)
        : [];

      const photographicPagesUrls = photoPagesFiles.length > 0
        ? await uploadMultipleFiles(photoPagesFiles, `${orderId}/photo-page`)
        : [];

      let receiptUrl = null;
      if (receiptFile) {
        const ext = receiptFile.name.split('.').pop().toLowerCase();
        const path = `receipt-${orderId}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('payment-receipts')
          .upload(path, receiptFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('payment-receipts')
          .getPublicUrl(path);

        receiptUrl = data.publicUrl;
      }

      // Insert order into database
      const { error } = await supabase
        .from('graduation_orders')
        .insert({
          order_number: newOrderNum,
          package_name: selectedPkg.name,
          package_price: selectedPkg.price,
          arabic_name: arabicName,
          english_name: englishName,
          phone,
          university,
          major,
          custom_dedication: (selectedPkg.price === 15 || selectedPkg.price === 18) ? customDedication : '',
          external_template_number: extTplNum,
          internal_template_number: (selectedPkg.price === 15 || selectedPkg.price === 18) ? intTplNum : '',
          front_cover_url: frontCoverUrl,
          back_cover_urls: backCoverUrls,
          internal_image_urls: selectedPkg.price === 12 ? [] : internalImageUrls,
          photographic_pages_quantity: photoPagesQty,
          photographic_pages_urls: photographicPagesUrls,
          photographic_pages_total: photographicPagesTotal,
          delivery_selected: deliverySelected,
          delivery_address: deliverySelected ? deliveryAddress : '',
          delivery_cost: deliveryCost,
          subtotal,
          deposit_amount: DEPOSIT,
          remaining_amount: remaining,
          receipt_url: receiptUrl,
          status: 'pending',
        });

      if (error) throw error;

      console.log('Graduation order submitted successfully');

      setSubmitted(true);
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Graduation order submit failed:', error);
      setSubmitError(
        error?.message || 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Step renderer ───────────────────────────────────────── */
  const renderStep = () => {
    /* STEP 0 — Package Selection */
    if (step === 0) return (
      <div className="grad-order-card">
        <div className="grad-card-title">
          <span className="grad-card-title-icon">🎁</span>
          اختر باقتك
        </div>
        <p className="grad-card-desc">حدد باقة دفتر التخرج التي تناسب احتياجاتك للمتابعة.</p>

        <div className="grad-packages-grid">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`grad-pkg-card${pkg.popular ? ' popular' : ''}${selectedPkg?.id === pkg.id ? ' selected' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => handleSelectPackage(pkg)}
            >
              {pkg.popular && <div className="grad-pkg-popular-badge">الأكثر طلباً</div>}
              <div className="grad-pkg-header">
                <span className="grad-pkg-icon">{pkg.icon}</span>
                <h3 className="grad-pkg-name">{pkg.name}</h3>
              </div>
              <div className="grad-pkg-price-block">
                <div className="grad-pkg-price">
                  {pkg.price} <span>JOD</span>
                </div>
              </div>
              <div className="grad-pkg-body">
                <ul className="grad-pkg-features">
                  {pkg.features.map((f, i) => (
                    <li key={i}>
                      <span className="grad-pkg-check">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="grad-pkg-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPackage(pkg);
                  }}
                >
                  اطلب هذه الباقة
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    /* STEP 1 — Cover & Inside Info */
    if (step === 1) return (
      <div className="grad-order-card">
        <div className="grad-card-title">
          <span className="grad-card-title-icon">📘</span>
          معلومات {selectedPkg?.price === 12 ? 'الغلاف الخارجي' : 'الغلاف والداخل'}
        </div>
        <p className="grad-card-desc">
          {selectedPkg?.price === 12
            ? 'حدد رقم قالب الغلاف الخارجي المختار للباقة الأساسية'
            : `حدد أرقام القوالب المختارة لباقة (${selectedPkg?.name || ''})`
          }
        </p>
        <div className="grad-form-grid">
          <div className="grad-field full">
            <label className="grad-label">
              رقم قالب الغلاف الخارجي <span className="grad-required">*</span>
            </label>
            <input
              type="number"
              min="1"
              className={`grad-input${errors.extTpl ? ' error' : ''}`}
              placeholder="مثال: 5"
              value={extTplNum}
              onChange={(e) => setExtTplNum(e.target.value)}
            />
            {errors.extTpl && <div className="grad-error-msg">⚠️ {errors.extTpl}</div>}
          </div>

          {(selectedPkg?.price === 15 || selectedPkg?.price === 18) && (
            <>
              <div className="grad-field full">
                <label className="grad-label">
                  رقم قالب الورق الداخلي والإهداء <span className="grad-required">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  className={`grad-input${errors.intTpl ? ' error' : ''}`}
                  placeholder="مثال: 12"
                  value={intTplNum}
                  onChange={(e) => setIntTplNum(e.target.value)}
                />
                {errors.intTpl && <div className="grad-error-msg">⚠️ {errors.intTpl}</div>}
              </div>
              <div className="grad-field full">
                <label className="grad-label">
                  إهداء مخصص <span className="grad-optional-badge">اختياري</span>
                </label>
                <textarea
                  className="grad-textarea"
                  placeholder="أدخل نص الإهداء في حال أردت تغييره عن القالب..."
                  value={customDedication}
                  onChange={(e) => setCustomDedication(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    );

    /* STEP 2 — Customer info */
    if (step === 2) return (
      <div className="grad-order-card">
        <div className="grad-card-title">
          <span className="grad-card-title-icon">👤</span>
          معلومات العميل
        </div>
        <p className="grad-card-desc">البيانات التي ستطبع على الدفتر وتستخدم للتواصل.</p>

        <div className="grad-form-grid">
          <div className="grad-field">
            <label className="grad-label">الاسم بالعربي <span className="grad-required">*</span></label>
            <input type="text" className={`grad-input${errors.arabicName ? ' error' : ''}`} placeholder="الاسم الكامل بالعربي" value={arabicName} onChange={(e) => setArabicName(e.target.value)} />
            {errors.arabicName && <div className="grad-error-msg">⚠️ {errors.arabicName}</div>}
          </div>
          <div className="grad-field">
            <label className="grad-label">الاسم بالإنجليزي <span className="grad-required">*</span></label>
            <input type="text" className={`grad-input${errors.englishName ? ' error' : ''}`} placeholder="Full Name in English" value={englishName} onChange={(e) => setEnglishName(e.target.value)} style={{ direction: 'ltr', textAlign: 'right' }} />
            {errors.englishName && <div className="grad-error-msg">⚠️ {errors.englishName}</div>}
          </div>
          <div className="grad-field full">
            <label className="grad-label">رقم الهاتف (واتساب) <span className="grad-required">*</span></label>
            <input type="tel" className={`grad-input${errors.phone ? ' error' : ''}`} placeholder="07xxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ direction: 'ltr', textAlign: 'right' }} />
            {errors.phone && <div className="grad-error-msg">⚠️ {errors.phone}</div>}
          </div>
          <div className="grad-field">
            <label className="grad-label">اسم الجامعة <span className="grad-required">*</span></label>
            <input type="text" className={`grad-input${errors.university ? ' error' : ''}`} placeholder="اسم الجامعة" value={university} onChange={(e) => setUniversity(e.target.value)} />
            {errors.university && <div className="grad-error-msg">⚠️ {errors.university}</div>}
          </div>
          <div className="grad-field">
            <label className="grad-label">اسم التخصص <span className="grad-required">*</span></label>
            <input type="text" className={`grad-input${errors.major ? ' error' : ''}`} placeholder="التخصص الدراسي" value={major} onChange={(e) => setMajor(e.target.value)} />
            {errors.major && <div className="grad-error-msg">⚠️ {errors.major}</div>}
          </div>
        </div>
      </div>
    );

    /* STEP 3 — Photos */
    if (step === 3) return (
      <div className="grad-order-card">
        <div className="grad-card-title"><span className="grad-card-title-icon">🖼️</span> رفع الصور</div>
        <p className="grad-card-desc">قم برفع صور الغلاف (الأمامي إلزامي، الباقي اختياري).</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <SingleImageUpload 
              label="صورة الغلاف الأمامي" 
              image={frontCoverPreview} 
              onChange={setFrontCoverPreview} 
              onFileChange={setFrontCoverFile} 
              required 
              validateFile={validateFrontCover}
              onError={(err) => setErrors(prev => ({ ...prev, frontCover: err }))}
            />
            {errors.frontCover && <div className="grad-error-msg">⚠️ {errors.frontCover}</div>}
          </div>
          <div>
            <MultiImageUpload 
              label="صور الغلاف الخلفي (اختياري)" 
              images={backCoverPreviews} 
              onChange={setBackCoverPreviews} 
              files={backCoverFiles} 
              onFilesChange={setBackCoverFiles} 
              validateFile={validateBackCover}
              onError={(err) => setErrors(prev => ({ ...prev, backCover: err }))}
            />
            {errors.backCover && <div className="grad-error-msg">⚠️ {errors.backCover}</div>}
          </div>
          {selectedPkg?.price !== 12 && (
            <div>
              <MultiImageUpload 
                label="صور الصفحات الداخلية (اختياري)" 
                images={internalPreviews} 
                onChange={setInternalPreviews} 
                files={internalFiles} 
                onFilesChange={setInternalFiles} 
                validateFile={validateInternal}
                onError={(err) => setErrors(prev => ({ ...prev, internalImages: err }))}
              />
              {errors.internalImages && <div className="grad-error-msg">⚠️ {errors.internalImages}</div>}
            </div>
          )}
        </div>
      </div>
    );

    /* STEP 4 — Extras & Delivery */
    if (step === 4) return (
      <div className="grad-order-card">
        <div className="grad-card-title"><span className="grad-card-title-icon">✨</span> إضافات وتوصيل</div>

        <div style={{ marginBottom: 32 }}>
          <h4 style={{ marginBottom: 16 }}>الصور الفوتوغرافية داخل الدفتر (1 JOD لكل صورة)</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <label className="grad-label" style={{ margin: 0 }}>الكمية المطلوبة:</label>
            <input type="number" min="0" className="grad-input" style={{ width: 100 }} value={photoPagesQty}
              onChange={(e) => {
                const q = Math.max(0, parseInt(e.target.value || 0, 10));
                setPhotoPagesQty(q);
                if (q === 0) { setPhotoPagesPreviews([]); setPhotoPagesFiles([]); }
                else if (photoPagesFiles.length > q) { setPhotoPagesPreviews(photoPagesPreviews.slice(0, q)); setPhotoPagesFiles(photoPagesFiles.slice(0, q)); }
              }}
            />
          </div>

          {photoPagesQty > 0 && (
            <div style={{ background: '#f9f9f9', padding: 16, borderRadius: 8, border: '1px solid #ddd' }}>
              <p style={{ fontSize: '0.85rem', marginBottom: 12, color: 'var(--g-purple)' }}>
                يرجى رفع {photoPagesQty} {photoPagesQty === 1 ? 'صورة' : 'صور'} بالضبط لهذه الإضافة.
              </p>
              <MultiImageUpload
                label={`رفع صور فوتوغرافية (${photoPagesFiles.length} من ${photoPagesQty})`}
                images={photoPagesPreviews}
                onChange={setPhotoPagesPreviews}
                files={photoPagesFiles}
                onFilesChange={setPhotoPagesFiles}
                validateFile={validatePhotoPage}
                onError={(err) => setErrors(prev => ({ ...prev, photoPages: err }))}
              />
              {errors.photoPages && <div className="grad-error-msg" style={{ marginTop: 8 }}>⚠️ {errors.photoPages}</div>}
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid #eee', paddingTop: 24 }}>
          <h4 style={{ marginBottom: 16 }}>التوصيل</h4>
          <label className="grad-label">هل تريد توصيل الطلب؟</label>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="radio" name="delivery" checked={!deliverySelected} onChange={() => setDeliverySelected(false)} /> لا، سأستلم من الاستوديو
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="radio" name="delivery" checked={deliverySelected} onChange={() => setDeliverySelected(true)} /> نعم، توصيل لجميع أنحاء المملكة +2 JOD
            </label>
          </div>

          {deliverySelected && (
            <div className="grad-field full">
              <label className="grad-label">عنوان التوصيل بالتفصيل <span className="grad-required">*</span></label>
              <textarea className={`grad-textarea${errors.address ? ' error' : ''}`} placeholder="المحافظة، المنطقة، الشارع، أقرب معلم، رقم العمارة..." value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} />
              {errors.address && <div className="grad-error-msg">⚠️ {errors.address}</div>}
            </div>
          )}
        </div>
      </div>
    );

    /* STEP 5 — Payment & Review */
    if (step === 5) return (
      <div className="grad-summary-wrap">
        <div className="grad-deposit-block" style={{ marginBottom: 24, textAlign: 'center' }}>
          <h3 style={{ color: 'var(--g-gold)', marginBottom: 8 }}>العربون المطلوب: {DEPOSIT} JOD</h3>
          <p style={{ fontSize: '0.9rem', marginBottom: 16 }}>الرجاء تحويل مبلغ العربون باستخدام أحد الطرق التالية:</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
            <div style={{ background: '#f4f4f4', padding: '12px 24px', borderRadius: 8, minWidth: 150 }}>
              <div style={{ fontWeight: 'bold', color: 'var(--g-purple)' }}>CliQ</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '4px 0', color: '#044630' }}>iris0</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>اسم المستلم: Hamzah Bani Domi</div>
            </div>
            <div style={{ background: '#f4f4f4', padding: '12px 24px', borderRadius: 8, minWidth: 150 }}>
              <div style={{ fontWeight: 'bold', color: '#f16e00' }}>Orange Money</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '4px 0', color: '#044630' }}> 0797303260 </div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>اسم المستلم: Hamzah Bani Domi</div>
            </div>
          </div>
          <div style={{ textAlign: 'right', background: '#fff', padding: 20, borderRadius: 12, border: '2px dashed var(--g-purple)' }}>
            <SingleImageUpload 
              label="إرفاق صورة وصل التحويل" 
              image={receiptPreview} 
              onChange={setReceiptPreview} 
              onFileChange={setReceiptFile} 
              required 
              validateFile={validateReceipt}
              onError={(err) => setErrors(prev => ({ ...prev, receipt: err }))}
            />
            {errors.receipt && <div className="grad-error-msg">⚠️ {errors.receipt}</div>}
          </div>
        </div>

        <div className="grad-summary">
          <div className="grad-summary-header"><h3>ملخص الطلب</h3></div>
          <div className="grad-summary-body">
            {[
              { key: 'الباقة', val: selectedPkg?.name },
              { key: 'سعر الباقة', val: `${selectedPkg?.price} JOD` },
              { key: 'قالب الغلاف الخارجي', val: `رقم #${extTplNum}` },
              intTplNum && { key: 'قالب الورق الداخلي', val: `رقم #${intTplNum}` },
              customDedication && { key: 'الإهداء المخصص', val: customDedication },
              { key: 'الاسم', val: `${arabicName} / ${englishName}` },
              { key: 'رقم الهاتف', val: phone },
              { key: 'عدد الصور الفوتوغرافية الإضافية', val: photoPagesQty },
              { key: 'تكلفة الصور الفوتوغرافية', val: `${photographicPagesTotal} JOD` },
              { key: 'خيار التوصيل', val: deliverySelected ? 'نعم، توصيل لجميع أنحاء المملكة +2 JOD' : 'لا، سأستلم من الاستوديو' },
              deliverySelected && { key: 'عنوان التوصيل', val: deliveryAddress },
            ].filter(Boolean).map((row, i) => (
              <div key={i} className="grad-summary-row">
                <span className="grad-summary-key">{row.key}</span>
                <span className="grad-summary-val">{row.val}</span>
              </div>
            ))}

            <div className="grad-summary-total">
              <div className="grad-summary-row">
                <span className="grad-summary-key">الإجمالي التراكمي</span>
                <span className="grad-summary-val grad-highlight-val">{subtotal} JOD</span>
              </div>
              <div className="grad-summary-row">
                <span className="grad-summary-key">العربون</span>
                <span className="grad-summary-val grad-gold-val">- {DEPOSIT} JOD</span>
              </div>
              <div className="grad-summary-row" style={{ borderTop: '1px solid #ccc', paddingTop: 12, marginTop: 8 }}>
                <span className="grad-summary-key">المبلغ المتبقي للتحصيل</span>
                <span className="grad-summary-val grad-green-val">{remaining} JOD</span>
              </div>
            </div>

            {submitError && (
              <div style={{ margin: '0 0 16px', background: '#FDEDEC', border: '1px solid #E74C3C', padding: '12px 16px', borderRadius: 8, color: '#C0392B', fontWeight: 'bold', fontSize: '0.95rem', textAlign: 'right' }}>
                ⚠️ {submitError}
              </div>
            )}

            <button className="grad-btn-submit" onClick={handleSubmit} disabled={submitting}>
              {submitting ? '⏳ جاري الإرسال...' : 'تأكيد وإرسال الطلب'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ── Success Screen / Invoice ───────────────────────────── */
  if (submitted || success) return (
    <main className="grad-order-page" dir="rtl">
      <div className="grad-order-body invoice-print-area">
        <div className="grad-success" style={{ padding: '40px 24px', background: '#fff', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div className="grad-success-icon" style={{ fontSize: '4rem', marginBottom: 16 }}>✅</div>
          <h2 style={{ color: 'var(--g-green)', marginBottom: 8 }}>تم إرسال طلبك بنجاح!</h2>
          <p style={{ color: '#555', marginBottom: 24 }}>سيتواصل معك فريقنا قريباً لمتابعة الطلب.</p>

          <div className="invoice-box" style={{ border: '2px solid #eee', borderRadius: 12, padding: 24, textAlign: 'right', marginBottom: 24 }}>
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: 12, marginBottom: 16 }}>فاتورة الطلب</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><strong>رقم الطلب:</strong> <span>{orderNum}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><strong>الاسم:</strong> <span>{arabicName}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><strong>رقم الهاتف:</strong> <span>{phone}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><strong>الباقة المختارة:</strong> <span>{selectedPkg?.name}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><strong>سعر الباقة:</strong> <span>{selectedPkg?.price} JOD</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><strong>رقم قالب الغلاف الخارجي:</strong> <span>#{extTplNum}</span></div>
            {intTplNum && (<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><strong>رقم قالب الورق الداخلي:</strong> <span>#{intTplNum}</span></div>)}
            {customDedication && (<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><strong>إهداء مخصص:</strong> <span>{customDedication}</span></div>)}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><strong>عدد الصور الفوتوغرافية:</strong> <span>{photoPagesQty}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><strong>تكلفة الصور الفوتوغرافية:</strong> <span>{photographicPagesTotal} JOD</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><strong>خيارات التوصيل:</strong> <span>{deliverySelected ? 'نعم، توصيل لجميع أنحاء المملكة +2 JOD' : 'لا، سأستلم من الاستوديو'}</span></div>
            {deliverySelected && (<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><strong>عنوان التوصيل:</strong> <span>{deliveryAddress}</span></div>)}
            <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '16px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><strong>الإجمالي:</strong> <span>{subtotal} JOD</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><strong>العربون:</strong> <span style={{ color: 'var(--g-gold)' }}>5 JOD</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}><strong>المبلغ المتبقي:</strong> <span style={{ color: 'var(--g-green)', fontWeight: 800 }}>{remaining} JOD</span></div>
          </div>

          <div className="no-print" style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <button className="grad-btn-submit" style={{ width: 'auto', padding: '12px 32px' }} onClick={() => window.print()}>🖨️ طباعة الفاتورة</button>
            <Link to="/graduation-books" className="grad-hero-btn" style={{ padding: '12px 32px' }}>العودة للرئيسية</Link>
          </div>
        </div>
      </div>
    </main>
  );

  /* ── Main render ─────────────────────────────────────────── */
  return (
    <main className="grad-order-page" dir="rtl">
      <div className="grad-order-hero no-print">
        <h1>طلب دفتر التخرج</h1>
        <p>يرجى إكمال جميع الخطوات لإتمام طلبك</p>
      </div>

      <div className="grad-steps-bar no-print" style={{ gridTemplateColumns: `repeat(${stepsList.length}, 1fr)` }}>
        {stepsList.map((label, i) => (
          <div key={i} className={`grad-step-item${step === i ? ' active' : step > i ? ' done' : ''}`}>
            <div className="grad-step-num">{step > i ? '✓' : i + 1}</div>
            <span className="grad-step-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="grad-order-body no-print">
        {renderStep()}
        <div className="grad-order-actions">
          {step > 0 && (<button className="grad-btn-prev" onClick={prevStep}>السابق</button>)}
          {step < stepsList.length - 1 && (
            <button
              className="grad-btn-next"
              onClick={nextStep}
              style={{ marginRight: 'auto' }}
              disabled={step === 0 && !selectedPkg}
            >
              التالي
            </button>
          )}
        </div>
      </div>
    </main>
  );
};

export default GraduationBookOrder;