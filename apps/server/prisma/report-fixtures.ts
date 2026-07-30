import type { ReportData } from '@app/shared'

/**
 * Fully synthetic patients. Values are invented in the spirit of the reference
 * report (fasting insulin ~27.8 µIU/mL, triglycerides ~187, HDL 39, LDL 101,
 * A1c 5.5%, eGFR 66, creatinine 1.33, estradiol 53).
 */

export const FULL_REPORT: ReportData = {
  meta: {
    patient: { name: 'Marcus Ellison', sex: 'male', age: 52 },
    preparedBy: 'Dr. Adina Doron, MD',
    assessmentDate: '2026-07-14',
    generatedDate: '2026-07-21',
  },
  healthStatus: {
    narrative:
      'Marcus, your overall foundation is strong: your heart rhythm, liver enzymes, blood counts and inflammation markers all look good. The assessment did surface three connected areas that need attention. First, your fasting insulin is markedly elevated while your blood sugar is still near-normal — the classic early signature of insulin resistance, and the best possible time to reverse it. Second, your lipid pattern (high triglycerides with low HDL) is the metabolic mirror of that same process. Third, your kidney filtration rate is mildly reduced, which we want to protect while we work on the first two. None of these are emergencies; all of them respond well to the plan below.',
    authorName: 'Dr. Adina Doron, MD',
  },
  story: [
    {
      title: 'Where you are today',
      body: 'Your body is producing almost three times the ideal amount of insulin to keep your blood sugar in range. That effort is succeeding for now — your A1c of 5.5% is still normal — but it is also driving your liver to package extra fat into triglycerides and pulling your protective HDL down.',
    },
    {
      title: 'How you got here',
      body: 'A decade of a sedentary desk role, evening snacking and gradually declining muscle mass shifted how your body handles carbohydrate. Muscle is the largest "sink" for blood sugar; with less of it, insulin has to work harder. Your family history of type 2 diabetes adds background risk, but genetics load the gun — lifestyle pulls the trigger.',
    },
    {
      title: 'Where we are headed',
      body: 'The next 12 weeks focus on rebuilding that sink: regular zone-2 aerobic work, two resistance sessions a week, and a Mediterranean-style plate that lowers the insulin demand of each meal. A low starting dose of metformin gives the process a pharmacological tailwind. We re-test at week 12 and expect fasting insulin, triglycerides and HDL to have moved meaningfully.',
    },
  ],
  goals: [
    {
      order: 1,
      title: 'Restore insulin sensitivity',
      condition: 'Insulin resistance (early)',
      domains: ['Metabolic', 'Nutrition', 'Exercise'],
      timeframeWeeks: 12,
      metrics: [
        { name: 'Fasting insulin', current: '27.8 µIU/mL', target: '< 15 µIU/mL', timeframe: '12 weeks' },
        { name: 'Fasting glucose', current: '104 mg/dL', target: '< 95 mg/dL', timeframe: '12 weeks' },
        { name: 'Waist circumference', current: '41 in', target: '38 in', timeframe: '12 weeks' },
      ],
    },
    {
      order: 2,
      title: 'Improve lipid profile',
      condition: 'Atherogenic dyslipidemia',
      domains: ['Cardiovascular', 'Nutrition'],
      timeframeWeeks: 12,
      metrics: [
        { name: 'Triglycerides', current: '187 mg/dL', target: '< 150 mg/dL', timeframe: '12 weeks' },
        { name: 'HDL cholesterol', current: '39 mg/dL', target: '> 45 mg/dL', timeframe: '12 weeks' },
        { name: 'Triglyceride/HDL ratio', current: '4.8', target: '< 3.0', timeframe: '12 weeks' },
      ],
    },
    {
      order: 3,
      title: 'Protect kidney function',
      condition: 'Mildly reduced eGFR',
      domains: ['Kidney', 'Hydration'],
      timeframeWeeks: 24,
      metrics: [
        { name: 'eGFR', current: '66 mL/min/1.73m²', target: '≥ 66 (stable)', timeframe: '24 weeks' },
        { name: 'Creatinine', current: '1.33 mg/dL', target: '< 1.30 mg/dL', timeframe: '24 weeks' },
      ],
    },
    {
      order: 4,
      title: 'Build aerobic capacity',
      condition: 'Deconditioning',
      domains: ['Exercise'],
      timeframeWeeks: 12,
      metrics: [
        { name: 'Zone-2 minutes per week', current: '0 min', target: '150 min', timeframe: '12 weeks' },
        { name: 'Resting heart rate', current: '74 bpm', target: '< 68 bpm', timeframe: '12 weeks' },
      ],
    },
  ],
  plan: {
    items: [
      { id: 'p-zone2', kind: 'lifestyle', title: 'Zone-2 aerobic training' },
      { id: 'p-resistance', kind: 'lifestyle', title: 'Resistance training 2×/week' },
      { id: 'p-diet', kind: 'diet', title: 'Mediterranean, lower-carbohydrate plate' },
      { id: 'p-metformin', kind: 'medication', title: 'Metformin ER 500 mg' },
      { id: 'p-omega3', kind: 'supplement', title: 'Omega-3 (EPA/DHA) 2 g daily' },
      { id: 'p-retest', kind: 'testing', title: '12-week metabolic re-test' },
    ],
  },
  orders: {
    labs: [
      'Fasting insulin + glucose (repeat, week 12)',
      'Lipid panel (repeat, week 12)',
      'Comprehensive metabolic panel with eGFR (repeat, week 12)',
      'HbA1c (week 12)',
    ],
    referrals: [
      'Registered dietitian — metabolic nutrition program',
      'Exercise physiologist — supervised program start',
    ],
    imaging: ['DEXA body-composition scan (baseline, within 2 weeks)'],
  },
  timeline: [
    {
      offsetLabel: 'Now',
      entries: [
        { planItemId: 'p-metformin', planItemTitle: 'Metformin ER 500 mg', kind: 'medication', action: 'Start 500 mg with your evening meal' },
        { planItemId: 'p-zone2', planItemTitle: 'Zone-2 aerobic training', kind: 'lifestyle', action: 'Begin with two 30-minute brisk walks this week' },
        { planItemId: 'p-diet', planItemTitle: 'Mediterranean plate', kind: 'diet', action: 'Swap refined carbohydrates at dinner for vegetables + protein' },
      ],
    },
    {
      offsetLabel: '1 week',
      entries: [
        { planItemId: 'p-omega3', planItemTitle: 'Omega-3 (EPA/DHA) 2 g daily', kind: 'supplement', action: 'Start 2 g daily with food' },
        { planItemId: 'p-diet', planItemTitle: 'Mediterranean plate', kind: 'diet', action: 'Dietitian visit — personalize the meal template' },
      ],
    },
    {
      offsetLabel: '2 weeks',
      entries: [
        { planItemId: 'p-resistance', planItemTitle: 'Resistance training 2×/week', kind: 'lifestyle', action: 'First supervised session with exercise physiologist' },
        { planItemId: 'p-zone2', planItemTitle: 'Zone-2 aerobic training', kind: 'lifestyle', action: 'Progress to three 40-minute sessions' },
      ],
    },
    {
      offsetLabel: '4 weeks',
      entries: [
        { planItemId: 'p-metformin', planItemTitle: 'Metformin ER 500 mg', kind: 'medication', action: 'Check-in call: tolerance review, increase to 1000 mg if comfortable' },
        { planItemId: 'p-retest', planItemTitle: 'DEXA body composition', kind: 'testing', action: 'Baseline DEXA scan' },
      ],
    },
    {
      offsetLabel: '8 weeks',
      entries: [
        { planItemId: 'p-zone2', planItemTitle: 'Zone-2 aerobic training', kind: 'lifestyle', action: 'Target reached: 150 zone-2 minutes/week' },
      ],
    },
    {
      offsetLabel: '12 weeks',
      entries: [
        { planItemId: 'p-retest', planItemTitle: '12-week metabolic re-test', kind: 'testing', action: 'Repeat fasting insulin, lipids, CMP, HbA1c' },
        { planItemId: 'p-retest', planItemTitle: 'Follow-up visit', kind: 'testing', action: 'Review results and adjust the plan' },
      ],
    },
  ],
  coach: [
    {
      planItemId: 'p-metformin',
      title: 'Metformin ER 500 mg',
      whatToDo:
        'Take one 500 mg extended-release tablet with your evening meal. After the week-4 check-in, and only if we agree, increase to two tablets (1000 mg) with the same meal.',
      whyItMatters:
        'Metformin lowers the amount of glucose your liver releases overnight, which directly reduces how much insulin your body must produce. It is the best-studied first medication for insulin resistance.',
      howItWorks:
        'It activates an energy sensor (AMPK) in liver cells, telling them to burn fuel rather than export it as glucose. Less exported glucose means less insulin demand — and lower fasting insulin over time.',
      week1Plan:
        'Days 1–7: 500 mg with dinner. Expect mild stomach rumbling for the first few days; taking it mid-meal helps. Keep a note of any side effects for the week-4 call.',
      faq: [
        {
          q: 'Will metformin cause low blood sugar?',
          a: 'On its own, almost never. It reduces glucose production rather than forcing sugar down, so it does not cause hypoglycemia the way insulin or sulfonylureas can.',
        },
        {
          q: 'Can I take it with my other supplements?',
          a: 'Yes. Separate it from the omega-3 by an hour if you notice stomach upset, but there is no interaction.',
        },
      ],
      tip: 'The extended-release version is much gentler on digestion — always take it with food, never on an empty stomach.',
      safety: {
        avoid:
          'Avoid binge drinking or more than 2 alcoholic drinks in a day while on metformin — alcohol raises the risk of lactic acidosis. Pause the medication on any day you cannot keep fluids down (vomiting/diarrhea).',
        monitoring:
          'We will check kidney function (creatinine/eGFR) at week 12 and then every 6 months, because metformin is cleared by the kidneys and yours are running mildly below normal.',
        dosing:
          'Start 500 mg once daily with the evening meal. Do not increase the dose yourself — the week-4 review decides the step to 1000 mg.',
        callUs:
          'Call us right away if you experience severe stomach pain, unusual muscle pain, trouble breathing, extreme fatigue or drowsiness, or feeling cold in your arms and legs — these can be early signs of lactic acidosis, a rare but serious side effect.',
      },
    },
    {
      planItemId: 'p-zone2',
      title: 'Zone-2 aerobic training',
      whatToDo:
        'Build to 150 minutes per week of steady, conversational-pace cardio (brisk walking, cycling, rowing). "Zone 2" means you can talk in full sentences but would rather not sing.',
      whyItMatters:
        'Zone-2 work is the single most effective lifestyle tool for insulin resistance: it grows the mitochondria in your muscles, which are the engines that clear glucose and triglycerides from your blood.',
      howItWorks:
        'At this intensity your muscles burn fat as their primary fuel, training them to switch fuels efficiently. Better "metabolic flexibility" means less insulin is needed after every meal.',
      week1Plan:
        'Two 30-minute brisk walks on non-consecutive days. If your watch tracks heart rate, aim for roughly 180 minus your age (≈128 bpm) as a ceiling.',
      faq: [
        {
          q: 'Is walking really enough?',
          a: 'Yes — at the right pace. The goal is duration and consistency, not intensity. A brisk walk that keeps your heart rate around 120–130 bpm counts fully.',
        },
        {
          q: 'What if I miss a session?',
          a: 'Just continue the schedule; do not double up. Consistency over weeks matters far more than any single session.',
        },
      ],
      tip: 'Attach sessions to an existing habit — for example, walk immediately after dinner. Post-meal walks also blunt the glucose spike from that meal.',
    },
    {
      planItemId: 'p-resistance',
      title: 'Resistance training 2×/week',
      whatToDo:
        'Two full-body strength sessions per week, starting supervised at week 2. Focus on the big movements: squat or leg press, hinge, push, pull — 2–3 sets of 8–12 repetitions each.',
      whyItMatters:
        'Muscle is your largest reservoir for blood glucose. Every kilogram of muscle you add permanently increases the amount of carbohydrate your body can store without insulin spikes.',
      howItWorks:
        'Muscle contractions move glucose transporters (GLUT4) to the cell surface even without insulin — a parallel, insulin-independent door for sugar to leave your bloodstream.',
      week1Plan:
        'Nothing yet — your first supervised session is scheduled for week 2. This week, just confirm the appointment with the exercise physiologist.',
      faq: [
        {
          q: 'Will lifting weights be safe for my knees?',
          a: 'Yes — the program starts machine-based and supervised, and load is progressed only when your form is solid.',
        },
        {
          q: 'Do I need a gym membership?',
          a: 'For the first month, sessions run at the clinic gym. After that we will set you up with a simple home or gym program, whichever you prefer.',
        },
      ],
      tip: 'Log your weights in the app after each session — visible progress is the strongest motivator we know.',
    },
    {
      planItemId: 'p-diet',
      title: 'Mediterranean, lower-carbohydrate plate',
      whatToDo:
        'Rebuild each meal around the plate template: half non-starchy vegetables, a quarter protein (fish, poultry, legumes), a quarter slow carbohydrates, dressed with olive oil. Keep refined starches and sugary drinks off the daily menu.',
      whyItMatters:
        'Every gram of refined carbohydrate you replace lowers the insulin demand of that meal. This eating pattern has the strongest evidence base for improving exactly your lipid pattern — high triglycerides with low HDL.',
      howItWorks:
        'Fewer fast carbohydrates mean smaller glucose surges, so the liver stops converting the overflow into triglycerides. Olive oil, nuts and fish shift the balance further by raising HDL.',
      week1Plan:
        'Change dinner only: swap the starch for a second vegetable and add a palm-sized protein portion. Breakfast and lunch stay as they are until the dietitian visit next week.',
      eatAvoid: {
        eat: [
          'Non-starchy vegetables (unlimited)',
          'Fatty fish 2–3×/week (salmon, sardines, mackerel)',
          'Extra-virgin olive oil as the main fat',
          'Legumes, nuts, berries',
          'Whole intact grains in fist-sized portions',
        ],
        avoid: [
          'Sugary drinks and fruit juice',
          'White bread, white rice, pastries',
          'Beer more than 2×/week',
          'Ultra-processed snacks',
          'Late-evening snacking after 9 pm',
        ],
      },
      faq: [
        {
          q: 'Do I have to count calories?',
          a: 'No. The plate template controls portions naturally. We only count one thing: how many days per week you follow the template — aim for at least 6.',
        },
        {
          q: 'Is fruit allowed?',
          a: 'Yes, 1–2 servings of whole fruit per day, ideally berries. It is fruit juice and dried fruit that behave like sugar.',
        },
      ],
      tip: 'Shop once a week from a fixed list. The template fails in the kitchen at 7 pm, not at the plate — make the default easy.',
    },
    {
      planItemId: 'p-omega3',
      title: 'Omega-3 (EPA/DHA) 2 g daily',
      whatToDo: 'Take 2 g of combined EPA/DHA daily with a meal that contains fat.',
      whyItMatters:
        'At this dose, omega-3 fatty acids reliably lower triglycerides by 15–25% — a direct assist for your lipid goal.',
      howItWorks:
        'EPA and DHA reduce the liver’s production of VLDL, the particle that carries triglycerides, and speed up clearance of the ones already in circulation.',
      week1Plan: 'Start at week 1 (after the metformin start week) so we can attribute any stomach upset correctly. Take with lunch or dinner.',
      faq: [
        {
          q: 'Fish oil gives me reflux — alternatives?',
          a: 'Take it frozen or with the largest meal of the day; enteric-coated or algae-based versions also help. Tell us if it persists and we will switch forms.',
        },
      ],
      tip: 'Store the bottle in the fridge — it slows oxidation and reduces the fishy aftertaste.',
    },
  ],
  deepDive: [
    {
      categoryId: 'metabolic',
      categoryName: 'Metabolic Health',
      status: 'at_risk',
      narrative:
        'Your fasting insulin of 27.8 µIU/mL is roughly three times the optimal level, while glucose (104 mg/dL) and A1c (5.5%) are only slightly above ideal. This combination — high insulin holding near-normal sugar — is the earliest and most reversible stage of insulin resistance.',
      counts: { abnormal: 2, inRange: 1, optimal: 0 },
      biomarkers: [
        { name: 'Fasting Insulin', relevancy: 'high', value: '27.8', unit: 'µIU/mL', referenceRange: '2.6–24.9', optimalRange: '≤ 8.0', date: '2026-07-14', flag: 'abnormal' },
        { name: 'Fasting Glucose', relevancy: 'high', value: '104', unit: 'mg/dL', referenceRange: '70–99', optimalRange: '75–90', date: '2026-07-14', flag: 'abnormal' },
        { name: 'HbA1c', relevancy: 'medium', value: '5.5', unit: '%', referenceRange: '< 5.7', optimalRange: '< 5.4', date: '2026-07-14', flag: 'in_range' },
      ],
    },
    {
      categoryId: 'cardiovascular',
      categoryName: 'Cardiovascular Health',
      status: 'needs_attention',
      narrative:
        'Triglycerides of 187 mg/dL with HDL of 39 mg/dL is the lipid signature of insulin resistance rather than a primary cholesterol problem. LDL at 101 mg/dL is acceptable. Expect this whole panel to improve together as insulin comes down.',
      counts: { abnormal: 2, inRange: 2, optimal: 0 },
      biomarkers: [
        { name: 'Triglycerides', relevancy: 'high', value: '187', unit: 'mg/dL', referenceRange: '< 150', optimalRange: '< 100', date: '2026-07-14', flag: 'abnormal' },
        { name: 'HDL Cholesterol', relevancy: 'high', value: '39', unit: 'mg/dL', referenceRange: '> 40', optimalRange: '> 50', date: '2026-07-14', flag: 'abnormal' },
        { name: 'LDL Cholesterol', relevancy: 'medium', value: '101', unit: 'mg/dL', referenceRange: '< 130', optimalRange: '< 100', date: '2026-07-14', flag: 'in_range' },
        { name: 'Total Cholesterol', relevancy: 'low', value: '178', unit: 'mg/dL', referenceRange: '< 200', optimalRange: '150–180', date: '2026-07-14', flag: 'in_range' },
      ],
    },
    {
      categoryId: 'kidney',
      categoryName: 'Kidney Function',
      status: 'needs_attention',
      narrative:
        'Your eGFR of 66 indicates mildly reduced filtration — common at your age, but worth protecting, especially while taking metformin. Creatinine is at the high end of normal. Hydration and blood-pressure control are the levers here.',
      counts: { abnormal: 1, inRange: 2, optimal: 0 },
      biomarkers: [
        { name: 'eGFR', relevancy: 'high', value: '66', unit: 'mL/min/1.73m²', referenceRange: '≥ 90', optimalRange: '≥ 90', date: '2026-07-14', flag: 'abnormal' },
        { name: 'Creatinine', relevancy: 'medium', value: '1.33', unit: 'mg/dL', referenceRange: '0.74–1.35', optimalRange: '0.80–1.10', date: '2026-07-14', flag: 'in_range' },
        { name: 'BUN', relevancy: 'low', value: '19', unit: 'mg/dL', referenceRange: '7–20', optimalRange: '10–18', date: '2026-07-14', flag: 'in_range' },
      ],
    },
    {
      categoryId: 'hormonal',
      categoryName: 'Hormonal Health',
      status: 'needs_attention',
      narrative:
        'Estradiol at 53 pg/mL is above the typical male range — a common finding alongside insulin resistance, since fat tissue converts testosterone to estradiol. Testosterone itself is solid. We expect estradiol to normalize as body composition improves; no medication is warranted now.',
      counts: { abnormal: 1, inRange: 0, optimal: 1 },
      biomarkers: [
        { name: 'Estradiol', relevancy: 'medium', value: '53', unit: 'pg/mL', referenceRange: '10–40', optimalRange: '20–35', date: '2026-07-14', flag: 'abnormal' },
        { name: 'Total Testosterone', relevancy: 'high', value: '512', unit: 'ng/dL', referenceRange: '300–1000', optimalRange: '500–900', date: '2026-07-14', flag: 'optimal' },
      ],
    },
    {
      categoryId: 'inflammation',
      categoryName: 'Inflammation',
      status: 'optimal',
      narrative:
        'Inflammation markers are excellent. hs-CRP under 1.0 puts you in the lowest cardiovascular-risk tertile for this marker — a genuine strength to build on.',
      counts: { abnormal: 0, inRange: 1, optimal: 1 },
      biomarkers: [
        { name: 'hs-CRP', relevancy: 'high', value: '0.9', unit: 'mg/L', referenceRange: '< 3.0', optimalRange: '< 1.0', date: '2026-07-14', flag: 'optimal' },
        { name: 'Homocysteine', relevancy: 'low', value: '9.2', unit: 'µmol/L', referenceRange: '< 15', optimalRange: '< 10', date: '2026-07-14', flag: 'in_range' },
      ],
    },
  ],
}

/** A lighter report to show that the renderer skips sections with no data. */
export function lightReport(name: string, sex: 'male' | 'female', age: number): ReportData {
  return {
    meta: {
      patient: { name, sex, age },
      preparedBy: 'Dr. Adina Doron, MD',
      assessmentDate: '2026-07-08',
      generatedDate: '2026-07-10',
    },
    healthStatus: {
      narrative:
        'Overall an excellent assessment. One area — vitamin D — needs a simple correction; everything else is in range or optimal. No medications are indicated.',
      authorName: 'Dr. Adina Doron, MD',
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
