const HrmPayroll    = require('../../models/hrm/HrmPayroll');
const HrmSalarySlip = require('../../models/hrm/HrmSalarySlip');
const HrmEmployee   = require('../../models/hrm/HrmEmployee');
const HrmAttendance = require('../../models/hrm/HrmAttendance');
const HrmHistory    = require('../../models/hrm/HrmHistory');
const HrmNotification = require('../../models/hrm/HrmNotification');
const HrmSettings   = require('../../models/hrm/HrmSettings');

const log = async (req, action, id, label, desc='') => {
  try { await HrmHistory.create({ actor:req.hrmUser._id, actor_name:req.hrmUser.full_name, action, portal:'hrm', entity_type:'payroll', entity_id:id, entity_label:label, description:desc }); } catch {}
};

// Salary components calculator
function calcComponents(emp, settings) {
  const basic     = emp.current_basic || 0;
  const hra       = Math.round(basic * 0.4);
  const conv      = 1600;
  const medical   = 1250;
  const special   = Math.max(0, (emp.current_ctc / 12) - basic - hra - conv - medical);
  const gross     = basic + hra + conv + medical + special;

  const PF_PCT    = (settings.pf_employee_percent || 12) / 100;
  const ESI_PCT   = (settings.esi_employee_percent || 0.75) / 100;
  const ESI_CEILING = settings.esi_gross_ceiling || 21000;
  const PF_CEILING  = settings.pf_basic_ceiling  || 15000;
  const PT          = settings.professional_tax  || 200;

  const pf  = gross > 0 ? Math.round(Math.min(basic, PF_CEILING) * PF_PCT) : 0;
  const esi = gross <= ESI_CEILING ? Math.round(gross * ESI_PCT) : 0;

  const earnings   = [
    { code:'BASIC', name:'Basic Salary',       amount:basic,    type:'earning' },
    { code:'HRA',   name:'HRA',                amount:hra,      type:'earning' },
    { code:'CONV',  name:'Conveyance',          amount:conv,     type:'earning' },
    { code:'MED',   name:'Medical Allowance',   amount:medical,  type:'earning' },
    { code:'SPEC',  name:'Special Allowance',   amount:special,  type:'earning' },
  ];
  const deductions = [
    { code:'PF',   name:'Provident Fund (12%)', amount:pf,  type:'deduction' },
    { code:'ESI',  name:'ESI (0.75%)',           amount:esi, type:'deduction' },
    { code:'PT',   name:'Professional Tax',      amount:PT,  type:'deduction' },
  ];
  const total_deductions = pf + esi + PT;
  return { earnings, deductions, gross_salary: gross, total_deductions, base_net: gross - total_deductions };
}

// ── List payrolls ─────────────────────────────────────────────────────────────
exports.list = async (_req, res) => {
  try {
    const payrolls = await HrmPayroll.find().sort({ year:-1, month:-1 }).lean();
    res.json(payrolls.map(p => ({ ...p, id: p._id })));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const { month, year } = req.params;
    const payroll = await HrmPayroll.findOne({ month:Number(month), year:Number(year) }).lean();
    if (!payroll) return res.status(404).json({ message: 'Payroll not found' });
    const slips = await HrmSalarySlip.find({ month:Number(month), year:Number(year) })
      .populate('employee','full_name employee_id department').lean();
    res.json({ payroll:{ ...payroll, id:payroll._id }, slips:slips.map(s=>({ ...s, id:s._id })) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Preview (Step 3 of wizard) ────────────────────────────────────────────────
exports.preview = async (req, res) => {
  try {
    const { month, year, department } = req.body;
    const m = Number(month), y = Number(year);
    const settings = await HrmSettings.findById('hrm_settings').lean() || {};

    const startDate = new Date(y, m-1, 1);
    const endDate   = new Date(y, m, 0, 23, 59, 59);
    const working_days = settings.working_days_per_month || 26;

    const empFilter = { status:'active', current_basic:{ $gt:0 } };
    if (department) empFilter.department = department;

    const employees = await HrmEmployee.find(empFilter)
      .populate('department','name').populate('designation','title').lean();

    const allAttendance = await HrmAttendance.find({
      date:{ $gte:startDate, $lte:endDate },
      employee:{ $in: employees.map(e=>e._id) },
    }).lean();

    const attMap = {};
    allAttendance.forEach(a => {
      if (!attMap[a.employee]) attMap[a.employee] = [];
      attMap[a.employee].push(a);
    });

    const previews = employees.map(emp => {
      const recs     = attMap[emp._id] || [];
      const present  = recs.filter(r=>['present','late','wfh'].includes(r.status)).length;
      const lwp_days = Math.max(0, working_days - present - recs.filter(r=>r.status==='on_leave').length);
      const comp     = calcComponents(emp, settings);
      const lwp_ded  = lwp_days > 0 ? Math.round((comp.gross_salary / working_days) * lwp_days) : 0;
      const net      = Math.max(0, comp.base_net - lwp_ded);
      return {
        employee: { id: emp._id, full_name: emp.full_name, employee_id: emp.employee_id, department: emp.department, designation: emp.designation },
        attendance: { present, lwp_days, working_days },
        ...comp, lwp_deduction: lwp_ded, net_salary: net, bonus:0, arrears:0, advance_deduction:0,
      };
    });

    const totals = previews.reduce((acc, p) => ({
      gross: acc.gross + p.gross_salary, deductions: acc.deductions + p.total_deductions + p.lwp_deduction,
      net: acc.net + p.net_salary,
      pf:  acc.pf  + (p.deductions.find(d=>d.code==='PF')?.amount||0),
      esi: acc.esi + (p.deductions.find(d=>d.code==='ESI')?.amount||0),
    }), { gross:0, deductions:0, net:0, pf:0, esi:0 });

    res.json({ month:m, year:y, working_days, employees:previews, totals });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Process payroll (finalize) ────────────────────────────────────────────────
exports.process = async (req, res) => {
  try {
    const { month, year, department, overrides } = req.body;
    const m = Number(month), y = Number(year);
    const settings = await HrmSettings.findById('hrm_settings').lean() || {};

    // Check not already processed
    const existing = await HrmPayroll.findOne({ month:m, year:y });
    if (existing && existing.status === 'processed')
      return res.status(400).json({ message: 'Payroll already processed for this month' });

    const startDate = new Date(y, m-1, 1);
    const endDate   = new Date(y, m, 0, 23, 59, 59);
    const working_days = settings.working_days_per_month || 26;

    const empFilter = { status:'active', current_basic:{ $gt:0 } };
    if (department) empFilter.department = department;
    const employees = await HrmEmployee.find(empFilter)
      .populate('department','name').populate('designation','title').lean();

    const allAtt = await HrmAttendance.find({ date:{$gte:startDate,$lte:endDate}, employee:{$in:employees.map(e=>e._id)} }).lean();
    const attMap = {};
    allAtt.forEach(a => { if(!attMap[a.employee]) attMap[a.employee]=[]; attMap[a.employee].push(a); });

    const slips = [];
    let totalGross=0, totalDed=0, totalNet=0, totalPF=0, totalESI=0;

    for (const emp of employees) {
      const recs    = attMap[emp._id]||[];
      const present = recs.filter(r=>['present','late','wfh'].includes(r.status)).length;
      const lwp_days= Math.max(0, working_days - present - recs.filter(r=>r.status==='on_leave').length);
      const comp    = calcComponents(emp, settings);
      const override = (overrides||{})[emp._id] || {};
      const bonus   = Number(override.bonus)||0;
      const arrears = Number(override.arrears)||0;
      const advance = Number(override.advance_deduction)||0;
      const lwp_ded = lwp_days>0 ? Math.round((comp.gross_salary/working_days)*lwp_days) : 0;
      const net     = Math.max(0, comp.base_net - lwp_ded + bonus + arrears - advance);

      totalGross += comp.gross_salary + bonus + arrears;
      totalDed   += comp.total_deductions + lwp_ded + advance;
      totalNet   += net;
      totalPF    += comp.deductions.find(d=>d.code==='PF')?.amount||0;
      totalESI   += comp.deductions.find(d=>d.code==='ESI')?.amount||0;

      slips.push({
        employee: emp._id,
        month:m, year:y,
        pay_period: `${new Date(y,m-1).toLocaleString('en-IN',{month:'long'})} ${y}`,
        employee_snapshot: {
          full_name:    emp.full_name,
          employee_id:  emp.employee_id,
          department:   emp.department?.name||'',
          designation:  emp.designation?.title||'',
          work_email:   emp.work_email||'',
          uan_number:   emp.uan_number||'',
          pan_number:   emp.pan_number||'',
          bank_name:    emp.bank_name||'',
          account_number: emp.account_number||'',
          ifsc_code:    emp.ifsc_code||'',
          date_of_joining: emp.date_of_joining?.toLocaleDateString('en-IN')||'',
        },
        working_days, present_days:present, lwp_days,
        earnings:   comp.earnings,
        deductions: comp.deductions,
        gross_salary:     comp.gross_salary,
        total_deductions: comp.total_deductions + lwp_ded + advance,
        net_salary: net, lwp_deduction: lwp_ded,
        bonus, arrears, advance_deduction: advance,
      });
    }

    // Upsert payroll run
    const payPeriod = `${new Date(y,m-1).toLocaleString('en-IN',{month:'long'})} ${y}`;
    const payroll = await HrmPayroll.findOneAndUpdate(
      { month:m, year:y },
      { month:m, year:y, pay_period:payPeriod, status:'processed',
        total_employees:employees.length, total_gross:totalGross,
        total_deductions:totalDed, total_net:totalNet,
        total_pf:totalPF, total_esi:totalESI,
        processed_by:req.hrmUser._id, processed_at:new Date() },
      { upsert:true, new:true }
    );

    // Upsert salary slips
    for (const slip of slips) {
      await HrmSalarySlip.findOneAndUpdate(
        { employee:slip.employee, month:m, year:y },
        { ...slip, payroll:payroll._id },
        { upsert:true }
      );
    }

    await log(req, 'payroll_processed', payroll._id, payPeriod, `Processed ${employees.length} employees`);
    await HrmNotification.create({ event_type:'payroll_processed', title:'Payroll Processed', message:`${payPeriod} payroll processed for ${employees.length} employees`, reference_id:payroll._id, reference_type:'payroll' });

    res.json({ payroll:{ ...payroll.toObject(), id:payroll._id }, slips_generated:slips.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.markPaid = async (req, res) => {
  try {
    const { month, year } = req.params;
    const payroll = await HrmPayroll.findOneAndUpdate(
      { month:Number(month), year:Number(year) },
      { status:'paid', paid_at:new Date() }, { new:true }
    );
    if (!payroll) return res.status(404).json({ message: 'Payroll not found' });
    res.json({ ...payroll.toObject(), id:payroll._id });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Salary Slips ──────────────────────────────────────────────────────────────
exports.listSlips = async (req, res) => {
  try {
    const { month, year, employee_id, department } = req.query;
    const filter = {};
    if (month)  filter.month = Number(month);
    if (year)   filter.year  = Number(year);
    if (employee_id) filter.employee = employee_id;

    if (department) {
      const empIds = await HrmEmployee.find({ department }).distinct('_id');
      filter.employee = { $in: empIds };
    }

    const slips = await HrmSalarySlip.find(filter)
      .populate('employee','full_name employee_id department')
      .sort({ year:-1, month:-1 }).lean();
    res.json(slips.map(s=>({ ...s, id:s._id })));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getSlip = async (req, res) => {
  try {
    const slip = await HrmSalarySlip.findById(req.params.id)
      .populate('employee','full_name employee_id department designation').lean();
    if (!slip) return res.status(404).json({ message: 'Salary slip not found' });
    res.json({ ...slip, id:slip._id });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
