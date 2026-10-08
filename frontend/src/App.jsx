import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:8080/api";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState("Dashboard");

  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [subscriptionDetails, setSubscriptionDetails] = useState([]);
  const [aboveAveragePlans, setAboveAveragePlans] = useState([]);

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [customerSaving, setCustomerSaving] = useState(false);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (loggedIn) {
      loadData();
    }
  }, [loggedIn]);

  const loadData = async () => {
    setLoading(true);

    try {
      const [
        customersResponse,
        plansResponse,
        subscriptionsResponse,
        paymentsResponse,
        detailsResponse,
        averageResponse
      ] = await Promise.all([
        axios.get(`${API}/customers`),
        axios.get(`${API}/plans`),
        axios.get(`${API}/subscriptions`),
        axios.get(`${API}/payments`),
        axios.get(`${API}/subscriptions/details`),
        axios.get(`${API}/plans/above-average-subscribers`)
      ]);

      setCustomers(customersResponse.data);
      setPlans(plansResponse.data);
      setSubscriptions(subscriptionsResponse.data);
      setPayments(paymentsResponse.data);
      setSubscriptionDetails(detailsResponse.data);
      setAboveAveragePlans(averageResponse.data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (event) => {
    event.preventDefault();

    if (!customerForm.name.trim() || !customerForm.email.trim()) {
      alert("Name and email are required.");
      return;
    }

    try {
      setCustomerSaving(true);

      await axios.post(`${API}/customers`, {
        name: customerForm.name.trim(),
        email: customerForm.email.trim(),
        phone: customerForm.phone.trim()
      });

      alert("Customer added successfully.");

      setCustomerForm({
        name: "",
        email: "",
        phone: ""
      });

      setShowCustomerModal(false);
      await loadData();
    } catch (error) {
      console.error("Error adding customer:", error);

      if (error.response?.status === 409) {
        alert("This email is already registered.");
      } else {
        alert(
            error.response?.data?.message ||
            "Unable to add customer. Please try again."
        );
      }
    } finally {
      setCustomerSaving(false);
    }
  };

  const handleLogin = async (email, password) => {
    if (!email.trim() || !password.trim()) {
      alert("Please enter your email and password.");
      return;
    }

    try {
      const response = await axios.post(`${API}/auth/login`, {
        email: email.trim(),
        password: password
      });

      console.log("Login successful:", response.data);

      setLoggedIn(true);

    } catch (error) {
      console.error("Login failed:", error);

      alert("Invalid email or password.");
    }
  };
  const logout = () => {
    setLoggedIn(false);
    setActivePage("Dashboard");
  };

  const activateSubscription = async (id) => {
    try {
      await axios.put(`${API}/subscriptions/${id}/activate`);
      alert("Subscription activated successfully.");
      loadData();
    } catch (error) {
      alert("Unable to activate subscription.");
      console.error(error);
    }
  };

  if (!loggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
      <div className="app-container">

        <Sidebar
            activePage={activePage}
            setActivePage={setActivePage}
            logout={logout}
        />

        <main className="main-content">

          <TopBar
              activePage={activePage}
              search={search}
              setSearch={setSearch}
          />

          {loading && (
              <div className="loading-bar">
                Loading ISP data...
              </div>
          )}

          {activePage === "Dashboard" && (
              <Dashboard
                  customers={customers}
                  plans={plans}
                  subscriptions={subscriptions}
                  payments={payments}
                  aboveAveragePlans={aboveAveragePlans}
                  setActivePage={setActivePage}
              />
          )}

          {activePage === "Customers" && (
              <CustomersPage
                  customers={customers}
                  search={search}
                  onAddCustomer={() => setShowCustomerModal(true)}
              />
          )}

          {activePage === "Plans" && (
              <PlansPage
                  plans={plans}
                  aboveAveragePlans={aboveAveragePlans}
                  search={search}
                  loadData={loadData}
              />
          )}

          {activePage === "Subscriptions" && (
              <SubscriptionsPage
                  subscriptions={subscriptions}
                  subscriptionDetails={subscriptionDetails}
                  customers={customers}
                  plans={plans}
                  search={search}
                  activateSubscription={activateSubscription}
                  onSubscriptionCreated={loadData}
              />
          )}

          {activePage === "Payments" && (
              <PaymentsPage
                  payments={payments}
                  subscriptions={subscriptions}
                  search={search}
                  onPaymentCreated={loadData}
              />
          )}

          {activePage === "Reports" && (
              <ReportsPage
                  customers={customers}
                  plans={plans}
                  subscriptions={subscriptions}
                  payments={payments}
                  aboveAveragePlans={aboveAveragePlans}
              />
          )}

          {showCustomerModal && (
              <CustomerModal
                  form={customerForm}
                  setForm={setCustomerForm}
                  onSubmit={addCustomer}
                  onClose={() => {
                    if (!customerSaving) {
                      setShowCustomerModal(false);
                    }
                  }}
                  saving={customerSaving}
              />
          )}

        </main>
      </div>
  );
}


/* =========================
   LOGIN PAGE
========================= */

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitLogin = (event) => {
    event.preventDefault();
    onLogin(email, password);
  };

  return (
      <div className="login-page">

        <div className="login-left">

          <div className="brand-large">
            <div className="brand-icon">N</div>
            <span>NetSphere</span>
          </div>

          <div className="login-intro">
            <span className="eyebrow">ISP MANAGEMENT PLATFORM</span>

            <h1>
              Manage your network.
              <br />
              <span>Grow your business.</span>
            </h1>

            <p>
              A unified platform for managing customers, internet plans,
              subscriptions and payments.
            </p>

            <div className="login-features">
              <div>
                <span>✓</span>
                Customer management
              </div>

              <div>
                <span>✓</span>
                Subscription monitoring
              </div>

              <div>
                <span>✓</span>
                Payment tracking
              </div>
            </div>
          </div>

          <div className="login-footer">
            © 2026 NetSphere ISP Management
          </div>
        </div>

        <div className="login-right">

          <form className="login-card" onSubmit={submitLogin}>

            <div className="mobile-brand">
              <div className="brand-icon">N</div>
              <span>NetSphere</span>
            </div>

            <div className="login-heading">
              <h2>Welcome back</h2>
              <p>Sign in to access your management dashboard.</p>
            </div>

            <label>Email address</label>

            <input
                type="email"
                placeholder="admin@netsphere.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <label>Password</label>

            <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />

            <div className="login-options">
              <label className="remember">
                <input type="checkbox" />
                Remember me
              </label>

              <button
                  type="button"
                  className="forgot-button"
              >
                Forgot password?
              </button>
            </div>

            <button className="login-button" type="submit">
              Sign in
              <span>→</span>
            </button>

            <div className="demo-login">
              Demo mode — enter any email and password
            </div>

          </form>

        </div>
      </div>
  );
}


/* =========================
   SIDEBAR
========================= */

function Sidebar({ activePage, setActivePage, logout }) {

  const menuItems = [
    { name: "Dashboard", icon: "▦" },
    { name: "Customers", icon: "♙" },
    { name: "Plans", icon: "◈" },
    { name: "Subscriptions", icon: "▤" },
    { name: "Payments", icon: "◉" },
    { name: "Reports", icon: "▥" }
  ];

  return (
      <aside className="sidebar">

        <div className="sidebar-brand">
          <div className="brand-icon small">N</div>

          <div>
            <strong>NetSphere</strong>
            <span>ISP MANAGEMENT</span>
          </div>
        </div>

        <div className="menu-title">
          MAIN MENU
        </div>

        <nav className="sidebar-menu">

          {menuItems.map((item) => (
              <button
                  key={item.name}
                  className={
                    activePage === item.name
                        ? "menu-item active"
                        : "menu-item"
                  }
                  onClick={() => setActivePage(item.name)}
              >
            <span className="menu-icon">
              {item.icon}
            </span>

                <span>{item.name}</span>
              </button>
          ))}

        </nav>

        <div className="sidebar-bottom">

          <div className="support-card">
            <div className="support-icon">?</div>

            <div>
              <strong>Need help?</strong>
              <span>Contact support</span>
            </div>
          </div>

          <button
              className="logout-button"
              onClick={logout}
          >
            <span>↪</span>
            Sign out
          </button>

        </div>

      </aside>
  );
}
  /* =========================
     TOP BAR
  ========================= */

  function TopBar({
                    activePage,
                    search,
                    setSearch
                  }) {

    const pageDescriptions = {
      Dashboard:
          "Overview of your ISP management system",

      Customers:
          "Manage registered customers and contact information",

      Plans:
          "Manage internet plans and pricing",

      Subscriptions:
          "Monitor customer subscriptions and plan status",

      Payments:
          "Track payments and transaction activity",

      Reports:
          "Monitor business performance and analytics"
    };

    const description =
        pageDescriptions[activePage] ||
        "ISP management system";

    return (
        <header
            style={{
              height: "86px",
              background: "#ffffff",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 32px",
              position: "sticky",
              top: 0,
              zIndex: 50,
              boxSizing: "border-box"
            }}
        >

          {/* =========================
          LEFT SIDE
        ========================= */}

          <div
              style={{
                width: "520px",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                gap: "5px"
              }}
          >

            {/* Breadcrumb */}

            <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  fontSize: "11px",
                  color: "#94a3b8",
                  fontWeight: "500"
                }}
            >

            <span>
              NetSphere
            </span>

              <span
                  style={{
                    color: "#cbd5e1"
                  }}
              >
              /
            </span>

              <span
                  style={{
                    color: "#64748b"
                  }}
              >
              {activePage}
            </span>

            </div>


            {/* Page title */}

            <h1
                style={{
                  margin: 0,
                  fontSize: "21px",
                  lineHeight: "1.2",
                  fontWeight: "700",
                  color: "#111827",
                  letterSpacing: "-0.3px"
                }}
            >
              {activePage === "Reports"
                  ? "Reports & Analytics"
                  : activePage}
            </h1>


            {/* Description */}

            <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  color: "#94a3b8",
                  whiteSpace: "nowrap"
                }}
            >
              {description}
            </p>

          </div>


          {/* =========================
          RIGHT SIDE
        ========================= */}

          <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "18px",
                flexShrink: 0
              }}
          >

            {/* SEARCH */}

            <div
                style={{
                  width: "245px",
                  height: "38px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "9px",
                  background: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 11px",
                  boxSizing: "border-box"
                }}
            >

            <span
                style={{
                  fontSize: "18px",
                  color: "#94a3b8",
                  lineHeight: 1,
                  marginRight: "8px"
                }}
            >
              ⌕
            </span>

              <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) =>
                      setSearch(e.target.value)
                  }
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    width: "100%",
                    fontSize: "13px",
                    color: "#334155"
                  }}
              />

              <span
                  style={{
                    fontSize: "10px",
                    color: "#94a3b8",
                    border: "1px solid #e2e8f0",
                    background: "#ffffff",
                    borderRadius: "5px",
                    padding: "3px 6px",
                    whiteSpace: "nowrap"
                  }}
              >
              Ctrl K
            </span>

            </div>


            {/* DIVIDER */}

            <div
                style={{
                  width: "1px",
                  height: "30px",
                  background: "#e5e7eb"
                }}
            />


            {/* NOTIFICATION */}

            <button
                type="button"
                title="Notifications"
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "9px",
                  border: "1px solid #e5e7eb",
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  position: "relative",
                  color: "#475569",
                  fontSize: "17px"
                }}
            >

            <span>
              ♧
            </span>

              <span
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#2563eb",
                    border: "2px solid #ffffff"
                  }}
              />

            </button>


            {/* PROFILE */}

            <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  paddingLeft: "2px"
                }}
            >

              {/* Avatar */}

              <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "10px",
                    background:
                        "linear-gradient(135deg, #2563eb, #1d4ed8)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: "700",
                    boxShadow:
                        "0 3px 8px rgba(37, 99, 235, 0.20)"
                  }}
              >
                A
              </div>


              {/* User information */}

              <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px"
                  }}
              >

                <strong
                    style={{
                      fontSize: "13px",
                      color: "#1e293b",
                      fontWeight: "600",
                      lineHeight: "1.2"
                    }}
                >
                  Administrator
                </strong>

                <span
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      lineHeight: "1.2"
                    }}
                >
                Super Admin
              </span>

              </div>


              {/* Arrow */}

              <span
                  style={{
                    marginLeft: "3px",
                    color: "#94a3b8",
                    fontSize: "14px"
                  }}
              >
              ▾
            </span>

            </div>

          </div>

        </header>
    );

}


/* =========================
   DASHBOARD
========================= */

function Dashboard({
                     customers,
                     plans,
                     subscriptions,
                     payments,
                     aboveAveragePlans,
                     setActivePage
                   }) {

  const activeSubscriptions =
      subscriptions.filter(
          (s) => s.status === "ACTIVE"
      ).length;

  const pendingSubscriptions =
      subscriptions.filter(
          (s) => s.status === "PENDING"
      ).length;

  const totalRevenue =
      payments.reduce(
          (total, payment) =>
              total + Number(payment.amount || 0),
          0
      );

  const stats = [
    {
      title: "Total Customers",
      value: customers.length,
      change: "Registered customers",
      icon: "♙",
      className: "blue"
    },
    {
      title: "Active Subscriptions",
      value: activeSubscriptions,
      change: `${pendingSubscriptions} pending`,
      icon: "✓",
      className: "green"
    },
    {
      title: "Available Plans",
      value: plans.length,
      change: "Internet plans",
      icon: "◈",
      className: "purple"
    },
    {
      title: "Total Payments",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      change: `${payments.length} transactions`,
      icon: "₹",
      className: "orange"
    }
  ];

  return (
      <div className="dashboard">

        <section className="welcome-banner">

          <div>
          <span className="eyebrow">
            OVERVIEW
          </span>

            <h2>
              Good to see you, Administrator.
            </h2>

            <p>
              Here's what's happening with your ISP
              network today.
            </p>
          </div>

          <div className="network-visual">
            <div className="network-circle">
              <span>◉</span>
            </div>
          </div>

        </section>


        <section className="stats-grid">

          {stats.map((stat) => (
              <div className="stat-card" key={stat.title}>

                <div className="stat-top">
                  <div>
                <span className="stat-title">
                  {stat.title}
                </span>

                    <strong className="stat-value">
                      {stat.value}
                    </strong>
                  </div>

                  <div className={`stat-icon ${stat.className}`}>
                    {stat.icon}
                  </div>
                </div>

                <div className="stat-change">
                  {stat.change}
                </div>

              </div>
          ))}

        </section>


        <section className="dashboard-grid">

          <div className="panel">

            <div className="panel-header">
              <div>
                <h3>Subscription Overview</h3>
                <p>Current subscription distribution</p>
              </div>

              <button
                  onClick={() => setActivePage("Subscriptions")}
                  className="text-button"
              >
                View all →
              </button>
            </div>

            <div className="subscription-overview">

              <div className="donut-container">

                <div className="donut">
                  <div className="donut-center">
                    <strong>{subscriptions.length}</strong>
                    <span>Total</span>
                  </div>
                </div>

              </div>

              <div className="legend">

                <div>
                  <span className="legend-dot active-dot"></span>
                  <span>Active</span>
                  <strong>{activeSubscriptions}</strong>
                </div>

                <div>
                  <span className="legend-dot pending-dot"></span>
                  <span>Pending</span>
                  <strong>{pendingSubscriptions}</strong>
                </div>

              </div>

            </div>

          </div>


          <div className="panel">

            <div className="panel-header">
              <div>
                <h3>Popular Plans</h3>
                <p>Plans with above-average subscribers</p>
              </div>

              <button
                  onClick={() => setActivePage("Plans")}
                  className="text-button"
              >
                View all →
              </button>
            </div>

            <div className="popular-plans">

              {aboveAveragePlans.length === 0 ? (
                  <div className="empty-state">
                    No above-average plans found.
                  </div>
              ) : (
                  aboveAveragePlans.map((plan) => (
                      <div
                          className="popular-plan"
                          key={plan.planId}
                      >
                        <div className="plan-symbol">
                          ◈
                        </div>

                        <div className="plan-details">
                          <strong>{plan.planName}</strong>
                          <span>
                      {plan.subscriberCount} subscribers
                    </span>
                        </div>

                        <div className="plan-bar">
                    <span
                        style={{
                          width: `${Math.min(
                              plan.subscriberCount * 20,
                              100
                          )}%`
                        }}
                    ></span>
                        </div>

                      </div>
                  ))
              )}

            </div>

          </div>

        </section>


        <section className="panel recent-panel">

          <div className="panel-header">

            <div>
              <h3>Recent Subscriptions</h3>
              <p>Latest customer subscriptions</p>
            </div>

            <button
                onClick={() => setActivePage("Subscriptions")}
                className="text-button"
            >
              View all →
            </button>

          </div>

          <SubscriptionTable
              subscriptions={subscriptions.slice(0, 5)}
              compact
          />

        </section>

      </div>
  );
}


/* =========================
   CUSTOMERS
========================= */

function CustomersPage({
                         customers,
                         search,
                         onAddCustomer
                       }) {

  const filtered = customers.filter((customer) =>
      `${customer.name} ${customer.email} ${customer.phone}`
          .toLowerCase()
          .includes(search.toLowerCase())
  );

  return (
      <div className="content-page">

        <PageIntro
            title="Customers"
            description="Manage registered ISP customers and their contact information."
            count={`${customers.length} customers`}
        />

        <div className="panel table-panel">

          <div className="table-header">
            <div>
              <h3>Customer Directory</h3>
              <p>All registered customers</p>
            </div>

            <button
                className="primary-button"
                onClick={onAddCustomer}
            >
              + Add Customer
            </button>
          </div>

          <table>

            <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
            </thead>

            <tbody>

            {filtered.map((customer) => (
                <tr key={customer.customerId}>

                  <td>
                  <span className="id-badge">
                    #{customer.customerId}
                  </span>
                  </td>

                  <td>
                    <div className="table-user">
                      <div className="mini-avatar">
                        {customer.name?.charAt(0)}
                      </div>

                      <strong>
                        {customer.name}
                      </strong>
                    </div>
                  </td>

                  <td>{customer.email}</td>

                  <td>{customer.phone}</td>

                  <td>
                    <StatusBadge status="ACTIVE" />
                  </td>

                </tr>
            ))}

            </tbody>

          </table>

          {filtered.length === 0 && (
              <EmptyTable text="No customers found." />
          )}

        </div>

      </div>
  );
}


/* =========================
   PLANS
========================= */

function PlansPage({
                     plans,
                     aboveAveragePlans,
                     search,
                     loadData
                   }) {

  const [showAddPlan, setShowAddPlan] = useState(false);

  const [planForm, setPlanForm] = useState({
    planName: "",
    speed: "",
    monthlyPrice: ""
  });

  const [saving, setSaving] = useState(false);

  const filtered = plans.filter((plan) =>
      `${plan.planName} ${plan.speed}`
          .toLowerCase()
          .includes(search.toLowerCase())
  );

  const handleAddPlan = async (e) => {
    e.preventDefault();

    if (
        !planForm.planName ||
        !planForm.speed ||
        !planForm.monthlyPrice
    ) {
      alert("Please fill all fields.");
      return;
    }

    try {
      setSaving(true);

      await axios.post(`${API}/plans`, {
        planName: planForm.planName,
        speed: planForm.speed,
        monthlyPrice: Number(planForm.monthlyPrice)
      });

      alert("Plan added successfully!");

      setPlanForm({
        planName: "",
        speed: "",
        monthlyPrice: ""
      });

      setShowAddPlan(false);

      await loadData();

    } catch (error) {
      console.error(error);
      alert("Failed to add plan.");
    } finally {
      setSaving(false);
    }
  };

  return (
      <div className="content-page">

        <PageIntro
            title="Internet Plans"
            description="Manage broadband plans, speeds and monthly pricing."
            count={`${plans.length} plans`}
        />

        {/* ADD PLAN BUTTON */}
        <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "22px"
            }}
        >
          <button
              type="button"
              onClick={() => setShowAddPlan(!showAddPlan)}
              style={{
                background: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                padding: "11px 18px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer"
              }}
          >
            + Add Plan
          </button>
        </div>

        {/* ADD PLAN FORM */}
        {showAddPlan && (
            <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "22px",
                  marginBottom: "25px"
                }}
            >

              <h3
                  style={{
                    marginTop: 0,
                    marginBottom: "18px",
                    color: "#1e293b"
                  }}
              >
                Add New Internet Plan
              </h3>

              <form
                  onSubmit={handleAddPlan}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr auto",
                    gap: "14px",
                    alignItems: "end"
                  }}
              >

                <div>
                  <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        color: "#64748b",
                        marginBottom: "6px"
                      }}
                  >
                    Plan Name
                  </label>

                  <input
                      type="text"
                      placeholder="Example: Basic"
                      value={planForm.planName}
                      onChange={(e) =>
                          setPlanForm({
                            ...planForm,
                            planName: e.target.value
                          })
                      }
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "7px",
                        boxSizing: "border-box"
                      }}
                  />
                </div>

                <div>
                  <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        color: "#64748b",
                        marginBottom: "6px"
                      }}
                  >
                    Speed
                  </label>

                  <input
                      type="text"
                      placeholder="Example: 100 Mbps"
                      value={planForm.speed}
                      onChange={(e) =>
                          setPlanForm({
                            ...planForm,
                            speed: e.target.value
                          })
                      }
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "7px",
                        boxSizing: "border-box"
                      }}
                  />
                </div>

                <div>
                  <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        color: "#64748b",
                        marginBottom: "6px"
                      }}
                  >
                    Monthly Price
                  </label>

                  <input
                      type="number"
                      placeholder="Example: 699"
                      value={planForm.monthlyPrice}
                      onChange={(e) =>
                          setPlanForm({
                            ...planForm,
                            monthlyPrice: e.target.value
                          })
                      }
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "7px",
                        boxSizing: "border-box"
                      }}
                  />
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    style={{
                      background: "#16a34a",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "7px",
                      padding: "10px 17px",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: saving ? "not-allowed" : "pointer"
                    }}
                >
                  {saving ? "Saving..." : "Save Plan"}
                </button>

              </form>

            </div>
        )}

        {/* PLANS */}
        <div className="plans-grid">

          {filtered.map((plan) => {

            const popular =
                aboveAveragePlans.some(
                    (item) => item.planId === plan.planId
                );

            return (
                <div className="plan-card" key={plan.planId}>

                  {popular && (
                      <div className="popular-label">
                        POPULAR
                      </div>
                  )}

                  <div className="plan-card-icon">
                    ◈
                  </div>

                  <h3>{plan.planName}</h3>

                  <div className="plan-speed">
                    {plan.speed}
                  </div>

                  <div className="plan-price">
                    <strong>
                      ₹{Number(plan.monthlyPrice).toLocaleString("en-IN")}
                    </strong>

                    <span>/month</span>
                  </div>

                  <div className="plan-divider"></div>

                  <div className="plan-feature">
                    <span>✓</span>
                    High-speed internet
                  </div>

                  <div className="plan-feature">
                    <span>✓</span>
                    24/7 customer support
                  </div>

                  <button className="plan-button">
                    Manage plan
                  </button>

                </div>
            );
          })}

        </div>

      </div>
  );
}

/* =========================
   SUBSCRIPTIONS
========================= */

function SubscriptionsPage({
                             subscriptions,
                             subscriptionDetails,
                             customers,
                             plans,
                             search,
                             activateSubscription,
                             onSubscriptionCreated
                           }) {

  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const [subscriptionForm, setSubscriptionForm] = useState({
    customerId: "",
    planId: "",
    startDate: "",
    status: "PENDING"
  });

  const [subscriptionSaving, setSubscriptionSaving] = useState(false);

  // Controls whether JOIN result is displayed
  const [showJoinedDetails, setShowJoinedDetails] = useState(false);

  // Stores JOIN result
  const [joinedDetails, setJoinedDetails] = useState([]);
  const [monthlyBill, setMonthlyBill] = useState(null);
  const [billSubscriptionId, setBillSubscriptionId] = useState(null);


  // ==========================================
  // CREATE SUBSCRIPTION
  // ==========================================

  const createSubscription = async (event) => {
    event.preventDefault();

    if (
        !subscriptionForm.customerId ||
        !subscriptionForm.planId ||
        !subscriptionForm.startDate
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setSubscriptionSaving(true);

      await axios.post(`${API}/subscriptions`, {
        customer: {
          customerId: Number(subscriptionForm.customerId)
        },
        plan: {
          planId: Number(subscriptionForm.planId)
        },
        startDate: subscriptionForm.startDate,
        status: subscriptionForm.status
      });

      alert("Subscription created successfully.");

      setSubscriptionForm({
        customerId: "",
        planId: "",
        startDate: "",
        status: "PENDING"
      });

      setShowSubscriptionModal(false);

      await onSubscriptionCreated();

    } catch (error) {
      console.error("Error creating subscription:", error);

      alert(
          error.response?.data?.message ||
          "Unable to create subscription. Please try again."
      );

    } finally {
      setSubscriptionSaving(false);
    }
  };


  // ==========================================
  // JOIN OPERATION
  // ==========================================
  const viewMonthlyBill = async (id) => {
    try {
      const response = await axios.get(`${API}/subscriptions/${id}/bill`);

      setMonthlyBill(response.data
      );
      setBillSubscriptionId(id);
    } catch (error) {
      console.error("Error calculating monthly bill:", error);

      alert(
          error.response?.data?.message ||
          "Unable to calculate monthly bill."
      );
    }
  };

  const viewJoinedDetails = async () => {
    try {
      console.log("JOIN BUTTON CLICKED");

      const response = await axios.get(
          `${API}/subscriptions/details`
      );

      console.log("JOIN result:", response.data);

      setJoinedDetails(response.data);
      setShowJoinedDetails(true);

    } catch (error) {
      console.error(
          "Error executing JOIN:",
          error
      );

      alert(
          error.response?.data?.message ||
          "Unable to load joined subscription details."
      );
    }
  };


  // ==========================================
  // DATA TO DISPLAY
  // ==========================================

  const data =
      showJoinedDetails
          ? joinedDetails
          : subscriptions;


  // ==========================================
  // SEARCH
  // ==========================================

  const filtered = data.filter((item) =>
      JSON.stringify(item)
          .toLowerCase()
          .includes(search.toLowerCase())
  );


  // ==========================================
  // PAGE
  // ==========================================

  return (
      <div className="content-page">
        {monthlyBill !== null && (
            <div className="panel" style={{ marginBottom: "20px" }}>
              <h3>Monthly Bill</h3>
              <p>
                Subscription #{billSubscriptionId}: ₹{monthlyBill}
              </p>
            </div>
        )}
        <PageIntro
            title="Subscriptions"
            description="Monitor customer plans and subscription status."
            count={`${subscriptions.length} subscriptions`}
        />


        <div className="panel table-panel">

          {/* ============================= */}
          {/* TABLE HEADER */}
          {/* ============================= */}

          <div className="table-header">

            <div>

              <h3>
                {showJoinedDetails
                    ? "Joined Subscription Details"
                    : "Subscription Directory"}
              </h3>

              <p>
                {showJoinedDetails
                    ? "Customer + subscription + plan information from JOIN"
                    : "Customer and plan information"}
              </p>

            </div>


            <div className="table-actions">

              {/* JOIN BUTTON */}

              <button
                  className="secondary-button"
                  onClick={viewJoinedDetails}
              >
                🔍 View Details
              </button>


              {/* BACK BUTTON */}

              {showJoinedDetails && (

                  <button
                      className="secondary-button"
                      onClick={() => {
                        setShowJoinedDetails(false);
                        setJoinedDetails([]);
                      }}
                  >
                    ← Back to Subscriptions
                  </button>

              )}


              {/* NEW SUBSCRIPTION */}

              <button
                  className="primary-button"
                  onClick={() =>
                      setShowSubscriptionModal(true)
                  }
              >
                + New Subscription
              </button>

            </div>

          </div>


          {/* ============================= */}
          {/* SUBSCRIPTION TABLE */}
          {/* ============================= */}

          <table>

            <thead>

            <tr>

              {showJoinedDetails ? (
                  <>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Plan</th>
                    <th>Speed</th>
                    <th>Monthly Price</th>
                    <th>Start Date</th>
                    <th>Status</th>
                  </>
              ) : (
                  <>
                    <th>ID</th>
                    <th>Customer ID</th>
                    <th>Plan ID</th>
                    <th>Start Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </>
              )}

            </tr>

            </thead>


            <tbody>

            {filtered.map((item) => {

              const id =
                  item.subscriptionId;

              const status =
                  item.status || "PENDING";


              return (

                  showJoinedDetails ? (

                      <tr key={id}>

                        {/* JOIN: ID */}
                        <td>
        <span className="id-badge">
          #{id}
        </span>
                        </td>

                        {/* JOIN: CUSTOMER */}
                        <td>
                          <strong>
                            {item.customerName || "-"}
                          </strong>
                        </td>

                        {/* JOIN: EMAIL */}
                        <td>
                          {item.email || "-"}
                        </td>

                        {/* JOIN: PLAN */}
                        <td>
                          {item.planName || "-"}
                        </td>

                        {/* JOIN: SPEED */}
                        <td>
                          {item.speed || "-"}
                        </td>

                        {/* JOIN: MONTHLY PRICE */}
                        <td>
                          ₹
                          {Number(
                              item.monthlyPrice || 0
                          ).toLocaleString("en-IN")}
                        </td>

                        {/* JOIN: START DATE */}
                        <td>
                          {item.startDate || "-"}
                        </td>

                        {/* JOIN: STATUS */}
                        <td>
                          <StatusBadge
                              status={status}
                          />
                        </td>

                      </tr>

                  ) : (

                      <tr key={id}>

                        {/* NORMAL: ID */}
                        <td>
        <span className="id-badge">
          #{id}
        </span>
                        </td>

                        {/* NORMAL: CUSTOMER ID */}
                        <td>
                          {item.customer?.customerId ||
                              item.customerId ||
                              "-"}
                        </td>

                        {/* NORMAL: PLAN ID */}
                        <td>
                          {item.plan?.planId ||
                              item.planId ||
                              "-"}
                        </td>

                        {/* NORMAL: START DATE */}
                        <td>
                          {item.startDate || "-"}
                        </td>

                        {/* NORMAL: STATUS */}
                        <td>
                          <StatusBadge
                              status={status}
                          />
                        </td>

                        {/* NORMAL: ACTION */}
                        <td>

                          {status !== "ACTIVE" && (

                              <button
                                  className="small-action"
                                  onClick={() =>
                                      activateSubscription(id)
                                  }
                              >
                                Activate
                              </button>

                          )}

                          <button
                              className="small-action"
                              onClick={() =>
                                  viewMonthlyBill(id)
                              }
                          >
                            Calculate Bill
                          </button>

                        </td>

                      </tr>

                  )

              );
            })}

            </tbody>

          </table>


          {/* EMPTY */}

          {filtered.length === 0 && (

              <EmptyTable
                  text={
                    showJoinedDetails
                        ? "No JOIN results found."
                        : "No subscriptions found."
                  }
              />

          )}

        </div>


        {/* ================================= */}
        {/* NEW SUBSCRIPTION MODAL */}
        {/* ================================= */}

        {showSubscriptionModal && (

            <div className="modal-overlay">

              <div className="modal-card">


                {/* MODAL HEADER */}

                <div className="modal-header">

                  <div>

                    <h3>
                      New Subscription
                    </h3>

                    <p>
                      Create a subscription for a customer.
                    </p>

                  </div>


                  <button
                      type="button"
                      className="modal-close"
                      onClick={() => {

                        if (!subscriptionSaving) {

                          setShowSubscriptionModal(false);

                        }

                      }}
                  >
                    ×
                  </button>

                </div>


                {/* FORM */}

                <form
                    onSubmit={createSubscription}
                >


                  {/* CUSTOMER */}

                  <div className="form-group">

                    <label>
                      Customer
                    </label>


                    <select
                        value={
                          subscriptionForm.customerId
                        }
                        onChange={(event) =>

                            setSubscriptionForm({

                              ...subscriptionForm,

                              customerId:
                              event.target.value

                            })

                        }
                        required
                    >

                      <option value="">
                        Select customer
                      </option>


                      {customers.map(
                          (customer) => (

                              <option
                                  key={
                                    customer.customerId
                                  }
                                  value={
                                    customer.customerId
                                  }
                              >

                                {customer.name}
                                {" — "}
                                {customer.email}

                              </option>

                          )
                      )}

                    </select>

                  </div>


                  {/* PLAN */}

                  <div className="form-group">

                    <label>
                      Plan
                    </label>


                    <select
                        value={
                          subscriptionForm.planId
                        }
                        onChange={(event) =>

                            setSubscriptionForm({

                              ...subscriptionForm,

                              planId:
                              event.target.value

                            })

                        }
                        required
                    >

                      <option value="">
                        Select plan
                      </option>


                      {plans.map(
                          (plan) => (

                              <option
                                  key={
                                    plan.planId
                                  }
                                  value={
                                    plan.planId
                                  }
                              >

                                {plan.planName}
                                {" — ₹"}
                                {Number(
                                    plan.monthlyPrice
                                ).toLocaleString(
                                    "en-IN"
                                )}

                              </option>

                          )
                      )}

                    </select>

                  </div>


                  {/* START DATE */}

                  <div className="form-group">

                    <label>
                      Start Date
                    </label>


                    <input
                        type="date"
                        value={
                          subscriptionForm.startDate
                        }
                        onChange={(event) =>

                            setSubscriptionForm({

                              ...subscriptionForm,

                              startDate:
                              event.target.value

                            })

                        }
                        required
                    />

                  </div>


                  {/* STATUS */}

                  <div className="form-group">

                    <label>
                      Status
                    </label>


                    <select
                        value={
                          subscriptionForm.status
                        }
                        onChange={(event) =>

                            setSubscriptionForm({

                              ...subscriptionForm,

                              status:
                              event.target.value

                            })

                        }
                    >

                      <option value="PENDING">
                        PENDING
                      </option>


                      <option value="ACTIVE">
                        ACTIVE
                      </option>

                    </select>

                  </div>


                  {/* MODAL ACTIONS */}

                  <div className="modal-actions">


                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                            setShowSubscriptionModal(false)
                        }
                        disabled={subscriptionSaving}
                    >
                      Cancel
                    </button>


                    <button
                        type="submit"
                        className="primary-button"
                        disabled={subscriptionSaving}
                    >

                      {subscriptionSaving
                          ? "Creating..."
                          : "Create Subscription"}

                    </button>


                  </div>

                </form>

              </div>

            </div>

        )}

      </div>
  );
}

/* =========================
   PAYMENTS
========================= */

function PaymentsPage({
                        payments = [],
                        subscriptions = [],
                        search = "",
                        onPaymentCreated
                      }) {

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    subscriptionId: "",
    amount: "",
    paymentDate: "",
    paymentStatus: "SUCCESS"
  });

  const [paymentSaving, setPaymentSaving] = useState(false);

  const recordPayment = async (event) => {
    event.preventDefault();

    if (
        !paymentForm.subscriptionId ||
        !paymentForm.amount ||
        !paymentForm.paymentDate
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (Number(paymentForm.amount) <= 0) {
      alert("Payment amount must be greater than 0.");
      return;
    }

    try {
      setPaymentSaving(true);

      await axios.post(`${API}/payments`, {
        subscription: {
          subscriptionId: Number(paymentForm.subscriptionId)
        },
        amount: Number(paymentForm.amount),
        paymentDate: paymentForm.paymentDate,
        paymentStatus: paymentForm.paymentStatus
      });

      alert("Payment recorded successfully.");

      setPaymentForm({
        subscriptionId: "",
        amount: "",
        paymentDate: "",
        paymentStatus: "SUCCESS"
      });

      setShowPaymentModal(false);

      if (onPaymentCreated) {
        await onPaymentCreated();
      }

    } catch (error) {
      console.error("Error recording payment:", error);

      alert(
          error.response?.data?.message ||
          "Unable to record payment. Please try again."
      );

    } finally {
      setPaymentSaving(false);
    }
  };

  const filtered = payments.filter((payment) =>
      JSON.stringify(payment)
          .toLowerCase()
          .includes(search.toLowerCase())
  );

  const total = payments.reduce(
      (sum, payment) =>
          sum + Number(payment.amount || 0),
      0
  );

  return (
      <div className="content-page">

        <PageIntro
            title="Payments"
            description="Track subscription payments and transaction status."
            count={`${payments.length} transactions`}
        />

        <div className="payment-summary">

          <div className="summary-card">
            <span>Total Collected</span>
            <strong>
              ₹{total.toLocaleString("en-IN")}
            </strong>
          </div>

          <div className="summary-card">
            <span>Successful Payments</span>
            <strong>
              {
                payments.filter(
                    (payment) =>
                        payment.paymentStatus === "SUCCESS"
                ).length
              }
            </strong>
          </div>

          <div className="summary-card">
            <span>Transactions</span>
            <strong>
              {payments.length}
            </strong>
          </div>

        </div>

        <div className="panel table-panel">

          <div className="table-header">

            <div>
              <h3>Payment Transactions</h3>
              <p>Recent payment activity</p>
            </div>

            <button
                className="primary-button"
                onClick={() => setShowPaymentModal(true)}
            >
              + Record Payment
            </button>

          </div>

          <table>

            <thead>
            <tr>
              <th>Payment ID</th>
              <th>Subscription</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
            </thead>

            <tbody>

            {filtered.map((payment) => (

                <tr key={payment.paymentId}>

                  <td>
                    <span className="id-badge">
                      #{payment.paymentId}
                    </span>
                  </td>

                  <td>
                    Subscription #
                    {payment.subscription?.subscriptionId ||
                        payment.subscriptionId ||
                        "-"}
                  </td>

                  <td>
                    <strong>
                      ₹
                      {Number(
                          payment.amount || 0
                      ).toLocaleString("en-IN")}
                    </strong>
                  </td>

                  <td>
                    {payment.paymentDate || "-"}
                  </td>

                  <td>
                    <StatusBadge
                        status={
                            payment.paymentStatus || "PENDING"
                        }
                    />
                  </td>

                </tr>

            ))}

            </tbody>

          </table>

          {filtered.length === 0 && (
              <EmptyTable text="No payments found." />
          )}

        </div>


        {showPaymentModal && (

            <div className="modal-overlay">

              <div className="modal-card">

                <div className="modal-header">

                  <div>
                    <h3>Record Payment</h3>
                    <p>
                      Record a payment for an existing subscription.
                    </p>
                  </div>

                  <button
                      type="button"
                      className="modal-close"
                      onClick={() => {
                        if (!paymentSaving) {
                          setShowPaymentModal(false);
                        }
                      }}
                  >
                    ×
                  </button>

                </div>


                <form onSubmit={recordPayment}>

                  <div className="form-group">

                    <label>Subscription</label>

                    <select
                        value={paymentForm.subscriptionId}
                        onChange={(event) =>
                            setPaymentForm({
                              ...paymentForm,
                              subscriptionId: event.target.value
                            })
                        }
                        required
                    >

                      <option value="">
                        Select subscription
                      </option>

                      {subscriptions.map((subscription) => (

                          <option
                              key={subscription.subscriptionId}
                              value={subscription.subscriptionId}
                          >
                            Subscription #
                            {subscription.subscriptionId}
                            {" — "}
                            {subscription.customer?.name ||
                                "Customer"}
                            {" — "}
                            {subscription.plan?.planName ||
                                "Plan"}
                          </option>

                      ))}

                    </select>

                  </div>


                  <div className="form-group">

                    <label>Amount</label>

                    <input
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="Enter payment amount"
                        value={paymentForm.amount}
                        onChange={(event) =>
                            setPaymentForm({
                              ...paymentForm,
                              amount: event.target.value
                            })
                        }
                        required
                    />

                  </div>


                  <div className="form-group">

                    <label>Payment Date</label>

                    <input
                        type="date"
                        value={paymentForm.paymentDate}
                        onChange={(event) =>
                            setPaymentForm({
                              ...paymentForm,
                              paymentDate: event.target.value
                            })
                        }
                        required
                    />

                  </div>


                  <div className="form-group">

                    <label>Payment Status</label>

                    <select
                        value={paymentForm.paymentStatus}
                        onChange={(event) =>
                            setPaymentForm({
                              ...paymentForm,
                              paymentStatus: event.target.value
                            })
                        }
                    >

                      <option value="SUCCESS">
                        SUCCESS
                      </option>

                      <option value="PENDING">
                        PENDING
                      </option>

                      <option value="FAILED">
                        FAILED
                      </option>

                    </select>

                  </div>


                  <div className="modal-actions">

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                            setShowPaymentModal(false)
                        }
                        disabled={paymentSaving}
                    >
                      Cancel
                    </button>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={paymentSaving}
                    >
                      {paymentSaving
                          ? "Recording..."
                          : "Record Payment"}
                    </button>

                  </div>

                </form>

              </div>

            </div>

        )}

      </div>
  );
}

/* =========================
   REPORTS
========================= */

function ReportsPage({
                       customers,
                       plans,
                       subscriptions,
                       payments,
                       aboveAveragePlans
                     }) {
  const [subqueryPlans, setSubqueryPlans] = useState([]);
  const [subqueryExecuted, setSubqueryExecuted] = useState(false);
  const [subqueryLoading, setSubqueryLoading] = useState(false);

  // =========================
  // BASIC REPORT CALCULATIONS
  // =========================

  const totalCustomers = customers.length;

  const activeSubscriptions = subscriptions.filter(
      (subscription) =>
          String(subscription.status || "").toUpperCase() === "ACTIVE"
  ).length;

  const pendingSubscriptions = subscriptions.filter(
      (subscription) =>
          String(subscription.status || "").toUpperCase() === "PENDING"
  ).length;

  const totalSubscriptions = subscriptions.length;

  const totalRevenue = payments.reduce(
      (sum, payment) =>
          sum + Number(payment.amount || 0),
      0
  );

  const successfulPayments = payments.filter(
      (payment) =>
          String(payment.paymentStatus || "").toUpperCase() === "SUCCESS"
  ).length;

  // =========================
  // SUBQUERY DEMONSTRATION
  // =========================

  const runSubquery = async () => {
    try {
      setSubqueryLoading(true);

      const response = await axios.get(
          `${API}/plans/above-average-subscribers`
      );

      console.log(
          "Above-average plans:",
          response.data
      );

      setSubqueryPlans(response.data);
      setSubqueryExecuted(true);

    } catch (error) {
      console.error(
          "Error loading above-average plans:",
          error
      );

      alert(
          error.response?.data?.message ||
          "Unable to load plan performance."
      );

    } finally {
      setSubqueryLoading(false);
    }
  };

  // =========================
  // SUBSCRIPTION STATUS
  // =========================

  const statusData = [
    {
      label: "Active",
      value: activeSubscriptions,
      className: "status-active"
    },
    {
      label: "Pending",
      value: pendingSubscriptions,
      className: "status-pending"
    },
    {
      label: "Other",
      value:
          totalSubscriptions -
          activeSubscriptions -
          pendingSubscriptions,
      className: "status-other"
    }
  ];

  // =========================
  // RECENT PAYMENTS
  // =========================

  const recentPayments = [...payments]
      .sort((a, b) => {
        const dateA = new Date(
            a.paymentDate || 0
        );

        const dateB = new Date(
            b.paymentDate || 0
        );

        return dateB - dateA;
      })
      .slice(0, 5);

  // =========================
  // PAGE
  // =========================

  return (
      <div className="content-page">

        {/* =========================
          PAGE HEADER
      ========================= */}

        <div
            style={{
              marginBottom: "28px"
            }}
        >
          <h1
              style={{
                margin: 0,
                fontSize: "28px",
                fontWeight: "700",
                color: "#111827"
              }}
          >
            Reports & Analytics
          </h1>

          <p
              style={{
                marginTop: "8px",
                marginBottom: 0,
                color: "#6b7280",
                fontSize: "14px"
              }}
          >
            Monitor customers, subscriptions,
            payments and plan performance.
          </p>
        </div>


        {/* =========================
          KPI CARDS
      ========================= */}

        <div
            style={{
              display: "grid",
              gridTemplateColumns:
                  "repeat(4, minmax(0, 1fr))",
              gap: "18px",
              marginBottom: "24px"
            }}
        >

          {/* TOTAL CUSTOMERS */}

          <div
              className="panel"
              style={{
                padding: "22px"
              }}
          >
            <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start"
                }}
            >

              <div>
                <p
                    style={{
                      margin: 0,
                      color: "#6b7280",
                      fontSize: "13px",
                      fontWeight: "600"
                    }}
                >
                  TOTAL CUSTOMERS
                </p>

                <h2
                    style={{
                      margin:
                          "10px 0 4px 0",
                      fontSize: "28px",
                      color: "#111827"
                    }}
                >
                  {totalCustomers}
                </h2>

                <span
                    style={{
                      color: "#6b7280",
                      fontSize: "12px"
                    }}
                >
                Registered customers
              </span>
              </div>

              <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: "#eef2ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px"
                  }}
              >
                👥
              </div>

            </div>
          </div>


          {/* ACTIVE SUBSCRIPTIONS */}

          <div
              className="panel"
              style={{
                padding: "22px"
              }}
          >
            <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start"
                }}
            >

              <div>
                <p
                    style={{
                      margin: 0,
                      color: "#6b7280",
                      fontSize: "13px",
                      fontWeight: "600"
                    }}
                >
                  ACTIVE SUBSCRIPTIONS
                </p>

                <h2
                    style={{
                      margin:
                          "10px 0 4px 0",
                      fontSize: "28px",
                      color: "#111827"
                    }}
                >
                  {activeSubscriptions}
                </h2>

                <span
                    style={{
                      color: "#6b7280",
                      fontSize: "12px"
                    }}
                >
                Currently active
              </span>
              </div>

              <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: "#ecfdf5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px"
                  }}
              >
                ✓
              </div>

            </div>
          </div>


          {/* TOTAL REVENUE */}

          <div
              className="panel"
              style={{
                padding: "22px"
              }}
          >
            <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start"
                }}
            >

              <div>
                <p
                    style={{
                      margin: 0,
                      color: "#6b7280",
                      fontSize: "13px",
                      fontWeight: "600"
                    }}
                >
                  TOTAL REVENUE
                </p>

                <h2
                    style={{
                      margin:
                          "10px 0 4px 0",
                      fontSize: "28px",
                      color: "#111827"
                    }}
                >
                  ₹
                  {totalRevenue.toLocaleString(
                      "en-IN"
                  )}
                </h2>

                <span
                    style={{
                      color: "#6b7280",
                      fontSize: "12px"
                    }}
                >
                Recorded payments
              </span>
              </div>

              <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: "#fff7ed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px"
                  }}
              >
                ₹
              </div>

            </div>
          </div>


          {/* PAYMENTS */}

          <div
              className="panel"
              style={{
                padding: "22px"
              }}
          >
            <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start"
                }}
            >

              <div>
                <p
                    style={{
                      margin: 0,
                      color: "#6b7280",
                      fontSize: "13px",
                      fontWeight: "600"
                    }}
                >
                  SUCCESSFUL PAYMENTS
                </p>

                <h2
                    style={{
                      margin:
                          "10px 0 4px 0",
                      fontSize: "28px",
                      color: "#111827"
                    }}
                >
                  {successfulPayments}
                </h2>

                <span
                    style={{
                      color: "#6b7280",
                      fontSize: "12px"
                    }}
                >
                Completed transactions
              </span>
              </div>

              <div
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "10px",
                    background: "#f0fdf4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px"
                  }}
              >
                $
              </div>

            </div>
          </div>

        </div>


        {/* =========================
          SECOND ROW
      ========================= */}

        <div
            style={{
              display: "grid",
              gridTemplateColumns:
                  "1fr 1fr",
              gap: "20px",
              marginBottom: "20px"
            }}
        >

          {/* SUBSCRIPTION STATUS */}

          <div
              className="panel"
              style={{
                padding: "24px"
              }}
          >

            <div
                style={{
                  marginBottom: "22px"
                }}
            >
              <h3
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    color: "#111827"
                  }}
              >
                Subscription Overview
              </h3>

              <p
                  style={{
                    margin:
                        "6px 0 0 0",
                    color: "#6b7280",
                    fontSize: "13px"
                  }}
              >
                Current subscription status
              </p>
            </div>


            {statusData.map((item) => (

                <div
                    key={item.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                          "space-between",
                      padding:
                          "13px 0",
                      borderBottom:
                          "1px solid #f1f5f9"
                    }}
                >

                  <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px"
                      }}
                  >

                <span
                    style={{
                      width: "9px",
                      height: "9px",
                      borderRadius:
                          "50%",
                      background:
                          item.label ===
                          "Active"
                              ? "#10b981"
                              : item.label ===
                              "Pending"
                                  ? "#f59e0b"
                                  : "#94a3b8"
                    }}
                />

                    <span
                        style={{
                          fontSize: "14px",
                          color: "#374151"
                        }}
                    >
                  {item.label}
                </span>

                  </div>

                  <strong
                      style={{
                        fontSize: "15px",
                        color: "#111827"
                      }}
                  >
                    {item.value}
                  </strong>

                </div>

            ))}

            <div
                style={{
                  marginTop: "18px",
                  padding: "14px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent:
                      "space-between"
                }}
            >

            <span
                style={{
                  fontSize: "13px",
                  color: "#64748b"
                }}
            >
              Total subscriptions
            </span>

              <strong>
                {totalSubscriptions}
              </strong>

            </div>

          </div>


          {/* PLAN SUMMARY */}

          <div
              className="panel"
              style={{
                padding: "24px"
              }}
          >

            <div
                style={{
                  marginBottom: "22px"
                }}
            >
              <h3
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    color: "#111827"
                  }}
              >
                Plan Portfolio
              </h3>

              <p
                  style={{
                    margin:
                        "6px 0 0 0",
                    color: "#6b7280",
                    fontSize: "13px"
                  }}
              >
                Available internet plans
              </p>
            </div>


            {plans.slice(0, 5).map(
                (plan) => (

                    <div
                        key={plan.planId}
                        style={{
                          display: "flex",
                          alignItems:
                              "center",
                          justifyContent:
                              "space-between",
                          padding:
                              "13px 0",
                          borderBottom:
                              "1px solid #f1f5f9"
                        }}
                    >

                      <div>

                        <strong
                            style={{
                              display:
                                  "block",
                              fontSize:
                                  "14px",
                              color:
                                  "#111827"
                            }}
                        >
                          {plan.planName}
                        </strong>

                        <span
                            style={{
                              fontSize:
                                  "12px",
                              color:
                                  "#64748b"
                            }}
                        >
                    {plan.speed}
                  </span>

                      </div>

                      <strong
                          style={{
                            fontSize:
                                "14px",
                            color:
                                "#111827"
                          }}
                      >
                        ₹
                        {Number(
                            plan.monthlyPrice ||
                            0
                        ).toLocaleString(
                            "en-IN"
                        )}
                      </strong>

                    </div>

                )
            )}

            {plans.length === 0 && (
                <div
                    style={{
                      padding: "25px",
                      textAlign: "center",
                      color: "#64748b"
                    }}
                >
                  No plans available.
                </div>
            )}

          </div>

        </div>


        {/* =========================
          PLAN PERFORMANCE
          SQL SUBQUERY
      ========================= */}

        <div
            className="panel"
            style={{
              padding: "24px",
              marginBottom: "20px"
            }}
        >

          <div
              style={{
                display: "flex",
                justifyContent:
                    "space-between",
                alignItems:
                    "center",
                gap: "20px",
                marginBottom:
                    "20px"
              }}
          >

            <div>

              <h3
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    color: "#111827"
                  }}
              >
                Plan Performance Analysis
              </h3>

              <p
                  style={{
                    margin:
                        "6px 0 0 0",
                    color: "#6b7280",
                    fontSize: "13px"
                  }}
              >
                Identify plans with
                subscriber counts above
                the average.
              </p>

            </div>


            <button
                className="secondary-button"
                onClick={
                  runSubquery
                }
                disabled={
                  subqueryLoading
                }
            >
              {subqueryLoading
                  ? "Loading..."
                  : "View Above-Average Plans"}
            </button>

          </div>


          {!subqueryExecuted && (

              <div
                  style={{
                    padding: "22px",
                    background:
                        "#f8fafc",
                    border:
                        "1px solid #e5e7eb",
                    borderRadius:
                        "10px",
                    textAlign:
                        "center"
                  }}
              >

                <div
                    style={{
                      fontSize:
                          "25px",
                      marginBottom:
                          "8px"
                    }}
                >
                  ◈
                </div>

                <strong
                    style={{
                      display:
                          "block",
                      color:
                          "#374151",
                      marginBottom:
                          "5px"
                    }}
                >
                  Plan Performance
                </strong>

                <span
                    style={{
                      color:
                          "#6b7280",
                      fontSize:
                          "13px"
                    }}
                >
              Select "View Above-Average Plans"
              to analyze subscriber performance.
            </span>

              </div>

          )}


          {subqueryExecuted && (

              <div>

                <div
                    style={{
                      display:
                          "flex",
                      alignItems:
                          "center",
                      justifyContent:
                          "space-between",
                      marginBottom:
                          "14px"
                    }}
                >

                  <strong
                      style={{
                        fontSize:
                            "14px",
                        color:
                            "#374151"
                      }}
                  >
                    Above-Average
                    Subscriber Plans
                  </strong>

                  <span
                      style={{
                        fontSize:
                            "12px",
                        color:
                            "#64748b"
                      }}
                  >
                {subqueryPlans.length} plan(s)
                found
              </span>

                </div>


                {subqueryPlans.length > 0 ? (

                    <div
                        style={{
                          display:
                              "grid",
                          gridTemplateColumns:
                              "repeat(2, minmax(0, 1fr))",
                          gap:
                              "12px"
                        }}
                    >

                      {subqueryPlans.map(
                          (plan) => (

                              <div
                                  key={
                                    plan.planId
                                  }
                                  style={{
                                    padding:
                                        "17px",
                                    border:
                                        "1px solid #e5e7eb",
                                    borderRadius:
                                        "9px",
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    justifyContent:
                                        "space-between"
                                  }}
                              >

                                <div>

                                  <strong
                                      style={{
                                        display:
                                            "block",
                                        fontSize:
                                            "14px",
                                        color:
                                            "#111827"
                                      }}
                                  >
                                    {
                                      plan.planName
                                    }
                                  </strong>

                                  <span
                                      style={{
                                        fontSize:
                                            "12px",
                                        color:
                                            "#64748b"
                                      }}
                                  >
                          {
                            plan.subscriberCount
                          }{" "}
                                    subscribers
                        </span>

                                </div>

                                <span
                                    style={{
                                      padding:
                                          "5px 9px",
                                      borderRadius:
                                          "20px",
                                      background:
                                          "#ecfdf5",
                                      color:
                                          "#047857",
                                      fontSize:
                                          "11px",
                                      fontWeight:
                                          "600"
                                    }}
                                >
                        ABOVE AVERAGE
                      </span>

                              </div>

                          )
                      )}

                    </div>

                ) : (

                    <div
                        style={{
                          padding:
                              "20px",
                          textAlign:
                              "center",
                          background:
                              "#f8fafc",
                          borderRadius:
                              "8px",
                          color:
                              "#64748b",
                          fontSize:
                              "13px"
                        }}
                    >
                      No plans are currently
                      above the average subscriber
                      count.
                    </div>

                )}

              </div>

          )}

        </div>


        {/* =========================
          RECENT PAYMENTS
      ========================= */}

        <div
            className="panel"
            style={{
              padding: "24px"
            }}
        >

          <div
              style={{
                marginBottom:
                    "18px"
              }}
          >

            <h3
                style={{
                  margin: 0,
                  fontSize:
                      "18px",
                  color:
                      "#111827"
                }}
            >
              Recent Payments
            </h3>

            <p
                style={{
                  margin:
                      "6px 0 0 0",
                  color:
                      "#6b7280",
                  fontSize:
                      "13px"
                }}
            >
              Latest payment transactions
              recorded in the system.
            </p>

          </div>


          {recentPayments.length > 0 ? (

              <div
                  style={{
                    overflowX:
                        "auto"
                  }}
              >

                <table
                    style={{
                      width:
                          "100%",
                      borderCollapse:
                          "collapse"
                    }}
                >

                  <thead>

                  <tr>

                    <th
                        style={{
                          textAlign:
                              "left",
                          padding:
                              "12px",
                          fontSize:
                              "12px",
                          color:
                              "#64748b",
                          borderBottom:
                              "1px solid #e5e7eb"
                        }}
                    >
                      PAYMENT ID
                    </th>

                    <th
                        style={{
                          textAlign:
                              "left",
                          padding:
                              "12px",
                          fontSize:
                              "12px",
                          color:
                              "#64748b",
                          borderBottom:
                              "1px solid #e5e7eb"
                        }}
                    >
                      SUBSCRIPTION
                    </th>

                    <th
                        style={{
                          textAlign:
                              "left",
                          padding:
                              "12px",
                          fontSize:
                              "12px",
                          color:
                              "#64748b",
                          borderBottom:
                              "1px solid #e5e7eb"
                        }}
                    >
                      AMOUNT
                    </th>

                    <th
                        style={{
                          textAlign:
                              "left",
                          padding:
                              "12px",
                          fontSize:
                              "12px",
                          color:
                              "#64748b",
                          borderBottom:
                              "1px solid #e5e7eb"
                        }}
                    >
                      DATE
                    </th>

                    <th
                        style={{
                          textAlign:
                              "left",
                          padding:
                              "12px",
                          fontSize:
                              "12px",
                          color:
                              "#64748b",
                          borderBottom:
                              "1px solid #e5e7eb"
                        }}
                    >
                      STATUS
                    </th>

                  </tr>

                  </thead>


                  <tbody>

                  {recentPayments.map(
                      (payment) => {

                        const paymentId =
                            payment.paymentId;

                        const subscriptionId =
                            payment.subscription
                                ?.subscriptionId ||
                            payment.subscriptionId ||
                            "-";

                        const amount =
                            Number(
                                payment.amount ||
                                0
                            );

                        const status =
                            String(
                                payment.paymentStatus ||
                                ""
                            ).toUpperCase();

                        return (

                            <tr
                                key={
                                  paymentId
                                }
                            >

                              <td
                                  style={{
                                    padding:
                                        "14px 12px",
                                    borderBottom:
                                        "1px solid #f1f5f9",
                                    fontSize:
                                        "13px",
                                    color:
                                        "#374151"
                                  }}
                              >
                                #{paymentId}
                              </td>

                              <td
                                  style={{
                                    padding:
                                        "14px 12px",
                                    borderBottom:
                                        "1px solid #f1f5f9",
                                    fontSize:
                                        "13px",
                                    color:
                                        "#374151"
                                  }}
                              >
                                #{subscriptionId}
                              </td>

                              <td
                                  style={{
                                    padding:
                                        "14px 12px",
                                    borderBottom:
                                        "1px solid #f1f5f9",
                                    fontSize:
                                        "13px",
                                    fontWeight:
                                        "600",
                                    color:
                                        "#111827"
                                  }}
                              >
                                ₹
                                {amount.toLocaleString(
                                    "en-IN"
                                )}
                              </td>

                              <td
                                  style={{
                                    padding:
                                        "14px 12px",
                                    borderBottom:
                                        "1px solid #f1f5f9",
                                    fontSize:
                                        "13px",
                                    color:
                                        "#64748b"
                                  }}
                              >
                                {
                                    payment.paymentDate ||
                                    "-"
                                }
                              </td>

                              <td
                                  style={{
                                    padding:
                                        "14px 12px",
                                    borderBottom:
                                        "1px solid #f1f5f9"
                                  }}
                              >

                          <span
                              style={{
                                display:
                                    "inline-block",
                                padding:
                                    "5px 9px",
                                borderRadius:
                                    "20px",
                                fontSize:
                                    "11px",
                                fontWeight:
                                    "600",
                                background:
                                    status ===
                                    "SUCCESS"
                                        ? "#ecfdf5"
                                        : "#fef2f2",
                                color:
                                    status ===
                                    "SUCCESS"
                                        ? "#047857"
                                        : "#b91c1c"
                              }}
                          >
                            {status ||
                                "UNKNOWN"}
                          </span>

                              </td>

                            </tr>

                        );
                      }
                  )}

                  </tbody>

                </table>

              </div>

          ) : (

              <div
                  style={{
                    padding:
                        "35px",
                    textAlign:
                        "center",
                    color:
                        "#64748b",
                    background:
                        "#f8fafc",
                    borderRadius:
                        "8px"
                  }}
              >
                No payment transactions
                available.
              </div>

          )}

        </div>

      </div>
  );
}

/* =========================
   COMPONENTS
========================= */

function PageIntro({
                     title,
                     description,
                     count
                   }) {
  return (
      <div className="page-intro">

        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <span className="page-count">
        {count}
      </span>

      </div>
  );
}


function SubscriptionTable({
                             subscriptions
                           }) {

  return (
      <div className="table-wrapper">

        <table>

          <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Plan</th>
            <th>Start Date</th>
            <th>Status</th>
          </tr>
          </thead>

          <tbody>

          {subscriptions.map((subscription) => (
              <tr key={subscription.subscriptionId}>

                <td>
                <span className="id-badge">
                  #{subscription.subscriptionId}
                </span>
                </td>

                <td>
                  <strong>
                    {subscription.customer?.name ||
                        "Customer"}
                  </strong>
                </td>

                <td>
                  {subscription.plan?.planName ||
                      "Plan"}
                </td>

                <td>
                  {subscription.startDate}
                </td>

                <td>
                  <StatusBadge
                      status={subscription.status}
                  />
                </td>

              </tr>
          ))}

          </tbody>

        </table>

        {subscriptions.length === 0 && (
            <EmptyTable text="No subscriptions available." />
        )}

      </div>
  );
}


function StatusBadge({ status }) {

  const normalized =
      String(status || "")
          .toUpperCase();

  let className = "status-badge";

  if (normalized === "ACTIVE") {
    className += " status-active";
  } else if (
      normalized === "SUCCESS"
  ) {
    className += " status-success";
  } else if (
      normalized === "PENDING"
  ) {
    className += " status-pending";
  } else {
    className += " status-default";
  }

  return (
      <span className={className}>
      <span className="status-dot"></span>
        {normalized || "UNKNOWN"}
    </span>
  );
}


function EmptyTable({ text }) {
  return (
      <div className="empty-table">
        {text}
      </div>
  );
}


function CustomerModal({
                         form,
                         setForm,
                         onSubmit,
                         onClose,
                         saving
                       }) {
  return (
      <div className="modal-overlay">
        <div className="modal-card">

          <div className="modal-header">
            <div>
              <span className="modal-eyebrow">
                CUSTOMER MANAGEMENT
              </span>

              <h2>Add New Customer</h2>

              <p>
                Create a new customer account in the ISP system.
              </p>
            </div>

            <button
                type="button"
                className="modal-close"
                onClick={onClose}
                disabled={saving}
            >
              ×
            </button>
          </div>

          <form onSubmit={onSubmit}>

            <div className="form-group">
              <label>
                Customer Name <span>*</span>
              </label>

              <input
                  type="text"
                  placeholder="Enter customer name"
                  value={form.name}
                  onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value
                      })
                  }
                  required
              />
            </div>

            <div className="form-group">
              <label>
                Email Address <span>*</span>
              </label>

              <input
                  type="email"
                  placeholder="customer@example.com"
                  value={form.email}
                  onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value
                      })
                  }
                  required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>

              <input
                  type="tel"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value
                      })
                  }
              />
            </div>

            <div className="form-note">
              <span>ⓘ</span>
              Customer ID will be generated automatically.
            </div>

            <div className="modal-actions">
              <button
                  type="button"
                  className="secondary-button"
                  onClick={onClose}
                  disabled={saving}
              >
                Cancel
              </button>

              <button
                  type="submit"
                  className="modal-save-button"
                  disabled={saving}
              >
                {saving ? "Saving..." : "Create Customer"}
              </button>
            </div>

          </form>
        </div>
      </div>
  );
}

export default App;
