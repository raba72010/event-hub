-- ════════════════════════════════════════════════════════════════════
-- DEMO MEMBERS for the Member Directory
-- ════════════════════════════════════════════════════════════════════
-- Purpose: Populate the /members directory with realistic demo profiles.
-- Run AFTER 2026-05-10_member_directory.sql (the schema migration).
--
-- The public.profiles table normally has a FK to auth.users(id), which
-- means each profile must correspond to a real signed-up user. For demo
-- data we drop that FK temporarily and re-add it after seeding so future
-- real signups still work correctly.
--
-- To remove these demo members later:
--   delete from public.profiles where email like '%@example.spc.sd';
-- ════════════════════════════════════════════════════════════════════

-- Drop FK constraint so we can insert profiles that aren't tied to auth.users
alter table public.profiles drop constraint if exists profiles_id_fkey;

-- Insert demo members
insert into public.profiles (
  id, full_name, email, title, company, bio, location, community,
  availability, is_public, role, updated_at
) values
  (
    gen_random_uuid(),
    'د. أحمد كمال',
    'ahmed.kamal@example.spc.sd',
    'مدرب مهني | استشارات موارد بشرية',
    'استشارات مستقلة',
    'متخصص في تطوير المسارات المهنية والتدريب الإداري بخبرة عملية تفوق 12 عاماً في بناء قدرات المحترفين السودانيين والقيادات الناشئة.',
    'الرياض، السعودية',
    'strategic-planning',
    'active',
    true,
    null,
    now()
  ),
  (
    gen_random_uuid(),
    'م. سارة إدريس',
    'sara.idris@example.spc.sd',
    'مهندسة نظم معلومات',
    'شركة أرامكو الرقمية',
    'مهندسة نظم وأمن سيبراني، تعمل على تصميم بنى تحتية رقمية آمنة لمؤسسات حكومية وقطاع خاص.',
    'جدة، السعودية',
    'data-science',
    'active',
    true,
    null,
    now()
  ),
  (
    gen_random_uuid(),
    'م. محمد يوسف',
    'mohamed.yousef@example.spc.sd',
    'استشاري تطوير أعمال',
    'مكتب يوسف للاستشارات',
    'يقدم استشارات تطوير الأعمال والتحول الاستراتيجي للشركات الناشئة والمتوسطة، مع تركيز على السوق الخليجي.',
    'الدمام، السعودية',
    'project-management',
    'busy',
    true,
    null,
    now()
  ),
  (
    gen_random_uuid(),
    'د. منى عبدالله',
    'mona.abdullah@example.spc.sd',
    'طبيبة أطفال — استشارية',
    'مستشفى الملك فهد',
    'استشارية طب الأطفال وحديثي الولادة، عضوة في الجمعية الأمريكية لطب الأطفال، شغوفة برفع جودة الرعاية الصحية.',
    'الخرطوم، السودان',
    'healthcare',
    'available',
    true,
    null,
    now()
  ),
  (
    gen_random_uuid(),
    'م. الصادق قرشي',
    'sadiq.qureshi@example.spc.sd',
    'شريك ومسؤول عمليات',
    'شركة Amazing CV',
    'خبير في كتابة السير الذاتية المهنية والاستشارات للخريجين الجدد، أكثر من 11 عاماً في مجالات السيارات والنفط والغاز وإدارة المرافق.',
    'مكة المكرمة، السعودية',
    'strategic-planning',
    'active',
    true,
    null,
    now()
  ),
  (
    gen_random_uuid(),
    'م. محمد عكود',
    'mohamed.akoud@example.spc.sd',
    'مدير منتجات تقنية في Verizon',
    'Verizon',
    'متخصص في الذكاء الاصطناعي وعلم البيانات. ماجستير هندسة برمجيات (Kennesaw)، حاصل على شهادات PMP, SAFe, CCNA, Google AI.',
    'فلوريدا، الولايات المتحدة',
    'ai',
    'active',
    true,
    null,
    now()
  ),
  (
    gen_random_uuid(),
    'م. أبوبكر سامي علي',
    'abubaker.sami@example.spc.sd',
    'مدرب إدارة مشاريع معتمد',
    'Milestone',
    'مدرب معتمد في إدارة المشاريع، حاصل على PFMP, PgMP, PMP, PMI-RMP, PMI-SP، يقدم برامج تأهيل لشهادات PMI لأعضاء النادي.',
    'الخرطوم، السودان',
    'project-management',
    'active',
    true,
    null,
    now()
  ),
  (
    gen_random_uuid(),
    'د. صفوة العجب',
    'safwa.elagab@example.spc.sd',
    'خبيرة المشاريع الاحترافية',
    'مستقلة',
    'دكتوراة في إدارة المشاريع، حاصلة على PhD, MSc, MBA, BSc, PMP, PMI-ACP, PMI-PBA, P3O, DASM, 6 Sigma، تركز على المنهجيات الرشيقة.',
    'الخرطوم، السودان',
    'project-management',
    'active',
    true,
    null,
    now()
  ),
  (
    gen_random_uuid(),
    'م. مبارك عبدالفتاح',
    'mubarak.abdelfattah@example.spc.sd',
    'مهندس بيانات',
    'مكتب البحوث',
    'يعمل على تصميم بنى تحليل البيانات الكبيرة لمؤسسات بحثية، محاضر سابق في مادة بناء الهوية المهنية للمحترفين الناشئين.',
    'القاهرة، مصر',
    'data-science',
    'available',
    true,
    null,
    now()
  ),
  (
    gen_random_uuid(),
    'م. أبايزيد السماني',
    'abuyazid.sammani@example.spc.sd',
    'مهندس برمجيات',
    'مستقل',
    'مهندس برمجيات تركز خبرته على تطبيقات الويب والذكاء الاصطناعي التطبيقي، يساهم في تنظيم الجلسات الشهرية للنادي.',
    'الدوحة، قطر',
    'ai',
    'active',
    true,
    null,
    now()
  ),
  (
    gen_random_uuid(),
    'م. دعاء قنديل',
    'doaa.qandeel@example.spc.sd',
    'مصممة تجربة مستخدم',
    'Studio Q Design',
    'مصممة UX تركز على تصميم منتجات تواكب احتياجات المستخدم العربي، عضوة فعّالة في فعاليات النادي ومدربة في ورش بناء الهوية.',
    'الخرطوم، السودان',
    'strategic-planning',
    'busy',
    true,
    null,
    now()
  ),
  (
    gen_random_uuid(),
    'سليمان فيصل',
    'suleiman.faisal@example.spc.sd',
    'متخصص جودة وتجربة عملاء (CX)',
    'مجموعة الاتصالات السعودية',
    'يعمل على تطوير برامج إدارة جودة تجربة العملاء، قدّم أمسية النادي حول رحلة الجودة والتميز والتمركز حول العميل.',
    'الرياض، السعودية',
    'tqm',
    'active',
    true,
    null,
    now()
  );

-- ⚠️ Optional: re-add the FK constraint with cascade behaviour.
-- Uncomment if you want auth.users → profile cascade on delete (recommended for production):
--
-- alter table public.profiles
--   add constraint profiles_id_fkey
--   foreign key (id) references auth.users (id) on delete cascade;
--
-- ⚠️ NOTE: re-adding the FK will FAIL because the demo profile ids don't exist
-- in auth.users. Either keep the FK off while demoing, or delete the demo
-- profiles first:
--   delete from public.profiles where email like '%@example.spc.sd';
