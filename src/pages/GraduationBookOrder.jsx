import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, uploadFile } from '../lib/supabase';
import '../styles/graduation.css';

/* ── Constants ─────────────────────────────────────────────── */
const DEPOSIT = 5;

const DEFAULT_PACKAGES = [
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
  return null;
};

const validateBackCover = (file) => {
  if (!file) return null;
  const isValidType = file.type && ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
  if (!isValidType) {
    return 'صور الغلاف الخلفي يجب أن تكون صورة من نوع (JPG, PNG, WEBP).';
  }
  return null;
};

const validateInternal = (file) => {
  if (!file) return null;
  const isValidType = file.type && ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
  if (!isValidType) {
    return 'الصور الداخلية يجب أن تكون صورة من نوع (JPG, PNG, WEBP).';
  }
  return null;
};

const validatePhotoPage = (file) => {
  if (!file) return null;
  const isValidType = file.type && ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
  if (!isValidType) {
    return 'الصور الإضافية يجب أن تكون صورة من نوع (JPG, PNG, WEBP).';
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

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderNum, setOrderNum] = useState('');
  const [selectedPkg, setSelectedPkg] = useState(null);

  // Dynamic packages fetched from DB
  const [dbPackages, setDbPackages] = useState([]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .eq('category', 'graduation')
          .eq('is_hidden', false)
          .order('sort_order', { ascending: true });
        
        if (!error && data && data.length > 0) {
          const formatted = data.map(p => ({
            id: String(p.id),
            name: p.title,
            price: Number(p.price),
            icon: '📔',
            features: Array.isArray(p.features) ? p.features : JSON.parse(p.features || '[]'),
            popular: false
          }));
          setDbPackages(formatted);
        } else {
          setDbPackages(DEFAULT_PACKAGES);
        }
      } catch {
        setDbPackages(DEFAULT_PACKAGES);
      }
    };
    fetchPackages();
  }, []);

  useEffect(() => {
    if (dbPackages.length > 0) {
      const pkgParam = searchParams.get('package');
      const found = dbPackages.find(p => String(p.id) === String(pkgParam) || p.price === Number(pkgParam));
      if (found) {
        setSelectedPkg(found);
        setStep(2); // Skip package selection if passed in URL
      } else {
        setSelectedPkg(null);
        setStep(1);
      }
    }
  }, [searchParams, dbPackages]);

  // Auto-scroll to top when step or status changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, success, submitted]);

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
  const [photoPagesQtyInput, setPhotoPagesQtyInput] = useState('0');
  const [photoPagesPreviews, setPhotoPagesPreviews] = useState([]);
  const [photoPagesFiles, setPhotoPagesFiles] = useState([]);
  const [deliverySelected, setDeliverySelected] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [additionalPhone, setAdditionalPhone] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');

  // Helpers for photo pages quantity control ("عدد الصور المطلوبة")
  const handleSetPhotoPagesQty = (newVal) => {
    const q = Math.max(0, newVal);
    setPhotoPagesQty(q);
    setPhotoPagesQtyInput(String(q));
    if (q === 0) {
      setPhotoPagesPreviews([]);
      setPhotoPagesFiles([]);
    } else if (photoPagesFiles.length > q) {
      setPhotoPagesPreviews(photoPagesPreviews.slice(0, q));
      setPhotoPagesFiles(photoPagesFiles.slice(0, q));
    }
  };

  const handleQuantityInputChange = (e) => {
    const val = e.target.value;
    if (val === '') {
      setPhotoPagesQtyInput('');
      return;
    }
    if (!/^\d+$/.test(val)) {
      return;
    }
    const num = parseInt(val, 10);
    handleSetPhotoPagesQty(num);
  };

  const handleQuantityInputFocus = () => {
    if (photoPagesQty === 0) {
      setPhotoPagesQtyInput('');
    }
  };

  const handleQuantityInputBlur = () => {
    if (photoPagesQtyInput === '' || isNaN(parseInt(photoPagesQtyInput, 10))) {
      handleSetPhotoPagesQty(0);
    }
  };

  // Step 5 — Deposit
  const [receiptPreview, setReceiptPreview] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);

  // Errors
  const [errors, setErrors] = useState({});

  /* ── Computed values ─────────────────────────────────────── */
  const stepsList = [
    'اختيار الباقة',
    'معلومات الطالب والطلب',
    'الصور والإضافات',
    'الدفع بالعربون',
    'التأكيد النهائي'
  ];

  const photographicPagesTotal = photoPagesQty * 1;
  const deliveryCost = deliverySelected ? 2 : 0;
  const subtotal = selectedPkg ? (selectedPkg.price + photographicPagesTotal + deliveryCost) : 0;
  const remaining = subtotal - DEPOSIT;

  /* ── Validation per step ─────────────────────────────────── */
  const validate = (checkAll = false) => {
    const e = {};
    const currentStep = checkAll ? 5 : step;

    if (currentStep >= 1) {
      if (!selectedPkg) e.package = 'يرجى اختيار باقة أولاً.';
    }
    if (currentStep >= 2 && selectedPkg) {
      if (!arabicName.trim()) e.arabicName = 'يرجى إدخال الاسم بالعربي.';
      if (!englishName.trim()) e.englishName = 'يرجى إدخال الاسم بالإنجليزي.';
      if (!phone.trim()) e.phone = 'يرجى إدخال رقم الهاتف.';
      if (!university.trim()) e.university = 'يرجى إدخال اسم الجامعة.';
      if (!major.trim()) e.major = 'يرجى إدخال التخصص.';
      if (!extTplNum.trim()) e.extTpl = 'يرجى إدخال رقم قالب الغلاف الخارجي.';
      if (selectedPkg.price === 15 || selectedPkg.price === 18) {
        if (!intTplNum.trim()) e.intTpl = 'يرجى إدخال رقم القالب الداخلي.';
      }
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
    if (currentStep >= 4) {
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

  const nextStep = () => { if (validate()) { setStep((s) => s + 1); } };
  const prevStep = () => { setStep((s) => Math.max(1, s - 1)); };

  const handleSelectPackage = (pkg) => {
    setSelectedPkg(pkg);
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!validate(true)) return;
    setSubmitting(true);
    setSubmitError('');

    try {
      const generatedOrderNum = `IRIS-GRAD-${Date.now().toString().slice(-6)}`;
      setOrderNum(generatedOrderNum);

      // Upload Front Cover
      let frontUrl = null;
      if (frontCoverFile) {
        const path = `front-${Date.now()}-${frontCoverFile.name}`;
        frontUrl = await uploadFile('graduation-orders', path, frontCoverFile);
      }

      // Upload Back Covers
      const backUrls = [];
      if (backCoverFiles && backCoverFiles.length > 0) {
        for (let idx = 0; idx < backCoverFiles.length; idx++) {
          const file = backCoverFiles[idx];
          const path = `back-${Date.now()}-${idx}-${file.name}`;
          const url = await uploadFile('graduation-orders', path, file);
          backUrls.push(url);
        }
      }

      // Upload Internal Images
      const internalUrls = [];
      if (internalFiles && internalFiles.length > 0) {
        for (let idx = 0; idx < internalFiles.length; idx++) {
          const file = internalFiles[idx];
          const path = `internal-${Date.now()}-${idx}-${file.name}`;
          const url = await uploadFile('graduation-orders', path, file);
          internalUrls.push(url);
        }
      }

      // Upload Photo Pages
      const photoUrls = [];
      if (photoPagesFiles && photoPagesFiles.length > 0) {
        for (let idx = 0; idx < photoPagesFiles.length; idx++) {
          const file = photoPagesFiles[idx];
          const path = `photopage-${Date.now()}-${idx}-${file.name}`;
          const url = await uploadFile('graduation-orders', path, file);
          photoUrls.push(url);
        }
      }

      // Upload Receipt
      let receiptUrl = null;
      if (receiptFile) {
        const path = `receipt-${Date.now()}-${receiptFile.name}`;
        receiptUrl = await uploadFile('payment-receipts', path, receiptFile);
      }

      // Serialize Alt Phone and Google Maps Link to Address
      const serializedAddress = deliverySelected
        ? `العنوان بالتفصيل: ${deliveryAddress} | هاتف إضافي للتوصيل: ${additionalPhone || 'لا يوجد'} | رابط خرائط جوجل: ${googleMapsLink || 'لا يوجد'}`
        : '';

      const { error } = await supabase
        .from('graduation_orders')
        .insert({
          order_number: generatedOrderNum,
          package_name: selectedPkg.name,
          package_price: selectedPkg.price,
          arabic_name: arabicName.trim(),
          english_name: englishName.trim(),
          phone: phone.trim(),
          university: university.trim(),
          major: major.trim(),
          custom_dedication: customDedication.trim(),
          external_template_number: extTplNum,
          internal_template_number: intTplNum,
          front_cover_url: frontUrl,
          back_cover_urls: backUrls,
          internal_image_urls: internalUrls,
          photographic_pages_quantity: photoPagesQty,
          photographic_pages_urls: photoUrls,
          photographic_pages_total: photographicPagesTotal,
          delivery_selected: deliverySelected,
          delivery_address: serializedAddress,
          delivery_cost: deliveryCost,
          subtotal: subtotal,
          deposit_amount: DEPOSIT,
          remaining_amount: remaining,
          receipt_url: receiptUrl,
          status: 'pending'
        });

      if (error) throw error;

      setSubmitted(true);
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || 'حدث خطأ أثناء حفظ الطلب. الرجاء المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Render steps ────────────────────────────────────────── */
  const renderStep = () => {
    /* STEP 1 — Choose Package */
    if (step === 1) return (
      <div className="grad-order-card">
        <div className="grad-card-title">
          <span className="grad-card-title-icon">🎁</span>
          اختر باقتك
        </div>
        <p className="grad-card-desc">حدد باقة دفتر التخرج التي تناسب احتياجاتك للمتابعة.</p>

        <div className="grad-packages-grid">
          {(dbPackages.length > 0 ? dbPackages : DEFAULT_PACKAGES).map((pkg) => (
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

    /* STEP 2 — Customer & Template Info */
    if (step === 2) return (
      <div className="grad-order-card">
        <div className="grad-card-title">
          <span className="grad-card-title-icon">👤</span>
          معلومات الطالب والطلب
        </div>
        <p className="grad-card-desc">البيانات التي ستطبع على الدفتر وتستخدم للتواصل.</p>

        <div className="grad-form-grid">
          <div className="grad-field">
            <label className="grad-label">الاسم الكامل بالعربي <span className="grad-required">*</span></label>
            <input type="text" className={`grad-input${errors.arabicName ? ' error' : ''}`} placeholder="الاسم الكامل بالعربي" value={arabicName} onChange={(e) => setArabicName(e.target.value)} />
            {errors.arabicName && <div className="grad-error-msg">⚠️ {errors.arabicName}</div>}
          </div>
          <div className="grad-field">
            <label className="grad-label">الاسم الكامل بالإنجليزي <span className="grad-required">*</span></label>
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

          <div className="grad-field full" style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
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

    /* STEP 3 — Photos, Add-ons & Delivery */
    if (step === 3) return (
      <div className="grad-order-card">
        <div className="grad-card-title"><span className="grad-card-title-icon">🖼️</span> الصور والإضافات والتوصيل</div>
        
        {/* Photos Upload Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 32 }}>
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

        {/* Add-on quantity section */}
        <div style={{ borderTop: '1px solid #eee', paddingTop: 24, marginBottom: 32 }}>
          <h4 style={{ marginBottom: 16 }}>الصور الفوتوغرافية داخل الدفتر (1 JOD لكل صورة إضافية)</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <label className="grad-label" style={{ margin: 0 }}>عدد الصور المطلوبة:</label>
            <div className="qty-control">
              <button
                type="button"
                className="qty-btn"
                onClick={() => handleSetPhotoPagesQty(Math.max(0, photoPagesQty - 1))}
              >
                −
              </button>
              <input
                type="text"
                className="qty-val-input"
                style={{ width: 60, textAlign: 'center', border: 'none', outline: 'none', fontWeight: 'bold', background: 'transparent' }}
                value={photoPagesQtyInput}
                onChange={handleQuantityInputChange}
                onFocus={handleQuantityInputFocus}
                onBlur={handleQuantityInputBlur}
              />
              <button
                type="button"
                className="qty-btn"
                onClick={() => handleSetPhotoPagesQty(photoPagesQty + 1)}
              >
                +
              </button>
            </div>
          </div>

          {photoPagesQty > 0 && (
            <div style={{ background: '#f9f9f9', padding: 16, borderRadius: 8, border: '1px solid #ddd', marginBottom: 16 }}>
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

        {/* Delivery Details */}
        <div style={{ borderTop: '1px solid #eee', paddingTop: 24 }}>
          <h4 style={{ marginBottom: 16 }}>طريقة الاستلام والتوصيل</h4>
          <div className="delivery-cards-grid">
            <div
              className={`delivery-card${!deliverySelected ? ' selected' : ''}`}
              onClick={() => { setDeliverySelected(false); setErrors(prev => ({ ...prev, address: '' })); }}
            >
              <div className="delivery-card-icon">🏬</div>
              <div className="delivery-card-title">الاستلام من الاستوديو</div>
              <div className="delivery-card-desc">مجاناً — إربد، مجمع الخضر</div>
            </div>
            <div
              className={`delivery-card${deliverySelected ? ' selected' : ''}`}
              onClick={() => setDeliverySelected(true)}
            >
              <div className="delivery-card-icon">🚚</div>
              <div className="delivery-card-title">توصيل لكافة المحافظات</div>
              <div className="delivery-card-desc">+2 JOD لجميع أنحاء المملكة</div>
            </div>
          </div>

          {deliverySelected && (
            <div className="delivery-info-group">
              <div className="grad-field full">
                <label className="grad-label">عنوان التوصيل بالتفصيل <span className="grad-required">*</span></label>
                <textarea
                  className={`grad-textarea${errors.address ? ' error' : ''}`}
                  style={{ minHeight: '120px' }}
                  placeholder="يرجى كتابة العنوان بالتفصيل: المحافظة، المنطقة، اسم الشارع، رقم العمارة والشقة..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                />
                {errors.address && <div className="grad-error-msg">⚠️ {errors.address}</div>}
              </div>
              <div className="grad-field full" style={{ marginTop: 16 }}>
                <label className="grad-label">رقم الهاتف الإضافي (اختياري)</label>
                <input
                  type="tel"
                  className="grad-input"
                  placeholder="رقم هاتف إضافي للتواصل عند التوصيل..."
                  value={additionalPhone}
                  onChange={(e) => setAdditionalPhone(e.target.value)}
                />
              </div>
              <div className="grad-field full" style={{ marginTop: 16 }}>
                <label className="grad-label">موقع خرائط جوجل (اختياري)</label>
                <input
                  type="text"
                  className="grad-input"
                  placeholder="رابط موقعك من خرائط جوجل..."
                  value={googleMapsLink}
                  onChange={(e) => setGoogleMapsLink(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );

    /* STEP 4 — Dedicated Payment Step */
    if (step === 4) return (
      <div className="grad-order-card">
        <div className="grad-card-title"><span className="grad-card-title-icon">💳</span> الدفع بالعربون</div>
        <p className="grad-card-desc">تحويل العربون المطلوب بقيمة {DEPOSIT} JOD لتفعيل الطلب.</p>

        <div className="grad-deposit-block" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ background: 'var(--g-bg)', padding: '12px 24px', borderRadius: 8, minWidth: 150 }}>
              <div style={{ fontWeight: 'bold', color: 'var(--g-purple)' }}>CliQ</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '4px 0', color: 'var(--g-green)' }}>iris0</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>المستلم: Hamzah Bani Domi</div>
            </div>
            <div style={{ background: 'var(--g-bg)', padding: '12px 24px', borderRadius: 8, minWidth: 150 }}>
              <div style={{ fontWeight: 'bold', color: '#f16e00' }}>Orange Money</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '4px 0', color: 'var(--g-green)' }}>0797303260</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>المستلم: Hamzah Bani Domi</div>
            </div>
          </div>
          <div style={{ textAlign: 'right', background: '#fff', padding: 20, borderRadius: 12, border: '2px dashed var(--g-purple)' }}>
            <SingleImageUpload 
              label="إرفاق لقطة شاشة وصل التحويل" 
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
      </div>
    );

    /* STEP 5 — Reduced Confirmation Page */
    if (step === 5) return (
      <div className="grad-summary-wrap">
        <div className="grad-summary" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="grad-summary-header"><h3>تأكيد الطلب النهائي</h3></div>
          <div className="grad-summary-body" style={{ padding: '20px' }}>
            {[
              { key: 'الاسم بالعربي', val: arabicName },
              { key: 'الباقة المختارة', val: selectedPkg?.name },
              { key: 'قالب الغلاف الخارجي', val: `رقم #${extTplNum}` },
              intTplNum && { key: 'قالب الورق الداخلي', val: `رقم #${intTplNum}` },
              photoPagesQty > 0 && { key: 'الصور الفوتوغرافية الإضافية', val: `${photoPagesQty} صورة` },
              { key: 'إجمالي الطلب', val: `${subtotal} JOD` }
            ].filter(Boolean).map((row, i) => (
              <div key={i} className="grad-summary-row" style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed #eee' }}>
                <span className="grad-summary-key" style={{ color: '#666' }}>{row.key}</span>
                <span className="grad-summary-val" style={{ fontWeight: 'bold' }}>{row.val}</span>
              </div>
            ))}

            <div className="grad-summary-total" style={{ marginTop: '16px', background: '#fcfcfc', padding: '12px', borderRadius: '8px' }}>
              <div className="grad-summary-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem' }}>
                <span className="grad-summary-key">إجمالي التكلفة</span>
                <span className="grad-summary-val grad-highlight-val" style={{ color: 'var(--g-purple)', fontWeight: '900' }}>{subtotal} JOD</span>
              </div>
            </div>

            {submitError && (
              <div style={{ margin: '16px 0 0', background: '#FDEDEC', border: '1px solid #E74C3C', padding: '12px 16px', borderRadius: 8, color: '#C0392B', fontWeight: 'bold', fontSize: '0.95rem', textAlign: 'right' }}>
                ⚠️ {submitError}
              </div>
            )}
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
            {photoPagesQty > 0 && (<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><strong>الصور الإضافية:</strong> <span>{photoPagesQty}</span></div>)}
            <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '16px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><strong>الإجمالي:</strong> <span>{subtotal} JOD</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><strong>العربون:</strong> <span style={{ color: 'var(--g-gold)' }}>5 JOD</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}><strong>المبلغ المتبقي:</strong> <span style={{ color: 'var(--g-green)', fontWeight: 800 }}>{remaining} JOD</span></div>
          </div>

          <div className="no-print" style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <button className="grad-btn-submit" style={{ width: 'auto', padding: '12px 32px' }} onClick={() => window.print()}>🖨️ طباعة الفاتورة</button>
            <Link to="/" className="grad-hero-btn" style={{ padding: '12px 32px' }}>العودة للرئيسية</Link>
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
          <div key={i} className={`grad-step-item${step === i + 1 ? ' active' : step > i + 1 ? ' done' : ''}`}>
            <div className="grad-step-num">{step > i + 1 ? '✓' : i + 1}</div>
            <span className="grad-step-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="grad-order-body no-print">
        {renderStep()}
        <div className="grad-order-actions">
          {step > 1 && (<button className="grad-btn-prev" onClick={prevStep}>السابق</button>)}
          {step < stepsList.length && (
            <button
              className="grad-btn-next"
              onClick={nextStep}
              style={{ marginRight: 'auto' }}
            >
              التالي
            </button>
          )}
          {step === stepsList.length && (
            <button
              className="grad-btn-success"
              onClick={handleSubmit}
              disabled={submitting}
              style={{ marginRight: 'auto', background: 'var(--g-green)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 24px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {submitting ? '⏳ جاري الإرسال...' : 'تأكيد الحجز النهائي ✓'}
            </button>
          )}
        </div>
      </div>
    </main>
  );
};

export default GraduationBookOrder;