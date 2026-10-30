const HrmSalarySlip = require('../../models/hrm/HrmSalarySlip');
const HrmEmployee   = require('../../models/hrm/HrmEmployee');

exports.mySlips = async (req, res) => {
  try {
    const slips = await HrmSalarySlip.find({ employee: req.empUser._id })
      .sort({ year:-1, month:-1 }).lean();
    res.json(slips.map(s=>({ ...s, id:s._id })));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getSlip = async (req, res) => {
  try {
    const slip = await HrmSalarySlip.findOne({ _id:req.params.id, employee:req.empUser._id }).lean();
    if (!slip) return res.status(404).json({ message: 'Salary slip not found' });
    res.json({ ...slip, id:slip._id });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.ctc = async (req, res) => {
  try {
    const emp = await HrmEmployee.findById(req.empUser._id)
      .select('current_ctc current_basic full_name employee_id').lean();
    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    const basic    = emp.current_basic || 0;
    const hra      = Math.round(basic * 0.4);
    const conv     = 1600, medical = 1250;
    const special  = Math.max(0, (emp.current_ctc/12) - basic - hra - conv - medical);
    const gross    = basic + hra + conv + medical + special;
    const pf       = Math.round(Math.min(basic, 15000) * 0.12);
    const esi      = gross <= 21000 ? Math.round(gross * 0.0075) : 0;
    const pt       = 200;
    const totalDed = pf + esi + pt;
    const net      = gross - totalDed;

    res.json({
      annual_ctc: emp.current_ctc,
      monthly: {
        gross, total_deductions: totalDed, net_salary: net,
        earnings: [
          { code:'BASIC', name:'Basic Salary', amount:basic },
          { code:'HRA',   name:'HRA',           amount:hra },
          { code:'CONV',  name:'Conveyance',     amount:conv },
          { code:'MED',   name:'Medical',         amount:medical },
          { code:'SPEC',  name:'Special Allowance',amount:special },
        ],
        deductions: [
          { code:'PF',  name:'Provident Fund (12%)',   amount:pf },
          { code:'ESI', name:'ESI (0.75%)',             amount:esi },
          { code:'PT',  name:'Professional Tax',        amount:pt },
        ],
      },
      annual: {
        gross:      gross*12,   total_deductions: totalDed*12,
        net_salary: net*12,     ctc: emp.current_ctc,
      },
      employer_contributions: {
        pf_employer:  Math.round(Math.min(basic,15000)*0.12),
        esi_employer: gross <= 21000 ? Math.round(gross*0.0325) : 0,
        gratuity:     Math.round(basic*0.0481),
      },
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
