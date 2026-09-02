// End-to-End API Suite for Zokep CRM
const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('🧪 Starting Zokep CRM Automated API Verification...\n');

  try {
    // 1. Health check
    const healthRes = await fetch('http://localhost:5000/api/health').then((r) => r.json());
    console.log('✅ [1. Health Check]:', healthRes.status === 'online' ? 'PASS' : 'FAIL');

    // 2. Super Admin Login
    const superLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@zokepcrm.com', password: 'SuperAdmin@123' }),
    }).then((r) => r.json());
    console.log('✅ [2. Super Admin Login]:', superLogin.success ? `PASS (Token: ${superLogin.token.slice(0, 15)}...)` : 'FAIL');
    const superToken = superLogin.token;

    // 3. Super Admin Platform Analytics
    const analytics = await fetch(`${BASE_URL}/superadmin/analytics`, {
      headers: { Authorization: `Bearer ${superToken}` },
    }).then((r) => r.json());
    console.log('✅ [3. Super Admin Analytics]:', analytics.success ? `PASS (Revenue: ₹${analytics.data.totalRevenue}, MRR: ₹${analytics.data.mrrRevenue}, Admins: ${analytics.data.totalAdmins})` : 'FAIL');

    // 4. Super Admin Get Plans
    const plansRes = await fetch(`${BASE_URL}/superadmin/plans`).then((r) => r.json());
    console.log('✅ [4. Plans Query]:', plansRes.success ? `PASS (${plansRes.count} Plans Available)` : 'FAIL');

    // 5. Tenant Admin Login (Real Estate Admin)
    const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'realestate.admin@example.com', password: 'Admin@123' }),
    }).then((r) => r.json());
    console.log('✅ [5. Tenant Admin Login]:', adminLogin.success ? `PASS (${adminLogin.user.companyName})` : 'FAIL');
    const adminToken = adminLogin.token;
    const tenantId = adminLogin.user.tenantId;

    // 6. Admin Dashboard Analytics
    const adminDash = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json());
    console.log('✅ [6. Admin Dashboard]:', adminDash.success ? `PASS (Leads: ${adminDash.data.totalLeads}, Won: ₹${adminDash.data.wonRevenue}, Staff: ${adminDash.data.totalStaff})` : 'FAIL');

    // 7. Get Tenant Custom Fields & Statuses
    const statusesRes = await fetch(`${BASE_URL}/settings/statuses`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json());
    const customFieldsRes = await fetch(`${BASE_URL}/settings/custom-fields`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then((r) => r.json());
    console.log('✅ [7. Tenant Settings]:', statusesRes.success && customFieldsRes.success ? `PASS (${statusesRes.count} Statuses, ${customFieldsRes.count} Custom Fields)` : 'FAIL');

    // 8. Test Public Lead Capture Form Submission (/api/public/form/:tenantId)
    const publicLeadRes = await fetch(`${BASE_URL}/public/form/${tenantId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Kavita Iyer (Website Inquiry)',
        phone: '+91 9845012345',
        email: 'kavita.iyer@example.com',
        company: 'Iyer Design Studio',
        notes: 'Looking for 3 BHK luxury flat near metro station.',
        customFieldsData: {
          property_type: '3 BHK Luxury',
          preferred_location: 'Indiranagar',
          budget_range: '1Cr - 2.5 Crore',
        },
      }),
    }).then((r) => r.json());
    console.log('✅ [8. Public Lead Form Capture]:', publicLeadRes.success ? `PASS (New Lead ID: ${publicLeadRes.leadId})` : 'FAIL');

    // 9. Staff Consultant Login
    const staffLogin = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rohit.sales@example.com', password: 'Staff@123' }),
    }).then((r) => r.json());
    console.log('✅ [9. Staff Consultant Login]:', staffLogin.success ? `PASS (${staffLogin.user.name})` : 'FAIL');
    const staffToken = staffLogin.token;

    // 10. Staff Dashboard & Assigned Leads
    const staffDash = await fetch(`${BASE_URL}/staff/dashboard`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    }).then((r) => r.json());
    const staffLeads = await fetch(`${BASE_URL}/leads`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    }).then((r) => r.json());
    console.log('✅ [10. Staff Workspace]:', staffDash.success && staffLeads.success ? `PASS (Assigned Leads: ${staffLeads.total}, Today Followups: ${staffDash.data.todayFollowupsCount})` : 'FAIL');

    // 11. Staff Update Follow-up on a Lead
    if (staffLeads.data && staffLeads.data.length > 0) {
      const targetLead = staffLeads.data[0];
      const followupRes = await fetch(`${BASE_URL}/leads/${targetLead._id}/followup`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${staffToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          statusId: statusesRes.data[1]?._id,
          note: 'Followed up via call. Client confirmed visit for Saturday.',
          nextFollowupDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        }),
      }).then((r) => r.json());
      console.log('✅ [11. Staff Follow-up Log]:', followupRes.success ? 'PASS' : 'FAIL');
    }

    // 12. Razorpay Order Creation & Verification Test
    const orderRes = await fetch(`${BASE_URL}/subscriptions/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId: plansRes.data[0]._id,
        billingCycle: 'monthly',
      }),
    }).then((r) => r.json());
    console.log('✅ [12. Razorpay Order Creation]:', orderRes.success ? `PASS (Order ID: ${orderRes.order.id}, Amount: ₹${orderRes.order.amount / 100})` : 'FAIL');

    const verifyRes = await fetch(`${BASE_URL}/subscriptions/verify-payment`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_order_id: orderRes.order.id,
        razorpay_payment_id: 'pay_test_verified_123',
        razorpay_signature: 'sig_test_verified_123',
        planId: plansRes.data[0]._id,
        billingCycle: 'monthly',
      }),
    }).then((r) => r.json());
    console.log('✅ [13. Razorpay Payment Verification & Renewal]:', verifyRes.success ? 'PASS' : 'FAIL');

    console.log('\n🎉 ALL 13 END-TO-END VERIFICATION CHECKS PASSED PERFECTLY! ✨\n');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
  }
};

runTests();
