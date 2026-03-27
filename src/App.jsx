import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  bg:'#0D1B3E', card:'#162950', card2:'#1A3060', teal:'#00BCD4',
  gold:'#FFD54F', coral:'#FF5252', green:'#4CAF50', muted:'#8EACC8',
  pearlBg:'#0A3253', dangerBg:'#4A1018', dark:'#081228', white:'#FFFFFF',
};

const CASES = [
{
    id:1, title:"Septic Shock + Evolving ARDS", domain:"Sepsis & Circulatory Shock", difficulty:"High",
    stem:`62M, BMI 27, T2DM, COPD FEV1 45%. Three days fever, productive cough, worsening dyspnoea.

ICU ARRIVAL:
• GCS 13, agitated, accessory muscles
• RR 32 | SpO2 86% on 15L NRB | HR 118 | BP 82/46 (MAP 58)
• Temp 38.9°C | Mottled | CRT 5 seconds
• ABG (FiO2 0.8): pH 7.31 | PaCO2 32 | PaO2 58 | HCO3 16 | Lactate 4.8
• UO: 15 mL in 2 hours
• WBC 18 | Cr 1.9 (base 1.0) | Plt 120 | CRP 280 | PCT 14
• CXR: RLL consolidation + bilateral patchy infiltrates

ALREADY GIVEN: 20 mL/kg crystalloid, pip-tazo + azithromycin within 1h.`,
    progressive_data:["After bolus + norad started: MAP 62, lactate 5.1, still mottled.","Post-intubation: SpO2 94%, VT 6 mL/kg PBW, PEEP 10, FiO2 0.8. P/F=120. Pplat 28.","Hour 3: Norad 0.6 mcg/kg/min, MAP 60, lactate 5.2, UO 10 mL/h.","Echo: hyperdynamic LV (EF 70%), dilated RV TAPSE 16, IVC collapsing >50%, no tamponade."],
    key_probes:["Structure your immediate priorities — first 5 minutes, in order.","RSI: justify drug choice given this haemodynamic state.","Lung-protective ventilation — exact targets with numbers. Driving pressure is 20 cmH2O.","Hour 3: norad 0.6, MAP 60, lactate 5.2. What next and why?","P/F 120, dilated RV on echo. When do you prone, and does the echo change that decision?"],
    pearls:["Septic shock = infection + vasopressor to maintain MAP ≥65 + lactate >2 despite adequate fluid. All three criteria explicitly.","RSI: ketamine preserves SVR. Propofol causes vasodilation — dangerous in shocked patients.","Driving pressure = Pplat − PEEP. Target <15 cmH2O. More predictive of VILI than Pplat alone.","Vasopressin ≤0.03 U/min = SSC second-line after norad.","Prone threshold: P/F <150 on FiO2 ≥0.6, PEEP ≥5. Minimum 16 hours/session."],
    pitfalls:["COPD FEV1 45%: high PEEP risks dynamic hyperinflation. Check flow-time curve post-intubation.","Hyperdynamic echo ≠ pure distributive shock. Dilated RV signals pulmonary vascular involvement.","After 30 mL/kg, further fluid only if dynamic indices confirm responsiveness AND no fluid intolerance.","Lactate clearance (10% per 2h) guides resuscitation — not the absolute value."]
  },
{
    id:2, title:"Severe ARDS — High Plateau Pressures", domain:"Respiratory Failure & ARDS", difficulty:"High",
    stem:`54F, 165 cm, 95 kg (PBW = 60 kg). Severe influenza pneumonia + septic shock. Intubated in ED. ICU Day 2.

VENTILATOR:
• VCV | VT 360 mL (6 mL/kg PBW) | RR 26 | PEEP 12 | FiO2 0.7
• Pplat 32–34 cmH2O | Driving pressure 20–22 cmH2O
• P/F 95–110 | pH 7.29–7.32 | PaCO2 48–52
• Norad 0.16 mcg/kg/min | MAP 70–75
• Sedated RASS -3 + low-dose NMBA for dyssynchrony
• Echo: normal LV, no RV dysfunction`,
    progressive_data:["VT reduced to 5 mL/kg: Pplat 30, DP 18. pH 7.26, PaCO2 58. Haemodynamics stable.","P/F deteriorates to 88 despite PEEP 14, FiO2 0.75. No haemodynamic change.","First prone session 16h: P/F improved to 162, pH 7.31. Stable throughout.","Day 5: P/F still <150 supine. Echo: moderate RV dilation, D-sign, TAPSE 12. Norad creeping up."],
    key_probes:["Classify ARDS severity. What does that mandate next?","Driving pressure 20–22 cmH2O — exact corrective steps.","P/F drops to 88 despite PEEP 14. Your next intervention.","First prone improved P/F to 162. What is your ongoing prone protocol?","Day 5: new RV dilation, D-sign, TAPSE 12. How does this change your ventilator strategy?"],
    pearls:["PBW from HEIGHT not actual weight. 165 cm female: PBW ≈ 60 kg. Using 95 kg gives VT 570 mL — lethal.","Berlin severe ARDS = P/F ≤100. Driving pressure >15 = independent mortality predictor. Reduce VT first.","Permissive hypercapnia acceptable to pH ≥7.20. Contraindications: raised ICP, severe PH, RV failure.","VV-ECMO: P/F <80 for >6h or <50 for >3h despite optimal conventional therapy including proning."],
    pitfalls:["ESICM 2023: routine aggressive recruitment manoeuvres NOT recommended.","ARDS cor pulmonale: high PEEP worsens RV afterload. Accept worse oxygenation to protect the RV.","Never prone a haemodynamically unstable patient. Define MAP floor first.","NMBA beyond 48h risks ICUAW. Reassess daily."]
  },
{
    id:3, title:"Mixed Septic–Cardiogenic Shock", domain:"Advanced Haemodynamics", difficulty:"High",
    stem:`70M, previous anterior STEMI, LVEF 30%, on GDMT. CAP. Post 2L crystalloid + antibiotics — still shocked.

ICU ARRIVAL:
• MAP 54 | HR 110 AF | Temp 38.4°C | RR 28 | SpO2 92% on 6L
• Lactate 4.2 | UO 10 mL/h | pH 7.30 | PaO2 68 (FiO2 0.4)
• NT-proBNP 12,000 pg/mL | hs-Tn mildly elevated
• Echo: dilated LV, LVEF 25%, moderate MR, no tamponade
• RV moderately impaired | IVC plethoric, minimal respiratory variation`,
    progressive_data:["250 mL bolus: MAP unchanged 55. New bilateral crackles. SpO2 88%.","Norad 0.35 + dobutamine 5 mcg/kg/min: MAP 65. ScvO2 58%. UO 20 mL/h.","Hour 6: Lactate 5.8 despite MAP 65. Echo: TAPSE 11, PASP 52 mmHg.","PiCCO: CI 1.6 | SVRI 2800 | GEDVI 850 mL/m2 | EVLWI 18 mL/kg"],
    key_probes:["Label this shock phenotype precisely. What makes it mixed and why does that matter?","Why is further fluid dangerous here — haemodynamic physiology.","ScvO2 58% despite MAP 65 on norad + dobutamine. What does this tell you?","Lactate 5.8 with MAP maintained. Two most important differentials.","PiCCO: CI 1.6, SVRI 2800, GEDVI 850, EVLWI 18. Interpret and tell me what you change."],
    pearls:["Mixed shock: distributive physiology + failing ventricle. SSC 30 mL/kg applies to pure distributive — contraindicated here.","ScvO2 <65% + CI 1.6 = inadequate O2 delivery despite adequate MAP. Low output confirmed. Dobutamine correct.","GEDVI 850 = upper preload limit. EVLWI 18 = pulmonary oedema. Next step is diuresis, not fluid.","Vasopressin preferred over escalating norad in mixed shock with RV failure."],
    pitfalls:["Dobutamine without adequate vasopressor worsens hypotension. Always add to, never substitute for, norad.","AF with rapid rate worsens diastolic filling. Rate control may improve CO as much as inotropes.","Mildly elevated troponin = Type 2 MI. Do not reflexively activate cath lab.","Avoid high PEEP in RV failure — increases RV afterload."]
  },
{
    id:4, title:"Severe TBI + Raised ICP", domain:"Neurocritical Care", difficulty:"High",
    stem:`28M. High-speed RTC. GCS 6 (E1V1M4). Right pupil 5 mm non-reactive, left 3 mm reactive.
CT: right acute SDH, 8 mm midline shift, compressed basal cisterns.

POST DECOMPRESSIVE CRANIECTOMY + HAEMATOMA EVACUATION:
• MAP 75–80 | ICP 16–18 mmHg | CPP ≈ 58–62 mmHg
• VT 6–7 mL/kg PBW | PEEP 5 | PaCO2 36–38
• Hb 9.8 | Plt 150 | INR 1.1 | Na 141`,
    progressive_data:["ICP suddenly 28–30 during tracheal suction. MAP 78. CPP 50.","After sedation bolus + HOB 30°: ICP 24, CPP 54. Still above threshold.","ICP 24–26 persisting. Na 141, osmolality 295. Normothermic. No seizures on EEG.","CT: no new haematoma. Diffuse oedema. Craniectomy bulging — expected."],
    key_probes:["Immediate priorities first 1–2 hours. ICP and CPP targets — cite the guideline.","ICP spikes to 28 during suction. CPP 50. First three steps, in order.","ICP 24–26 persisting. Mannitol or hypertonic saline — which and why?","When is hyperventilation justified — indication, PaCO2 target, and the specific risk.","When do you neuroprognosticate in TBI — timing, modalities, what do you tell the family Day 2?"],
    pearls:["ICP threshold: >22 mmHg (BTF 4th Ed). CPP target: 60–70 mmHg, individualised to autoregulation.","Tiered ICP: T1=positioning/sedation/normocapnia. T2=hyperosmolar. T3=hyperventilation rescue. T4=barbiturate/decompression.","HTS preferred over mannitol if Na <145, haemodynamic instability, hypovolaemia. Stop if Na >155 or osmolality >320.","Hyperventilation PaCO2 30–35: rescue ONLY for impending herniation. Causes ischaemia via vasoconstriction."],
    pitfalls:["SBP <100 in TBI doubles mortality. Single hypotensive episode = catastrophic secondary injury.","Prophylactic hyperventilation is harmful. Reserve for transtentorial herniation only.","No definitive prognostication within 72h. Multimodal assessment only.","Fever in TBI = catastrophic secondary injury. Target normothermia actively."]
  },
{
    id:5, title:"Post-Cardiac Arrest — Neuroprognostication", domain:"Cardiac & Post-Arrest Care", difficulty:"High",
    stem:`58F. Hypertension, dyslipidaemia. OHCA VF arrest. Bystander CPR within 3 min. Low-flow time 25 min to ROSC.

POST-PCI (anterior STEMI treated):
• Comatose — no eye opening, no response to pain, minimal brainstem reflexes
• Stable on low-dose norad | TTM at 36°C
• Echo: anterior WMA, LVEF ~35%
• pH 7.22 | Lactate 6.1 | Glu 12.4`,
    progressive_data:["24h: Sedation lightening. Generalised myoclonic jerks persisting >30 minutes.","36h: Off sedation 12h confirmed. GCS M1. EEG: burst suppression, absent reactivity.","72h: GCS M1. 24h since last sedation. CT: diffuse grey-white loss, sulcal effacement.","SSEP: bilateral absent N20. NSE at 48h = 82 mcg/L (normal <17)."],
    key_probes:["First 24h post-ROSC priorities. TTM 33°C vs 36°C — what do you choose?","Oxygenation targets post-ROSC. Why does hyperoxia specifically matter?","24h: generalised myoclonic jerks persisting >30 min. What are you thinking?","Walk me through ERC/ESICM 2021 neuroprognostication algorithm — timing and modalities.","72h: bilateral absent N20, malignant EEG, diffuse grey-white loss, NSE 82. What do you tell the family?"],
    pearls:["ERC/ESICM 2021: no final prognostication before 72h post-ROSC AND after sedative clearance.","Multimodal required: clinical exam + EEG + SSEP (absent N20) + NSE + neuroimaging.","Bilateral absent N20 = strongest poor outcome predictor. False positive rate <5% in correct timeframe.","Target PaO2 75–100 mmHg post-arrest. Hyperoxia causes oxidative neuronal injury."],
    pitfalls:["Self-fulfilling prophecy: early WLST on incomplete prognostication. Follow the algorithm.","Generalised myoclonic status ≠ Lance-Adams. Prolonged generalised myoclonus = malignant. Get EEG urgently.","NSE falsely elevated by haemolysis. Always check before interpreting.","TTM: fever avoidance matters more than target temperature. Normothermia for 72h non-negotiable."]
  },
{
    id:6, title:"Post-op Septic Shock — Emergency Laparotomy", domain:"Peri-operative Critical Care", difficulty:"High",
    stem:`76F. COPD GOLD III, CKD Stage 3 (Cr baseline 1.4), AF on apixaban.
Hartmann's procedure + peritoneal lavage for faecal peritonitis.

ICU POST-OP:
• MAP 62–68 | HR 110 | Temp 36°C | Norad 0.25 mcg/kg/min
• Lactate 5.5 | UO 0.2 mL/kg/h | pH 7.28 | Cr 2.1 | INR 1.5`,
    progressive_data:["6h: Lactate 3.2, UO improving. Temp 38.8. Blood culture: Gram-negative bacilli.","24h: Stable. Abdomen distending. UO falling. Bladder pressure 22 mmHg. Compliance dropping.","CT: small pelvic collection <3 cm, bowel oedema, ascites. IAP 25 confirmed.","Cr rising to 3.1. UO 8 mL/h. Peak airway pressures worsening. Lactate 2.8."],
    key_probes:["Immediate post-op priorities. She was on apixaban — reversal agent and why not FFP alone?","24h: bladder pressure 22, abdomen distending, compliance dropping. Diagnosis and criteria?","CT: small collection, bowel oedema, ascites. IAP 25. Management algorithm — in order.","Gram-negative bacilli on blood culture. Antimicrobial stewardship from here?","Cr 3.1, UO 8 mL/h. Assess this AKI and your RRT threshold."],
    pearls:["Apixaban reversal: andexanet alfa or 4F-PCC 25–50 units/kg. FFP dilutes without reversing anti-Xa.","ACS: IAP >20 + new organ dysfunction. Ladder: sedation → drainage → paracentesis → NMBA → decompression.","SIS guideline: 4 days antibiotics after adequate source control for intra-abdominal infection.","Hartmann's = no anastomosis. Anastomotic leak impossible. Pelvic collection = residual contamination."],
    pitfalls:["Bladder pressure: 25 mL via Foley, end-expiration, supine. Any deviation invalidates the reading.","Baseline Cr 1.4 → 2.1 = AKI Stage 1. Trajectory matters more than absolute value.","Culture-guided de-escalation mandatory by Day 2–3.","Pip-tazo appropriate empirically — but de-escalate to sensitivities."]
  },
{
    id:7, title:"NIV in AECOPD — Deterioration", domain:"Respiratory Failure", difficulty:"Medium",
    stem:`68M. Severe COPD FEV1 30%. Three days worsening dyspnoea, purulent sputum.
Drowsy, accessory muscles, pursed-lip breathing.
ABG on 4L O2: pH 7.28 | PaCO2 68 | PaO2 54 | HCO3 30

BiPAP: IPAP 16, EPAP 4, FiO2 0.4

2 HOURS:
• RR 26 | SpO2 90–92% | More alert | ABG: pH 7.31 | PaCO2 62

6 HOURS:
• Agitated, tachypnoeic, mask leaks | ABG: pH 7.23 | PaCO2 75 | PaO2 58`,
    progressive_data:["Interface changed to full face mask, IPAP 20, EPAP 6. Still agitated. RR 34.","1 hour: pH 7.20, PaCO2 82, RR 38. Mask intolerance worsening.","Patient drowsy. BP 90/60. Sparse respiratory effort. SpO2 84%. GCS 10.","Post-intubation: pH 7.18, PaCO2 90, PaO2 92. Breath sounds reduced bilaterally."],
    key_probes:["NIV indications in AECOPD — pH range, and where intubation becomes the right choice.","pH 7.23 at 6 hours. Has this patient failed NIV — your criteria?","You decide to intubate. RSI drug choice and why, specific to this patient.","Post-intubation: pH 7.18, PaCO2 90, reduced breath sounds. Differential and how do you assess for dynamic hyperinflation?","Sedation on NIV — is it safe, which agent, what monitoring is mandatory?"],
    pearls:["NIV zone: pH 7.25–7.35 = strong indication. pH <7.25 = intubate. pH 7.25–7.30 = NIV in ICU with 1:1 and intubation immediately ready.","NIV failure: pH not improving, PaCO2 not falling, RR >25, worsening mentation, mask intolerance.","Dynamic hyperinflation: intrinsic PEEP >5–8 on expiratory hold. Treat: slow RR, I:E 1:3+, disconnect if severe.","Post-intubation COPD: target baseline PaCO2 ~55–60, not 40. Normalising causes severe alkalosis."],
    pitfalls:["Increasing IPAP aggressively worsens air trapping. More pressure does not fix incomplete exhalation.","Sedation on NIV: only safe with 1:1 nursing, continuous SpO2, intubation capability at bedside.","RSI with propofol in type 2 RF: cardiovascular collapse risk. Ketamine is the agent.","Overcorrecting hypercapnia post-intubation: pH >7.55 → seizures, arrhythmias, cerebral vasoconstriction."]
  },
{
    id:8, title:"CCB Overdose — Toxin-Induced Shock", domain:"Toxicology", difficulty:"High",
    stem:`45F. Depression. Suspected sustained-release amlodipine ingestion ± other medications. ~4h post-ingestion.

ICU ARRIVAL:
• MAP 50 | HR 50 sinus bradycardia | SpO2 98% on 4L | GCS 13
• pH 7.22 | HCO3 12 | Lactate 6.0
• Glucose 12 mmol/L | K+ 4.8 | Creatinine normal
• ECG: sinus bradycardia, normal PR, no conduction defects`,
    progressive_data:["1L crystalloid + calcium gluconate 3g IV: MAP 55, HR 48. Persistent instability.","HIET started (1 unit/kg bolus, 1 unit/kg/h + glucose): 30 min — K+ 3.1. MAP improving to 62.","90 min: MAP falling to 50, HR 42, lactate 7.2. Norad 0.4 mcg/kg/min added.","GCS 8, BP 60/30, junctional rhythm. Team discussing lipid emulsion and ECMO."],
    key_probes:["CCB toxicity pathophysiology — two distinct mechanisms. Why is glucose 12 significant?","Immediate management priorities. Calcium given — what is the next specific intervention?","High-dose insulin euglycaemia therapy — explain the metabolic rationale.","90 minutes: MAP 50 again, lactate 7.2, junctional rhythm. Escalation options?","Make the case for VA-ECMO in this patient specifically."],
    pearls:["CCB toxicity: (1) vascular L-type → profound vasodilation; (2) cardiac L-type → impaired contractility + AV nodal suppression.","Hyperglycaemia in CCB OD = pathognomonic. Degree correlates with toxicity severity.","HIET: high-dose insulin enhances glucose uptake into cardiomyocytes → improved inotropy.","VA-ECMO: strongest toxicological indication. Drug reversible, clears 24–48h. Contact ECMO centre before arrest."],
    pitfalls:["SR amlodipine: peak absorption 6–12h. Stable at 4h can deteriorate suddenly. Consider whole-bowel irrigation.","Calcium boluses transient. Do not delay HIET.","HIET: glucose infusion mandatory, K+ every 30 min. The treatment itself can kill if unmonitored.","Lipid emulsion NOT first-line for amlodipine. Reserve for refractory cases or highly lipophilic co-ingestion."]
  },
{
    id:9, title:"Difficult Weaning + ICU-Acquired Weakness", domain:"Weaning & Chronic Critical Illness", difficulty:"Medium",
    stem:`60M, BMI 36, T2DM, hypertension. 4 weeks ICU — severe COVID ARDS → septic shock.
Course: prolonged proning, NMBA 14 days, VV-ECMO 10 days (decannulated 5 days ago).

CURRENT:
• PSV 12 | PEEP 8 | FiO2 0.4 | RR 24 | SpO2 94% | P/F ~190
• Failing ALL SBTs: tachypnoea, desaturation, anxiety at 8–12 min
• MRC sum score: 24/60 | CAM-ICU: positive`,
    progressive_data:["SBT T-piece 30 min: After 8 min — RR 38, SpO2 90%, RSBI 140. Stopped.","Echo: LVEF 45% (was 60%), E/e' 15, moderate diastolic dysfunction.","NCS/EMG: reduced CMAP bilaterally, normal conduction velocities, no denervation potentials.","Nutrition: albumin 22, phosphate 0.55 mmol/L, cumulative deficit ~15,000 kcal."],
    key_probes:["Contributors to difficult weaning — in order of importance.","Define SBT failure. RSBI came back 68 on PSV 12 — the registrar says extubatable. Is she right?","Echo: LVEF 45%, E/e' 15. How does diastolic dysfunction cause weaning failure?","NCS/EMG: reduced CMAP, normal velocities, no denervation. Diagnosis — and how does this differ from CIN?","Albumin 22, phosphate 0.55, caloric deficit 15,000 kcal. Nutritional strategy."],
    pearls:["SBT failure: RR >35, SpO2 <88%, HR or SBP change >20%, RSBI >105, or clinical distress. Any ONE criterion stops the trial.","RSBI must be measured on T-piece or CPAP 5/0. On PSV 12 it gives falsely low values. Classic EDIC trap.","Diastolic dysfunction + weaning: SB raises venous return → raises LVEDP in stiff LV → pulmonary oedema → failure.","CIM: reduced CMAP, normal velocities, normal SNAP. CIN: reduced CMAP AND SNAP, slowed velocities."],
    pitfalls:["Refeeding syndrome: phosphate 0.55 already low. Aggressive nutrition → K+/Mg2+/phosphate shift → arrhythmias. Start 50% target.","ICUAW: physiotherapy starts while still ventilated — not after extubation.","Delirium independently prolongs ventilation. Haloperidol does not reduce duration. ABCDE bundle.","Tracheostomy: consider when predicted >7–14 further days, 2–3 failed SBTs."]
  },
{
    id:10, title:"ICU Transport — Unstable Ventilated Patient", domain:"Transport & Safety", difficulty:"Medium",
    stem:`64M. Septic shock + moderate ARDS (P/F 145). Ventilated on norad 0.18 mcg/kg/min.
• MAP 68 | HR 96 | SpO2 95% | FiO2 0.55 | PEEP 10 | Pplat 28
• Lactate 2.1 (trending down) | UO 40 mL/h

SITUATION: Suspected mesenteric ischaemia. Surgical team requesting urgent CT abdomen.
ICU = 2 floors from radiology. Estimated transport + scan = 45–60 minutes.
You are the consultant. The registrar requests your decision.`,
    progressive_data:["En route: SpO2 88%, high pressure alarm, patient biting ETT. No bite block.","At CT: MAP 57. Norad pump alarming battery low. No spare battery.","Mid-CT: SpO2 84%. Decision to manually bag. CT halted — abdominal images not acquired.","Back in ICU. CT incomplete. Surgical team escalating. Mesenteric ischaemia unconfirmed."],
    key_probes:["Transport decision framework. Two key questions before any unstable patient leaves the ICU.","Pre-transport checklist — systematic and complete.","En route: SpO2 drops 95 to 88%, high pressure alarm, biting ETT. Stepwise response.","CT incomplete. Battery failed. Abdominal images missing. Surgical team frustrated. Options and how you rank them.","Documentation responsibilities after this transport and why it matters medicolegally."],
    pearls:["Transport decision: (1) will imaging change management? (2) can patient safely survive transport? Both documented.","Pre-transport ABCDE: Airway, Breathing (O2 = journey×2+30min buffer), Circulation (pump battery, drugs), Drugs, Equipment.","SpO2 drop: DOPE — Displacement, Obstruction, Pneumothorax, Equipment failure. Check patient before adjusting vent.","Minimum monitoring: continuous ECG, invasive arterial BP, SpO2, EtCO2, transport vent with disconnect alarm."],
    pitfalls:["Battery/O2 failure = most common avoidable transport adverse event. 100% preventable.","The receiving area is not an ICU. The transport team must be entirely self-sufficient.","Document transport decision rationale and adverse events. Omissions are as damaging as errors.","If you override a team's request for transport, document reasoning and inform the team in writing."]
  },
{
    id:11, title:"Tropical Sepsis — Dengue vs Bacterial vs Leptospirosis", domain:"Sepsis & Circulatory Shock", difficulty:"High",
    stem:`34M, returning traveller from Southeast Asia (Thailand/Vietnam), 10 days after return. Seven days of fever, severe myalgia, headache. Now presenting with hypotension and confusion.

ICU ARRIVAL:
• GCS 12 (E3V3M6) | Temp 39.4°C | HR 118 | BP 78/44 (MAP 55)
• RR 26 | SpO2 94% on 6L O2 | Mottled peripheries | CRT 4 seconds
• Jaundice clinically evident | Conjunctival suffusion noted

LABS:
• WBC 3.2 (lymphopenia) | Plt 28 ×10⁹/L | Hb 11.2
• Cr 3.1 (baseline unknown) | Bili 88 µmol/L | AST 420 | ALT 380
• LDH 1840 | CRP 210 | PCT 18 ng/mL
• Coagulation: PT 18s | APTT 52s | Fibrinogen 1.4 g/L
• Lactate 4.6 mmol/L | Blood glucose 3.1 mmol/L

No malaria film result yet. NS1 antigen pending. Leptospira serology pending.`,
    progressive_data:[
      "Malaria rapid test: NEGATIVE. NS1 antigen: POSITIVE (dengue). Blood cultures: no growth at 48h. Leptospira IgM: weakly positive (borderline).",
      "Despite 30 mL/kg crystalloid + norad 0.3 mcg/kg/min: MAP 60. Plt falling to 18. Fresh bleeding from IV sites. Haematocrit rising (haemoconcentration).",
      "Echo: hyperdynamic LV (EF 72%), small RV, IVC collapsing >50%. No effusion. New finding: trace pericardial effusion and bilateral pleural effusions on lung US.",
      "Hour 12: Plt 9 ×10⁹/L. Patient develops haematemesis. MAP falling to 52 on norad 0.5 mcg/kg/min. Team discussing platelet transfusion threshold."
    ],
    key_probes:[
      "What is your differential diagnosis and how do you risk-stratify tropical fever with shock on arrival?",
      "NS1 positive and leptospira borderline. How do you manage empirical antimicrobials given diagnostic uncertainty?",
      "Dengue — explain the pathophysiology of plasma leakage and why standard fluid resuscitation rules don't apply.",
      "Platelet count 9, fresh bleeding from IV sites. What is your platelet transfusion threshold and rationale?",
      "The team wants to give more fluid given the low MAP. Echo shows hyperdynamic LV and collapsing IVC. What do you do?"
    ],
    pearls:[
      "Dengue warning signs: abdominal pain, persistent vomiting, clinical fluid accumulation, mucosal bleeding, lethargy, liver enlargement >2 cm, rising haematocrit with rapid Plt fall. Any one = admission.",
      "Dengue shock: plasma leakage — NOT vasodilation. Fluid resuscitation is indicated but MUST be guided by haematocrit trends and clinical leakage signs. Fluid overload causes pulmonary oedema in the reabsorption phase (Day 4–6).",
      "Empirical leptospirosis treatment: IV benzylpenicillin 1.5 MU 6-hourly or IV ceftriaxone 1g daily. Start empirically if clinical features are consistent — do not wait for serology.",
      "Dengue platelet transfusion: indicated at Plt <10 with active bleeding OR Plt <20 with high bleeding risk. Prophylactic transfusion at Plt <10 without bleeding is controversial."
    ],
    pitfalls:[
      "Rising haematocrit + falling platelets = dengue haemoconcentration. Do NOT interpret as volume responsiveness alone — it reflects plasma leakage, not haemorrhage.",
      "Aggressive IV fluids in dengue can cause catastrophic pulmonary oedema during the reabsorption phase. Titrate to haematocrit, not MAP alone.",
      "Leptospirosis and dengue can co-exist in returning travellers. Treat both empirically if clinical overlap exists — do not anchor on a single positive test.",
      "Hypoglycaemia in tropical sepsis: check glucose every 2 hours. Both dengue hepatitis and leptospirosis impair hepatic gluconeogenesis."
    ]
  },
{
    id:12, title:"Sepsis with Overt DIC + Severe Thrombocytopenia", domain:"Sepsis & Circulatory Shock", difficulty:"High",
    stem:`58F, known myelodysplastic syndrome (MDS), baseline Plt ~60. Admitted with Gram-negative bacteraemia from biliary source. Post ERCP Day 1.

ICU ADMISSION:
• MAP 58 | HR 124 | Temp 39.1°C | RR 28 | SpO2 92% on 10L
• GCS 14 | Mottled | CRT 5 seconds | Oozing from ERCP puncture site

LABS:
• Plt 14 ×10⁹/L (down from baseline 60)
• PT 22s | APTT 68s | Fibrinogen 0.8 g/L | D-dimer >20 mg/L
• Hb 7.1 | WBC 0.9 (neutropenic) | Cr 2.4 | Bili 82
• Lactate 5.1 | Blood cultures: Gram-negative rods (2/2 bottles)
• CXR: bilateral infiltrates

SCORING: ISTH overt DIC score = 6 (overt DIC)`,
    progressive_data:[
      "Blood cultures: Klebsiella pneumoniae, ESBL-producing. Sensitivities pending. Empirical meropenem started.",
      "Hour 4: Active bleeding from ERCP site, oozing from all venepuncture sites, haematuria noted. Plt now 8. Fibrinogen 0.6 g/L.",
      "After 2 pools FFP + 2g fibrinogen concentrate: Fibrinogen 1.4, PT 18s. Plt still 8. Bleeding partially controlled but not stopped.",
      "Hour 8: New confusion (GCS 10), BP falling despite norad 0.5 mcg/kg/min. CT head: no intracranial haemorrhage. Bilateral petechiae spreading."
    ],
    key_probes:[
      "Define overt DIC using ISTH criteria. What is the ISTH score here and what does it mandate?",
      "DIC treatment hierarchy — what do you replace first and why does the order matter?",
      "Fibrinogen 0.6 g/L with active bleeding. Cryoprecipitate vs fibrinogen concentrate — which do you use and why?",
      "She is neutropenic AND thrombocytopenic AND bleeding. How do you balance infection control with haemostatic support?",
      "Platelet transfusion threshold in DIC with active bleeding — and why is the threshold different from stable thrombocytopenia?"
    ],
    pearls:[
      "DIC treatment hierarchy: (1) treat the underlying cause — source control and antibiotics are the definitive treatment for DIC; (2) fibrinogen first — target ≥1.5 g/L; (3) FFP for PT/APTT correction; (4) platelets only if <50 with active bleeding.",
      "Fibrinogen is the first coagulation factor to become critically depleted in DIC. Fibrinogen concentrate preferred: pathogen-reduced, dose-calculated, and faster to prepare.",
      "Heparin in DIC: low-dose heparin sometimes used in thrombosis-predominant DIC (purpura fulminans). In haemorrhage-predominant DIC it is contraindicated.",
      "Tranexamic acid in DIC: generally AVOIDED — DIC involves simultaneous clotting and fibrinolysis; inhibiting fibrinolysis alone can worsen microvascular thrombosis."
    ],
    pitfalls:[
      "Giving FFP without fibrinogen first is a common error. FFP contains only ~2 g/L fibrinogen — you would need litres to correct a severe fibrinogen deficit. Give fibrinogen concentrate first.",
      "Do not withhold antibiotics due to thrombocytopenia — infection IS the DIC driver. Delay in source control prolongs DIC.",
      "ESBL Klebsiella: carbapenem is the correct empirical agent. Pip-tazo has unreliable activity against ESBL producers despite in vitro sensitivity (inoculum effect).",
      "Platelet threshold in DIC with active bleeding = 50 ×10⁹/L, not 10. The threshold is higher because DIC impairs platelet function in addition to reducing count."
    ]
  },
{
    id:13, title:"Acute RV Failure from Massive PE", domain:"Advanced Haemodynamics", difficulty:"High",
    stem:`67M, post right total hip replacement Day 3. Sudden haemodynamic collapse during physiotherapy.

IMMEDIATE PRESENTATION:
• GCS 13 | HR 128 | BP 72/40 (MAP 51) | RR 34 | SpO2 78% on 15L NRB
• Distended neck veins | Trachea central | No wheeze
• ECG: sinus tachycardia, S1Q3T3 pattern, new RBBB, T-wave inversions V1–V4

BEDSIDE ECHO (done in 3 minutes):
• Severely dilated RV, RV:LV ratio >1.0
• Flattened IVS (D-sign) on short axis
• TAPSE 9 mm | Tricuspid regurgitation with estimated RVSP 62 mmHg
• Small underfilled LV | No tamponade | No pneumothorax

CTPA: Large bilateral central PE with saddle thrombus. No evidence of infarction.
RV/LV ratio on CT: 1.4`,
    progressive_data:[
      "After 500 mL cautious fluid bolus: MAP 48 (worse), HR 134. New onset AF. SpO2 75% on 15L.",
      "Systemic thrombolysis (alteplase 100mg over 2h) administered after MDT decision. 90 min post-lysis: HR falling to 98, MAP improving to 64, SpO2 88%.",
      "Post-thrombolysis Hour 4: SpO2 improving to 94%. However new haemoptysis noted. CT shows no intracranial haemorrhage but bilateral pulmonary haemorrhage.",
      "Hour 8: MAP 68 on norad 0.15 mcg/kg/min, HR 88, SpO2 95% on FiO2 0.4. Haemoptysis settling. Considering anticoagulation restart."
    ],
    key_probes:[
      "Echo RV:LV >1.0, TAPSE 9, D-sign. Classify this PE and what does that classification mandate?",
      "Why did the 500 mL fluid bolus make things worse — explain the RV-LV interdependence physiology.",
      "Thrombolysis vs surgical embolectomy vs catheter-directed therapy — how do you decide?",
      "Post-thrombolysis haemoptysis. How do you assess severity and when do you restart anticoagulation?",
      "This patient had a hip replacement 3 days ago. Thrombolysis threshold — does recent surgery change your decision?"
    ],
    pearls:[
      "Massive PE definition: sustained hypotension (SBP <90 for ≥15 min or requiring vasopressors) due to PE. Systemic thrombolysis is indicated in massive PE without absolute contraindications.",
      "RV-LV interdependence in PE: dilated RV shifts the IVS leftward (D-sign) → underfills the LV → further drops cardiac output. Fluid loading worsens this by increasing RV dilation and further compressing LV.",
      "Vasopressor of choice in massive PE: noradrenaline. It maintains RCA perfusion pressure (RCA perfusion is systolic-dependent in RV failure, unlike LV). Vasopressin is a useful second-line.",
      "Thrombolysis contraindications: absolute = haemorrhagic stroke ever, ischaemic stroke <3 months, active internal bleeding (excluding menses), known intracranial neoplasm. Recent surgery is a RELATIVE contraindication."
    ],
    pitfalls:[
      "Fluid bolus in massive PE with dilated RV: harmful. The RV is already pressure-overloaded — more preload worsens septal shift and LV underfilling. Give cautious 250 mL MAXIMUM and reassess.",
      "High PEEP in intubated PE patients dramatically increases RV afterload and can cause cardiac arrest. Use lowest PEEP compatible with oxygenation.",
      "Avoid intubation in massive PE if at all possible — loss of sympathetic drive at induction + positive pressure ventilation causes cardiovascular collapse. Optimise on NIV/HFNC if feasible.",
      "Post-thrombolysis anticoagulation: wait minimum 24h after full-dose lysis before restarting heparin. Check for bleeding first."
    ]
  },
{
    id:14, title:"Decompensated Pulmonary Hypertension + RV Failure", domain:"Advanced Haemodynamics", difficulty:"High",
    stem:`42F, known idiopathic pulmonary arterial hypertension (IPAH) on sildenafil + bosentan + IV epoprostenol (prostacyclin infusion). Admitted with 3 days of worsening dyspnoea and presyncope. Epoprostenol pump ran out 6 hours ago.

ICU ADMISSION:
• HR 118 | BP 84/52 (MAP 63) | RR 32 | SpO2 84% on 10L NRB | Temp 37.2°C
• Raised JVP | Peripheral oedema | Hepatomegaly | Ascites
• GCS 14

ECHO:
• Severely dilated and hypertrophied RV | TAPSE 8 mm
• Estimated RVSP 95 mmHg | D-sign present
• LV small, underfilled | EF 65%
• Moderate-severe tricuspid regurgitation

RHC (from previous admission): mPAP 62 mmHg, PVR 12 WU, CO 2.8 L/min, PCWP 8 mmHg`,
    progressive_data:[
      "Epoprostenol restarted at previous dose. 30 minutes later: SpO2 improving to 90%, HR 112. However MAP now 58.",
      "Inhaled nitric oxide 20 ppm started. SpO2 92%, HR 108, MAP 62. Patient remains distressed with RR 28.",
      "Hour 3: SpO2 94%, MAP 64 on norad 0.2 mcg/kg/min + iNO 20 ppm. Lactate 3.1. Patient asking about intubation — refusing it.",
      "Hour 6: Deteriorating. GCS falling to 11. SpO2 86% despite FiO2 0.8. Team discussing intubation vs palliative approach vs urgent transplant listing."
    ],
    key_probes:[
      "What is the precipitant here and why is epoprostenol interruption a medical emergency in PAH?",
      "Give me your immediate management priorities — vasopressors, pulmonary vasodilators, oxygenation.",
      "Inhaled nitric oxide — mechanism, dose, and what monitoring is mandatory?",
      "The patient is refusing intubation. What are the haemodynamic risks of intubation in severe PAH — and what is the mortality of intubation in this context?",
      "At what point do you contact a PAH centre for VA-ECMO or urgent transplant? What are the triggers?"
    ],
    pearls:[
      "Epoprostenol (prostacyclin) half-life is 2–5 minutes. Interruption causes severe rebound pulmonary vasoconstriction — this is a PAH emergency equivalent to acute MI. Restart immediately at same dose.",
      "Vasopressor choice in PAH-RV failure: noradrenaline preferred — maintains systemic pressure without significant pulmonary vasoconstriction. Avoid phenylephrine (pure alpha, increases PVR). Vasopressin is useful second-line.",
      "iNO mechanism: selective pulmonary vasodilator — diffuses into smooth muscle, activates guanylate cyclase, raises cGMP → vasodilation. Inactivated immediately by haemoglobin — no systemic effect.",
      "Intubation mortality in severe PAH: 30–50% perioperative mortality. Loss of hypoxic drive, PPV increases RV afterload, anaesthetic agents cause systemic vasodilation and RV ischaemia."
    ],
    pitfalls:[
      "Never abruptly stop inhaled NO without weaning — rebound pulmonary vasoconstriction can be fatal. Wean by 5 ppm every few hours with SpO2 monitoring.",
      "High FiO2 is a pulmonary vasodilator in PAH — hypoxia causes pulmonary vasoconstriction. Always maximise oxygen before escalating vasopressors.",
      "Aggressive fluid loading is harmful in decompensated PAH — the RV is already dilated. Cautious diuresis of the fluid-overloaded state may actually improve RV function by reducing TR severity.",
      "Sildenafil and bosentan must be continued throughout the ICU admission — stopping them causes acute worsening. Check NG/nasogastric administration if patient cannot swallow."
    ]
  },
{
    id:15, title:"Cardiogenic Shock — Papillary Muscle Rupture", domain:"Cardiac & Post-Arrest Care", difficulty:"High",
    stem:`72M, hypertension, ex-smoker. Presented 18h ago with chest pain, inferior STEMI. Thrombolysis given at district hospital (no PCI available). Transferred for rescue PCI — vessel opened, TIMI 2 flow achieved.

NOW Day 2 post-PCI, sudden clinical deterioration:
• HR 128 | BP 76/44 (MAP 55) | RR 32 | SpO2 88% on 15L NRB
• New loud pansystolic murmur loudest at apex
• Bilateral crepitations to mid-zones | Frothy sputum

ECHO (URGENT):
• Flail posterior mitral leaflet — severe acute MR
• Hyperdynamic LV (EF 65%)
• Severely enlarged LA | Dilated pulmonary veins
• Estimated RVSP 58 mmHg
• No VSD

ABG: pH 7.28 | PaCO2 28 | PaO2 62 (FiO2 0.8) | Lactate 5.8`,
    progressive_data:[
      "Despite NIV (BiPAP 14/6, FiO2 0.8): SpO2 improving to 92% but MAP falling to 50. Intubation being considered.",
      "Intubated (RSI with ketamine/roc). Post-intubation: SpO2 96%, MAP 58 on norad 0.3 mcg/kg/min. Ventilator: VT 6 mL/kg, PEEP 8, FiO2 0.7.",
      "Cardiothoracic surgery contacted — theatre available in 4 hours. IABP inserted. MAP now 68 with IABP + norad 0.3.",
      "Pre-op: Cr 2.4 (baseline 1.1), Hb 9.2, Plt 88. Team asking about bridging ECMO vs proceed directly to surgery."
    ],
    key_probes:[
      "This is acute severe MR from papillary muscle rupture. What is the haemodynamic consequence — explain why the LV is hyperdynamic despite cardiogenic shock.",
      "Why is vasopressor choice critical here — what happens to MR severity with increasing afterload?",
      "IABP in acute MR — mechanism and haemodynamic benefit specific to this lesion.",
      "The surgical team wants to wait 48h to stabilise. You disagree. Make the case for emergency surgery.",
      "Bridging VA-ECMO vs direct surgery — what factors determine your recommendation?"
    ],
    pearls:[
      "Acute severe MR haemodynamics: LV ejects into low-resistance LA (not aorta) → forward CO falls despite hyperdynamic LV. EF 65% is falsely reassuring — the LV is ejecting backwards, not forwards.",
      "Vasodilation (reducing afterload) improves forward flow in MR — vasopressors worsen it by increasing LV afterload and worsening regurgitant fraction. Use vasopressors only to maintain coronary perfusion pressure, at lowest effective dose.",
      "IABP in acute MR: deflates in systole → reduces afterload → reduces regurgitant fraction → improves forward CO. More haemodynamically beneficial in MR than in pure LV failure.",
      "Papillary muscle rupture: definitive treatment is surgical. Medical stabilisation is a bridge — not a destination. Surgical mortality is high (10–20%) but operative mortality far exceeds medical management alone (>50% at 24h without surgery)."
    ],
    pitfalls:[
      "Hyperdynamic LV + cardiogenic shock = think acute MR or VSD. Do not reassure yourself with EF — check for a new murmur and get an echo immediately in any post-MI deterioration.",
      "High PEEP reduces preload (useful to offload the LA) but can worsen RV function. Balance carefully — target PEEP 8–10, not higher.",
      "Delay to surgery in papillary muscle rupture is independently associated with mortality. The window is hours, not days. Push for emergency surgery.",
      "NTG infusion to reduce afterload is hazardous without IABP or vasopressor backup — can cause profound hypotension and coronary hypoperfusion."
    ]
  },
{
    id:16, title:"Post-Cardiac Surgery — Low Output vs Tamponade", domain:"Peri-operative Critical Care", difficulty:"High",
    stem:`68M, triple-vessel CABG + mitral valve repair. On bypass 118 minutes. ICU Day 1 post-op.

BASELINE POST-OP (Hour 2):
• MAP 72 | HR 88 (paced) | CVP 10 | CO 4.2 L/min (PA catheter)
• Chest drains: 80 mL/h (acceptable)

NOW (Hour 6):
• MAP 54 | HR 118 (sinus) | CVP rising 10 → 18 cmH2O
• CO falling: 4.2 → 2.1 L/min | SVR rising
• Chest drain output SUDDENLY STOPPED (was 80 mL/h → 0 mL/h)
• SpO2 94% | Urine output falling: 5 mL/h
• Patient increasingly agitated

ECHO (bedside):
• Moderate-sized pericardial collection (1.8 cm posterior)
• RV diastolic collapse
• Plethoric IVC
• Reduced LV filling`,
    progressive_data:[
      "Volume challenge 500 mL: CVP now 22, MAP 52, CO 1.8 L/min. Clinical deterioration.",
      "Urgent surgical re-exploration arranged. Pre-theatre: MAP 48, HR 130, GCS 12. Patient on norad 0.4 + adrenaline 0.1 mcg/kg/min.",
      "Theatre finding: large clot behind right atrium compressing inflow. Clot evacuated. Immediate haemodynamic improvement: MAP 82, HR 94, CVP 8.",
      "Post-re-exploration ICU: CO 3.8 L/min. New concern: chest drain output now 200 mL/h, Hb falling 10.2 → 7.8. TEG shows primary fibrinolysis pattern."
    ],
    key_probes:[
      "Stopped chest drain + rising CVP + falling CO — what is your immediate diagnosis and how do you confirm it?",
      "Beck's triad — what are the three components and why is it often incomplete post-cardiac surgery?",
      "Echo shows RV diastolic collapse. What is the physiological mechanism of tamponade physiology?",
      "While waiting for theatre: what temporising measures do you use — and what do you absolutely avoid?",
      "Post-re-exploration: drain output 200 mL/h, primary fibrinolysis on TEG. Walk me through your haemostatic management."
    ],
    pearls:[
      "Post-cardiac surgery tamponade: localised clot is common — it may not produce the classic circumferential effusion. RV diastolic collapse on echo is more sensitive than effusion size.",
      "Stopped chest drain in context of falling CO = clot in drain — tamponade until proven otherwise. Do not milk gently and wait. Urgent surgical re-exploration.",
      "Tamponade physiology: pericardial pressure exceeds right heart filling pressure → RV diastolic collapse → reduced biventricular filling → reduced CO.",
      "TEG primary fibrinolysis: LY30 >7.5% with MA >50 mm. Treat with tranexamic acid. Residual heparin post-bypass is common — confirm ACT normalised with protamine."
    ],
    pitfalls:[
      "Volume loading in tamponade: temporarily raises filling pressure to maintain CO, but is a bridge measured in minutes — not a treatment. Get to theatre.",
      "Beck's triad (hypotension, raised JVP, muffled heart sounds) is present in <30% of post-cardiac surgery tamponade. Localised clot often produces atypical presentation.",
      "Pericardiocentesis is NOT the treatment for post-surgical tamponade — the collection is usually clotted blood, not fluid. Needle drainage is ineffective and risks puncture of a repaired structure.",
      "Heparin reversal post-bypass: confirm ACT normalised with protamine. Residual heparin effect is a common cause of early post-operative bleeding."
    ]
  },
{
    id:17, title:"Undifferentiated Shock — Echo + Advanced Monitoring", domain:"Advanced Haemodynamics", difficulty:"High",
    stem:`55M, no known medical history. Found collapsed at home. Brought by ambulance. No history available.

ARRIVAL:
• GCS 9 (E2V2M5) | HR 134 | BP 68/38 (MAP 48) | RR 28 | Temp 38.6°C
• SpO2 86% on 15L NRB | Mottled to knees | CRT 6 seconds

INITIAL LABS:
• Lactate 8.2 mmol/L | pH 7.18 | PaCO2 24 | HCO3 9
• WBC 22 | Plt 88 | Cr 4.1 | K+ 6.2 | Troponin I 8.4 ng/mL (HIGH)
• Blood glucose 2.8 mmol/L | Bili 62 | Na 128
• CXR: cardiomegaly, bilateral infiltrates, no pneumothorax
• ECG: sinus tachycardia, diffuse ST depression, no clear STEMI pattern`,
    progressive_data:[
      "Bedside ECHO (immediate): LV severely dilated (LVEDD 7.2 cm), EF estimated 15–20%. Moderate pericardial effusion (no diastolic collapse). Bilateral B-lines on lung US. IVC plethoric.",
      "After 500 mL crystalloid + norad started 0.2 mcg/kg/min: MAP 55, HR 130, SpO2 88%. ScvO2 from CVC = 44%.",
      "PiCCO inserted: CI 1.4 L/min/m2 | SVRI 3100 | GEDVI 920 mL/m2 | EVLWI 22 mL/kg. Troponin rising: 8.4 → 14.2 ng/mL.",
      "Repeat echo at 2h: LV unchanged EF 15%, no new WMA (global dysfunction, not regional). Myocarditis vs new-onset DCM vs Takotsubo discussed."
    ],
    key_probes:[
      "Lactate 8.2, pH 7.18, GCS 9 — how do you classify this shock and what does the initial echo tell you?",
      "EF 15%, EVLWI 22, ScvO2 44% — integrate these findings. What is the primary problem and what do you need?",
      "Troponin 8.4 rising — this could be Type 1 MI, myocarditis, or demand ischaemia. How do you differentiate at the bedside?",
      "You start dobutamine. What is the target and what is the specific risk of inotropes in an EF of 15%?",
      "Global LV dysfunction, no regional wall motion abnormality. Walk me through your differential: myocarditis vs DCM vs Takotsubo vs stress cardiomyopathy."
    ],
    pearls:[
      "Undifferentiated shock: the echo answers the key question in 3 minutes. EF 15% + bilateral B-lines + plethoric IVC = cardiogenic shock. This rules out distributive as the primary mechanism.",
      "Global LV hypokinesis (no regional WMA) suggests: (1) myocarditis, (2) new dilated cardiomyopathy, (3) Takotsubo (apical ballooning — check wall motion pattern carefully), (4) global ischaemia (left main/multivessel).",
      "ScvO2 44% = severely inadequate oxygen delivery. Normal is >70%. This confirms low output state and tissue hypoxia — titrate inotropes to ScvO2 >65%, not just MAP.",
      "EVLWI 22 mL/kg = severe pulmonary oedema (normal <10). Despite this, GEDVI 920 is elevated — the ventricle is dilated and full. Do not give more fluid."
    ],
    pitfalls:[
      "Troponin elevation in shock does not equal Type 1 MI. Global demand ischaemia, myocarditis, and cardiac contusion all cause troponin rise. Differentiate by WMA pattern, clinical context, and coronary angiography if needed.",
      "Do not give standard 30 mL/kg SSC fluid resuscitation to a patient with EF 15% and EVLWI 22 — you will drown them. The shock is pump failure, not hypovolaemia.",
      "Dobutamine in severe cardiomyopathy can precipitate tachyarrhythmias and worsen ischaemia. Start at 2.5 mcg/kg/min, titrate slowly, and have defibrillator available.",
      "Hypoglycaemia (glucose 2.8) in cardiogenic shock = hepatic hypoperfusion. Correct immediately. Check glucose every 30 min in severe shock."
    ]
  },
{
    id:18, title:"Hypertensive Emergency + Flash Pulmonary Oedema", domain:"Advanced Haemodynamics", difficulty:"Medium",
    stem:`78F, known hypertension (poorly controlled), CKD Stage 3, bilateral renal artery stenosis (diagnosed 5 years ago, not intervened). Presented with sudden onset severe dyspnoea and confusion.

ICU ARRIVAL:
• GCS 12 | HR 108 | BP 214/118 (MAP 150) | RR 38 | Temp 37.1°C
• SpO2 78% on room air → 86% on 15L NRB
• Bilateral wheeze + crackles to apices | Frothy pink sputum
• JVP elevated | No peripheral oedema

ABG (FiO2 0.8 NRB): pH 7.28 | PaCO2 32 | PaO2 58 | HCO3 15 | Lactate 3.1
CXR: bilateral bat-wing infiltrates, enlarged cardiac silhouette, upper lobe diversion
ECG: LVH pattern, no acute ST changes
Troponin I: 0.8 ng/mL (borderline)
Cr: 3.8 (baseline 2.1)`,
    progressive_data:[
      "NIV (CPAP 10 cmH2O, FiO2 0.7) started: SpO2 improving to 94% over 20 minutes. RR 28. Patient more cooperative.",
      "IV GTN infusion started at 0.5 mcg/kg/min, uptitrated to 2 mcg/kg/min: MAP falling 150 → 108 over 30 min. SpO2 96%. RR 22.",
      "Hour 2: MAP 95, SpO2 97%, RR 18. Cr rising to 4.6. Urine output 8 mL/h despite improving haemodynamics.",
      "Renal team review: bilateral renal artery stenosis confirmed on old imaging. ACE inhibitor (ramipril) charted by junior doctor. You are called to review."
    ],
    key_probes:[
      "Flash pulmonary oedema in hypertensive emergency — pathophysiology. Why does afterload reduction work so rapidly here?",
      "NIV vs intubation vs HFNC — how do you choose in this presentation?",
      "Which antihypertensive agent do you use, by which route, and what is your BP target in the first hour?",
      "Bilateral renal artery stenosis and Cr rising to 4.6. What is the mechanism and what does it mean for your antihypertensive choices?",
      "The junior doctor has charted ramipril. Do you stop it — why, and what are the alternatives?"
    ],
    pearls:[
      "Flash pulmonary oedema in hypertensive emergency: acute afterload increase → LV cannot empty → LVEDP rises → pulmonary venous hypertension → oedema. Afterload reduction (GTN/nitroprusside) is the primary treatment, not diuretics alone.",
      "BP target in hypertensive emergency: reduce MAP by maximum 25% in first hour, then to 160/100 mmHg over next 2–6h. Rapid overcorrection causes end-organ ischaemia (watershed infarction, AKI, myocardial ischaemia).",
      "Bilateral renal artery stenosis + ACE inhibitor = acute kidney injury. ACEi causes efferent arteriolar dilation → reduces intraglomerular pressure → precipitates AKI in patients whose GFR depends on efferent constriction.",
      "IV GTN: first-line for flash pulmonary oedema and acute coronary syndromes. IV labetalol: useful when tachycardia component present. IV nitroprusside: most potent, requires intra-arterial monitoring, avoid in renal failure (thiocyanate toxicity)."
    ],
    pitfalls:[
      "Giving large doses of IV furosemide as the primary treatment for flash pulmonary oedema is wrong. The problem is afterload, not volume overload. Diuretics alone will not resolve it.",
      "Lowering BP too rapidly: MAP >25% reduction in first hour risks watershed cerebral infarction, acute MI from coronary hypoperfusion, and worsening AKI.",
      "Bilateral renal artery stenosis is a contraindication to ACE inhibitors and ARBs. If given, check Cr and K+ at 48h. Stop if Cr rises >30% or K+ >5.5.",
      "NIV/CPAP: CPAP 5–10 cmH2O reduces venous return (reduces preload) and reduces LV afterload by increasing intrathoracic pressure. It is first-line in acute cardiogenic pulmonary oedema — do not delay it while waiting for medications."
    ]
  },
{
    id:19, title:"Mesenteric Ischaemia — Severe Lactic Acidosis", domain:"Peri-operative Critical Care", difficulty:"High",
    stem:`71M, AF (on warfarin, INR subtherapeutic at 1.4 on admission), known atherosclerosis. 6 hours of severe central abdominal pain, vomiting, absolute constipation for 12 hours.

ICU ARRIVAL (post-surgical referral):
• GCS 14 | HR 128 AF | BP 88/50 (MAP 63) | RR 32 | Temp 37.8°C
• SpO2 94% on 10L | Abdomen: soft but severely tender diffusely
• Absent bowel sounds | Rectal examination: no blood

LABS:
• Lactate 9.8 mmol/L | pH 7.12 | PaCO2 18 | HCO3 6 | BE -22
• WBC 24 | Plt 112 | Cr 3.1 (base 1.2) | K+ 5.8
• D-dimer >20 mg/L | INR 1.4 | Lipase normal

CT ANGIOGRAPHY:
• SMA thrombosis — origin of SMA completely occluded
• Large territory of small bowel with absent enhancement
• Pneumatosis intestinalis involving >50 cm of small bowel
• Portal venous gas present`,
    progressive_data:[
      "Surgical team review: CT findings confirm extensive bowel infarction. Surgical options: emergency laparotomy + embolectomy + bowel resection. Expected > 2m bowel resection.",
      "Resuscitation: 2L crystalloid, norad 0.4 mcg/kg/min. MAP 68. Lactate unchanged 9.2 mmol/L. pH 7.15. Urine output 0.",
      "Post-laparotomy return to ICU: 3.2m bowel resected. Stoma fashioned. Abdomen left open. MAP 58 on norad 0.5 + vasopressin 0.03 U/min. Temp 35.2°C.",
      "Hour 6 post-op: Lactate falling 9.2 → 6.8 → 4.1. pH improving 7.15 → 7.24 → 7.31. Norad weaning. Surgeon asking about second-look laparotomy."
    ],
    key_probes:[
      "Lactate 9.8, pH 7.12. How do you classify this acid-base disorder and what is driving the extreme lactic acidosis here?",
      "CT shows pneumatosis intestinalis and portal venous gas. What do these findings mean prognostically?",
      "What is the role of anticoagulation in acute SMA thrombosis — before, during, and after surgery?",
      "Post-laparotomy: abdomen left open, hypothermic, on two vasopressors. Walk me through your ICU management priorities.",
      "Lactate falling post-resection. When do you perform second-look laparotomy and what are you looking for?"
    ],
    pearls:[
      "Mesenteric ischaemia — SMA thrombosis: lactate >4 mmol/L with abdominal pain in a patient with AF or atherosclerosis = mesenteric ischaemia until proven otherwise. CT angiography is the diagnostic standard.",
      "Pneumatosis intestinalis = gas within bowel wall = transmural infarction. Portal venous gas = gas absorbed through necrotic mucosa into portal system. Both indicate irreversible bowel necrosis.",
      "Anticoagulation in acute SMA thrombosis: systemic heparin should be started as soon as diagnosis is confirmed — reduces extension of thrombus and improves microvascular perfusion. Continue peri-operatively.",
      "Second-look laparotomy: performed at 24–48h post-initial resection to assess viability of remaining bowel and anastomotic integrity. Planned in all cases where bowel viability was borderline at initial surgery."
    ],
    pitfalls:[
      "Mesenteric ischaemia classically presents with pain out of proportion to clinical signs (soft abdomen in early stages). By the time the abdomen is rigid, bowel is dead.",
      "Avoiding vasopressors in mesenteric ischaemia out of fear of worsening ischaemia is wrong in shock. Systemic hypotension reduces mesenteric perfusion more than appropriate vasopressor use.",
      "Short bowel syndrome after massive resection (>200 cm): lifelong TPN dependency likely if <100 cm remaining small bowel without ileocaecal valve. Discuss with patient and family early.",
      "High SvO2 in mesenteric ischaemia: dead bowel cannot extract oxygen — mixed venous saturation may be falsely high despite tissue hypoxia. Do not use SvO2 alone to guide resuscitation in suspected gut ischaemia."
    ]
  },
{
    id:20, title:"LVAD Patient with Sepsis and Haemodynamic Instability", domain:"Advanced Haemodynamics", difficulty:"High",
    stem:`62M, HeartMate 3 LVAD in situ for 18 months (destination therapy, NYHA IV dilated cardiomyopathy, LVEF 10%). Presents with 3 days of fever, rigors, reduced pump output alarm, and increasing dependence on IV fluids at home.

ICU ADMISSION:
• HR 124 (no pulsatile waveform — expected) | MAP 62 (arterial line, not NIBP)
• LVAD speed: 5400 RPM | Flow estimated: 3.2 L/min (was 4.8 L/min baseline)
• SpO2 94% on 6L O2 | Temp 39.2°C | GCS 14

LVAD PARAMETERS (from device monitor):
• Power: 8.2 W (elevated, baseline 5.8 W) | PI (pulsatility index): 2.1 (low, baseline 4.0)
• Frequent low-flow alarms

LABS:
• WBC 22 | CRP 310 | PCT 28 | Blood cultures: 3/3 bottles positive (Gram-positive cocci)
• Hb 8.2 | Plt 68 | INR 3.8 (supratherapeutic — warfarin target 2.0–3.0)
• LDH 820 | Haptoglobin undetectable | Peripheral blood film: schistocytes`,
    progressive_data:[
      "Blood cultures: MRSA. Driveline exit site inflamed — driveline infection confirmed on MRI. Vancomycin started.",
      "Low PI + low flow + elevated power = suction event. Echocardiography: RV severely dilated, interventricular septum shifted left, LVAD cannula position appropriate.",
      "After cautious 500 mL fluid bolus: PI improving 2.1 → 3.4, flow 3.2 → 4.1 L/min. MAP 68. RV dilation persisting on echo.",
      "Haemolysis screen positive: LDH 820, schistocytes, undetectable haptoglobin. LVAD team contacted — pump thrombus suspected."
    ],
    key_probes:[
      "LVAD parameters: low PI, elevated power, low flow. Interpret these and give me your differential.",
      "How do you measure blood pressure in an LVAD patient and why is standard NIBP unreliable?",
      "RV failure in an LVAD patient — why is the RV uniquely vulnerable, and how do you manage it?",
      "MRSA driveline infection — antibiotic strategy, duration, and when is surgical intervention required?",
      "Haemolysis + schistocytes + elevated LDH in an LVAD patient. What is the diagnosis and how do you confirm it?"
    ],
    pearls:[
      "LVAD pulsatility index (PI) reflects the patient's native heart contribution to flow. Low PI = either suction event (hypovolaemia/RV failure causing underfilling of LV) or poor native LV function. High power + low PI + low flow = suction event until proven otherwise.",
      "BP measurement in LVAD: use arterial Doppler or intra-arterial line. NIBP cuffs are unreliable — the LVAD produces continuous (non-pulsatile) flow, so Korotkoff sounds are absent or attenuated. Report MAP only.",
      "RV failure post-LVAD: the LVAD decompresses the LV → LV shrinks → interventricular septum shifts left → RV geometry worsens → RV failure. Treat with pulmonary vasodilators (iNO, sildenafil), inotropes (milrinone preferred — also pulmonary vasodilator).",
      "LVAD pump thrombus: elevated power + haemolysis (LDH, schistocytes, absent haptoglobin) = pump thrombus until proven otherwise. Requires urgent LVAD team involvement — options: IV heparin, thrombolytics, or pump exchange."
    ],
    pitfalls:[
      "Never increase LVAD speed in a suction event — this worsens LV collapse and paradoxically reduces flow. Treat the underlying cause: give fluid (if hypovolaemic) or treat RV failure.",
      "MRSA driveline infection: driveline infections rarely clear with antibiotics alone — they usually require long-term suppressive therapy or surgical debridement/device exchange. Early LVAD centre contact is mandatory.",
      "Warfarin INR 3.8 (supratherapeutic) in LVAD patient with sepsis and thrombocytopenia: high bleeding risk. Hold warfarin, monitor INR.",
      "Milrinone is the preferred inotrope in LVAD-associated RV failure: it is both a positive inotrope and a pulmonary vasodilator. Avoid pure vasopressors that increase RV afterload."
    ]
  },
{
    id:21, title:"Near-Fatal Asthma", domain:"Respiratory Failure", difficulty:"High",
    stem:`28F, known severe asthma, previous ICU admission. Found obtunded at home.

ED ARRIVAL:
• GCS 10 | HR 138 | BP 88/52 | RR 36 | SpO2 82% on 15L NRB
• Silent chest | Accessory muscles maximal | Pulsus paradoxus 22 mmHg

ABG (FiO2 0.8): pH 7.18 | PaCO2 72 | PaO2 58 | HCO3 26 | Lactate 4.1

GIVEN: Salbutamol nebs ×3, ipratropium, hydrocortisone 200mg, magnesium 2g IV — minimal response.`,
    progressive_data:["RSI performed. Post-intubation: BP drops to 58/32. SpO2 82%. Peak airway pressures 62 cmH2O. Bilateral reduced air entry.","Disconnected from ventilator for 30 seconds — BP recovers to 88/58. SpO2 improving to 90%. Expiratory hold shows iPEEP 18 cmH2O.","Ventilator adjusted: RR 8, VT 6 mL/kg, I:E 1:4, zero extrinsic PEEP, FiO2 1.0. PaCO2 now 88. pH 7.12. Team concerned.","Hour 3: pH 7.22, PaCO2 72, SpO2 96%. Peak pressures falling. IV adrenaline infusion started. Team discussing VV-ECMO."],
    key_probes:["Silent chest + PaCO2 72 — classify severity and what does this PaCO2 tell you specifically?","Post-intubation BP drops to 58. First thing on your differential and immediate management.","iPEEP 18 cmH2O confirmed. Walk me through your ventilator strategy — every parameter with rationale.","pH 7.12, PaCO2 88. The registrar wants to increase RR to 20 to normalise CO2. You say no — why?","Refractory bronchospasm not responding to standard treatment — what escalation options do you have?"],
    pearls:["Normal or rising PaCO2 in acute severe asthma = impending respiratory arrest. These patients are usually hypocapnic — normocapnia means they are tiring.","Post-intubation hypotension in asthma: dynamic hyperinflation causing obstructive shock. Disconnect from ventilator immediately — if BP recovers, diagnosis confirmed.","Ventilator strategy in asthma: permissive hypercapnia, slow RR (6–10), long expiratory time (I:E 1:3 to 1:5), minimal or zero extrinsic PEEP, accept PaCO2 up to 90+ if pH ≥7.10.","IV ketamine infusion (1–2 mg/kg/h): bronchodilator via sympathomimetic mechanism — useful adjunct in refractory ventilated asthma."],
    pitfalls:["Adding extrinsic PEEP in ventilated asthma worsens air trapping. Zero extrinsic PEEP initially.","Increasing RR to correct hypercapnia in asthma: reduces expiratory time → worsens air trapping → worsens hypercapnia. The opposite of what you want.","Permissive hypercapnia contraindications: raised ICP, pregnancy. Otherwise acceptable to pH ≥7.10.","Pulsus paradoxus >25 mmHg = severe obstruction. Measure on every severe asthma patient."]
  },
{
    id:22, title:"Severe CAP — HFNC vs NIV vs Intubation", domain:"Respiratory Failure", difficulty:"High",
    stem:`48F, non-smoker, no comorbidities. Five days fever, dry cough, progressive dyspnoea. Legionella urinary antigen positive.

ED ASSESSMENT:
• HR 118 | BP 104/68 | RR 36 | Temp 39.4°C | GCS 15
• SpO2 82% room air → 91% on 15L NRB | Cannot complete full sentences

ABG (FiO2 0.8): pH 7.46 | PaCO2 28 | PaO2 62 | Lactate 2.1
P/F ratio = 77 | ROX index = (91/80)/36 = 3.16

No ECMO capability at this centre. Nearest ECMO centre 90 minutes away.`,
    progressive_data:["HFNC started 60L/min FiO2 0.8. After 1 hour: SpO2 95%, RR 28, ROX index improving to 4.8. Patient comfortable.","Hour 3 on HFNC: SpO2 94%, RR 32, ROX index falling to 3.9. Patient increasingly distressed. Accessory muscle use worsening.","Hour 6: SpO2 falling to 88% despite FiO2 1.0. RR 42. ROX index 2.6. ABG: PaO2 52, pH 7.48, PaCO2 26.","Post-intubation Day 2: P/F ratio 74 despite PEEP 14 and FiO2 1.0. Driving pressure 22 cmH2O. Proning started."],
    key_probes:["P/F 77, RR 36 — your immediate respiratory support decision and rationale.","What is the ROX index — calculate it, interpret it, and what threshold concerns you?","Hour 3: ROX index falling 4.8 → 3.9. What does this trajectory tell you and what do you do now?","RR 42, VT approximately 700 mL on HFNC. Why is this specifically dangerous in ARDS — name the mechanism.","No ECMO here. Deteriorating on day 2 post-intubation. When do you transfer and how do you stabilise for transport?"],
    pearls:["ROX index = (SpO2/FiO2)/RR. Threshold: ROX <3.85 at 2h predicts HFNC failure. Falling ROX on serial measurements is more concerning than a single value.","P-SILI (patient self-inflicted lung injury): high respiratory drive generates large tidal volumes → worsens lung injury even without a ventilator.","HFNC advantages over NRB: precise FiO2, generates 3–5 cmH2O PEEP, washes dead space, better tolerance.","Legionella: IV azithromycin or fluoroquinolone. Beta-lactam alone is insufficient."],
    pitfalls:["Watching a patient work hard on HFNC while P-SILI worsens the lung: act on the ROX trend, not just the SpO2.","Delaying intubation in a hypoxaemic fatiguing patient carries much higher risk than earlier elective intubation.","Legionella causes multi-organ failure — check LFTs, renal function, CK, sodium.","NIV for purely hypoxaemic failure: evidence weaker than for hypercapnic failure."]
  },
{
    id:23, title:"Immunocompromised Host — PJP & Diffuse Infiltrates", domain:"Respiratory Failure", difficulty:"High",
    stem:`54M, renal transplant recipient on tacrolimus + mycophenolate + prednisolone for 3 years. Three weeks progressive dyspnoea, dry cough, low-grade fever.

ICU ADMISSION:
• HR 106 | BP 118/72 | RR 28 | Temp 38.1°C | SpO2 88% on 6L O2
• Bilateral fine crackles

ABG (FiO2 0.4): pH 7.46 | PaCO2 32 | PaO2 58 | Lactate 1.4
CT chest: bilateral ground-glass opacities with cystic changes, no consolidation

LDH: 680 IU/L | Beta-D-glucan: 480 pg/mL (strongly positive, threshold >80)
CMV PCR: 3200 copies/mL | Cryptococcal antigen: negative`,
    progressive_data:["Bronchoscopy + BAL performed on HFNC. BAL: silver stain shows cysts and trophic forms of Pneumocystis jirovecii. CMV culture pending.","High-dose co-trimoxazole started (TMP 15–20 mg/kg/day). IV ganciclovir started for CMV. 24h later: SpO2 worsening to 82% on FiO2 0.8 HFNC.","Intubated. Post-intubation P/F = 88. PEEP 12, FiO2 0.85. Immunology recommends adjunctive corticosteroids for PJP.","Day 5: P/F improving to 145. Tacrolimus levels supratherapeutic (trough 18 ng/mL, target 5–8). Nephrology concerned about graft rejection risk."],
    key_probes:["Beta-D-glucan 480, LDH 680, bilateral GGO in an immunocompromised host — your working diagnosis and differential.","Bronchoscopy on HFNC in a hypoxaemic patient — when is it safe and what precautions do you take?","PJP confirmed. Co-trimoxazole dose, duration, and what is the role of adjunctive corticosteroids?","CMV co-infection — how do you distinguish CMV disease from CMV viraemia and does it change management?","Supratherapeutic tacrolimus + active PJP + ARDS — how do you balance immunosuppression vs graft protection?"],
    pearls:["PJP triad in non-HIV immunocompromised: bilateral GGO on CT + elevated LDH + strongly positive beta-D-glucan (>200 pg/mL). BAL silver stain is diagnostic.","Adjunctive corticosteroids in PJP: indicated if PaO2 <70 mmHg on room air. Prednisolone 40mg BD for 5 days, then taper. Reduces inflammatory injury and improves survival.","CMV disease vs viraemia: disease = end-organ damage + positive PCR. Viraemia = positive PCR without end-organ involvement. CMV pneumonitis requires ganciclovir.","Beta-D-glucan: positive in PJP, Candida, Aspergillus. Negative in Cryptococcus and Mucor."],
    pitfalls:["Stopping all immunosuppression in a transplant patient with PJP risks acute rejection. Reduce but do not stop.","Co-trimoxazole at full PJP dose causes nephrotoxicity — monitor creatinine daily. Also causes hyperkalaemia and myelosuppression.","HFNC during bronchoscopy: keep FiO2 at maximum, procedure brief, anaesthetist standby.","LDH alone is non-specific — combine with beta-D-glucan and CT pattern for specificity."]
  },
{
    id:24, title:"Patient-Ventilator Asynchrony — High Drive & NMBA", domain:"Respiratory Failure", difficulty:"High",
    stem:`62M, post-cardiac arrest Day 2, TTM 36°C being rewarmed. Severe bilateral aspiration pneumonia. Intubated, ventilated.

CURRENT VENTILATOR:
• Mode: VCV | VT 480 mL (6 mL/kg PBW 80 kg) | RR set 18 | PEEP 10 | FiO2 0.65
• Actual RR: 32–38 | Measured VT: 680–820 mL | Pplat 36 | DP 26 cmH2O
• P/F ratio: 108

SEDATION: Propofol 3 mg/kg/h + fentanyl 100 mcg/h — RASS -2 but frequent dyssynchrony
WAVEFORM: Double triggering and reverse triggering every 3–5 breaths`,
    progressive_data:["Sedation increased — propofol 5 mg/kg/h + fentanyl 150 mcg/h + midazolam boluses. Dyssynchrony persisting. DP still 24 cmH2O.","Cisatracurium 0.15 mg/kg bolus then infusion started. Within 20 min: dyssynchrony resolved. DP falling 24 → 16 cmH2O. P/F improving 108 → 134.","Hour 6 on NMBA: P/F 148, DP 14. Team asks whether to continue NMBA and when to reassess. Nurse asks about TOF monitoring.","Hour 48: P/F 188, DP 12. NMBA weaned off. 2 hours later: dyssynchrony returning, DP rising to 20 cmH2O."],
    key_probes:["Double triggering and reverse triggering — what are these, what causes them, and why do they matter?","DP 26 cmH2O — the VT set is 6 mL/kg but the measured VT is 820 mL. Explain this discrepancy and the harm.","Indications for NMBA in ARDS — what does the current evidence say about mortality benefit?","NMBA started — what monitoring is mandatory and how do you titrate the infusion?","NMBA weaned, dyssynchrony returns — mode change to PSV or re-paralysis? How do you decide?"],
    pearls:["Double triggering: patient's inspiratory effort outlasts ventilator's inspiratory time → patient triggers a second breath → stacked breaths → very high delivered VT → VILI.","Reverse triggering: ventilator-delivered breath entrains patient's respiratory muscles → diaphragm contracts during ventilator breath → adds to delivered VT. Occurs even in deeply sedated patients.","NMBA in ARDS: use if dyssynchrony uncontrolled and DP persistently high. ACURASYS showed mortality benefit at 48h with early NMBA in P/F <150.","TOF monitoring: target 1–2 twitches out of 4. Re-assess every 4–6 hours."],
    pitfalls:["Measured VT in VCV dyssynchrony: dyssynchrony adds patient effort → total delivered VT can be 2× set VT → massive VILI despite 'protective' settings.","Deep sedation without NMBA does not reliably stop reverse triggering — the respiratory motor output persists even at RASS -5.","NMBA beyond 48h: independently associated with ICU-acquired weakness. Reassess daily.","Switching to PSV with high respiratory drive: patient generates their own large tidal volumes — may worsen P-SILI."]
  },
{
    id:25, title:"Barotrauma in ARDS — Pneumothorax & BPF", domain:"Respiratory Failure", difficulty:"High",
    stem:`38M, severe COVID ARDS Day 6. On VV-ECMO Day 2. Ultra-protective ventilation: VT 3 mL/kg, PEEP 12, RR 10, FiO2 0.4.

SUDDEN DETERIORATION:
• MAP falling 72→52 | HR rising 88→128 | SpO2 falling 94%→81%
• ECMO flow alarms: suction events
• Ventilator: high pressure alarm, peak 58 cmH2O
• Absent left breath sounds | Trachea deviated to right

CXR (portable, immediate): Large left pneumothorax with tension physiology. Mediastinal shift right.`,
    progressive_data:["14Fr intercostal drain inserted left 4th ICS mid-axillary line. Immediate air release and bubbling. MAP recovering to 65. SpO2 improving to 88%.","Post-drain: SpO2 plateaus at 88% despite drain swinging. Large air leak persisting. Subcutaneous emphysema spreading.","VV-ECMO sweep gas increased to compensate. Ventilator changes: PEEP reduced from 12 to 6, RR reduced to 8, accepting higher PaCO2.","Day 8: Air leak decreasing. Subcutaneous emphysema stable. ECMO flow 5 L/min. Team discussing bronchoscopy to assess for broncho-pleural fistula."],
    key_probes:["Tension pneumothorax on VV-ECMO — does the clinical presentation differ from a non-ECMO patient and why?","Immediate management — do you wait for CXR or needle decompress first?","Post-drain air leak persisting — what is a broncho-pleural fistula and how does it affect your ventilator strategy?","PEEP reduction in ARDS with air leak — how do you balance lung recruitment against worsening the fistula?","Subcutaneous emphysema spreading to neck — what are you worried about and what do you do?"],
    pearls:["Tension pneumothorax on VV-ECMO: ECMO provides gas exchange but cannot maintain cardiac output if there is obstructive shock from mediastinal shift. Do not wait for CXR.","Needle decompression: 2nd ICS mid-clavicular line OR 4th/5th ICS mid-axillary line. Follow immediately with formal chest drain.","Broncho-pleural fistula: minimise airway pressures — reduce PEEP, VT, RR. ECMO allows extreme lung rest. Accept worse oxygenation.","In ARDS with BPF: increasing PEEP worsens the air leak — the opposite of what you want."],
    pitfalls:["Subcutaneous emphysema tracking to neck: risk of airway compression. Secure airway. Consider prophylactic tracheostomy.","Increasing PEEP to improve oxygenation with a BPF: worsens the air leak.","Drain insertion on VV-ECMO with anticoagulation: bleeding risk is significant.","Do not clamp a draining chest drain with a BPF — tension pneumothorax will re-accumulate rapidly."]
  },
{
    id:26, title:"Obesity Hypoventilation — Difficult Weaning", domain:"Respiratory Failure", difficulty:"Medium",
    stem:`68M, BMI 54 kg/m2, known OHS on home CPAP (10 cmH2O), T2DM, hypertension. Acute hypercapnic respiratory failure from community-acquired pneumonia.

CURRENT STATUS (Day 5 ICU):
• Intubated | Mode: PSV 14 | PEEP 12 | FiO2 0.40 | RR 22 | VT 620 mL
• pH 7.38 | PaCO2 58 | PaO2 74 | HCO3 34 (chronic compensation)
• SpO2 96% | MAP 82 | GCS 15 on minimal sedation

FAILED SBT YESTERDAY: After 20 min T-piece — RR 40, SpO2 88%, diaphoresis. Stopped.
CXR: resolving right lower lobe consolidation.`,
    progressive_data:["Repeat SBT today on CPAP 5/0: after 30 min — RR 34, SpO2 91%, ABG: pH 7.31, PaCO2 72. Stopped.","Respiratory physio: poor inspiratory muscle strength. NIF -18 cmH2O (target <-20). Severe upper airway fat deposition on CT neck.","Tracheostomy performed Day 7. Patient tolerating 4-hour T-piece trials. PaCO2 on ABG after 4h: 64 mmHg.","Day 12: tolerating 12-hour T-piece trials. Team discussing decannulation criteria and home NIV plan."],
    key_probes:["Why does OHS specifically cause difficult weaning — the physiological mechanisms?","Failed SBT: PaCO2 rising to 72 — is this a sign of weaning failure or is this his baseline?","Extubation planning in a BMI 54 patient — what specific risks and what is your strategy?","Tracheostomy performed — what are your decannulation criteria specific to this patient?","Discharge planning: what NIV support does he need at home and how do you set it up?"],
    pearls:["OHS weaning failure mechanisms: (1) increased respiratory load from reduced chest wall and lung compliance; (2) upper airway obstruction from fat deposition; (3) blunted central respiratory drive due to chronic hypercapnia.","PaCO2 58 baseline (HCO3 34 = chronic compensation) — his 'normal' PaCO2 is 58, not 40. Target his baseline.","Extubation strategy in severe OBS: direct extubation to NIV (BiPAP) rather than to simple oxygen. Reduces re-intubation rate.","PEEP 12 in OHS: counteracts intrinsic PEEP from upper airway collapse and improves FRC."],
    pitfalls:["Targeting normocapnia (PaCO2 40) in OHS: will never achieve it. Target his baseline PaCO2.","Extubating OHS patient to high-flow oxygen alone: masks hypoventilation. Always extubate to NIV.","Supine positioning worsens OHS respiratory mechanics by 30%. Head-of-bed 30–45° mandatory.","Underestimating upper airway difficulty: BMI 54 = very high re-intubation risk."]
  },
{
    id:27, title:"Post-operative Respiratory Failure — Atelectasis vs PE vs Empyema", domain:"Respiratory Failure", difficulty:"Medium",
    stem:`72F, known COPD (FEV1 58%), right hemicolectomy for colonic cancer. Epidural analgesia in situ. Post-op Day 2, transferred from surgical ward with hypoxia.

ICU ARRIVAL:
• HR 112 | BP 118/72 | RR 28 | Temp 38.2°C | GCS 15
• SpO2 88% on 6L O2 | Right basal reduced air entry | Dull to percussion right base

ABG (FiO2 0.4): pH 7.44 | PaCO2 34 | PaO2 66 | Lactate 1.8
CXR: right lower zone opacity, loss of right hemidiaphragm, right costophrenic angle blunted
ECG: sinus tachycardia | D-dimer: 4200 ng/mL`,
    progressive_data:["CT pulmonary angiography: no PE. Right lower lobe collapse-consolidation with moderate right pleural effusion (250 mL estimated).","Ultrasound-guided right pleural aspiration: 200 mL turbid yellow fluid. pH 7.18, LDH 2400, protein 48 g/L, glucose 2.1 mmol/L. Gram stain: Gram-positive cocci.","Pleural fluid confirms empyema. Intercostal drain inserted. 400 mL purulent fluid drained. SpO2 improving to 95% on 4L O2.","Day 5: Drain output decreasing but fever persisting. CT chest: loculated right pleural collection with internal septations. Drain poorly positioned."],
    key_probes:["Differential for post-operative hypoxia on Day 2 — list in order of probability and how you distinguish them.","D-dimer 4200 post-operatively — how do you interpret this and does it change your PE workup?","Pleural fluid analysis: pH 7.18, LDH 2400, glucose 2.1, turbid. What is the diagnosis and what do you do?","Light's criteria — apply them here and what do they mandate?","Loculated empyema, poorly positioned drain — management options?"],
    pearls:["Post-operative hypoxia Day 2 probability order: (1) atelectasis — most common; (2) pneumonia; (3) pleural effusion; (4) PE. D-dimer is almost always elevated post-operatively — use Wells score, not D-dimer alone.","Pleural fluid empyema criteria: pH <7.20, LDH >1000 IU/L, glucose <2.2 mmol/L, or frank pus, or positive Gram stain/culture. Any ONE = drain immediately.","Light's criteria for exudate: pleural/serum protein >0.5, pleural/serum LDH >0.6, or pleural LDH >2/3 upper limit normal.","Intrapleural fibrinolytics (alteplase + DNase): indicated for complex parapneumonic effusion or empyema with loculations."],
    pitfalls:["D-dimer post-operatively: virtually always elevated. Use Wells score to drive the decision for CTPA.","Leaving an empyema undrained: rapid deterioration, sepsis, bronchopleural fistula. Drain on diagnosis.","Small-bore drain for empyema: adequate for free-flowing fluid. Thick pus or loculations may need large-bore drain.","Epidural analgesia and splinting: inadequate pain control is the primary cause of atelectasis post-laparotomy."]
  },
{
    id:28, title:"Post-Extubation Stridor — Prevention & Management", domain:"Respiratory Failure", difficulty:"Medium",
    stem:`44F, intubated for 8 days following severe septic shock and ARDS. RASS 0, CAM-ICU negative, MRC sum score 44/60. P/F 220 on PEEP 5/FiO2 0.35.

SBT PASSED: 30-min T-piece — RR 18, SpO2 97%, HR 88, no distress.

PRE-EXTUBATION:
• ETT 7.5 mm oral | Cuff leak test: NO audible leak at 25 cmH2O cuff pressure
• Secretion burden: minimal | Strong cough (peak flow >160 L/min)
• Team proceeding to extubation despite absent cuff leak`,
    progressive_data:["Extubated to 40% Venturi mask. Within 10 minutes: inspiratory stridor, SpO2 falling to 91%, patient distressed, RR 32.","IV dexamethasone 8mg given. Nebulised adrenaline 5mg administered. Partial improvement — stridor persisting but SpO2 94%.","30 minutes post-extubation: stridor worsening, SpO2 falling to 88% despite HFNC 40L/min FiO2 0.6. Patient increasingly fatigued.","Decision made to re-intubate. ENT review: laryngoscopy shows bilateral vocal cord oedema and granuloma formation."],
    key_probes:["Cuff leak test — what does absence of a leak predict and what is the sensitivity/specificity?","What prophylactic measures reduce post-extubation stridor risk and what is the evidence?","Stridor post-extubation — your stepwise management before considering re-intubation.","Re-intubation decision — what are your criteria and what is the risk of waiting?","ENT shows bilateral VC oedema and granuloma — does this patient need a tracheostomy?"],
    pearls:["Cuff leak test: absence of leak = high risk of post-extubation stridor, especially in women and after prolonged intubation. Mandates prophylactic steroids.","Prophylactic steroids: methylprednisolone 20mg IV 12-hourly starting 12h before extubation (4 doses total). Reduces stridor incidence from ~20% to ~5%. Evidence: CHEST 2007 Francois trial.","Post-extubation stridor management: (1) nebulised adrenaline 5mg; (2) IV dexamethasone 8mg; (3) HFNC or heliox; (4) ENT review; (5) re-intubate if deteriorating.","Heliox (helium-oxygen 70:30): reduces airway resistance due to low gas density — temporising measure."],
    pitfalls:["Waiting too long to re-intubate in stridor: the fatiguing patient is a difficult airway. Re-intubate early while you still have margin.","Single dose of steroids at time of extubation: the evidence supports starting 12 hours BEFORE extubation with multiple doses.","Assuming stridor is always laryngeal oedema: consider tracheomalacia, subglottic stenosis, granuloma, vocal cord paralysis. ENT review mandatory.","Extubating to room air after prolonged ICU stay: always to supplemental oxygen with monitoring."]
  },
{
    id:29, title:"VV-ECMO Patient — Inter-Hospital Transfer", domain:"Respiratory Failure & ECMO", difficulty:"High",
    stem:`29M, previously healthy. Severe influenza ARDS — P/F 52 after 5 days of optimal ventilation including proning. VV-ECMO commenced at peripheral hospital (right internal jugular dual-lumen Avalon cannula, 31 Fr). Day 2 on ECMO, haemodynamically stable.

ECMO PARAMETERS:
• Flow: 4.8 L/min | RPM: 3200 | Sweep gas FiO2 1.0 at 8 L/min
• Recirc fraction estimated 25% | ACT 180–220 seconds

VENTILATOR (ultra-protective):
• VCV | VT 2.5 mL/kg | PEEP 10 | RR 10 | FiO2 0.4

TRANSFER REQUEST: Regional ECMO centre 140km away.`,
    progressive_data:["Pre-transfer checklist in progress. Registrar: transport ventilator compatible, ECMO circuit secure, heparin infusion running. Questions arise about O2 cylinder calculation and handover.","En route (ambulance, 90 min estimated): ECMO flow alarm — flow drops from 4.8 to 3.1 L/min. Circuit inspection: large clot visible in venous drainage limb.","Circuit clot managed. 30 min from destination: patient develops new haemoptysis — 40 mL blood from ETT. SpO2 falling. ECMO sweep gas reduced.","Arrival at ECMO centre: formal handover. New chest CT: bilateral pulmonary haemorrhage. ACT 280 seconds (supratherapeutic)."],
    key_probes:["Who can transfer a VV-ECMO patient — team composition, skills, and minimum requirements?","Calculate O2 requirements for this transfer — walk me through the arithmetic.","En route: ECMO flow drops 4.8 → 3.1 L/min with visible circuit clot. Your immediate steps.","Haemoptysis on ECMO with ACT 280 — how do you balance anticoagulation against bleeding risk?","Formal handover at ECMO centre — what must be communicated and documented?"],
    pearls:["VV-ECMO transfer team minimum: ECMO-trained perfusionist or intensivist, ICU nurse experienced in ECMO, consultant oversight.","O2 calculation: sweep gas (8 L/min × 1.0 × 90 min × 2) = 1440L PLUS ventilator (~5 L/min × 0.4 × 90 min × 2) = 360L. Total ~1800L minimum for 90-min transfer.","Circuit clot: reduce flow, inspect circuit, check ACT. If clot in venous drainage — prime replacement circuit. Never increase RPM blindly.","Haemoptysis on ECMO: reduce or suspend anticoagulation, reduce sweep gas, position with bleeding lung dependent."],
    pitfalls:["Underestimating O2 requirements: ECMO sweep gas consumes O2 at high flow rates. Peripheral hospitals often calculate ventilator O2 only and run out of sweep gas O2 en route.","Transferring an unstable ECMO patient: stabilise before transfer.","Not having a circuit change kit in the ambulance: if circuit clots during transfer without a spare, outcome is catastrophic.","Handover without written documentation: must include cannula size/position, anticoagulation protocol, current parameters, complications en route."]
  },
{
    id:30, title:"Late ARDS — Fibrotic Phase & Step-Down Planning", domain:"Respiratory Failure", difficulty:"Medium",
    stem:`55M, ARDS from severe bacterial pneumonia — now Day 24 ICU. Initial P/F 68, required proning ×6 sessions and VV-ECMO ×8 days (decannulated Day 16). Tracheostomy in situ (Day 10).

CURRENT STATUS:
• Tracheostomy on CPAP 5 cmH2O, FiO2 0.35 | SpO2 95%
• P/F ratio: 195 | Tolerating 8-hour T-piece trials
• CT chest (Day 22): bilateral traction bronchiectasis, reticulation, early honeycombing
• MRC sum score: 30/60 | CAM-ICU: intermittently positive
• Family present daily — asking about prognosis and recovery timeline`,
    progressive_data:["Respiratory physio review: weak cough, high secretion burden, 4-hourly suctioning required. Concerns about ability to manage own airway after decannulation.","Weaning team MDT: SLT assessment — silent aspiration on video fluoroscopy. Dietitian: severe malnutrition, albumin 19 g/L. Psychologist: significant anxiety and PTSD symptoms.","Week 5: P/F 228 on room air via trach mask. Tolerating 16-hour T-piece. Cognitive testing: moderate impairment (MoCA 18/30). Family meeting requested.","Week 6: decannulation performed. Placed on nocturnal NIV via face mask for hypercapnia support (pH 7.36, PaCO2 54 on room air). Transferred to step-down unit."],
    key_probes:["CT shows traction bronchiectasis and early honeycombing on Day 22 — what does this mean for long-term prognosis?","PICS — define it, list the domains affected, and what early interventions reduce its incidence?","Decannulation criteria in a tracheostomised ARDS survivor — what are they and how do you assess each one?","The family ask: will he return to normal? How do you frame this conversation honestly?","Nocturnal NIV post-decannulation — who needs it and why does this patient specifically need it?"],
    pearls:["Late ARDS fibrosis: traction bronchiectasis and honeycombing on CT by Day 14–21 = fibroproliferative ARDS phase. Associated with prolonged ventilator dependence and poorer long-term lung function.","PICS (Post-Intensive Care Syndrome): physical (weakness), cognitive (memory, attention), psychological (PTSD, depression, anxiety). Prevalence 25–50% after prolonged ICU. ICU diary and early rehabilitation reduce incidence.","Decannulation criteria: (1) minimal secretions or effective cough; (2) no aspiration; (3) tolerating capping trial; (4) adequate swallow assessment; (5) patient and carer ready.","Post-ARDS nocturnal hypoventilation: chronic respiratory muscle weakness → nocturnal hypercapnia. Nocturnal NIV reduces hypercapnia."],
    pitfalls:["Early prognostication in ARDS: many patients with severe early ARDS make remarkable functional recoveries. Avoid nihilism.","Decannulating a patient with silent aspiration: high aspiration pneumonia risk. Resolve aspiration or establish safe swallow strategy first.","Discharging ARDS survivor without follow-up: all severe ARDS survivors should have structured follow-up at 3 and 12 months.","Underestimating malnutrition impact: albumin 19 g/L = severe malnutrition contributing to weakness. Aggressive nutritional rehabilitation is as important as respiratory physiotherapy."]
  },
{
    id:31, title:"Aneurysmal SAH Day 1 — BP Targets & Rebleed Prevention", domain:"Neurocritical Care", difficulty:"High",
    stem:`52F, thunderclap headache, vomiting, brief LOC. Found by partner.

ED ARRIVAL:
• GCS 12 (E3V3M6) | HR 88 | BP 198/112 | Temp 37.2°C
• Meningism | Right third nerve palsy (pupil involved)

CT head: SAH, diffuse, thick in basal cisterns (Fisher Grade 4)
CTA: right PCOM aneurysm 8mm

WFNS Grade III | Hunt-Hess Grade III
Plan: endovascular coiling within 24 hours.`,
    progressive_data:["Post-coiling Hour 4: BP 142/88. GCS 14. Nimodipine started. Nurse asks about BP target now aneurysm is secured.","Day 4: GCS falling 14→11. New left arm weakness. TCD: right MCA mean velocity 180 cm/s (baseline 80). CT perfusion: right MCA territory hypoperfusion.","BP augmentation started — MAP target raised to 100–110 mmHg. Norad commenced. GCS improving to 13.","Day 7: Na 128 mmol/L. Urine output 3.8 L in 24h. Team debating SIADH vs cerebral salt wasting."],
    key_probes:["BP management pre-securing vs post-securing the aneurysm — targets and why they differ?","Nimodipine — mechanism, dose, and what specifically does it prevent?","Day 4: TCD MCA velocity 180 cm/s, new focal deficit. Define DCI and your management algorithm.","BP augmentation for vasospasm — what does current evidence support?","Na 128, urine output 3.8 L/24h — SIADH vs cerebral salt wasting. How do you differentiate and why does it matter?"],
    pearls:["Pre-coiling BP: SBP <160 mmHg to reduce rebleed risk. Post-securing: allow MAP 70–90 mmHg, higher if vasospasm.","Nimodipine: does NOT reverse vasospasm angiographically but reduces neurological deficits. Mechanism: neuroprotection. Dose: 60mg PO every 4h for 21 days.","DCI: new neurological deficit or CT infarct not attributable to other cause, occurring after Day 3. Distinct from angiographic vasospasm.","SIADH vs CSW: SIADH = euvolaemic, urine Na >40. CSW = hypovolaemic, high urine Na, polyuria. Treatment OPPOSITE — SIADH: fluid restrict; CSW: replace fluid and sodium."],
    pitfalls:["Fluid restriction for hyponatraemia in SAH: if CSW (not SIADH), fluid restriction causes hypovolaemia → worsens vasospasm → worsens DCI. Always assess volume status first.","Nimodipine IV: causes deaths from bolus dosing errors. Oral only in most guidelines.","Rebleed: most common in first 24 hours, carries 50–80% mortality. Secure the aneurysm as soon as safely possible.","TCD alone insufficient to diagnose vasospasm — high velocity indicates narrowing but CT perfusion required to diagnose DCI."]
  },
{
    id:32, title:"SAH Day 7 — Delayed Cerebral Ischaemia & Vasospasm", domain:"Neurocritical Care", difficulty:"High",
    stem:`48M, aneurysmal SAH from right MCA aneurysm, coiled on Day 1. WFNS Grade II, recovered to GCS 15 by Day 2. Now Day 7.

SUDDEN DETERIORATION:
• GCS falling 15→10 over 2 hours | New left hemiplegia | Left facial droop
• BP 118/72 (MAP 83) | HR 92 | Temp 37.8°C

CT head: no new haemorrhage, no hydrocephalus
CT perfusion: right MCA territory — reduced CBF, prolonged MTT
TCD: right MCA mean velocity 220 cm/s | Lindegaard ratio 5.2`,
    progressive_data:["DSA confirms severe right M1 vasospasm (80% narrowing). Intra-arterial verapamil administered. Velocity falls to 160 cm/s. Deficit persists.","BP augmentation: norad titrated to MAP 110 mmHg. 2 hours later: GCS improving 10→13. Left arm movement partially returning.","Day 8: MAP maintained 100–110 mmHg on norad 0.18. Fever 38.6°C. Na 131 mmol/L.","Day 10: Vasospasm resolving on TCD. GCS 14. New CT: hydrocephalus developing. EVD vs LP vs conservative being discussed."],
    key_probes:["DCI confirmed — immediate management priorities in order.","BP augmentation: MAP target, vasopressor choice, and specific risks of this strategy?","Intra-arterial verapamil — mechanism and alternatives if vasospasm persists?","Fever on Day 8 in SAH — differential and why does temperature matter specifically?","Day 10: hydrocephalus developing — EVD vs LP vs conservative, how do you decide?"],
    pearls:["DCI management: (1) induce hypertension MAP 100–120; (2) ensure euvolaemia; (3) intra-arterial therapy (verapamil, milrinone, angioplasty) for refractory cases.","Lindegaard ratio = MCA velocity / ICA velocity. >3 = vasospasm. >6 = severe. Distinguishes vasospasm from hyperdynamic states.","Intra-arterial verapamil: direct vasodilation. Alternatives: intra-arterial nimodipine, milrinone, balloon angioplasty for proximal vessels.","Fever in SAH: independently associated with worse neurological outcome. Even 1°C increase in brain temperature worsens ischaemic injury. Treat aggressively."],
    pitfalls:["Triple-H therapy: hypervolaemia and haemodilution components are no longer recommended — no benefit, haemodilution worsens O2 delivery. Only induced hypertension has support.","EVD in SAH: reduces ICP from hydrocephalus but carries risks — rebleeding, ventriculitis. Weigh risk vs benefit.","Worsening neurological deficit in SAH Day 7 = DCI until proven otherwise — do not attribute to sedation or electrolytes without ruling out vasospasm.","Na correction in CSW: use isotonic or hypertonic saline. Correction too rapid causes central pontine myelinolysis. Maximum 10 mmol/L per 24h."]
  },
{
    id:33, title:"Malignant MCA Infarct — Decompressive Hemicraniectomy", domain:"Neurocritical Care", difficulty:"High",
    stem:`61M, hypertension, AF on warfarin. Sudden onset left hemiplegia and aphasia, onset 2 hours ago.

ED ARRIVAL:
• GCS 9 | NIHSS 22 | BP 188/104 | HR 118 AF
• Left gaze deviation | Left hemiplegia | Global aphasia

CT head: hyperdense right MCA sign, loss of insular ribbon
CTA: right M1 complete occlusion
CT perfusion: large ischaemic core >100 mL

Thrombectomy performed — TICI 2b reperfusion achieved.

ICU DAY 1 POST-THROMBECTOMY:
• GCS 8 | Midline shift 8 mm on repeat CT | Cerebral oedema worsening`,
    progressive_data:["Hour 18: GCS falling 8→6. Midline shift 12 mm. ICP 28 mmHg, CPP 52 mmHg. Bilateral extensor posturing.","Neurosurgery offers decompressive hemicraniectomy. Family present — no advance directive. Wife says 'he would want everything done.'","Post-hemicraniectomy Hour 24: ICP 8 mmHg, CPP 72 mmHg. GCS 7. Fever 38.8°C. Glucose 14 mmol/L.","Day 5: GCS improving to 10. Right side purposeful. Left side: minimal response to pain. Family asking about prognosis."],
    key_probes:["Malignant MCA infarct — define it and expected natural history without surgery?","Decompressive hemicraniectomy — what do the trials show, who benefits, and what does 'benefit' mean?","Timing of hemicraniectomy — is there a window and what factors influence the decision?","The wife says 'he would want everything done.' How do you counsel her about what hemicraniectomy does and does not achieve?","Post-op Day 5: GCS 10, purposeful right side, minimal left side. How do you prognosticate and when?"],
    pearls:["Malignant MCA infarct: infarction >50% MCA territory with oedema causing midline shift and herniation. Natural history: 80% mortality without intervention.","Hemicraniectomy trials (DECIMAL, DESTINY, HAMLET): reduces mortality from 71% to 22% in ≤60 years. DESTINY II: benefit in 61–82 years but significantly higher rate of survival with severe disability (mRS 4–5).","The ethical crux: hemicraniectomy saves life but often to severe disability. The question is not 'will he survive?' but 'would he want to survive with this level of disability?'","Timing: most benefit if performed within 48h of symptom onset."],
    pitfalls:["Hemicraniectomy does not restore function — it prevents death from herniation. The neurological deficit from the infarct remains. Families must understand this distinction.","Age >60: most survivors have severe disability (mRS 4–5). Requires nuanced goals-of-care discussion.","Anticoagulation in AF post-large stroke: typically withheld 2–4 weeks due to haemorrhagic transformation risk.","Hyperglycaemia in acute stroke: worsens infarct size. Target glucose 7–10 mmol/L."]
  },
{
    id:34, title:"Refractory Status Epilepticus — Escalation to Anaesthetic Coma", domain:"Neurocritical Care", difficulty:"High",
    stem:`38M, known epilepsy on levetiracetam + sodium valproate. Generalised tonic-clonic seizures >30 minutes. Not responsive to pre-hospital midazolam 10mg IM.

ED ARRIVAL:
• GCS 6 (post-ictal) | HR 128 | BP 162/94 | Temp 38.4°C | SpO2 92%
• Intermittent tonic-clonic movements continuing

TREATMENT SO FAR:
• Lorazepam 4mg IV ×2 — no response
• Levetiracetam 60 mg/kg IV infusion running
• Blood glucose 8.2 | Na 138 | Ca 2.28

EEG: continuous spike-wave discharges, no suppression`,
    progressive_data:["Sodium valproate 40 mg/kg IV loading dose given. Seizures continuing. EEG: persistent ictal activity.","Intubated (RSI ketamine/roc). Propofol infusion 2 mg/kg/h started. EEG shows burst suppression. Clinical seizures stopped.","Hour 6 on propofol: EEG showing breakthrough ictal activity despite burst suppression. Propofol increased to 5 mg/kg/h.","Hour 24: PRIS suspected — lactate rising 2.1→4.8, ECG: RBBB, urine discoloured green-brown. Lipase elevated."],
    key_probes:["Define status epilepticus — operational definition and the time thresholds that mandate escalation.","Treatment ladder for convulsive SE — first, second, and third-line agents with doses.","When do you intubate in status epilepticus — your criteria?","EEG-targeted treatment: what is the goal and what pattern are you targeting?","Propofol infusion syndrome — how do you recognise it and what do you do?"],
    pearls:["SE operational definition: seizure ≥5 minutes (T1) requiring treatment; >30 minutes (T2) = established SE.","Treatment ladder: (1) lorazepam 0.1 mg/kg IV; (2) levetiracetam 60 mg/kg, sodium valproate 40 mg/kg, or lacosamide 400 mg; (3) propofol, midazolam infusion, or barbiturate coma.","EEG monitoring target in refractory SE: burst suppression (3–10% activity). Titrate anaesthetic agent to EEG pattern, not just clinical appearance.","PRIS: metabolic acidosis, rhabdomyolysis, cardiac arrhythmias (RBBB, ST changes), renal failure. Risk factors: doses >4 mg/kg/h for >48h. Switch to midazolam or barbiturate immediately."],
    pitfalls:["Treating only clinical seizure manifestations: NCSE can persist after clinical seizures stop. EEG mandatory in all patients with unexplained coma post-seizure.","Propofol for prolonged SE: PRIS risk increases significantly after 48h at high doses. Do not exceed 4 mg/kg/h without EEG-guided justification.","Under-dosing second-line agents: levetiracetam 60 mg/kg is the correct loading dose — not 500mg or 1g.","Failing to identify and treat the underlying cause: SE is a symptom — investigate for metabolic, structural, infectious, toxic, autoimmune causes."]
  },
{
    id:35, title:"Non-Convulsive Status Epilepticus in ICU", domain:"Neurocritical Care", difficulty:"High",
    stem:`72F, admitted 5 days ago with severe CAP and septic shock. Initially intubated, now extubated. Improving haemodynamically.

DAY 5 CONCERN:
• GCS not returned to baseline — currently GCS 10 (E3V3M4)
• Occasional eyelid twitching and rhythmic eye deviation
• Not responding to verbal commands consistently
• Temp 37.4°C | BP 124/78 | HR 88

EEG ordered: continuous generalised rhythmic delta activity with superimposed spike-wave discharges`,
    progressive_data:["Lorazepam 2mg IV given while EEG running. 5 minutes later: EEG normalising — delta activity reducing. GCS improving to 13. NCSE confirmed by treatment response.","Levetiracetam 1500mg IV BD started. MRI brain: small bilateral cortical restricted diffusion (probable sepsis-associated encephalopathy vs subtle ischaemia). LP: no meningitis.","Day 7: GCS 14. Cognitive testing: moderate impairment — oriented to person only.","Team discussing antiepileptic weaning and long-term EEG monitoring need."],
    key_probes:["Define NCSE — how does it present in the ICU and why is it missed?","Unexplained coma or encephalopathy in the ICU — when do you order an EEG?","The Salzburg criteria for NCSE — what are they and how do you apply them?","Empirical benzodiazepine trial: if EEG improves and patient wakes up — is that diagnostic?","Does NCSE cause brain damage and does aggressive treatment change outcome?"],
    pearls:["NCSE in ICU: unexplained or disproportionate encephalopathy, subtle motor signs (eye deviation, eyelid twitching, nystagmus), or failure to waken post-sedation. Incidence in ICU encephalopathy: up to 10–30%.","Indications for EEG in ICU: (1) unexplained coma; (2) post-convulsive persistent altered consciousness; (3) subtle motor signs; (4) unexplained clinical fluctuations; (5) all patients on NMBA with unexplained physiology.","Salzburg criteria: rhythmic or periodic EEG patterns ≥2.5 Hz OR patterns <2.5 Hz with clinical correlation OR response to treatment. Requires clinical-EEG correlation.","Empirical benzodiazepine trial: improvement in EEG AND clinical state = diagnostic for NCSE."],
    pitfalls:["EEG in septic encephalopathy: generalised slowing is common and non-specific. Do not diagnose NCSE on slowing alone.","Overtreating EEG patterns: periodic lateralised discharges and burst suppression are not synonymous with NCSE.","Missing NCSE post-cardiac arrest: post-anoxic myoclonus and NCSE are common post-ROSC. All post-arrest patients with unexplained coma should have continuous EEG monitoring.","Valproate inhibits cytochrome P450 — can significantly raise levels of other drugs including phenytoin."]
  },
{
    id:36, title:"Guillain-Barré Syndrome — Respiratory Failure & Autonomic Instability", domain:"Neurocritical Care", difficulty:"High",
    stem:`42M, previously healthy. Progressive ascending weakness after Campylobacter gastroenteritis 4 weeks ago. Now with difficulty swallowing and breathlessness.

ICU ADMISSION:
• GCS 15 | HR 112 | BP 148/92 | RR 26 | SpO2 94% on 4L
• Arms 2/5 | Legs 0/5 | Facial weakness | Bulbar dysfunction
• Absent deep tendon reflexes throughout

BEDSIDE RESPIRATORY:
• FVC: 1.1 L (23% predicted) | MIP: -22 cmH2O
• Can count to only 8 in one breath

CSF: protein 2.8 g/L, 2 cells — albuminocytological dissociation`,
    progressive_data:["Over 2 hours: FVC falling 1.1→0.8 L. Patient increasingly distressed. SpO2 92% on 6L. Intubation decision imminent.","Post-intubation (awake fibreoptic): HR suddenly 42 bpm, BP 68/40. Team requesting atropine.","Post-intubation Day 2: BP fluctuating 82/48 to 198/112 within minutes. HR varying 38 to 148. Nurse asks for a single vasopressor order.","Day 3: IVIg 2g/kg commenced. Team asking: IVIg vs plasmapheresis — which and why?"],
    key_probes:["FVC 23% predicted, MIP -22, counting to 8 — do you intubate now? Give me the thresholds.","The 20-15-11 rule — what is it and how do you apply it in GBS?","Post-intubation: HR 42, BP 68. Is this vagal, is this autonomic GBS, and what do you do?","Autonomic instability in GBS — what are the specific dangers and how do you manage them?","IVIg vs plasmapheresis in GBS — mechanism, evidence, and how do you choose?"],
    pearls:["20-15-11 rule in GBS: intubate if FVC <20 mL/kg, MIP >-25 cmH2O, or MEP <40 cmH2O. Any ONE = high risk. Do not wait for SpO2 to fall.","GBS autonomic instability: occurs in 65% of ventilated GBS. The bradycardia-hypotension seen post-intubation is loss of sympathetic tone NOT vagal surge — atropine is NOT the answer.","IVIg: 2g/kg over 5 days. Evidence: equivalent to plasmapheresis. No benefit in combining both.","Plasmapheresis: 5 sessions over 10 days. Equivalent to IVIg. Do not give both unless relapse after first treatment."],
    pitfalls:["Atropine for GBS autonomic bradycardia: the bradycardia is followed by hypertension. Atropine treats bradycardia but the subsequent HTN can be severe. Use short-acting agents only.","Succinylcholine in GBS: ABSOLUTE CONTRAINDICATION — denervation hypersensitivity causes massive hyperkalaemia → cardiac arrest. Use rocuronium.","Monitoring in GBS: do not rely on SpO2 alone. SpO2 falls late — use serial FVC, MIP, and MEP.","Steroids in GBS: DO NOT USE — no benefit and possibly harmful."]
  },
{
    id:37, title:"Myasthenic Crisis vs Cholinergic Crisis", domain:"Neurocritical Care", difficulty:"High",
    stem:`56F, known myasthenia gravis on pyridostigmine 60mg TDS + prednisolone 20mg OD. Three days worsening ptosis, dysarthria, dysphagia. Now with respiratory distress.

ICU ADMISSION:
• GCS 15 | HR 92 | BP 138/82 | RR 28 | SpO2 92% on 6L
• Ptosis bilateral | Nasal voice | Cannot lift head off pillow
• Fasciculations noted | Increased oral secretions | Miosis

FVC: 0.9 L (38% predicted)
Recent: pyridostigmine increased to 90mg QDS 5 days ago by GP.`,
    progressive_data:["Decision: withhold pyridostigmine for 1 hour. Over 30 minutes: fasciculations decreasing, secretions less copious. FVC improving to 1.2 L.","Diagnosis: cholinergic crisis from pyridostigmine excess. Atropine 0.6mg IV given for secretions. Pyridostigmine withheld. Patient improves without intubation.","Day 2: IVIg 2g/kg over 5 days commenced. Trigger for decompensation being sought.","Neurology review: new thymoma found on CT chest. Thymectomy planned after recovery."],
    key_probes:["Myasthenic crisis vs cholinergic crisis — how do you distinguish clinically at the bedside?","Fasciculations + miosis + excess secretions in a myasthenia patient — what does this tell you?","The Tensilon test — mechanism, how to perform it, and when is it dangerous?","Withholding pyridostigmine as a diagnostic and therapeutic manoeuvre — the rationale.","IVIg vs plasmapheresis in myasthenic crisis — same principles as GBS or different considerations?"],
    pearls:["Myasthenic crisis: insufficient ACh at NMJ → weakness. Causes: under-medication, infection, surgery, drugs (aminoglycosides, fluoroquinolones, beta-blockers, magnesium).","Cholinergic crisis: excess ACh (anticholinesterase overdose) → SLUDGE + fasciculations + weakness (paradoxical) + miosis. Treatment: withhold anticholinesterase, give atropine for muscarinic symptoms.","Tensilon test: edrophonium 2mg then 8mg — improvement = myasthenic crisis. Worsening = cholinergic. Risk: worsening cholinergic crisis — have atropine ready.","Plasmapheresis preferred over IVIg in MG if: pre-operative, rapid response needed, or renal failure."],
    pitfalls:["Succinylcholine in myasthenia: unpredictable — resistance to succinylcholine AND prolonged response to non-depolarising agents. Use rocuronium with sugammadex available.","Magnesium in myasthenia: CONTRAINDICATED — blocks neuromuscular junction and precipitates crisis. Even in eclampsia.","Starting high-dose steroids for MG in ICU: can precipitate transient worsening in first 2 weeks. Ensure respiratory monitoring in place.","Aminoglycosides, fluoroquinolones, beta-blockers: all worsen myasthenia. Review all medications on admission."]
  },
{
    id:38, title:"Traumatic Cervical SCI — Neurogenic Shock & Ventilation", domain:"Neurocritical Care", difficulty:"High",
    stem:`24M, rugby injury — landed on head. Brought in with cervical collar and spinal immobilisation.

ED ARRIVAL:
• GCS 15 | HR 46 | BP 72/40 (MAP 51) | RR 22 | Temp 36.1°C
• Complete motor and sensory loss below C5 | No anal tone
• Priapism | Warm peripheries | Absent deep tendon reflexes below injury

C-spine MRI: C5/6 fracture-dislocation, cord compression, cord signal change at C5
ASIA grade: ASIA A (complete injury)`,
    progressive_data:["After 2L crystalloid: MAP 58, HR 44. Atropine 0.6mg given: HR transiently 72 then falls back to 48. Team asking about vasopressor choice.","Noradrenaline started. MAP improving to 68. However SpO2 falling 97%→89% over 2 hours. RR 32. Heavy accessory muscle use.","FVC: 0.8 L (estimated 30% predicted). ABG: pH 7.32, PaCO2 52, PaO2 74 (FiO2 0.5). Intubation decision imminent.","Post-intubation Day 3: MAP target discussion — neurosurgery wants MAP >85 mmHg for spinal cord perfusion. DVT prophylaxis question raised."],
    key_probes:["Neurogenic shock vs spinal shock — define both and how do you distinguish them in this patient?","Why is atropine a temporising measure only — what vasopressor do you use and why?","C5 injury and respiratory failure — what muscles are affected and why does this predict ventilator dependence?","MAP targets in acute SCI — what does the evidence say and for how long?","DVT prophylaxis in acute SCI — when do you start and what do you use?"],
    pearls:["Neurogenic shock: loss of sympathetic tone → peripheral vasodilation + unopposed vagal bradycardia. Triad: hypotension + bradycardia + warm peripheries. Distinct from haemorrhagic shock.","Spinal shock: loss of ALL reflexes below the level of injury. Resolves over days to weeks. Bulbocavernosus reflex returning = end of spinal shock.","C5 injury: diaphragm (C3-4-5) partially spared — can breathe but poorly. Intercostals paralysed. Abdominals paralysed — no cough. Predictors of intubation: FVC <50% predicted, increasing PaCO2.","MAP targets in acute SCI: maintain MAP 85–90 mmHg for first 7 days (NASCIS guidelines). Noradrenaline preferred."],
    pitfalls:["Aggressive fluid resuscitation in neurogenic shock: the problem is vasodilation, not hypovolaemia. Excessive fluid causes pulmonary oedema. Use vasopressors early.","Succinylcholine in SCI: safe within first 24 hours. After 48h: denervation hypersensitivity → hyperkalaemia → cardiac arrest. Use rocuronium after 48h.","DVT prophylaxis: SCI patients have very high DVT/PE risk. Start LMWH within 24–72h when haemostasis confirmed. Mechanical prophylaxis immediately.","Missing associated injuries in SCI: thoracic and abdominal injuries are common. Full trauma survey mandatory."]
  },
{
    id:39, title:"Brain Death — Diagnosis & Donor Management", domain:"Neurocritical Care", difficulty:"High",
    stem:`19M, previously healthy. Out-of-hospital cardiac arrest after drowning. CPR 25 minutes. ROSC achieved.

ICU DAY 3:
• Ventilated | Sedation OFF for 48 hours
• GCS: E1V1M1 (no response to any stimuli)
• Pupils: bilaterally fixed and dilated 6mm
• No corneal reflexes | No gag | No cough to tracheal suction
• No respiratory effort during 5-min ventilator disconnect

ABG during apnoea test: PaCO2 rising 40→68 mmHg — no respiratory effort

Ancillary testing (facial trauma preventing full cranial nerve testing): absent cerebral perfusion on radioisotope scan`,
    progressive_data:["Brain death confirmed by two senior physicians. Family informed. Organ donation discussed by specialist nurse.","Family agree to donation. Donor management begun. BP 82/48, DI (UO 600 mL/h, Na 158), temp 34.8°C, glucose 18 mmol/L.","Hormonal resuscitation bundle initiated. MAP improving to 72 with norad. DDAVP given for DI. Thyroid hormone and corticosteroids given.","24 hours later: haemodynamics stable. Kidneys, liver, heart, lungs all potentially viable. ODP team arriving."],
    key_probes:["Brain death — what are the preconditions that must be met before testing?","Walk me through the clinical tests for brain death — what are you testing and what constitutes a positive test?","Apnoea test — how do you perform it and what PaCO2 rise is required?","Diabetes insipidus in brain death — mechanism, diagnosis, and management.","Donor management bundle — what are the five hormonal therapies and what is each targeting?"],
    pearls:["Brain death preconditions: (1) known irreversible cause; (2) no sedatives/NMBA; (3) no metabolic derangement; (4) normothermia >35°C; (5) no drugs that mimic brain death.","Clinical brain death tests: pupil light reflex, corneal reflex, oculocephalic reflex, oculo-vestibular reflex, gag reflex, cough reflex, apnoea test.","Apnoea test: pre-oxygenate FiO2 1.0. Disconnect. Apply CPAP 10 or tracheal O2 insufflation. Observe 8–10 min or until PaCO2 ≥60 mmHg (or 20 mmHg rise from baseline). No respiratory effort = positive.","Donor management bundle: (1) vasopressin/DDAVP for DI; (2) methylprednisolone 15mg/kg; (3) T3/T4 for cardiac dysfunction; (4) insulin for hyperglycaemia; (5) noradrenaline for haemodynamics."],
    pitfalls:["Performing brain death testing without meeting preconditions: hypothermia, residual sedation, or metabolic derangement can mimic brain death. Confirmatory testing mandatory.","Apnoea test in COPD: CO2 rise may be impaired. Modified apnoea test or ancillary testing required.","Confusing brain death with vegetative state: vegetative state patients have preserved brainstem reflexes. Brain death requires absence of ALL brainstem reflexes.","DI in brain death: massive free water loss → hypernatraemia → organ damage. Treat with DDAVP and replace free water losses. Target Na <155 mmol/L."]
  },
{
    id:40, title:"ICH on Anticoagulation — Reversal & BP Control", domain:"Neurocritical Care", difficulty:"High",
    stem:`78M, AF on rivaroxaban 20mg OD (last dose 8 hours ago). Hypertension. Sudden severe headache, right hemiplegia, dysphasia.

ED ARRIVAL:
• GCS 11 (E3V3M5) | NIHSS 18 | HR 88 AF | BP 208/118
• Right hemiplegia | Global dysphasia | Right gaze deviation

CT head: large left basal ganglia haematoma 45 mL, intraventricular extension
CTA: no underlying vascular abnormality
Anti-Xa level: 186 ng/mL (rivaroxaban detectable)

Neurosurgery: no immediate surgical indication. ICU for medical management.`,
    progressive_data:["Hour 2: GCS falling 11→8. Repeat CT: haematoma expansion 45→68 mL. Midline shift 6 mm.","Reversal agent given. BP controlled. Hour 4: GCS stabilising at 8. No further expansion on 6-hour CT.","Day 2: GCS 9. Fever 38.4°C. Hyperglycaemia. Team discussing surgical evacuation vs conservative.","Day 5: GCS improving to 12. Right arm movement returning (1/5). DVT prophylaxis discussion: when to restart anticoagulation for AF?"],
    key_probes:["Rivaroxaban ICH — which reversal agent, dose, and time window?","BP management in ICH — target, agent, and time window. What does INTERACT2 tell you?","CT showing 45→68 mL expansion — risk factors for haematoma expansion and how do you prevent it?","Surgical evacuation in ICH — when is it indicated and what does the evidence say for basal ganglia haematoma?","Restarting anticoagulation post-ICH in AF — when, what, and how do you weigh the risks?"],
    pearls:["Rivaroxaban reversal: andexanet alfa 800mg IV bolus + 960mg infusion over 2h. If unavailable: 4F-PCC 50 units/kg.","BP management in ICH: INTERACT2 trial — target SBP <140 mmHg within 1 hour. Current guideline: target SBP <140 if SBP 150–220 mmHg and no contraindication.","Haematoma expansion risk factors: anticoagulation, large initial haematoma, irregular shape (satellite sign), early presentation (<6h). Expansion is the strongest predictor of poor outcome.","Restarting anticoagulation post-ICH in AF: restart at 4–8 weeks for lobar ICH, 2–4 weeks for deep ICH. NOACs preferred over warfarin post-ICH."],
    pitfalls:["FFP for DOAC reversal: no activity against direct Xa or thrombin inhibitors. Use andexanet alfa or 4F-PCC.","BP lowering too aggressively in large ICH with mass effect: high ICP may require higher MAP to maintain CPP. Measure ICP before aggressive BP lowering.","Surgical evacuation for basal ganglia ICH: STICH trial — no benefit from early surgery for deep ICH. STICH II: some benefit for superficial lobar ICH without IVH.","Fever and hyperglycaemia in ICH: both independently worsen outcome. Active treatment mandatory."]
  },
{
    id:41, title:"Out-of-Hospital VF Arrest Post-PCI — Full Post-ROSC Bundle", domain:"Cardiac & Post-Arrest Care", difficulty:"High",
    stem:`58F, hypertension, dyslipidaemia. OHCA — VF arrest at home. Bystander CPR within 3 min. Low-flow time 25 min to ROSC.

POST-PCI (anterior STEMI treated):
• Comatose — no eye opening, no response to pain, minimal brainstem reflexes
• Stable on low-dose norad | TTM at 36°C
• Echo: anterior WMA, LVEF ~35%
• pH 7.22 | Lactate 6.1 | Glu 12.4`,
    progressive_data:["24h: Sedation lightening. Generalised myoclonic jerks persisting >30 minutes. EEG ordered.","36h: Off sedation 12h confirmed. GCS M1. EEG: burst suppression, absent reactivity.","72h: GCS M1. 24h since last sedation. CT: diffuse grey-white loss, sulcal effacement.","SSEP: bilateral absent N20. NSE at 48h = 82 mcg/L (normal <17)."],
    key_probes:["Outline your first 24h post-ROSC priorities. TTM 33°C vs 36°C — what do you choose?","Oxygenation targets post-ROSC — why does hyperoxia specifically matter?","24h: generalised myoclonic jerks persisting >30 min. What are you thinking and what do you do?","Walk me through ERC/ESICM 2021 neuroprognostication algorithm — timing and modalities.","72h: bilateral absent N20, malignant EEG, diffuse grey-white loss, NSE 82. What do you tell the family?"],
    pearls:["ERC/ESICM 2021: no final prognostication before 72h post-ROSC AND after sedative clearance.","Multimodal required: clinical exam + EEG + SSEP (absent N20) + NSE + neuroimaging. No single test sufficient.","Bilateral absent N20 = strongest poor outcome predictor. False positive rate <5% in correct timeframe.","Target PaO2 75–100 mmHg post-arrest. Hyperoxia causes oxidative neuronal injury."],
    pitfalls:["Self-fulfilling prophecy: early WLST on incomplete prognostication. Follow the algorithm rigorously.","Generalised myoclonic status ≠ Lance-Adams (good sign). Prolonged generalised myoclonus = malignant. Get EEG urgently.","NSE falsely elevated by haemolysis — always check before interpreting.","TTM: fever avoidance matters more than target temperature. Rigorous normothermia for 72h non-negotiable."]
  },
{
    id:42, title:"In-Hospital PEA Arrest — Massive PE vs Tamponade", domain:"Cardiac & Post-Arrest Care", difficulty:"High",
    stem:`67M, post right hemicolectomy Day 2. Found unresponsive by nurse. CPR commenced immediately.

DURING RESUSCITATION:
• Rhythm: PEA | HR 0 on monitor | No palpable pulse
• Ventilated with bag-mask | Compressions ongoing

AVAILABLE INFORMATION:
• Pre-arrest: increasing dyspnoea over 2 hours, SpO2 falling to 88% on 4L
• No chest pain reported | BP had been 88/52 (MAP 63) — 'assumed post-op hypotension'
• Recent: immobilised, not anticoagulated (surgical decision)
• Bedside echo during CPR: dilated RV, no obvious pericardial effusion, D-sign present`,
    progressive_data:["ROSC achieved after 8 minutes CPR. BP 72/40 on norad 0.4 mcg/kg/min. GCS 8. SpO2 88% on FiO2 1.0.","Bedside echo post-ROSC: severely dilated RV, TAPSE 8 mm, D-sign, small underfilled LV. No tamponade.","Systemic thrombolysis alteplase 50mg given empirically. 45 min later: MAP improving to 68, SpO2 94%.","CTPA (post-stabilisation): bilateral central PE with saddle thrombus. RV/LV ratio 1.6. No surgical bleeding identified."],
    key_probes:["PEA arrest in a post-surgical patient — your differential in the first 30 seconds. How do you work through it?","Echo during CPR: dilated RV, D-sign, no effusion. How does this change your resuscitation?","Empirical thrombolysis during CPR — indications, dose, and what happens to CPR afterwards?","Post-ROSC: patient had surgery 48h ago. You've given thrombolysis. Now what?","Mechanical thrombectomy vs surgical embolectomy vs continued medical management — how do you decide?"],
    pearls:["PEA arrest differential — the 4Hs and 4Ts: hypovolaemia, hypoxia, hypo/hyperkalaemia, hypothermia; tension pneumothorax, tamponade, toxins, thromboembolism. Echo during CPR immediately narrows this.","Echo in PEA: dilated RV + D-sign without pericardial effusion = massive PE until proven otherwise. Tamponade shows pericardial effusion with collapse of right-sided chambers.","Thrombolysis during CPR: alteplase 50mg IV bolus. Continue CPR for minimum 60–90 minutes post-thrombolysis to allow drug effect. ROSC rate approximately 50% in PE-PEA.","Post-thrombolysis surgical bleeding: withhold anticoagulation for 24h post-thrombolysis. Surgical site bleeding is a known risk but massive PE is immediately lethal — the decision is usually justified."],
    pitfalls:["Stopping CPR too early after thrombolysis: thrombolysis takes 15–45 minutes to work. CPR must continue for at least 60–90 minutes post-dose before declaring failure.","Missing PE as the cause of post-surgical PEA: PE after major abdominal surgery is common. The pre-arrest dyspnoea and SpO2 fall were warning signs that were attributed to post-operative changes.","Empirical thrombolysis for PEA without echo confirmation: if tamponade is the cause (not PE), thrombolysis will not help and may cause bleeding into the pericardium. Echo during CPR is mandatory.","Anticoagulation post-thrombolysis: start unfractionated heparin when aPTT <80s (usually 3–4h post-thrombolysis). Not before."]
  },
{
    id:43, title:"Fulminant Myocarditis — Escalation to MCS", domain:"Cardiac & Post-Arrest Care", difficulty:"High",
    stem:`28M, previously healthy. One week viral prodrome (fever, myalgia). Now presenting with chest pain, breathlessness, and presyncope.

ICU ADMISSION:
• HR 128 | BP 78/44 (MAP 55) | RR 28 | Temp 37.8°C
• SpO2 90% on 10L O2 | GCS 14

ECG: sinus tachycardia, diffuse ST elevation (concave), PR depression, low voltage
Echo: severely dilated LV (LVEDD 6.8 cm), EF 15%, moderate pericardial effusion (no diastolic collapse), bilateral B-lines
Troponin I: 48 ng/mL (HIGH) | BNP: 4200 pg/mL
CRP 280 | WBC 14 | Lymphocytes 0.8 (lymphopenia)`,
    progressive_data:["After 1L crystalloid + dobutamine 5 mcg/kg/min: MAP 58, HR 134. SpO2 88%. Lactate rising 3.1→5.8.","Intubated. Post-intubation BP 62/38. Norad 0.4 mcg/kg/min + dobutamine continuing. IABP inserted. MAP 68.","Hour 6: lactate 7.2, ScvO2 44%, urine output 5 mL/h. IABP augmenting but CI estimated 1.4 L/min/m2.","VA-ECMO cannulated (femoral). Flow 3.8 L/min. MAP 72 on reduced vasopressors. Lactate beginning to fall."],
    key_probes:["Fulminant myocarditis — how do you distinguish it from dilated cardiomyopathy at the bedside?","Dobutamine in an EF of 15% — what is the specific risk and what are you monitoring?","IABP in cardiogenic shock from myocarditis — mechanism and what does the evidence say?","VA-ECMO in fulminant myocarditis — why is this a good indication and what are the specific risks?","The myocarditis may be autoimmune — when and how do you consider immunosuppression?"],
    pearls:["Fulminant myocarditis: acute onset (<2 weeks), preserved or only mildly dilated LV initially, haemodynamic instability disproportionate to degree of structural change. Unlike DCM: potentially fully reversible with support.","MCS escalation ladder in cardiogenic shock: dobutamine → IABP → Impella → VA-ECMO. Each step provides progressively more haemodynamic support. VA-ECMO provides complete cardiopulmonary bypass.","VA-ECMO in myocarditis: excellent indication — underlying heart is potentially fully recoverable, drug is not involved, native cardiac function is acutely depressed but reversible. Bridge-to-recovery or bridge-to-transplant.","Autoimmune myocarditis: consider endomyocardial biopsy if giant cell myocarditis suspected (rapid deterioration, AV block, VT). Giant cell myocarditis requires immunosuppression — prednisolone + azathioprine or cyclosporine."],
    pitfalls:["Aggressive fluid loading in fulminant myocarditis: EF 15% with B-lines = cardiogenic pulmonary oedema. Fluid will worsen, not improve, haemodynamics.","Dobutamine precipitating arrhythmias: in a severely inflamed myocardium, catecholamines can trigger VT/VF. Start low (2.5 mcg/kg/min), have defibrillator immediately available.","LV distension on VA-ECMO: ECMO unloads the aorta but does not vent the LV. Severely dysfunctional LV may distend → worsens pulmonary oedema. May need LV venting (Impella or atrial septostomy).","Endomyocardial biopsy in acute setting: carry significant procedural risk in haemodynamically unstable patient. Stabilise with MCS before biopsy."]
  },
{
    id:44, title:"Electrical Storm — Recurrent VT in Ischaemic Cardiomyopathy", domain:"Cardiac & Post-Arrest Care", difficulty:"High",
    stem:`64M, ischaemic cardiomyopathy (previous anterior MI, LVEF 25%), ICD in situ. Admitted following 3 ICD shocks at home within 2 hours.

ICU ADMISSION:
• HR 140 (VT) | BP 88/52 | GCS 14
• ICD interrogation: appropriate shocks for monomorphic VT (cycle length 320 ms)
• ECG: monomorphic VT, LBBB morphology, superior axis
• Troponin mildly elevated | K+ 3.2 | Mg2+ 0.62 | pH 7.31

IMMEDIATE: DC cardioversion performed — ROSC, sinus rhythm 88 bpm.
20 minutes later: VT recurs. Second DC cardioversion. Sinus rhythm restored.`,
    progressive_data:["Third VT episode within 1 hour of admission. Team asking: what do you do differently now — antiarrhythmic strategy?","Amiodarone 300mg IV bolus given, infusion 900mg/24h started. K+ and Mg2+ replaced. No further VT for 3 hours.","Electrophysiology review: substrate mapping and VT ablation recommended. Pre-ablation: beta-blocker restarted cautiously. Sedation strategy for ablation discussed.","Post-ablation Day 2: no further VT. However new concern: amiodarone thyrotoxicosis suspected (TSH suppressed, T4 elevated, fever)."],
    key_probes:["Define electrical storm — and what are the three immediate priorities in the first 30 minutes?","Antiarrhythmic ladder for electrical storm — which agents, in which order, and why?","K+ 3.2 and Mg2+ 0.62 — how urgently do you correct these and to what targets?","Deep sedation for electrical storm — rationale, which agent, and the haemodynamic risk in LVEF 25%?","Amiodarone thyrotoxicosis — two types, how do you distinguish them, and does treatment differ?"],
    pearls:["Electrical storm: ≥3 sustained VT/VF episodes within 24 hours requiring termination. Immediate priorities: (1) terminate acute arrhythmia (DC cardioversion if haemodynamically unstable); (2) correct reversible triggers (electrolytes, ischaemia, drugs); (3) suppress with antiarrhythmics.","Antiarrhythmic ladder in electrical storm: (1) amiodarone 300mg IV bolus + infusion; (2) beta-blocker (propranolol IV or esmolol — reduces sympathetic drive); (3) lignocaine if amiodarone ineffective; (4) deep sedation/general anaesthesia for refractory storm.","Electrolyte targets in VT: K+ >4.5 mmol/L, Mg2+ >1.0 mmol/L. Hypokalaemia and hypomagnesaemia are the most common correctable triggers.","Deep sedation for electrical storm: general anaesthesia (propofol or volatile agent) reduces sympathetic tone and breaks the catecholamine surge driving storm. Evidence from multiple case series."],
    pitfalls:["Repeating DC cardioversion without antiarrhythmic therapy: VT will immediately recur without pharmacological suppression. Cardioversion terminates the arrhythmia — it does not prevent recurrence.","Beta-blocker in LVEF 25% with cardiogenic shock: carvedilol and metoprolol are relatively contraindicated in acute decompensation. Use esmolol (short-acting, titratable) — can be reversed quickly if haemodynamics worsen.","Amiodarone thyrotoxicosis Type 1 (iodine excess, underlying thyroid disease): treat with thionamides. Type 2 (destructive thyroiditis, no underlying disease): treat with corticosteroids. Mixed type: treat both. Withdrawing amiodarone is NOT always necessary acutely.","ICD shocks themselves can perpetuate storm (pain → sympathetic surge → more VT). Deep sedation breaks this cycle."]
  },
{
    id:45, title:"Post-CABG — Differentiating Low Output, Bleeding & Tamponade", domain:"Cardiac & Post-Arrest Care", difficulty:"High",
    stem:`72M, triple-vessel CABG + AVR (bioprosthetic). Bypass 142 minutes. ICU post-op.

HOUR 2 BASELINE:
• MAP 72 | HR 82 (paced) | CVP 9 | CO 3.8 L/min | SVR 1200
• Chest drains: 60 mL/h | Temp 36.2°C | UO 45 mL/h

HOUR 8 — DETERIORATION:
• MAP 54 | HR 112 | CVP rising 9→16
• CO falling 3.8→1.9 L/min | SVR rising 1200→2200
• Chest drains: STILL draining 180 mL/h (rising)
• Hb falling 10.8→8.1 over 2 hours`,
    progressive_data:["Echo: no pericardial collection. Hypokinetic LV globally (EF 28%). RV mildly dilated. Bioprosthetic AVR: no paravalvular leak, normal gradients.","TEG: LY30 8.2% (primary fibrinolysis pattern). MA 54 mm. Reaction time normal. Platelet function normal.","After protamine top-up, tranexamic acid 1g, FFP 4 units, cryoprecipitate: drain output falling 180→90 mL/h. MAP improving to 62.","Hour 12: drain output now 20 mL/h. MAP 68. CO improving 1.9→2.8. But new concern: rising troponin, new inferior ST changes on ECG."],
    key_probes:["Hour 8: rising CVP, falling CO, SVR rising — your immediate diagnostic framework. Three differentials in order.","Echo shows no effusion, globally hypokinetic LV. Does this change your working diagnosis?","TEG: LY30 8.2% — what does this mean and what specific treatment does it mandate?","Drain output 180 mL/h falling with haemostatic therapy — at what rate do you take back to theatre?","Hour 12: new inferior ST changes post-CABG — mechanism and immediate management?"],
    pearls:["Post-CABG low CO differential: (1) LV dysfunction (stunning, ischaemia, protection failure); (2) hypovolaemia from ongoing bleeding; (3) tamponade; (4) vasoplegia; (5) RV failure. Echo immediately differentiates.","LV stunning post-bypass: common after prolonged bypass — globally hypokinetic LV with preserved valves, no effusion. Treat with inotropes (dobutamine or adrenaline). Usually recovers within 24–48h.","TEG primary fibrinolysis (LY30 >7.5%): treat with tranexamic acid 1g IV. Distinguishes from hyperfibrinolysis in DIC or residual heparin — treat the specific defect identified.","Post-CABG graft occlusion: new ST changes or regional wall motion abnormality after initially good function = graft occlusion until proven otherwise. Emergency angiography and re-do CABG or PCI."],
    pitfalls:["Taking back to theatre for bleeding too early: drain output >200 mL/h for 2h OR >400 mL in first hour OR haemodynamic instability = surgical re-exploration. Rates of 100–150 mL/h may respond to medical therapy first.","Missing protamine deficiency: heparin rebound after bypass is common. If TEG shows prolonged clot formation time (R time) — give protamine 25–50mg. Check ACT.","Inotropes in post-CABG tamponade: if diagnosis is tamponade, inotropes provide minimal benefit. Get to theatre — they are a bridge only.","New inferior ST post-CABG: right coronary artery graft is most commonly the cause. Don't wait for troponin to rise — get emergency angiography."]
  },
{
    id:46, title:"Severe Bradycardia & Shock — Temporary Pacing in ICU", domain:"Cardiac & Post-Arrest Care", difficulty:"Medium",
    stem:`78M, known ischaemic heart disease, previous inferior MI. Admitted with anterior chest discomfort and presyncope. Found to be in complete heart block on arrival.

ICU ADMISSION:
• HR 32 (idioventricular rhythm) | BP 68/40 (MAP 49) | GCS 12
• SpO2 92% on 6L O2 | Diaphoretic | Cool peripheries | CRT 5 seconds
• ECG: complete AV block, escape rhythm at 32 bpm, LBBB morphology escape
• Troponin I: 0.8 ng/mL (mildly elevated)

Echo: inferior wall motion abnormality. LVEF 40%.`,
    progressive_data:["Atropine 600mcg IV ×2: HR 34→38 transiently then falls back to 32. MAP 50. No improvement.","Temporary transcutaneous pacing commenced: electrical capture at 60 bpm but MAP 52 — no haemodynamic improvement. Patient in significant pain from pacing.","Temporary transvenous pacing wire inserted via right femoral vein. Capture at 60 bpm. MAP improving to 68. Patient more comfortable.","Day 2: underlying rhythm: complete AV block with inferior STEMI pattern. Cardiology: PCI performed. Post-PCI: rhythm improving — second degree AV block (Mobitz I). Team asking about permanent pacemaker."],
    key_probes:["Complete heart block with MAP 49 — your immediate sequence of interventions.","Why did atropine fail and what does that tell you about the level of the block?","Transcutaneous vs transvenous pacing — why is transcutaneous only a bridge?","Electrical capture without mechanical capture — what is this and what are the causes?","Post-PCI AV block in inferior MI — when does it resolve and when do you implant a permanent pacemaker?"],
    pearls:["Complete AV block management: (1) atropine 600mcg IV — works if block is at AV node (vagally mediated or nodal). Fails if block is infranodal (His-Purkinje). LBBB escape morphology = infranodal = atropine will fail; (2) transcutaneous pacing — immediate but temporary bridge; (3) transvenous pacing — definitive temporary pacing.","Transcutaneous pacing limitations: painful (requires sedation/analgesia), unreliable capture (dependent on chest wall impedance), not suitable for prolonged use. Always bridge to transvenous.","Electrical capture without mechanical capture (pseudo-capture): pacing spikes present on ECG, HR shows paced rate, but no pulse. Causes: severe metabolic acidosis, hyperkalaemia, severe myocardial dysfunction. Check pulse with each capture.","Inferior MI AV block: usually at AV node level (Mobitz I or complete with narrow escape), often transient, resolves with reperfusion within 24–72h. Anterior MI AV block: infranodal, wide escape, higher risk, more often requires permanent pacing."],
    pitfalls:["Relying on atropine for infranodal block: atropine acts on muscarinic receptors at the AV node. LBBB escape rhythm = block below the bundle of His = atropine will not work and may cause paradoxical worsening.","Femoral transvenous pacing in the catheterisation lab era: if PCI is planned, avoid femoral venous access — use internal jugular or subclavian for pacing wire to keep femoral access for arterial sheath.","Permanent pacemaker too early after inferior MI AV block: most resolve with reperfusion. Wait at least 5–7 days before implanting permanent pacemaker — many patients will not need it.","Pacing threshold drift: transvenous pacing leads can displace or threshold can rise. Check capture daily and increase output to 3× threshold."]
  },
{
    id:47, title:"Post-Arrest Myoclonus — Prognostication Dilemma", domain:"Cardiac & Post-Arrest Care", difficulty:"High",
    stem:`62M, found collapsed at home. OHCA — unknown rhythm (unwitnessed). Estimated downtime 15–20 minutes. CPR by ambulance crew. ROSC after 35 minutes total low-flow time.

ICU Day 2:
• TTM 36°C completed | Sedation being lightened
• Within 30 minutes of stopping sedation: generalised myoclonic jerks developing
• Jerks: multifocal, stimulus-sensitive, involving face and all four limbs
• Continuous for 45 minutes — not responding to lorazepam 2mg IV

GCS: E1V1M1 despite apparent 'movement'
EEG: continuous generalised spike-wave discharges, no background activity`,
    progressive_data:["Levetiracetam 60 mg/kg IV given. No change in myoclonus. Clonazepam 1mg IV: partial reduction in jerk frequency.","Day 3: myoclonus persisting despite multiple antiepileptics. GCS E1V1M1. SSEP: bilateral absent N20. CT brain: diffuse cerebral oedema, loss of grey-white differentiation.","NSE at 72h: 164 mcg/L (laboratory upper normal 17). Family asking for prognosis — 'tell us the truth'.","Day 4: neurology review. Family and ICU team meeting. Withdrawal of life-sustaining treatment discussed."],
    key_probes:["Post-arrest myoclonus — distinguish Lance-Adams syndrome from post-anoxic myoclonic status. Why does this distinction matter?","EEG: continuous spike-wave with no background activity. How do you interpret this in the context of post-arrest care?","Bilateral absent N20, NSE 164, diffuse oedema on CT, no background EEG — does this meet the threshold for poor outcome prognostication?","The family ask you to be honest — what do you tell them and how do you frame the conversation?","WLST decision: what safeguards do you put in place before withdrawing treatment?"],
    pearls:["Lance-Adams syndrome (post-anoxic action myoclonus): develops days to weeks after ROSC, triggered by voluntary movement or touch, patient IS conscious. Good prognostic sign — represents recovery of cortical function.","Post-anoxic myoclonic status: generalised, stimulus-sensitive, begins within hours of ROSC, patient remains comatose. Associated with absent EEG background activity. Strongly associated with poor outcome — but NOT categorically 100%.","Poor outcome prognostication in post-arrest: ERC/ESICM 2021 requires ≥2 robust predictors: bilateral absent N20 SSEP + malignant EEG + NSE >60 mcg/L + CT/MRI showing diffuse anoxic injury. This case meets all four criteria.","NSE 164 mcg/L: very high — independently associated with poor outcome when >60 mcg/L at 48–72h after ruling out haemolysis."],
    pitfalls:["Diagnosing poor prognosis on post-anoxic myoclonus alone: early generalised myoclonus was historically considered invariably fatal but this is no longer accepted. Must use full multimodal algorithm.","Withdrawing treatment too early: any single predictor carries false positive rates. Two or more robust predictors at ≥72h, in the absence of confounders, is the required standard.","Antiepileptic treatment of post-anoxic myoclonic status: these are cortical releases from anoxic injury — they rarely respond to antiepileptics. Clonazepam may reduce frequency but does not change prognosis. Treat for comfort if jerks are distressing.","Family communication: avoid using 'brain dead' — this is NOT brain death. The patient has devastating anoxic brain injury. Use precise language: 'the tests show the brain has been severely and irreversibly damaged'."]
  },
{
    id:48, title:"Post-ROSC on VA-ECMO — Venting, Anticoagulation & Complications", domain:"Cardiac & Post-Arrest Care", difficulty:"High",
    stem:`55M, anterior STEMI complicated by cardiac arrest. PCI performed, vessel opened. Refractory cardiogenic shock post-PCI — VA-ECMO cannulated (femoral arterial/venous, right side).

VA-ECMO PARAMETERS (Hour 6):
• Flow: 4.2 L/min | RPM: 3400 | FiO2 sweep 1.0
• Norad 0.2 mcg/kg/min | MAP 68 | HR 96

ECHO (Hour 6):
• LV severely dilated (LVEDD 7.4 cm) | LVEF 10%
• Aortic valve NOT opening (no pulse pressure on arterial line)
• Bilateral B-lines | LVEDP estimated very high`,
    progressive_data:["Harlequin syndrome developing: right arm SpO2 72%, left arm SpO2 99%. Right radial ABG: PaO2 44 mmHg.","Decision: VAV-ECMO configuration. Right axillary artery cannula added for upper body oxygenation. Right arm SpO2 improves to 93%.","Day 2: aortic valve still not opening. LV distension worsening on echo. Decision: LV venting strategy needed.","Day 3: Impella CP inserted via left femoral artery (retrograde across aortic valve). LV unloaded. Pulse pressure returns 8 mmHg. Bilateral B-lines reducing."],
    key_probes:["Aortic valve not opening on VA-ECMO — why does this happen and what are the consequences?","Harlequin syndrome — explain the pathophysiology and why the right arm specifically?","LV venting options on VA-ECMO — what are they and how does Impella work in this context?","Anticoagulation on VA-ECMO — target ACT, which agent, and how do you manage bleeding vs clotting?","Weaning criteria for VA-ECMO — what parameters guide your decannulation decision?"],
    pearls:["Aortic valve not opening on VA-ECMO: ECMO retrograde flow unloads the aorta so completely that LV cannot generate enough pressure to open the aortic valve → LV stagnates → thrombus formation, LV distension, pulmonary oedema. Requires LV venting.","Harlequin syndrome: femoral VA-ECMO returns oxygenated blood retrograde up the aorta. If native LV recovers partially and ejects deoxygenated blood (from diseased lungs) into the ascending aorta, the watershed determines upper vs lower body oxygenation. Right subclavian arises before watershed — right arm becomes hypoxic.","LV venting options: (1) Impella (preferred — direct LV decompression); (2) atrial septostomy; (3) surgical LV vent. Reduces LVEDP, reduces pulmonary oedema, allows LV recovery.","VA-ECMO anticoagulation: unfractionated heparin targeting ACT 180–220 seconds or anti-Xa 0.3–0.5 IU/mL. Too little → circuit thrombosis. Too much → bleeding."],
    pitfalls:["Not recognising LV distension on VA-ECMO: absent pulse pressure + worsening pulmonary oedema + no aortic valve opening = LV distension. If untreated → LV thrombus, pulmonary haemorrhage, inability to wean.","Impella contraindication: severe aortic stenosis (cannot cross valve), severe aortic regurgitation (worsens AR), LV thrombus at apex. Always echo before insertion.","Distal limb ischaemia on VA-ECMO: femoral arterial cannula occludes distal flow. Insert a distal perfusion cannula into the superficial femoral artery routinely — check pulses every hour.","VA-ECMO weaning: do not attempt to wean if LVEF <20–25% on echo during reduced ECMO flow trial. Abrupt weaning in a patient not ready causes immediate haemodynamic collapse."]
  },
{
    id:49, title:"Cardiogenic Shock — Escalation to IABP/Impella/VA-ECMO", domain:"Cardiac & Post-Arrest Care", difficulty:"High",
    stem:`58M, anterior STEMI 6 hours ago. PCI performed at district hospital — TIMI 3 flow achieved. Transferred to tertiary centre for post-PCI monitoring.

ARRIVAL:
• HR 118 | BP 74/44 (MAP 54) | RR 28 | SpO2 90% on 10L | GCS 14
• Cool peripheries | CRT 5 seconds | Bilateral crackles

ECHO: Anterior and apical akinesis. LVEF 20%. No significant MR. No VSD.
Troponin I: 48 ng/mL | BNP: 3800 pg/mL | Lactate: 5.2 mmol/L
ScvO2: 48%

CURRENT TREATMENT: Norad 0.3 mcg/kg/min + dobutamine 5 mcg/kg/min`,
    progressive_data:["1 hour: MAP 58, lactate 5.8, ScvO2 44%. Dobutamine increased to 10 mcg/kg/min. HR rising to 134. New VT run on monitor.","IABP inserted. MAP improving to 68 with IABP + norad 0.3 + dobutamine 5. Lactate 5.2. ScvO2 52%. Still inadequate.","Cardiology escalation: Impella CP inserted. CI improving 1.2→1.8 L/min/m2. MAP 72. ScvO2 58%. Lactate still rising 5.2→6.1.","Hour 6: CI 1.6, ScvO2 55%, lactate 6.8. ECMO team contacted. VA-ECMO being considered."],
    key_probes:["SCAI cardiogenic shock classification — where does this patient sit and what does that stage mandate?","IABP mechanism in cardiogenic shock — what does it do and what does IABP-SHOCK II tell you?","Impella CP — mechanism, haemodynamic effect, and how is it different from IABP?","ScvO2 48% despite MAP 58 — what does this tell you and what is your next step?","VA-ECMO as a last resort — at what point do you escalate and what are the reversibility criteria?"],
    pearls:["SCAI cardiogenic shock stages: A (at risk), B (beginning), C (classic), D (deteriorating), E (extremis). This patient is SCAI C-D. Stage D = deteriorating on ≥1 MCS device — mandates VA-ECMO or higher-level MCS consideration.","IABP: inflates in diastole → augments diastolic BP → improves coronary perfusion. Deflates in systole → reduces afterload → reduces myocardial O2 demand. IABP-SHOCK II: no mortality benefit in cardiogenic shock post-MI. Still used for haemodynamic stabilisation.","Impella CP: axial flow pump — aspirates blood from LV and delivers to ascending aorta. Provides 3.5 L/min cardiac support. Unloads LV directly. Unlike IABP — provides ACTIVE forward flow, not just afterload reduction.","ScvO2 <65% = inadequate O2 delivery. ScvO2 <50% = critical — immediate escalation needed. Target ScvO2 >65% with MCS."],
    pitfalls:["Increasing dobutamine in cardiogenic shock when ScvO2 is falling: higher doses cause tachycardia + arrhythmias + increased O2 demand = worse outcome. Escalate to MCS, do not just increase inotrope dose.","IABP in severe cardiogenic shock: IABP provides modest haemodynamic support (~0.5 L/min improvement). In SCAI C-D shock, IABP alone is insufficient — use as bridge to Impella or VA-ECMO.","Impella contraindications: aortic stenosis (cannot cross valve), aortic regurgitation (worsens AR), LV thrombus, severe peripheral arterial disease.","Delay to VA-ECMO: 'too sick for ECMO' is usually wrong — VA-ECMO is the rescue device for patients who are failing everything else. The question is reversibility, not current haemodynamic state."]
  },
{
    id:50, title:"Type 2 MI in the ICU — Supply-Demand Mismatch", domain:"Cardiac & Post-Arrest Care", difficulty:"Medium",
    stem:`74F, admitted 3 days ago with septic shock from pneumonia. Intubated, ventilated, on noradrenaline 0.3 mcg/kg/min. Known hypertension, no known cardiac history.

DAY 3 — NEW CONCERN:
• Nurse calls: new ST changes on telemetry — downsloping ST depression V4–V6, T-wave inversions
• HR has increased 88→114 over past 2 hours (sinus tachycardia)
• MAP maintained 68 | Norad unchanged
• Troponin I sent: result 4.2 ng/mL (HIGH) | Previous troponin Day 1: 0.8 ng/mL

Echo (bedside): anterior hypokinesis. LVEF estimated 40% (was 55% on admission echo).`,
    progressive_data:["Cardiology review: 12-lead ECG confirms ST depression V4–V6. No STEMI pattern. Troponin rising 4.2→8.1 over 6 hours.","Discussion: Type 1 vs Type 2 MI. Cardiology wants urgent coronary angiography. You have concerns.","Management adjusted: HR controlled with low-dose beta-blocker (esmolol). MAP maintained. Haemoglobin 7.2 — transfusion to Hb >8 given. Norad weaned slightly.","Day 5: troponin trending down 8.1→5.2→2.8. ST changes resolving. Anterior hypokinesis improving. No angiography performed."],
    key_probes:["Type 1 MI vs Type 2 MI — define both and apply the distinction to this patient.","What specific factors in this ICU patient are causing supply-demand mismatch?","Cardiology wants urgent angiography. You disagree. Make your case.","What specific interventions reduce demand ischaemia in this patient — in order of priority?","Troponin rising in a critically ill patient — how do you counsel the family about this finding?"],
    pearls:["Type 1 MI: plaque rupture or erosion with thrombotic coronary occlusion — atherothrombotic. Type 2 MI: myocardial ischaemia from supply-demand mismatch without plaque rupture. Causes in ICU: tachycardia (increased demand), anaemia (reduced O2 delivery), hypotension (reduced coronary perfusion pressure), hypoxaemia, vasospasm.","Tachycardia is the most important driver of Type 2 MI: increases O2 demand AND reduces diastolic filling time (coronary perfusion occurs in diastole). Rate control is the priority intervention.","Indications for angiography in Type 2 MI: evidence of ongoing ischaemia despite optimising supply-demand, haemodynamic instability suggesting structural complication, or STEMI pattern. Type 2 MI with improving troponin and no ongoing ischaemia: treat the underlying cause.","Troponin in sepsis: troponin rises in severe sepsis even without MI (cytokine-mediated myocardial injury, microthrombi). Does not automatically mandate angiography."],
    pitfalls:["Performing angiography in a haemodynamically unstable septic patient: contrast nephropathy risk, procedural complications in coagulopathic/thrombocytopenic patient, risk of contrast-induced deterioration. Reserve for clear Type 1 MI indications.","Withholding anticoagulation for Type 2 MI in a septic patient: thrombocytopenia and coagulopathy complicate anticoagulation. Risk-benefit must be weighed carefully — therapeutic anticoagulation may worsen bleeding.","Attributing all troponin rise to ischaemia: myocardial injury in sepsis has multiple causes. Troponin rise alone does not differentiate Type 1 from Type 2 from non-ischaemic injury.","Missing anterior hypokinesis as a sentinel for more serious ischaemia: new RWMA in a previously normal echo may represent a Type 1 MI even in a septic patient. Echo is mandatory for all new significant troponin rises."]
  },
{
    id:51, title:"AKI in Septic Shock — Stage, Cause & RRT Timing", domain:"Renal & Fluids", difficulty:"High",
    stem:`64M, septic shock from community-acquired pneumonia. Day 3 ICU. On norad 0.22 mcg/kg/min.

CURRENT:
• MAP 68 | HR 94 | Temp 37.6°C | UO 12 mL/h despite 500 mL fluid challenge
• Cr 3.8 (baseline 1.1) | K+ 5.9 | pH 7.22 | HCO3 12 | Lactate 3.1
• BUN 28 mmol/L | Urine Na 8 mmol/L | Urine osmolality 480 mOsm/kg
• No haematuria | Bland urine sediment
• Renal USS: normal size kidneys, no obstruction`,
    progressive_data:["6h: UO 8 mL/h. K+ rising to 6.4. pH 7.18. ECG: peaked T waves. Fluid balance +4.2L since admission.","RRT initiated. CVVHDF started via right femoral dialysis catheter. K+ correcting. pH improving.","Day 5 on CRRT: haemodynamics improving — norad weaning. Team asking about RRT discontinuation criteria.","Day 8: UO spontaneously increasing to 0.8 mL/kg/h. Cr falling 3.8→2.9→2.1. CRRT weaned. Nephrology follow-up arranged."],
    key_probes:["Classify this AKI using KDIGO criteria — stage it and what does staging mandate?","Urine Na 8, urine osmolality 480 — interpret these indices and what do they tell you about the cause?","K+ 6.4, peaked T waves, pH 7.18 — your immediate management before RRT is set up.","RRT timing in AKI — what are the absolute indications and what does STARRT-AKI tell you about early vs late?","Day 5: haemodynamics improving. What are your criteria for attempting to wean CRRT?"],
    pearls:["KDIGO AKI staging: Stage 1 = Cr ×1.5 or UO <0.5 mL/kg/h for 6h. Stage 2 = Cr ×2 or UO <0.5 mL/kg/h for 12h. Stage 3 = Cr ×3 or <0.3 mL/kg/h for 24h or anuria 12h or RRT. This patient = Stage 3.","Urine Na <20 + urine osmolality >500 = pre-renal physiology (intact tubular function concentrating urine). However in sepsis, renal tubular injury coexists — indices are unreliable. Do not withhold RRT based on indices alone.","Absolute RRT indications: refractory hyperkalaemia (K+ >6.5 with ECG changes), refractory metabolic acidosis (pH <7.15), uraemic encephalopathy/pericarditis, refractory fluid overload causing respiratory failure.","STARRT-AKI trial: early RRT (within 12h of Stage 3) vs standard initiation — no mortality difference. Many patients in standard arm never needed RRT. Current practice: initiate for absolute indications, not prophylactically."],
    pitfalls:["Fluid challenge for oliguria in AKI with +4.2L balance: fluid overload worsens AKI outcomes. Assess fluid responsiveness with dynamic indices before giving more fluid. The oliguria here is intrinsic AKI, not pre-renal.","Hyperkalaemia management pre-RRT: calcium gluconate 10 mL 10% IV (membrane stabilisation — not lowering K+), insulin-dextrose (shifts K+ into cells), salbutamol nebuliser, sodium bicarbonate if acidotic. These buy time only.","Femoral dialysis catheter: higher infection and thrombosis risk than internal jugular. Right internal jugular is the preferred site for CRRT access.","Discontinuing RRT too early: wait for sustained UO >0.5 mL/kg/h without diuretics before weaning CRRT. Premature discontinuation requires re-initiation in 30% of cases."]
  },
{
    id:52, title:"Contrast-Induced AKI — Prevention & Harm Reduction", domain:"Renal & Fluids", difficulty:"Medium",
    stem:`72F, CKD Stage 3b (eGFR 32, Cr baseline 1.8), T2DM, hypertension. Admitted with NSTEMI. Coronary angiography planned urgently (within 24h).

CURRENT STATUS:
• Haemodynamically stable | MAP 78 | HR 82
• Metformin 1g BD (last dose this morning) | ACEi (perindopril) | NSAIDs (naproxen for osteoarthritis)
• Cr 1.8 (baseline) | eGFR 32 | Na 139 | K+ 4.6
• No symptoms of heart failure | Urine output normal`,
    progressive_data:["Angiography performed. Contrast volume 180 mL (iso-osmolar). Pre-hydration given. 48h post-procedure: Cr rising 1.8→2.6.","Cr peaks at 3.1 on Day 4. UO maintaining >0.5 mL/kg/h. No pulmonary oedema. K+ 5.2.","Day 7: Cr falling 3.1→2.4→2.0. No RRT required. Nephrology review: likely contrast-induced AKI, expected recovery.","Discharge planning: team asks about restarting metformin, ACEi, and NSAIDs."],
    key_probes:["Which of her medications must you stop before angiography — and why for each one?","CI-AKI prevention strategies — what does the evidence support?","Contrast volume 180 mL in an eGFR 32 patient — how do you assess the risk and is this acceptable?","48h post-procedure: Cr rising 1.8→2.6. This is likely CI-AKI — your management.","On discharge: when do you restart metformin, ACEi, and NSAIDs — and why those specific timings?"],
    pearls:["Medications to stop pre-contrast: (1) Metformin — risk of lactic acidosis if AKI develops (stop 48h before, restart 48h after when Cr stable); (2) NSAIDs — worsen renal prostaglandin-mediated perfusion; (3) ACEi/ARB — block efferent arteriolar constriction, worsening AKI in low perfusion states. Diuretics: also hold on day of procedure.","CI-AKI prevention: (1) IV hydration — isotonic NaCl or sodium bicarbonate 1–1.5 mL/kg/h for 3–6h before and 6h after; (2) minimise contrast volume (target <30 mL × eGFR); (3) use iso-osmolar or low-osmolar contrast; (4) avoid within 48h of prior contrast; (5) N-acetylcysteine — evidence weak but harmless.","Contrast volume risk threshold: contrast volume/eGFR ratio >3.7 = high risk of CI-AKI requiring dialysis. Here: 180/32 = 5.6 — high risk. Discuss with cardiology about staged procedure or radial approach to minimise contrast.","Metformin restart: 48h after procedure AND Cr has returned to baseline. Lactic acidosis risk from metformin accumulation in AKI is real — do not restart early."],
    pitfalls:["N-acetylcysteine: multiple trials show no consistent benefit. Do not delay procedure waiting to give NAC, and do not use it as the sole prevention strategy.","Stopping ACEi before contrast: evidence is inconsistent — some guidelines recommend stopping, others do not. Consensus: hold on day of procedure in patients with CKD. Restart when Cr stable.","NSAID omission: naproxen reduces renal prostaglandins — critical for maintaining GFR in CKD. Stop minimum 48h before.","Prophylactic RRT post-contrast in CKD: not recommended — no evidence of benefit and catheter insertion risks. Reserve RRT for standard indications if CI-AKI develops."]
  },
{
    id:53, title:"Hepatorenal Syndrome — Diagnosis & Management", domain:"Renal & Fluids", difficulty:"High",
    stem:`58M, known alcohol-related cirrhosis (Child-Pugh C, MELD 28). Admitted with spontaneous bacterial peritonitis (SBP confirmed — ascitic neutrophil count 480 cells/mm3).

ICU DAY 2:
• MAP 54 | HR 116 | Temp 38.2°C | SpO2 94% on 3L
• GCS 12 (encephalopathy grade II)
• Cr rising 1.4→2.8 over 48h | UO 0.2 mL/kg/h
• Na 128 | K+ 5.1 | Bili 88 µmol/L | INR 2.4 | Albumin 22 g/L
• Urine Na <10 mmol/L | Urine osmolality 520 mOsm/kg
• No urinary casts | No haematuria | No obstruction on USS`,
    progressive_data:["Cefotaxime + albumin 1.5 g/kg (Day 1) + 1g/kg (Day 3) given for SBP. Cr continuing to rise 2.8→3.6.","HRS-AKI diagnosed. Terlipressin 1mg IV 6-hourly + albumin infusion started. 48h: Cr falling 3.6→2.9→2.2.","Day 6: Cr 2.2. Terlipressin continued. However: ischaemic colitis developing — abdominal pain, bloody diarrhoea.","Terlipressin stopped. Nephrology: noradrenaline + albumin substituted. Cr stable at 2.4. TIPS discussed."],
    key_probes:["AKI in cirrhosis — how do you distinguish HRS from pre-renal AKI from intrinsic AKI?","HRS diagnostic criteria — what are they and how do you apply them here?","Terlipressin mechanism and why it works in HRS — the haemodynamic rationale.","Terlipressin complications — what are you watching for and when do you stop?","TIPS in HRS — when is it considered and what are the contraindications in this patient?"],
    pearls:["HRS diagnosis (ICA 2019 criteria): AKI in cirrhosis (Cr rise ≥26.5 µmol/L in 48h or ≥50% from baseline) + no improvement after 48h albumin challenge + no shock + no nephrotoxic drugs + no parenchymal renal disease (bland urine, no proteinuria, normal USS).","HRS pathophysiology: splanchnic vasodilation (portal hypertension) → effective arterial underfilling → RAAS + SNS activation → intense renal vasoconstriction → functional renal failure. Kidneys are structurally normal — reversible if liver function improves.","Terlipressin: vasopressin analogue — splanchnic vasoconstrictor. Reduces portal hypertension → improves effective arterial volume → reduces renal vasoconstriction. Target: Cr reduction >25% from baseline. Dose: 1–2mg IV 4–6-hourly. Always with albumin 20–40g/day.","Albumin in SBP: 1.5 g/kg at diagnosis + 1 g/kg on Day 3 prevents HRS development — one of the most evidence-based interventions in hepatology."],
    pitfalls:["Fluid bolus for HRS: pre-renal AKI responds to fluid. HRS does not — the renal vasoconstriction is driven by hormonal, not volume, mechanisms. However, a fluid challenge trial is required to exclude pre-renal AKI before diagnosing HRS.","Terlipressin causing ischaemia: systemic vasoconstriction can cause coronary, mesenteric, and peripheral ischaemia. Monitor ECG and abdomen closely. Ischaemic colitis mandates stopping.","CRRT in HRS: treats the AKI but does not treat the underlying cause. Appropriate as a bridge to liver transplantation or liver recovery — not a destination therapy.","TIPS (transjugular intrahepatic portosystemic shunt): reduces portal hypertension but worsens hepatic encephalopathy. Contraindicated if: hepatic encephalopathy grade >2, Bili >50 µmol/L, MELD >18."]
  },
{
    id:54, title:"CRRT Prescription — Dose, Anticoagulation & Filter Life", domain:"Renal & Fluids", difficulty:"High",
    stem:`56M, septic shock from peritonitis. Day 2 ICU. AKI Stage 3 (anuric). CRRT initiated.

CRRT SETUP:
• Mode: CVVHDF | Blood flow: 200 mL/min
• Effluent dose prescribed: 25 mL/kg/h
• Anticoagulation: unfractionated heparin via pre-filter at 500 units/h
• Filter: AN69 membrane | Pre-dilution: 50%

6 HOURS IN:
• Filter clotted — transmembrane pressure alarm
• Access pressure: -240 mmHg (high negative — suction)
• Return pressure: 320 mmHg (high positive)
• Circuit inspected: dark clots in venous drip chamber`,
    progressive_data:["Filter changed. New circuit primed with heparin. Blood flow increased to 250 mL/min. Heparin increased to 800 units/h. ACT target 180–220 seconds.","4 hours later: second filter clotting. ACT 195 seconds. Platelet count 44 (falling from 88 yesterday). Team considering HIT.","HIT screen sent (4T score: 6 — high probability). Heparin stopped immediately. Argatroban infusion started.","Day 5 on argatroban: filter life improving (12–16h). Haemodynamics improving. Team asking about switching to regional citrate anticoagulation."],
    key_probes:["CRRT dose 25 mL/kg/h — what is this measuring and is this the right dose?","Filter clotting at 6 hours — your systematic approach to diagnosing the cause.","4T score of 6 — what is HIT, what is the 4T score, and what do you do immediately?","Argatroban for CRRT anticoagulation — mechanism, monitoring parameter, and dose adjustment in liver failure.","Regional citrate anticoagulation — mechanism, advantages over heparin, and what metabolic complication do you monitor for?"],
    pearls:["CRRT dose: effluent dose = convective + diffusive clearance per kg per hour. Target 20–25 mL/kg/h delivered dose (prescribe 25–30 mL/kg/h to account for downtime). KDIGO: no mortality benefit from higher doses (>35 mL/kg/h) — RENAL and ATN trials.","Filter clotting causes: (1) inadequate anticoagulation; (2) high haematocrit (reduces flow); (3) access dysfunction (suction = kinked catheter); (4) inadequate blood flow; (5) high return pressure (clotted circuit). Address access first.","HIT: immune-mediated thrombocytopenia from heparin-PF4 antibody complexes causing platelet activation → paradoxical thrombosis. 4T score: Thrombocytopenia (0–2) + Timing (0–2) + Thrombosis (0–2) + other causes (0–2). Score ≥6 = high probability. Stop all heparin immediately — including flushes.","Argatroban: direct thrombin inhibitor. Monitor with aPTT target 60–80 seconds (not ACT for CRRT). Metabolised by liver — reduce dose in hepatic failure. No specific antidote."],
    pitfalls:["Prescribing delivered dose as if it were prescribed dose: 25 mL/kg/h prescribed gives only ~20 mL/kg/h delivered due to filter downtime. Always prescribe 20–25% higher than your target delivered dose.","Missing HIT while continuing heparin: HIT is a prothrombotic, not just thrombocytopenic, syndrome. Thrombosis (venous and arterial) occurs in 30–50% of HIT cases. Every day of continued heparin increases thrombosis risk.","AN69 membrane and ACE inhibitors: AN69 (acrylonitrile membrane) activates bradykinin — risk of anaphylactoid reaction in patients on ACEi. Either switch to a polyethersulfone membrane or stop ACEi.","Citrate anticoagulation and calcium: citrate chelates calcium in the circuit. Must give systemic calcium replacement (calcium gluconate IV). Monitor ionised calcium (target 1.12–1.20 mmol/L). Citrate accumulation in liver failure causes systemic hypocalcaemia — monitor with total:ionised calcium ratio (>2.5 = citrate toxicity)."]
  },
{
    id:55, title:"Fluid Resuscitation — When to Stop & Fluid Overload Harm", domain:"Renal & Fluids", difficulty:"High",
    stem:`52M, septic shock from cholangitis. Now 48 hours post-ICU admission. Has received 8 litres crystalloid.

CURRENT STATUS:
• MAP 68 on norad 0.18 mcg/kg/min | HR 96 | Temp 37.4°C
• SpO2 92% on FiO2 0.45, PEEP 8 (new requirement — was on 3L O2 yesterday)
• Cumulative fluid balance: +7.8 litres
• Bilateral pitting oedema to thighs | Scrotal oedema
• Cr 2.1 (was 1.4 on admission) | UO 25 mL/h
• Lactate now 1.8 (improving) | Echo: IVC plethoric, non-compressible`,
    progressive_data:["Fluid challenge 250 mL: MAP 69→68 (no response). IVC still plethoric post-challenge. Lung US: B-lines in all zones.","Decision: de-resuscitation phase. Furosemide 40mg IV given. UO 120 mL over 2h. MAP maintained. SpO2 improving.","Furosemide infusion started 5 mg/h. Over 24h: negative balance 1.8L achieved. SpO2 improving to 96% on FiO2 0.35. Cr improving 2.1→1.8.","Day 5: Fluid balance -3.2L cumulative since starting de-resuscitation. MAP 72 on norad 0.12. Team debating target fluid balance."],
    key_probes:["What is the ROSE concept of fluid resuscitation — what are the four phases?","This patient is in positive balance +7.8L. How do you assess whether more fluid will help or harm?","Lung US showing B-lines in all zones + plethoric IVC + no MAP response to fluid challenge — what does this mean?","De-resuscitation with furosemide in a patient still on vasopressors — is this safe and how do you do it?","What is the evidence that fluid overload is harmful in ICU patients?"],
    pearls:["ROSE concept: (1) Resuscitation — aggressive fluid for shock reversal; (2) Optimisation — cautious fluid guided by dynamic indices; (3) Stabilisation — maintenance, neutral balance; (4) Evacuation — active de-resuscitation. Most harm comes from prolonged phase 1 or failure to enter phase 4.","Dynamic fluid responsiveness assessment: pulse pressure variation >13% (in sinus rhythm, no spontaneous breathing), stroke volume variation, passive leg raise (MAP increase >10% = responsive). Plethoric IVC + no MAP response = NOT fluid responsive.","Fluid overload harms: increased AKI (venous congestion), prolonged mechanical ventilation (pulmonary oedema), gut oedema (ileus, abdominal compartment syndrome), wound dehiscence, longer ICU stay.","De-resuscitation in vasopressor-dependent patients: achievable and safe if haemodynamics are stable. Start with low-dose furosemide 20–40mg IV, titrate to negative balance 1–2L/day. Monitor MAP and lactate."],
    pitfalls:["Continuing fluid resuscitation beyond shock reversal: the SSC 30 mL/kg recommendation applies to the resuscitation phase only — not to ongoing management 48h later. Reassess fluid strategy daily.","Furosemide causing hypovolaemia: if MAP drops or lactate rises with de-resuscitation, stop temporarily. The goal is slow controlled diuresis, not rapid volume removal.","IVC plethora interpreting as volume responsiveness: plethoric non-compressible IVC in mechanically ventilated patients means high right atrial pressure — the patient is NOT fluid responsive. It is a sign of volume overload, not responsiveness.","Albumin for oedema: hypoalbuminaemia (albumin 22) does not mandate albumin infusion. SAFE trial: no mortality benefit from albumin in general ICU. Albumin is only indicated for specific situations (SBP in cirrhosis, large-volume paracentesis)."]
  },
{
    id:56, title:"Hyponatraemia in ICU — Diagnosis & Safe Correction", domain:"Renal & Fluids", difficulty:"High",
    stem:`44F, admitted with severe community-acquired meningitis. Day 3 ICU. Intubated, sedated.

ELECTROLYTES Day 3:
• Na 118 mmol/L (was 132 on admission, 126 yesterday)
• K+ 3.8 | Cr 0.9 | Glucose 6.2
• Serum osmolality: 248 mOsm/kg (low)
• Urine Na: 68 mmol/L (high) | Urine osmolality: 680 mOsm/kg (high)
• Fluid balance: +2.1L since admission
• On IV maintenance fluids 0.9% NaCl 1L/8h

New concern: EEG showing epileptiform activity (new).`,
    progressive_data:["CT brain: cerebral oedema, compressed ventricles. Na now 116 mmol/L. Team debating 3% NaCl vs DDAVP restriction.","3% NaCl 150 mL IV over 20 min given. Na 116→121 over 4 hours. Seizures stopped. Cerebral oedema improving on repeat CT.","Na now 126. Team wants to continue correcting rapidly to normalise.","Day 5: Na 138 — corrected by 22 mmol/L in 24h. New MRI: T2 hyperintensity in pons and basal ganglia — osmotic demyelination syndrome suspected."],
    key_probes:["Hyponatraemia classification — work through the diagnostic algorithm for this patient.","Urine Na 68, urine osmolality 680, serum osmolality 248 — what is the diagnosis?","Na 116 with seizures and cerebral oedema — this is symptomatic hyponatraemia. How do you treat it urgently?","Safe correction rate for hyponatraemia — what is the target rise per 24h and why?","Osmotic demyelination syndrome — what caused it, what are the risk factors, and can it be reversed?"],
    pearls:["Hyponatraemia algorithm: (1) osmolality — if low (hypotonic), proceed; (2) volume status — hypovolaemic (urine Na <20 = renal losses likely, >20 = extrarenal losses), euvolaemic (SIADH), hypervolaemic (heart failure, cirrhosis, nephrotic); (3) urine Na + osmolality confirm. Here: euvolaemic + urine Na >40 + urine osmolality >serum osmolality = SIADH.","SIADH in meningitis: inflammatory cytokines stimulate ADH release. Very common in CNS infections. Treatment: fluid restriction 800–1000 mL/day. 3% NaCl for symptomatic cases.","Symptomatic hyponatraemia (seizures, coma, severe neurological): give 3% NaCl 150 mL IV over 20 min. Repeat up to 3 times until symptoms resolve. Target: Na rise of 5 mmol/L acutely. Then switch to controlled correction.","Safe correction rate: maximum 10 mmol/L per 24h (some guidelines 8 mmol/L). Maximum 18 mmol/L per 48h. Faster correction → osmotic demyelination syndrome."],
    pitfalls:["Continuing 0.9% NaCl maintenance in SIADH: isotonic saline in SIADH makes hyponatraemia WORSE — the kidneys excrete the sodium but retain the water (urine more concentrated than plasma). Use fluid restriction or hypertonic saline.","Overcorrecting after symptomatic treatment: once symptoms resolve, slow down. Total 24h correction must not exceed 10 mmol/L regardless of how urgently you started.","Osmotic demyelination syndrome risk factors: alcoholism, malnutrition, liver disease, severe hypokalaemia, Na <105 mmol/L for >48h, rapid correction. This patient had a 22 mmol/L rise in 24h — exceeded the safe limit.","Desmopressin (DDAVP) to halt overcorrection: if Na rises too fast, DDAVP 1–2 mcg IV reduces further rise. Counter-intuitive but effective — 'relowering' a hyponatraemia is required if correction exceeds 10 mmol/L/24h."]
  },
{
    id:57, title:"Hyperkalaemia — Graded Management in ICU", domain:"Renal & Fluids", difficulty:"Medium",
    stem:`68M, CKD Stage 4 (eGFR 22), T2DM, heart failure (LVEF 35%) on spironolactone + ACEi + furosemide. Admitted with AKI on CKD following gastroenteritis and dehydration.

ICU ADMISSION:
• MAP 72 | HR 88 | GCS 15
• K+ 7.2 mmol/L | Cr 6.1 (baseline 3.1) | pH 7.24 | HCO3 14
• ECG: broad complex, sinusoidal pattern, P waves absent`,
    progressive_data:["Calcium gluconate 30 mL 10% IV given over 10 minutes. ECG: QRS narrowing, sinusoidal pattern resolving. K+ still 7.2.","Insulin 10 units + 50 mL 50% dextrose given. Salbutamol 10mg nebuliser. 30 min: K+ falling 7.2→6.4. ECG normalising.","2 hours: K+ 6.2. pH 7.29. Bicarbonate infusion 100 mmol over 1h given. K+ 5.8. UO improving to 30 mL/h.","6 hours: K+ 4.9. ECG normal. Team debating: RRT still needed or manage conservatively?"],
    key_probes:["ECG shows sinusoidal pattern with absent P waves — how urgent is this and what is your first action?","Calcium gluconate mechanism in hyperkalaemia — what does it do and what does it NOT do?","Rank your interventions for hyperkalaemia in order of speed and mechanism of action.","Sodium bicarbonate in hyperkalaemia — mechanism, when to use it, and its limitations.","K+ now 4.9 and stable — does this patient need RRT or can you manage conservatively?"],
    pearls:["ECG in hyperkalaemia progression: peaked T waves → PR prolongation → P wave flattening → wide QRS → sine wave → VF. Sinusoidal pattern with absent P waves = pre-arrest. Calcium gluconate IMMEDIATELY.","Calcium gluconate 10 mL 10% IV: membrane stabilisation — raises action potential threshold, reducing arrhythmia risk. Does NOT lower K+. Effect in 1–3 minutes, lasts 30–60 min. Repeat if ECG does not improve.","Hyperkalaemia management — speed of action: (1) Calcium gluconate — 1–3 min (membrane stabilisation only); (2) Insulin-dextrose — 15–30 min (shifts K+ into cells, lowers by 0.5–1.5 mmol/L); (3) Salbutamol — 15–30 min (beta-2 agonist, shifts K+ into cells); (4) Bicarbonate — 30–60 min (limited effect unless acidotic); (5) Resonium/patiromer — hours; (6) RRT — minutes (definitive removal).","Sodium bicarbonate in hyperkalaemia: promotes K+ shift into cells by correcting acidosis. Most effective when pH <7.2. Less effective in normal pH. Also corrects acidosis directly."],
    pitfalls:["Calcium chloride vs calcium gluconate: calcium chloride contains 3× more elemental calcium but is caustic — central line only. Calcium gluconate can be given peripherally. In cardiac arrest or pre-arrest, calcium chloride preferred for faster effect.","Salbutamol resistance: up to 40% of dialysis patients have reduced response to salbutamol-induced K+ shift. Do not rely on salbutamol alone.","Resonium (sodium polystyrene sulfonate) for acute hyperkalaemia: onset 4–6 hours — not for acute management. Risk of intestinal necrosis in critically ill patients. Patiromer and sodium zirconium cyclosilicate are safer options for ongoing K+ management.","Stopping ACEi and spironolactone: both must be stopped in AKI. ACEi reduces efferent arteriolar tone (worsens AKI), spironolactone blocks aldosterone (worsens hyperkalaemia). Restart only when Cr stabilised and K+ normal."]
  },
{
    id:58, title:"Rhabdomyolysis — AKI Prevention & Management", domain:"Renal & Fluids", difficulty:"Medium",
    stem:`28M, found collapsed at home — been on the floor for estimated 18–24 hours after drug ingestion (cocaine + alcohol). Found unresponsive, both legs trapped under body.

ED ARRIVAL:
• GCS 12 (improving) | HR 118 | BP 102/64 | RR 22 | Temp 38.8°C
• SpO2 95% on 4L | Urine: dark brown (cola-coloured)

LABS:
• CK: 128,000 IU/L | Cr 2.4 (baseline unknown, estimated 0.9) | K+ 5.8
• Urine myoglobin: strongly positive
• AST 1240 | ALT 480 (hepatic involvement)
• INR 1.8 | Plt 88 | Fibrinogen 1.6`,
    progressive_data:["IV fluids started: 1L NaCl over 1h. UO 15 mL/h. Urine still brown. CK 6h: 188,000 IU/L (still rising).","Fluid rate increased to 300 mL/h. Target UO 200–300 mL/h. After 4h: UO achieving 220 mL/h. Urine clearing.","24h: CK 142,000 (peaking). Cr rising 2.4→3.8. K+ 6.1. pH 7.28. UO dropping despite fluids. AKI progressing.","48h: CK 86,000 (falling). Cr 4.2. UO 35 mL/h. K+ 6.8. Team discussing RRT."],
    key_probes:["Rhabdomyolysis pathophysiology — how does myoglobin cause AKI?","CK 128,000 — what is the threshold for aggressive fluid resuscitation and what is your UO target?","Sodium bicarbonate alkalinisation for myoglobinuric AKI — what is the rationale and does the evidence support it?","Compartment syndrome — this patient was on the floor for 18h. How do you assess for it and when do you fasciotomy?","K+ 6.8 and AKI not improving — your RRT decision."],
    pearls:["Rhabdomyolysis AKI mechanism: (1) direct tubular toxicity from myoglobin oxidative damage; (2) tubular cast obstruction; (3) renal vasoconstriction from free iron and haem pigment. Hypovolaemia from third-spacing into damaged muscle worsens all three.","Fluid resuscitation target in rhabdomyolysis: UO 200–300 mL/h (3–5 mL/kg/h) until urine clears. Use isotonic NaCl. Volumes required: 10–20L in first 24h in severe cases. Monitor electrolytes every 4h — dilutional hyponatraemia and hypocalcaemia are common.","Sodium bicarbonate alkalinisation: theoretical benefit — alkaline urine prevents myoglobin precipitation in tubules. Evidence weak — no RCT shows benefit. However, also corrects metabolic acidosis. Add 50–100 mmol bicarbonate to fluids if pH <7.2. Stop if pH >7.5 (worsens hypocalcaemia).","Compartment syndrome: suspect if limb pain out of proportion, paresthesia, pain on passive stretch, tense compartments. Intracompartmental pressure >30 mmHg or within 30 mmHg of diastolic BP = fasciotomy."],
    pitfalls:["CK threshold for aggressive fluids: CK >5000 IU/L = significant rhabdomyolysis. CK >16,000 = high risk of AKI. Do not wait for AKI to develop — start aggressive fluid resuscitation early when CK is rising rapidly.","Hypocalcaemia in rhabdomyolysis: calcium deposits in damaged muscle → low ionised calcium. Do NOT correct with calcium supplementation routinely — it worsens calcium deposition in muscle. Only treat if symptomatic (tetany, seizures, ECG changes).","Fasciotomy timing: delay causes irreversible ischaemia and worsens rhabdomyolysis. Do not wait for neurological deficit — pressure measurement is the indication.","Stopping fluids when CK is still rising: CK continues rising for 24–48h as more muscle breaks down. Continue aggressive fluid resuscitation until CK is clearly falling and urine is clear."]
  },
{
    id:59, title:"Acid-Base Disorders — Systematic Interpretation in ICU", domain:"Renal & Fluids", difficulty:"High",
    stem:`66M, intubated for 5 days following severe pneumonia. Septic shock, now haemodynamically improving on low-dose norad.

ABG (current):
pH 7.48 | PaCO2 28 | PaO2 82 | HCO3 20 | BE -4 | Na 138 | Cl 112 | Lactate 1.2

VENTILATOR: VCV | RR 22 | VT 500 mL | PEEP 8 | FiO2 0.4

MEDICATION: Furosemide 80mg IV BD (started yesterday for fluid overload)
PREVIOUS ABG (Day 1): pH 7.28 | PaCO2 42 | HCO3 19 | Lactate 5.8`,
    progressive_data:["Team decides to reduce RR to 14 to correct the respiratory alkalosis. 2h later: pH 7.41, PaCO2 38, HCO3 20.","Furosemide continued. Day 7 ABG: pH 7.52 | PaCO2 44 | HCO3 34 | Cl 98 | Na 138. UO has been >100 mL/h.","Team asks: the ventilator is 'fine' now, why is the pH still high? What is the new diagnosis?","K+ 2.8 noted on Day 7. Na 138. Urine Cl <20 mmol/L. Patient comatose on sedation — cannot assess symptoms."],
    key_probes:["Apply a systematic acid-base approach to the initial ABG — what is the primary disorder and is there compensation?","Anion gap calculation and interpretation — what does a normal anion gap with metabolic acidosis suggest?","Day 7 ABG: pH 7.52, PaCO2 44, HCO3 34 — new disorder, mechanism, and what caused it?","Urine Cl <20 mmol/L in metabolic alkalosis — what does this tell you and how does it guide treatment?","Hypokalaemia and metabolic alkalosis — what is the bidirectional relationship?"],
    pearls:["Systematic ABG approach: (1) pH — acidaemia or alkalaemia; (2) primary disorder from PaCO2 or HCO3; (3) expected compensation (Winter's formula for metabolic acidosis: expected PaCO2 = 1.5×HCO3 + 8 ±2); (4) anion gap = Na - (Cl + HCO3) — normal 8–12; (5) delta ratio if AG elevated. Initial ABG: pH 7.48 (alkalaemia), PaCO2 28 (respiratory alkalosis), HCO3 20 (appropriate renal compensation) = primary respiratory alkalosis.","Metabolic alkalosis from furosemide: loop diuretics cause Cl- and K+ loss → HCO3 rises to maintain electroneutrality → contraction alkalosis. Mechanism: volume contraction stimulates aldosterone → Na/H exchange in collecting duct → HCO3 retention.","Urine Cl in metabolic alkalosis: Cl <20 mmol/L = chloride-responsive alkalosis (vomiting, diuretics, NGT losses) → treat with NaCl. Cl >40 mmol/L = chloride-resistant alkalosis (hyperaldosteronism, Bartter/Gitelman syndrome) → treat the underlying cause.","Hypokalaemia worsens metabolic alkalosis: hypokalaemia causes K+ to leave cells in exchange for H+ entering cells (intracellular acidosis, extracellular alkalosis) + aldosterone-stimulated H+ secretion in collecting duct."],
    pitfalls:["Reducing RR to correct respiratory alkalosis without addressing the cause: in a spontaneously breathing patient, respiratory alkalosis is driven by their respiratory centre (pain, anxiety, hypoxia, acidosis, neurological). Reducing set RR in VCV does not stop the patient over-breathing if they have spontaneous effort.","Diagnosing a single acid-base disorder when two exist: always calculate expected compensation. If actual compensation differs from expected, a second disorder is present. Day 7: HCO3 34 with normal PaCO2 = metabolic alkalosis is the new primary disorder.","Normal AG metabolic acidosis: if AG is normal (8–12), differential is HARDUPS — hyperchloraemia, Addison's, RTA, diarrhoea, ureteral diversion, pancreatic fistula, saline infusion.","Correcting metabolic alkalosis with HCl infusion: IV hydrochloric acid is reserved for severe, refractory cases (pH >7.6). First-line is fluid resuscitation with 0.9% NaCl (to restore Cl-) and K+ replacement."]
  },
{
    id:60, title:"Massive Transfusion Protocol — Trauma Haemorrhage", domain:"Renal & Fluids", difficulty:"High",
    stem:`32M, motorcycle vs truck. Brought to trauma bay. Multiple injuries identified.

TRAUMA ASSESSMENT:
• GCS 10 (E2V3M5) | HR 138 | BP 72/40 (MAP 51) | RR 32 | Temp 35.8°C
• Distended abdomen | Pelvis unstable | Right femur fracture | Open tib-fib left

FAST exam: large free fluid in abdomen | Left haemothorax on CXR
Primary survey injuries: splenic laceration (Grade IV), pelvic ring disruption

LABS:
• Hb 7.2 | Plt 88 | INR 1.8 | Fibrinogen 1.2 g/L | Lactate 6.8 | pH 7.21 | Temp 35.2°C
• Base excess: -12`,
    progressive_data:["MTP activated. 4 units pRBC + 4 units FFP + 1 pool platelets given. Pre-hospital TXA 1g given. Pelvic binder applied.","Interventional radiology: splenic embolisation performed. Pelvic packing performed in theatre. Haemorrhage partially controlled.","2h: cumulative transfusion 8 units pRBC, 8 units FFP, 2 pools platelets, 4g fibrinogen concentrate. Hb 8.8. INR 1.4. Fibrinogen 1.8. Plt 78.","Damage control surgery completed. Patient back to ICU. Abdomen open (damage control laparotomy). Temp 34.8°C, pH 7.28, coagulopathy partially corrected."],
    key_probes:["Define the lethal triad in trauma — what are the three components and why do they interact?","MTP ratio — what is the evidence-based ratio of pRBC:FFP:platelets?","Tranexamic acid in trauma — CRASH-2 trial findings, timing window, and dose.","Fibrinogen in massive haemorrhage — why is it the first factor to become critically depleted?","Damage control resuscitation vs damage control surgery — define both and how do they interact?"],
    pearls:["Lethal triad: hypothermia (impairs enzymatic coagulation factor activity) + acidosis (pH <7.2 reduces coagulation cascade efficiency by 50–60%) + coagulopathy (dilutional, consumptive, and hypothermia-driven). Each worsens the others — a vicious cycle.","MTP ratio: PROMMTT and PROPPR trials support 1:1:1 ratio pRBC:FFP:platelets (or 2:1:1 as minimum). Haemostatic resuscitation — treat haemorrhage like a coagulopathy from the start, not after labs return.","CRASH-2 trial: TXA reduces all-cause mortality in trauma haemorrhage when given within 3 hours of injury. Dose: 1g IV over 10 min, then 1g over 8h. After 3 hours: no benefit and possible harm (increased mortality). Time-critical.","Fibrinogen is the first coagulation factor to fall critically in massive haemorrhage. Target fibrinogen ≥1.5–2.0 g/L. Fibrinogen concentrate or cryoprecipitate. FFP alone is insufficient to restore fibrinogen rapidly."],
    pitfalls:["Crystalloid resuscitation in haemorrhagic shock: large volumes of NaCl cause dilutional coagulopathy, hyperchloraemic acidosis, and hypothermia. Restrict to <1L pre-haemostasis. Blood products first.","Permissive hypotension in trauma: target SBP 80–90 mmHg in penetrating trauma and blunt trauma WITHOUT TBI. If TBI present: higher MAP targets required (MAP ≥80) — do not apply permissive hypotension to head injury.","Delaying TXA: every 15-minute delay reduces efficacy. Give pre-hospital if possible. Do not wait for confirmation of coagulopathy.","Temperature correction in massive transfusion: all blood products and fluids must be warmed. Hypothermia at 34°C reduces coagulation factor activity by 40%. Use fluid warmers and forced-air warming blankets — not warm blankets alone."]
  },
{
    id:61, title:"Polytrauma — Primary Survey, Damage Control & ICU Priorities", domain:"Trauma & Peri-operative", difficulty:"High",
    stem:`24M, pedestrian vs HGV. Multiple injuries. Brought directly to trauma bay.

PRIMARY SURVEY:
• Airway: noisy breathing, blood in oropharynx — talking in short sentences
• Breathing: RR 32, reduced air entry left, trachea central
• Circulation: HR 142, BP 68/40, abdomen rigid and distended
• Disability: GCS 12 (E3V3M6), pupils equal and reactive
• Exposure: open femur fracture left, pelvis unstable

FAST: large free fluid abdomen, no pericardial effusion
CXR: left haemothorax, no pneumothorax

Temp 35.4°C | pH 7.18 | Lactate 8.2 | BE -14 | Hb 8.1 | INR 2.1 | Fibrinogen 0.9 g/L`,
    progressive_data:["Airway secured (RSI ketamine/roc). Left chest drain: 1200 mL blood immediately. BP improving to 82/50.","Damage control surgery: splenectomy + pelvic packing + external fixator left femur. Abdomen left open. Time in theatre: 68 min.","ICU post-op: Temp 33.8°C, pH 7.22, INR 1.9, Fibrinogen 1.1, Hb 8.4. Norad 0.4 + vasopressin 0.03. MAP 62.","24h: damage control resuscitation ongoing. Temp 36.4°C, pH 7.32, INR 1.3, Fibrinogen 1.8. Haemodynamics improving."],
    key_probes:["Primary survey — you have 30 seconds. What are the immediate life threats and in what order do you address them?","Massive haemothorax — criteria and immediate management.","Damage control surgery — define it and when do you call 'enough' and get out of the abdomen?","ICU post-damage control — what are the resuscitation endpoints of the lethal triad correction?","24h: haemodynamics stable, lethal triad corrected. When do you take him back for definitive surgery?"],
    pearls:["Immediate life threats in primary survey (ABCDE order): (1) obstructed airway; (2) tension pneumothorax; (3) massive haemothorax; (4) open chest wound; (5) flail chest; (6) cardiac tamponade. All identified and treated before moving to secondary survey.","Massive haemothorax: >1500 mL immediate drainage OR >200 mL/h for 2–4 hours. Immediate thoracotomy consideration if >1500 mL.","Damage control surgery endpoints: temperature >35°C, pH >7.3, INR <1.5, fibrinogen >1.5 g/L, lactate <4 mmol/L, haemodynamics stable on low vasopressors. Return for definitive surgery when all criteria met — usually 24–48h.","Lethal triad resuscitation targets: temperature >36°C (active warming mandatory), pH >7.35 (avoid acidosis drivers), coagulopathy corrected (INR <1.5, fibrinogen >1.5, platelets >50)."],
    pitfalls:["Attempting definitive surgery before lethal triad corrected: patients who go back to theatre while still hypothermic, acidotic, or coagulopathic have dramatically higher mortality. Patience in ICU saves lives.","Permissive hypotension with TBI: target SBP 80–90 mmHg for haemorrhagic shock is contraindicated if TBI present. MAP ≥80 mmHg required to maintain CPP.","Pelvic fracture and haemorrhage: FAST cannot reliably identify retroperitoneal haemorrhage from pelvic fractures. Pelvic binder + IR embolisation are the priorities, not laparotomy.","Open abdomen ICU care: regular washout and reassessment every 24–48h. Target fascial closure within 5–7 days to avoid enteroatmospheric fistula."]
  },
{
    id:62, title:"TBI + Coagulopathy — Trauma-Induced Coagulopathy", domain:"Trauma & Peri-operative", difficulty:"High",
    stem:`19M, fell from 3rd floor. Polytrauma — TBI (GCS 7, bilateral contusions on CT), splenic laceration Grade III managed non-operatively, right rib fractures 4–8.

ICU ADMISSION:
• GCS 7 (E1V2M4) | ICP monitor inserted — ICP 24, CPP 56
• MAP 78 | HR 104 | Temp 35.6°C | Hb 9.2

COAGULATION:
• INR 2.4 | APTT 62s | Fibrinogen 0.8 g/L | Plt 68
• TEG: R-time prolonged, angle reduced, MA 42, LY30 3%
• D-dimer >20 mg/L

Radiologist report: CT shows cerebral contusions with haemorrhagic evolution on 4h CT — contusion expanding.`,
    progressive_data:["Neurosurgery review: contusions expanding — ICP rising to 32. No surgical lesion. Medical ICP management only.","FFP 4 units + fibrinogen concentrate 4g + platelets 1 pool given. 2h: INR 1.6, fibrinogen 1.4, Plt 88. ICP falling to 22.","TXA question raised: the ED gave TXA 1g on arrival (2 hours ago). Neurosurgery asks if a second dose should be given.","Day 3: ICP controlled. GCS improving to 9. Fever 38.8°C. Na 148 (rising). Urine output 380 mL/h. Concern: diabetes insipidus vs osmotic therapy effect."],
    key_probes:["Trauma-induced coagulopathy — what causes it and why does it differ from DIC?","TEG R-time prolonged + low MA + normal LY30 — interpret each component and what does it mandate?","Expanding cerebral contusion + coagulopathy — how do you correct coagulopathy without worsening cerebral oedema?","TXA in TBI — what does the CRASH-3 trial show and does it change your answer here?","Day 3: urine output 380 mL/h, Na 148 — SIADH vs DI vs osmotherapy effect — how do you differentiate?"],
    pearls:["Trauma-induced coagulopathy (TIC): occurs in 25–35% of major trauma. Mechanism: shock-driven activation of protein C → consumption of coagulation factors + hyperfibrinolysis. Distinct from DIC — TIC is shock-mediated, not infection-mediated; fibrinolysis predominates early.","TEG interpretation: R-time = clot initiation (factor activity); Angle = fibrinogen and platelet interaction; MA = clot strength (platelet function); LY30 = fibrinolysis. Prolonged R = factor deficiency (give FFP). Low MA = poor platelet function or thrombocytopenia (give platelets). Elevated LY30 = hyperfibrinolysis (give TXA).","CRASH-3 trial: TXA in TBI — reduces head-injury-related death if given within 3 hours of injury in mild-moderate TBI. No benefit (and possible harm) in severe TBI (GCS <8) or if given after 3h. This patient: TXA given 2h ago, GCS 7 (severe TBI) — second dose not indicated.","Fibrinogen in TIC: first factor to become critically depleted. Target ≥1.5 g/L in TBI with haemorrhagic contusions. Fibrinogen concentrate preferred (faster, smaller volume, no FFP dilution effect on ICP)."],
    pitfalls:["FFP for coagulopathy correction in TBI: large volumes of FFP increase total fluid and can raise ICP. Prefer fibrinogen concentrate + PCC over FFP in TBI coagulopathy to minimise volume load.","Platelet transfusion threshold in TBI: target Plt >100 ×10⁹/L (not >50 as in other bleeding) due to the high-risk intracranial location. Platelet dysfunction is common even with normal counts in TIC.","TXA for expanding cerebral contusion: CRASH-3 showed no benefit and possible harm in severe TBI. TXA is for systemic haemorrhage reduction, not intracranial haemorrhage directly.","Hypernatraemia in TBI Day 3: multiple causes — mannitol osmotherapy causes solute diuresis, DI from hypothalamic injury, and CSWS all cause hypernatraemia. Urine osmolality and serum osmolality distinguish DI (dilute urine, high serum osmolality) from osmotherapy effect."]
  },
{
    id:63, title:"Fat Embolism Syndrome — Post-Long Bone Fracture", domain:"Trauma & Peri-operative", difficulty:"Medium",
    stem:`22M, right femur fracture following motorbike accident. Managed conservatively (external fixator) Day 1. Now Day 2.

NEW PRESENTATION:
• GCS deteriorating 15→11 over 6 hours | Confused
• HR 118 | BP 104/68 | RR 32 | Temp 38.6°C
• SpO2 86% on 10L O2 | New bilateral crackles
• Petechial rash: upper chest, axillae, conjunctivae

ABG (FiO2 0.6): pH 7.46 | PaCO2 28 | PaO2 62 | Lactate 1.8
CXR: bilateral diffuse infiltrates
Platelet count: 68 (was 188 yesterday) | Fat globules in urine`,
    progressive_data:["CT brain: no haemorrhage, no infarct. CT pulmonary angiography: no PE. Bilateral ground glass changes.","Fat embolism syndrome confirmed clinically (Gurd's criteria). HFNC started 60L/min FiO2 0.8. SpO2 improving to 92%.","24h on HFNC: P/F improving 103→148. GCS improving to 13. Petechiae fading.","Day 4: SpO2 95% on 4L O2. GCS 15. Orthopaedics planning definitive fixation — asking: is it safe to proceed to theatre?"],
    key_probes:["Fat embolism syndrome — pathophysiology and how do fat emboli cause neurological and pulmonary injury?","Gurd's criteria for FES — major and minor criteria. How many does this patient meet?","FES vs massive PE — this patient had a CTPA. How do you distinguish the two clinically and radiologically?","Management of FES — what is the specific treatment and what is the role of steroids?","Orthopaedics wants to proceed to definitive fixation on Day 4 — is it safe and what are your requirements?"],
    pearls:["FES pathophysiology: (1) mechanical theory — fat globules from marrow enter circulation, embolise to lung and brain; (2) biochemical theory — lipase breaks down fat into free fatty acids → toxic endothelial injury, ARDS, platelet aggregation. Both mechanisms occur.","Gurd's criteria: Major = respiratory insufficiency, neurological impairment, petechial rash. Minor = fever, tachycardia, retinal changes, thrombocytopenia, fat in urine, anaemia. Diagnosis: ≥1 major + ≥4 minor.","FES vs PE: CTPA negative for PE but shows bilateral GGO (ARDS pattern). PE causes RV strain on echo. FES: no DVT source usually, petechiae (pathognomonic), onset 24–72h post-fracture, MRI brain shows punctate white matter lesions.","FES management: supportive — O2/respiratory support, maintain adequate CO, avoid fluid overload. Steroids: no RCT evidence. Some observational data for prophylactic methylprednisolone in high-risk patients — not standard of care."],
    pitfalls:["Early operative fixation and FES: definitive fixation of long bone fractures should be delayed until FES is resolving (P/F >200, GCS improving, haemodynamics stable). Operating during active FES worsens outcome.","Petechial rash in FES: pathognomonic but transient — disappears within 24–48h. If missed early, diagnosis becomes more difficult.","Thrombocytopenia in FES: fat emboli activate platelets and cause consumption. Not DIC — coagulation profile (PT, APTT, fibrinogen) usually normal or minimally deranged.","Anaesthesia in FES: if theatre unavoidable, regional anaesthesia preferred over general anaesthesia (avoids airway pressures that can worsen pulmonary injury). Discuss with anaesthetics."]
  },
{
    id:64, title:"Post-operative Septic Shock — Source Control Principles", domain:"Trauma & Peri-operative", difficulty:"High",
    stem:`68F, elective right hemicolectomy for cancer. Experienced anastomotic leak on Day 4 post-op, taken back to theatre — Hartmann's procedure performed, abdomen washed out.

NOW DAY 7 (3 days after re-operation):
• Still in ICU | Intubated | Norad 0.28 mcg/kg/min
• MAP 66 | HR 108 | Temp 38.6°C | WBC 22
• Lactate 3.2 (was 1.8 yesterday) | CRP 320 (rising)
• Abdominal drain: 180 mL bile-stained fluid in last 12 hours
• Cr 2.4 | UO 25 mL/h`,
    progressive_data:["CT abdomen: 6 × 4 cm pelvic collection with air-fluid level. Small bowel loops surrounding. Drain in poor position.","IR drainage: collection drained — 80 mL pus. Drain repositioned. Culture: Candida albicans + E.coli.","Microbiology review: E.coli sensitive to pip-tazo (already on meropenem). Candida albicans — antifungal coverage discussed.","Day 10: lactate normalising. Norad weaning. WBC 14. However new concern: bilateral pulmonary infiltrates, increasing FiO2 requirement."],
    key_probes:["Rising lactate on Day 7 post Hartmann's — your diagnostic framework. Why is source control the priority?","CT shows pelvic collection — IR drainage vs surgical re-exploration. How do you decide?","Culture grows Candida albicans from abdominal collection. Does this change your antifungal management?","Inadequate source control — define it and what clinical findings suggest it?","Day 10: new bilateral infiltrates + increasing FiO2. Three most likely diagnoses in order."],
    pearls:["Source control principle: every focus of infection should be drained, debrided, or surgically controlled. No antibiotic regimen compensates for inadequate source control. Persistent sepsis despite antibiotics = source control problem until proven otherwise.","IR drainage vs surgical re-exploration: IR drainage preferred for accessible, unilocular collections >3 cm. Surgical re-exploration if: multiple loculations, enteric fistula, necrotic tissue, failed IR drainage, clinical deterioration despite drainage.","Candida in abdominal collections: Candida peritonitis in post-surgical patients has high mortality. Treatment: fluconazole if sensitive (azole-susceptible species). Echinocandin (caspofungin) if fluconazole-resistant or haemodynamically unstable. ESCMID recommends treating Candida from any intra-abdominal infection in ICU.","Inadequate source control signs: persistent fever >72h after drainage, rising lactate, rising inflammatory markers, no haemodynamic improvement, recurrent collection on imaging."],
    pitfalls:["Relying on antibiotics without source control: Candida and E.coli in an abdominal abscess will not clear with antibiotics alone. The collection must be drained.","Pip-tazo for ESBL E.coli: even if sensitive in vitro, pip-tazo has unreliable efficacy against ESBL producers at high inocula (inoculum effect). Continue meropenem.","Fluconazole for all Candida: Candida glabrata and krusei have intrinsic resistance to fluconazole. Speciate first. Echinocandin if C. glabrata or if haemodynamically unstable.","Day 10 bilateral infiltrates — do not assume ICU-acquired pneumonia without considering: (1) aspiration (post-op, sedated, nasogastric); (2) TRALI from blood products; (3) ARDS from ongoing sepsis; (4) fluid overload. Bronchoscopy + BAL before empirical treatment escalation."]
  },
{
    id:65, title:"Peri-operative Cardiac Risk — High-Risk Non-Cardiac Surgery", domain:"Trauma & Peri-operative", difficulty:"Medium",
    stem:`72M, known ischaemic cardiomyopathy (LVEF 30%, stable), CKD Stage 3, T2DM. Presenting for elective open AAA repair (9.2 cm aneurysm, symptomatic).

PRE-OPERATIVE ASSESSMENT:
• RCRI score calculated: 4 factors (ischaemic heart disease, heart failure, CKD, insulin-dependent DM)
• Estimated peri-operative MACE risk: >10%
• Cardiology review: LVEF 30%, no reversible ischaemia on stress imaging, optimised medically
• Current medications: bisoprolol 2.5mg, ramipril 5mg, atorvastatin, aspirin, insulin

Surgeon plans: open repair under GA + epidural. ICU post-op.`,
    progressive_data:["Intra-operative: haemodynamics stable. Cross-clamp time 48 min. Estimated blood loss 1800 mL. Received 2 units pRBC.","ICU post-op Hour 2: Troponin I 0.4 ng/mL (borderline). ECG: new ST depression V4–V6. MAP 72 on norad 0.12 mcg/kg/min.","Hour 6: Troponin rising 0.4→2.8 ng/mL. New anterior hypokinesis on echo. GCS 15 — no chest pain (epidural).","Cardiology: urgent coronary angiography discussed. Cr 2.1 (baseline 1.4). Team weighing risks."],
    key_probes:["RCRI score 4 — what does this mean and how does it change your peri-operative planning?","Which medications must you NOT stop before major surgery — and which ones do you stop?","Post-op troponin rising with new anterior hypokinesis — Type 1 or Type 2 MI? How do you decide?","Urgent coronary angiography in a patient with Cr 2.1 post-AAA repair — risks and how do you mitigate them?","MINS (myocardial injury after non-cardiac surgery) — definition and does it change management?"],
    pearls:["RCRI (Revised Cardiac Risk Index): each factor scores 1 point — ischaemic heart disease, heart failure, cerebrovascular disease, CKD (Cr >170), DM on insulin, high-risk surgery. Score ≥3 = >5% MACE risk. Score 4 = >10% risk.","Peri-operative medications: CONTINUE — beta-blockers (stopping causes rebound ischaemia), statins (pleiotropic cardioprotective effects), aspirin (restart within 24–48h if bleeding risk acceptable). STOP — ACEi/ARB on day of surgery (risk of intra-operative hypotension with anaesthesia); NSAIDs (worsens AKI post-surgery).","MINS: troponin elevation ≥0.04 ng/mL within 30 days of surgery with ischaemic mechanism (ST changes, new RWMA, or ischaemic symptoms). Associated with 30-day mortality of 10%. Type 1 MINS requires urgent revascularisation consideration.","Regional versus general anaesthesia in high cardiac risk: neuraxial anaesthesia (epidural/spinal) reduces cardiac events in some vascular surgery studies — reduces sympathetic activation, blunts stress response."],
    pitfalls:["Stopping beta-blockers pre-operatively: rebound tachycardia and hypertension increase MACE risk dramatically. Continue ALL beta-blockers peri-operatively. If unable to take oral — give IV metoprolol.","Starting beta-blockers de novo immediately pre-operatively: POISE trial showed starting high-dose metoprolol 2–4h pre-surgery reduced MI but increased stroke and death. Only safe if started weeks before surgery and titrated.","Attributing all peri-operative troponin rise to Type 2 MI: new anterior hypokinesis in a patient with ischaemic cardiomyopathy post-aortic cross-clamp = high probability Type 1 MI. Urgent angiography is appropriate.","ACEi and renal protection post-AAA: hold for 24–48h post-operatively in AKI risk patients. Restart when haemodynamically stable and Cr trending back to baseline."]
  },
{
    id:66, title:"Abdominal Compartment Syndrome — Recognition & Management", domain:"Trauma & Peri-operative", difficulty:"High",
    stem:`55M, severe acute pancreatitis (BISAP score 4, CTSI Grade E). Admitted 5 days ago. Aggressive fluid resuscitation: +14 litres in 5 days.

CURRENT STATUS:
• Intubated | Norad 0.3 mcg/kg/min | MAP 68
• RR 28 on vent | Peak airway pressures rising 32→44 cmH2O
• UO falling: 0.3 mL/kg/h | Cr rising 1.2→2.8
• Abdomen: massively distended, tense
• Bladder pressure measured: 28 mmHg`,
    progressive_data:["IAH Grade III confirmed (IAP 21–30 mmHg). ACS diagnosis: IAP 28 + new organ dysfunction (AKI, respiratory failure).","Sedation deepened. NMBA given. IAP: 28→22 mmHg. MAP stable. No improvement in UO or airway pressures.","Nasogastric decompression + PR enema: IAP 22→18 mmHg. Some improvement but still above 15 mmHg. UO 0.2 mL/kg/h.","Surgical team contacted. Decompressive laparotomy offered. Risk-benefit discussion — pancreatitis surgeon reviewing."],
    key_probes:["Define intra-abdominal hypertension and abdominal compartment syndrome — what are the IAP thresholds?","Bladder pressure 28 mmHg with falling UO and rising airway pressures — is this ACS?","Medical management ladder for ACS — what is the order and what is the evidence for each step?","Decompressive laparotomy in severe pancreatitis — when is it indicated and what are the specific risks?","Open abdomen management post-decompression — what are your specific ICU priorities?"],
    pearls:["IAH/ACS definitions: IAP >12 mmHg = IAH. ACS = sustained IAP >20 mmHg with new organ dysfunction. Grade I: 12–15; Grade II: 16–20; Grade III: 21–25; Grade IV: >25 mmHg.","Bladder pressure measurement technique: 25 mL sterile NaCl instilled via Foley, measured at end-expiration, patient supine, zero referenced at iliac crest. Any deviation invalidates the measurement.","Medical management ladder: (1) nasogastric + rectal decompression; (2) prokinetics; (3) NMBA (reduces abdominal wall tone — most effective non-surgical intervention); (4) percutaneous drainage if ascites; (5) optimise fluid balance (diuresis or CRRT if fluid overloaded); (6) decompressive laparotomy if refractory.","NMBA for ACS: cisatracurium infusion reduces abdominal wall muscular contraction — can reduce IAP by 3–8 mmHg. Effective as temporising or adjunctive measure."],
    pitfalls:["Continuing aggressive fluid resuscitation in pancreatitis causing ACS: the same fluids that 'resuscitated' this patient are now causing the ACS. Switch to de-resuscitation strategy early. WSACS guidelines recommend targeting neutral or negative balance after resuscitation phase.","Decompressive laparotomy in pancreatitis: high-risk procedure. Open abdomen in pancreatitis is associated with high fistula, infection, and wound complication rates. Reserve for refractory ACS unresponsive to all medical measures.","Bladder pressure in the obese patient: adipose tissue can cause falsely elevated readings. Confirm with nasogastric or direct peritoneal pressure measurement if clinical picture does not match.","Missing ACS in non-surgical patients: ACS is not only post-operative. Severe pancreatitis, massive fluid resuscitation, burns, and liver failure all cause ACS. Check bladder pressure in any ICU patient with unexplained rising airway pressures + falling UO."]
  },
{
    id:67, title:"Pulmonary Contusion — Ventilator Strategy & Complications", domain:"Trauma & Peri-operative", difficulty:"Medium",
    stem:`35M, restrained driver, high-speed RTC. Chest deformity, paradoxical chest wall movement right.

CT CHEST:
• Right pulmonary contusion (2/3 right lung involved)
• Right flail chest (ribs 3–9 posterior)
• No pneumothorax | No haemothorax
• Small right pleural effusion

ICU ADMISSION:
• HR 112 | BP 108/68 | RR 36 | SpO2 88% on 15L NRB | Temp 37.4°C
• GCS 14 | Severe right chest wall pain | Cannot take deep breath
• ABG (FiO2 0.8): pH 7.38 | PaCO2 44 | PaO2 62 | Lactate 2.1`,
    progressive_data:["HFNC 60L/min FiO2 0.8 started. Thoracic epidural analgesia placed. SpO2 improving to 94%. RR 26.","12 hours: SpO2 94%, RR 22 with epidural. ABG: P/F 148. Patient cooperative. Avoiding intubation.","48h: P/F worsening 148→88 despite HFNC. Increasing secretions — unable to clear. Intubation decision.","Post-intubation Day 3: P/F 72, bilateral infiltrates (contusion evolving + hospital-acquired pneumonia suspected). BAL performed."],
    key_probes:["Flail chest — definition and why does the paradoxical movement cause respiratory failure?","Analgesia in rib fractures — what is the evidence hierarchy for analgesia and why does it matter for outcome?","Pulmonary contusion evolution — when does it peak and what does this mean for ventilator strategy?","HFNC in pulmonary contusion — what are the criteria for using non-invasive support and when do you intubate?","Day 3 post-intubation: HFNC failed, now intubated, P/F 72. Is this ARDS or contusion — does the distinction matter?"],
    pearls:["Flail chest: ≥2 consecutive ribs fractured in ≥2 places creating a free-floating segment. Paradoxical inward movement on inspiration increases work of breathing. Primary problem is underlying pulmonary contusion, not the mechanical flail segment.","Analgesia evidence hierarchy for rib fractures: (1) thoracic epidural analgesia — gold standard, reduces pneumonia, reduces intubation, improves FVC; (2) paravertebral block; (3) serratus anterior block; (4) IV NSAIDs; (5) IV opioids (worst respiratory compromise). Pain control IS the treatment for flail chest.","Pulmonary contusion evolution: peaks at 24–72 hours after injury. Oedema + blood in alveoli progresses as fluid accumulates. Ventilator strategy: low VT (4–6 mL/kg), permissive hypercapnia, minimise PEEP to prevent overdistension of non-contused lung.","HFNC success predictors in pulmonary contusion: P/F >200 at 2–4h, RR <25, adequate pain control (epidural in place), no copious secretions, cooperative patient."],
    pitfalls:["High PEEP in unilateral contusion: overdistends the non-contused lung while the contused lung remains consolidated. Selective lung ventilation (double-lumen ETT) is occasionally required for very severe unilateral contusion.","Rib fracture fixation: surgical rib fixation improves outcomes in selected patients (flail chest, displaced fractures, failed non-operative management). Discuss with thoracic surgery early.","Nosocomial pneumonia in contusion: inevitable if intubated. Prevention — strict VAP bundle. Early chest physiotherapy (when stable) to mobilise secretions. Broad empirical cover for hospital-acquired organisms.","Missing aortic injury: rib fractures 1–2 suggest high-energy deceleration and are associated with aortic injury. CT angiography of the chest is mandatory even if CXR aortic knuckle appears normal."]
  },
{
    id:68, title:"Spinal Surgery Complications — Epidural Haematoma & Cord Ischaemia", domain:"Trauma & Peri-operative", difficulty:"High",
    stem:`62M, multilevel cervical decompression and fusion (C3–C7) for cervical myelopathy. Anterior and posterior approach. Intraoperative blood loss 1400 mL — received 2 units pRBC.

POST-OP DAY 1 — 18 HOURS AFTER SURGERY:
• Previously moving all four limbs (grade 4/5)
• NOW: complete loss of power both arms | Legs: 2/5 | Cannot raise arms off bed
• New urinary retention
• MAP 72 | HR 88 | SpO2 98% on 2L | No respiratory distress
• Neck wound: intact, no haematoma visible externally`,
    progressive_data:["Urgent MRI cervical spine: posterior epidural haematoma C4–C6, compressing cord. Signal change in cord at C5.","Emergency surgical decompression (12 hours after symptoms first noted). Haematoma evacuated.","Post-decompression Hour 2: arms 0/5, legs 1/5. Spinal cord oedema on MRI.","Day 5: arms 1/5, legs 2/5. Neurological recovery slow. Blood pressure targets being discussed with neurosurgery — MAP >85 mmHg requested."],
    key_probes:["Post-spinal surgery neurological deterioration — your immediate management in the first 5 minutes.","Why is time to decompression the most critical variable — what does the evidence say?","MAP targets in spinal cord injury post-decompression surgery — mechanism and duration.","Spinal cord ischaemia vs epidural haematoma — how do you distinguish on clinical presentation and MRI?","Post-operative anticoagulation after spinal surgery with epidural haematoma — when and what?"],
    pearls:["Post-spinal surgery neurological deterioration: assume epidural haematoma until MRI proves otherwise. Immediate MRI is mandatory — do not wait for morning. If MRI not available, take back to theatre empirically in rapidly progressing deficit.","Time to decompression in spinal epidural haematoma: neurological outcomes strongly correlated with time from deficit onset to decompression. < 8–12 hours = best outcomes. >24 hours = poor prognosis for recovery. This patient decompressed at 12 hours — within the window.","MAP targets post-decompression in SCI: MAP 85–90 mmHg for 5–7 days. Mechanism: maintain spinal cord perfusion pressure (cord has its own autoregulation which may be impaired after injury). Vasopressors if required.","Spinal cord ischaemia vs haematoma: ischaemia — gradual onset during surgery (hypotension, aortic cross-clamp related), no compressive lesion on MRI but cord signal change. Haematoma — typically post-operative onset, compressive lesion clearly visible on MRI."],
    pitfalls:["Waiting for neurosurgery to call back before ordering MRI: every minute of cord compression worsens outcome. Order the MRI immediately and alert neurosurgery simultaneously.","Missing spinal cord injury in the ICU: post-op patients are often sedated or have analgesia limiting neurological assessment. Structured neuro assessment every 2–4 hours post-spinal surgery is mandatory.","Anticoagulation post-haematoma: very high DVT/PE risk from immobility. Restart LMWH 24–48h post-surgical evacuation only if haemostasis confirmed. Mechanical prophylaxis immediately.","Over-relying on external examination: internal epidural haematoma rarely causes visible neck swelling. The diagnosis is clinical (new neurology) + MRI — not wound inspection."]
  },
{
    id:69, title:"Burns Critical Care — Fluid Resuscitation & Airway", domain:"Trauma & Peri-operative", difficulty:"High",
    stem:`38M, house fire. Brought by ambulance. Face and airway involvement.

ED ARRIVAL:
• GCS 14 | HR 128 | BP 108/72 | RR 26 | SpO2 94% on 15L NRB
• Burns assessment: face and neck (singed eyebrows, nasal hair), anterior chest, bilateral arms
• TBSA estimated: 45% (35% deep partial thickness, 10% full thickness)
• Voice: hoarse | Oropharynx: soot, blistering posterior pharynx
• Carboxyhaemoglobin (COHb): 18%`,
    progressive_data:["Airway secured (RSI — ketamine/roc, fibreoptic assisted due to airway oedema). Post-intubation: airway oedema visible on laryngoscopy above cords.","Parkland formula calculated: 4 mL/kg/% TBSA = 4 × 80 × 45 = 14,400 mL in 24h. Half in first 8h from time of burn.","Hour 8: UO 25 mL/h (below target). MAP 72. Team deciding to increase fluid rate. Bladder pressure: 18 mmHg.","Day 2: UO improving. Bladder pressure rising to 24 mmHg. Bilateral extremity oedema severe. Escharotomy question raised."],
    key_probes:["Inhalation injury — signs, pathophysiology, and why does airway oedema peak at 8–24 hours?","COHb 18% — specific management including O2 therapy target and duration.","Parkland formula — calculate it for this patient, and what are its limitations?","UO 25 mL/h at Hour 8 — do you increase fluid rate and what is your target UO?","Circumferential full-thickness burns — escharotomy indications and which compartments do you release?"],
    pearls:["Inhalation injury: soot, hoarseness, singed nasal hair, stridor, oropharyngeal blistering = inhalation injury. Intubate early before oedema progresses — airway oedema peaks at 8–24h post-burn. Failed intubation in a swollen airway = cannot intubate cannot oxygenate scenario.","COHb management: 100% FiO2 (NRB or via ETT) reduces COHb half-life from 4–5h (room air) to 60–90 min. Target COHb <5% before reducing FiO2. Hyperbaric O2 if COHb >25%, neurological symptoms, pregnancy, cardiac involvement.","Parkland formula: 4 mL/kg/% TBSA crystalloid in first 24h. Half in first 8h from time of burn (not from arrival). Titrate to UO 0.5–1 mL/kg/h (adults). The formula is a starting point only — adjust based on UO response.","Escharotomy indications: full-thickness circumferential burns causing: (1) compartment syndrome (pressure >30 mmHg or within 30 mmHg of diastolic); (2) impaired distal perfusion (absent pulses); (3) chest burns impairing ventilation (peak pressures rising, impaired chest excursion)."],
    pitfalls:["Under-resuscitating burns: burns patients lose massive volumes through evaporation and third-spacing. Inadequate fluid causes burn wound conversion (partial → full thickness) and organ failure. UO is the primary resuscitation guide — not blood pressure alone.","Over-resuscitating burns (fluid creep): excess fluid causes ACS, pulmonary oedema, compartment syndromes. Colloid (5% albumin) at 8–12h reduces total crystalloid requirement and is recommended in some protocols for burns >30% TBSA.","Delaying airway management: 'the patient is talking, airway is fine' — inhalation injury with oropharyngeal burns will cause progressive oedema making intubation progressively more difficult. Intubate early and prophylactically.","Escharotomy in ICU: performed at the bedside in ICU — do not delay by waiting for theatre. Bedside escharotomy is a life and limb-saving procedure. Ensure adequate analgesia and access to surgical team."]
  },
{
    id:70, title:"Pre-eclampsia & Eclampsia in ICU", domain:"Trauma & Peri-operative", difficulty:"High",
    stem:`28F, 36 weeks gestation. Primigravida. Admitted with severe headache and visual disturbance.

ED ASSESSMENT:
• GCS 14 | HR 108 | BP 182/118 | RR 22 | Temp 37.1°C
• SpO2 96% on room air | 3+ proteinuria | Peripheral oedema
• Reflexes: brisk with 2 beats of clonus
• Fundoscopy: papilloedema

LABS:
• Plt 68 ×10⁹/L (falling) | LDH 880 | AST 620 | ALT 480
• Hb 9.2 | Cr 1.4 | Bili 48 | Fibrinogen 2.1 g/L
• LDH/AST elevation + thrombocytopenia = HELLP syndrome`,
    progressive_data:["Magnesium sulphate 4g loading dose over 20 min given. IV labetalol started. Obstetrics: emergency LSCS planned within 2h.","Post-LSCS Hour 2: Seizure — generalised tonic-clonic lasting 3 minutes. GCS post-ictal 9.","Magnesium level: 1.8 mmol/L (subtherapeutic — target 2–3.5 mmol/L). Magnesium infusion increased.","Day 2 post-LSCS: BP still 168/108 on IV labetalol + oral nifedipine. Plt 42. LDH still rising. Oliguria continuing."],
    key_probes:["Severe pre-eclampsia vs HELLP syndrome — how do you distinguish and does the distinction change management?","Magnesium sulphate in eclampsia — mechanism, loading dose, maintenance, and toxicity monitoring.","BP target in severe pre-eclampsia — what is the target, which agents, and what is your ceiling?","Post-LSCS seizure — eclampsia vs other causes. How do you manage it?","Day 2: Plt 42, LDH rising, oliguria — HELLP not resolving post-delivery. What now?"],
    pearls:["HELLP syndrome: Haemolysis (LDH >600, schistocytes) + Elevated Liver enzymes (AST/ALT >2× ULN) + Low Platelets (<100 ×10⁹/L). Subset of severe pre-eclampsia — same treatment: delivery. Definitive treatment is delivery.","Magnesium sulphate: mechanism = blocks NMDA receptors + reduces cerebral vasospasm. Loading dose: 4g IV over 20 min. Maintenance: 1–2g/hour IV. Therapeutic level: 2–3.5 mmol/L. Toxicity monitoring: reflexes (absent = toxic), RR (respiratory depression >4 mmol/L), urine output (excretion requires adequate UO). Antidote: calcium gluconate 1g IV.","BP target in severe pre-eclampsia: SBP <160 mmHg, DBP <110 mmHg. First-line: IV labetalol or oral nifedipine. Second-line: IV hydralazine. AVOID sodium nitroprusside (foetal cyanide toxicity).","Post-partum HELLP: most cases resolve within 48–72h post-delivery. If worsening — consider TTP/HUS (requires plasma exchange), DIC (treat underlying), or catastrophic antiphospholipid syndrome."],
    pitfalls:["Magnesium toxicity mimicking deterioration: loss of reflexes precedes respiratory depression. Check reflexes before every magnesium dose. If reflexes absent: STOP magnesium, give calcium gluconate 1g IV immediately.","Giving diuretics for oliguria in pre-eclampsia: pre-eclampsia causes relative intravascular depletion despite oedema. Furosemide worsens renal perfusion. Treat oliguria with cautious fluid challenge first.","Delaying delivery: the only cure for pre-eclampsia/HELLP is delivery. Temporising with antihypertensives and magnesium buys time but delivery must not be delayed beyond what is safe for maternal-foetal balance.","Nitroprusside in hypertensive emergency in pregnancy: contraindicated — cyanide metabolite crosses placenta. Use labetalol, hydralazine, or nifedipine."]
  },
{
    id:71, title:"Paracetamol Overdose — NAC Protocol & Liver Failure", domain:"Toxicology & Metabolic", difficulty:"High",
    stem:`22F, deliberate self-harm. Paracetamol ingestion — 32 tablets (500mg each = 16g) taken approximately 10 hours ago. Brought in by friend.

ED ARRIVAL:
• GCS 15 | HR 104 | BP 112/72 | RR 18 | Temp 37.1°C
• Nausea and vomiting | Right upper quadrant tenderness
• No jaundice yet

LABS:
• Paracetamol level: 180 mg/L at 10 hours post-ingestion
• ALT 280 | AST 420 | Bili 28 | INR 1.4 | Cr 0.9
• pH 7.38 | Lactate 1.8`,
    progressive_data:["Paracetamol level plotted on Rumack-Matthew nomogram: above treatment line. NAC commenced.","24h: ALT 2400, AST 3800, INR 3.2, Cr 1.8, Bili 88. Patient increasingly encephalopathic (Grade II).","48h: INR 6.8, Cr 3.4, pH 7.28, Lactate 4.2, Bili 180. Grade III encephalopathy. King's College criteria being applied.","Liver transplant centre contacted. Patient transferred. KCC met: pH <7.30 + INR >6.5 + Cr >3.0 + Grade III encephalopathy."],
    key_probes:["Paracetamol toxicity mechanism — why does hepatotoxicity occur and what does NAC do?","Rumack-Matthew nomogram — how do you use it and what is the treatment threshold?","NAC protocol — dose, duration, and what do you do if the patient vomits during infusion?","King's College Criteria for paracetamol-induced ALF — list the criteria and what they mandate.","Acute liver failure ICU management — the five most important priorities in order."],
    pearls:["Paracetamol toxicity: NAPQI (toxic metabolite) depletes glutathione → covalent binding to hepatocyte proteins → centrilobular necrosis. NAC replenishes glutathione and acts as antioxidant. Most effective within 8–10h but beneficial up to 24h+.","Rumack-Matthew nomogram: plot paracetamol level vs time since ingestion. Above treatment line = give NAC. If time uncertain or staggered ingestion — treat regardless.","NAC IV protocol (UK): 100 mg/kg in 200 mL 5% dextrose over 2h, then 200 mg/kg over 10h. Total = 300 mg/kg over 21h. Anaphylactoid reactions common in first bag — slow infusion rate, give chlorphenamine.","KCC for paracetamol ALF: single criterion = pH <7.30 (after resuscitation). Or all three of: INR >6.5 + Cr >3.0 (300 µmol/L) + Grade III–IV encephalopathy. Listing for transplant if KCC met."],
    pitfalls:["Late-presenting paracetamol overdose: patients presenting >8–15h post-ingestion with high levels should receive NAC even if level is below the nomogram line — the nomogram was validated for presentations <15h.","Stopping NAC when ALT normalises: NAC should continue until INR <2, ALT falling, and clinical improvement. Do not stop early based on one improving parameter.","Encephalopathy in ALF — not always hepatic: consider cerebral oedema (can cause Cushing's response), hypoglycaemia, sepsis, electrolyte disturbance. Check glucose hourly in ALF.","NAC anaphylactoid reaction: not a true allergy — bradykinin-mediated. Slow the infusion, give chlorphenamine and salbutamol. Do NOT stop NAC — the benefit far outweighs the reaction risk."]
  },
{
    id:72, title:"Tricyclic Antidepressant Overdose — Cardiac Toxicity", domain:"Toxicology & Metabolic", difficulty:"High",
    stem:`35M, found unresponsive at home. Empty blister packs of amitriptyline 25mg (estimated 50 tablets = 1250mg) found nearby. Time of ingestion unknown — estimated 1–3 hours ago.

ED ARRIVAL:
• GCS 8 (E2V2M4) | HR 142 | BP 72/40 (MAP 51) | RR 24 | Temp 37.8°C
• SpO2 90% on 15L NRB | Pupils dilated 6mm bilaterally
• Dry skin | Urinary retention | Absent bowel sounds

ECG: sinus tachycardia 142 bpm, QRS 148 ms (broad complex), QTc 520 ms, R wave in aVR 4mm`,
    progressive_data:["Intubated (RSI ketamine/roc). Post-intubation: BP 62/38. Further deterioration. Sodium bicarbonate 100 mmol IV given.","20 minutes post-bicarb: QRS narrowing 148→110 ms. MAP improving to 68. Norad 0.2 mcg/kg/min.","2 hours: runs of broad complex VT. QRS 130 ms despite bicarb. pH 7.44 (alkalotic). BP 64/40.","Total bicarb given: 300 mmol. pH 7.52. QRS still 128 ms. VT runs continuing. Team considering lipid emulsion and ECMO."],
    key_probes:["TCA toxicity mechanism — cardiac and CNS effects. Why is QRS width the key ECG marker?","Sodium bicarbonate in TCA toxicity — two distinct mechanisms. What is the pH target?","QRS 148 ms with hypotension — your immediate management sequence.","VT in TCA toxicity — which antiarrhythmics are safe and which are contraindicated?","pH 7.52 and still deteriorating — what is your next escalation step?"],
    pearls:["TCA toxicity mechanisms: (1) sodium channel blockade → broad QRS, hypotension, conduction delay; (2) anticholinergic effects → tachycardia, mydriasis, urinary retention, ileus; (3) alpha-1 blockade → vasodilation; (4) GABA-A antagonism → seizures.","Sodium bicarbonate dual mechanism: (1) increases serum sodium — overcomes sodium channel blockade (sodium loading effect); (2) alkalinisation — increases protein binding of TCA, reducing free drug levels. Target pH 7.45–7.55 (not higher).","R wave in aVR >3mm + QRS >100 ms = high risk of VT and seizures. QRS >160 ms = very high risk of cardiac arrest.","Safe antiarrhythmics in TCA toxicity: magnesium sulphate 2g IV for VT/polymorphic VT. AVOID: class Ia antiarrhythmics (quinidine, procainamide — worsen sodium channel blockade), class Ic (flecainide), amiodarone (worsens QT)."],
    pitfalls:["Physostigmine for TCA anticholinergic toxicity: contraindicated in TCA overdose — can precipitate bradycardia, asystole, and seizures. Only safe in pure antimuscarinic toxicity (not TCA).","Flumazenil if co-ingestion suspected: contraindicated if TCA co-ingested — can precipitate seizures by reversing benzodiazepine protection. Avoid unless no TCA on board.","Hyperventilation to achieve alkalosis: can cause hypocapnia-induced cerebral vasoconstriction, worsening TCA CNS toxicity. Use sodium bicarbonate, not hyperventilation, for alkalisation.","Lipid emulsion in TCA overdose: limited evidence. TCA is moderately lipophilic — lipid emulsion may have some effect but is not first or second line. Reserve for refractory cardiac arrest."]
  },
{
    id:73, title:"Serotonin Syndrome vs Neuroleptic Malignant Syndrome", domain:"Toxicology & Metabolic", difficulty:"High",
    stem:`32F, psychiatric inpatient on venlafaxine 225mg OD + olanzapine 10mg OD. Four days ago: started tramadol 100mg QDS for back pain by GP. Now acute presentation.

ED ARRIVAL:
• GCS 12 | HR 148 | BP 168/104 | RR 28 | Temp 40.2°C
• SpO2 94% on 4L | Diaphoretic | Agitated | Tremulous
• Clonus: bilateral ankle clonus 3–4 beats | Hyperreflexia throughout
• Pupils: dilated 7mm bilaterally | No rigidity

CK: 1800 IU/L | Na 138 | Cr 1.2 | WBC 14`,
    progressive_data:["All serotonergic agents stopped. IV benzodiazepines (diazepam 10mg IV): partial improvement — HR 128, agitation partially controlled.","Cyproheptadine 8mg via NGT given. Temperature: 40.2→38.8°C over 4 hours.","24h: HR 98, temp 37.6°C, clonus resolving, reflexes normalising. CK peaked 3200.","Day 3: fully recovered neurologically. Psychiatry review: medication plan revised."],
    key_probes:["Serotonin syndrome vs neuroleptic malignant syndrome — how do you distinguish them at the bedside?","Hunter Serotonin Toxicity Criteria — apply them to this patient.","The specific drug combination causing this — which agents interact and what is the mechanism?","Cyproheptadine — mechanism of action and evidence base in serotonin syndrome.","Temperature 40.2°C — when does hyperthermia in toxicological emergencies become a life-threatening priority?"],
    pearls:["SS vs NMS differentiation: Serotonin syndrome = onset within hours, clonus (PATHOGNOMONIC), hyperreflexia, agitation, diaphoresis, diarrhoea. NMS = onset over days, RIGIDITY (lead-pipe), bradyreflexia, bradykinesia, antipsychotic causation. The key clinical differentiator is clonus vs rigidity.","Hunter Serotonin Toxicity Criteria: (1) clonus (spontaneous, inducible, or ocular) — if present, diagnose SS. Sensitivity 84%, specificity 97%.","Drug interaction: venlafaxine (SNRI — inhibits serotonin reuptake) + tramadol (weak serotonin reuptake inhibitor + weak opioid). Combination → excess serotonergic activity at 5-HT1A and 5-HT2A receptors.","Cyproheptadine: histamine H1 antagonist with 5-HT2A antagonist properties. Blocks serotonin receptors. No RCT evidence but widely used. Dose: 8mg orally/NGT, then 4mg every 4h. Only available orally."],
    pitfalls:["NMS treatment with bromocriptine/dantrolene for serotonin syndrome: incorrect diagnosis leads to wrong treatment. Distinguish before treating. Cyproheptadine and benzos are SS treatment; bromocriptine is NMS treatment.","Temperature >41°C in SS: life-threatening hyperthermia causes rhabdomyolysis, DIC, multiorgan failure, and death. Active cooling mandatory — not just paracetamol. Ice packs, cooled IV fluids, consider intubation and neuromuscular blockade if temperature not responding.","Continuing serotonergic agents: ALL implicated agents must be stopped. This includes tramadol, fentanyl (weak serotonergic activity), linezolid (MAO inhibitor activity), methylene blue (MAO inhibitor), and triptans.","Benzodiazepines for agitation in SS: appropriate and effective. Do not use antipsychotics (haloperidol) — they can worsen the syndrome by blocking dopamine without addressing serotonin excess."]
  },
{
    id:74, title:"Organophosphate Poisoning — Cholinergic Crisis", domain:"Toxicology & Metabolic", difficulty:"High",
    stem:`45M, farmer. Brought in confused, excessive secretions. Family report he was spraying pesticides without protective equipment.

ED ARRIVAL:
• GCS 10 | HR 42 | BP 78/44 | RR 8 (shallow) | Temp 37.2°C
• SpO2 72% on room air
• Miosis bilaterally (2mm, non-reactive) | Profuse salivation | Lacrimation
• Urinary incontinence | Defaecation | Muscle fasciculations throughout
• Bronchospasm on auscultation | Copious bronchial secretions`,
    progressive_data:["Atropine 3mg IV given. HR 44→58. Secretions partially reduced. Not enough — further doses needed.","Total atropine: 20mg over 30 minutes. Secretions now drying. HR 82. BP 88/54. Intubation performed.","Pralidoxime 1–2g IV over 15–30 min given. Fasciculations resolving over 4 hours.","24h: atropine infusion ongoing (titrated to secretions). ICU — monitoring for intermediate syndrome."],
    key_probes:["Organophosphate mechanism — what enzyme is inhibited and what are the clinical consequences?","Atropine in OP poisoning — mechanism, dose, titration endpoint, and why you need large doses.","SLUDGE + DUMBELS — list the clinical features and classify them as muscarinic or nicotinic.","Pralidoxime — mechanism, time window, and why timing is critical.","Intermediate syndrome — what is it, when does it occur, and why does it matter for ICU planning?"],
    pearls:["OP mechanism: irreversible inhibition of acetylcholinesterase → accumulation of ACh at muscarinic and nicotinic receptors. Muscarinic effects = SLUDGE (Salivation, Lacrimation, Urination, Defaecation, GI cramps, Emesis) + bronchospasm + bradycardia + miosis. Nicotinic = fasciculations, weakness, paralysis.","Atropine: competitive muscarinic antagonist. Treats MUSCARINIC effects only (secretions, bronchospasm, bradycardia). Does NOT reverse nicotinic effects (weakness, paralysis). Titration endpoint: drying of secretions (NOT heart rate). Doses of 10–100mg may be required in severe poisoning.","Pralidoxime (2-PAM): reactivates acetylcholinesterase before 'ageing' (irreversible binding) occurs. Effective window: 24–48h for most OPs (varies by compound). Treats BOTH muscarinic and nicotinic effects. Dose: 1–2g IV over 15–30 min, then infusion 500mg/h.","Intermediate syndrome: occurs 24–96h post-poisoning after apparent recovery. Causes proximal limb weakness, respiratory muscle weakness, cranial nerve palsies. Mechanism: persistent nicotinic dysfunction. Can cause respiratory failure requiring ventilation."],
    pitfalls:["Atropine endpoint is secretion drying, not HR: over-focusing on bradycardia leads to insufficient atropinisation. The bronchorrhoea and bronchospasm kill — not the bradycardia.","Succinylcholine contraindicated in OP poisoning: OP inhibits plasma cholinesterase (pseudocholinesterase) which metabolises succinylcholine → prolonged paralysis. Use rocuronium.","Personal protective equipment: OP is dermally absorbed. Staff must wear gloves and gowns before contact. Remove patient's clothing and wash skin before examination.","Discharging too early after OP poisoning: intermediate syndrome occurs after apparent recovery. Minimum 48–72h monitoring for respiratory muscle weakness even if initially recovered."]
  },
{
    id:75, title:"Lithium Toxicity — Diagnosis & Management", domain:"Toxicology & Metabolic", difficulty:"Medium",
    stem:`62F, bipolar disorder on lithium carbonate 800mg BD for 10 years (stable therapeutic levels). Three days of vomiting and diarrhoea (gastroenteritis). Now confused and tremulous.

ICU ADMISSION:
• GCS 11 (E3V3M5) | HR 88 | BP 118/72 | RR 18 | Temp 37.2°C
• Coarse tremor | Ataxia | Hyperreflexia | Myoclonus
• No anticholinergic features | No diaphoresis

LABS:
• Lithium level: 3.8 mmol/L (therapeutic range 0.6–1.2 mmol/L)
• Na 134 | Cr 2.8 (baseline 1.1) | K+ 3.2 | Urea 18
• ECG: sinus bradycardia 52 bpm, T-wave flattening`,
    progressive_data:["IV fluid resuscitation with 0.9% NaCl. Lithium level 6h later: 3.6 mmol/L (not falling).","Nephrology review: AKI worsening — Cr 3.6. Lithium cleared primarily by kidneys. Haemodialysis indicated.","HD session 1: lithium level 3.8→1.4 mmol/L. GCS improving. Tremor reducing.","Post-HD 6h: lithium level rebounding 1.4→2.6 mmol/L (redistribution from tissue compartment). Second HD session planned."],
    key_probes:["Lithium toxicity mechanism — why does gastroenteritis specifically precipitate toxicity in a stable patient?","Distinguish chronic toxicity from acute-on-chronic toxicity — clinical and biochemical differences.","Lithium level 3.8 mmol/L with severe neurological features — when do you initiate haemodialysis?","Why does lithium level rebound post-haemodialysis and how do you manage it?","Medications that precipitate lithium toxicity — which are the most important to check?"],
    pearls:["Lithium toxicity precipitants: dehydration (reduces renal lithium clearance), NSAIDs (reduce GFR), ACEi/ARBs (reduce GFR), thiazide diuretics (increase proximal tubule lithium reabsorption), sodium depletion (lithium reabsorbed in place of sodium). Gastroenteritis causes dehydration + sodium depletion → reduced renal clearance.","Chronic toxicity vs acute-on-chronic: chronic toxicity has neurological features disproportionate to serum level (tissue accumulation). Acute overdose has GI features and high levels but may have less neurotoxicity initially. Chronic is more dangerous neurologically.","Haemodialysis indications for lithium toxicity: level >4 mmol/L regardless of symptoms, or level >2.5 mmol/L with severe neurological features (encephalopathy, seizures, neuromuscular instability), or renal failure preventing clearance.","Lithium redistribution post-HD: large volume of distribution (tissue compartment) → lithium redistributes from tissue back into blood after dialysis. Rebound typically occurs 6–8h post-HD. Repeat HD session planned for rebound level >1 mmol/L."],
    pitfalls:["Serum lithium level does not correlate with severity in chronic toxicity: tissue levels are much higher than serum. A patient with chronic toxicity and level 2.5 mmol/L may have severe neurotoxicity — treat clinically, not just by level.","NSAIDs for pain in a lithium patient: dramatically reduce renal lithium clearance. Contraindicated. Use paracetamol.","Haemodialysis vs haemofiltration: haemodialysis clears lithium much more efficiently than CRRT/haemofiltration. Use intermittent HD for acute toxicity — not CVVHDF alone.","Neurological sequelae of lithium toxicity: cerebellar damage, cognitive impairment, nephrogenic DI can be permanent. SILENT syndrome (Syndrome of Irreversible Lithium-Effectuated Neurotoxicity) — a real entity."]
  },
{
    id:76, title:"Thyroid Storm — Diagnosis & Emergency Management", domain:"Toxicology & Metabolic", difficulty:"High",
    stem:`38F, known Graves' disease, non-compliant with carbimazole. Admitted with 3 days of worsening agitation, palpitations, and high fever following influenza infection.

ICU ADMISSION:
• GCS 13 | HR 168 (AF) | BP 158/88 | RR 32 | Temp 40.8°C
• SpO2 94% on 4L | Exophthalmos | Diffuse goitre | Warm skin, diaphoresis
• Agitated and confused | Fine tremor throughout

LABS:
• TSH: <0.01 mIU/L (suppressed) | Free T4: 82 pmol/L (markedly elevated)
• Free T3: 28 pmol/L (markedly elevated)
• WBC 18 | CRP 280 | Glucose 12 | K+ 3.1`,
    progressive_data:["Burch-Wartofsky Point Scale calculated: 75 points (thyroid storm confirmed — threshold >45).","Treatment initiated: propylthiouracil (PTU) 200mg 4-hourly via NGT. IV hydrocortisone 100mg TDS. Propranolol 40mg TDS via NGT.","Saturated solution of potassium iodide (SSKI) started 1 hour after PTU.","24h: HR 128 (AF rate controlled). Temp 38.6°C. Agitation reducing. T4 still very high — thyroid storm takes days to resolve."],
    key_probes:["Thyroid storm pathophysiology — why does it occur acutely when the patient has been hyperthyroid chronically?","Burch-Wartofsky criteria — what clinical features does it include and what score mandates treatment?","Treatment of thyroid storm — the sequence of agents and why sequence matters.","Why must PTU be given before iodine? What happens if the order is reversed?","Beta-blocker in thyroid storm — which agent and why propranolol specifically over other beta-blockers?"],
    pearls:["Thyroid storm triggers: infection, surgery, trauma, iodine load, radioiodine treatment, non-compliance with antithyroid drugs. Mechanism: acute increase in free thyroid hormone (possibly from reduced protein binding), catecholamine sensitisation.","Burch-Wartofsky Scale: thermoregulatory (temperature), CNS (agitation, seizure, coma), GI (nausea, vomiting, diarrhoea, jaundice), cardiovascular (HR, heart failure, AF). >45 = thyroid storm. 25–44 = impending storm.","Treatment sequence: (1) PTU — blocks new thyroid hormone synthesis AND peripheral T4→T3 conversion; (2) iodine (SSKI or Lugol's) — blocks thyroid hormone release (Wolff-Chaikoff effect). MUST be given 1h after PTU; (3) beta-blocker — propranolol (also blocks T4→T3 conversion); (4) corticosteroids — reduce peripheral conversion and may treat relative adrenal insufficiency.","Propranolol preferred: non-selective beta-blocker + inhibits peripheral T4→T3 conversion by blocking deiodinase. Esmolol IV for haemodynamically unstable patients."],
    pitfalls:["Iodine before PTU: if iodine is given first, it provides substrate for increased thyroid hormone synthesis (Jod-Basedow phenomenon) before synthesis is blocked. Always PTU first, then iodine 1 hour later.","Amiodarone-induced thyrotoxicosis: amiodarone contains 37% iodine by weight and inhibits peripheral T4→T3 conversion. Two types: Type 1 (excess iodine, underlying thyroid disease) — treat with thionamides; Type 2 (destructive thyroiditis) — treat with corticosteroids.","Treating fever in thyroid storm with aspirin or NSAIDs: both displace thyroid hormone from protein binding, increasing free T4/T3. Use paracetamol and active cooling only.","Radioiodine treatment in thyroid storm: contraindicated acutely — can cause massive thyroid hormone release. Use only after storm controlled."]
  },
{
    id:77, title:"Adrenal Crisis in ICU — Recognition & Steroid Replacement", domain:"Toxicology & Metabolic", difficulty:"Medium",
    stem:`54M, known Addison's disease on hydrocortisone 20mg AM + 10mg PM + fludrocortisone. Admitted with urosepsis. On the ward for 2 days, now transferred to ICU.

ICU TRANSFER:
• MAP 48 on norad 0.3 mcg/kg/min — not responding to fluids or antibiotics
• HR 128 | Temp 38.8°C | GCS 13
• Na 128 | K+ 6.2 | Glucose 2.8 | Cr 2.4

NURSE NOTE: patient has been vomiting for 3 days — unable to take his oral steroids. No sick day rules applied. No IV steroid given on ward.`,
    progressive_data:["Hydrocortisone 100mg IV bolus given immediately. Within 2 hours: MAP improving 48→68. Norad weaning.","6h: MAP 72, norad 0.1 mcg/kg/min. Na 131 (improving). Glucose 5.4 after dextrose.","ICU Day 2: haemodynamics stable. Team discussing: continue 100mg QDS or switch to stress-dose schedule?","Day 5: sepsis resolving. Patient eating. Plan: step down to oral hydrocortisone — what is the dose and schedule?"],
    key_probes:["Adrenal crisis — clinical features and why does it cause refractory shock?","This patient has known Addison's and has been vomiting — at what point should sick day rules have been applied?","Hydrocortisone dose in adrenal crisis — what is the loading dose, maintenance, and why not dexamethasone?","Refractory shock in ICU — when do you give empirical hydrocortisone even without known adrenal disease?","Stepping down from stress-dose steroids — what is the taper and what are the risks of stopping too quickly?"],
    pearls:["Adrenal crisis: primary adrenal insufficiency under physiological stress. Mechanism: cortisol required for vascular tone (upregulates adrenergic receptor expression) and gluconeogenesis. Absence → refractory vasodilatory shock + hypoglycaemia + hyponatraemia + hyperkalaemia.","Sick day rules for Addison's: (1) double oral dose for fever/minor illness; (2) triple oral dose for moderate illness (vomiting once); (3) IV hydrocortisone 100mg STAT if vomiting or unable to take oral, then 100mg QDS or infusion 200mg/24h. Apply BEFORE coming to hospital.","Hydrocortisone 100mg IV STAT: preferred over dexamethasone — has mineralocorticoid activity (dexamethasone does not), and the Synacthen test can still be performed (hydrocortisone cross-reacts but dexamethasone does not interfere with assay).","Empirical hydrocortisone in refractory septic shock: ACTH stimulation test (250 mcg IV, cortisol at 0 and 60 min). If inadequate response (<248 nmol/L rise) OR if patient is too unstable to wait — give hydrocortisone 200mg/day. ADRENAL trial: no mortality benefit from routine steroids in septic shock but earlier vasopressor liberation."],
    pitfalls:["Dexamethasone instead of hydrocortisone: dexamethasone has no mineralocorticoid activity — inadequate for adrenal crisis (fludrocortisone also needed). However dexamethasone does not interfere with Synacthen test — use if test planned and diagnosis uncertain.","Stopping hydrocortisone abruptly after prolonged stress dosing: HPA axis suppression — taper slowly. Never abrupt cessation after >3–5 days of high-dose steroids.","Missing adrenal crisis as cause of shock: unexplained refractory vasodilatory shock in a patient on long-term steroids, or with known adrenal disease, or recent steroid withdrawal = adrenal crisis until proven otherwise. Empirical treatment is life-saving.","Fludrocortisone: at doses >50mg/day of hydrocortisone (or equivalent), mineralocorticoid activity of hydrocortisone itself is sufficient. Separate fludrocortisone needed only when stepping down to physiological doses."]
  },
{
    id:78, title:"Diabetic Ketoacidosis — Severe & Complicated", domain:"Toxicology & Metabolic", difficulty:"Medium",
    stem:`28M, Type 1 DM. Three days of vomiting. Found at home, minimally responsive.

ED ARRIVAL:
• GCS 10 (E2V3M5) | HR 128 | BP 88/52 (MAP 63) | RR 36 (Kussmaul) | Temp 37.8°C
• SpO2 96% on 4L | Dry mucous membranes | Fruity breath | Sunken eyes

LABS:
• Glucose 48 mmol/L | pH 7.04 | HCO3 4 | PaCO2 12 | Anion gap 32
• K+ 6.8 (before treatment) | Na 128 | Cr 2.8 | Urea 24
• Ketones (blood): 8.4 mmol/L | WBC 22 | CRP 180
• Urinalysis: 3+ glucose, 3+ ketones, nitrites positive`,
    progressive_data:["Fixed rate insulin infusion (FRIII) started 0.1 units/kg/h. IV 0.9% NaCl 1L/h. K+ supplementation held until UO confirmed.","2h: Glucose 38, K+ 4.8 (falling). pH 7.12 (improving). Ketones 6.2. Rate of improvement being monitored.","6h: Glucose 14, K+ 3.4, pH 7.26, HCO3 12, Ketones 3.8. Team: switch to variable rate insulin and add dextrose?","12h: pH 7.36, HCO3 18, Ketones 1.2, Glucose 11. GCS improving to 14. Team discussing when to stop IV insulin and restart subcutaneous."],
    key_probes:["DKA diagnosis criteria — what defines DKA and how do you classify severity?","K+ 6.8 on arrival — do you give potassium and when? What is the risk of the K+ during treatment?","Fixed rate insulin infusion in DKA — rate, target rate of glucose fall, and when do you add dextrose?","The pH 7.04 — do you give sodium bicarbonate? What does the evidence say?","When is DKA resolved and how do you transition from IV to subcutaneous insulin safely?"],
    pearls:["DKA diagnostic criteria: glucose >11 mmol/L (or known DM) + ketonaemia ≥3 mmol/L or ketonuria 2+ + acidosis pH <7.3 or HCO3 <15. Severity: mild pH 7.25–7.30, moderate 7.0–7.24, severe <7.0.","Potassium management in DKA: initial K+ 6.8 is falsely high (acidosis shifts K+ out of cells). Once insulin starts, K+ will fall rapidly. Hold K+ replacement until K+ <5.5 and UO confirmed. Start replacement when K+ <5.0. Critical: K+ <3.5 = stop insulin until K+ replaced.","Fixed rate insulin infusion: 0.1 units/kg/h. Target glucose fall 3–4 mmol/L/hour. When glucose <14 mmol/L, add 10% dextrose at 125 mL/h alongside 0.9% NaCl — do NOT reduce insulin, continue FRIII to clear ketones.","Bicarbonate in DKA: not recommended routinely. Evidence: no benefit and possible harm (paradoxical CSF acidosis, hypokalaemia, slower ketone clearance). Only consider if pH <6.9 after fluid resuscitation."],
    pitfalls:["Stopping insulin when glucose normalises: glucose falls faster than ketones clear. If insulin stopped early, ketoacidosis persists. Continue FRIII until ketones <0.6 mmol/L and pH >7.3, then transition.","Cerebral oedema in young patients with DKA: risk factors — young age, new-onset DM, rapid glucose or osmolality correction, sodium bicarbonate use. Suspect if GCS deteriorates after initial improvement. Treat with mannitol or hypertonic saline.","Transition to subcutaneous insulin: give long-acting insulin (glargine) 1–2h before stopping IV insulin. Then give short-acting with meals. Never stop IV insulin without subcutaneous coverage running — rapid re-ketosis.","Potassium in DKA: the most dangerous electrolyte. Initial hyperkalaemia can mask total body K+ deficit. As treatment progresses, severe hypokalaemia (K+ <2.5) can cause fatal arrhythmias. Monitor K+ every 1–2h."]
  },
{
    id:79, title:"Hyperammonaemia & Acute Liver Failure — Cerebral Oedema", domain:"Toxicology & Metabolic", difficulty:"High",
    stem:`34M, no known liver disease. Acute presentation — 5 days of jaundice, progressive confusion, found comatose.

ICU ADMISSION:
• GCS 6 (E1V1M4) | HR 116 | BP 98/54 (MAP 69 on norad 0.2) | Temp 38.2°C
• Jaundice ++ | Fetor hepaticus | Asterixis (pre-coma finding)
• INR 8.4 | Bili 380 µmol/L | ALT 2800 | AST 3200 | Albumin 18 g/L
• Ammonia: 284 µmol/L (normal <50)
• Paracetamol level: 0 | Hepatitis A/B/E serology: pending
• CT head: cerebral oedema, compressed ventricles, no herniation`,
    progressive_data:["ICP monitor inserted (bolts). ICP 28 mmHg. CPP 52 mmHg. Mannitol 100 mL 20% given. ICP 28→20.","Liver transplant centre contacted — accepted for listing. MELD 38. Transfer arranged.","Pre-transfer: ICP spiking to 34. Hypertonic saline 30 mL 30% given. Head elevated 30°. Temp 37.1°C (active cooling).","Transfer performed. ICP controlled during transfer. Transplant performed Day 3 — successful."],
    key_probes:["Acute liver failure — define it, classify it, and what is the significance of hyperammonaemia?","ICP monitoring in ALF — when is it indicated and what are the targets?","Cerebral oedema in ALF — why does it occur and how is it different from other causes of raised ICP?","King's College Criteria for non-paracetamol ALF — what are they?","Bridging strategies to liver transplant — what can you do while waiting and what are the priorities?"],
    pearls:["Acute liver failure definition: acute onset liver injury + coagulopathy (INR ≥1.5) + hepatic encephalopathy in the absence of pre-existing liver disease. Hyperacute (<7 days), acute (8–28 days), subacute (5–26 weeks).","Ammonia and cerebral oedema: ammonia crosses blood-brain barrier → converted to glutamine in astrocytes → astrocyte swelling → cerebral oedema. Ammonia >150–200 µmol/L = high risk of intracranial hypertension.","ICP monitoring in ALF: indicated in Grade III–IV encephalopathy (GCS <12) being bridged to transplant. Target: ICP <20 mmHg, CPP >50 mmHg. Coagulopathy makes insertion risky — correct INR with FFP/PCC if possible.","KCC for non-paracetamol ALF: INR >6.5 (single criterion) OR any 3 of: age <10 or >40 years, non-A/non-B hepatitis or drug-induced aetiology, jaundice to encephalopathy >7 days, INR >3.5, bilirubin >300 µmol/L."],
    pitfalls:["Protein restriction in hepatic encephalopathy: outdated. Normal or increased protein intake supports recovery. Ammonia is better managed with lactulose + rifaximin + zinc supplementation.","Hypoglycaemia in ALF: liver failure impairs gluconeogenesis. Check glucose every 1–2h. Infuse 10% or 20% dextrose to maintain glucose 6–10 mmol/L.","Lactulose in ALF: traps ammonia in the gut and accelerates transit. However, excessive lactulose causes hypernatraemia and diarrhoea worsening encephalopathy. Use cautiously and titrate to 2–3 soft stools/day.","TIPS in ALF: contraindicated in acute fulminant liver failure — diverts blood away from the failing liver and worsens encephalopathy. Reserve for acute-on-chronic liver failure only."]
  },
{
    id:80, title:"Methanol & Ethylene Glycol Poisoning", domain:"Toxicology & Metabolic", difficulty:"High",
    stem:`48M, found confused at home. History from paramedics: known alcohol dependence, no commercial alcohol available — may have drunk windscreen washer fluid or antifreeze.

ED ARRIVAL:
• GCS 11 | HR 118 | BP 102/68 | RR 32 | Temp 37.4°C
• SpO2 96% on 4L | Visual complaint: 'everything blurry, lights have halos'
• Pupils: 5mm, sluggish

LABS:
• pH 7.08 | HCO3 6 | PaCO2 16 | Anion gap 38 | Lactate 1.4
• Na 138 | Glucose 6.2 | Osmolality measured: 348 mOsm/kg
• Calculated osmolality: 2×Na + glucose + urea = 294 mOsm/kg
• Osmolar gap = 348 − 294 = 54 (markedly elevated)
• Methanol level: 68 mg/dL (pending at time of clinical decision)`,
    progressive_data:["Fomepizole 15 mg/kg IV loading dose given while methanol level pending. IV bicarbonate started for pH 7.08.","Methanol confirmed 68 mg/dL. Folic acid 50mg IV QDS started. Haemodialysis arranged.","HD Session 1: methanol level 68→12 mg/dL. pH correcting. Visual symptoms improving.","Post-HD: methanol <10 mg/dL. Vision: improving but residual optic disc oedema on fundoscopy. Ophthalmology review."],
    key_probes:["High anion gap metabolic acidosis — work through the differential and why does methanol cause an AG acidosis?","Osmolar gap — how do you calculate it and what does an elevated osmolar gap tell you?","Methanol vs ethylene glycol — how do you distinguish clinically and what are the toxic metabolites of each?","Fomepizole — mechanism, dose, and why is it preferred over ethanol?","Indications for haemodialysis in toxic alcohol poisoning — when do you dialyse?"],
    pearls:["Methanol metabolism: methanol → formaldehyde → formic acid (via alcohol dehydrogenase). Formic acid causes metabolic acidosis + optic nerve toxicity (blindness). Ethylene glycol → glycolic acid → oxalic acid → calcium oxalate crystals (renal tubular damage, hypocalcaemia).","Osmolar gap: measured osmolality − calculated osmolality (2×Na + glucose + urea). Normal <10. Elevated >20 = osmotically active substance present (methanol, ethylene glycol, ethanol, mannitol). Early toxic alcohol ingestion: high osmolar gap + high AG. Late: methanol/EG metabolised → osmolar gap falling + AG increasing (formate/oxalate accumulating).","Methanol vs ethylene glycol differentiation: methanol — visual symptoms (optic toxicity), no urinary crystals. Ethylene glycol — renal failure, calcium oxalate crystals in urine, hypocalcaemia (oxalate chelates calcium).","Fomepizole mechanism: competitive inhibitor of alcohol dehydrogenase. Blocks toxic metabolite production. Preferred over ethanol: predictable pharmacokinetics, no CNS depression, no monitoring required, no hypoglycaemia."],
    pitfalls:["Waiting for methanol level before treating: in high osmolar gap + high AG acidosis + visual symptoms = treat empirically with fomepizole. Do not wait for the lab result — irreversible blindness can occur within hours.","Lactate in ethylene glycol poisoning: standard lactate assay can cross-react with glycolate (ethylene glycol metabolite) — lactate may be falsely elevated. If unexplained high lactate with low actual lactate on blood gas = ethylene glycol.","Folic acid in methanol: folic acid cofactor for formate metabolism → folate-dependent pathway converts formate to CO2. Give 50mg IV QDS to enhance formate clearance.","Dialysis timing: dialyse if methanol level >50 mg/dL, severe acidosis pH <7.15, visual symptoms, renal failure. Fomepizole alone insufficient for severe poisoning — it prevents further metabolite production but does not remove existing methanol or metabolites."]
  },
{
    id:81, title:"Severe Falciparum Malaria — ICU Management", domain:"Special Infections", difficulty:"High",
    stem:`32M, returned from sub-Saharan Africa 8 days ago. Five days of fever, rigors, myalgia. Now confused.

ICU ARRIVAL:
• GCS 10 | HR 128 | BP 82/44 (MAP 57) | Temp 40.2°C | RR 28
• SpO2 90% on 6L | Jaundice | Splenomegaly | Mottled

LABS:
• Malaria film: Plasmodium falciparum, parasitaemia 12%
• Hb 6.8 | Plt 28 | WBC 3.2 | Cr 3.8 | Bili 148 | ALT 280
• Blood glucose 2.4 mmol/L | Lactate 6.2
• pH 7.22 | HCO3 10 | PaCO2 20`,
    progressive_data:["IV artesunate 2.4 mg/kg given. Glucose corrected with 50% dextrose. Norad 0.2 started.","6h: parasitaemia 8% (falling). GCS improving to 12. Glucose 4.8. Creatinine rising to 4.6.","24h: parasitaemia 2.4%. However Hb falling 6.8→4.2. New haemoglobinuria. Lactate rising again.","Day 3: parasitaemia 0.4%. Hb 3.8 — post-artesunate delayed haemolysis. Transfusion decision."],
    key_probes:["WHO severe malaria criteria — list them and how many does this patient meet?","IV artesunate vs IV quinine — which do you use and what does AQUAMAT tell you?","Hypoglycaemia in falciparum malaria — two specific mechanisms.","Post-artesunate delayed haemolysis — what is it, when does it occur, and how do you manage it?","Cerebral malaria — pathophysiology and specific management considerations beyond antimalarials."],
    pearls:["WHO severe malaria criteria: impaired consciousness, respiratory distress, hyperparasitaemia >2%, severe anaemia Hb <7, hypoglycaemia <2.2 mmol/L, renal impairment, jaundice, circulatory collapse, abnormal bleeding, pulmonary oedema. Any ONE = severe malaria — ICU.","AQUAMAT trial: IV artesunate vs IV quinine in African children — 22% reduction in mortality with artesunate. Now first-line for severe malaria in all patients. IV quinine only if artesunate unavailable.","Hypoglycaemia mechanisms in falciparum malaria: (1) parasite consumes glucose directly; (2) quinine stimulates insulin release (if using quinine). Both cause life-threatening hypoglycaemia — check glucose every 2 hours.","Post-artesunate delayed haemolysis (PADH): occurs 1–3 weeks after treatment in high parasitaemia cases. Haemolysis of previously parasitised red cells as they are cleared. Monitor Hb weekly for 4 weeks post-treatment."],
    pitfalls:["Exchange transfusion in hyperparasitaemia: previously recommended for >10% parasitaemia — no longer recommended by WHO. IV artesunate is effective and sufficient.","Steroids in cerebral malaria: CONTRAINDICATED — increase mortality and prolong coma. Unlike bacterial meningitis, steroids worsen cerebral malaria outcomes.","Lumbar puncture in cerebral malaria: distinguish from bacterial meningitis in unclear cases. However always CT first to exclude raised ICP — papilloedema in 30% of cerebral malaria.","Fluid resuscitation in severe malaria: FEAST trial showed harm from aggressive boluses in African children. Cautious fluid resuscitation guided by clinical response — avoid fluid overload."]
  },
{
    id:82, title:"HIV in ICU — Opportunistic Infections & IRIS", domain:"Special Infections", difficulty:"High",
    stem:`38M, HIV-positive, CD4 count 28 cells/µL, not on ART. Three weeks progressive breathlessness and dry cough.

ICU ADMISSION:
• GCS 14 | HR 112 | BP 108/68 | RR 34 | Temp 38.6°C
• SpO2 82% on 15L NRB | Bilateral fine crackles
• Oral thrush | Wasting ++

ABG (FiO2 0.8): pH 7.46 | PaCO2 28 | PaO2 58 | Lactate 1.6
CT chest: bilateral ground-glass opacification, perihilar distribution
LDH: 820 IU/L | Beta-D-glucan: 680 pg/mL`,
    progressive_data:["BAL: Pneumocystis jirovecii confirmed. High-dose co-trimoxazole + prednisolone started. HFNC commenced.","Day 5: SpO2 improving 82%→94%. GCS 15. Team asking: when to start ART?","ART (tenofovir/emtricitabine/dolutegravir) started on Day 14. Day 21: sudden clinical deterioration — fever 39.8°C, new lymphadenopathy, worsening CXR.","IRIS (immune reconstitution inflammatory syndrome) diagnosed. Prednisolone 1mg/kg/day started."],
    key_probes:["CD4 28 and bilateral GGO — your diagnostic approach. What is the most likely diagnosis?","Adjunctive corticosteroids in PJP — what are the criteria and what is the evidence?","When do you start ART in an HIV patient admitted to ICU with an acute opportunistic infection?","IRIS — define it, when does it occur, and how do you distinguish it from treatment failure?","CMV retinitis is found on ophthalmology review — does this change your management and when do you treat?"],
    pearls:["PJP in HIV: CD4 <200 = risk. CD4 <50 = very high risk. Classic triad: bilateral GGO + elevated LDH + elevated beta-D-glucan. BAL confirms. Treatment: co-trimoxazole TMP 15–20 mg/kg/day for 21 days.","Adjunctive steroids in HIV-PJP: PaO2 <70 mmHg on room air OR A-a gradient >35 mmHg = give prednisolone 40mg BD for 5 days, then taper. Reduces mortality by 50% in severe PJP.","ART timing in OI: for most OIs — start ART within 2 weeks of OI treatment. Exceptions: TB meningitis and cryptococcal meningitis — delay ART 4–8 weeks to reduce IRIS risk.","IRIS: paradoxical worsening of an OI after ART initiation due to immune reconstitution. Occurs 2–12 weeks post-ART start. CD4 rising, viral load falling. Treatment: NSAIDs for mild cases, corticosteroids for severe."],
    pitfalls:["Starting ART immediately with TB meningitis or cryptococcal meningitis: increases IRIS risk causing fatal cerebral oedema. Delay ART 4–8 weeks in CNS OIs.","Co-trimoxazole side effects in HIV: rash (including Stevens-Johnson syndrome), nephrotoxicity, hepatotoxicity, hyperkalaemia, myelosuppression. Monitor LFTs, renal function, FBC weekly.","Missing CMV in severely immunocompromised: CMV retinitis (CD4 <50) can cause irreversible blindness. Ophthalmology review mandatory for all patients with CD4 <50. Treat with IV ganciclovir or oral valganciclovir.","PJP prophylaxis: co-trimoxazole 480mg OD when CD4 <200. Stopping prophylaxis prematurely (before CD4 sustained >200 for 3 months on ART) risks recurrence."]
  },
{
    id:83, title:"Meningococcal Septicaemia — Purpura Fulminans & DIC", domain:"Special Infections", difficulty:"High",
    stem:`18M, previously healthy. 12 hours of fever, headache. Now brought in by ambulance — deteriorating rapidly.

ED ARRIVAL:
• GCS 11 | HR 148 | BP 62/38 (MAP 46) | RR 34 | Temp 39.8°C
• Non-blanching petechial and purpuric rash — spreading as you examine
• Neck stiffness | Photophobia

LABS:
• WBC 24 | Plt 28 | CRP 420 | PCT 68 | Lactate 8.2
• PT 28s | APTT 88s | Fibrinogen 0.6 g/L | D-dimer >20 mg/L
• Na 128 | Cr 1.8 | Glucose 2.8
• Blood cultures taken — result pending`,
    progressive_data:["Ceftriaxone 2g IV given in triage (before LP). LP deferred due to haemodynamic instability. CSF to follow when stable.","Aggressive resuscitation: 30 mL/kg crystalloid + norad 0.4 mcg/kg/min. MAP 62. Lactate 7.8 (not improving).","DIC: FFP + cryoprecipitate given. Fibrinogen 0.6→1.2 g/L. Purpura extending — legs developing full-thickness necrosis.","Day 3: surviving. Limb ischaemia bilateral lower legs — plastic surgery and vascular surgery involved. Amputation likely."],
    key_probes:["Non-blanching rash + shock in a young person — your diagnosis and immediate action in the first 2 minutes.","LP in suspected meningococcal meningitis — do you perform it and when?","DIC in meningococcal septicaemia — treatment hierarchy and why source control is antibiotics.","Purpura fulminans — pathophysiology and why does it cause peripheral necrosis?","Activated protein C and corticosteroids in meningococcal disease — what does the evidence say?"],
    pearls:["Non-blanching rash + fever = meningococcal disease until proven otherwise. Give ceftriaxone 2g IV IMMEDIATELY — before CT, before LP, before any other investigation. Every minute of delay increases mortality.","LP in meningococcal disease: do NOT delay antibiotics for LP. Antibiotics first, LP when haemodynamically stable and no signs of raised ICP (papilloedema, focal neurology, GCS <12). Blood cultures adequate if LP must be deferred.","Purpura fulminans: acquired protein C/S deficiency → widespread microvascular thrombosis → peripheral ischaemia and skin necrosis. DIC drives the process. Protein C concentrate has been used but RCT evidence is limited.","Dexamethasone in bacterial meningitis: 0.15 mg/kg QDS for 4 days, started with or before first antibiotic dose. Reduces hearing loss in pneumococcal meningitis. Less benefit in meningococcal — but give anyway if bacterial meningitis is the diagnosis."],
    pitfalls:["Waiting for LP before antibiotics: meningococcal bacteraemia is immediately fatal in hours. Antibiotics first — CSF PCR remains positive for 24–48h after antibiotics if LP subsequently performed.","Purpura fulminans amputation timing: do not rush to amputate — wait for clear demarcation (2–4 weeks) before surgery. Early amputation removes viable tissue. Exception: infection in necrotic tissue mandating emergency debridement.","Fluid resuscitation in meningococcal shock: FEAST trial context — aggressive boluses may cause harm in non-hypotensive children. In adults with frank shock (MAP 46), resuscitate urgently.","Contact prophylaxis: ciprofloxacin 500mg single dose for all household contacts and healthcare workers with unprotected face contact. Rifampicin if ciprofloxacin contraindicated."]
  },
{
    id:84, title:"Infective Endocarditis — ICU Complications", domain:"Special Infections", difficulty:"High",
    stem:`52M, IV drug user. Three weeks of fever. Referred from cardiology ward after deterioration.

ICU ADMISSION:
• HR 122 | BP 78/44 (MAP 55) | RR 28 | Temp 39.2°C | GCS 13
• Splinter haemorrhages | Janeway lesions | New pansystolic murmur

ECHO (TOE): large vegetation (2.1 cm) on tricuspid valve. Severe tricuspid regurgitation. Moderate pericardial effusion.
Blood cultures: MRSA (3/3 bottles)

CHEST CT: multiple bilateral septic emboli | Right-sided empyema`,
    progressive_data:["Vancomycin + gentamicin started. Day 3: new left arm weakness — MRI brain: embolic infarcts, no haemorrhage.","Cardiothoracic surgery review: early surgery discussed. Vegetations >1 cm, recurrent emboli, MRSA — surgery within 72h recommended.","Pre-operatively: Hb 7.2, Plt 68, INR 2.1. Surgeon asks about bridging anticoagulation.","Post-op Day 2: extubated. New fever. Echo: no residual vegetation. CXR: worsening empyema. Drain in poor position."],
    key_probes:["Indications for emergency surgery in infective endocarditis — what are they?","MRSA endocarditis antibiotic regimen — vancomycin dose, monitoring, and when do you add rifampicin?","Embolic stroke in endocarditis — does this change your surgical timing?","Empyema complicating right-sided endocarditis — management and relationship to the primary infection.","Post-op fever in endocarditis — your systematic approach to identifying the source."],
    pearls:["IE emergency surgery indications: (1) heart failure from valvular dysfunction (most common indication — operate urgently); (2) uncontrolled infection (abscess, fistula, enlarging vegetation despite appropriate antibiotics); (3) prevention of embolism (vegetation >1 cm with prior embolic event, or >1.5 cm without prior embolic event per ESC 2015).","MRSA endocarditis: vancomycin 25–30 mg/kg/dose (target trough 15–20 mg/L or AUC/MIC 400–600). Add rifampicin 300–450mg BD for prosthetic valve endocarditis after bacteraemia cleared. Daptomycin 8–10 mg/kg/day is an alternative.","Embolic stroke timing of surgery: non-haemorrhagic embolic stroke — surgery can proceed after 72h if stable neurologically. Haemorrhagic stroke — delay surgery 4 weeks minimum to allow haemorrhage stabilisation.","Right-sided endocarditis: IVDU-associated, typically Staph aureus, tricuspid valve most common. Septic pulmonary emboli are the hallmark. Lower mortality than left-sided disease. Oral antibiotics (doxycycline/co-trimoxazole) may suffice for tricuspid MSSA after initial IV course."],
    pitfalls:["Gentamicin in IE: synergistic with beta-lactams for streptococcal IE. For MRSA — insufficient evidence for routine use, and nephrotoxicity risk is significant. Monitor levels and renal function closely.","Anticoagulation in embolic stroke from IE: NOT routinely anticoagulated — risk of haemorrhagic transformation outweighs thromboembolic benefit. Continue only if mandatory (prosthetic valve, AF).","Tricuspid valve surgery in IVDU: high risk of re-infection if patient continues drug use. Discuss with patient and addiction services. Bioprosthetic preferred — lower thrombosis risk without anticoagulation.","Dental prophylaxis: after IE episode, all patients require antibiotics before dental procedures indefinitely. Amoxicillin 3g single dose (or clindamycin if penicillin allergy)."]
  },
{
    id:85, title:"Neutropenic Fever & Septic Shock — Haematological Malignancy", domain:"Special Infections", difficulty:"High",
    stem:`58M, AML (acute myeloid leukaemia), day 12 post-induction chemotherapy. Bone marrow suppression nadir. Transferred from haematology with rigors and hypotension.

ICU ADMISSION:
• GCS 14 | HR 134 | BP 72/38 (MAP 49) | RR 28 | Temp 39.8°C → 36.2°C (temperature trending down)
• SpO2 90% on 6L | Severe mucositis | No focal infection identified

LABS:
• WBC 0.2 (neutrophils 0.08 ×10⁹/L — profound neutropenia) | Plt 12 | Hb 7.4
• CRP 380 | PCT 42 | Blood cultures ×4 taken
• Cr 2.1 | Na 132 | K+ 3.2 | Mg2+ 0.58`,
    progressive_data:["Piperacillin-tazobactam 4.5g TDS started (per local neutropenic fever protocol). Norad 0.3 mcg/kg/min. Fluid resuscitation.","48h: still febrile 38.8°C. Blood cultures: no growth. Haemodynamics improving. Team: escalate antibiotics or wait?","Day 5 still febrile: CT chest-abdomen: hepatosplenic nodules, halo sign in right lung. Beta-D-glucan 480 pg/mL.","Invasive fungal infection suspected. Voriconazole started. Haematology: hold G-CSF discussion."],
    key_probes:["Neutropenic fever definition — what are the criteria and why is immediate antibiotics mandatory?","Empirical antibiotic choice in neutropenic fever — what agent, why, and when do you add cover for Gram-positives?","48h: cultures negative, still febrile — do you escalate antibiotics or wait?","CT shows halo sign + beta-D-glucan 480 — what is your working diagnosis and treatment?","G-CSF in neutropenic septic shock — is there a role and what does the evidence say?"],
    pearls:["Neutropenic fever definition: temperature >38.3°C once or >38°C sustained, with absolute neutrophil count <0.5 ×10⁹/L (or <1.0 predicted to fall to <0.5). Empirical antibiotics within 60 minutes of presentation — mortality doubles with each hour of delay.","Empirical antibiotic choice: anti-pseudomonal beta-lactam — piperacillin-tazobactam, cefepime, or meropenem. Add vancomycin/teicoplanin if: haemodynamically unstable, suspected CVAD infection, mucositis with Gram-positive bacteraemia risk, known MRSA colonisation.","Persistent fever at 48–72h with negative cultures: if unstable — escalate to meropenem + vancomycin. If stable — continue and investigate further (CT, beta-D-glucan, galactomannan). Fever may persist up to 5 days even with appropriate antibiotics in neutropenia.","Halo sign on CT: ground-glass halo around a nodule = haemorrhagic infarction surrounding angioinvasive mould (Aspergillus most common). Combined with elevated beta-D-glucan/galactomannan = probable invasive aspergillosis. Treat with voriconazole (first-line per IDSA)."],
    pitfalls:["Stopping antibiotics when afebrile in neutropenic patient: continue until neutrophil recovery (ANC >0.5 ×10⁹/L) AND afebrile for 48h AND clinically well. Stopping early risks rebound bacteraemia.","Antifungal prophylaxis failure: fluconazole prophylaxis (standard in AML) does not cover moulds (Aspergillus). Consider posaconazole prophylaxis in high-risk patients (AML induction, GVHD).","Voriconazole drug interactions: strong CYP2C19 inhibitor — significant interactions with many ICU drugs including tacrolimus, ciclosporin, midazolam, fentanyl. Check all drug interactions before prescribing.","G-CSF in established neutropenic septic shock: ASCO guidelines do not recommend routine G-CSF for established febrile neutropenia. May be considered if prolonged profound neutropenia with life-threatening infection — discuss with haematology."]
  },
{
    id:86, title:"Herpes Encephalitis — Diagnosis & Aciclovir Management", domain:"Special Infections", difficulty:"Medium",
    stem:`44F, previously healthy. Five days of progressive headache, fever, and behavioural change — disinhibition, aggression. Now acutely confused.

ICU ADMISSION:
• GCS 11 (E3V3M5) | HR 104 | BP 142/88 | Temp 38.8°C | RR 20
• Disoriented | Agitated | Recent-onset focal seizures (right-sided)

CT head: subtle left temporal lobe low density — no mass effect, no haemorrhage
EEG: focal left temporal periodic lateralised discharges (PLEDs)
LP: WBC 88 (lymphocytes predominantly) | RBC 22 | Protein 1.2 g/L | Glucose 3.2 (serum 5.8)
CSF HSV PCR: pending`,
    progressive_data:["IV aciclovir 10 mg/kg TDS started empirically (while HSV PCR pending).","CSF HSV-1 PCR: POSITIVE. Aciclovir continued. MRI brain now available: left temporal T2 hyperintensity + restricted diffusion.","Day 5 on aciclovir: GCS improving 11→13. Seizures controlled on levetiracetam. Renal function: Cr 1.8 (baseline 0.9).","Day 14: aciclovir course completed. GCS 15. However residual memory impairment and word-finding difficulties noted."],
    key_probes:["Clinical triad of herpes encephalitis — and why the temporal lobe specifically?","CSF findings in HSV encephalitis — what do you expect and what does a normal LP not exclude?","Empirical aciclovir — when do you start it and how do you dose it?","Aciclovir nephrotoxicity — mechanism, prevention, and management.","HSV encephalitis outcomes — what neurological sequelae does the patient and family need to know about?"],
    pearls:["HSV encephalitis triad: fever + headache + altered consciousness/behaviour. Temporal lobe predilection: HSV-1 reactivates in trigeminal ganglion — retrograde spread to temporal lobe and limbic system. Behavioural change, memory impairment, olfactory hallucinations are classic.","CSF in HSV encephalitis: lymphocytic pleocytosis (10–500 cells), elevated protein, normal or mildly low glucose, RBCs (haemorrhagic component). Normal LP does NOT exclude HSV — PCR may still be positive. Treat empirically if clinical suspicion is high.","Aciclovir dosing: 10 mg/kg TDS IV. Adjust for renal function (eGFR <50 — reduce dose). Infuse over 1 hour in 100 mL NaCl. Adequate hydration mandatory.","Aciclovir nephrotoxicity: tubular crystallisation of aciclovir in dehydrated patients — causes AKI. Prevention: ensure adequate hydration (1–1.5 mL/kg/h urine output), pre-hydrate before each dose, avoid NSAIDs."],
    pitfalls:["Waiting for PCR result before starting aciclovir: HSV encephalitis mortality without treatment is 70%. Start aciclovir empirically for all suspected cases while awaiting PCR. PCR may be negative in first 24–72h — repeat LP if initial PCR negative and clinical suspicion remains high.","Duration of aciclovir: minimum 14 days (some guidelines 21 days for severe disease). Stopping at 10 days increases relapse risk.","Missing autoimmune encephalitis: NMDA receptor encephalitis and other autoimmune encephalitides present identically to HSV encephalitis. Send autoimmune encephalitis antibody panel from CSF and serum. If HSV PCR negative and not responding to aciclovir, consider autoimmune aetiology.","Oral valaciclovir step-down: after 14–21 days IV aciclovir, step-down to oral valaciclovir 1g TDS for 3 months reduces relapse. Discuss with neurology/infectious diseases."]
  },
{
    id:87, title:"Clostridium difficile — Severe & Fulminant Colitis in ICU", domain:"Special Infections", difficulty:"Medium",
    stem:`74F, admitted 2 weeks ago for total hip replacement. Received cefuroxime perioperative prophylaxis + co-amoxiclav for wound infection Day 5. Now Day 14.

NEW CONCERN:
• Eight loose watery stools/day for 3 days
• Abdomen: distending, diffuse tenderness, absent bowel sounds
• HR 118 | BP 88/52 (MAP 63) | Temp 38.8°C | GCS 14
• WBC 38 | Cr 2.8 (baseline 1.0) | Albumin 20 g/L | Lactate 3.8

CT abdomen: pancolitis, colonic wall thickening, pericolic fat stranding, free fluid. No perforation.
C. difficile toxin A/B: POSITIVE`,
    progressive_data:["Fulminant C. difficile diagnosed. Oral vancomycin 500mg QDS + IV metronidazole 500mg TDS started. All other antibiotics stopped.","24h: WBC 44 (rising), abdomen worsening, increasing distension. MAP 56 on norad 0.3 mcg/kg/min.","Surgical review: total colectomy offered. High operative risk (age 74, albumin 20, AKI). Family meeting.","Fidaxomicin considered — unavailable. Faecal microbiota transplant (FMT) discussed as salvage."],
    key_probes:["C. difficile severity classification — what defines severe vs fulminant disease?","Fulminant C. difficile treatment — what regimen and why does the route of administration matter?","When do you call the surgeons and what operation do they perform?","Fidaxomicin vs vancomycin — when is fidaxomicin preferred and what is the evidence?","FMT in recurrent/refractory C. difficile — mechanism and evidence base."],
    pearls:["C. difficile severity: severe = WBC >15 or Cr >1.5× baseline or albumin <30 g/L. Fulminant = hypotension, shock, ileus, megacolon. Fulminant mortality 40–80%.","Fulminant C. difficile treatment: oral vancomycin 500mg QDS (high dose) + IV metronidazole 500mg TDS. If ileus present — vancomycin enemas (500mg in 100 mL saline via rectal tube) since oral vancomycin may not reach affected colon. IV metronidazole achieves therapeutic levels in inflamed colonic wall.","Surgical indications: clinical deterioration despite maximal medical therapy, WBC >50, lactate >5, toxic megacolon, perforation. Total abdominal colectomy with end ileostomy is standard. Loop ileostomy with colonic lavage (vancomycin) — emerging alternative with lower mortality in selected centres.","FMT: restores healthy gut microbiome. Superior to vancomycin for recurrent C. difficile (90% cure rate vs 30–40% with antibiotics). Evidence: multiple RCTs. Mode: colonoscopy, enema, or capsule."],
    pitfalls:["Antiperistaltic agents (loperamide) in C. difficile: contraindicated — worsen toxin retention and precipitate toxic megacolon.","Continuing broad-spectrum antibiotics in C. difficile: every day of continued antibiotics perpetuates C. difficile. Stop all non-essential antibiotics — if active infection requiring antibiotics, choose agents with minimal C. difficile risk (aminoglycosides, glycopeptides).","Rectal vancomycin without IV metronidazole: in fulminant disease, IV metronidazole is required — it provides additional coverage via colonic wall penetration when oral/rectal route is inadequate.","Missing toxic megacolon: colonic diameter >6 cm on abdominal X-ray or CT = toxic megacolon. Emergency surgical consultation. Antiperistaltics, opioids, and NSAIDs all precipitate it."]
  },
{
    id:88, title:"Immunosuppressed Patient — Risk Stratification & Empirical Treatment", domain:"Special Infections", difficulty:"High",
    stem:`62M, renal transplant (8 years), on tacrolimus + mycophenolate + prednisolone. Admitted with 2 weeks worsening headache, fever, and confusion.

ICU ADMISSION:
• GCS 12 | HR 108 | BP 118/72 | Temp 38.4°C | RR 22 | SpO2 95% on 3L
• Meningism present | Photophobia | No focal neurology
• No rash

LP:
• Opening pressure 38 cmH2O (elevated)
• WBC 22 (lymphocytes) | Protein 1.4 g/L | Glucose 2.1 (serum 6.2)
• India ink: positive (encapsulated yeast seen)
• Cryptococcal antigen (CSF): titre 1:2048`,
    progressive_data:["Cryptococcal meningitis confirmed. Liposomal amphotericin B 3 mg/kg/day + flucytosine 25 mg/kg QDS started (induction).","Day 3: LP for pressure monitoring — opening pressure 42 cmH2O. Worsening headache and visual blurring.","Therapeutic LP: 30 mL CSF removed. Opening pressure falls 42→22 cmH2O. Headache improving.","Day 14: cryptococcal antigen titre falling 1:2048→1:256. Switching to consolidation: fluconazole 400mg OD for 8 weeks."],
    key_probes:["Cryptococcal meningitis in transplant patients — how does it differ from HIV-associated cryptococcal meningitis?","Induction regimen for cryptococcal meningitis — which agents, doses, and duration?","Raised ICP in cryptococcal meningitis — mechanism and how do you manage it?","Flucytosine monitoring — what are the toxicities and what do you monitor?","Immune reconstitution in transplant patients — do you reduce immunosuppression and when?"],
    pearls:["Cryptococcal meningitis in transplant: CD4 not useful (patient not HIV). Risk = degree of immunosuppression. Presentation more subacute. Mortality higher than HIV-associated in some series due to inability to restore immunity fully.","Induction therapy: liposomal amphotericin B 3–4 mg/kg/day + flucytosine 25 mg/kg QDS for 2 weeks. Then consolidation: fluconazole 400mg OD for 8 weeks. Then maintenance: fluconazole 200mg OD for 6–12 months (or until immunosuppression reduced).","Raised ICP in cryptococcal meningitis: cryptococci in subarachnoid space impair CSF reabsorption. ICP >25 cmH2O = therapeutic LP (remove up to 30 mL). If persistent — lumbar drain. Acetazolamide and mannitol are ineffective. VP shunt for refractory cases.","Flucytosine toxicity: bone marrow suppression (thrombocytopenia, leucopenia), hepatotoxicity, GI. Monitor FBC and LFTs twice weekly. Target flucytosine level: peak 50–100 mg/L. Reduce dose in renal impairment."],
    pitfalls:["Fluconazole monotherapy for induction: inferior to amphotericin B + flucytosine — higher mortality in RCTs. Reserve fluconazole for consolidation/maintenance, not induction.","Steroids for cryptococcal meningitis: CONTRAINDICATED — worsen outcomes in HIV-associated disease. Dexamethasone trial in cryptococcal meningitis (ASTRO-CM) showed increased mortality and disability.","ART timing in HIV-cryptococcal meningitis: delay ART 4–8 weeks after starting antifungal therapy — IRIS causes fatal cerebral oedema. TIMING trial confirmed this delay improves outcomes.","Reducing immunosuppression in transplant with cryptococcal meningitis: reduce mycophenolate and tacrolimus cautiously — aggressive reduction triggers rejection. Balance infection control with graft function. Discuss with transplant team."]
  },
{
    id:89, title:"Sepsis in Pregnancy — CAMTS & Maternal Critical Care", domain:"Special Infections", difficulty:"High",
    stem:`26F, 34 weeks gestation. G2P1. Three days fever, dysuria, loin pain. Found collapsed at home.

MATERNITY UNIT → ICU TRANSFER:
• GCS 12 | HR 144 | BP 72/38 (MAP 49) | RR 32 | Temp 40.1°C
• SpO2 88% on 15L NRB | Fundal height consistent with 34 weeks | Fetal HR 182 bpm (tachycardia)
• Rigors | Loin tenderness bilaterally | Urine: offensive, cloudy

LABS:
• WBC 24 | CRP 380 | PCT 28 | Lactate 5.8
• Cr 1.8 (normal in pregnancy: upper limit 0.7) | Na 134 | K+ 3.1
• Blood cultures ×2, urine MC&S taken`,
    progressive_data:["Diagnosis: severe pyelonephritis with urosepsis. Ceftriaxone 2g IV started. Norad commenced. OB review immediately.","4h: Fetal HR 168 bpm (improving). MAP 65. Contractions noted on CTG — preterm labour?","Emergency USS: no evidence of renal abscess. Normal fetal anatomy. Normal liquor volume. Betamethasone given (fetal lung maturity).","Day 2: Urine culture: E.coli ESBL-producing. Antimicrobial de-escalation — switched to meropenem. Contractions settling."],
    key_probes:["Sepsis in pregnancy — what physiological changes make assessment difficult and what parameters are unreliable?","Antibiotics in pregnancy — what is safe, what is contraindicated, and why does ESBL E.coli matter here?","Vasopressors in pregnancy — which ones are safe and what is the effect on uteroplacental blood flow?","Fetal monitoring in maternal ICU — what is the minimum standard and when do you deliver?","Betamethasone in preterm labour from maternal sepsis — why and what is the timing?"],
    pearls:["Physiological changes in pregnancy affecting sepsis assessment: increased HR (baseline 80–100 normal), decreased BP (MAP drops in second trimester), increased RR, increased WBC up to 16. Lactate thresholds and BP criteria remain valid but normal values shift.","Safe antibiotics in pregnancy: beta-lactams (penicillins, cephalosporins, carbapenems) — safe throughout. Metronidazole — avoid first trimester (teratogenic in animals, used with caution). Aminoglycosides — avoid (neonatal ototoxicity). Tetracyclines, fluoroquinolones — contraindicated.","Vasopressors in pregnancy: noradrenaline — preferred (maintains uteroplacental blood flow, less vasoconstriction than vasopressin). Vasopressin — used cautiously (oxytocic effects, can cause uterine contractions). Phenylephrine — used in obstetric anaesthesia but can reduce CO.","Delivery in maternal sepsis: delivery is sometimes the best treatment for fetal and maternal compromise (source control). Indications: fetal distress not resolving, chorioamnionitis (intra-amniotic infection), placental abruption from sepsis, maternal haemodynamic compromise not responding to treatment."],
    pitfalls:["Delaying antibiotics in septic pregnant patient: maternal sepsis is a leading cause of maternal mortality. Same 1-hour antibiotic target as non-pregnant sepsis. Fetal wellbeing depends on maternal stabilisation.","Tetracyclines and fluoroquinolones in pregnancy: both cause fetal musculoskeletal abnormalities and are contraindicated. Do not use empirically even when ESBL is suspected.","ESBL E.coli and cephalosporins: ceftriaxone may be empirically appropriate for suspected pyelonephritis but ESBL organisms are resistant. Switch to carbapenem when ESBL confirmed.","Prone positioning in severe ARDS in pregnancy: possible before 20–23 weeks (small uterus). Increasingly difficult as pregnancy advances. Modified prone (wedged lateral) may be attempted. If after 24 weeks — delivery often required to safely manage severe ARDS."]
  },
{
    id:90, title:"Tetanus — Diagnosis, Autonomic Storm & ICU Management", domain:"Special Infections", difficulty:"High",
    stem:`45M, unvaccinated, from rural area. Penetrating foot injury 10 days ago — cleaned at home, not seen by doctor. Now presenting with jaw stiffness, difficulty swallowing, and back pain.

ED ARRIVAL:
• GCS 14 | HR 112 | BP 158/98 | RR 22 | Temp 37.8°C
• Trismus (cannot open jaw >1 cm) | Sardonic smile (risus sardonicus)
• Opisthotonos on stimulation | Generalised hyperreflexia | Intact consciousness

No laboratory test confirms tetanus — clinical diagnosis.`,
    progressive_data:["Tetanus confirmed clinically. Human tetanus immunoglobulin (HTIG) 3000–6000 units IM given. Wound debridement performed. Metronidazole 400mg TDS started.","Day 2: severe generalised spasms — triggered by any stimulus. SpO2 falling during spasms to 82%. Intubation required.","Post-intubation Day 3: autonomic storm developing — HR fluctuating 48 to 188, BP 68/40 to 220/118 within minutes.","Day 10: spasms decreasing. Autonomic instability improving. Weaning from ventilator beginning."],
    key_probes:["Tetanus pathophysiology — what toxin, what is its mechanism, and why does it cause spasms?","Immediate management priorities — in order. What does HTIG do at this stage of illness?","Trismus + opisthotonos — you need to intubate. How and why is airway management specifically hazardous?","Autonomic storm in tetanus — mechanism and management. What agents do you use?","Tetanus is a clinical diagnosis — what conditions must you exclude before confirming it?"],
    pearls:["Tetanus toxin (tetanospasmin): produced by Clostridium tetani, travels retrogradely along motor neurons, crosses spinal cord synapses, blocks release of inhibitory neurotransmitters (GABA, glycine) → unopposed motor neuron activity → sustained muscle contraction (spasms) + autonomic dysregulation.","Management sequence: (1) HTIG 3000–6000 units IM (neutralises unbound toxin only — cannot reverse bound toxin); (2) metronidazole 400mg TDS for 7–10 days (kills C. tetani); (3) wound debridement; (4) benzodiazepines for spasm control; (5) magnesium sulphate infusion for autonomic storm; (6) intubation if spasms compromise airway.","RSI hazards in tetanus: laryngospasm can be precipitated by any stimulation during intubation. Succinylcholine — use with care (hyperkalaemia risk if prolonged muscle spasms). Intubate in quiet, dark environment, deep sedation before laryngoscopy. Have surgical airway immediately available.","Autonomic storm management: morphine infusion (central sympatholysis), magnesium sulphate infusion (target Mg 2–4 mmol/L — reduces neurotransmitter release), labetalol (alpha + beta blockade). Avoid pure beta-blockers — can unmask alpha-driven hypertensive crisis."],
    pitfalls:["HTIG given late: once tetanospasmin is bound to nerve terminals, HTIG cannot reverse it. HTIG only neutralises circulating unbound toxin. Still give — prevents further toxin binding.","Succinylcholine in prolonged tetanus: after several days of sustained muscle spasms, denervation hypersensitivity and upregulation of extrajunctional ACh receptors → succinylcholine causes hyperkalaemia → cardiac arrest. Use rocuronium.","Penicillin for tetanus: metronidazole is preferred over penicillin — penicillin acts as a GABA antagonist (same mechanism as tetanus toxin) and may worsen spasms.","Tetanus vaccination post-recovery: having tetanus does NOT confer immunity (the toxin dose causing disease is sub-immunogenic). Vaccinate with tetanus toxoid during recovery — full 3-dose course."]
  },
{
    id:91, title:"Ventilator Weaning — Systematic Assessment & SBT Protocol", domain:"Weaning & Rehabilitation", difficulty:"Medium",
    stem:`58M, day 12 ICU following severe pneumonia with septic shock. Now haemodynamically stable, infection treated, FiO2 requirement reducing.

CURRENT STATUS:
• PSV 10 | PEEP 6 | FiO2 0.35 | RR 18 | VT 520 mL | P/F 218
• MAP 78 on no vasopressors | HR 88 | GCS 15 | RASS -1
• Hb 9.2 | Na 138 | K+ 4.1 | pH 7.40 | PaCO2 42
• Cough: adequate | Secretions: moderate, 2-hourly suction
• MRC sum score: 42/60`,
    progressive_data:["SBT on T-piece 30 min: RR 28, SpO2 93%, HR 104, VT 310 mL. RSBI 90. Stopped at 20 min — clinical distress.","Echo during failed SBT: new B-lines, E/e' 18 (was 12 at rest). BNP 680 pg/mL.","IV furosemide 40mg given. Repeat SBT 48h later: passes at 30 min. RSBI 68. Extubated.","Post-extubation 2h: stridor developing. SpO2 92%. Cuff leak test had shown no leak pre-extubation."],
    key_probes:["Readiness-to-wean criteria — list them systematically. Which does this patient meet?","RSBI 90 on a failed SBT — interpret this and what are the causes of SBT failure you need to address?","Echo during SBT: new B-lines, E/e' 18 — mechanism of cardiac weaning failure and management.","Post-extubation stridor — your stepwise management and when do you re-intubate?","Tracheostomy timing — this patient has failed two SBTs. When and why do you consider it?"],
    pearls:["Readiness-to-wean criteria: (1) cause of respiratory failure resolving; (2) FiO2 ≤0.4, PEEP ≤8; (3) haemodynamically stable off or low vasopressors; (4) GCS adequate (able to follow commands); (5) cough/secretion management adequate.","RSBI (f/VT): <105 predicts SBT success. Must be measured on T-piece or minimal support (CPAP 5/0) — not on PSV. RSBI 90 is reassuring but alone insufficient — clinical assessment during SBT is mandatory.","Cardiac weaning failure: SBT increases venous return → raises LVEDP in patients with diastolic dysfunction → pulmonary oedema → hypoxia → failure. New B-lines + rising E/e' = cardiac cause. Treat with diuresis 24–48h before next SBT.","Post-extubation stridor management: (1) nebulised adrenaline 5mg; (2) IV dexamethasone 8mg; (3) HFNC or heliox; (4) re-intubate if deteriorating — do not wait until SpO2 crashes."],
    pitfalls:["RSBI measured on PSV: falsely low — ventilator support reduces respiratory work. Always measure on T-piece or CPAP 5/0 for a valid RSBI.","Attributing all SBT failure to pulmonary cause: cardiac failure, diaphragm weakness, neurological causes, and pain/anxiety all cause SBT failure. Systematic assessment needed.","Extubating a patient with failed cuff leak test without prophylactic steroids: high stridor risk — give methylprednisolone 20mg IV 12-hourly starting 12h before extubation.","Tracheostomy timing: no rigid rule but generally consider after 7–14 days of failed weaning with ongoing ventilation predicted. Earlier in anticipated prolonged weaning (neurological, obesity, high spinal cord injury)."]
  },
{
    id:92, title:"ICU-Acquired Weakness — Assessment, Prevention & Rehabilitation", domain:"Weaning & Rehabilitation", difficulty:"Medium",
    stem:`52F, severe COVID-19 ARDS — 28 days ICU. Received NMBA ×10 days, prone positioning ×8 sessions, high-dose corticosteroids. Now attempting to wean.

CURRENT STATUS:
• Tracheostomy in situ (Day 18)
• Tolerating 4-hour T-piece trials but failing longer trials
• MRC sum score: 26/60 (severe weakness)
• CAM-ICU: positive (fluctuating)
• Unable to lift arms against gravity | Cannot stand

NERVE CONDUCTION STUDY (Day 25):
• Reduced CMAP bilaterally | Normal conduction velocities | Normal SNAP
• No denervation potentials on EMG`,
    progressive_data:["Physiotherapy: passive ROM commenced early. Active assisted exercises starting. Patient cooperative for 10-min sessions.","Nutrition review: cumulative caloric deficit -18,000 kcal. Albumin 19 g/L. Phosphate 0.52 mmol/L.","Day 32: tolerating 8-hour T-piece. MRC improving to 32/60. Cognitive testing: moderate impairment (MoCA 17/30).","Day 40: MRC 40/60. Tolerating 16-hour T-piece. Decannulation planning."],
    key_probes:["NCS/EMG findings — what is the diagnosis and how does CIM differ from CIN electrically?","Risk factors for ICUAW in this patient — list them and which are modifiable?","Nutritional rehabilitation in ICUAW — refeeding syndrome risk and how do you avoid it?","PICS — define the three domains and what early interventions reduce its incidence?","Decannulation criteria for a tracheostomised ICUAW patient — what specifically are you assessing?"],
    pearls:["CIM (critical illness myopathy): reduced CMAP bilaterally, normal conduction velocities, normal SNAP. EMG: early absence of voluntary motor unit potentials, later myopathic changes. CIN (critical illness neuropathy): reduced CMAP AND SNAP, slowed conduction velocities. CIM has better prognosis (muscle regenerates) vs CIN (axonal damage).","ICUAW risk factors: prolonged mechanical ventilation, NMBA, corticosteroids, sepsis, immobility, hyperglycaemia, malnutrition. Modifiable: early mobilisation, minimise NMBA duration, tight glycaemic control, adequate nutrition.","Refeeding syndrome: phosphate, potassium, and magnesium shift intracellularly with refeeding after starvation → arrhythmias, respiratory weakness, encephalopathy. Prevention: start at 50% caloric target, replace electrolytes aggressively, increase slowly over 3–5 days.","PICS domains: (1) Physical — weakness, fatigue, pain, dysphagia; (2) Cognitive — memory impairment, executive dysfunction, delirium; (3) Psychological — PTSD, depression, anxiety. ICU diary, early mobilisation, family engagement, post-ICU follow-up reduce incidence."],
    pitfalls:["NMBA and ICUAW: every day of NMBA increases ICUAW risk. Assess daily — wean as soon as dyssynchrony controlled and DP acceptable. Document reason for continuation.","Early mobilisation — when is it safe: sit out of bed when haemodynamics stable, FiO2 <0.6, PEEP ≤10, cooperative patient, no unsafe lines or drains. Ventilated patients CAN be mobilised — no contraindication to early physiotherapy on the ventilator.","Passive physiotherapy alone insufficient: passive ROM prevents contractures but does not build muscle. Active assisted and active exercises as soon as patient can cooperate are essential.","ICU discharge planning without follow-up: all severe ICUAW patients should have structured rehabilitation programme, post-ICU follow-up at 3 and 12 months, psychological support referral."]
  },
{
    id:93, title:"Delirium in ICU — ABCDE Bundle & Prevention", domain:"Weaning & Rehabilitation", difficulty:"Medium",
    stem:`66M, post-emergency laparotomy (perforated sigmoid colon). Day 5 ICU. Sedation being lightened — propofol infusion reducing.

NURSING CONCERN:
• Patient pulling at lines and ETT | Climbing out of bed at 2am
• Not recognising family | Responding to unseen stimuli
• CAM-ICU: positive | RASS +2 (agitated)

HISTORY: known alcohol dependence (2 bottles wine/day), hearing impairment, no prior cognitive impairment. Last drink: Day 0 of admission.`,
    progressive_data:["Risk factors identified: alcohol withdrawal, sensory deprivation, sleep fragmentation, immobility, constipation, pain inadequately managed.","Haloperidol 5mg IV given. Agitation partially controlled. Team asking about regular haloperidol prescription.","Alcohol withdrawal protocol started: CIWA-Ar scoring, IV lorazepam per protocol. Thiamine 500mg TDS IV.","Day 8: CAM-ICU negative. More oriented. Attempting extubation — passes SBT. Extubated successfully."],
    key_probes:["Delirium risk factors in this patient — list them and which are modifiable?","CAM-ICU — what four features does it assess and what constitutes a positive result?","Haloperidol for ICU delirium — what does the MIND-USA trial say?","Alcohol withdrawal in ICU — how do you assess severity and what is the specific treatment?","The ABCDE bundle — what are the components and what evidence supports it?"],
    pearls:["Delirium risk factors: age, prior cognitive impairment, sensory impairment, sleep deprivation, immobility, pain, constipation, dehydration, polypharmacy (benzodiazepines, anticholinergics, opioids), alcohol withdrawal, metabolic disturbance.","CAM-ICU: (1) Acute onset or fluctuating mental status; (2) Inattention; (3) Altered level of consciousness; (4) Disorganised thinking. Positive if (1) + (2) + either (3) or (4). Takes <2 minutes to perform.","MIND-USA trial: haloperidol and ziprasidone vs placebo — no difference in days alive without delirium or coma. Antipsychotics do NOT reduce delirium duration in ICU. Use for symptom management (agitation, distress) only, not prophylaxis.","ABCDE bundle: A = Awakening trials (daily SAT); B = Breathing trials (daily SBT); C = Coordination of SAT-SBT; D = Delirium assessment (CAM-ICU); E = Early mobility and exercise. RCT evidence shows ABCDE bundle reduces delirium prevalence, ventilator days, and ICU LOS."],
    pitfalls:["Benzodiazepines for ICU delirium (non-withdrawal): worsen and prolong delirium. Use only for alcohol withdrawal (CIWA-Ar protocol) or seizures.","Physical restraints for delirious patients: increase agitation, cause injury, worsen delirium, and reduce dignity. Avoid — use de-escalation, reorientation, and appropriate sedation adjustment.","Missing alcohol withdrawal delirium tremens: seizures and DT typically occur 24–72h after last drink. Untreated DT has 15–20% mortality. CIWA-Ar score ≥15 = IV benzodiazepine protocol + thiamine mandatory.","Sleep hygiene in ICU: noise, light, and unnecessary interventions fragment sleep. Cluster care, dim lights at night, ear plugs/eye masks reduce delirium incidence. Simple and evidence-based."]
  },
{
    id:94, title:"Chronic Critical Illness — Goals of Care & Futility", domain:"Weaning & Rehabilitation", difficulty:"High",
    stem:`74M, COPD Gold IV, previous stroke with residual dysphasia, T2DM. Admitted 6 weeks ago with severe pneumonia requiring intubation.

CURRENT STATUS:
• Tracheostomy (Day 18) | Tolerating 2-hour T-piece trials only after 6 weeks
• MRC sum score: 18/60 (profound weakness)
• GCS 12 (E4V2M6) — likely related to prior stroke + CCI
• Tube-fed | 4-hourly tracheal suction | Multiple ICU complications: VAP ×2, C. difficile, AKI
• Family: two adult children. Wife died 2 years ago. No advance directive.`,
    progressive_data:["MDT meeting: physiotherapy, nursing, speech therapy, dietitian, ICU consultant, palliative care. Consensus: CCI — extremely unlikely to wean from ventilatory support.","Family meeting: children asked 'what would dad want?' — no clear prior expressed wishes. One son wants 'everything continued', one son wants to 'let him go peacefully'.","Palliative care consultation: symptom management plan developed. Family given time.","3 weeks later: MRC unchanged at 18/60. Still on tracheostomy. Family reaching consensus. WLST discussion."],
    key_probes:["Define chronic critical illness — what are the diagnostic criteria and what does the trajectory tell you?","Futility — is it a medical or ethical concept? How do you approach a family who disagree about WLST?","Disagreement between family members about goals of care — your role and the legal framework.","WLST process — what does it involve and what is the ethical basis?","Palliative care in ICU — what specific symptom management principles apply to WLST?"],
    pearls:["Chronic critical illness (CCI): prolonged mechanical ventilation (>21 days) with ongoing critical illness. Features: profound weakness, cognitive impairment, endocrine dysfunction, immune dysregulation. 1-year mortality >50%. Most survivors never return to pre-ICU functional status.","Futility — two types: quantitative futility (treatment has <1% chance of achieving goal) and qualitative futility (treatment achieves physiological goal but not a goal the patient would value — e.g. survival in permanent vegetative state). Qualitative futility = values-based, not purely medical.","Surrogate decision-making: in the absence of advance directive, next-of-kin makes decisions based on 'substituted judgement' — 'what would the patient want?' not 'what do you want for the patient?'. Disagreement between surrogates requires facilitation, ethics consultation if necessary.","WLST: legally and ethically equivalent to not starting treatment. The doctor's duty is to act in the patient's best interest. Providing burdensome treatment with no prospect of benefit can itself be unethical. WLST is the withdrawal of treatment that is no longer in the patient's interest — it is not ending life."],
    pitfalls:["Continuing futile treatment due to family pressure: the decision to continue or withdraw treatment is a clinical and ethical one — not determined solely by family wishes. The patient's best interests are paramount. Family agreement is sought but not required for WLST.","Abandoning the patient at WLST: WLST is not 'doing nothing'. Switch the goal to comfort. Ensure: adequate analgesia (morphine), anxiolytics (midazolam), anticholinergics for secretions (hyoscine), remove monitoring that does not guide symptom management, family present if wished.","Documenting WLST: document the clinical reasoning, the MDT discussion, the family meeting content, the decision made and by whom, and the symptom management plan. Inadequate documentation is a significant medicolegal risk.","Not involving palliative care early: palliative care is not 'giving up' — it is expert symptom management and communication. Early referral, not just at end of life."]
  },
{
    id:95, title:"Post-ICU Syndrome — Follow-Up & Long-Term Outcomes", domain:"Weaning & Rehabilitation", difficulty:"Medium",
    stem:`48F, previously healthy IT professional. Admitted 3 months ago with severe septic shock (biliary source) requiring 28 days ICU. Intubated for 22 days, tracheostomy, multiple organ support.

FOLLOWED UP AT 3-MONTH POST-ICU CLINIC:
• Physical: still unable to return to work. Fatigue on minimal exertion. Grip strength 60% predicted.
• Cognitive: difficulties with concentration, memory, and multitasking. Struggling with complex work tasks.
• Psychological: nightmares about ICU, avoidance of hospitals, hypervigilance. PHQ-9: 18 (moderate-severe depression). PCL-5: 42 (probable PTSD).
• Sleep: severe insomnia, nocturnal hyperhidrosis.`,
    progressive_data:["PTSD screening positive. Referred to clinical psychology. CBT with trauma focus initiated.","Cognitive assessment: MoCA 24/30 (mild impairment). Neuropsychology referral: executive function testing.","6-month review: physical function improving (returning to part-time work). Depression improving with SSRI. PTSD symptoms persisting.","12-month review: near-full physical recovery. Cognitive function normalised on testing. PTSD in remission with CBT. Returned to full-time work."],
    key_probes:["PICS — define the three domains and what specific problems does this patient have in each?","What is the incidence of PTSD after ICU admission and what are the risk factors?","ICU diaries — what are they, what is the evidence, and how do they reduce PICS?","What screening tools are used for depression and PTSD in post-ICU follow-up?","What interventions in ICU reduce the incidence and severity of PICS?"],
    pearls:["PICS incidence: physical impairment 25–80%, cognitive impairment 30–80%, psychological problems (PTSD 10–50%, depression 30%, anxiety 30%) depending on population and time of assessment. All three domains often co-occur.","PTSD risk factors post-ICU: memories of frightening experiences during ICU (delusional memories, nightmares, hallucinations), inability to communicate while intubated, use of benzodiazepines (impair memory consolidation, increase delusional memories), female sex, pre-existing anxiety.","ICU diary: written account of ICU stay by staff and family, with photographs. Given to patient at follow-up. Evidence: Jones et al. (2010) RCT — ICU diary reduced PTSD incidence at 3 months from 13% to 5%. Mechanism: fills memory gaps with factual narrative, reduces delusional memories.","Screening tools: PHQ-9 (depression, score ≥10 = screen positive), PCL-5 (PTSD, score ≥31–33 = probable PTSD), MoCA (cognitive screening, ≤25 = impairment). Should be administered at 3 and 12 months post-ICU."],
    pitfalls:["Attributing all post-ICU symptoms to psychiatric illness: new cognitive impairment may have organic causes — MRI brain (microstructural changes, small infarcts), hypothyroidism, B12 deficiency. Always exclude reversible causes.","Not addressing ICU-acquired cognitive impairment in working-age patients: cognitive impairment can prevent return to complex work. Neuropsychology referral and workplace adjustments may be needed.","Dismissing PTSD as 'just stress': PTSD is a neurobiological disorder with structural brain changes. It requires evidence-based treatment (trauma-focused CBT, EMDR). Untreated PTSD has high morbidity and suicide risk.","Family PICS: family members of ICU patients also develop PTSD, depression, and complicated grief — especially if WLST decisions were made. Family needs are often unaddressed. Post-ICU follow-up should include family."]
  },
{
    id:96, title:"Tracheostomy — Timing, Complications & Decannulation", domain:"Weaning & Rehabilitation", difficulty:"Medium",
    stem:`62M, GBS (Guillain-Barré syndrome) — intubated Day 4 of admission (FVC <15 mL/kg). Day 18 — autonomic instability settling but neuromuscular weakness persisting. Neurology predicts 6–12 weeks to recover sufficient respiratory function for extubation.

CURRENT STATUS:
• Still ventilated (PSV 10, PEEP 5, FiO2 0.30) | RR 18 | VT 480 mL
• MRC sum score: 22/60 | Power: arms 1–2/5, legs 0/5
• GCS 15 | Communicating by eye-blinking code
• Repeated attempts to wean: all fail within 30 min (fatigue, tachypnoea)`,
    progressive_data:["Tracheostomy performed Day 19 (PDT — percutaneous dilational, by trained ICU team at bedside).","Post-tracheostomy: improved patient comfort, less sedation required. Speaking valve trial started Day 25.","Day 40: MRC 36/60. Tolerating 12-hour T-piece. Speaking normally with Passy-Muir valve.","Day 52: SLT assessment — safe swallow. UO >0.5 mL/kg/h. Tolerating 22-hour T-piece. Decannulation performed."],
    key_probes:["Timing of tracheostomy in GBS — when and what is the evidence for early vs late tracheostomy?","PDT (percutaneous dilational tracheostomy) vs surgical tracheostomy — advantages and contraindications to PDT.","Tracheostomy complications — early and late. Which is most immediately life-threatening?","Speaking valve (Passy-Muir) — mechanism and prerequisites before use.","Decannulation criteria — what specific assessments must be completed before you remove the tracheostomy?"],
    pearls:["Tracheostomy timing: TracMan trial — early (Day 1–4) vs late (>10 days) tracheostomy: no mortality difference. Early tracheostomy reduces sedation requirements, ICU LOS, and ventilator-associated complications in prolonged ventilation. In GBS with predicted prolonged weaning (>2 weeks): early tracheostomy improves comfort and rehabilitation.","PDT contraindications: (1) unable to extend neck; (2) obese neck with impalpable landmarks; (3) coagulopathy (INR >1.5, Plt <50); (4) previous neck surgery or tracheostomy; (5) active neck infection; (6) surgical airway emergency (use surgical in emergency).","Life-threatening tracheostomy complications: early — surgical emphysema, bleeding (innominate artery if too deep), false passage; late — tracheostomy dislodgement (most dangerous — do NOT attempt blind reinsertion, use laryngoscope or fibrescope). ALL tracheostomy patients need a 'tracheostomy emergency box' at bedside.","Decannulation criteria: (1) passing extended T-piece trial (16–22h); (2) adequate cough and secretion management; (3) safe swallow (SLT assessment); (4) GCS adequate for self-protection of airway; (5) patient and team ready."],
    pitfalls:["Reinserting a displaced tracheostomy blindly: if tracheostomy dislodges in first 7 days (tract not yet formed), blind reinsertion creates false passage. Oxygenate via oral airway/bag-mask, call for help, use fibrescope-guided reinsertion.","PDT in coagulopathy: high bleeding risk. Correct INR and platelets before procedure. If urgent tracheostomy needed in coagulopathic patient — surgical approach in theatre.","Decannulating without SLT assessment: silent aspiration is common in patients who have been ventilated for >2 weeks. Aspiration pneumonia risk post-decannulation is significant without swallow assessment.","Tracheostomy in obesity: increased risk of dislodgement (deep neck obscures landmarks), stomal infection, and difficult reinsertion. Use an extra-long tube (adjustable-flange). Higher threshold for PDT — consider surgical."]
  },
{
    id:97, title:"End-of-Life Care in ICU — Withdrawal of Life-Sustaining Treatment", domain:"Weaning & Rehabilitation", difficulty:"High",
    stem:`82F, advanced dementia (FAST Stage 7), resident in nursing home. Admitted with aspiration pneumonia, now requiring mechanical ventilation.

BACKGROUND:
• Advance directive: 'no resuscitation, no ICU admission' — documented 3 years ago with GP
• Family: daughter (UK) says 'she would not have wanted this'. Son (overseas) saying 'do everything — it's not her time'.
• Intubated in ED — advance directive not available at time of intubation
• ICU Day 4: not improving. APACHE II 38. Fully ventilated. No response to pain. Bilateral fixed pupils (new).

CT brain: massive bilateral ischaemic infarction.`,
    progressive_data:["Legal review: advance directive valid — properly witnessed, patient had capacity when signed, specific to this situation.","MDT meeting: consensus = continued ICU treatment is futile and contrary to patient's expressed wishes.","Son contacted by video call — remains opposed to WLST. Family meeting organised.","WLST performed. Patient died peacefully 4 hours later with daughter present."],
    key_probes:["Valid advance directive — what are the legal requirements and what is its status in clinical decision-making?","Son disagrees with WLST — legally, does he have the right to override the advance directive?","Futility in this case — how do you frame this for the family without using the word 'futile'?","WLST process — what are the steps and what is your role as the ICU consultant?","After WLST: what symptom management is mandatory and what monitoring do you continue?"],
    pearls:["Valid advance directive (UK Mental Capacity Act 2005): must be in writing, signed and witnessed, specific about the treatment refused and circumstances, made with capacity. A valid ADRT (Advance Decision to Refuse Treatment) is legally binding — doctors MUST respect it. It overrides family wishes.","Surrogate decision-making without advance directive: family does NOT have legal authority to consent or refuse treatment on behalf of an incapacitated adult in England and Wales (unlike LPA holders). Family expresses the patient's wishes (substituted judgement) — the decision rests with the medical team based on best interests.","Framing futility for families: avoid 'there is nothing more we can do' (there is always more). Instead: 'the treatments we are using are not working and are causing harm without benefit. Our duty is to focus on comfort and dignity now.' Reframe as shifting the goal, not abandoning the patient.","WLST steps: (1) document clinical reasoning; (2) MDT agreement; (3) family communication and support; (4) symptom management plan (analgesia, sedation, anticholinergics); (5) remove monitoring not guiding symptom management; (6) spiritual/cultural needs; (7) after-death care."],
    pitfalls:["Continuing treatment contrary to a valid advance directive: this is assault. The advance directive is legally binding. Document that it was not available at time of intubation — this is a common situation and does not invalidate it.","Requiring family consent for WLST: family consent is not legally required (unless they hold Lasting Power of Attorney for health). Seeking family agreement is good practice but not a legal requirement. Document all discussions.","Inadequate symptom management at WLST: WLST is not passive. The active obligation is comfort. Anticipate: pain (morphine), distress (midazolam), secretions (hyoscine butylbromide or glycopyrronium), respiratory distress (morphine titrated to comfort).","Removing all monitoring at WLST: continue monitoring that guides symptom management (SpO2 can confirm respiratory distress is treated). Remove monitoring that serves no purpose (invasive BP, CVP). The principle is purposeful de-escalation."]
  },
{
    id:98, title:"Nutrition in ICU — When, What & How Much", domain:"Weaning & Rehabilitation", difficulty:"Medium",
    stem:`54M, severe acute pancreatitis (BISAP 4). Intubated Day 2. Day 5 — haemodynamics stable, on low-dose norad 0.08 mcg/kg/min. Has received only IV fluids so far.

NUTRITIONAL STATUS:
• Pre-admission: BMI 28, no significant weight loss
• Current: nasogastric tube in situ | Bowel sounds present | Abdomen less tender
• Gastric residual volume (GRV) on first feed attempt: 450 mL at 4h
• ICU team debating: when to start, which route, how much`,
    progressive_data:["Enteral nutrition via NGT started at 20 mL/h. Prokinetics (metoclopramide) given. Residuals 80–120 mL at 4h.","Day 8: feed advancing well. 60 mL/h (1440 mL/day). Glucose 14 mmol/L on feed — insulin infusion started.","Day 10: CRP peaking, amylase falling. Enteral nutrition tolerating well. Team: protein target 1.2–1.5 g/kg/day?","Day 14: patient improving. Post-pyloric feeding tube placed for gastroparesis."],
    key_probes:["Timing of enteral nutrition in ICU — when do you start and what does CALORIES and NUTRIREA-2 tell you?","Gastric residual volume 450 mL — does this mean you stop feeding?","Enteral vs parenteral nutrition — when is PN indicated and what are the risks?","Protein targets in critical illness — what is the evidence and how does it change over the ICU stay?","Hyperglycaemia on enteral nutrition — target glucose range and what NICE-SUGAR tells you?"],
    pearls:["Enteral nutrition timing: start within 24–48h of ICU admission when haemodynamically stable (MAP >65 on stable or reducing vasopressors). NUTRIREA-2: early EN in shock on vasopressors — no mortality benefit and increased gut ischaemia risk. Withhold EN during active resuscitation phase.","GRV and feeding: GRVs up to 500 mL are acceptable if patient is tolerating and no other signs of intolerance (abdominal distension, vomiting, high aspirates). ESICM/SCCM no longer recommend routine GRV monitoring — it leads to unnecessary withholding of nutrition.","Parenteral nutrition indications: (1) EN contraindicated (high-output fistula, intestinal obstruction, gut ischaemia); (2) EN inadequate (60% target not achieved by Day 7–10). CALORIES trial: no difference in mortality between PN and EN at 30 days. Use EN first — PN when EN fails or is contraindicated.","Protein targets: acute phase (Day 1–5): 1.2–1.5 g/kg/day. Rehabilitation phase (Day 5+): 1.5–2 g/kg/day for ICUAW. Obese patients: 2 g/kg ideal body weight. ESICM 2023 guidelines support higher protein in prolonged critical illness."],
    pitfalls:["Starting PN early (Day 1–3) in a patient tolerating EN: EPaNIC trial — early PN vs late PN: late PN group had shorter ICU LOS, fewer infections, faster weaning. Reserve PN for patients in whom EN is genuinely not possible or inadequate.","NICE-SUGAR glucose target: target 6–10 mmol/L. Intensive glycaemic control (4.5–6 mmol/L) increases hypoglycaemia risk and mortality. A glucose of 10–12 is not a medical emergency requiring immediate escalation.","Overfeeding in ICU: excess calories cause hyperglycaemia, hypertriglyceridaemia, hepatic steatosis, and increased CO2 production (worsens weaning). Target 70–80% of measured or estimated energy expenditure — not 100%.","Vitamin and micronutrient supplementation: thiamine (prevent Wernicke's in all patients at risk), zinc and selenium (immune function, wound healing), vitamin C (antioxidant) — supplementation reasonable in prolonged critical illness though RCT evidence is limited."]
  },
{
    id:99, title:"ICU Scoring Systems — APACHE, SOFA & Clinical Application", domain:"Weaning & Rehabilitation", difficulty:"Medium",
    stem:`You are presenting a complex case at your departmental ICU mortality review. Three patients are being discussed:

PATIENT A: 78M, APACHE II 38, admitted with meningococcal septicaemia. Died on Day 3.
PATIENT B: 45F, APACHE II 22, admitted with severe pancreatitis. Survived after 28 days.
PATIENT C: 62M, SOFA score Day 1: 14, Day 3: 18 (rising). Septic shock, ARDS, AKI. Outcome unknown.

QUESTION FROM MEDICAL DIRECTOR:
"Our ICU standardised mortality ratio (SMR) is 1.4. What does this mean and should we be concerned?"`,
    progressive_data:["APACHE II predicted mortality for Patient A: 78%. Actual outcome: died. Was this a 'failure'?","SOFA score trajectory for Patient C: Day 1: 14, Day 3: 18. What does this rising SOFA tell you?","The MDRO (multi-drug resistant organism) rate in your ICU has risen over 6 months. How do you approach this?","A colleague asks you to explain 'Failure to Rescue' as a quality metric. How do you define it?"],
    key_probes:["APACHE II — what does it measure, what variables does it include, and what are its limitations for individual patient care?","SOFA score — how is it calculated and what does a rising SOFA score tell you about prognosis?","SMR 1.4 — what does this mean and what are the possible explanations?","How do scoring systems inform quality improvement vs individual patient prognostication?","Failure to rescue — definition and why is it a more meaningful ICU quality metric than crude mortality?"],
    pearls:["APACHE II: Acute Physiology And Chronic Health Evaluation II. 12 physiological variables (worst in first 24h) + age + chronic health. Scores 0–71. Predicts ICU mortality for populations — NOT for individual patients. SMR = observed deaths / expected deaths based on APACHE II.","SOFA score: Sequential Organ Failure Assessment. Six organ systems: respiratory (P/F), coagulation (platelets), hepatic (bilirubin), cardiovascular (vasopressors + MAP), CNS (GCS), renal (creatinine or UO). Score 0–24. Rising SOFA = organ failure accumulating = mortality increases with each additional point.","SMR 1.4: for every 100 deaths predicted by APACHE II, 140 are observed. Possible explanations: (1) case mix is sicker than predicted; (2) admission practices differ (later admissions); (3) genuine quality concerns; (4) scoring limitations. Requires case-by-case review — not automatically a quality failure.","Failure to rescue (FTR): death after a complication in a patient admitted for a condition that was not itself immediately life-threatening. FTR = ability to recognise and rescue patients from deterioration. A more sensitive quality metric than crude mortality."],
    pitfalls:["Using APACHE II for individual prognosis: 'APACHE II score is 38 — predicted mortality 80%, so we should withdraw treatment.' This is inappropriate. Scoring systems predict group outcomes, not individual outcomes. A patient with APACHE 38 still has a 20% chance of survival.","SMR interpretation without context: SMR must be interpreted alongside case mix, admission policies, and data quality. High SMR in a unit that admits all patients (including moribund referrals) may reflect appropriate care.","SOFA score timing: SOFA should be calculated daily and trended. A single SOFA score has less prognostic value than the trajectory. Rising SOFA despite treatment = poor prognosis; falling SOFA = response to treatment.","Using scores to ration ICU admission: scoring systems should not be used as gatekeeping tools for ICU admission. They are audit and research tools."]
  },
{
    id:100, title:"ICU Communication — Breaking Bad News & Family Meetings", domain:"Weaning & Rehabilitation", difficulty:"High",
    stem:`You are the ICU consultant. You have three family meetings scheduled today:

FAMILY A: Parents of 19M post-cardiac arrest. Day 5. Neuroprognostication complete — bilateral absent N20, malignant EEG, NSE 180. Poor outcome certain.

FAMILY B: Husband of 52F with severe ARDS Day 10. P/F improving slowly. She may survive but will likely have significant physical and cognitive impairment.

FAMILY C: Son of 78M with CCI — tracheostomy, Day 42, no improvement. Son is a doctor and says 'I know you're giving up on him. Just try harder'.`,
    progressive_data:["Family A meeting: parents ask 'will he wake up?' — 17-year-old sibling also present.","Family B meeting: husband breaks down crying, says 'I just need her back'. Asks about experimental treatments.","Family C meeting: the son becomes increasingly aggressive and threatens to report you to GMC.","Post-meeting debrief: your team nurse is visibly distressed. She says 'I don't know if we did the right thing with Family A'."],
    key_probes:["Family A — how do you communicate certain poor prognosis in the presence of a minor? What language do you use?","Family B — how do you give honest uncertain prognosis without removing all hope?","Family C — how do you manage an aggressive family member who is also a healthcare professional?","What is the SPIKES protocol and how do you apply it in an ICU context?","After the meetings: what is your duty of care to your distressed nursing colleague?"],
    pearls:["SPIKES protocol for breaking bad news: S = Setting (private room, family present, sit down); P = Perception (what does the family already understand?); I = Invitation (does the family want detailed information?); K = Knowledge (deliver news clearly, avoid jargon, pause); E = Empathy (acknowledge emotion, allow silence); S = Strategy/Summary (clear plan, next steps, follow-up).","Communicating certain poor prognosis: use clear language. Avoid: 'passed away', 'not doing well', 'there's not much hope'. Use: 'He will not recover. He will die from this injury. Our goal now is to ensure he is peaceful and free from pain.' Clarity is kinder than ambiguity.","Communicating uncertain prognosis: 'I hope she will survive. But I need to be honest — she may have lasting difficulties with memory and physical strength. We'll know more as she recovers. Our goal is to give her the best chance while keeping her comfortable.'","Managing a doctor-family member: acknowledge their expertise without deferring to it. 'I know you have medical training and this makes it even harder. My assessment as her clinician is... I want to explain my reasoning fully to you.' Maintain clinical authority respectfully."],
    pitfalls:["Prognostic certainty before 72h post-arrest: do not have a 'withdrawing treatment' conversation before the prognostication algorithm is complete. Families can detect ambiguity — premature WLST discussions before certainty causes long-term harm.","Using euphemisms in difficult conversations: 'we're losing the battle', 'not fighting anymore' imply failure. Use direct, compassionate language. Families understand and appreciate clarity.","Abandoning distressed staff after difficult encounters: the duty of care extends to your team. Debrief after every difficult family meeting. ICU nurses experience moral distress — acknowledge it and provide support.","Letting family meetings become negotiations: 'we'll try X for another week and see' can become an indefinite extension of futile treatment. Set clear decision points with families: 'We'll reassess in 72h. If there is no improvement by then, we will meet again and the plan will change.'"]
  },
{
    id:101, title:"ICU Transport — Inter-Hospital Transfer of Unstable Patient", domain:"Transport, Organisation & Ethics", difficulty:"High",
    stem:`48M, severe ARDS (P/F 72) on VCV. Norad 0.28 mcg/kg/min. Prone positioning ongoing. No ECMO capability at your centre.

TRANSFER REQUEST: Regional ECMO centre 110km away.

CURRENT VENTILATOR: VT 6 mL/kg PBW | PEEP 14 | FiO2 0.85 | RR 18
MAP 68 | HR 96 | Temp 37.4°C | Latest lactate 2.1`,
    progressive_data:["Pre-transfer checklist completed. O2 calculation: transport vent + time + safety factor = 3200L required. Available: 2 × 1360L cylinders = 2720L. Shortage identified.","Additional O2 cylinder sourced. Transfer team: ICU registrar + ICU nurse (neither ECMO trained). ECMO centre asks about team competency.","En route 45 min in: SpO2 drop 94%→86%. Transport vent high-pressure alarm. Patient biting tube — no bite block packed.","Arriving ECMO centre: patient stabilised mid-transfer with manual bagging. Handover performed."],
    key_probes:["Two questions you must answer before any unstable patient leaves ICU — what are they?","O2 calculation for this transfer — walk me through the arithmetic.","Minimum team composition for transfer of a ventilated ARDS patient on vasopressors?","En route SpO2 drop — DOPE mnemonic. Apply it systematically.","Structured handover at receiving centre — what must you communicate and in what order?"],
    pearls:["Pre-transfer decision: (1) Will imaging/intervention change management? (2) Can the patient safely survive the transfer? Both questions documented. If answer to either is no — reconsider.","O2 calculation: (MV × FiO2 × minutes) × 2 safety factor. MV = VT × RR = 0.6L × 18 = 10.8 L/min. FiO2 0.85 × 10.8 = 9.2 L/min pure O2 required. For 90 min: 9.2 × 90 = 828L × 2 = 1656L minimum. Always round up significantly and add 30-min buffer.","DOPE mnemonic for deterioration on transport: Displacement (ETT), Obstruction (secretions/kinked tube), Pneumothorax, Equipment failure. Check patient before adjusting ventilator.","SBAR handover: Situation, Background, Assessment, Recommendation. Include: diagnosis, reason for transfer, current observations, ventilator settings, vasopressor doses, IV access, allergies, key investigations, outstanding issues."],
    pitfalls:["Underestimating O2 requirements: the most preventable transport death. Calculate before departure, include safety margin, have extra cylinders.","Inadequate team: ventilated patient on vasopressors requires minimum: doctor who can intubate + manage deterioration, ICU-trained nurse. One person cannot manage ventilator, vasopressors, and driving.","No bite block: endotracheal tube biting during transport is common. Pack a bite block or Guedel airway every transfer.","Verbal-only handover: written handover (or structured electronic) must accompany patient. Verbal handover alone risks information loss."]
  },
{
    id:102, title:"Major Incident — ICU Surge Capacity & Triage", domain:"Transport, Organisation & Ethics", difficulty:"High",
    stem:`You are the on-call ICU consultant, Saturday night. At 23:00 you receive a call from the hospital commander: major road traffic collision — 12 casualties inbound, 4 expected to require ICU admission. Your ICU has 2 empty beds. HDU has 1 bed.

CURRENT ICU PATIENTS:
• 2 patients potentially suitable for step-down to ward (stable, weaning)
• 1 patient on CRRT — cannot step down
• 1 patient day 3 post-cardiac arrest — uncertain neurological prognosis`,
    progressive_data:["Mass casualty protocol activated. Step-down of 2 stable patients to ward arranged — 2 beds freed.","First major casualty arrives: polytrauma, GCS 7, MAP 58, bilateral lung contusions. APACHE II estimated 32.","Second major casualty: 82M, dementia, 3rd degree burns >80% TBSA, no advance directive.","By 02:00: all 8 ICU beds occupied. 3 more trauma patients in ED requiring ICU. No capacity."],
    key_probes:["Major incident declaration — what triggers it and what is your specific role as ICU consultant?","Creating surge capacity — systematic approach. What levers do you have?","Triage in mass casualty: you have one ICU bed and two critically ill patients. How do you decide?","82M with 80% burns and dementia — do you offer ICU admission? How do you decide?","Documenting decisions made during a major incident — why and what specifically?"],
    pearls:["ICU surge capacity levers: (1) step down stable patients to HDU/ward; (2) cancel elective cases; (3) use theatre recovery as overflow ICU; (4) convert HDU to ICU level; (5) regional transfer of elective ICU patients; (6) regional mutual aid (transfer acute patients to partner ICUs).","Mass casualty triage principles: maximise the number of lives saved with available resources. SIEVE then SORT. SIEVE: walking (T3) → breathing (T1 immediate) → not breathing (expectant). SORT: physiological scoring for definitive care allocation.","Triage ethics in scarce resource allocation: utilitarian framework (greatest good for greatest number) vs individual rights framework. ICU triage criteria should be based on: short-term survival likelihood, anticipated benefit from ICU, not age or social worth. Documentation of reasoning is critical.","80% burns with dementia in elderly: burn mortality prediction (Baux score = age + %TBSA). Baux score 82+80 = 162 — expected mortality >95%. Combined with dementia (pre-existing cognitive limitation) and lack of advance directive — withdrawal of ICU admission may be appropriate. Requires senior discussion, documentation, family involvement."],
    pitfalls:["Acting alone in triage decisions: all decisions involving withholding/withdrawing ICU care in a mass casualty setting must involve senior clinicians, ideally the clinical director or most senior available clinician. Document who was involved.","Triage based on age alone: age is a factor in prognosis but should not be the sole criterion. Use validated prognostic tools. Implicit age bias is unacceptable.","Not activating major incident protocol early enough: it is always better to stand down a major incident protocol than to activate it too late. Activate early, escalate to administrator on call, involve bed management.","Post-incident debrief: mandatory after every major incident. Document actions taken, outcomes, lessons learned. Staff psychological support."]
  },
{
    id:103, title:"Clinical Governance — Incident Reporting & Learning", domain:"Transport, Organisation & Ethics", difficulty:"Medium",
    stem:`You are an ICU consultant. Three incidents have occurred this week:

INCIDENT 1: A patient received 10× the prescribed noradrenaline dose due to a pump programming error. Caught by a nurse 20 minutes later. Patient had brief hypertensive episode — no lasting harm.

INCIDENT 2: A patient developed bilateral pneumothoraces during bronchoscopy. Managed with chest drains — patient recovered.

INCIDENT 3: A patient waiting in the ED for 6 hours before ICU bed became available. APACHE II 28. She deteriorated further during the wait.`,
    progressive_data:["Incident 1 reported on the incident reporting system. Pharmacy review requested.","Incident 2: the bronchoscopist did not report the incident. You discover it from the nursing notes.","Incident 3: a formal complaint has been received from the family.","End of week: you are asked to present the incidents at the departmental governance meeting."],
    key_probes:["Incident 1: near-miss reporting — why report near-misses and what system do you use?","Incident 2: the bronchoscopist did not report. What is your duty and how do you approach this colleague?","Incident 3: a formal complaint. What is the process and what is your duty to the family?","Root cause analysis — when is it indicated and how is it performed?","Just culture — define it and how does it differ from blame culture in managing clinical incidents?"],
    pearls:["Near-miss reporting: near-misses provide the most learning — they share the same causal pathway as serious incidents without the harm. WHO estimates for every serious adverse event there are 300 near-misses. Reporting near-misses identifies systemic weaknesses before harm occurs.","Root cause analysis (RCA): structured investigation of serious incidents to identify proximate causes (what happened), contributing factors (why), and systemic factors (why the system allowed it). Not about individual blame — about system improvement.","Just culture: an environment where staff feel safe to report errors without fear of punitive consequences, while still maintaining professional accountability for reckless or deliberate unsafe acts. Staff who make honest mistakes in good faith are supported, not disciplined.","Duty of candour (UK): a legal requirement for healthcare organisations to be open and honest with patients/families when something goes wrong causing moderate harm or above. Includes: acknowledge the incident, apologise, explain what happened, inform what will be done to prevent recurrence."],
    pitfalls:["Not reporting near-misses: a culture where only serious incidents are reported misses the opportunity for learning. The consultant sets the tone — if consultants model reporting, trainees will follow.","Approaching the bronchoscopist punitively: non-reporting is usually caused by fear of blame, not malice. Approach collegially: 'I noticed the incident in the notes — I want to make sure we capture this for learning. Can we submit a report together?' Foster a just culture.","Responding to complaints defensively: the duty of candour requires acknowledgement and apology. A defensive response escalates complaints and increases litigation risk. Honest, compassionate engagement reduces both.","Individual blame vs system analysis: most ICU incidents involve system failures (inadequate staffing, drug storage, equipment). Blaming the individual without system analysis does not prevent recurrence."]
  },
{
    id:104, title:"Medicolegal Documentation — Consent, Capacity & the Mental Capacity Act", domain:"Transport, Organisation & Ethics", difficulty:"High",
    stem:`You have three patients requiring urgent decisions today:

PATIENT 1: 44F, Jehovah's Witness, requiring emergency splenectomy for traumatic rupture. She is conscious, haemodynamically compromised, refusing blood transfusion. She signed an advance refusal of blood products 2 years ago.

PATIENT 2: 72M, confusion and agitation following a fall. He was initially refusing CT head. Colleagues say 'he lacks capacity — just do the CT'.

PATIENT 3: 28M, psychotic episode, requiring intubation for drug overdose. He is resisting and saying 'I don't want to be intubated'.`,
    progressive_data:["Patient 1: haemorrhage continuing. Surgeon says 'we may not be able to save her without blood'. You are asked to make a decision.","Patient 2: neuropsychiatry review — confusion is likely delirium from subdural haematoma. Is his refusal valid?","Patient 3: psychiatry says he had capacity at the time of the overdose (intentional self-harm). Does this change your decision?","All three patients survive. A medicolegal review is requested for Patient 1's care."],
    key_probes:["Patient 1: valid advance refusal of blood — does it override the clinical imperative to transfuse?","Capacity assessment — the four components of the Mental Capacity Act 2005.","Patient 2: he is refusing CT but may lack capacity. How do you assess capacity and what is the standard?","Patient 3: psychosis + intentional overdose + refusing intubation. How do you proceed?","Documentation of capacity and consent decisions — what specifically must you record?"],
    pearls:["Mental Capacity Act 2005 (England and Wales): presume capacity. Capacity is decision-specific and time-specific. Four criteria to have capacity: (1) understand the information; (2) retain the information long enough to decide; (3) weigh up the information; (4) communicate the decision.","Valid advance refusal of treatment (ADRT): legally binding if: written, signed, witnessed, specific about the treatment and circumstances, made with capacity. Patient 1's advance refusal is legally binding — transfusing would constitute assault even if she dies.","Capacity in delirium: capacity fluctuates with delirium. A confused patient may lack capacity at one time and have it at another. Assess at the optimal time (with adequate analgesia, glasses, hearing aids, familiar person). If no capacity — act in best interests.","Patient 3 — psychosis and capacity: psychosis may impair capacity. If he lacks capacity due to psychosis → treat in best interests (intubation justified). If he has capacity despite psychosis → his refusal must be respected UNLESS he is under the Mental Health Act (which allows compulsory treatment for the mental disorder, not physical complications)."],
    pitfalls:["Overriding a valid ADRT because 'she would have wanted to live': the entire purpose of an ADRT is to extend the patient's autonomy beyond the moment of incapacity. 'She would have wanted to live' does not override an explicit, valid, specific ADRT.","Documenting 'patient lacks capacity' without documenting the assessment: documentation must include: which decision, the four MCA criteria assessed, why capacity is or is not present, who was consulted, what the best interests decision is and who made it.","Blanket capacity assessments: 'He lacks capacity' is not acceptable. Capacity is decision-specific. A patient may have capacity to refuse a blood test but lack capacity to consent to surgery.","Not involving the Mental Health Act team when needed: in Patient 3, if psychosis is the cause of incapacity and the patient is being detained under the MHA — physical treatment for physical emergencies is covered under the MHA s.63 (treatment for the mental disorder includes treatment for its physical consequences)."]
  },
{
    id:105, title:"Organ Donation — Maximising Donation & Ethical Framework", domain:"Transport, Organisation & Ethics", difficulty:"High",
    stem:`You have two potential donors on your ICU this week:

DONOR 1: 34M, catastrophic TBI following assault. GCS 3, bilateral fixed dilated pupils, no brainstem reflexes. ICP uncontrollable (>40 mmHg). Family have been spoken to — they are unsure about donation.

DONOR 2: 78F, massive intracerebral haemorrhage. Not fulfilling brain death criteria — GCS 4, some brainstem reflexes preserved. Decision to withdraw life-sustaining treatment made. Palliative care in progress.`,
    progressive_data:["Donor 1: specialist nurse for organ donation (SNOD) contacted. Family meeting arranged.","Donor 1: brain death testing completed. Two doctors confirm brain death. Family consent for donation obtained.","Donor 2: controlled donation after circulatory death (DCD) pathway initiated. Warm ischaemic time being managed.","Both donors: organ retrieval performed. 7 organs transplanted in total."],
    key_probes:["When do you refer to the specialist nurse for organ donation (SNOD) — what triggers the call?","Brain death testing — what are the preconditions and the specific tests performed?","Donor 1 family are unsure about donation — what is your role in the conversation?","DCD (donation after circulatory death) — what is the pathway and how does warm ischaemic time affect organ viability?","Donor management — five physiological targets for the multi-organ donor."],
    pearls:["SNOD referral triggers (UK, NHSBT): refer when: GCS <6 on ventilator AND (1) catastrophic brain injury with treatment withdrawal planned, OR (2) brain death testing being considered, OR (3) any other situation where death is anticipated in a ventilated patient. Refer BEFORE family discussion — SNOD leads the family donation conversation.","Brain death preconditions: known irreversible cause, no reversible cause (metabolic, drug, hypothermia), normothermia >35°C, no confounding drugs. Two senior doctors (one consultant) test independently. Tests: pupil reflexes, corneal reflexes, oculovestibular, oculocephalic, gag, cough, apnoea test.","Family donation conversation: SNOD leads this conversation, not the ICU team. ICU team role: confirm brain death clearly and separately from donation conversation, support family. 'Decoupling' — separate the brain death notification from the donation request — improves consent rates.","DCD pathway (controlled): WLST performed in controlled setting (theatre, ICU), death confirmed after 5 minutes of circulatory standstill (hands-off time), organ retrieval begins. Warm ischaemic time: from withdrawal of ventilation to cold perfusion. Target <30 min for kidneys, <15 min for liver."],
    pitfalls:["Not referring to SNOD early enough: late referral reduces time for family counselling and donor optimisation. Refer as soon as brain death or imminent death is anticipated.","ICU team leading the donation conversation: SNOD is trained specifically for this conversation. ICU team involvement is supportive — consent rates are higher when SNOD leads.","Donor management neglect: between brain death confirmation and retrieval, donors require active management. Without intervention: 25% of potential donors develop cardiac arrest before retrieval. Maintain MAP, ensure euvolaemia, correct DI, maintain oxygenation.","Assuming family will refuse: in the UK, opt-out system (deemed consent) has been introduced. However, family discussion still occurs and family objection is respected in practice. Do not assume refusal — refer to SNOD and allow the conversation."]
  },
{
    id:106, title:"Leadership in ICU — Managing Conflict & Team Dynamics", domain:"Transport, Organisation & Ethics", difficulty:"Medium",
    stem:`You are the ICU consultant covering a 16-bed unit. Monday morning:

SCENARIO 1: Your registrar approaches you — the night nurse in charge refused to comply with a sedation weeaning protocol, saying 'I know better than the protocol'. A patient's ICU stay has been unnecessarily prolonged.

SCENARIO 2: A consultant from another specialty calls you aggressively — 'Your team intubated my patient without consulting me first. This is unacceptable.'

SCENARIO 3: A junior doctor comes to you in tears. She made a prescribing error last night (caught before harm occurred). She says 'I'm not good enough for this job.'`,
    progressive_data:["Scenario 1: the nurse has 25 years of experience and strong views. Two other nurses agree with her position.","Scenario 2: the patient was in respiratory failure — intubation was time-critical. The other consultant's note says 'do not intubate without my approval'.","Scenario 3: on review, the error was partly due to an unclear prescription chart — a systemic issue, not solely her fault.","End of week: you are told by your clinical director that your unit has a 'communication problem'."],
    key_probes:["Scenario 1: experienced nurse non-compliant with protocol — how do you manage this professionally?","Scenario 2: interdepartmental conflict over a clinical decision — how do you handle the aggressive consultant?","Scenario 3: a distressed junior doctor after a near-miss — what is your immediate duty and longer-term role?","How do you create a psychological safety culture in ICU?","Your clinical director says there is a 'communication problem' — how do you diagnose and address this?"],
    pearls:["Managing protocol non-compliance: first understand the nurse's reasoning (sometimes experienced staff identify genuine protocol flaws). Then: reinforce the protocol's evidence base, address the specific concern, document the discussion. If non-compliance continues: escalate via nurse management. Avoid public confrontation.","Interdepartmental conflict: de-escalate immediately. 'I understand you're concerned. Let me explain the clinical situation and why we acted urgently.' Document the clinical reasoning for the emergency intervention. Address 'do not intubate' orders in advance — these must be discussed and agreed, not assumed.","Supporting a distressed junior doctor after an error: immediate: normalise ('errors happen to all of us'), ensure they are not in immediate distress, check the patient is safe. Longer-term: report the incident together, identify system factors, ensure they receive occupational health support if needed, share your own experiences of error.","Psychological safety (Amy Edmondson): a team climate where members feel safe to speak up, ask questions, raise concerns, and admit mistakes without fear of humiliation or punishment. High psychological safety correlates with better patient outcomes in ICU."],
    pitfalls:["Addressing protocol non-compliance publicly: humiliating an experienced nurse in front of others creates defensiveness and destroys psychological safety. Have difficult conversations privately.","Accepting 'do not intubate without my approval' as an absolute: in a life-threatening emergency, the ICU team must act. Discuss afterwards — the clinical imperative overrides prior instructions in extremis. Document clearly.","Over-reassuring a distressed junior after an error: 'Don't worry, it was fine' minimises the experience and prevents learning. Instead: acknowledge the difficulty, explore what happened, identify learning, check they are adequately supported.","Ignoring the 'communication problem' feedback: 360-degree feedback about team communication requires structured response. Organise a team meeting, use structured tools (TeamSTEPPS, crew resource management training), address specific identified issues."]
  },
{
    id:107, title:"Research & Evidence in ICU — Trial Interpretation", domain:"Transport, Organisation & Ethics", difficulty:"Medium",
    stem:`You are reviewing three landmark ICU trials to present at your journal club:

TRIAL 1: PROWESS trial (2001) — activated protein C (drotrecogin alfa) in severe sepsis. Positive result — introduced into clinical practice globally.

TRIAL 2: ARISE, ProCESS, ProMISe (2014–2015) — Early Goal-Directed Therapy vs standard care in septic shock. No mortality benefit.

TRIAL 3: RECOVERY trial (2020) — dexamethasone in COVID-19. 28-day mortality benefit in ventilated patients.`,
    progressive_data:["PROWESS: subsequently, PROWESS-SHOCK (2012) enrolled sicker patients — no benefit. Drug withdrawn from market. What went wrong?","ARISE/ProCESS/ProMISe: EGDT was standard of care for 15 years. Three large RCTs show no benefit. How do you appraise this?","RECOVERY: interim analysis showed benefit — trial stopped early. What are the risks of stopping an RCT early?","Journal club question: 'Should we use this new drug/protocol based on this single trial?'"],
    key_probes:["Why did PROWESS give a false positive result — what are the specific methodological flaws?","ARISE/ProCESS/ProMISe found no benefit from EGDT — does this mean Rivers' original trial was fraudulent?","What is the risk of stopping an RCT early for benefit?","How do you appraise an ICU trial for applicability to your patient population?","What is the hierarchy of evidence and when is a single RCT sufficient to change practice?"],
    pearls:["PROWESS failure: trial stopped early for benefit (risk of overestimation), imbalanced placebo group, open-label administration in some centres, conflict of interest (Eli Lilly funded and controlled the trial). The subsequent PROWESS-SHOCK trial in a more relevant population showed no benefit. Lesson: early trial stopping overestimates treatment effects; industry funding introduces bias.","ARISE/ProCESS/ProMISe and EGDT: these trials do NOT mean EGDT was wrong — they show that by 2014, standard care had evolved to incorporate EGDT elements (early IV fluids, early antibiotics, vasopressors). The 'control' group received similar care. The concept of early aggressive management was validated — the specific EGDT protocol is no longer needed.","Stopping RCTs early: trials stopped early for benefit overestimate treatment effects by 20–30% on average. The smaller the number of events at stopping, the greater the overestimation. RECOVERY was large with many events — less susceptible than a small early-stopped trial.","Trial applicability: PICO framework (Population, Intervention, Comparison, Outcome). Ask: Is my patient similar to the trial population? Is the intervention deliverable in my setting? Is the comparator group relevant? Are the outcomes patient-centred?"],
    pitfalls:["Changing practice based on one positive trial: single RCTs, especially if small, industry-funded, or stopped early, require replication. Wait for systematic review or guideline incorporation before mandating practice change.","Dismissing negative trials: a well-conducted large negative RCT is as important as a positive one. It tells you definitively that a treatment does not work and prevents harm from ineffective interventions.","Number Needed to Treat (NNT) vs relative risk reduction: RECOVERY dexamethasone — absolute risk reduction 2.8% in ventilated patients. NNT = 35. Relative risk reduction = 35%. Media always report relative risk — always convert to absolute and NNT for clinical decision-making.","Publication bias: positive trials are more likely to be published and cited. The true effect of many ICU interventions is smaller than published RCTs suggest because negative results are unpublished. Systematic reviews attempt to correct for this."]
  },
{
    id:108, title:"Prescribing Safety in ICU — Drug Errors & High-Risk Medications", domain:"Transport, Organisation & Ethics", difficulty:"Medium",
    stem:`You are reviewing prescribing safety on your ICU ward round. Three situations require your attention:

SITUATION 1: A patient is prescribed 'morphine 10mg IV PRN pain'. The nurse asks how often it can be given and whether there is a maximum dose. The prescription has no frequency or maximum stated.

SITUATION 2: A patient on heparin infusion has a Plt count that has fallen from 220 to 68 over 5 days. The team say 'it's probably just the illness'.

SITUATION 3: A patient is prescribed vancomycin. The pharmacy technician calls to say the dose seems high — they have calculated it based on total body weight but the patient is obese (BMI 44).`,
    progressive_data:["Situation 1: the nurse gives 10mg IV morphine. 30 minutes later the patient is unrousable, RR 6.","Situation 2: you calculate the 4T score — it is 6. HIT suspected.","Situation 3: vancomycin level (trough) comes back as 28 mg/L (target 15–20 mg/L). Cr rising.","All three situations are reported as incidents at the end of the week."],
    key_probes:["Incomplete opioid prescriptions — what are the minimum required elements of a safe prescription?","4T score of 6 in a patient on heparin — what are the four components and what do you do immediately?","Vancomycin dosing in obesity — what is the correct approach and what monitoring is mandatory?","High-alert medications in ICU — list five and what specific safeguards apply to each?","Root cause of Situation 1 — was this a nurse error, a prescribing error, or a system error?"],
    pearls:["Safe opioid prescription minimum elements: drug name, dose, route, frequency, indication, maximum daily dose, and any dose adjustments (renal/hepatic function). 'PRN' without frequency and maximum dose = unsafe prescription.","4T score: Thrombocytopenia (magnitude + timing of fall), Timing (characteristic timing post-heparin exposure), Thrombosis (new clot), oTher causes of thrombocytopenia. Score 6–8 = high probability HIT. Stop ALL heparin immediately — including flushes, lines coated with heparin. Start alternative anticoagulation (argatroban or fondaparinux).","Vancomycin in obesity: dose on actual body weight (not ideal body weight) as volume of distribution is increased. However, renal clearance may not scale proportionally — risk of accumulation. Target AUC/MIC 400–600 (or trough 15–20 mg/L). Adjust for renal function. Monitor levels daily in critically ill patients.","High-alert medications in ICU: (1) concentrated electrolytes (KCl, NaCl 3%); (2) insulin; (3) neuromuscular blocking agents; (4) opioids; (5) heparin/anticoagulants. Safeguards: double-checking of preparation and administration, dedicated storage, standardised concentrations, independent pump programming check."],
    pitfalls:["Blaming the nurse for Situation 1: the prescribing error (incomplete prescription) created the conditions for the administration error. Both the prescriber and the system failed — the prescription should not have been accepted by pharmacy without a frequency and maximum dose.","Thrombocytopenia in ICU assumed to be illness-related: 30% of ICU patients develop thrombocytopenia. HIT accounts for 1–3% but is potentially fatal. Always apply the 4T score to any thrombocytopenia in a heparin-exposed patient.","Continuing heparin while 'waiting for the HIT screen': the 4T score guides clinical action. If score ≥4, stop heparin immediately — do not wait for the anti-PF4 antibody result.","Vancomycin without monitoring: vancomycin has a narrow therapeutic index. Subtherapeutic levels = treatment failure; supratherapeutic levels = nephrotoxicity. Levels must be monitored — not optional."]
  },
{
    id:109, title:"Teaching & Training in ICU — Supervision & Simulation", domain:"Transport, Organisation & Ethics", difficulty:"Medium",
    stem:`You are the educational supervisor for three ICU trainees:

TRAINEE A: FY2 doctor, week 2 of ICU rotation. Technically competent but avoids discussing prognosis with families — 'I don't know what to say'.

TRAINEE B: Core medical trainee, month 4. Excellent with procedures but tends to escalate all decisions to consultants immediately without attempting clinical reasoning first.

TRAINEE C: ICU registrar, year 2 of fellowship. Independently competent clinically but gives feedback to junior staff in a way that has caused two nurses to complain.`,
    progressive_data:["Trainee A: you observe her attempting to answer a family's questions about prognosis. She freezes and leaves the room.","Trainee B: called to review a patient deteriorating — comes to you immediately without examining the patient first.","Trainee C: you observe him telling a nurse 'that was a really stupid mistake' after a minor medication error.","Monthly teaching session: you are asked to design a simulation scenario for the whole team."],
    key_probes:["Trainee A — how do you teach communication skills and specifically prognosis discussion?","Trainee B — how do you develop independent clinical reasoning without undermining their confidence?","Trainee C — how do you give feedback about their feedback style? What is the specific impact of their behaviour?","Simulation in ICU — what makes a high-quality simulation scenario and what are the learning objectives?","As an educational supervisor — what are your responsibilities if a trainee is struggling significantly?"],
    pearls:["Teaching prognosis communication: (1) observe a senior giving prognostic information; (2) role-play with structured feedback (Pendleton model: what went well, what could be improved, what would you do differently); (3) supervised real conversation with debrief; (4) independent practice with follow-up. Communication is a skill — it must be taught systematically.","Developing independent clinical reasoning: 'What do YOU think is happening?' before giving your assessment. Graduated responsibility: observe → assist → lead supervised → independent. Use Socratic questioning rather than telling.","Giving feedback about feedback: use the SBI framework — Situation, Behaviour, Impact. 'In the situation of X, when you said Y, the impact was Z (two nurses complained). This undermines psychological safety. Can we discuss how you could have handled this differently?'","Simulation learning objectives: (1) technical skills (airway, line insertion, resuscitation); (2) non-technical skills (communication, leadership, situational awareness, decision-making); (3) team dynamics (CRM — crew resource management). Debrief is more valuable than the scenario itself — allocate equal time."],
    pitfalls:["Teaching by criticism: negative feedback without guidance on how to improve ('that was wrong') damages confidence and reduces psychological safety. Always use structured feedback frameworks.","Not addressing Trainee C's behaviour: 'he's just blunt' is not acceptable if his feedback is causing distress and complaints. Address directly, document, and if behaviour persists involve college tutor and programme director.","Simulation without debrief: a simulation scenario without structured debrief is entertainment, not education. The debrief — facilitated reflection on what happened and why — is the learning intervention.","Ignoring struggling trainees: educational supervisors have a duty to identify trainees who are struggling and to intervene early. 'They'll figure it out' leads to patient harm and trainee burnout. Trigger occupational health, ARCP early review, and supportive pastoral plan."]
  },
{
    id:110, title:"Infection Prevention & Control in ICU — VAP, CLABSI & MDROs", domain:"Transport, Organisation & Ethics", difficulty:"Medium",
    stem:`You are reviewing your ICU's infection prevention data for the last quarter:

• VAP rate: 8.2 per 1000 ventilator days (national benchmark: <5)
• CLABSI rate: 2.1 per 1000 catheter days (national benchmark: <1)
• MRSA acquisition rate: 0.8 per 1000 patient days (rising over 3 months)
• C. difficile rate: 3 cases in the quarter (all in patients on broad-spectrum antibiotics >7 days)

The ICU manager asks you to present an improvement plan at the next governance meeting.`,
    progressive_data:["VAP bundle audit: oral care performed in 62% of patients. HOB elevation documented in 88%. Daily SBT in 74%. Subglottic secretion drainage device used in 40%.","CLABSI review: 3 of 5 infections in patients with femoral central lines inserted during emergencies.","MRSA screening: not performed on admission for 35% of admissions in the last month.","Antimicrobial stewardship: average antibiotic duration on the unit is 9.2 days."],
    key_probes:["VAP bundle — what are the components and which has the strongest evidence?","CLABSI prevention — what are the insertion bundle components and the maintenance bundle components?","MRSA screening on ICU admission — what is the evidence and what does a positive screen mandate?","Antimicrobial stewardship in ICU — what specific interventions reduce C. difficile and MDRO rates?","You are presenting this data to the governance committee — how do you frame it without attributing blame?"],
    pearls:["VAP bundle: (1) HOB elevation 30–45° (reduces aspiration); (2) daily SBT and sedation holds (reduces ventilator days); (3) oral care with chlorhexidine (reduces oropharyngeal colonisation — evidence mixed for mortality but reduces VAP incidence); (4) subglottic secretion drainage (strongest evidence — reduces VAP by 50%); (5) cuff pressure monitoring (prevent micro-aspiration).","CLABSI insertion bundle: maximal sterile barrier precautions, chlorhexidine skin preparation, avoid femoral site (highest infection rate), ultrasound guidance, remove unnecessary lines daily. Maintenance bundle: daily review of necessity, dressing changes with chlorhexidine, no routine changes — change when clinically indicated.","MRSA: screen all admissions on ICU — nasal swab (anterior nares) + skin swab. Positive screen: contact precautions (gloves + apron), cohort nursing if possible, decolonisation (mupirocin nasal ointment + chlorhexidine body wash). Decolonisation reduces surgical site infection and ICU acquisition rates.","Antimicrobial stewardship: (1) daily review of antibiotic indication; (2) de-escalation to narrowest spectrum when sensitivities available; (3) defined duration (SIS guideline: 4 days for source-controlled abdominal infection); (4) IV to oral switch when appropriate; (5) antifungal stewardship."],
    pitfalls:["Oral care compliance: chlorhexidine oral care has been controversial (possible harm in non-cardiac surgery patients in some meta-analyses). Review current institutional guidance. Toothbrushing without chlorhexidine may be a safer default.","Femoral CVC insertion in emergencies: femoral is faster in emergencies but carries 3–5× higher CLABSI risk. Convert to internal jugular or subclavian within 24–48h when patient stable. Document the plan at insertion.","MRSA positive patients: contact precautions reduce transmission but can result in less frequent clinical assessment. Ensure positive patients receive equal frequency of clinical review — contact precautions must not mean social isolation or reduced care.","Antibiotic stewardship without infectious disease support: unit-level antibiotic stewardship requires pharmacy involvement, microbiology/ID support, and institutional guidelines. A single clinician championing stewardship without systemic support has limited impact."]
  },
{
    id:111, title:"ECMO — VV-ECMO Initiation, Management & Weaning", domain:"High-Yield Bonus Cases", difficulty:"High",
    stem:`31M, previously healthy. Severe H1N1 influenza ARDS. Day 6 ICU. Optimised ventilation including proning ×4 sessions.

CURRENT:
• P/F ratio 54 on PEEP 18, FiO2 1.0 | pH 7.28 | PaCO2 58
• Driving pressure 22 cmH2O | MAP 72 on norad 0.15

ECMO CENTRE CALL: They ask you three specific questions before accepting the patient for VV-ECMO.`,
    progressive_data:["VV-ECMO initiated. Right IJV dual-lumen Avalon cannula 31Fr. Flow 4.8 L/min. Lung rest ventilation: VT 3 mL/kg, PEEP 10, RR 10, FiO2 0.4.","Day 3 on ECMO: recirculation suspected. SpO2 on left hand 88% despite sweep gas FiO2 1.0. Right hand SpO2 99%.","Day 8 on ECMO: native lung improving. P/F on ECMO 280. Team starting weaning trial.","Day 12: ECMO weaning complete. Decannulated. Extubated Day 15. Discharged Day 28."],
    key_probes:["ECMO centre asks: what is the P/F ratio, how long has it been at this level, and have you proned? Why these three questions?","VV-ECMO indications — the P/F and time thresholds from EOLIA trial criteria.","Recirculation on VV-ECMO — mechanism, how you diagnose it, and what you do.","Lung rest ventilation on VV-ECMO — what parameters and why?","VV-ECMO weaning — what parameters guide the weaning trial and how do you perform it?"],
    pearls:["EOLIA entry criteria: P/F <80 for >6h, or P/F <50 for >3h, or pH <7.25 with PaCO2 >60 for >6h, despite optimal conventional therapy including proning. These are the questions the ECMO centre asks — they assess ECMO eligibility.","Recirculation: oxygenated blood from the return cannula re-enters the drainage cannula before completing systemic circulation. Diagnosed by: SpO2 discordance (right hand vs left hand in IJV dual-lumen), falling SvO2 despite adequate ECMO flow, low sweep gas efficiency. Treatment: reposition cannula, increase native cardiac output, reduce ECMO flow.","Lung rest ventilation on VV-ECMO: VT 2–4 mL/kg, PEEP 8–12, RR 10–12, FiO2 0.3–0.4. Goal: reduce VILI by minimising ventilator-induced stress. The lung does not need to do gas exchange — ECMO does this.","VV-ECMO weaning: reduce sweep gas (CO2 removal) to test native lung CO2 clearance. Reduce ECMO flow to test native oxygenation. Wean over 4–6h — if PaO2 and PaCO2 maintained on reduced ECMO support, proceed to decannulation trial."],
    pitfalls:["Initiating ECMO too late: every hour of continued VILI in a patient meeting ECMO criteria worsens lung recovery. ECMO referral should be made when P/F threshold is being approached, not after it has been breached for 24h.","High PEEP on VV-ECMO: ECMO provides oxygenation — high PEEP is not needed for O2. Reduce PEEP to physiological levels (8–10 cmH2O) to allow lung rest and reduce RV afterload.","Anticoagulation targets on VV-ECMO: target ACT 180–220 or anti-Xa 0.3–0.5 IU/mL. Too little → circuit clotting. Too much → catastrophic haemorrhage. Daily circuit inspection for clots.","Premature ECMO decannulation: wean only when native lung can independently maintain P/F >150 on FiO2 0.4 and PEEP ≤10. Premature decannulation requires urgent re-cannulation — highly morbid."]
  },
{
    id:112, title:"Haemodynamic Monitoring — Choosing & Interpreting the Right Tool", domain:"High-Yield Bonus Cases", difficulty:"High",
    stem:`You are the EDIC Part 2 viva examiner's favourite topic. Three patients, three monitoring dilemmas:

PATIENT A: 58M, septic shock, norad 0.4 mcg/kg/min, MAP 65. Lactate 4.2 and rising. CVP 12. Team arguing about whether to give more fluid.

PATIENT B: 44F, post-cardiac surgery, CO 2.1 L/min on PA catheter, CVP 18, PCWP 22, SVR 2400.

PATIENT C: 68M, ARDS + cor pulmonale. Right heart failure suspected. Team uncertain whether to add vasopressin or increase PEEP.`,
    progressive_data:["Patient A: passive leg raise performed. Pulse pressure variation 18% in sinus rhythm.","Patient B: PA catheter data: CI 1.4, SVRI 2800, PCWP 22, SvO2 48%. Dobutamine started.","Patient C: bedside echo: TAPSE 9 mm, D-sign, estimated RVSP 62 mmHg. E-point septal separation 18 mm.","All three patients: team asking 'which monitoring tool is best for ICU patients?'"],
    key_probes:["Patient A: CVP 12 — does this tell you if the patient is fluid responsive? What does and what doesn't?","Passive leg raise test — mechanism, how to perform it correctly, and what constitutes a positive result.","Patient B: PA catheter data interpretation. CI 1.4, PCWP 22, SvO2 48% — what is the haemodynamic state and what do you do?","Patient C: echo findings — TAPSE 9, D-sign, RVSP 62. What do these tell you and how does this change your management?","What is the ideal haemodynamic monitoring tool for the critically ill — is there one?"],
    pearls:["CVP: does NOT predict fluid responsiveness. A low CVP does not mean the patient will respond to fluid. A high CVP does not mean they are fluid overloaded. Multiple RCTs and meta-analyses confirm CVP should not guide fluid resuscitation.","Passive leg raise (PLR): transfers ~300 mL blood from lower limbs to central circulation — reversible and self-limiting (excellent for patients who cannot tolerate a fluid challenge). Measure CO response (not BP) — a rise in CO >10% at 1 minute = fluid responsive. Pitfall: arrhythmia, raised IAP, and high PEEP reduce PLR sensitivity.","PA catheter interpretation: CI 1.4 (low output) + PCWP 22 (elevated filling pressure = cardiogenic state) + SVR high + SvO2 48% (inadequate O2 delivery) = cardiogenic shock with poor mixed venous saturation. Dobutamine correct — inotrope to improve CO and SvO2.","Echo haemodynamic assessment: TAPSE <17 mm = RV dysfunction. D-sign (IVS flattening) = RV pressure overload. RVSP >40 mmHg = pulmonary hypertension. E-point septal separation >7 mm = poor LV function. Echo provides structural and functional data that no other monitor provides."],
    pitfalls:["Pressure-based fluid responsiveness: all static pressure measurements (CVP, PCWP, filling pressures) are unreliable predictors of fluid responsiveness. Use dynamic indices: PLR, PPV, SVV (only valid in sinus rhythm, passive ventilation, no arrhythmia, VT >8 mL/kg).","Thermodilution CO in arrhythmia: intermittent thermodilution via PA catheter is inaccurate in AF or frequent ectopics. Average 3–5 measurements. Continuous thermodilution (CCO mode) is more reliable.","Echo alone without clinical context: TAPSE 9 mm is significant but context matters — was it 9 mm at admission (chronic RV dysfunction) or has it fallen from 18 mm (acute deterioration)? Trend and clinical context are as important as absolute values.","One tool for all patients: no single haemodynamic monitor is superior for all situations. Use the minimum monitoring needed to answer your clinical question. Add invasive monitoring when non-invasive monitoring is insufficient."]
  },
{
    id:113, title:"Ventilator Graphics — Waveform Interpretation at the Bedside", domain:"High-Yield Bonus Cases", difficulty:"High",
    stem:`You are teaching a registrar how to interpret ventilator waveforms. You show her three waveforms on your ICU ventilator screen:

WAVEFORM 1: Pressure-time curve — the peak pressure is 42 cmH2O. The pressure remains at 28 cmH2O during the inspiratory pause. The patient is on VCV mode.

WAVEFORM 2: Flow-time curve — the expiratory flow does not return to zero before the next breath begins. The patient is a COPD patient on mandatory ventilation.

WAVEFORM 3: Pressure-time curve in PSV mode — there are irregular, large-amplitude pressure swings coinciding with ventilator breaths. The patient has ARDS with high respiratory drive.`,
    progressive_data:["Waveform 1: you reduce VT by 50 mL. The plateau pressure falls to 26 cmH2O. Peak pressure falls to 38 cmH2O.","Waveform 2: you perform an expiratory hold. The pressure reads 8 cmH2O above PEEP. RR is reduced to 10, I:E changed to 1:4.","Waveform 3: NMBA administered. The irregular pressure swings disappear. DP falls from 22 to 14 cmH2O.","Teaching point: the registrar asks 'what is the stress index and when do you use it?'"],
    key_probes:["Waveform 1: peak pressure 42, plateau 28. Calculate resistance and compliance. What does each tell you?","Driving pressure — calculate it from these values. What is the clinical significance of DP >15 cmH2O?","Waveform 2: flow not returning to zero. What is this and what is the expiratory hold showing?","Waveform 3: irregular pressure swings in PSV — what is happening and why does NMBA fix it?","Stress index — what is it and what do concave vs convex pressure-time curves in VCV tell you about PEEP adequacy?"],
    pearls:["Peak pressure − Plateau pressure = resistive pressure (reflects airway resistance — ETT, bronchospasm, secretions). Plateau pressure − PEEP = driving pressure (reflects alveolar distension — lung compliance). This patient: resistance = 42−28 = 14 cmH2O (mildly elevated). DP = 28−PEEP.","Driving pressure (ΔP): most powerful independent predictor of mortality in ARDS. ΔP >15 cmH2O associated with significantly increased mortality. Target ΔP <15 cmH2O — reduce VT or optimise PEEP.","Intrinsic PEEP (auto-PEEP): expiratory flow not returning to zero = dynamic hyperinflation. Expiratory hold quantifies it. Treatment: reduce RR, increase I:E ratio (longer expiratory time), reduce minute ventilation, consider bronchodilators.","Reverse triggering / dyssynchrony in PSV: high respiratory drive in ARDS causes patient effort to entrain on or fight the ventilator breath. Irregular pressure swings and high delivered VT (stacking) = P-SILI risk. NMBA resolves this by eliminating patient effort."],
    pitfalls:["Plateau pressure without inspiratory pause: Pplat requires a 0.5-second inspiratory pause. Without the pause, peak pressure is measured instead — these are different things. Always use the inspiratory pause for Pplat measurement.","Auto-PEEP in spontaneously breathing patients: expiratory hold only valid in passively ventilated patients. In spontaneously breathing patients, patient effort during hold invalidates the measurement.","High peak pressure alone causing alarm: peak pressure depends on both compliance and resistance. High peak pressure with normal plateau = high resistance problem (suction, bronchospasm). Do not increase PEEP or reduce VT based on peak pressure alone — measure plateau first.","Stress index: a concave (decelerating) pressure curve in VCV = over-distension (PEEP too high or VT too high). A convex (accelerating) pressure curve = recruitment still occurring (consider higher PEEP). Linear = optimal. Requires constant-flow VCV to interpret correctly."]
  },
{
    id:114, title:"Refractory Hypoxaemia — Systematic Approach Beyond Standard ARDS Care", domain:"High-Yield Bonus Cases", difficulty:"High",
    stem:`44F, severe ARDS from bilateral pneumonia. Day 8 ICU. Despite optimised standard care, P/F ratio remains 68.

CURRENT TREATMENT:
• VCV: VT 6 mL/kg, PEEP 16, FiO2 1.0 | DP 18 cmH2O
• Proning ×5 sessions (16h each) — last prone session P/F improved to 88 then fell to 68 supine
• NMBA cisatracurium — Day 3
• Norad 0.18 mcg/kg/min | MAP 72

ECHO: RV mildly dilated, TAPSE 14, D-sign on short-axis, no pericardial effusion`,
    progressive_data:["ECMO referral made. Centre accepts — transfer in 4 hours. Pre-transfer optimisation required.","Pre-transfer: high-frequency oscillatory ventilation (HFOV) considered by registrar as a 'bridge'. You disagree.","Pre-transfer: iNO 20 ppm trialled. P/F 68→82. SpO2 88→93%. Decision made to add iNO for transfer.","On VV-ECMO at receiving centre: P/F improves to >200 within 24h. Lung rest ventilation commenced."],
    key_probes:["Systematic approach to refractory hypoxaemia — what interventions have you exhausted and what remains?","Echo shows RV dilation with D-sign — how does this change your approach to PEEP in this patient?","HFOV in 2024 — what did OSCAR and OSCILLATE trials show and is there any remaining role?","iNO in ARDS — mechanism, evidence, and why is it a bridge not a treatment?","Pre-transfer optimisation for VV-ECMO — what specific steps in the last 4 hours?"],
    pearls:["Systematic approach to refractory hypoxaemia: (1) optimise PEEP (not maximum, but best compliance); (2) prone — minimum 16h/session, repeat until P/F no longer responds; (3) NMBA — reduce dyssynchrony and DP; (4) iNO — selective pulmonary vasodilator, reduces V/Q mismatch; (5) recruitment manoeuvre — controversial (ESICM 2023: not recommended routinely); (6) ECMO.","ARDS cor pulmonale and PEEP: RV dilation + D-sign = elevated RV afterload. High PEEP increases RV afterload further. In cor pulmonale — reduce PEEP to lowest compatible with oxygenation, accept worse SpO2, prioritise RV protection. iNO reduces RVSP and may allow higher PEEP.","HFOV in ARDS: OSCAR (no benefit vs conventional ventilation) and OSCILLATE (harm — increased mortality with HFOV). HFOV is NO LONGER recommended in adult ARDS. Do not use as a bridge to ECMO.","iNO mechanism: inhaled nitric oxide → activates guanylate cyclase → cGMP → pulmonary vasodilation in ventilated alveoli → improves V/Q matching → better oxygenation. Inactivated by haemoglobin — no systemic vasodilation. Evidence: improves oxygenation but NO mortality benefit (Cochrane review). Bridge, not treatment."],
    pitfalls:["Increasing PEEP in cor pulmonale: the instinct to increase PEEP when P/F is low is dangerous in RV failure. Each cmH2O of PEEP increases RV afterload. Optimise PEEP (best compliance point), not maximum PEEP.","HFOV as a bridge to ECMO: no evidence and potential harm. Use conventional lung rest ventilation as the bridge to ECMO. HFOV increases mean airway pressure — worsens RV failure.","iNO abrupt cessation: rebound pulmonary vasoconstriction. Wean 5 ppm at a time. Never stop abruptly — especially during the vulnerable pre-ECMO transfer period.","Delayed ECMO referral: once P/F <80 and standard therapies exhausted, refer immediately. ECMO mortality increases with each additional day of failed conventional management."]
  },
{
    id:115, title:"Integrated Case — Multi-Organ Failure & Prognosis", domain:"High-Yield Bonus Cases", difficulty:"High",
    stem:`62M, no significant past medical history. Admitted 10 days ago with community-acquired pneumonia. Rapid deterioration: now has 4-organ failure.

CURRENT STATUS (Day 10):
• RESPIRATORY: P/F 88 on PEEP 14, FiO2 0.80. Proned twice.
• CARDIOVASCULAR: MAP 62 on norad 0.42 + vasopressin 0.03. Echo: LVEF 28%, new global hypokinesis.
• RENAL: anuric. CRRT dependent (CVVHDF 30 mL/kg/h).
• HEPATIC: Bili 188, INR 3.2, ALT 680.
• NEUROLOGICAL: GCS 8. CT: no structural cause. Metabolic encephalopathy.

SOFA score Day 10: 18`,
    progressive_data:["Day 12: SOFA rising to 20. New line of treatment suggested by registrar: IV immunoglobulin for 'possible cytokine storm'.","Family meeting Day 12: wife and two adult children. They ask 'is he going to make it?'","Day 14: SOFA 22. New vasopressor (adrenaline) added. Team morale low. Junior doctor asks 'are we doing the right thing?'","Day 16: MDT and palliative care involved. Goals of care discussion with family concludes with WLST agreed."],
    key_probes:["SOFA score 18 rising to 20 — what does this trajectory tell you about prognosis?","4-organ failure on Day 10 — what is the evidence-based mortality prediction?","The registrar suggests IVIg for 'cytokine storm' — how do you evaluate this suggestion?","Family meeting: wife asks 'is he going to make it?' — what do you say and how?","Junior doctor asks 'are we doing the right thing?' — how do you respond and what does this question tell you about the team?"],
    pearls:["SOFA trajectory: rising SOFA = organ failure accumulating = worsening prognosis. SOFA 18 = predicted mortality 90%+. Rising SOFA despite 48h of maximal treatment is the strongest indicator of futility in multi-organ failure.","4-organ failure mortality: independent of cause, 4 or more organ failures in ICU carries >80% mortality. At Day 10 with 4-organ failure and rising SOFA — the probability of meaningful survival is very low. This should be communicated clearly to the family.","Evaluating novel treatments: apply PICO framework. IVIg in 'cytokine storm' — what is the evidence? Small case series, no RCT in this context. Benefits vs risks (thrombosis, renal failure from sucrose-containing formulations). Discuss as a team but do not add unproven treatments in a dying patient without clear rationale.","SOFA as communication tool: 'His SOFA score has risen from 18 to 20. Every organ system is deteriorating. Based on everything we know, the probability of him leaving hospital alive is less than 10%. I want to be honest with you about this.' Honest, clear, compassionate."],
    pitfalls:["Adding more treatments to avoid having a difficult conversation: escalating vasopressors, adding IVIg, or trying 'one more thing' to delay the goals-of-care conversation prolongs suffering without benefit. The difficult conversation must happen.","Answering 'are we doing the right thing?' defensively: this question from a junior doctor signals moral distress. Acknowledge it: 'That is a really important question and I'm glad you asked it. Let me tell you how I'm thinking about this case.' Support the team.","WLST without adequate symptom management preparation: plan the symptom management BEFORE withdrawing — morphine for dyspnoea, midazolam for distress, hyoscine for secretions. Ensure family are prepared for what they will see.","Not involving palliative care until WLST: palliative care adds value from Day 1 of multi-organ failure in terms of symptom management, communication support, and family guidance. Do not reserve them for the final hours."]
  },
{
    id:116, title:"Post-Cardiac Surgery — Complex Haemodynamics & Mechanical Circulatory Support", domain:"High-Yield Bonus Cases", difficulty:"High",
    stem:`68M, severe ischaemic cardiomyopathy (LVEF 15%), severe MR, severe TR. High-risk quadruple-vessel CABG + MV repair + TV repair. On bypass 3h 42min.

POST-OP HOUR 4:
• MAP 48 on norad 0.5 + dobutamine 10 + vasopressin 0.04 | HR 112 (AF)
• CO 1.6 L/min | SVR 2600 | PCWP 26 | CVP 22 | SvO2 38%
• Lactate 6.8 | Temp 35.2°C | INR 3.8 | Hb 7.4 | Drains 120 mL/h`,
    progressive_data:["IABP inserted. CO improving 1.6→2.1 L/min. SvO2 38→46%. Still inadequate. Cardiac surgical team asks about escalation.","Impella CP inserted. CO improving 2.1→2.8 L/min. SvO2 52%. MAP 62 on reduced vasopressors.","Hour 12: CO 3.1 L/min. SvO2 58%. Lactate 4.2→2.8. Patient slowly improving. Drain output now 40 mL/h.","Day 3: LV stunning resolving on echo. LVEF improving to 30%. Impella weaning trial: CO maintained at 3.0 L/min. Weaning proceeding."],
    key_probes:["SvO2 38% with CO 1.6 — what does this tell you about oxygen delivery vs consumption?","MCS escalation ladder post-cardiac surgery — in what order do you escalate and why?","Impella mechanism — how does it differ from IABP in terms of haemodynamic support?","Prolonged bypass (3h 42min) — what are the specific physiological consequences?","Impella weaning criteria — what parameters guide your weaning decision?"],
    pearls:["SvO2 38%: normal is 65–70%. SvO2 = SaO2 − (VO2/CO × Hb × 1.36). SvO2 38% = severely inadequate O2 delivery relative to consumption. Tissues are extracting >60% of delivered O2. Immediate escalation required — increase CO (inotropes, MCS) or reduce consumption (sedation, temperature control, treat agitation).","MCS escalation post-cardiac surgery: (1) optimise vasopressors/inotropes; (2) IABP (provides ~0.3–0.5 L/min support, reduces afterload); (3) Impella CP (provides 3.5 L/min direct LV support); (4) VA-ECMO (full cardiopulmonary bypass — last resort). Do not jump from inotropes to VA-ECMO without IABP and Impella trials.","Impella vs IABP: IABP deflates in systole (passive afterload reduction, ~0.5 L/min support). Impella actively aspirates blood from LV and delivers to ascending aorta — active forward flow generation, 3.5 L/min support. Impella also directly unloads LV (reduces PCWP).","Prolonged bypass consequences: (1) post-pump vasoplegia (inflammatory response — vasopressin helps); (2) myocardial stunning (improving over 24–48h); (3) coagulopathy (consumption of clotting factors); (4) hypothermia; (5) haemolysis (Hb from shear stress); (6) SIRS response."],
    pitfalls:["AF rate control in post-bypass low output: rate control in AF when CO is 1.6 L/min — AF with rapid rate reduces diastolic filling time and worsens CO. Amiodarone for rate control (also has weak positive inotropic effect). Consider DC cardioversion if haemodynamics allow.","Stopping IABP before Impella trial: do not remove IABP until Impella is clearly providing adequate support and CO is maintained. Staged weaning — wean one device at a time.","Impella in LV thrombus: always echo before Impella insertion. Apical LV thrombus (common in severely impaired LV) → Impella sucks thrombus into aorta → stroke. Echo-guided insertion mandatory.","Temperature and coagulopathy: patient is 35.2°C. Coagulation enzyme activity decreases by 10% per 1°C drop. Active warming is a haemostatic intervention as much as FFP."]
  },
{
    id:117, title:"Rare but High-Stakes — TTP, HUS & Thrombotic Microangiopathy", domain:"High-Yield Bonus Cases", difficulty:"High",
    stem:`32F, previously healthy. Five days of fatigue, headache, and confusion. One day of oliguria.

ED ARRIVAL:
• GCS 13 | HR 118 | BP 178/108 | RR 22 | Temp 37.4°C
• Jaundice ++ | Petechiae on arms and legs

LABS:
• Hb 6.8 | Plt 18 ×10⁹/L | WBC 9.2 (normal)
• Peripheral blood film: numerous schistocytes (fragmented red cells)
• LDH 3200 | Bili 88 | Haptoglobin undetectable | Reticulocytes 8%
• Cr 3.8 | BUN 22 | Urinalysis: haematuria, proteinuria
• Coagulation: PT 12s | APTT 34s | Fibrinogen 3.2 g/L (NORMAL)`,
    progressive_data:["TTP/HUS differential: ADAMTS13 level sent urgently. Pre-treatment sample preserved.","While awaiting ADAMTS13: plasma exchange started empirically (5 volumes/day).","Day 2: ADAMTS13 activity <5% (severely deficient) + ADAMTS13 inhibitor positive. TTP confirmed.","Day 5 on plasma exchange: Plt 88 (rising). LDH 1200 (falling). GCS improving to 15. Cr 2.4 (improving)."],
    key_probes:["The pentad of TTP — what are the five features and how many are required for diagnosis?","TTP vs HUS vs DIC — how do you distinguish them at the bedside and with laboratory tests?","ADAMTS13 — what is it, what does deficiency cause, and why must you take the pre-treatment sample first?","Plasma exchange in TTP — mechanism, urgency, and what if plasma exchange is not immediately available?","Caplacizumab in TTP — mechanism and when is it indicated?"],
    pearls:["TTP pentad: (1) microangiopathic haemolytic anaemia (MAHA — schistocytes, elevated LDH, low haptoglobin); (2) thrombocytopenia; (3) neurological symptoms; (4) renal impairment; (5) fever. Only MAHA + thrombocytopenia required for diagnosis — do not wait for the full pentad.","TTP vs HUS vs DIC: TTP = MAHA + thrombocytopenia + NORMAL coagulation (PT/APTT/fibrinogen normal) — this distinguishes TTP from DIC. HUS = MAHA + thrombocytopenia + predominantly renal failure, typically after E. coli O157:H7 diarrhoea in children (but atypical HUS in adults). DIC = MAHA + coagulopathy (elevated PT/APTT, low fibrinogen, elevated D-dimer).","ADAMTS13: a metalloprotease that cleaves ultra-large von Willebrand factor (vWF) multimers. Deficiency → vWF multimers accumulate → platelet aggregation → microthrombi → MAHA + thrombocytopenia. ADAMTS13 <10% = TTP. Pre-treatment sample is critical — plasma exchange removes ADAMTS13 inhibitor AND replenishes ADAMTS13.","Caplacizumab: anti-vWF nanobody — blocks vWF-platelet interaction, preventing further microvascular thrombosis. Used in combination with plasma exchange in first-line treatment. Rapidly resolves thrombocytopenia. Indicated for all TTP episodes."],
    pitfalls:["Platelet transfusion in TTP: ABSOLUTE CONTRAINDICATION — transfused platelets are immediately consumed in microthrombi, causing stroke and organ failure. Do not transfuse platelets unless life-threatening haemorrhage.","Delaying plasma exchange waiting for ADAMTS13 result: ADAMTS13 results take days. Treat empirically if MAHA + thrombocytopenia + no coagulopathy. Mortality from untreated TTP is 90%. Plasma exchange mortality is low.","Missing TTP in DIC: the key differentiator is coagulation — normal PT/APTT/fibrinogen = TTP. If coagulopathy is present, reconsider — DIC and HUS do not typically cause MAHA with normal coagulation.","Rituximab in refractory or relapsing TTP: rituximab (anti-CD20, depletes B cells producing ADAMTS13 antibody) is used for refractory disease or frequent relapse. Early rituximab reduces relapse rate."]
  },
{
    id:118, title:"Aortic Dissection — Type A & Type B ICU Management", domain:"High-Yield Bonus Cases", difficulty:"High",
    stem:`56M, hypertension. Sudden onset tearing chest pain radiating to the back. 6/10 persistent.

ED ARRIVAL:
• HR 108 | BP right arm 188/112 | BP left arm 142/88 (BP differential 46 mmHg) | RR 22 | Temp 37.1°C
• GCS 15 | New aortic regurgitation murmur

CT AORTOGRAM:
• Type A aortic dissection: intimal flap from aortic root to descending aorta
• No pericardial effusion | Coronary ostia not involved | No visceral malperfusion`,
    progressive_data:["Cardiothoracic surgery: immediate theatre for Type A — emergency aortic root replacement.","Pre-operatively: BP management. HR 108 — esmolol infusion started. Target: HR <60, SBP <120 mmHg.","Post-op Day 1: SBP 78 mmHg. Norad 0.2 mcg/kg/min. CO 2.8 L/min (PA catheter). UO 15 mL/h.","Post-op Day 3: new paraplegia develops — lower limb power 0/5. Spinal cord ischaemia suspected."],
    key_probes:["Type A vs Type B aortic dissection — DeBakey and Stanford classifications, and what each mandates.","BP management pre-operatively in Type A dissection — targets, agents, and sequence.","Post-op Day 1: MAP 52, CO 2.8 — your approach to post-aortic surgery low output.","Spinal cord ischaemia complicating Type B dissection — mechanism and acute management.","Type B dissection — when is it managed medically vs when does it need intervention?"],
    pearls:["Stanford classification: Type A = involves ascending aorta (any extent) — emergency surgery. Type B = confined to descending aorta — medical management unless complicated. DeBakey: I = ascending + arch + descending; II = ascending only; III = descending only.","Pre-operative BP management in Type A: (1) rate control FIRST — esmolol IV (reduces dP/dt — rate of pressure rise). HR target <60 bpm. (2) Then vasodilator if BP still high — sodium nitroprusside or GTN. Never use vasodilator without rate control first — reflex tachycardia from vasodilation worsens the dissection.","Post-aortic surgery low output: causes = (1) bleeding (surgical); (2) tamponade (haemopericardium); (3) myocardial stunning; (4) RV failure; (5) vasoplegia. Echo immediately. Tamponade and bleeding = immediate re-exploration.","Spinal cord ischaemia in Type B: anterior spinal artery arises from intercostal arteries — covered by the dissection flap → cord ischaemia. Acute management: MAP augmentation (>90 mmHg), CSF drainage (lumbar drain to target CSF pressure <10 mmHg to improve spinal cord perfusion pressure), methylprednisolone (limited evidence)."],
    pitfalls:["Vasodilator before rate control: nitroprusside or GTN reduces BP but causes reflex tachycardia — increased dP/dt propagates the dissection. Always control heart rate first with esmolol or labetalol, then add vasodilator if needed.","Missing malperfusion: Type A dissection can compress renal, mesenteric, or limb arteries. New AKI, abdominal pain, or limb ischaemia = malperfusion syndrome — may require pre-operative percutaneous fenestration.","Type B — when to intervene: complicated Type B (malperfusion, rupture, refractory hypertension, rapid expansion) = TEVAR (thoracic endovascular aortic repair). Uncomplicated Type B = medical management with aggressive BP and HR control indefinitely.","Pain as a guide: persistent or recurrent pain in aortic dissection = extension of the dissection. Pain resolved = reassuring. New pain pattern = emergency re-imaging."]
  },
{
    id:119, title:"Haematological Emergencies — Hyperviscosity & Blast Crisis", domain:"High-Yield Bonus Cases", difficulty:"High",
    stem:`68M, known IgM paraproteinaemia (Waldenström's macroglobulinaemia), not yet on treatment. Brought in acutely confused.

ED ARRIVAL:
• GCS 11 | HR 88 | BP 152/88 | Temp 37.2°C | RR 18 | SpO2 94% on 3L
• Visual disturbance — blurred vision | Epistaxis | Gum bleeding
• Fundoscopy: dilated tortuous retinal veins, flame haemorrhages
• Retinal haemorrhage bilateral

LABS:
• Hb 8.2 | WBC 9.2 | Plt 88 | Serum protein 118 g/L (albumin 32 g/L)
• IgM 84 g/L | Serum viscosity 8.2 cP (normal <1.8 cP)
• Na 128 (pseudohyponatraemia) | Cr 1.8`,
    progressive_data:["Plasmapheresis arranged urgently — viscosity reduction target. First session: viscosity 8.2→3.1 cP. GCS improving 11→14.","Ophthalmology: retinal changes improving with viscosity reduction. No vitreous haemorrhage.","Haematology review: chemotherapy (rituximab + bendamustine) planned after viscosity stabilised.","Second scenario: 28M, newly diagnosed AML. WBC 186 ×10⁹/L. GCS 13. Fundoscopy: retinal haemorrhages. Blast crisis management required."],
    key_probes:["Hyperviscosity syndrome — clinical triad and why does high IgM specifically cause it?","Plasmapheresis in hyperviscosity — urgency, mechanism, and what is the target viscosity?","Pseudohyponatraemia in paraproteinaemia — mechanism and does it require treatment?","AML blast crisis (WBC 186 ×10⁹/L) — what is leucostasis and what is your immediate management?","TLS (tumour lysis syndrome) — when do you anticipate it and how do you prevent it?"],
    pearls:["Hyperviscosity syndrome triad: (1) visual disturbance (retinal vein dilatation, haemorrhage); (2) neurological (confusion, headache, stroke); (3) bleeding (platelet dysfunction in high protein milieu). Caused by IgM specifically — pentameric structure, high molecular weight, does not leave vascular space → increases blood viscosity dramatically.","Plasmapheresis in hyperviscosity: immediate — ophthalmological and neurological complications are irreversible. Remove plasma proteins (IgM stays in intravascular space — highly amenable to plasmapheresis). Target viscosity <4 cP or symptom resolution. 1–2 sessions usually sufficient as bridge to chemotherapy.","Pseudohyponatraemia: high paraprotein content displaces water from the plasma volume used for Na measurement. True serum osmolality is normal — no treatment required. Confirm with direct ion-selective electrode measurement.","AML leucostasis: WBC >100 ×10⁹/L — blasts occlude microvascular beds (lung, brain). Treatment: leukapheresis (urgent cytoreduction), hydroxyurea (rapid WBC reduction), avoid unnecessary RBC transfusion (increases viscosity), start induction chemotherapy as soon as possible."],
    pitfalls:["Correcting pseudohyponatraemia with hypertonic saline: pseudohyponatraemia is a laboratory artefact — the patient is not genuinely hyponatraemic. Treating with sodium will cause hypernatraemia and osmotic injury.","Delaying plasmapheresis in symptomatic hyperviscosity: retinal haemorrhages and neurological symptoms require immediate viscosity reduction. Do not wait for haematology input — arrange plasmapheresis urgently and call haematology simultaneously.","RBC transfusion in leucostasis: increasing haematocrit in a patient with WBC 186 dramatically increases viscosity and worsens leucostasis. Transfuse only if Hb <6 g/dL and symptomatic — otherwise defer until after cytoreduction.","TLS prevention: anticipate with aggressive cytoreduction (chemotherapy, leukapheresis). Allopurinol 24–48h before, rasburicase (recombinant uricase) for high-risk or established TLS, aggressive IV hydration, monitor uric acid/K+/phosphate/creatinine every 4–6h."]
  },
{
    id:120, title:"The EDIC Exam — High-Yield Rapid Review", domain:"High-Yield Bonus Cases", difficulty:"High",
    stem:`This is your final session before the EDIC Part 2 exam. The examiner will ask rapid-fire questions across all domains. There is no single patient — this is an integration and synthesis session.

KEY KNOWLEDGE AREAS TO CONSOLIDATE:
• Guidelines: SSC 2021, BTF 4th Ed, ERC/ESICM 2021, ESICM ARDS 2023, ESC IE 2015
• Trial knowledge: PROWESS-SHOCK, ARISE/ProCESS/ProMISe, RECOVERY, EOLIA, NICE-SUGAR, ADRENAL, STARRT-AKI, CRASH-2, CRASH-3, ATN, RENAL, FATE, PROPPR, AQUAMAT
• Mechanisms: why drugs work, not just what they are
• Numbers: thresholds, targets, doses — not vague approximations`,
    progressive_data:["RAPID FIRE ROUND 1: SSC 2021 — name five Hour-1 bundle elements. Which one is most frequently not achieved?","RAPID FIRE ROUND 2: ARDS — Berlin definition criteria. Three severity categories with P/F thresholds. Prone threshold.","RAPID FIRE ROUND 3: Post-arrest — ERC algorithm. How many predictors needed for WLST? Earliest time?","RAPID FIRE ROUND 4: Neurocritical care — ICP threshold. CPP target. Tier 1 to Tier 4 management."],
    key_probes:["SSC 2021 Hour-1 bundle — all five elements with specific thresholds. Which trial changed the antibiotic timing recommendation?","Berlin ARDS — criteria, severity, and the one parameter that matters most for prognosis (hint: it's not P/F ratio).","Give me five numbers from the ERC/ESICM 2021 neuroprognostication guideline — specific numbers, not concepts.","CRASH-2 — the three key numbers from this trial. Why is timing critical?","Name one ICU trial that was positive, then later contradicted — and explain why."],
    pearls:["SSC 2021 Hour-1 bundle: (1) measure lactate (repeat if >2); (2) blood cultures before antibiotics; (3) broad-spectrum antibiotics; (4) 30 mL/kg crystalloid for lactate ≥4 or hypotension; (5) vasopressors if MAP <65 despite fluids. Most frequently missed: antibiotic timing (target <1 hour from recognition).","Berlin ARDS: bilateral infiltrates on CXR/CT, not explained by effusion or collapse, not explained by cardiac failure (or PCWP <18 if measured), P/F <300 on PEEP ≥5. Mild P/F 201–300, Moderate 101–200, Severe ≤100. Driving pressure (ΔP) is more predictive of mortality than P/F ratio.","ERC/ESICM 2021 numbers: prognosticate ≥72h post-ROSC, NSE threshold >60 mcg/L at 48–72h, bilateral absent N20 false positive rate <5%, normothermia for 72h, require ≥2 concordant predictors for poor outcome.","CRASH-2 numbers: 1g TXA within 3 hours of injury, then 1g over 8h. Reduces all-cause mortality by 9% (RRR). After 3 hours: no benefit and increased mortality risk. NNT approximately 67."],
    pitfalls:["Knowing the trial name but not the specific results: the examiner will ask 'what did NICE-SUGAR show?' not 'name a glycaemic control trial'. Know: intervention, comparator, outcome, key number, and clinical implication.","Vague answers on doses and thresholds: 'around 10 mL/kg' or 'about 0.1 units' will fail the EDIC Part 2. Every dose, target, and threshold must be precise. The examiner will ask 'what number exactly?'","Listing treatments without mechanism: 'we give TXA because it reduces bleeding' is insufficient. 'TXA inhibits plasminogen activation and fibrinolysis, reducing clot breakdown' is the expected standard.","Not knowing the key negative trials: PROWESS-SHOCK (activated protein C — no benefit), PRISM (routine steroids in sepsis — no benefit in non-shocked patients), OSCAR/OSCILLATE (HFOV — no benefit/harm in ARDS), EPaNIC (early PN — harm vs late). Negative trials are as examinable as positive ones."]
  }
];

const EXAMINER_SYSTEM = (c) => `You are a senior EDIC Part 2 examiner conducting a live clinical viva. You are reactive and precise. You respond only to what the candidate just said.

CASE: ${c.title} | ${c.domain}
STEM:
${c.stem}

PROGRESSIVE DATA — present each item when the candidate's management logically produces that development. Say "You've done X — here is what happens next:" and give the data:
${c.progressive_data.map((d,i)=>`[${i+1}] ${d}`).join('\n')}

CLINICAL AREAS — probe these as they arise from the candidate's answers, not as a checklist:
${c.key_probes.map((p,i)=>`${i+1}. ${p}`).join('\n')}

HOW TO RESPOND — read the candidate's last message and do ONE of these:
1. They mention a specific drug, device, or intervention → ask the mechanism or the risk: "Why that drug? What does it do here specifically?"
2. They make a correct decision → immediately challenge with a plausible alternative: "Your registrar wants [X] instead. Convince me you're right."
3. They miss something dangerous that is in the clinical context → do not tell them. Ask: "Is there anything about this patient's background you haven't addressed?"
4. They give numbers → push the threshold: "That number — what is it based on? What does the guideline say?"
5. They list multiple things without priority → interrupt: "Stop. Of everything you just said, what happens first and why?"
6. They give a vague answer → "Too vague. Give me a specific number, drug, and dose."
7. Their management logically leads to the next data point → reveal it and ask what they do next.

RULES:
- Respond only to what was just said. One question or one challenge per response.
- 2 sentences maximum. Never more. No bullet points. No lists.
- Never give the answer away. Never correct directly — probe until they get there or reveal they don't know.
- No encouragement. No preamble. Speak like an examiner.`;

const buildMessages = (msgs) => {
  const out = [];
  for (const m of msgs) {
    out.push({ role: m.role==='examiner'?'assistant':'user', content: m.content });
  }
  if (out.length && out[0].role === 'assistant') {
    out.unshift({ role: 'user', content: 'Begin.' });
  }
  return out;
};

const RAG_OPTIONS = [
  { val:'green', label:'✓ Confident', color:'#4CAF50' },
  { val:'amber', label:'⚠ Review',    color:'#FFD54F' },
  { val:'red',   label:'✗ Weak',      color:'#FF5252' },
];

// ─── STORAGE HELPER — fire and forget, never blocks UI ──────────────────────
const persist = (data) => {
  try { window.storage.set('edic_master', JSON.stringify(data)); } catch {}
};

export default function App() {
  const [view, setView]           = useState('dashboard');
  const [activeCase, setActive]   = useState(null);
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [streaming, setStreaming] = useState(false);
  const [progress, setProgress]   = useState({ rag:{}, attempted:{} });

  const endRef   = useRef(null);
  const taRef    = useRef(null);
  const abortRef = useRef(null);
  const msgsRef  = useRef([]);

  // Load progress from storage once on mount
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get('edic_master');
        if (r?.value) {
          const d = JSON.parse(r.value);
          setProgress({ rag: d.rag||{}, attempted: d.attempted||{} });
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages]);

  // Keep msgsRef in sync for use inside stream callback
  useEffect(() => { msgsRef.current = messages; }, [messages]);

  const updateProgress = (patch) => {
    setProgress(prev => {
      const next = { ...prev, ...patch, rag:{...prev.rag,...(patch.rag||{})}, attempted:{...prev.attempted,...(patch.attempted||{})} };
      persist(next);
      return next;
    });
  };

  // ── STREAMING ─────────────────────────────────────────────────────────────
  const runStream = useCallback(async (systemPrompt, apiMsgs, onChunk) => {
    const controller = new AbortController();
    abortRef.current = controller;
    setStreaming(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 200,
          stream: true,
          system: systemPrompt,
          messages: apiMsgs
        })
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const d = line.slice(6).trim();
          if (d === '[DONE]') break;
          try {
            const chunk = JSON.parse(d)?.delta?.text;
            if (chunk) onChunk(chunk);
          } catch {}
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') onChunk(`\n[Connection error: ${e.message}]`);
    } finally {
      setStreaming(false);
      setTimeout(() => taRef.current?.focus(), 50);
    }
  }, []);

  // ── START VIVA ─────────────────────────────────────────────────────────────
  const startViva = (c) => {
    updateProgress({ attempted: { [String(c.id)]: true } });
    setActive(c);
    setView('viva');

    // Show stem + opening question INSTANTLY from local data — zero API wait
    const openingMsg = {
      role: 'examiner',
      content: c.stem + '\n\n' + 'Talk me through your immediate priorities.'
    };
    setMessages([openingMsg]);
  };

  // ── SEND CANDIDATE MESSAGE ─────────────────────────────────────────────────
  const sendMsg = () => {
    if (!input.trim() || streaming) return;
    const text = input.trim();
    setInput('');
    const prev = msgsRef.current;
    const withCandidate = [...prev, { role: 'candidate', content: text }];
    setMessages(withCandidate);

    let reply = '';
    setTimeout(() => {
      runStream(
        EXAMINER_SYSTEM(activeCase),
        buildMessages(withCandidate),
        (chunk) => {
          reply += chunk;
          setMessages([...withCandidate, { role: 'examiner', content: reply }]);
        }
      );
    }, 10);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }
  };

  const saveRag = (id, val) => {
    updateProgress({ rag: { [String(id)]: val } });
  };

  // ── STATS ──────────────────────────────────────────────────────────────────
  const { rag, attempted } = progress;
  const stats = {
    attempted: Object.keys(attempted).length,
    green:  Object.values(rag).filter(v => v==='green').length,
    amber:  Object.values(rag).filter(v => v==='amber').length,
    red:    Object.values(rag).filter(v => v==='red').length,
  };

  // ─────────────────────────────────────────────────────────────────────────
  // DASHBOARD
  // ─────────────────────────────────────────────────────────────────────────
  if (view === 'dashboard') return (
    <div style={{ background:C.bg, minHeight:'100vh', fontFamily:'Calibri,sans-serif', color:C.white, padding:'22px 24px' }}>

      <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:20 }}>
        <div style={{ width:5, height:46, background:C.teal, borderRadius:3 }}/>
        <div>
          <div style={{ fontSize:20, fontWeight:'bold', color:C.teal }}>EDIC Part 2 — CCS Viva Trainer</div>
          <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>All 120 Cases · Full EDIC Part 2 Curriculum</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
        {[
          { l:'Attempted', v:stats.attempted, c:C.teal },
          { l:'Confident', v:stats.green,     c:'#4CAF50' },
          { l:'Review',    v:stats.amber,      c:C.gold },
          { l:'Weak',      v:stats.red,        c:C.coral },
        ].map(s => (
          <div key={s.l} style={{ background:C.card, borderRadius:9, padding:'12px 14px', textAlign:'center', borderTop:`3px solid ${s.c}` }}>
            <div style={{ fontSize:30, fontWeight:'bold', color:s.c, lineHeight:1 }}>{s.v}</div>
            <div style={{ color:C.muted, fontSize:10, marginTop:4, textTransform:'uppercase', letterSpacing:0.8 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom:20 }}>
        <div style={{ height:5, background:C.card2, borderRadius:3, overflow:'hidden', display:'flex' }}>
          <div style={{ width:`${(stats.green/120*100).toFixed(1)}%`, background:'#4CAF50', transition:'width 0.4s' }}/>
          <div style={{ width:`${(stats.amber/120*100).toFixed(1)}%`, background:C.gold, transition:'width 0.4s' }}/>
          <div style={{ width:`${(stats.red/120*100).toFixed(1)}%`, background:C.coral, transition:'width 0.4s' }}/>
          <div style={{ width:`${(stats.attempted - stats.green - stats.amber - stats.red)*10}%`, background:C.teal+'60', transition:'width 0.4s' }}/>
        </div>
        <div style={{ fontSize:10, color:C.muted, marginTop:5 }}>{stats.attempted}/10 attempted · {stats.green + stats.amber + stats.red}/10 rated</div>
      </div>

      {/* Case grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
        {CASES.map(c => {
          const r = rag[String(c.id)];
          const isAttempted = attempted[String(c.id)];
          const rc = r==='green' ? '#4CAF50' : r==='amber' ? C.gold : r==='red' ? C.coral : isAttempted ? C.teal+'80' : '#2A4070';
          const dc = c.difficulty==='High' ? C.coral : C.gold;
          return (
            <div key={c.id} onClick={() => startViva(c)}
              style={{ background:C.card, borderRadius:9, overflow:'hidden', cursor:'pointer', border:`1px solid ${rc}40`, transition:'transform 0.12s, box-shadow 0.12s' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 5px 18px ${C.teal}22`; }}
              onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
              <div style={{ height:4, background:rc }}/>
              <div style={{ padding:'13px 15px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:10, color:C.teal, fontWeight:'bold', textTransform:'uppercase', letterSpacing:1.5 }}>Case {c.id}</div>
                    <div style={{ fontSize:14, fontWeight:'bold', marginTop:3, lineHeight:1.3 }}>{c.title}</div>
                    <div style={{ fontSize:11, color:C.muted, marginTop:3 }}>{c.domain}</div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4, flexShrink:0 }}>
                    <span style={{ background:dc+'18', color:dc, fontSize:10, fontWeight:'bold', padding:'2px 7px', borderRadius:4, border:`1px solid ${dc}40`, textTransform:'uppercase' }}>{c.difficulty}</span>
                    {r && <span style={{ background:rc+'18', color:rc, fontSize:10, fontWeight:'bold', padding:'2px 7px', borderRadius:4, border:`1px solid ${rc}40`, textTransform:'uppercase' }}>{r==='green'?'Confident':r==='amber'?'Review':'Weak'}</span>}
                    {!r && isAttempted && <span style={{ background:C.teal+'18', color:C.teal, fontSize:10, fontWeight:'bold', padding:'2px 7px', borderRadius:4, border:`1px solid ${C.teal}40`, textTransform:'uppercase' }}>Done</span>}
                  </div>
                </div>
                <div style={{ marginTop:9, display:'flex', flexWrap:'wrap', gap:4 }}>
                  {c.key_probes.slice(0,3).map((p,i) => (
                    <span key={i} style={{ fontSize:10, color:C.muted, background:C.bg, padding:'2px 6px', borderRadius:3, border:'1px solid #2A4070' }}>
                      {p.split(' ').slice(0,4).join(' ')}…
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop:18, textAlign:'center', fontSize:11, color:'#2A4070' }}>
        120 Cases · All EDIC Part 2 Domains · Share ↗ to send to colleagues
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // VIVA
  // ─────────────────────────────────────────────────────────────────────────
  if (view === 'viva') return (
    <div style={{ background:C.bg, height:'100vh', display:'flex', flexDirection:'column', fontFamily:'Calibri,sans-serif', color:C.white }}>

      <div style={{ background:C.dark, borderBottom:`2px solid ${C.teal}`, padding:'10px 18px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
        <div>
          <div style={{ fontSize:10, color:C.teal, fontWeight:'bold', textTransform:'uppercase', letterSpacing:1.5 }}>Case {activeCase?.id} · EDIC Part 2 · Live Viva</div>
          <div style={{ fontSize:16, fontWeight:'bold', marginTop:1 }}>{activeCase?.title}</div>
          <div style={{ fontSize:11, color:C.muted }}>{activeCase?.domain}</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => { abortRef.current?.abort(); setView('dashboard'); }}
            style={{ background:'transparent', color:C.muted, border:`1px solid ${C.muted}40`, padding:'6px 13px', borderRadius:7, cursor:'pointer', fontSize:12 }}>← Dashboard</button>
          <button onClick={() => { abortRef.current?.abort(); setView('review'); }}
            style={{ background:C.coral+'22', color:C.coral, border:`1px solid ${C.coral}60`, padding:'6px 13px', borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:'bold' }}>End Viva →</button>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'16px 22px' }}>

        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom:14, display:'flex', justifyContent: m.role==='candidate' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth:'78%',
              background: m.role==='examiner' ? C.card : C.card2,
              borderRadius:10,
              borderLeft:  m.role==='examiner' ? `3px solid ${C.teal}` : 'none',
              borderRight: m.role==='candidate' ? `3px solid ${C.gold}` : 'none',
              padding:'11px 15px', fontSize:14, lineHeight:1.65
            }}>
              <div style={{ fontSize:10, fontWeight:'bold', color: m.role==='examiner' ? C.teal : C.gold, marginBottom:6, textTransform:'uppercase', letterSpacing:1.2 }}>
                {m.role==='examiner' ? '🩺  Examiner' : '👨‍⚕️  You'}
              </div>
              <div style={{ whiteSpace:'pre-wrap' }}>
                {m.content}
                {streaming && i === messages.length-1 && m.role==='examiner' && (
                  <span style={{ display:'inline-block', width:9, height:14, background:C.teal, borderRadius:2, marginLeft:3, verticalAlign:'text-bottom', animation:'cur 0.8s infinite' }}/>
                )}
              </div>
            </div>
          </div>
        ))}
        <style>{`@keyframes cur{0%,100%{opacity:1}50%{opacity:0}}`}</style>
        <div ref={endRef}/>
      </div>

      <div style={{ background:C.dark, borderTop:'1px solid #1E3A5F', padding:'12px 18px', display:'flex', gap:10, alignItems:'flex-end', flexShrink:0 }}>
        <textarea ref={taRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
          placeholder={streaming ? 'Examiner is responding…' : 'Your answer… (Enter to send · Shift+Enter new line)'}
          disabled={streaming}
          style={{ flex:1, background:C.card, color:C.white, border:'1px solid #2A4070', borderRadius:8, padding:'10px 13px', fontSize:14, resize:'none', height:70, fontFamily:'Calibri,sans-serif', outline:'none', opacity:streaming?0.5:1 }}
        />
        <button onClick={sendMsg} disabled={streaming || !input.trim()}
          style={{ background: streaming||!input.trim() ? '#1E3A5F' : C.teal, color: streaming||!input.trim() ? C.muted : C.dark, border:'none', borderRadius:8, padding:'0 20px', height:70, fontSize:20, fontWeight:'bold', cursor: streaming||!input.trim() ? 'not-allowed' : 'pointer', transition:'background 0.2s' }}>➤</button>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // REVIEW
  // ─────────────────────────────────────────────────────────────────────────
  if (view === 'review') {
    const currentRag = rag[String(activeCase?.id)];
    const nextCase = CASES[CASES.findIndex(c => c.id === activeCase?.id) + 1];
    return (
      <div style={{ background:C.bg, minHeight:'100vh', fontFamily:'Calibri,sans-serif', color:C.white, padding:'22px 24px' }}>

        <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:20 }}>
          <div style={{ width:5, height:46, background:C.teal, borderRadius:3 }}/>
          <div>
            <div style={{ fontSize:10, color:C.teal, fontWeight:'bold', textTransform:'uppercase', letterSpacing:1.5 }}>Case {activeCase?.id} · Post-Viva Review</div>
            <div style={{ fontSize:19, fontWeight:'bold' }}>{activeCase?.title}</div>
            <div style={{ fontSize:11, color:C.muted, marginTop:2 }}>{activeCase?.domain}</div>
          </div>
        </div>

        {/* Self-assessment */}
        <div style={{ background:C.card, borderRadius:10, padding:16, marginBottom:14 }}>
          <div style={{ fontWeight:'bold', color:C.gold, marginBottom:4, fontSize:14 }}>Self-Assessment</div>
          <div style={{ color:C.muted, fontSize:12, marginBottom:10 }}>Rate your performance. Updates dashboard instantly.</div>
          <div style={{ display:'flex', gap:9 }}>
            {RAG_OPTIONS.map(r => (
              <button key={r.val} onClick={() => saveRag(activeCase.id, r.val)}
                style={{ flex:1, padding:'11px 6px', borderRadius:8, border:`2px solid ${currentRag===r.val ? r.color : r.color+'30'}`, background: currentRag===r.val ? r.color+'22' : 'transparent', color:r.color, fontWeight:'bold', cursor:'pointer', fontSize:13, transition:'all 0.2s' }}>
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Key probes */}
        <div style={{ background:C.card, borderRadius:10, padding:16, marginBottom:14 }}>
          <div style={{ fontWeight:'bold', color:C.teal, marginBottom:10, fontSize:14 }}>Key Probes</div>
          {activeCase?.key_probes.map((p,i) => (
            <div key={i} style={{ display:'flex', gap:9, marginBottom:8, alignItems:'flex-start' }}>
              <div style={{ color:C.teal, fontWeight:'bold', minWidth:18, fontSize:12 }}>{i+1}.</div>
              <div style={{ fontSize:12, lineHeight:1.55 }}>{p}</div>
            </div>
          ))}
        </div>

        {/* Pearls */}
        <div style={{ background:C.pearlBg, borderLeft:`4px solid ${C.teal}`, borderRadius:10, padding:16, marginBottom:14 }}>
          <div style={{ fontWeight:'bold', color:C.teal, marginBottom:10, fontSize:12, textTransform:'uppercase', letterSpacing:1 }}>ICU Pearls</div>
          {activeCase?.pearls?.map((p,i) => (
            <div key={i} style={{ display:'flex', gap:9, marginBottom:8, alignItems:'flex-start' }}>
              <div style={{ color:C.teal, fontSize:13, flexShrink:0, marginTop:2 }}>◆</div>
              <div style={{ fontSize:12, lineHeight:1.6 }}>{p}</div>
            </div>
          ))}
        </div>

        {/* Pitfalls */}
        <div style={{ background:C.dangerBg, borderLeft:`4px solid ${C.coral}`, borderRadius:10, padding:16, marginBottom:20 }}>
          <div style={{ fontWeight:'bold', color:C.coral, marginBottom:10, fontSize:12, textTransform:'uppercase', letterSpacing:1 }}>Pitfalls</div>
          {activeCase?.pitfalls?.map((p,i) => (
            <div key={i} style={{ display:'flex', gap:9, marginBottom:8, alignItems:'flex-start' }}>
              <div style={{ color:C.coral, fontSize:13, flexShrink:0, marginTop:2 }}>⚠</div>
              <div style={{ fontSize:12, lineHeight:1.6 }}>{p}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'flex', gap:9 }}>
          <button onClick={() => startViva(activeCase)} style={{ flex:1, padding:12, borderRadius:8, border:`1px solid ${C.teal}60`, background:'transparent', color:C.teal, fontWeight:'bold', cursor:'pointer', fontSize:13 }}>↻ Redo</button>
          {nextCase && <button onClick={() => startViva(nextCase)} style={{ flex:1, padding:12, borderRadius:8, border:`1px solid ${C.gold}60`, background:C.gold+'15', color:C.gold, fontWeight:'bold', cursor:'pointer', fontSize:13 }}>Next → Case {nextCase.id}</button>}
          <button onClick={() => setView('dashboard')} style={{ flex:1, padding:12, borderRadius:8, border:'none', background:C.teal, color:C.dark, fontWeight:'bold', cursor:'pointer', fontSize:13 }}>← Dashboard</button>
        </div>
      </div>
    );
  }

  return null;
}
