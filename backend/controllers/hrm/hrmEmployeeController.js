const HrmEmployee    = require('../../models/hrm/HrmEmployee');
const HrmHistory     = require('../../models/hrm/HrmHistory');
const HrmNotification = require('../../models/hrm/HrmNotification');

const log = async (req, action, id, label, desc = '') => {
  try { await HrmHistory.create({ actor: req.hrmUser._id, actor_name: req.hrmUser.full_name, action, entity_type: 'employee', entity_id: id, entity_label: label, description: desc, ip_address: req.ip }); } catch {}
};

const populateFields = 'department designation reporting_manager';

exports.list = async (req, res) => {
  try {
    const { search, department, status, employment_type, page = 1, limit = 50 } = req.query;
    const filter = {};

    // Department manager scope — only their dept
    if (req.deptScope) filter.department = req.deptScope;
    if (department) filter.department = department;
    if (status)    filter.status = status;
    if (employment_type) filter.employment_type = employment_type;
    if (search) {
      filter.$or = [
        { full_name:      { $regex: search, $options: 'i' } },
        { employee_id:    { $regex: search, $options: 'i' } },
        { work_email:     { $regex: search, $options: 'i' } },
        { personal_email: { $regex: search, $options: 'i' } },
        { phone:          { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [employees, total] = await Promise.all([
      HrmEmployee.find(filter)
        .populate('department', 'name')
        .populate('designation', 'title level')
        .populate('reporting_manager', 'full_name work_email')
        .sort({ date_of_joining: -1 })
        .skip(skip).limit(Number(limit))
        .select('-password -login_attempts -locked_until -aadhaar_number -pan_number -account_number'),
      HrmEmployee.countDocuments(filter),
    ]);
    res.json({ employees, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const emp = await HrmEmployee.findById(req.params.id)
      .populate('department', 'name')
      .populate('designation', 'title level')
      .populate('reporting_manager', 'full_name work_email employee_id');
    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    // Dept manager: restrict to own dept
    if (req.deptScope && emp.department?.toString() !== req.deptScope)
      return res.status(403).json({ message: 'Access denied' });

    const obj = emp.toJSON();
    // Mask sensitive fields for dept_manager only (hr_admin and hr_manager can see all)
    if (req.hrmUser.role === 'dept_manager') {
      delete obj.aadhaar_number; delete obj.pan_number;
      delete obj.account_number; delete obj.ifsc_code;
    }
    res.json(obj);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const {
      full_name, work_email, personal_email, phone,
      department, designation, reporting_manager,
      date_of_joining, employment_type, status,
      date_of_birth, gender, blood_group,
      current_ctc, current_basic,
      bank_name, account_number, ifsc_code, upi_id,
      aadhaar_number, pan_number, pf_number, esi_number, uan_number,
      current_address, permanent_address,
      emergency_contact_name, emergency_contact_phone,
      notes,
    } = req.body;

    if (!full_name || !work_email) return res.status(400).json({ message: 'full_name and work_email required' });

    const exists = await HrmEmployee.findOne({ work_email: work_email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ message: 'Work email already exists' });

    // Temp password: first name + year (employee changes on first EMP login)
    const tempPass = `${full_name.split(' ')[0].toLowerCase()}@${new Date().getFullYear()}`;

    const emp = await HrmEmployee.create({
      full_name: full_name.trim(), work_email: work_email.toLowerCase().trim(),
      personal_email: personal_email || '', phone: phone || '',
      password: tempPass,
      department, designation, reporting_manager,
      date_of_joining: date_of_joining || null,
      employment_type: employment_type || 'full_time',
      status: status || 'active',
      date_of_birth: date_of_birth || null,
      gender: gender || '', blood_group: blood_group || '',
      current_ctc: Number(current_ctc) || 0,
      current_basic: Number(current_basic) || 0,
      bank_name: bank_name || '', account_number: account_number || '',
      ifsc_code: ifsc_code || '', upi_id: upi_id || '',
      aadhaar_number: aadhaar_number || '', pan_number: pan_number || '',
      pf_number: pf_number || '', esi_number: esi_number || '', uan_number: uan_number || '',
      current_address: current_address || '', permanent_address: permanent_address || '',
      emergency_contact_name: emergency_contact_name || '',
      emergency_contact_phone: emergency_contact_phone || '',
      notes: notes || '',
    });

    await log(req, 'created', emp._id, emp.full_name, `Employee ${emp.employee_id} created`);
    await HrmNotification.create({ event_type: 'employee_joined', title: 'New Employee Added', message: `${emp.full_name} (${emp.employee_id}) joined`, reference_id: emp._id, reference_type: 'employee' });

    const result = emp.toJSON();
    result._temp_password = tempPass; // only returned on creation
    res.status(201).json(result);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const emp = await HrmEmployee.findById(id);
    if (!emp) return res.status(404).json({ message: 'Employee not found' });
    if (req.deptScope && emp.department?.toString() !== req.deptScope)
      return res.status(403).json({ message: 'Access denied' });

    // Restrict fields — only dept_manager cannot edit salary/bank
    const restricted = ['password', 'login_attempts', 'locked_until', 'employee_id', 'is_active'];
    if (req.hrmUser.role === 'dept_manager') {
      restricted.push(...['account_number', 'ifsc_code', 'bank_name', 'aadhaar_number', 'pan_number', 'current_ctc', 'current_basic']);
    }
    restricted.forEach(f => delete req.body[f]);

    const updated = await HrmEmployee.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
      .populate('department', 'name').populate('designation', 'title');
    await log(req, 'updated', id, emp.full_name, `Updated employee ${emp.employee_id}`);
    res.json(updated.toJSON());
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deactivate = async (req, res) => {
  try {
    const emp = await HrmEmployee.findByIdAndUpdate(req.params.id, {
      is_active: false, status: req.body.reason === 'resigned' ? 'resigned' : 'terminated',
    }, { new: true });
    if (!emp) return res.status(404).json({ message: 'Employee not found' });
    await log(req, 'status_changed', emp._id, emp.full_name, `Employee ${emp.employee_id} deactivated`);
    await HrmNotification.create({ event_type: 'employee_resigned', title: 'Employee Separated', message: `${emp.full_name} has left the company`, reference_id: emp._id, reference_type: 'employee' });
    res.json({ message: 'Employee deactivated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.resetPassword = async (req, res) => {
  try {
    const emp = await HrmEmployee.findById(req.params.id);
    if (!emp) return res.status(404).json({ message: 'Employee not found' });
    const newPass = `${emp.full_name.split(' ')[0].toLowerCase()}@reset${new Date().getFullYear()}`;
    emp.password = newPass;
    await emp.save();
    await log(req, 'password_changed', emp._id, emp.full_name, 'Password reset by HR');
    res.json({ message: 'Password reset', temp_password: newPass });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Upload employee profile photo (HR uploads on behalf of employee) ──────────
exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const fs   = require('fs');
    const path = require('path');
    const { id } = req.params;

    // Delete old photo if exists
    const existing = await HrmEmployee.findById(id).select('profile_image').lean();
    if (existing?.profile_image) {
      const oldPath = path.join(__dirname, '..', '..', existing.profile_image);
      if (fs.existsSync(oldPath)) fs.unlink(oldPath, () => {});
    }

    const imagePath = `uploads/avatars/${req.file.filename}`;
    const emp = await HrmEmployee.findByIdAndUpdate(
      id, { profile_image: imagePath }, { new: true }
    ).populate('department', 'name').populate('designation', 'title');

    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    await log(req, 'updated', id, emp.full_name, 'Profile photo uploaded by HR');
    res.json({ message: 'Photo uploaded', profile_image: imagePath, employee: emp.toJSON() });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Delete employee profile photo ─────────────────────────────────────────────
exports.deletePhoto = async (req, res) => {
  try {
    const fs   = require('fs');
    const path = require('path');
    const { id } = req.params;

    const existing = await HrmEmployee.findById(id).select('profile_image full_name').lean();
    if (!existing) return res.status(404).json({ message: 'Employee not found' });

    if (existing.profile_image) {
      const filePath = path.join(__dirname, '..', '..', existing.profile_image);
      if (fs.existsSync(filePath)) fs.unlink(filePath, () => {});
    }

    await HrmEmployee.findByIdAndUpdate(id, { profile_image: null });
    await log(req, 'updated', id, existing.full_name, 'Profile photo removed by HR');
    res.json({ message: 'Photo removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
