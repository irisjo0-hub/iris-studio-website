# IRIS EXPERIENCE BLUEPRINT

> المرجع الإبداعي الأعلى لتصميم وتجربة مستخدم استوديو آيرس الإبداعي (IRIS Creative Studio).

---

## 1. فلسفة البراند وشخصية IRIS (Brand Identity & Personality)

IRIS ليست مجرد استوديو تصوير تقليدي، بل هي تجربة بصرية متكاملة تقوم على ثلاثة ركائز أساسية:
* **Creative Studio (استوديو إبداعي)**: يبتكر القصة البصرية ولا يكتفي بلقطها.
* **Luxury Brand (علامة تجارية فاخرة)**: الدقة والأناقة في أدق التفاصيل البصرية والتفاعلية.
* **Premium Experience (تجربة استثنائية)**: تبدأ من أول ثانية يفتح فيها الزائر الموقع وترافقه حتى مغادرته.

---

## 2. هيكل المشاهد وتدفق القصة (Story Flow & Scenes)

الموقع ليس عبارة عن صفحات تقليدية منفصلة، بل هو **فيلم سينمائي متكامل** ينساب عبر الفصول التالية:

```mermaid
graph TD
    subgraph ACT I: Opening (البداية والتمهيد)
        Scene1[Scene 1: Preloader - Opening Sequence]
        Scene2[Scene 2: Hero Reveal - ظهور المشهد]
        Scene3[Scene 3: Hero Camera - تحرك الكاميرا]
        Scene4[Scene 4: Hero Identity - شفرة الهوية]
        Scene5[Scene 5: Hero Exit - مغادرة المشهد]
        Scene1 --> Scene2 --> Scene3 --> Scene4 --> Scene5
    end

    subgraph ACT II: Brand Story (بيان الهوية)
        Scene6[Scene 6: Brand Manifesto - We Break The Box]
        Scene7[Scene 7: Creative Studio Scene]
        Scene8[Scene 8: Luxury Brand Scene]
        Scene9[Scene 9: Premium Experience Scene]
        Scene5 --> Scene6 --> Scene7 --> Scene8 --> Scene9
    end

    subgraph ACT III: Trust & Art (معرض الثقة)
        Scene10[Scene 10: Cinematic Portfolio]
        Scene11[Scene 11: Clients & Reviews]
        Scene9 --> Scene10 --> Scene11
    end

    subgraph ACT IV: Services (الخدمات التفاعلية)
        Scene12[Scene 12: Interactive Services Story]
        Scene11 --> Scene12
    end

    subgraph ACT V: Experience (الحجز والمخرجات)
        Scene13[Scene 13: Graduation Experience]
        Scene14[Scene 14: Printing Experience]
        Scene15[Scene 15: Premium Booking Experience]
        Scene12 --> Scene13 --> Scene14 --> Scene15
    end

    subgraph ACT VI: Closing (المغادرة والختام)
        Scene16[Scene 16: Cinematic CTA & Footer]
        Scene15 --> Scene16
    end
```

---

## 3. التوجه الفني وقواعد الـ Layout (Art Direction & Editorial Layout)

* **Poster Composition**: معاملة الشاشة كملصق فني متكامل يجمع النص والميديا ككتلة واحدة وليس كعمودين منفصلين.
* **Editorial Composition & Magazine Layout**: استعارة هندسة المجلات الفاخرة التي تعتمد على إبراز العناوين وتناغم الكتل البصرية.
* **Negative Space**: استخدام المساحات الفارغة بذكاء لتوجيه عين المستخدم وإعطاء العناصر مساحة لتتنفس.
* **Strong Hierarchy**: تفاوت واضح وصريح في حجم الخطوط والعناصر لإنشاء مسار بصري منطقي.

---

## 4. نظام الشبكة التحليلية (12-Column Editorial Grid System)

* **12 Column Editorial Grid**: تصميم الواجهات كافة بالاعتماد على شبكة تحريرية دقيقة من 12 عموداً.
* **Vertical Rhythm & Baseline Grid**: ضبط المسافات العمودية والسطور وفق شبكة خط أساسية لضمان الاتساق البصري التام.
* **Large Whitespace & Dynamic Alignment**: مساحات بيضاء ديناميكية ومدروسة تفصل بين الكتل الأساسية، وتمنع تراكم المكونات.

---

## 5. نظام الخطوط والكتابة البصرية (Typography System)

* الخط في IRIS هو **عنصر تصميم أساسي مبني بذاته**، وليس مجرد وسيلة لنقل المعلومات.
* **Contrast & Styling**: 
  * دمج متناغم بين الخطوط العريضة والمخططة المفرغة (`text-outline`) لكسر الملل البصري.
  * احترام تام لتراكيب الخط العربي الجمالية وتجنب تداخل الحروف أو تشويهها بالمسافات السالبة العشوائية.
  * هيكلية واضحة وأحجام متباينة للعناوين، الفقرات، الملصقات، الأرقام، الأزرار، والروابط.

---

## 6. نظام الحركة (Motion System DNA)

* لا نستخدم تأثيرات الاختفاء والظهور البسيطة (`Fade`).
* **Motion DNA**: الحركات في الموقع تعتمد على الزنبركات الفيزيائية الثقيلة والمرنة (`Springs`) لتعكس إحساس الرقي والوزن.
* الحركات منسجمة بالكامل عبر الموقع في:
  * التحويم (Hover)
  * التمرير (Scroll)
  * الظهور (Reveal)
  * الانتقالات (Transitions)
  * تفاعل المؤشرات والأزرار والبطاقات.

---

## 7. لغة التمرير والعمق (Scroll Storytelling & Layer System)

* التمرير يتحكم في **حركة الكاميرا البصرية** عبر فضاء ثلاثي الأبعاد، وليس سحب صفحات رأسية تقليدية.
* **7-Layer Composition**: كل مشهد يتألف من الطبقات التالية متراصة بعمق:
  1. Background Canvas (خلفية البراند الفاتحة)
  2. Film Noise Texture (تأثير حبيبات الفيلم السينمائي)
  3. Structural Grid (شبكة خطوط تحريرية بوضوح خافت 6%)
  4. Ambient Spotlight Glows (الإضاءات الجانبية المتنفسة ببطء)
  5. Background Media (الفيديو أو الصورة الأساسية بالعمق)
  6. Typography (نصوص العناوين والفقرات)
  7. Foreground Media & Interaction Layer (العناصر المنبثقة للأمام مع ظلال العمق والمؤشر التفاعلي)

---

## 8. محرك الإضاءة والتفاعل (Lighting Engine & Cursor)

* **Lighting Engine**: إضاءات جانبية متحركة ببطء شديد تحاكي استوديو التصوير الحقيقي (Purple & Gold).
* **Directional Shadows**: إلقاء ظلال عميقة خفيفة من العناصر الأمامية على الخلفيات والنصوص لتوليد البعد الثالث.
* **Premium Cursor**: مؤشر مساعد ذكي ينجذب مغناطيسياً للأزرار، ويستعرض الصور والفيديوهات عند التحويم، ويتفاعل بتأثير التشويه الإبداعي للنصوص.

---

## 9. الميزانية الأدائية والممنوعات (Performance Budget & Never Do List)

### Performance Budget
* الحفاظ على معدل إطارات ثابت **60 FPS** طوال حركة التصفح.
* عدم تفعيل معالجات الحركة الثقيلة أثناء التمرير النشط إلا في حالة إدراجها في مسار كرت الشاشة (GPU Accelerated).

### قائمة الممنوعات (Never Do List)
* [ ] **ممنوع تماماً** استخدام ألوان سوداء أو داكنة عشوائية تخرج عن الهوية البصرية للبراند (الخلفية الرسمية هي البيج الفاخر `#ECEBE7`).
* [ ] **ممنوع تماماً** استخدام وسم أو أشكال زينة SVG عشوائية أو جرافيك وهمي لا يمثل البراند.
* [ ] **ممنوع تماماً** استخدام عناصر تفاعلية جاهزة أو حركات اهتزازية عشوائية تشتت البصر.
* [ ] **ممنوع تماماً** تشتيت هوية IRIS كـ Creative Studio ووصفها كاستوديو تصوير تقليدي.
