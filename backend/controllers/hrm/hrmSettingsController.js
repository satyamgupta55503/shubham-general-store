const HrmSettings = require('../../models/hrm/HrmSettings');

exports.get = async (_req, res) => {
  try {
    let s = await HrmSettings.findById('hrm_settings').lean();
    if (!s) s = (await HrmSettings.create({ _id: 'hrm_settings' })).toObject();
    res.json({ ...s, id: s._id });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.update = async (req, res) => {
  try {
    const { _id, __v, created_at, ...updates } = req.body;
    const s = await HrmSettings.findByIdAndUpdate('hrm_settings', { $set:updates }, { new:true, upsert:true });
    res.json({ ...s.toObject(), id: s._id });
  } catch (err) { res.status(400).json({ message: err.message }); }
};
