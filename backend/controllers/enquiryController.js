const Enquiry = require("../models/Enquiry");

const TYPES = ["contact", "career", "dealer"];
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RX = /^[+\d][\d\s\-()]{6,18}$/;

const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// @desc    Submit a public enquiry (contact form / job application / dealer enquiry)
// @route   POST /api/enquiry/send            (rate-limited, see routes)
exports.sendEnquiry = async (req, res) => {
  try {
    const b = req.body || {};

    // Honeypot: real users never see/fill this hidden field, bots usually do.
    // Pretend it worked so bots don't learn they were blocked.
    if (str(b.website, 200)) return res.status(201).json({ success: true, message: "Message sent successfully!" });

    const type = TYPES.includes(b.type) ? b.type : "contact";
    const name = str(b.name, 120);
    const email = str(b.email, 160).toLowerCase();
    const phone = str(b.phone, 20);
    const message = str(b.message, 3000);

    if (name.length < 2) return res.status(400).json({ success: false, message: "Please enter your name." });
    if (!EMAIL_RX.test(email)) return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    if (phone && !PHONE_RX.test(phone)) return res.status(400).json({ success: false, message: "Please enter a valid phone number." });
    if (type === "career" && !phone) return res.status(400).json({ success: false, message: "Phone number is required for job applications." });
    if (type !== "career" && message.length < 5) return res.status(400).json({ success: false, message: "Please write a short message." });

    let resumeUrl = str(b.resumeUrl, 500);
    if (resumeUrl && !/^https?:\/\/[^\s]+$/i.test(resumeUrl)) {
      return res.status(400).json({ success: false, message: "Resume link must start with http:// or https://" });
    }

    await Enquiry.create({
      name, email, phone, message, type,
      subject: str(b.subject, 160),
      position: str(b.position, 160),
      experience: str(b.experience, 60),
      resumeUrl,
    });

    // Don't echo the stored document back to the public caller
    res.status(201).json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// @desc    Get all enquiries for CMS  (admin only)   ?type=contact|career|dealer
// @route   GET /api/enquiry/send
exports.getAllEnquiries = async (req, res) => {
  try {
    const filter = {};
    const t = req.query.type;
    if (t === "contact") {
      // Old documents have no `type` field — they are contact messages
      filter.$or = [{ type: "contact" }, { type: { $exists: false } }];
    } else if (TYPES.includes(t)) {
      filter.type = t;
    }
    const enquiries = await Enquiry.find(filter).sort({ createdAt: -1 });
    res.status(200).json(enquiries);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch enquiries." });
  }
};

// @desc    Delete an enquiry (admin only)
// @route   DELETE /api/enquiry/delete/:id
exports.deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const enquiry = await Enquiry.findByIdAndDelete(id);

    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found." });
    }

    res.status(200).json({ message: "Enquiry deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting enquiry." });
  }
};
