import type { ReportData } from '@app/shared'

/**
 * FULL_REPORT is modeled faithfully on the reference report in
 * ./reference — same sections, section order, plan/order/timeline structure,
 * the seven coach cards (including the enclomiphene medication-safety block),
 * eight goals, and all fourteen deep-dive categories with their biomarker
 * tables. The patient is synthetic (fake name), with age/dates matching the
 * reference header; lab values are transcribed from the reference.
 */

export const FULL_REPORT: ReportData = {
  meta: {
    patient: { name: 'Marcus Ellison', sex: 'male', age: 49 },
    preparedBy: 'Dr. Doron',
    assessmentDate: '2026-06-29',
    generatedDate: '2026-06-29',
  },
  healthStatus: {
    narrative:
      'Since your last assessment, the core metabolic and kidney themes are still present, but the newer chart information adds important context. Your strongest objective signals remain reassuring: normal blood counts, normal thyroid screening, and normal liver chemistries on the last available labs. The main issue is still an insulin-resistance pattern — elevated fasting insulin, high triglycerides, low HDL, and borderline LDL on the last fasting panel — and the older 2023 results show this has been a longer-running pattern. Kidney function still looks mildly reduced rather than clearly normal, and that matters more now that hypertension is documented. The hormone picture is less mysterious than before, because the testosterone rise is now more consistent with active enclomiphene treatment, but it still needs monitoring. New charted diagnoses of hypertension, psoriasis, ADHD, and depression are folded into the overall longevity plan, not treated as separate from the rest of your health.',
    authorName: 'Dr. Doron',
  },
  story: [
    {
      title: 'Kidney monitoring',
      body: 'You want to keep a close eye on your kidney function and understand whether the prior creatinine and eGFR pattern represents a stable mild issue or something that needs stronger protection.',
    },
    {
      title: 'Glycemic control',
      body: 'You want a clearer read on your blood sugar control and insulin resistance, not just whether you meet a diabetes cutoff.',
    },
    {
      title: 'Lipid control',
      body: 'You want to improve your cholesterol profile and better define your long-term cardiovascular prevention strategy.',
    },
    {
      title: 'Hormone evaluation',
      body: 'You want to understand your reproductive hormone pattern better, especially given the short-term variability in testosterone, LH, FSH, and estradiol.',
    },
    {
      title: 'Blood pressure control',
      body: 'You want to know whether your blood pressure is truly controlled and how it fits into your broader prevention plan.',
    },
    {
      title: 'Mental health',
      body: 'You want your depression and ADHD care to be part of the overall longevity plan, not treated as separate from the rest of your health.',
    },
  ],
  goals: [
    {
      order: 1,
      title: 'Lower insulin and triglycerides',
      condition: 'Chronic: insulin resistance',
      domains: ['Metabolic Health', 'Liver Health', 'Nutrition & Vitamins'],
      timeframeWeeks: 24,
      metrics: [
        { name: 'Hemoglobin A1c', current: '5.3 %', target: '5.2 %', timeframe: '24 weeks' },
        { name: 'Insulin', current: '27.8 µIU/mL', target: '18 µIU/mL', timeframe: '12 weeks' },
        { name: 'Triglycerides', current: '187 mg/dL', target: '148 mg/dL', timeframe: '12 weeks' },
      ],
    },
    {
      order: 2,
      title: 'Lower lipid and BP risk',
      condition: 'Hypertension plus dyslipidemia',
      domains: ['Cardiovascular Health', 'Brain Health', 'Inflammation'],
      timeframeWeeks: 24,
      metrics: [
        { name: 'Non-HDL Cholesterol', current: '129 mg/dL', target: '100 mg/dL', timeframe: '12 weeks' },
        { name: 'HDL Cholesterol', current: '39 mg/dL', target: '45 mg/dL', timeframe: '24 weeks' },
        { name: 'LDL-Cholesterol', current: '101 mg/dL', target: '80 mg/dL', timeframe: '12 weeks' },
        { name: 'Home blood pressure log', current: 'not documented', target: 'completed', timeframe: '3 weeks' },
      ],
    },
    {
      order: 3,
      title: 'Protect kidney filtration',
      condition: 'Borderline renal function',
      domains: ['Kidney Health', 'Cardiovascular Health'],
      timeframeWeeks: 24,
      metrics: [
        { name: 'Creatinine', current: '1.33 mg/dL', target: '1.20 mg/dL', timeframe: '24 weeks' },
        { name: 'eGFR', current: '66 mL/min/1.73m²', target: '75 mL/min/1.73m²', timeframe: '24 weeks' },
      ],
    },
    {
      order: 4,
      title: 'Improve sleep and brain recovery',
      condition: 'Sleep and psychiatric strain',
      domains: ['Sleep Health', 'Brain Health', 'Emotional & Social Health'],
      timeframeWeeks: 12,
      metrics: [
        { name: 'THC use', current: 'nightly', target: 'reduced or clinician-reviewed', timeframe: '12 weeks' },
        { name: 'Psychiatric medication review', current: 'not recently reconciled', target: 'completed', timeframe: '6 weeks' },
        { name: 'Sleep assessment', current: 'not completed', target: 'completed', timeframe: '4 weeks' },
      ],
    },
    {
      order: 5,
      title: 'Lower fatty-liver risk',
      condition: 'Prior ALT elevation',
      domains: ['Liver Health', 'Metabolic Health', 'Nutrition & Vitamins'],
      timeframeWeeks: 24,
      metrics: [
        { name: 'Insulin', current: '27.8 µIU/mL', target: '15 µIU/mL', timeframe: '24 weeks' },
        { name: 'Triglycerides', current: '187 mg/dL', target: '120 mg/dL', timeframe: '24 weeks' },
      ],
    },
    {
      order: 6,
      title: 'Protect knees and reserve',
      condition: 'Active knee OA',
      domains: ['Musculoskeletal Health', 'Nutrition & Vitamins', 'Blood Health'],
      timeframeWeeks: 12,
      metrics: [
        { name: 'Strength training frequency', current: '3 sessions/week', target: '4 sessions/week', timeframe: '12 weeks' },
        { name: 'DXA scan', current: 'untested', target: 'completed', timeframe: '12 weeks' },
      ],
    },
    {
      order: 7,
      title: 'Monitor hormone therapy response',
      condition: 'Active hormone therapy follow-up',
      domains: ['Thyroid & Hormone Health'],
      timeframeWeeks: 12,
      metrics: [
        { name: 'Estradiol', current: '53 pg/mL', target: '35 pg/mL', timeframe: '12 weeks' },
      ],
    },
    {
      order: 8,
      title: 'Address psoriasis and prevention gaps',
      condition: 'Psoriasis and screening refinement',
      domains: ['Skin Health', 'Inflammation', 'Cancer Screening'],
      timeframeWeeks: 12,
      metrics: [
        { name: 'Full-body skin exam', current: 'not documented', target: 'completed', timeframe: '12 weeks' },
        { name: 'Hereditary cancer risk review', current: 'not completed', target: 'completed', timeframe: '12 weeks' },
      ],
    },
  ],
  plan: {
    items: [
      { id: 'p-meals', kind: 'diet', title: 'Build protein-fiber meals' },
      { id: 'p-cardio', kind: 'lifestyle', title: 'Add cardio and lifting' },
      { id: 'p-bp', kind: 'lifestyle', title: 'Track your home BP' },
      { id: 'p-wake', kind: 'lifestyle', title: 'Set a fixed wake time' },
      { id: 'p-thc', kind: 'lifestyle', title: 'Reduce nightly THC' },
      { id: 'p-knee', kind: 'lifestyle', title: 'Start knee-smart training' },
      { id: 'p-enclomiphene', kind: 'medication', title: 'Continue enclomiphene as prescribed' },
    ],
  },
  orders: {
    labs: [
      'Fasting metabolic follow-up panel',
      'Lipid risk refinement panel (fasting lipid panel + ApoB + Lp(a))',
      'Kidney clarification panel',
      'Liver-metabolic reassessment panel (CMP + GGT + CBC + fasting insulin + HbA1c + lipid panel)',
      'Male hormone surveillance panel (estradiol + total testosterone + free testosterone + SHBG + CBC/hematocrit + CMP)',
    ],
    referrals: [
      'Ambulatory blood pressure monitoring or clinician-validated hypertension follow-up',
      'Sleep medicine evaluation',
      'Psychiatry or prescribing-clinician medication review',
      'Physical therapy referral for bilateral knee osteoarthritis',
      'Dermatology referral for psoriasis staging and full-body skin exam',
      'Cancer genetics referral for hereditary risk review',
    ],
    imaging: ['Liver ultrasound with elastography', 'DEXA body composition and bone density scan'],
  },
  timeline: [
    {
      offsetLabel: 'Now',
      entries: [
        { planItemId: 'p-meals', planItemTitle: 'Build protein-fiber meals', kind: 'diet', action: 'Fiber ramp' },
        { planItemId: 'p-meals', planItemTitle: 'Build protein-fiber meals', kind: 'diet', action: 'Meal structure' },
        { planItemId: 'p-cardio', planItemTitle: 'Add cardio and lifting', kind: 'lifestyle', action: 'Base volume' },
        { planItemId: 'p-cardio', planItemTitle: 'Add cardio and lifting', kind: 'lifestyle', action: 'Build walking base' },
        { planItemId: 'p-cardio', planItemTitle: 'Add cardio and lifting', kind: 'lifestyle', action: 'Aerobic base' },
        { planItemId: 'p-bp', planItemTitle: 'Track your home BP', kind: 'lifestyle', action: 'Run monitor' },
        { planItemId: 'p-bp', planItemTitle: 'Track your home BP', kind: 'lifestyle', action: 'Set technique' },
        { planItemId: 'p-wake', planItemTitle: 'Set a fixed wake time', kind: 'lifestyle', action: 'Anchor mornings' },
        { planItemId: 'p-thc', planItemTitle: 'Reduce nightly THC', kind: 'lifestyle', action: 'Measure baseline' },
        { planItemId: 'p-knee', planItemTitle: 'Start knee-smart training', kind: 'lifestyle', action: 'Pain-light baseline' },
        { planItemId: 'p-enclomiphene', planItemTitle: 'Continue enclomiphene as prescribed', kind: 'medication', action: 'Keep dose stable' },
      ],
    },
    {
      offsetLabel: '1 week',
      entries: [
        { planItemId: 'p-meals', planItemTitle: 'Build protein-fiber meals', kind: 'diet', action: 'Viscous fiber' },
        { planItemId: 'p-thc', planItemTitle: 'Reduce nightly THC', kind: 'lifestyle', action: 'Step down' },
      ],
    },
    {
      offsetLabel: '2 weeks',
      entries: [
        { planItemId: 'p-meals', planItemTitle: 'Build protein-fiber meals', kind: 'diet', action: 'Refine carbs' },
        { planItemId: 'p-cardio', planItemTitle: 'Add cardio and lifting', kind: 'lifestyle', action: 'Add strength sessions' },
        { planItemId: 'p-bp', planItemTitle: 'Track your home BP', kind: 'lifestyle', action: 'Review pattern' },
        { planItemId: 'p-wake', planItemTitle: 'Set a fixed wake time', kind: 'lifestyle', action: 'Protect consistency' },
      ],
    },
    {
      offsetLabel: '4 weeks',
      entries: [
        { planItemId: 'p-cardio', planItemTitle: 'Add cardio and lifting', kind: 'lifestyle', action: 'Interval add-on' },
        { planItemId: 'p-cardio', planItemTitle: 'Add cardio and lifting', kind: 'lifestyle', action: 'Progress aerobic volume' },
        { planItemId: 'p-knee', planItemTitle: 'Start knee-smart training', kind: 'lifestyle', action: 'Quad-hip build' },
        { planItemId: 'p-enclomiphene', planItemTitle: 'Continue enclomiphene as prescribed', kind: 'medication', action: 'Standardize lab timing' },
      ],
    },
    {
      offsetLabel: '6 weeks',
      entries: [
        { planItemId: 'p-bp', planItemTitle: 'Track your home BP', kind: 'lifestyle', action: 'Recheck effect' },
        { planItemId: 'p-thc', planItemTitle: 'Reduce nightly THC', kind: 'lifestyle', action: 'Reassess sleep' },
      ],
    },
    {
      offsetLabel: '8 weeks',
      entries: [
        { planItemId: 'p-meals', planItemTitle: 'Build protein-fiber meals', kind: 'diet', action: 'Lipid review' },
        { planItemId: 'p-knee', planItemTitle: 'Start knee-smart training', kind: 'lifestyle', action: 'Fourth session' },
        { planItemId: 'p-enclomiphene', planItemTitle: 'Continue enclomiphene as prescribed', kind: 'medication', action: 'Review response' },
      ],
    },
    {
      offsetLabel: '12 weeks',
      entries: [
        { planItemId: 'p-cardio', planItemTitle: 'Add cardio and lifting', kind: 'lifestyle', action: 'Progression' },
      ],
    },
  ],
  coach: [
    {
      planItemId: 'p-meals',
      title: 'Protein-Fiber Plate',
      whatToDo:
        'Build meals from a protein-first list, then vegetables or other high-fiber foods, and keep refined starches and sugars the smallest part of the plate.',
      whyItMatters:
        'Your last fasting pattern suggests your body was using excess insulin to hold glucose in range. Reducing that insulin demand is the fastest way to improve both metabolic risk and fatty-liver risk.',
      howItWorks:
        'Protein and fiber slow absorption, reduce post-meal glucose swings, improve fullness, and reduce the liver’s drive to package excess energy into triglycerides.',
      week1Plan:
        'At two meals per day, make protein the anchor. Add one fiber-rich food at each meal. Remove one obvious source of sugar or refined starch that you eat most often.',
      eatAvoid: {
        eat: ['Eggs, fish, Greek yogurt', 'Tofu, poultry, beans, lentils', 'Vegetables, berries', 'Nuts and seeds', 'Minimally processed starches'],
        avoid: ['Sugary drinks', 'Desserts', 'Large evening starch loads', 'Ultra-processed snack foods'],
      },
      faq: [
        { q: 'Do I need to go very low carb?', a: 'No. The goal is a lower-insulin pattern, not a rigid diet label.' },
        {
          q: 'What if my A1c is already 5.5%?',
          a: 'Your insulin and triglycerides show there is still metabolic work happening behind that A1c.',
        },
      ],
      tip: 'If you are unsure where to start, change breakfast first; it often sets the insulin pattern for the rest of the day.',
    },
    {
      planItemId: 'p-cardio',
      title: 'Zone 2 plus lifting',
      whatToDo: 'Build a weekly routine that combines steady aerobic work with resistance training.',
      whyItMatters:
        'This is one of the most reliable ways to lower insulin resistance before diabetes develops. It also helps triglycerides, body composition, and liver fat risk.',
      howItWorks:
        'Working muscles take up more glucose and become more sensitive to insulin. Over time, your body does not need to over-secrete insulin to keep glucose normal.',
      week1Plan:
        'Do three brisk walks or bike sessions of 30–45 minutes and two short full-body strength sessions.',
      faq: [
        {
          q: 'Do I need intense exercise?',
          a: 'No. Consistent moderate work plus basic strength training is enough to start changing the biology.',
        },
        {
          q: 'What if I am deconditioned?',
          a: 'Start shorter and build; consistency matters more than intensity in week one.',
        },
      ],
    },
    {
      planItemId: 'p-bp',
      title: 'Track your home BP',
      whatToDo: 'Measure and log your blood pressure at home in a standardized way for the next few weeks.',
      whyItMatters:
        'You now have a documented hypertension diagnosis, but there are still no actual readings in the chart. With stimulant exposure on board, guessing is not good enough.',
      howItWorks:
        'Repeated home readings give a much better picture of your real blood-pressure load than an isolated office impression and help your clinician see whether treatment is actually helping.',
      week1Plan:
        'Set up a validated cuff, measure twice each morning and evening on at least 4 days, and store the readings in one place you can share.',
      faq: [
        {
          q: 'What if one reading is high?',
          a: 'Look at the pattern, not a single number, unless you have symptoms or very severe values that need urgent care.',
        },
        {
          q: 'Should I measure right after exercise or caffeine?',
          a: 'No. Measure when rested and consistent so the log is interpretable.',
        },
      ],
      tip: 'Keep the cuff next to something you already do every morning and evening so the routine sticks.',
    },
    {
      planItemId: 'p-wake',
      title: 'Fixed Wake Time',
      whatToDo: 'Wake up at the same time every day for the next month.',
      whyItMatters:
        'This is the fastest way to steady a disrupted sleep schedule when medications, stress, or evening habits are pushing your sleep in different directions.',
      howItWorks:
        'A fixed wake time strengthens your circadian rhythm and helps sleep pressure build at the right time the next night.',
      week1Plan: 'Pick one realistic wake time, set alarms, and get out of bed within 10 minutes every day.',
      faq: [
        {
          q: 'What if I slept badly?',
          a: 'Keep the wake time anyway; consistency matters more than one rough night.',
        },
      ],
      tip: 'Put the alarm across the room so getting up becomes automatic.',
    },
    {
      planItemId: 'p-thc',
      title: 'THC Taper',
      whatToDo: 'Reduce nightly THC use in a gradual, trackable way instead of using it automatically every evening.',
      whyItMatters:
        'Your updated chart now shows nightly THC on top of stimulant and antidepressant treatment, which is a setup for sleep that may feel sedated but not fully restorative.',
      howItWorks:
        'Regular THC can blunt REM sleep and create rebound sleep disruption as tolerance develops. Lowering the exposure helps your sleep architecture recover.',
      week1Plan: 'Write down your usual nightly pattern, then choose one small step-down target for the next week.',
      faq: [
        {
          q: 'Do I need to stop all at once?',
          a: 'No. A gradual reduction is usually more sustainable and gives clearer feedback.',
        },
      ],
      tip: 'Track next-morning clarity, dream recall, and energy so the benefits become easier to notice.',
    },
    {
      planItemId: 'p-knee',
      title: 'Knee-smart strength plan',
      whatToDo:
        'Keep lifting, but make your lower-body training more knee-efficient: controlled tempo, moderate range, and gradual progression.',
      whyItMatters:
        'Strong quads, glutes, and hamstrings help unload the knee and make osteoarthritis less limiting over time.',
      howItWorks:
        'Better muscle support and cleaner movement patterns reduce joint irritation while preserving the training habit that protects the rest of your health.',
      week1Plan:
        'Keep your current three gym sessions. On lower-body days, reduce any movement that causes a clear pain spike; favor split squats, box squats, leg presses in a tolerated range, hamstring work, and step-ups.',
      faq: [
        {
          q: 'Should you stop squatting?',
          a: 'No — usually the better move is to change depth, tempo, stance, or load.',
        },
        {
          q: 'Is pain ever acceptable?',
          a: 'Mild, short-lived discomfort can be workable; pain that clearly worsens during the session or lingers into the next day means back down.',
        },
      ],
      tip: 'Change only one loading variable at a time — weight, depth, or volume, not all three together.',
    },
    {
      planItemId: 'p-enclomiphene',
      title: 'Continue enclomiphene',
      whatToDo:
        'Keep taking enclomiphene exactly as currently prescribed and repeat your hormone surveillance labs in the next 1–3 months.',
      whyItMatters:
        'Your recent records make it much more likely that the spring testosterone rise was the intended treatment effect. The main question now is whether you are getting that benefit without letting estradiol drift too high.',
      howItWorks:
        'This medication helps your brain send a stronger signal to your testes to produce testosterone. That same shift can also raise estradiol, so follow-up labs are how you keep the benefits while avoiding overshooting.',
      week1Plan:
        'Keep your morning dosing routine consistent, note any breast tenderness, fluid retention, acne, mood change, headaches, or libido changes, and book the follow-up lab draw.',
      faq: [
        {
          q: 'If testosterone looks good, why recheck anything?',
          a: 'Because estradiol, hematocrit, and liver chemistry help show whether the treatment is still balanced and safe.',
        },
        {
          q: 'Should I change the dose before the next lab?',
          a: 'No — keeping the regimen stable makes the next result much easier to interpret.',
        },
      ],
      tip: 'Try to get future hormone labs drawn under the same conditions each time, especially with respect to your morning dose.',
      safety: {
        avoid:
          'Do not continue this medication without clinician review if you develop unexplained vision changes, chest pain, shortness of breath, or one-sided leg swelling, or if you have been told you have an active clotting disorder or significant liver disease.',
        monitoring:
          'Repeat estradiol and the rest of your surveillance labs on schedule so your clinician can confirm the treatment stays balanced and safe (we’ll check estradiol once in the next 1–3 months, then per clinician).',
        dosing:
          'Do not increase the dose on your own; stay at 25 mg each morning unless your prescribing clinician changes the regimen. Maintain the current dose until the follow-up panel is reviewed.',
        callUs:
          'Stop the medication and contact your clinician promptly if you develop visual symptoms, severe persistent headache, marked mood worsening, breast tenderness with rapid swelling, or symptoms concerning for a blood clot.',
      },
    },
  ],
  deepDive: [
    {
      categoryId: 'cardiovascular',
      categoryName: 'Cardiovascular Health',
      status: 'at_risk',
      narrative:
        'At risk due to newly documented essential hypertension requiring pharmacotherapy (propranolol), complicated by concurrent stimulant use (Adderall XR) and a strong family history of cardiovascular disease. Historical 2023-11-28 labs show a prior peak of severe atherogenic dyslipidemia (LDL-C 132 mg/dL, triglycerides 292 mg/dL) that has only partially improved on the 2025-06-09 fasting panel (LDL-C 101 mg/dL, triglycerides 187 mg/dL, non-HDL 129 mg/dL). The immediate priority is obtaining objective home blood pressure data and finalizing a prevention strategy.',
      counts: { abnormal: 8, inRange: 2, optimal: 0 },
      biomarkers: [
        { name: 'Triglycerides (latest 2025-06)', relevancy: 'high', value: '187', unit: 'mg/dL', referenceRange: '< 150', optimalRange: '< 100', date: '2025-06-09', flag: 'abnormal' },
        { name: 'Insulin', relevancy: 'high', value: '27.8', unit: 'µIU/mL', referenceRange: '2–25', optimalRange: '2–8', date: '2025-06-08', flag: 'abnormal' },
        { name: 'LDL-Cholesterol (latest 2025-06)', relevancy: 'medium', value: '101', unit: 'mg/dL', referenceRange: '< 130', optimalRange: '< 80', date: '2025-06-09', flag: 'abnormal' },
        { name: 'LDL-Cholesterol (baseline 2023-11)', relevancy: 'medium', value: '132', unit: 'mg/dL', referenceRange: '< 130', optimalRange: '< 80', date: '2023-11-28', flag: 'abnormal' },
        { name: 'HDL Cholesterol (latest 2025-06)', relevancy: 'medium', value: '39', unit: 'mg/dL', referenceRange: '> 40', optimalRange: '60–90', date: '2025-06-09', flag: 'abnormal' },
        { name: 'Non-HDL Cholesterol (baseline 2023-11)', relevancy: 'medium', value: '232', unit: 'mg/dL', referenceRange: '< 160', optimalRange: '< 130', date: '2023-11-28', flag: 'abnormal' },
        { name: 'Non-HDL Cholesterol (latest 2025-06)', relevancy: 'medium', value: '129', unit: 'mg/dL', referenceRange: '< 160', optimalRange: '< 130', date: '2025-06-09', flag: 'abnormal' },
        { name: 'Hemoglobin A1c (baseline 2025-03)', relevancy: 'medium', value: '5.7', unit: '%', referenceRange: '4–5.6', optimalRange: '4.8–5.2', date: '2025-03-27', flag: 'abnormal' },
        { name: 'Hemoglobin A1c (latest 2025-06)', relevancy: 'medium', value: '5.5', unit: '%', referenceRange: '4–5.6', optimalRange: '4.8–5.2', date: '2025-06-08', flag: 'in_range' },
        { name: 'Glucose (latest 2025-06)', relevancy: 'medium', value: '98', unit: 'mg/dL', referenceRange: '65–99', optimalRange: '80–90', date: '2025-06-08', flag: 'in_range' },
      ],
    },
    {
      categoryId: 'metabolic',
      categoryName: 'Metabolic Health',
      status: 'at_risk',
      narrative:
        'At risk, driven by a chronic hyperinsulinemic insulin-resistance pattern. The most recent fasting draw (2025-06-09) showed insulin 27.8 µIU/mL, with glucose 98 mg/dL, HbA1c 5.5%, triglycerides 187 mg/dL, HDL-C 39 mg/dL, and LDL-C 101 mg/dL. Newly integrated historical data from late 2023 reveals this is a long-standing issue, previously manifesting as severe hypertriglyceridemia (292 mg/dL) and elevated ALT (85 U/L), strongly suggesting hepatic insulin resistance and metabolic-associated steatotic liver disease (MASLD). While HbA1c does not yet meet the pre-diabetes threshold, the dominant signal of compensatory hyperinsulinemia persists; confirm with repeat fasting metabolic labs.',
      counts: { abnormal: 6, inRange: 2, optimal: 0 },
      biomarkers: [
        { name: 'Insulin', relevancy: 'high', value: '27.8', unit: 'µIU/mL', referenceRange: '2–25', optimalRange: '2–8', date: '2025-06-08', flag: 'abnormal' },
        { name: 'Triglycerides (baseline 2023-11)', relevancy: 'high', value: '292', unit: 'mg/dL', referenceRange: '< 150', optimalRange: '< 100', date: '2023-11-28', flag: 'abnormal' },
        { name: 'Triglycerides (latest 2025-06)', relevancy: 'high', value: '187', unit: 'mg/dL', referenceRange: '< 150', optimalRange: '< 100', date: '2025-06-09', flag: 'abnormal' },
        { name: 'ALT (baseline 2023-11)', relevancy: 'high', value: '85', unit: 'U/L', referenceRange: '< 35', optimalRange: '< 25', date: '2023-11-28', flag: 'abnormal' },
        { name: 'Hemoglobin A1c (latest 2025-06)', relevancy: 'medium', value: '5.5', unit: '%', referenceRange: '4–5.6', optimalRange: '4.8–5.2', date: '2025-06-08', flag: 'abnormal' },
        { name: 'HDL Cholesterol', relevancy: 'medium', value: '39', unit: 'mg/dL', referenceRange: '> 40', optimalRange: '60–90', date: '2025-06-09', flag: 'abnormal' },
        { name: 'LDL-Cholesterol', relevancy: 'medium', value: '101', unit: 'mg/dL', referenceRange: '< 130', optimalRange: '< 80', date: '2025-06-09', flag: 'abnormal' },
        { name: 'Glucose', relevancy: 'medium', value: '98', unit: 'mg/dL', referenceRange: '65–99', optimalRange: '80–90', date: '2025-06-08', flag: 'in_range' },
        { name: 'hs-CRP', relevancy: 'low', value: '0.5', unit: 'mg/L', referenceRange: '< 1', optimalRange: '< 1', date: '2025-06-08', flag: 'in_range' },
      ],
    },
    {
      categoryId: 'musculoskeletal',
      categoryName: 'Musculoskeletal Health',
      status: 'at_risk',
      narrative:
        'Risk is driven by active joint pathology, specifically the newly documented bilateral primary osteoarthritis of the knees and a history of multiple arthroscopies. The patient’s regular gym training (3 days/week) is a strong protective factor for muscle preservation and joint stabilization. Available 2025 laboratory data are modestly reassuring for mineral homeostasis and inflammatory burden: calcium remained normal at 9.7 mg/dL, alkaline phosphatase was low-normal at 43 U/L, and hs-CRP was low at 0.5 mg/L. However, core longevity metrics — 25-OH vitamin D, PTH, DXA for bone density, and objective functional strength testing — remain absent, leaving bone and muscle reserve incompletely characterized.',
      counts: { abnormal: 2, inRange: 4, optimal: 0 },
      biomarkers: [
        { name: 'Calcium (latest 2025-06)', relevancy: 'medium', value: '9.7', unit: 'mg/dL', referenceRange: '8.6–10.2', optimalRange: '8.2–9.8', date: '2025-06-08', flag: 'in_range' },
        { name: 'Calcium (baseline 2023-11)', relevancy: 'medium', value: '10.2', unit: 'mg/dL', referenceRange: '8.6–10.2', optimalRange: '8.2–9.8', date: '2023-11-28', flag: 'abnormal' },
        { name: 'hs-CRP', relevancy: 'medium', value: '0.5', unit: 'mg/L', referenceRange: '< 1', optimalRange: '< 1', date: '2025-06-08', flag: 'in_range' },
        { name: 'Alkaline Phosphatase (latest 2025-06)', relevancy: 'low', value: '43', unit: 'U/L', referenceRange: '44–147', optimalRange: '50–90', date: '2025-06-08', flag: 'abnormal' },
        { name: 'Alkaline Phosphatase (baseline 2023-11)', relevancy: 'low', value: '123', unit: 'U/L', referenceRange: '44–147', optimalRange: '50–90', date: '2023-11-28', flag: 'in_range' },
        { name: 'Creatinine (latest 2025-06)', relevancy: 'low', value: '1.33', unit: 'mg/dL', referenceRange: '0.8–1.3', optimalRange: '0.8–1.1', date: '2025-06-08', flag: 'in_range' },
      ],
    },
    {
      categoryId: 'brain',
      categoryName: 'Brain Health',
      status: 'at_risk',
      narrative:
        'Cognitive health is dominated by an active neuropsychiatric profile requiring polypharmacy (Adderall XR, citalopram, bupropion) for ADHD and depression, alongside migraine management (propranolol) and nightly THC use. This neuroactive medication burden is compounded by essential hypertension and a persistent vascular-metabolic risk pattern (fasting insulin 27.8 µIU/mL, triglycerides 187 mg/dL, LDL-C 101 mg/dL). While glycemic control has improved (HbA1c 5.5%) and systemic inflammation is low (hs-CRP 0.5 mg/L), the primary drivers remain sub-clinical vascular risk and central adiposity. Comprehensive medication reconciliation, strict blood pressure monitoring, and targeted lifestyle interventions are critical.',
      counts: { abnormal: 5, inRange: 4, optimal: 0 },
      biomarkers: [
        { name: 'Insulin', relevancy: 'high', value: '27.8', unit: 'µIU/mL', referenceRange: '2–25', optimalRange: '2–8', date: '2025-06-08', flag: 'abnormal' },
        { name: 'Triglycerides', relevancy: 'high', value: '187', unit: 'mg/dL', referenceRange: '< 150', optimalRange: '< 100', date: '2025-06-09', flag: 'abnormal' },
        { name: 'Hemoglobin A1c (baseline 2025-03)', relevancy: 'medium', value: '5.7', unit: '%', referenceRange: '4–5.6', optimalRange: '4.8–5.2', date: '2025-03-27', flag: 'abnormal' },
        { name: 'HDL Cholesterol', relevancy: 'medium', value: '39', unit: 'mg/dL', referenceRange: '> 40', optimalRange: '60–90', date: '2025-06-09', flag: 'abnormal' },
        { name: 'Hemoglobin A1c (latest 2025-06)', relevancy: 'medium', value: '5.5', unit: '%', referenceRange: '4–5.6', optimalRange: '4.8–5.2', date: '2025-06-08', flag: 'abnormal' },
        { name: 'LDL-Cholesterol', relevancy: 'medium', value: '101', unit: 'mg/dL', referenceRange: '< 130', optimalRange: '< 80', date: '2025-06-09', flag: 'abnormal' },
        { name: 'Glucose', relevancy: 'medium', value: '98', unit: 'mg/dL', referenceRange: '65–99', optimalRange: '80–90', date: '2025-06-08', flag: 'in_range' },
        { name: 'hs-CRP', relevancy: 'low', value: '0.5', unit: 'mg/L', referenceRange: '< 1', optimalRange: '< 1', date: '2025-06-08', flag: 'in_range' },
        { name: 'TSH (baseline 2025-03)', relevancy: 'low', value: '1.21', unit: 'mIU/L', referenceRange: '0.4–4.5', optimalRange: '0.5–2.5', date: '2025-03-27', flag: 'in_range' },
        { name: 'TSH (latest 2025-06)', relevancy: 'low', value: '1.72', unit: 'mIU/L', referenceRange: '0.4–4.5', optimalRange: '0.5–2.5', date: '2025-06-08', flag: 'in_range' },
      ],
    },
    {
      categoryId: 'emotional_social',
      categoryName: 'Emotional & Social Health',
      status: 'at_risk',
      narrative:
        'Notable for active depression and attention-deficit hyperactivity disorder (ADHD), currently managed with a multi-drug regimen including citalopram, bupropion SR, and Adderall XR. The 2025-08-15 clinic facesheet also documents nightly THC use, which warrants careful monitoring given its potential to interact with psychiatric medications, impact sleep architecture, and exacerbate underlying mood or cognitive symptoms. As a patient who is divorced with two children, he likely faces significant occupational and psychosocial stressors. A family history of depression and anxiety on both sides further elevates risk. Comprehensive behavioral health follow-up is recommended to optimize the pharmacologic regimen, assess the efficacy of current therapies, and evaluate the impact of THC use.',
      counts: { abnormal: 0, inRange: 2, optimal: 0 },
      biomarkers: [
        { name: 'TSH (baseline 2025-03)', relevancy: 'low', value: '1.21', unit: 'mIU/L', referenceRange: '0.4–4.5', optimalRange: '0.5–2.5', date: '2025-03-27', flag: 'in_range' },
        { name: 'TSH (latest 2025-06)', relevancy: 'low', value: '1.72', unit: 'mIU/L', referenceRange: '0.4–4.5', optimalRange: '0.5–2.5', date: '2025-06-08', flag: 'in_range' },
      ],
    },
    {
      categoryId: 'thyroid_hormone',
      categoryName: 'Thyroid & Hormone Health',
      status: 'needs_attention',
      narrative:
        'Thyroid signal is reassuring but incomplete: TSH was optimal at 1.21 mIU/L (2025-03-27) and 1.72 mIU/L (2025-06-08), with no free-hormone data. The dominant endocrine feature is the male reproductive axis, where the previously noted volatility across spring 2025 is now clearly explained by the August 2025 clinic facesheet documenting hypogonadism on active enclomiphene. The rise in total testosterone from 393 to 728 ng/dL, accompanied by elevated LH, FSH, and estradiol, represents the expected physiologic response to selective estrogen receptor modulator (SERM) therapy rather than an unstable endogenous axis. Ongoing surveillance is required to ensure clinical optimization and monitor for SERM-related effects.',
      counts: { abnormal: 6, inRange: 3, optimal: 0 },
      biomarkers: [
        { name: 'LH (latest 2025-06)', relevancy: 'high', value: '14.8', unit: 'mIU/mL', referenceRange: '1.7–8.6', optimalRange: '3–7', date: '2025-06-09', flag: 'abnormal' },
        { name: 'FSH (latest 2025-06)', relevancy: 'high', value: '16.7', unit: 'mIU/mL', referenceRange: '1.5–12.4', optimalRange: '2–8', date: '2025-06-09', flag: 'abnormal' },
        { name: 'Testosterone, Total (baseline 2025-03)', relevancy: 'high', value: '393', unit: 'ng/dL', referenceRange: '264–916', optimalRange: '500–900', date: '2025-03-27', flag: 'abnormal' },
        { name: 'Testosterone, Total (latest 2025-06)', relevancy: 'high', value: '728', unit: 'ng/dL', referenceRange: '264–916', optimalRange: '500–900', date: '2025-06-09', flag: 'in_range' },
        { name: 'Testosterone, Free', relevancy: 'high', value: '133.6', unit: 'pg/mL', referenceRange: '35–155', optimalRange: '> 100', date: '2025-06-09', flag: 'in_range' },
        { name: 'Estradiol (latest 2025-06)', relevancy: 'high', value: '53', unit: 'pg/mL', referenceRange: '10–40', optimalRange: '10–30', date: '2025-06-09', flag: 'abnormal' },
        { name: 'Estradiol (baseline 2025-03)', relevancy: 'medium', value: '63', unit: 'pg/mL', referenceRange: '10–40', optimalRange: '10–30', date: '2025-03-27', flag: 'abnormal' },
        { name: 'Sex Hormone Binding Globulin (latest 2025-06)', relevancy: 'medium', value: '24', unit: 'nmol/L', referenceRange: '10–57', optimalRange: '30–40', date: '2025-06-09', flag: 'abnormal' },
        { name: 'TSH (latest 2025-06)', relevancy: 'medium', value: '1.72', unit: 'mIU/L', referenceRange: '0.4–4.5', optimalRange: '0.5–2.5', date: '2025-06-08', flag: 'in_range' },
      ],
    },
    {
      categoryId: 'liver',
      categoryName: 'Liver Health',
      status: 'needs_attention',
      narrative:
        'While the 2025 hepatic panel shows no active hepatocellular injury or synthetic dysfunction, newly integrated historical data from late 2023 reveals a prior ALT elevation of 85 U/L paired with severe hypertriglyceridemia. The current dominant issue remains probable metabolic-associated steatotic liver disease (MASLD) risk, driven by fasting insulin of 27.8 µIU/mL, triglycerides of 187 mg/dL, and low HDL-C. The patient is also on a complex medication regimen (bupropion, citalopram, Adderall, propranolol, enclomiphene) alongside nightly THC use, all of which require hepatic vigilance. Because the most recent normal labs are now roughly a year old, a repeat hepatic panel (including GGT) and a first-line steatosis evaluation (ultrasound or FibroScan) are warranted.',
      counts: { abnormal: 4, inRange: 6, optimal: 0 },
      biomarkers: [
        { name: 'Insulin', relevancy: 'high', value: '27.8', unit: 'µIU/mL', referenceRange: '2–25', optimalRange: '2–8', date: '2025-06-08', flag: 'abnormal' },
        { name: 'Triglycerides', relevancy: 'high', value: '187', unit: 'mg/dL', referenceRange: '< 150', optimalRange: '< 100', date: '2025-06-09', flag: 'abnormal' },
        { name: 'ALT (baseline 2023-11)', relevancy: 'high', value: '85', unit: 'U/L', referenceRange: '< 35', optimalRange: '< 25', date: '2023-11-28', flag: 'abnormal' },
        { name: 'ALT (latest 2025-06)', relevancy: 'high', value: '20', unit: 'U/L', referenceRange: '< 35', optimalRange: '< 25', date: '2025-06-09', flag: 'in_range' },
        { name: 'AST (latest 2025-06)', relevancy: 'high', value: '22', unit: 'U/L', referenceRange: '< 35', optimalRange: '< 25', date: '2025-06-09', flag: 'in_range' },
        { name: 'Hemoglobin A1c', relevancy: 'medium', value: '5.5', unit: '%', referenceRange: '4–5.6', optimalRange: '4.8–5.2', date: '2025-06-08', flag: 'abnormal' },
        { name: 'Bilirubin, total (latest 2025-06)', relevancy: 'medium', value: '0.3', unit: 'mg/dL', referenceRange: '0.2–1.2', optimalRange: '< 1', date: '2025-06-08', flag: 'in_range' },
        { name: 'Albumin', relevancy: 'medium', value: '4.3', unit: 'g/dL', referenceRange: '3.5–5.5', optimalRange: '4.2–4.8', date: '2025-06-08', flag: 'in_range' },
        { name: 'Platelet count', relevancy: 'medium', value: '233', unit: 'K/µL', referenceRange: '150–450', optimalRange: '200–300', date: '2025-06-08', flag: 'in_range' },
        { name: 'HDL cholesterol', relevancy: 'low', value: '39', unit: 'mg/dL', referenceRange: '> 40', optimalRange: '60–90', date: '2025-06-09', flag: 'abnormal' },
      ],
    },
    {
      categoryId: 'kidney',
      categoryName: 'Kidney Health',
      status: 'needs_attention',
      narrative:
        'Kidney function is not frankly failing, but it is suboptimal for longevity and compounded by newly documented risk factors. Creatinine remained mildly elevated across 2025 and creatinine-based eGFR was 58 mL/min/1.73m² in March 2025, improving to 66 by June 2025 and plateauing there. Historical 2023 laboratory data confirm this is a chronic pattern. For a 49-year-old man, an eGFR in the mid-60s is below ideal. A spot urine albumin-creatinine ratio, urinalysis, and blood pressure logs are needed to distinguish benign creatinine elevation from early CKD and to set a nephroprotection plan.',
      counts: { abnormal: 4, inRange: 5, optimal: 0 },
      biomarkers: [
        { name: 'Creatinine (baseline 2025-03)', relevancy: 'high', value: '1.48', unit: 'mg/dL', referenceRange: '0.8–1.3', optimalRange: '0.8–1.1', date: '2025-03-27', flag: 'abnormal' },
        { name: 'Creatinine (latest 2025-06)', relevancy: 'high', value: '1.33', unit: 'mg/dL', referenceRange: '0.8–1.3', optimalRange: '0.8–1.1', date: '2025-06-08', flag: 'abnormal' },
        { name: 'eGFR (latest 2025-06)', relevancy: 'high', value: '66', unit: 'mL/min/1.73m²', referenceRange: '< 90', optimalRange: '> 90', date: '2025-06-08', flag: 'abnormal' },
        { name: 'eGFR (baseline 2025-03)', relevancy: 'high', value: '58', unit: 'mL/min/1.73m²', referenceRange: '< 90', optimalRange: '> 90', date: '2025-03-27', flag: 'abnormal' },
        { name: 'Urea Nitrogen (BUN)', relevancy: 'medium', value: '18', unit: 'mg/dL', referenceRange: '7–20', optimalRange: '10–18', date: '2025-06-08', flag: 'in_range' },
        { name: 'Potassium', relevancy: 'medium', value: '4.8', unit: 'mmol/L', referenceRange: '3.5–5.1', optimalRange: '4–4.5', date: '2025-06-08', flag: 'in_range' },
        { name: 'Carbon Dioxide', relevancy: 'medium', value: '26', unit: 'mmol/L', referenceRange: '22–30', optimalRange: '24–28', date: '2025-06-08', flag: 'in_range' },
        { name: 'Hemoglobin A1c', relevancy: 'medium', value: '5.5', unit: '%', referenceRange: '4–5.6', optimalRange: '4.8–5.2', date: '2025-06-08', flag: 'in_range' },
        { name: 'Sodium', relevancy: 'low', value: '141', unit: 'mmol/L', referenceRange: '136–145', optimalRange: '140–144', date: '2025-06-08', flag: 'in_range' },
      ],
    },
    {
      categoryId: 'nutrition',
      categoryName: 'Nutrition & Vitamins',
      status: 'needs_attention',
      narrative:
        'Nutrition status cannot be fully characterized because core micronutrient labs are absent, but the longitudinal metabolic pattern points to dominant nutritional optimization needs. The newly integrated 2023-11-28 data shows severe historical hypertriglyceridemia (292 mg/dL) that has partially improved by 2025-06-09 (187 mg/dL), yet fasting insulin remains markedly elevated at 27.8 µIU/mL. This is consistent with an insulin-resistant, atherogenic nutritional pattern (elevated HbA1c 5.5%, low HDL). Key mineral and micronutrient targets (vitamin D, B12, magnesium, iron, folate, omega-3) remain untested; confirmation testing is warranted.',
      counts: { abnormal: 6, inRange: 3, optimal: 0 },
      biomarkers: [
        { name: 'Insulin', relevancy: 'high', value: '27.8', unit: 'µIU/mL', referenceRange: '2–25', optimalRange: '2–8', date: '2025-06-08', flag: 'abnormal' },
        { name: 'Triglycerides (baseline 2023-11)', relevancy: 'high', value: '292', unit: 'mg/dL', referenceRange: '< 150', optimalRange: '< 100', date: '2023-11-28', flag: 'abnormal' },
        { name: 'Triglycerides (latest 2025-06)', relevancy: 'high', value: '187', unit: 'mg/dL', referenceRange: '< 150', optimalRange: '< 100', date: '2025-06-09', flag: 'abnormal' },
        { name: 'Hemoglobin A1c (baseline 2025-03)', relevancy: 'high', value: '5.7', unit: '%', referenceRange: '4–5.6', optimalRange: '4.8–5.2', date: '2025-03-27', flag: 'abnormal' },
        { name: 'Hemoglobin A1c (latest 2025-06)', relevancy: 'medium', value: '5.5', unit: '%', referenceRange: '4–5.6', optimalRange: '4.8–5.2', date: '2025-06-08', flag: 'abnormal' },
        { name: 'Glucose', relevancy: 'medium', value: '98', unit: 'mg/dL', referenceRange: '65–99', optimalRange: '80–90', date: '2025-06-08', flag: 'in_range' },
        { name: 'hs-CRP', relevancy: 'medium', value: '0.5', unit: 'mg/L', referenceRange: '< 1', optimalRange: '< 1', date: '2025-06-08', flag: 'in_range' },
        { name: 'LDL Cholesterol (baseline 2023-11)', relevancy: 'low', value: '132', unit: 'mg/dL', referenceRange: '< 130', optimalRange: '< 100', date: '2023-11-28', flag: 'abnormal' },
        { name: 'Non-HDL Cholesterol (latest 2025-06)', relevancy: 'low', value: '129', unit: 'mg/dL', referenceRange: '< 160', optimalRange: '< 130', date: '2025-06-09', flag: 'in_range' },
      ],
    },
    {
      categoryId: 'inflammation',
      categoryName: 'Inflammation',
      status: 'needs_attention',
      narrative:
        'Measured systemic inflammation via hs-CRP appears low (0.5 mg/L) on 2025-06-08, but the August 2025 clinic facesheet documents a diagnosis of psoriasis, indicating an active systemic autoimmune and inflammatory process. The inflammatory context is further complicated by metabolic drivers: fasting insulin 27.8 µIU/mL, triglycerides 187 mg/dL, and low HDL 39 mg/dL support a metabolic-inflammation pattern. The presence of clinical psoriasis and metabolic dysregulation precludes an optimal rating despite the low hs-CRP. Repeat hs-CRP with broader inflammatory characterization (ESR, ferritin) is warranted.',
      counts: { abnormal: 4, inRange: 4, optimal: 0 },
      biomarkers: [
        { name: 'Insulin', relevancy: 'high', value: '27.8', unit: 'µIU/mL', referenceRange: '2–25', optimalRange: '2–8', date: '2025-06-08', flag: 'abnormal' },
        { name: 'hs-CRP', relevancy: 'high', value: '0.5', unit: 'mg/L', referenceRange: '< 1', optimalRange: '< 1', date: '2025-06-08', flag: 'in_range' },
        { name: 'Triglycerides (baseline 2023-11)', relevancy: 'medium', value: '292', unit: 'mg/dL', referenceRange: '< 150', optimalRange: '< 100', date: '2023-11-28', flag: 'abnormal' },
        { name: 'Triglycerides (latest 2025-06)', relevancy: 'medium', value: '187', unit: 'mg/dL', referenceRange: '< 150', optimalRange: '< 100', date: '2025-06-09', flag: 'abnormal' },
        { name: 'Hemoglobin A1c (baseline 2025-03)', relevancy: 'medium', value: '5.7', unit: '%', referenceRange: '4–5.6', optimalRange: '4.8–5.2', date: '2025-03-27', flag: 'abnormal' },
        { name: 'HDL Cholesterol (latest 2025-06)', relevancy: 'medium', value: '39', unit: 'mg/dL', referenceRange: '> 40', optimalRange: '60–90', date: '2025-06-09', flag: 'abnormal' },
        { name: 'Hemoglobin A1c (latest 2025-06)', relevancy: 'medium', value: '5.5', unit: '%', referenceRange: '4–5.6', optimalRange: '4.8–5.2', date: '2025-06-08', flag: 'in_range' },
        { name: 'White Blood Cell Count (latest 2025-06)', relevancy: 'low', value: '6.9', unit: 'K/µL', referenceRange: '4–11', optimalRange: '5–7', date: '2025-06-08', flag: 'in_range' },
      ],
    },
    {
      categoryId: 'sleep',
      categoryName: 'Sleep Health',
      status: 'needs_attention',
      narrative:
        'While direct sleep metrics remain absent, data from the August 2025 clinic facesheet reveals a potent combination of sleep-disrupting pharmacological and lifestyle exposures. The patient uses nightly THC and citalopram (both established REM-sleep suppressors), alongside Adderall XR and bupropion SR (which increase hyperarousal and the risk of sleep-onset/maintenance insomnia), and propranolol (which can suppress endogenous melatonin). Combined with the established 2025 metabolic pattern of hyperinsulinemia and dyslipidemia, this profile strongly suggests compromised sleep architecture. Comprehensive sleep assessment, including architecture evaluation and OSA screening, is highly indicated.',
      counts: { abnormal: 3, inRange: 3, optimal: 0 },
      biomarkers: [
        { name: 'Insulin', relevancy: 'medium', value: '27.8', unit: 'µIU/mL', referenceRange: '2–25', optimalRange: '2–8', date: '2025-06-08', flag: 'abnormal' },
        { name: 'Triglycerides', relevancy: 'medium', value: '187', unit: 'mg/dL', referenceRange: '< 150', optimalRange: '< 100', date: '2025-06-09', flag: 'abnormal' },
        { name: 'Hemoglobin A1c (latest 2025-06)', relevancy: 'medium', value: '5.5', unit: '%', referenceRange: '4–5.6', optimalRange: '4.8–5.2', date: '2025-06-08', flag: 'abnormal' },
        { name: 'HDL Cholesterol', relevancy: 'low', value: '39', unit: 'mg/dL', referenceRange: '> 40', optimalRange: '60–90', date: '2025-06-09', flag: 'in_range' },
        { name: 'TSH (baseline 2025-03)', relevancy: 'low', value: '1.21', unit: 'mIU/L', referenceRange: '0.4–4.5', optimalRange: '0.5–2.5', date: '2025-03-27', flag: 'in_range' },
        { name: 'TSH (latest 2025-06)', relevancy: 'low', value: '1.72', unit: 'mIU/L', referenceRange: '0.4–4.5', optimalRange: '0.5–2.5', date: '2025-06-08', flag: 'in_range' },
      ],
    },
    {
      categoryId: 'skin',
      categoryName: 'Skin Health',
      status: 'needs_attention',
      narrative:
        'The recent clinic facesheet documents a diagnosis of psoriasis, establishing an active inflammatory skin condition that requires targeted management and surveillance. While systemic inflammation appears low (hs-CRP 0.5 mg/L), persistent hyperinsulinemia (fasting insulin 27.8 µIU/mL) is a recognized comorbidity and metabolic driver that can exacerbate inflammatory dermatoses and shape tissue repair. A comprehensive dermatology evaluation is warranted to stage the psoriasis, review UV-exposure history, and perform a full-body skin cancer screening.',
      counts: { abnormal: 1, inRange: 1, optimal: 0 },
      biomarkers: [
        { name: 'Insulin', relevancy: 'medium', value: '27.8', unit: 'µIU/mL', referenceRange: '2–25', optimalRange: '2–8', date: '2025-06-08', flag: 'abnormal' },
        { name: 'hs-CRP', relevancy: 'low', value: '0.5', unit: 'mg/L', referenceRange: '< 1', optimalRange: '< 1', date: '2025-06-08', flag: 'in_range' },
      ],
    },
    {
      categoryId: 'blood',
      categoryName: 'Blood Health',
      status: 'optimal',
      narrative:
        'Blood counts are reassuring: CBC markers from 2025-06-09, now slightly beyond the usual 12-month cadence, show no anemia, leukocyte abnormality, or platelet disorder, and the historical trend back to 2023 is stable. Hemoglobin 15.0 g/dL, hematocrit 45.3%, WBC 6.9 K/µL, and platelets 233 K/µL support a currently preserved hematologic status. Still, iron stores and hematinic status were not assessed; ferritin, an iron panel, B12, folate, and ideally a CBC differential should be added on the next draw to confirm the normal CBC is durable and nutritionally supported.',
      counts: { abnormal: 0, inRange: 1, optimal: 4 },
      biomarkers: [
        { name: 'Hemoglobin (latest 2025-06)', relevancy: 'high', value: '15.0', unit: 'g/dL', referenceRange: '13.5–17.5', optimalRange: '14–16', date: '2025-06-08', flag: 'optimal' },
        { name: 'Hemoglobin (baseline 2025-03)', relevancy: 'high', value: '15.6', unit: 'g/dL', referenceRange: '13.5–17.5', optimalRange: '14–16', date: '2025-03-27', flag: 'in_range' },
        { name: 'Hematocrit (latest 2025-06)', relevancy: 'medium', value: '45.3', unit: '%', referenceRange: '38.5–50', optimalRange: '42–48', date: '2025-06-08', flag: 'optimal' },
        { name: 'White Blood Cell Count', relevancy: 'low', value: '6.9', unit: 'K/µL', referenceRange: '4–11', optimalRange: '5–7', date: '2025-06-08', flag: 'optimal' },
        { name: 'Platelet Count', relevancy: 'low', value: '233', unit: 'K/µL', referenceRange: '150–450', optimalRange: '200–300', date: '2025-06-08', flag: 'optimal' },
      ],
    },
    {
      categoryId: 'cancer_screening',
      categoryName: 'Cancer Screening',
      status: 'optimal',
      narrative:
        'Cancer screening status is now partially documented and up to date for the most critical age-appropriate metric. The patient completed a normal screening colonoscopy in 2020, satisfying colorectal screening requirements until 2030. However, new family history data reveals pancreatic cancer (paternal grandfather), breast cancer (mother), and leukemia (paternal grandmother). This pedigree warrants a formal hereditary cancer risk assessment to determine whether genetic testing or earlier/enhanced surveillance is indicated. As the patient approaches age 50, a shared decision-making discussion regarding baseline PSA testing for prostate cancer screening is also due. The patient is a non-smoker and is not eligible for low-dose CT lung cancer screening.',
      counts: { abnormal: 0, inRange: 0, optimal: 0 },
      biomarkers: [],
    },
  ],
}

/** A lighter report to show that the renderer skips sections with no data. */
export function lightReport(name: string, sex: 'male' | 'female', age: number): ReportData {
  return {
    meta: {
      patient: { name, sex, age },
      preparedBy: 'Dr. Doron',
      assessmentDate: '2026-07-08',
      generatedDate: '2026-07-10',
    },
    healthStatus: {
      narrative:
        'Overall an excellent assessment. One area — vitamin D — needs a simple correction; everything else is in range or optimal. No medications are indicated.',
      authorName: 'Dr. Doron',
    },
    story: [], // intentionally empty — the story section should be skipped
    goals: [
      {
        order: 1,
        title: 'Correct vitamin D deficiency',
        condition: 'Vitamin D insufficiency',
        domains: ['Nutrition'],
        timeframeWeeks: 12,
        metrics: [
          { name: 'Vitamin D (25-OH)', current: '21 ng/mL', target: '40–60 ng/mL', timeframe: '12 weeks' },
        ],
      },
    ],
    plan: {
      items: [
        { id: 'p-vitd', kind: 'supplement', title: 'Vitamin D3 4000 IU daily' },
        { id: 'p-retest', kind: 'testing', title: '12-week vitamin D re-test' },
      ],
    },
    orders: { labs: ['Vitamin D 25-OH (repeat, week 12)'], referrals: [], imaging: [] },
    timeline: [
      {
        offsetLabel: 'Now',
        entries: [
          { planItemId: 'p-vitd', planItemTitle: 'Vitamin D3 4000 IU daily', kind: 'supplement', action: 'Start 4000 IU daily with breakfast' },
        ],
      },
      {
        offsetLabel: '12 weeks',
        entries: [
          { planItemId: 'p-retest', planItemTitle: '12-week vitamin D re-test', kind: 'testing', action: 'Repeat vitamin D 25-OH level' },
        ],
      },
    ],
    coach: [
      {
        planItemId: 'p-vitd',
        title: 'Vitamin D3 4000 IU daily',
        whatToDo: 'Take 4000 IU of vitamin D3 every morning with breakfast (a meal containing some fat).',
        whyItMatters: 'Your level of 21 ng/mL is low enough to affect bone, muscle and immune function.',
        howItWorks: 'Vitamin D is fat-soluble; taking it with a meal roughly doubles absorption compared with an empty stomach.',
        week1Plan: 'Start immediately. Put the bottle next to the coffee maker so it pairs with an existing habit.',
        faq: [
          { q: 'Can I take a weekly mega-dose instead?', a: 'Daily dosing keeps blood levels steadier and is what the re-test assumes. Stick with daily for these 12 weeks.' },
        ],
        tip: 'Sunlight still counts — 15 minutes of midday sun on forearms adds a meaningful amount in summer.',
      },
    ],
    deepDive: [
      {
        categoryId: 'micronutrients',
        categoryName: 'Micronutrients',
        status: 'needs_attention',
        narrative: 'Vitamin D is the only out-of-range result. B12, folate and ferritin are all comfortably in range.',
        counts: { abnormal: 1, inRange: 2, optimal: 0 },
        biomarkers: [
          { name: 'Vitamin D (25-OH)', relevancy: 'high', value: '21', unit: 'ng/mL', referenceRange: '30–100', optimalRange: '40–60', date: '2026-07-08', flag: 'abnormal' },
          { name: 'Vitamin B12', relevancy: 'medium', value: '486', unit: 'pg/mL', referenceRange: '232–1245', optimalRange: '> 450', date: '2026-07-08', flag: 'in_range' },
          { name: 'Ferritin', relevancy: 'low', value: '88', unit: 'ng/mL', referenceRange: '30–400', optimalRange: '50–150', date: '2026-07-08', flag: 'in_range' },
        ],
      },
    ],
  }
}
