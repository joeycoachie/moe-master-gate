// Copy for the Kinetic Studio OS sales page, in four languages. English is the source and is
// checked against the SYS-D028 Plain Language lexicon (archive: `npm run gate`). The other
// languages are translations of it; have a native speaker check them before heavy promotion.

export type Lang = 'en' | 'zh' | 'ms' | 'fr';

export const LANGS: { code: Lang; label: string; html: string }[] = [
  { code: 'en', label: 'English', html: 'en' },
  { code: 'zh', label: '中文', html: 'zh-Hans' },
  { code: 'ms', label: 'Bahasa Melayu', html: 'ms' },
  { code: 'fr', label: 'Français', html: 'fr' },
];

type Card = { title: string; text: string };
type Offer = { name: string; price: string; terms: string; items: string[] };

export type Copy = {
  nav: { cta: string; language: string };
  hero: { eyebrow: string; title: string; sub: string; cta: string; secondary: string };
  problem: { title: string; items: string[] };
  what: { title: string; cards: Card[] };
  proof: { title: string; text: string };
  how: { title: string; steps: Card[] };
  offer: { title: string; note: string; cards: Offer[]; currency: string };
  fit: { title: string; yesTitle: string; yes: string[]; noTitle: string; no: string[] };
  close: { title: string; text: string; cta: string };
};

const SUBJECT = 'Kinetic Studio OS';

export const CONTACT_EMAIL = 'themoegroup@gmail.com';
export const contactHref = (lang: Lang) => `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`${SUBJECT} · 15-minute call (${lang.toUpperCase()})`)}`;

export const COPY: Record<Lang, Copy> = {
  en: {
    nav: { cta: 'Book a 15-minute call', language: 'Language' },
    hero: {
      eyebrow: 'Kinetic Studio OS · For Pilates and movement studios',
      title: 'The system behind every studio that takes the body seriously.',
      sub: 'Your best programme, taught the same way by every instructor. Every client’s progress on record. Less guesswork on the floor.',
      cta: 'Book a 15-minute call',
      secondary: 'See what’s included',
    },
    problem: {
      title: 'Where studios lose money',
      items: [
        'The owner checks every class, because the standard lives in one person’s head.',
        'Instructors teach the same client in different ways.',
        'Client progress sits in chats and spreadsheets, so nobody sees the full picture.',
        'Clients with pain get guesswork. Some leave. Some get hurt.',
        'Senior staff spend their hours on admin instead of coaching.',
      ],
    },
    what: {
      title: 'What your studio gets',
      cards: [
        { title: 'Class programmes, week by week', text: 'Programmes for posture, shoulders, hips and knees. Every class shows each station, the cues and the safety checks. One switch adapts every exercise for wrist, grip or knee limits.' },
        { title: 'A record for every client', text: 'Instructors tick what each client did and note what changed. Every session lands on that client’s timeline.' },
        { title: 'A portal for your clients', text: 'Each client gets a personal code to see their own sessions and progress. It keeps them close to their results between visits.' },
        { title: 'One standard for every instructor', text: 'Class plans, availability and quality checks in one place. New instructors learn your standard, not their old habits.' },
        { title: 'A clear view for the owner', text: 'Rosters, class logs and audit notes on one screen. You stop checking every class in person.' },
      ],
    },
    proof: {
      title: 'Built inside a working studio',
      text: 'Kinetic Studio OS was built and run inside a 24-bed studio from May to September 2026. A client case study on our Shoulder Frame Programme is being recorded now. It will be published in December 2026.',
    },
    how: {
      title: 'How the 90 days run',
      steps: [
        { title: 'Install', text: 'We set up the system for your studio and load your classes onto our programmes.' },
        { title: 'Train', text: 'Your instructors learn the programmes, the safety checks and the client record.' },
        { title: 'Check', text: 'We watch live classes, give each instructor clear feedback and fix what needs fixing.' },
      ],
    },
    offer: {
      title: 'The offer',
      note: 'The system runs while the licence is active. Setup and licence are always sold together.',
      currency: 'Prices in Malaysian ringgit.',
      cards: [
        { name: '90-Day Setup', price: 'RM 9,000', terms: 'One time. Half is paid before day 1.', items: ['System installed for your studio', 'Your classes loaded onto our programmes', 'Instructor training', 'First round of quality checks'] },
        { name: 'Studio Licence', price: 'RM 1,200 / month', terms: 'Required. 12-month minimum.', items: ['Hosting, updates and support', 'Every programme, plus new weeks as they release', 'Client records and the client portal', 'Owner view and instructor tools'] },
        { name: 'Floor Command', price: 'RM 2,000 / month', terms: 'Optional. Add or drop any month.', items: ['On-site floor checks every two weeks', 'Live class audits for each instructor', 'New programming every month'] },
      ],
    },
    fit: {
      title: 'Is it right for your studio?',
      yesTitle: 'A good fit',
      yes: ['You want every instructor teaching to one standard.', 'You make decisions from what you can measure.', 'You want clients to see their own progress.'],
      noTitle: 'Not a fit',
      no: ['You want a cheap app that runs itself.', 'You expect the software free after setup.', 'You are not ready to set a standard and hold your team to it.'],
    },
    close: {
      title: 'Start with a 15-minute call',
      text: 'We look at how your studio runs today. Then we tell you honestly if this fits.',
      cta: 'Book a 15-minute call',
    },
  },

  zh: {
    nav: { cta: '预约 15 分钟通话', language: '语言' },
    hero: {
      eyebrow: 'Kinetic Studio OS · 专为普拉提与运动工作室打造',
      title: '为每一间认真对待身体的工作室提供背后的系统。',
      sub: '把您最好的课程，交给每一位教练以同一标准执行。每位学员的进展都有记录。课堂上少一些猜测。',
      cta: '预约 15 分钟通话',
      secondary: '查看包含内容',
    },
    problem: {
      title: '工作室在哪里流失收入',
      items: [
        '老板必须亲自盯每一堂课，因为标准只存在于一个人的脑中。',
        '不同教练用不同方式教同一位学员。',
        '学员进展散落在聊天记录和表格里，没有人看到完整情况。',
        '有疼痛的学员只能靠猜。有人离开，有人受伤。',
        '资深员工把时间花在行政上，而不是教学。',
      ],
    },
    what: {
      title: '您的工作室将获得',
      cards: [
        { title: '逐周课程方案', text: '针对体态、肩部、髋部与膝部的课程。每堂课列出每个站点、提示语与安全检查。一个开关即可为手腕、握力或膝部受限的学员调整所有动作。' },
        { title: '每位学员的完整记录', text: '教练勾选学员完成的内容，并记录调整之处。每一堂课都会进入该学员的时间线。' },
        { title: '学员专属入口', text: '每位学员获得个人代码，可查看自己的课程与进展。让他们在两次上课之间也能看见成果。' },
        { title: '所有教练的统一标准', text: '课程计划、排班与质量检查集中在一处。新教练学习的是您的标准，而不是旧习惯。' },
        { title: '老板的一目了然', text: '排班、课程记录与审核备注都在同一个画面。您不必再亲自盯每一堂课。' },
      ],
    },
    proof: {
      title: '诞生于真实运营的工作室',
      text: 'Kinetic Studio OS 于 2026 年 5 月至 9 月在一间拥有 24 张器械床的工作室内建立并运行。我们的「肩部架构课程」学员案例正在记录中，将于 2026 年 12 月发布。',
    },
    how: {
      title: '90 天如何进行',
      steps: [
        { title: '安装', text: '我们为您的工作室部署系统，并把您的课程载入我们的课程方案。' },
        { title: '培训', text: '您的教练学习课程方案、安全检查与学员记录。' },
        { title: '检查', text: '我们观察真实课堂，给每位教练清晰的反馈，并修正需要改进之处。' },
      ],
    },
    offer: {
      title: '方案与价格',
      note: '系统在授权有效期间运行。安装与授权始终一起提供。',
      currency: '价格以马币计算。',
      cards: [
        { name: '90 天安装', price: 'RM 9,000', terms: '一次性。开始前先付一半。', items: ['为您的工作室安装系统', '把您的课程载入我们的课程方案', '教练培训', '第一轮质量检查'] },
        { name: '工作室授权', price: 'RM 1,200 / 月', terms: '必选。至少 12 个月。', items: ['托管、更新与支持', '所有课程方案，以及陆续推出的新周次', '学员记录与学员专属入口', '老板视图与教练工具'] },
        { name: '现场指挥', price: 'RM 2,000 / 月', terms: '可选。任何月份可加入或停止。', items: ['每两周一次现场课堂检查', '为每位教练进行真实课堂审核', '每月新的课程编排'] },
      ],
    },
    fit: {
      title: '这适合您的工作室吗？',
      yesTitle: '适合',
      yes: ['您希望每位教练都按同一标准授课。', '您依据可衡量的数据做决定。', '您希望学员看到自己的进展。'],
      noTitle: '不适合',
      no: ['您想要一个能自己运转的廉价应用。', '您期望安装后软件免费。', '您还没准备好制定标准并要求团队执行。'],
    },
    close: {
      title: '从 15 分钟通话开始',
      text: '我们了解您工作室目前的运作方式，然后坦诚告诉您是否合适。',
      cta: '预约 15 分钟通话',
    },
  },

  ms: {
    nav: { cta: 'Tempah panggilan 15 minit', language: 'Bahasa' },
    hero: {
      eyebrow: 'Kinetic Studio OS · Untuk studio Pilates dan pergerakan',
      title: 'Sistem di sebalik setiap studio yang mengambil serius tentang tubuh.',
      sub: 'Program terbaik anda, diajar dengan cara yang sama oleh setiap jurulatih. Kemajuan setiap klien direkodkan. Kurang tekaan di lantai studio.',
      cta: 'Tempah panggilan 15 minit',
      secondary: 'Lihat apa yang termasuk',
    },
    problem: {
      title: 'Di mana studio kehilangan wang',
      items: [
        'Pemilik memeriksa setiap kelas, kerana standard hanya ada dalam kepala seorang.',
        'Jurulatih mengajar klien yang sama dengan cara berbeza.',
        'Kemajuan klien tersimpan dalam sembang dan hamparan, jadi tiada siapa nampak gambaran penuh.',
        'Klien yang sakit hanya mendapat tekaan. Ada yang pergi. Ada yang cedera.',
        'Kakitangan kanan menghabiskan masa dengan kerja pentadbiran, bukan melatih.',
      ],
    },
    what: {
      title: 'Apa yang studio anda dapat',
      cards: [
        { title: 'Program kelas, minggu demi minggu', text: 'Program untuk postur, bahu, pinggul dan lutut. Setiap kelas menunjukkan setiap stesen, isyarat dan semakan keselamatan. Satu suis menyesuaikan setiap senaman untuk had pergelangan, genggaman atau lutut.' },
        { title: 'Rekod untuk setiap klien', text: 'Jurulatih menanda apa yang dibuat setiap klien dan mencatat perubahan. Setiap sesi masuk ke garis masa klien itu.' },
        { title: 'Portal untuk klien anda', text: 'Setiap klien mendapat kod peribadi untuk melihat sesi dan kemajuan sendiri. Ia memastikan mereka dekat dengan hasil antara lawatan.' },
        { title: 'Satu standard untuk setiap jurulatih', text: 'Rancangan kelas, jadual dan semakan kualiti di satu tempat. Jurulatih baharu belajar standard anda, bukan tabiat lama mereka.' },
        { title: 'Paparan jelas untuk pemilik', text: 'Jadual tugas, log kelas dan nota audit dalam satu skrin. Anda tidak perlu lagi memeriksa setiap kelas sendiri.' },
      ],
    },
    proof: {
      title: 'Dibina di dalam studio yang beroperasi',
      text: 'Kinetic Studio OS dibina dan dijalankan di dalam studio 24 katil dari Mei hingga September 2026. Kajian kes klien untuk Program Rangka Bahu kami sedang direkodkan. Ia akan diterbitkan pada Disember 2026.',
    },
    how: {
      title: 'Bagaimana 90 hari berjalan',
      steps: [
        { title: 'Pasang', text: 'Kami sediakan sistem untuk studio anda dan memasukkan kelas anda ke dalam program kami.' },
        { title: 'Latih', text: 'Jurulatih anda mempelajari program, semakan keselamatan dan rekod klien.' },
        { title: 'Semak', text: 'Kami memerhati kelas sebenar, memberi maklum balas jelas kepada setiap jurulatih dan membetulkan apa yang perlu.' },
      ],
    },
    offer: {
      title: 'Tawaran',
      note: 'Sistem berjalan selagi lesen aktif. Pemasangan dan lesen sentiasa dijual bersama.',
      currency: 'Harga dalam ringgit Malaysia.',
      cards: [
        { name: 'Pemasangan 90 Hari', price: 'RM 9,000', terms: 'Sekali bayar. Separuh dibayar sebelum hari pertama.', items: ['Sistem dipasang untuk studio anda', 'Kelas anda dimasukkan ke dalam program kami', 'Latihan jurulatih', 'Pusingan pertama semakan kualiti'] },
        { name: 'Lesen Studio', price: 'RM 1,200 / bulan', terms: 'Wajib. Minimum 12 bulan.', items: ['Pengehosan, kemas kini dan sokongan', 'Semua program, serta minggu baharu apabila dikeluarkan', 'Rekod klien dan portal klien', 'Paparan pemilik dan alat jurulatih'] },
        { name: 'Floor Command', price: 'RM 2,000 / bulan', terms: 'Pilihan. Tambah atau berhenti pada bila-bila bulan.', items: ['Semakan lantai di lokasi setiap dua minggu', 'Audit kelas sebenar untuk setiap jurulatih', 'Program baharu setiap bulan'] },
      ],
    },
    fit: {
      title: 'Adakah ia sesuai untuk studio anda?',
      yesTitle: 'Sesuai',
      yes: ['Anda mahu setiap jurulatih mengajar mengikut satu standard.', 'Anda membuat keputusan berdasarkan apa yang boleh diukur.', 'Anda mahu klien melihat kemajuan sendiri.'],
      noTitle: 'Tidak sesuai',
      no: ['Anda mahukan aplikasi murah yang berjalan sendiri.', 'Anda menjangka perisian percuma selepas pemasangan.', 'Anda belum bersedia menetapkan standard dan memastikan pasukan mematuhinya.'],
    },
    close: {
      title: 'Mula dengan panggilan 15 minit',
      text: 'Kami lihat bagaimana studio anda berjalan hari ini. Kemudian kami beritahu dengan jujur sama ada ia sesuai.',
      cta: 'Tempah panggilan 15 minit',
    },
  },

  fr: {
    nav: { cta: 'Réserver un appel de 15 minutes', language: 'Langue' },
    hero: {
      eyebrow: 'Kinetic Studio OS · Pour les studios de Pilates et de mouvement',
      title: 'Le système derrière chaque studio qui prend le corps au sérieux.',
      sub: 'Votre meilleur programme, enseigné de la même façon par chaque instructeur. Les progrès de chaque client, enregistrés. Moins d’approximation en séance.',
      cta: 'Réserver un appel de 15 minutes',
      secondary: 'Voir ce qui est inclus',
    },
    problem: {
      title: 'Où les studios perdent de l’argent',
      items: [
        'Le propriétaire surveille chaque cours, car le standard n’existe que dans sa tête.',
        'Les instructeurs enseignent au même client de façons différentes.',
        'Les progrès des clients sont éparpillés dans des messages et des tableurs. Personne n’a la vue d’ensemble.',
        'Les clients qui ont mal reçoivent des approximations. Certains partent. Certains se blessent.',
        'Le personnel expérimenté passe son temps sur l’administratif au lieu d’entraîner.',
      ],
    },
    what: {
      title: 'Ce que votre studio reçoit',
      cards: [
        { title: 'Des programmes de cours, semaine après semaine', text: 'Des programmes pour la posture, les épaules, les hanches et les genoux. Chaque cours affiche chaque station, les consignes et les contrôles de sécurité. Un seul bouton adapte chaque exercice aux limites du poignet, de la prise ou du genou.' },
        { title: 'Un dossier pour chaque client', text: 'Les instructeurs cochent ce que chaque client a fait et notent ce qui a changé. Chaque séance rejoint l’historique du client.' },
        { title: 'Un espace pour vos clients', text: 'Chaque client reçoit un code personnel pour voir ses séances et ses progrès. Ils restent proches de leurs résultats entre deux visites.' },
        { title: 'Un seul standard pour chaque instructeur', text: 'Plans de cours, disponibilités et contrôles qualité au même endroit. Les nouveaux instructeurs apprennent votre standard, pas leurs vieilles habitudes.' },
        { title: 'Une vue claire pour le propriétaire', text: 'Plannings, registres de cours et notes d’audit sur un seul écran. Vous n’avez plus à vérifier chaque cours en personne.' },
      ],
    },
    proof: {
      title: 'Construit dans un studio en activité',
      text: 'Kinetic Studio OS a été construit et utilisé dans un studio de 24 machines de mai à septembre 2026. Une étude de cas client sur notre Programme Cadre des Épaules est en cours. Elle sera publiée en décembre 2026.',
    },
    how: {
      title: 'Le déroulé des 90 jours',
      steps: [
        { title: 'Installer', text: 'Nous installons le système pour votre studio et chargeons vos cours dans nos programmes.' },
        { title: 'Former', text: 'Vos instructeurs apprennent les programmes, les contrôles de sécurité et le dossier client.' },
        { title: 'Vérifier', text: 'Nous observons de vrais cours, donnons à chaque instructeur un retour clair et corrigeons ce qui doit l’être.' },
      ],
    },
    offer: {
      title: 'L’offre',
      note: 'Le système fonctionne tant que la licence est active. L’installation et la licence sont toujours vendues ensemble.',
      currency: 'Prix en ringgit malaisiens.',
      cards: [
        { name: 'Installation 90 jours', price: 'RM 9 000', terms: 'Paiement unique. La moitié est payée avant le premier jour.', items: ['Système installé pour votre studio', 'Vos cours chargés dans nos programmes', 'Formation des instructeurs', 'Premier cycle de contrôles qualité'] },
        { name: 'Licence Studio', price: 'RM 1 200 / mois', terms: 'Obligatoire. Engagement minimum de 12 mois.', items: ['Hébergement, mises à jour et assistance', 'Tous les programmes, et les nouvelles semaines à leur sortie', 'Dossiers clients et espace client', 'Vue propriétaire et outils instructeurs'] },
        { name: 'Floor Command', price: 'RM 2 000 / mois', terms: 'En option. À ajouter ou arrêter chaque mois.', items: ['Contrôles sur place toutes les deux semaines', 'Audits de cours en direct pour chaque instructeur', 'Nouvelle programmation chaque mois'] },
      ],
    },
    fit: {
      title: 'Est-ce fait pour votre studio ?',
      yesTitle: 'Pour vous si',
      yes: ['Vous voulez que chaque instructeur enseigne selon un même standard.', 'Vous décidez à partir de ce que vous pouvez mesurer.', 'Vous voulez que vos clients voient leurs propres progrès.'],
      noTitle: 'Pas pour vous si',
      no: ['Vous cherchez une application bon marché qui tourne seule.', 'Vous attendez un logiciel gratuit après l’installation.', 'Vous n’êtes pas prêt à fixer un standard et à le faire respecter.'],
    },
    close: {
      title: 'Commencez par un appel de 15 minutes',
      text: 'Nous regardons comment votre studio fonctionne aujourd’hui. Puis nous vous disons honnêtement si cela vous convient.',
      cta: 'Réserver un appel de 15 minutes',
    },
  },
};
