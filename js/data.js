// Tierney demo data — the one place for jobs, documents, people and the rules that join them.
// Everything here is fictional. Copied from the approved board.

// the document matrix every job draws from
export const CERTS = {
  B: 'Category B licence', C1: 'Category C1 licence', C: 'Category C licence', CE: 'Category CE licence',
  CPC: 'Driver CPC', TACHO: 'Tachograph card', ADR: 'ADR certificate', FORK: 'Counterbalance forklift',
  REACH: 'Reach truck', MH: 'Manual handling', SAFE: 'Safe Pass', HACCP: 'HACCP', FA: 'First aid'
};
// holding a higher licence covers the lower ones
export const IMPLIES = { CE: ['C', 'C1', 'B'], C: ['C1', 'B'], C1: ['B'] };
// licences and cards: missing one of these sends people to Become a driver
export const DRIVING = ['B', 'C1', 'C', 'CE', 'CPC', 'TACHO'];

const J = (id, sector, title, employer, placed, where, shift, pay, req, extra = {}) => ({ id, sector, title, employer, placed, where, shift, pay, req, ...extra });
export const JOBS = [
  J('j1', 'haulage', 'CE driver, trunking', "O'Rourke Logistics", 24, 'Ballycoolin, Dublin 15', 'Days, home every night', '€22.50', ['CE', 'CPC', 'TACHO'], { home: true, vehicle: 'Artic, 44 t', start: '06:00', type: 'days' }),
  J('j2', 'haulage', 'Category C rigid driver, multi-drop', 'Kearney Distribution', 11, 'Athlone, Co. Westmeath', 'Early starts, Mon to Fri', '€19.40', ['C', 'CPC', 'TACHO'], { home: true, vehicle: '18 t rigid, tail lift', start: '05:30', type: 'early' }),
  J('j3', 'haulage', 'CE driver, tramping', 'Confidential client', 0, 'Portlaoise, Co. Laois', 'Nights out, Mon to Fri', '€24.00', ['CE', 'CPC', 'TACHO'], { home: false, vehicle: 'Artic with sleeper cab', start: '07:00', type: 'days' }),
  J('j4', 'haulage', 'C1 driver, chilled deliveries', 'Liffey Fresh', 8, 'Clondalkin, Dublin 22', 'Days, Mon to Fri', '€17.50', ['C1', 'CPC', 'TACHO'], { home: true, vehicle: '7.5 t fridge truck', start: '06:30', type: 'days' }),
  J('j5', 'haulage', 'CE ADR tanker driver', 'Confidential client', 0, 'Dublin Port', 'Days, 4 on 4 off', '€26.50', ['CE', 'CPC', 'TACHO', 'ADR'], { home: true, vehicle: 'Fuel tanker', start: '05:00', type: 'days' }),
  J('j6', 'haulage', 'Van driver, parcel routes', 'Kearney Distribution', 11, 'Naas, Co. Kildare', 'Days, Mon to Fri', '€15.80', ['B'], { home: true, vehicle: 'Large van', start: '07:00', type: 'days' }),
  J('j7', 'haulage', "Category C driver, builders' merchant", 'Midlands Building Supplies', 5, 'Mullingar, Co. Westmeath', 'Days, Saturday half-day', '€18.90', ['C', 'CPC', 'TACHO', 'MH'], { home: true, vehicle: 'Rigid with crane', start: '07:30', type: 'days' }),
  J('j8', 'haulage', 'CE shunter driver', "O'Rourke Logistics", 24, 'Ballycoolin, Dublin 15', 'Nights, Sun to Thu', '€21.00', ['CE', 'CPC'], { home: true, vehicle: 'Yard shunter and artic', start: '22:00', type: 'nights' }),
  J('j9', 'warehouse', 'Counterbalance forklift operator', 'Confidential client', 0, 'Naas, Co. Kildare', 'Nights, 4 on 4 off', '€17.80', ['FORK', 'MH'], { start: '19:00', type: 'nights' }),
  J('j10', 'warehouse', 'Reach truck operator', 'Liffey Fresh', 8, 'Clondalkin, Dublin 22', 'Days, Mon to Fri', '€17.20', ['REACH', 'MH'], { start: '07:00', type: 'days' }),
  J('j11', 'warehouse', 'Warehouse picker, voice picking', 'Northgate Distribution', 19, 'Kilcock, Co. Kildare', 'Nights, Sun to Thu', '€15.60', ['MH'], { start: '22:00', type: 'nights' }),
  J('j12', 'warehouse', 'Goods-in operative', 'Northgate Distribution', 19, 'Kilcock, Co. Kildare', 'Early starts, Mon to Fri', '€14.90', ['MH'], { start: '06:00', type: 'early' }),
  J('j13', 'warehouse', "Forklift operator, builders' yard", 'Midlands Building Supplies', 5, 'Mullingar, Co. Westmeath', 'Days, Mon to Fri', '€16.40', ['FORK', 'SAFE'], { start: '07:30', type: 'days' }),
  J('j14', 'warehouse', 'Chilled warehouse operative', 'Liffey Fresh', 8, 'Clondalkin, Dublin 22', 'Lates, Mon to Fri', '€15.20', ['MH', 'HACCP'], { start: '14:00', type: 'lates' }),
  J('j15', 'warehouse', 'Reach truck operator, nights', 'Confidential client', 0, 'Dublin 12', 'Nights, 4 on 4 off', '€18.30', ['REACH', 'FORK'], { start: '19:00', type: 'nights' }),
  J('j16', 'factory', 'Production operative, packing line', 'Boyne Valley Foods', 37, 'Drogheda, Co. Louth', 'Days or lates, weekly rota', '€15.20', ['HACCP'], { start: '06:00', type: 'days' }),
  J('j17', 'factory', 'Machine operator, packaging', 'Boyne Valley Foods', 37, 'Drogheda, Co. Louth', 'Nights, Mon to Thu', '€16.10', ['MH'], { start: '22:00', type: 'nights' }),
  J('j18', 'factory', 'Hygiene operative', 'Confidential client', 0, 'Navan, Co. Meath', 'Nights, Sun to Thu', '€14.80', ['HACCP'], { start: '22:00', type: 'nights' }),
  J('j19', 'factory', 'Quality control assistant', 'Boyne Valley Foods', 37, 'Drogheda, Co. Louth', 'Days, Mon to Fri', '€16.50', ['HACCP', 'FA'], { start: '07:00', type: 'days' }),
  J('j20', 'factory', 'Line lead', 'Liffey Fresh', 8, 'Clondalkin, Dublin 22', 'Days, Mon to Fri', '€18.00', ['HACCP', 'FA', 'MH'], { start: '06:00', type: 'days' }),
  J('j21', 'haulage', 'Transport planner', "O'Rourke Logistics", 24, 'Ballycoolin, Dublin 15', 'Office hours, Mon to Fri', '€42,000', [], { year: true, start: '08:30', type: 'office' }),
  J('j22', 'warehouse', 'Warehouse supervisor', 'Northgate Distribution', 19, 'Kilcock, Co. Kildare', 'Days, Mon to Fri', '€40,000', ['FORK', 'FA'], { year: true, start: '07:00', type: 'days' }),
  J('j23', 'haulage', 'Fleet compliance coordinator', 'Confidential client', 0, 'Dublin 2, hybrid', 'Office hours, Mon to Fri', '€38,000', [], { year: true, start: '09:00', type: 'office' }),
  J('j24', 'factory', 'Shift manager, food production', 'Confidential client', 0, 'Navan, Co. Meath', 'Rotating days and nights', '€48,000', ['FA', 'HACCP'], { year: true, start: '06:00', type: 'days' })
];
export const byId = id => JOBS.find(j => j.id === id);

// Find a job: filter lists and the For you lists
export const SECTORS = [['all', 'All sectors'], ['haulage', 'Haulage'], ['warehouse', 'Warehouse'], ['factory', 'Factory']];
export const SHIFTS = [['any', 'Any shift'], ['days', 'Days'], ['early', 'Early starts'], ['lates', 'Lates'], ['nights', 'Nights'], ['office', 'Office hours']];
export const county = j => (j.where.match(/Co\. (\w+)/) || [, 'Dublin'])[1];
export const COUNTIES = [['any', 'Any county'], ...[...new Set(JOBS.map(county))].sort().map(c => [c, c])];
// roles people have done (with what that usually means they hold) and roles they want next
export const DONE = [['van', 'Van driver', ['B']], ['c', 'Category C driver', ['C', 'CPC', 'TACHO']], ['ce', 'CE driver', ['CE', 'CPC', 'TACHO']],
  ['fork', 'Forklift operator', ['FORK', 'MH']], ['reach', 'Reach truck operator', ['REACH', 'MH']], ['pick', 'Warehouse picker', ['MH']],
  ['prod', 'Production operative', ['HACCP', 'MH']], ['office', 'Office or planning', []], ['new', 'New to logistics', []]];
export const NEXT = [['driver-c', 'Category C driver', 'haulage', /category c|rigid/i], ['driver-ce', 'CE driver', 'haulage', /\bce\b/i], ['planner', 'Transport office', 'haulage', /planner|compliance/i],
  ['forklift', 'Forklift operator', 'warehouse', /forklift/i], ['reach', 'Reach truck operator', 'warehouse', /reach/i], ['lead', 'Supervisor or line lead', 'factory', /lead|supervisor|manager/i], ['other', 'Other']];

// ---------- rules ----------
// everything a set of documents covers, with the licence hierarchy applied
export const expand = have => { const s = new Set(have); have.forEach(h => (IMPLIES[h] || []).forEach(x => s.add(x))); return s; };
// the job's documents the person does not hold
export const missing = (job, have) => { const s = expand(have); return job.req.filter(r => !s.has(r)); };
// 'ok' = You can apply, 'near' = One cert away, '' = further away
export const fit = (job, have) => { const n = missing(job, have).length; return n === 0 ? 'ok' : n === 1 ? 'near' : ''; };
// the documents a role implies, joined with what the person added by hand
export const implied = (held, done) => { const d = DONE.find(x => x[0] === done); return [...new Set([...held, ...(d ? d[2] : [])])]; };
// filters
export const match = (j, s) => (s.sector === 'all' || j.sector === s.sector) && (s.shift === 'any' || j.type === s.shift) && (s.county === 'any' || county(j) === s.county) && (!s.home || j.home);
// never an empty page: relax home every night, then shift, then county, then everything but the sector
export function filtered(st) {
  let list = JOBS.filter(j => match(j, st)), relaxed = '';
  if (!list.length) for (const [k, v, l] of [['home', false, 'home every night'], ['shift', 'any', 'shift'], ['county', 'any', 'county']]) {
    const s = { ...st, [k]: v }; list = JOBS.filter(j => match(j, s)); if (list.length) { relaxed = l; break; }
  }
  if (!list.length) { list = JOBS.filter(j => st.sector === 'all' || j.sector === st.sector); relaxed = 'shift and county'; }
  return { list, relaxed };
}
// the two For you groups for a list; "One cert away" is never empty
export function groups(list, have) {
  const ok = list.filter(j => fit(j, have) === 'ok'), near = list.filter(j => fit(j, have) === 'near');
  const nearAll = near.length ? near : JOBS.filter(j => fit(j, have) === 'near').slice(0, 4);
  return { ok, near: nearAll };
}
export const sectorCount = s => JOBS.filter(j => j.sector === s).length;

// ---------- people (anonymous) ----------
// Hire staff: the checked pool
export const POOL = [
  ['TR-2481', 'drivers', 'CE driver, 11 years', 'Dublin and Meath', ['CE', 'Driver CPC', 'Tachograph card'], 'Available Monday'],
  ['TR-2517', 'drivers', 'Category C rigid driver, 6 years', 'Kildare and Laois', ['C', 'Driver CPC', 'Tachograph card'], 'Available now'],
  ['TR-2533', 'drivers', 'CE driver with ADR, 14 years', 'Dublin', ['CE', 'Driver CPC', 'ADR'], 'Available in 2 weeks'],
  ['TR-2540', 'drivers', 'C1 driver, chilled, 3 years', 'Dublin West', ['C1', 'Driver CPC', 'Tachograph card'], 'Available now'],
  ['TR-2552', 'warehouse', 'Reach truck operator, 5 years', 'Kildare', ['Reach truck', 'Manual handling'], 'Nights preferred'],
  ['TR-2561', 'warehouse', 'Counterbalance forklift operator, 8 years', 'Westmeath', ['Counterbalance', 'Safe Pass'], 'Available Monday'],
  ['TR-2574', 'warehouse', 'Voice picker, 2 years', 'Kildare and Meath', ['Manual handling'], 'Available now'],
  ['TR-2588', 'factory', 'Line lead, food production, 7 years', 'Louth and Meath', ['HACCP', 'First aid'], 'Available in 1 week'],
  ['TR-2596', 'factory', 'Machine operator, packaging, 4 years', 'Louth', ['Manual handling', 'HACCP'], 'Available now']
];
// Candidate panel: the demo driver
export const CANDIDATE = {
  email: 'demo.driver@tierney.example', password: 'TRN-4821',
  stages: ['Received', 'Reviewed', 'Interview', 'Documents', 'Start'],
  applications: [
    { job: 'j1', stage: 2 },
    { job: 'j9', stage: 1 }
  ],
  documents: [['Category CE licence', 'Valid to 2031'], ['Driver CPC', 'Expires in 43 days', true], ['Tachograph card', 'Valid to 2028']]
};
// Employer panel: the demo client
export const EMPLOYER = {
  email: 'ops@orourke-logistics.example', password: 'demo-password', name: "O'Rourke Logistics",
  stats: '3 open jobs · 4 candidates in progress · 24 people placed with you',
  candidates: [
    ['TR-2481', 'CE driver, 11 years', 'CE driver, trunking', ['CE', 'CPC', 'Tachograph'], 'Interview Thu 10:00', true],
    ['TR-2533', 'CE driver with ADR, 14 years', 'CE driver, trunking', ['CE', 'CPC', 'ADR'], 'Reviewed'],
    ['TR-2604', 'CE driver, 4 years', 'CE shunter driver', ['CE', 'CPC'], 'Documents'],
    ['TR-2611', 'Transport planner, 6 years', 'Transport planner', ['Degree', 'Excel'], 'Received']
  ],
  openJobs: [['j1', '2 candidates'], ['j8', '1 candidate'], ['j21', '1 candidate']],
  consultant: { initials: 'AB', name: 'Aoife Brennan', since: 'Your consultant since 2019', phone: '01 000 6630', email: 'aoife@tierney.example' }
};
