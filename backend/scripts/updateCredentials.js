/**
 * Subham General Store — Update All Portal Credentials
 * Run: node scripts/updateCredentials.js
 *
 * Uses the REAL model definitions to match actual collections.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

// ── NEW CREDENTIALS ─────────────────────────────────────────────────────────
const CREDS = {
  cms: { name: "Subham Gupta",  email: "admin@subhamstore.com", password: "SubhamStore@2026", role: "superadmin" },
  crm: { full_name: "Subham Gupta", email: "crm@subhamstore.com",   password: "CRM@Subham2026",  role: "owner"      },
  hrm: { full_name: "Subham Gupta", email: "hrm@subhamstore.com",   password: "HRM@Subham2026",  role: "hr_admin"   },
  emp: { full_name: "Subham Gupta", work_email: "emp@subhamstore.com", password: "EMP@Subham2026", employee_id: "SGS-EMP-001" },
};

async function hash(pw, rounds = 10) {
  return bcrypt.hash(pw, await bcrypt.genSalt(rounds));
}

async function main() {
  console.log("\n🔄 Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected!\n");

  // ── CMS — collection: users ────────────────────────────────────────────────
  {
    console.log("📝 Updating CMS superadmin...");
    const Schema = new mongoose.Schema({ name:String, email:String, password:String, role:String }, { collection:"users", strict:false });
    const Model  = mongoose.models.SGSUser || mongoose.model("SGSUser", Schema);
    await Model.findOneAndUpdate(
      { role: "superadmin" },
      { name: CREDS.cms.name, email: CREDS.cms.email, password: await hash(CREDS.cms.password, 12), role: "superadmin" },
      { upsert: true }
    );
    console.log(`   ✅ ${CREDS.cms.email}  /  ${CREDS.cms.password}`);
  }

  // ── CRM — collection: crm_users ───────────────────────────────────────────
  // Fields: full_name, email, password, role, is_active (MUST be true for login)
  // login_attempts must be 0, locked_until null
  {
    console.log("💼 Updating CRM owner...");
    const Schema = new mongoose.Schema(
      { _id:{ type:String, default:uuidv4 }, full_name:String, email:String, password:String, role:String,
        is_active:{ type:Boolean, default:false }, page_access:{ type:[String], default:[] },
        login_attempts:{ type:Number, default:0 }, locked_until:{ type:Date, default:null },
        last_login:Date, token_version:{ type:Number, default:0 },
        access_granted_by:{ type:String, default:null }, access_granted_at:{ type:Date, default:null },
      },
      { collection:"crm_users", strict:false }
    );
    const Model = mongoose.models.SGSCrmUser || mongoose.model("SGSCrmUser", Schema);

    // Remove any old owner first to avoid email conflict
    await Model.deleteMany({ role: "owner" });

    await Model.create({
      _id:            uuidv4(),
      full_name:      CREDS.crm.full_name,
      email:          CREDS.crm.email,
      password:       await hash(CREDS.crm.password, 10),
      role:           "owner",
      is_active:      true,        // ← CRITICAL: must be true to login
      page_access:    [],
      login_attempts: 0,
      locked_until:   null,
      token_version:  0,
    });
    console.log(`   ✅ ${CREDS.crm.email}  /  ${CREDS.crm.password}`);
  }

  // ── HRM — collection: hrm_users ───────────────────────────────────────────
  // Fields: full_name, email, password, role, is_active (MUST be true)
  {
    console.log("👥 Updating HRM hr_admin...");
    const Schema = new mongoose.Schema(
      { _id:{ type:String, default:uuidv4 }, full_name:String, email:String, password:String, role:String,
        is_active:{ type:Boolean, default:false }, page_access:{ type:[String], default:[] },
        login_attempts:{ type:Number, default:0 }, locked_until:{ type:Date, default:null },
        last_login:Date, token_version:{ type:Number, default:0 },
        access_granted_by:String, access_granted_at:Date,
      },
      { collection:"hrm_users", strict:false }
    );
    const Model = mongoose.models.SGSHrmUser || mongoose.model("SGSHrmUser", Schema);

    await Model.deleteMany({ role: "hr_admin" });

    await Model.create({
      _id:            uuidv4(),
      full_name:      CREDS.hrm.full_name,
      email:          CREDS.hrm.email,
      password:       await hash(CREDS.hrm.password, 10),
      role:           "hr_admin",
      is_active:      true,        // ← CRITICAL: must be true to login
      page_access:    [],
      login_attempts: 0,
      locked_until:   null,
      token_version:  0,
    });
    console.log(`   ✅ ${CREDS.hrm.email}  /  ${CREDS.hrm.password}`);
  }

  // ── EMP — collection: hrm_employees ──────────────────────────────────────
  // Fields: full_name, work_email, password, employee_id, is_active, status
  {
    console.log("👤 Updating EMP employee...");
    const Schema = new mongoose.Schema(
      { _id:{ type:String, default:uuidv4 }, full_name:String, work_email:String, password:String,
        employee_id:String, is_active:{ type:Boolean, default:true },
        status:{ type:String, default:"active" },
        login_attempts:{ type:Number, default:0 }, locked_until:{ type:Date, default:null },
        token_version:{ type:Number, default:0 },
      },
      { collection:"hrm_employees", strict:false }
    );
    const Model = mongoose.models.SGSHrmEmployee || mongoose.model("SGSHrmEmployee", Schema);

    await Model.findOneAndUpdate(
      { employee_id: CREDS.emp.employee_id },
      {
        full_name:      CREDS.emp.full_name,
        work_email:     CREDS.emp.work_email,
        password:       await hash(CREDS.emp.password, 10),
        employee_id:    CREDS.emp.employee_id,
        is_active:      true,
        status:         "active",
        login_attempts: 0,
        locked_until:   null,
      },
      { upsert: true }
    );
    console.log(`   ✅ ${CREDS.emp.work_email}  /  ${CREDS.emp.password}`);
  }

  // ── DONE ──────────────────────────────────────────────────────────────────
  console.log("\n🎉 ALL CREDENTIALS UPDATED SUCCESSFULLY!\n");
  console.log("┌─────────────────────────────────────────────────────────┐");
  console.log("│          SUBHAM GENERAL STORE — NEW CREDENTIALS         │");
  console.log("├──────────┬──────────────────────────┬───────────────────┤");
  console.log("│ Portal   │ Email                    │ Password          │");
  console.log("├──────────┼──────────────────────────┼───────────────────┤");
  console.log(`│ CMS      │ ${CREDS.cms.email.padEnd(24)} │ ${CREDS.cms.password.padEnd(17)} │`);
  console.log(`│ CRM      │ ${CREDS.crm.email.padEnd(24)} │ ${CREDS.crm.password.padEnd(17)} │`);
  console.log(`│ HRM      │ ${CREDS.hrm.email.padEnd(24)} │ ${CREDS.hrm.password.padEnd(17)} │`);
  console.log(`│ EMP      │ ${CREDS.emp.work_email.padEnd(24)} │ ${CREDS.emp.password.padEnd(17)} │`);
  console.log("└──────────┴──────────────────────────┴───────────────────┘\n");

  await mongoose.connection.close();
  process.exit(0);
}

main().catch(err => {
  console.error("\n❌ Error:", err.message);
  console.error(err.stack);
  process.exit(1);
});
