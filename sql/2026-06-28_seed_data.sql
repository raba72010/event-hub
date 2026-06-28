-- ════════════════════════════════════════════════════════════════════
-- PLATFORM SEED DATA (2026-06-28)
-- ════════════════════════════════════════════════════════════════════
-- Purpose: Clean and seed documents and media_articles tables with demo data.
-- ════════════════════════════════════════════════════════════════════

-- 1. Clean existing records to avoid duplicates
delete from public.documents;
delete from public.media_articles;

-- 2. Seed Documents Table
insert into public.documents (
  title_ar, title_en, description_ar, description_en, category, file_size, download_url
) values 
  (
    'تقرير الآفاق الاقتصادية السودانية 2026',
    'Sudanese Economic Outlook Report 2026',
    'دراسة تحليلية شاملة للآفاق الاقتصادية ومسارات التعافي التنموي والفرص المتاحة للمؤسسات والشركات الناشئة.',
    'A comprehensive analytical study of economic prospects, recovery pathways, and opportunities for startups.',
    'research',
    '3.2 MB',
    '#'
  ),
  (
    'الدليل الإرشادي للهندسة البرمجية المستدامة',
    'Sustainable Software Engineering Guidelines',
    'معايير تصميم وتطوير تطبيقات برمجية مستدامة تراعي كفاءة استهلاك الموارد وحماية البيانات.',
    'A standards guide for designing and developing sustainable software applications, focusing on resource efficiency and data security.',
    'books',
    '4.5 MB',
    '#'
  ),
  (
    'ورقة عمل: التحول الرقمي في القطاع الصحي',
    'Worksheet: Digital Transformation in Healthcare',
    'خارطة طريق مبسطة لتطبيقات السجلات الصحية الإلكترونية والاستشارات الطبية عن بعد في البيئات منخفضة الموارد.',
    'A simplified roadmap for electronic health records and telemedicine deployments in resource-constrained environments.',
    'worksheets',
    '1.8 MB',
    '#'
  ),
  (
    'أساسيات الذكاء الاصطناعي للمديرين والقياديين',
    'AI Basics for Managers and Leaders',
    'دليل عملي لتطبيقات التعلم الآلي ونماذج اللغة الكبيرة في اتخاذ القرارات وحوكمة المشروعات المهنية.',
    'A practical guide to machine learning and LLM applications in decision-making and professional project governance.',
    'books',
    '2.7 MB',
    '#'
  );

-- 3. Seed Media Articles Table
insert into public.media_articles (
  title_ar, title_en, summary_ar, summary_en, content_ar, content_en, type, image_url, video_url
) values
  (
    'نادي المحترفين السودانيين يطلق شراكة استراتيجية مع حاضنات تقنية دولية',
    'Sudanese Professionals Club Launches Strategic Partnership with International Tech Incubators',
    'أعلن النادي اليوم عن شراكة استراتيجية مع مسرعات وحاضنات تقنية لتقديم برامج تأهيل وتدريب متقدمة للأعضاء.',
    'The club announced today a strategic partnership with tech accelerators to provide advanced training and mentoring.',
    'أعلن النادي رسمياً عن إطلاق شراكة استراتيجية موسعة تهدف إلى ربط المبتكرين السودانيين بشبكات تمويل وتأهيل دولية لتسريع وتيرة التحول الرقمي ونمو الشركات الناشئة.',
    'The club officially announced a strategic partnership to connect Sudanese innovators with international funding and acceleration networks to promote digital growth.',
    'news',
    null,
    null
  ),
  (
    'تغطية مصورة: ورشة عمل أساسيات الحوسبة السحابية',
    'Photo Gallery: Cloud Computing Basics Workshop',
    'صور وتغطيات مرئية للقاء التفاعلي الذي أقيم بحضور 120 مشاركاً من المحترفين ومهندسي النظم.',
    'Visual coverage and photos from the interactive session attended by 120 cloud professionals and systems engineers.',
    'شهدت قاعات النادي إقبالاً كبيراً في ورشة العمل التفاعلية التي غطت ممارسات التحول السحابي وتطبيق إستراتيجيات الخصوصية وإدارة الموارد السحابية بكفاءة عالية.',
    'The workshop received high attendance, covering cloud migration, performance optimization, and data protection strategies.',
    'gallery',
    null,
    null
  ),
  (
    'حفل الاستقبال السنوي للمحترفين الجدد',
    'Annual Welcoming Ceremony for New Members',
    'فيديو مسجل يوثق الكلمات الافتتاحية والمناقشات الثنائية التي جرت خلال حفل التعارف السنوي.',
    'Recorded video covering opening remarks and networking discussions during the annual networking event.',
    'فيديو يوثق الحفل التعريفي للأعضاء الجدد واستعراض الفرص المستقبلية في مسارات الأنشطة ولجان التخصص المختلفة بالنادي.',
    'A video documenting the welcome speech, group photos, and introductory panels for our new professional members.',
    'video',
    null,
    '#'
  );
