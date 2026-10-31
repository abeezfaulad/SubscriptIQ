"use client";
import "./dashboard.css";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { logout } from "../login/actions";

type BillingCycle = "Monthly" | "Yearly";
type SubscriptionStatus = "Active" | "Trial" | "Past due" | "Cancelled";
type View = "overview" | "subscriptions" | "guardian" | "savings" | "renewals" | "entitlements" | "privacy";

type Subscription = {
  id: string;
  name: string;
  category: string;
  amount: number;
  cycle: BillingCycle;
  nextRenewal: string;
  lastUsed: string;
  status: SubscriptionStatus;
};

const STORAGE_KEY = "subscriptiq.dashboard.v1";

function dateInDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function demoSubscriptions(): Subscription[] {
  return [
    { id: "demo-netflix", name: "Netflix", category: "Entertainment", amount: 649, cycle: "Monthly", nextRenewal: dateInDays(3), lastUsed: dateInDays(-4), status: "Active" },
    { id: "demo-spotify", name: "Spotify", category: "Music", amount: 119, cycle: "Monthly", nextRenewal: dateInDays(8), lastUsed: dateInDays(-1), status: "Active" },
    { id: "demo-google", name: "Google One", category: "Cloud storage", amount: 1300, cycle: "Yearly", nextRenewal: dateInDays(12), lastUsed: dateInDays(-18), status: "Active" },
    { id: "demo-microsoft", name: "Microsoft 365", category: "Productivity", amount: 4899, cycle: "Yearly", nextRenewal: dateInDays(19), lastUsed: dateInDays(-76), status: "Active" },
    { id: "demo-prime", name: "Prime Video", category: "Entertainment", amount: 299, cycle: "Monthly", nextRenewal: dateInDays(26), lastUsed: dateInDays(-83), status: "Active" },
  ];
}

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function monthlyCost(item: Subscription) {
  return item.cycle === "Yearly" ? item.amount / 12 : item.amount;
}

function formatDate(value: string) {
  if (!value) return "Not set";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(parsed);
}

function daysFromToday(value: string) {
  if (!value) return Number.POSITIVE_INFINITY;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${value}T00:00:00`);
  if (Number.isNaN(target.getTime())) return Number.POSITIVE_INFINITY;
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

function daysSince(value: string) {
  const result = daysFromToday(value);
  return Number.isFinite(result) ? Math.max(0, -result) : null;
}

function statusClass(status: SubscriptionStatus) {
  return status.toLowerCase().replace(/ /g, "-");
}

const navigation: { id: View; label: string; symbol: string; group: string }[] = [
  { id: "overview", label: "Overview", symbol: "◫", group: "WORKSPACE" },
  { id: "subscriptions", label: "Subscriptions", symbol: "▤", group: "WORKSPACE" },
  { id: "guardian", label: "Subscription Guardian", symbol: "◈", group: "INTELLIGENCE" },
  { id: "savings", label: "Savings simulator", symbol: "↗", group: "INTELLIGENCE" },
  { id: "renewals", label: "Renewals", symbol: "◷", group: "INTELLIGENCE" },
  { id: "entitlements", label: "Entitlements", symbol: "▦", group: "BUSINESS" },
  { id: "privacy", label: "Privacy & data", symbol: "◇", group: "SETTINGS" },
];

const planFeatures = [
  { name: "Basic dashboard", free: "Included", pro: "Included", enterprise: "Included" },
  { name: "Advanced analytics", free: "—", pro: "Included", enterprise: "Included" },
  { name: "Team management", free: "—", pro: "—", enterprise: "Included" },
  { name: "API access", free: "—", pro: "Limited", enterprise: "Full" },
  { name: "Usage limits", free: "Standard", pro: "Higher", enterprise: "Custom" },
];

export default function DashboardClient({ email }: { email: string }) {
  const [view, setView] = useState<View>("overview");
  const [items, setItems] = useState<Subscription[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isSample, setIsSample] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [selectedSavings, setSelectedSavings] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<"Free" | "Pro" | "Enterprise">("Pro");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed as Subscription[]);
          setIsSample(false);
        } else {
          setItems(demoSubscriptions());
          setIsSample(true);
        }
      } else {
        setItems(demoSubscriptions());
        setIsSample(true);
      }
    } catch {
      setItems(demoSubscriptions());
      setIsSample(true);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      setNotice("Your browser could not save this workspace. Check available storage space.");
    }
  }, [items, hydrated]);

  const activeItems = useMemo(
    () => items.filter((item) => item.status !== "Cancelled"),
    [items]
  );
  const monthlyTotal = useMemo(
    () => activeItems.reduce((sum, item) => sum + monthlyCost(item), 0),
    [activeItems]
  );
  const annualTotal = monthlyTotal * 12;
  const upcoming = useMemo(
    () => activeItems
      .filter((item) => daysFromToday(item.nextRenewal) >= 0 && daysFromToday(item.nextRenewal) <= 30)
      .sort((a, b) => daysFromToday(a.nextRenewal) - daysFromToday(b.nextRenewal)),
    [activeItems]
  );
  const leaks = useMemo(
    () => activeItems.filter((item) => (daysSince(item.lastUsed) ?? 0) >= 60),
    [activeItems]
  );
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    activeItems.forEach((item) => counts.set(item.category, (counts.get(item.category) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [activeItems]);
  const overlaps = categoryCounts.filter(([, count]) => count > 1);
  const savingsMonthly = items
    .filter((item) => selectedSavings.includes(item.id) && item.status !== "Cancelled")
    .reduce((sum, item) => sum + monthlyCost(item), 0);
  const filteredItems = items.filter((item) => {
    const matchesSearch = `${item.name} ${item.category}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const currentHeading = navigation.find((entry) => entry.id === view)?.label ?? "Overview";

  function updateItem(id: string, updates: Partial<Subscription>) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...updates } : item));
    setIsSample(false);
  }

  function addSubscription(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const category = String(form.get("category") ?? "Other").trim();
    const amount = Number(form.get("amount"));
    const cycle = String(form.get("cycle")) as BillingCycle;
    const nextRenewal = String(form.get("nextRenewal") ?? "");
    const lastUsed = String(form.get("lastUsed") ?? "");

    if (!name || !Number.isFinite(amount) || amount <= 0 || !nextRenewal) {
      setNotice("Add a name, a valid price and the next renewal date.");
      return;
    }

    const newItem: Subscription = {
      id: makeId(),
      name,
      category: category || "Other",
      amount,
      cycle: cycle === "Yearly" ? "Yearly" : "Monthly",
      nextRenewal,
      lastUsed,
      status: "Active",
    };

    setItems((current) => [newItem, ...current]);
    setIsSample(false);
    setShowAdd(false);
    setNotice(`${name} was added to your workspace.`);
    event.currentTarget.reset();
  }

  function removeSubscription(id: string) {
    const item = items.find((entry) => entry.id === id);
    if (!item || !window.confirm(`Remove ${item.name} from this workspace?`)) return;
    setItems((current) => current.filter((entry) => entry.id !== id));
    setSelectedSavings((current) => current.filter((selected) => selected !== id));
    setIsSample(false);
    setNotice(`${item.name} was removed.`);
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "subscriptiq-subscriptions.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("Your subscription data export has been prepared.");
  }

  function resetWorkspace() {
    if (!window.confirm("Reset this browser workspace to the sample subscriptions? Your saved local entries will be replaced.")) return;
    const samples = demoSubscriptions();
    setItems(samples);
    setSelectedSavings([]);
    setIsSample(true);
    setNotice("The sample workspace has been restored.");
  }

  return (
    <div className="si-shell">
      <aside className="si-sidebar">
        <a className="si-brand" href="/dashboard" onClick={(event) => { event.preventDefault(); setView("overview"); }}>
          <span className="si-brand-mark">S</span>
          <span><strong>SubscriptIQ</strong><small>SUBSCRIPTION INTELLIGENCE</small></span>
        </a>

        <div className="si-workspace-switcher">
          <span className="si-workspace-avatar">{email.slice(0, 1).toUpperCase()}</span>
          <span className="si-workspace-copy"><strong>Personal workspace</strong><small>Individual account</small></span>
          <span className="si-chevron">⌄</span>
        </div>

        {(["WORKSPACE", "INTELLIGENCE", "BUSINESS", "SETTINGS"] as const).map((group) => (
          <div className="si-nav-group" key={group}>
            <p className="si-nav-label">{group}</p>
            {navigation.filter((entry) => entry.group === group).map((entry) => (
              <button
                className={`si-nav-item ${view === entry.id ? "active" : ""}`}
                key={entry.id}
                onClick={() => setView(entry.id)}
              >
                <span className="si-nav-symbol">{entry.symbol}</span>
                <span>{entry.label}</span>
                {entry.id === "guardian" && leaks.length > 0 && <span className="si-nav-count">{leaks.length}</span>}
              </button>
            ))}
          </div>
        ))}

        <div className="si-sidebar-bottom">
          <div className="si-help-card">
            <span className="si-help-icon">✦</span>
            <strong>Make subscriptions smarter</strong>
            <p>Find waste, spot overlap and plan ahead.</p>
            <button onClick={() => setView("guardian")}>Explore Guardian <span>→</span></button>
          </div>
          <div className="si-user-row">
            <span className="si-user-avatar">{email.slice(0, 1).toUpperCase()}</span>
            <span className="si-user-details"><strong>{email.split("@")[0]}</strong><small>{email}</small></span>
            <form action={logout}><button className="si-logout" type="submit" aria-label="Log out" title="Log out">↗</button></form>
          </div>
        </div>
      </aside>

      <main className="si-main">
        <header className="si-topbar">
          <div className="si-breadcrumb"><span>Workspace</span><span>/</span><strong>{currentHeading}</strong></div>
          <div className="si-top-actions">
            <span className="si-live-indicator"><i /> All systems operational</span>
            <button className="si-icon-button" title="Privacy and data" onClick={() => setView("privacy")}>⚙</button>
            <span className="si-top-avatar">{email.slice(0, 1).toUpperCase()}</span>
          </div>
        </header>

        <div className="si-content">
          <div className="si-page-heading">
            <div>
              <div className="si-eyebrow">SUBSCRIPTION INTELLIGENCE PLATFORM</div>
              <h1>{view === "overview" ? "Good to see you." : currentHeading}</h1>
              <p>{view === "overview" ? "A clearer picture of what you pay for, use and renew." : pageDescription(view)}</p>
            </div>
            <div className="si-heading-actions">
              {isSample && <span className="si-demo-badge">SAMPLE DATA</span>}
              <button className="si-primary-button" onClick={() => setShowAdd(true)}><span>＋</span> Add subscription</button>
            </div>
          </div>

          <div className="si-local-notice">
            <span>ⓘ</span>
            <span><strong>Personal workspace preview.</strong> Changes are saved in this browser. Cloud sync and cross-device storage will be connected when the SubscriptIQ database is configured.</span>
          </div>

          {notice && <div className="si-toast" role="status"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss">×</button></div>}

          {!hydrated ? (
            <div className="si-loading">Preparing your workspace…</div>
          ) : (
            <>
              {view === "overview" && (
                <>
                  <section className="si-metric-grid">
                    <MetricCard label="Monthly recurring spend" value={money(monthlyTotal)} note={`${money(annualTotal)} estimated yearly`} symbol="₹" tone="blue" />
                    <MetricCard label="Active subscriptions" value={String(activeItems.length)} note={`${items.filter((item) => item.status === "Trial").length} trial subscriptions`} symbol="▤" tone="violet" />
                    <MetricCard label="Potential spending leaks" value={String(leaks.length)} note="Unused for 60+ days" symbol="◈" tone="amber" />
                    <MetricCard label="Renewals in 30 days" value={String(upcoming.length)} note={upcoming.length ? `Next: ${upcoming[0].name}` : "Nothing due soon"} symbol="◷" tone="green" />
                  </section>

                  <section className="si-overview-grid">
                    <div className="si-panel si-spend-panel">
                      <div className="si-panel-heading"><div><h2>Spend breakdown</h2><p>Monthly equivalent by category</p></div><span className="si-panel-tag">MONTHLY</span></div>
                      {categoryCounts.length === 0 ? <EmptyState title="No spending to analyse" body="Add a subscription to see your category breakdown." /> : (
                        <div className="si-category-list">
                          {categoryCounts.slice(0, 6).map(([category, count], index) => {
                            const total = activeItems.filter((item) => item.category === category).reduce((sum, item) => sum + monthlyCost(item), 0);
                            const percent = monthlyTotal > 0 ? (total / monthlyTotal) * 100 : 0;
                            return <div className="si-category-row" key={category}><div className="si-category-top"><span><i className={`si-category-dot dot-${index % 5}`} />{category}<small>{count} service{count === 1 ? "" : "s"}</small></span><strong>{money(total)}</strong></div><div className="si-progress-track"><span className={`si-progress-fill fill-${index % 5}`} style={{ width: `${percent}%` }} /></div></div>;
                          })}
                        </div>
                      )}
                      <div className="si-panel-footer"><span>Estimated monthly total</span><strong>{money(monthlyTotal)}</strong></div>
                    </div>

                    <div className="si-panel si-renewal-panel">
                      <div className="si-panel-heading"><div><h2>Upcoming renewals</h2><p>Your next 30 days</p></div><button className="si-text-button" onClick={() => setView("renewals")}>View all →</button></div>
                      {upcoming.length === 0 ? <EmptyState title="You're clear for now" body="No active subscriptions renew in the next 30 days." /> : (
                        <div className="si-renewal-list">
                          {upcoming.slice(0, 5).map((item) => <div className="si-renewal-item" key={item.id}><span className="si-service-icon">{item.name.slice(0, 1).toUpperCase()}</span><span className="si-renewal-copy"><strong>{item.name}</strong><small>{formatDate(item.nextRenewal)}</small></span><span className="si-renewal-cost"><strong>{money(item.amount)}</strong><small>{item.cycle}</small></span><span className={`si-due ${daysFromToday(item.nextRenewal) <= 3 ? "urgent" : ""}`}>{daysFromToday(item.nextRenewal) === 0 ? "Today" : `In ${daysFromToday(item.nextRenewal)}d`}</span></div>)}
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="si-insight-grid">
                    <button className="si-insight-card guardian-card" onClick={() => setView("guardian")}><span className="si-insight-symbol">◈</span><span className="si-insight-copy"><small>GUARDIAN INSIGHT</small><strong>{leaks.length ? `${leaks.length} possible spending leak${leaks.length === 1 ? "" : "s"}` : "Your subscriptions look active"}</strong><span>{leaks.length ? "Review services with no recent activity." : "We'll flag services that may need attention."}</span></span><span className="si-insight-arrow">→</span></button>
                    <button className="si-insight-card overlap-card" onClick={() => setView("guardian")}><span className="si-insight-symbol">⧉</span><span className="si-insight-copy"><small>OVERLAP DETECTOR</small><strong>{overlaps.length ? `${overlaps.length} categories have overlap` : "No category overlap detected"}</strong><span>{overlaps.length ? "Check whether you need multiple services." : "Similar categories will appear here."}</span></span><span className="si-insight-arrow">→</span></button>
                    <button className="si-insight-card savings-card" onClick={() => setView("savings")}><span className="si-insight-symbol">↗</span><span className="si-insight-copy"><small>SAVINGS SIMULATOR</small><strong>Explore your savings</strong><span>Model a cancellation scenario before deciding.</span></span><span className="si-insight-arrow">→</span></button>
                  </section>

                  <section className="si-panel si-table-panel">
                    <div className="si-panel-heading"><div><h2>Your subscriptions</h2><p>A quick view of everything you track</p></div><button className="si-text-button" onClick={() => setView("subscriptions")}>Manage subscriptions →</button></div>
                    <SubscriptionTable items={items.slice(0, 5)} onMarkUsed={(item) => updateItem(item.id, { lastUsed: dateInDays(0) })} onRemove={removeSubscription} />
                  </section>
                </>
              )}

              {view === "subscriptions" && (
                <section className="si-panel si-table-panel">
                  <div className="si-toolbar"><div className="si-search-wrap"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search subscriptions or categories…" /></div><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status"><option>All</option><option>Active</option><option>Trial</option><option>Past due</option><option>Cancelled</option></select></div>
                  <SubscriptionTable items={filteredItems} onMarkUsed={(item) => updateItem(item.id, { lastUsed: dateInDays(0) })} onRemove={removeSubscription} />
                  {filteredItems.length === 0 && <EmptyState title="No matching subscriptions" body="Try another search or add a subscription to your workspace." />}
                </section>
              )}

              {view === "guardian" && (
                <div className="si-stack">
                  <section className="si-panel"><div className="si-panel-heading"><div><h2>Leak Finder</h2><p>Services with no recorded activity for 60 days or more</p></div><span className="si-panel-tag">ACTIVITY SIGNAL</span></div>
                    {leaks.length === 0 ? <EmptyState title="No potential leaks found" body="When a subscription has no recent usage recorded, it will appear here." /> : <div className="si-guardian-list">{leaks.map((item) => <div className="si-guardian-row" key={item.id}><span className="si-service-icon">{item.name.slice(0, 1)}</span><div className="si-guardian-copy"><strong>{item.name}</strong><small>{item.category} · Last used {daysSince(item.lastUsed)} days ago</small></div><div className="si-guardian-cost"><strong>{money(monthlyCost(item))}/mo</strong><small>monthly equivalent</small></div><button className="si-secondary-button" onClick={() => updateItem(item.id, { lastUsed: dateInDays(0) })}>Mark as used</button></div>)}</div>}
                    <p className="si-footnote">An inactivity signal is not proof that a service is unnecessary. Review your actual usage and renewal terms before cancelling.</p>
                  </section>
                  <section className="si-panel"><div className="si-panel-heading"><div><h2>Overlap Detector</h2><p>Multiple services recorded in the same category</p></div><span className="si-panel-tag">CATEGORY MATCH</span></div>
                    {overlaps.length === 0 ? <EmptyState title="No overlaps detected" body="Add services with similar categories to compare them here." /> : <div className="si-overlap-grid">{overlaps.map(([category]) => <div className="si-overlap-card" key={category}><span className="si-overlap-category">{category}</span><strong>{activeItems.filter((item) => item.category === category).length} services</strong><div>{activeItems.filter((item) => item.category === category).map((item) => <span className="si-overlap-chip" key={item.id}>{item.name} · {money(monthlyCost(item))}/mo</span>)}</div></div>)}</div>}
                    <p className="si-footnote">Category matches are prompts for review, not proof that services have identical features.</p>
                  </section>
                </div>
              )}

              {view === "savings" && (
                <div className="si-stack">
                  <section className="si-savings-hero"><div><span className="si-eyebrow">WHAT-IF PLANNER</span><h2>Model a lighter subscription stack.</h2><p>Select services to include in a hypothetical cancellation scenario. Nothing is cancelled automatically.</p></div><div className="si-savings-total"><small>SCENARIO SAVINGS</small><strong>{money(savingsMonthly)}</strong><span>per month · {money(savingsMonthly * 12)} per year</span></div></section>
                  <section className="si-panel"><div className="si-panel-heading"><div><h2>Choose subscriptions to review</h2><p>Select the services you are considering removing</p></div><button className="si-text-button" onClick={() => setSelectedSavings([])}>Clear selection</button></div>
                    {activeItems.length === 0 ? <EmptyState title="Nothing to simulate yet" body="Add a subscription to start a savings scenario." /> : <div className="si-scenario-list">{activeItems.map((item) => <label className={`si-scenario-row ${selectedSavings.includes(item.id) ? "selected" : ""}`} key={item.id}><input type="checkbox" checked={selectedSavings.includes(item.id)} onChange={(event) => setSelectedSavings((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))} /><span className="si-service-icon">{item.name.slice(0, 1)}</span><span className="si-scenario-copy"><strong>{item.name}</strong><small>{item.category} · {item.cycle}</small></span><strong>{money(monthlyCost(item))}/mo</strong></label>)}</div>}
                  </section>
                </div>
              )}

              {view === "renewals" && (
                <section className="si-panel si-table-panel"><div className="si-panel-heading"><div><h2>Renewal calendar</h2><p>Upcoming renewal dates for active and trial services</p></div><span className="si-panel-tag">NEXT 30 DAYS · {upcoming.length}</span></div>
                  {upcoming.length === 0 ? <EmptyState title="No upcoming renewals" body="Your next 30 days are clear." /> : <div className="si-renewal-calendar">{upcoming.map((item) => <div className="si-calendar-row" key={item.id}><div className="si-calendar-date"><strong>{new Date(`${item.nextRenewal}T00:00:00`).getDate()}</strong><small>{new Intl.DateTimeFormat("en-IN", { month: "short" }).format(new Date(`${item.nextRenewal}T00:00:00`))}</small></div><div className="si-calendar-copy"><strong>{item.name}</strong><small>{item.category} · {item.cycle} billing</small></div><div className="si-calendar-amount"><strong>{money(item.amount)}</strong><small>{item.cycle}</small></div><span className={`si-due ${daysFromToday(item.nextRenewal) <= 3 ? "urgent" : ""}`}>{daysFromToday(item.nextRenewal) === 0 ? "Today" : `In ${daysFromToday(item.nextRenewal)} days`}</span></div>)}</div>}
                </section>
              )}

              {view === "entitlements" && (
                <div className="si-stack"><section className="si-entitlement-intro"><span className="si-eyebrow">B2B · ENTITLEMENT ENGINE</span><h2>Plan-based feature access.</h2><p>Preview how a business can package features and limits into subscription tiers. This is a product preview; live customer entitlements are not connected yet.</p></section>
                  <section className="si-panel"><div className="si-panel-heading"><div><h2>Plan comparison</h2><p>Example subscription packages for a SaaS business</p></div><span className="si-panel-tag">DEMO CONFIGURATION</span></div><div className="si-plan-selector">{(["Free", "Pro", "Enterprise"] as const).map((plan) => <button key={plan} className={selectedPlan === plan ? "selected" : ""} onClick={() => setSelectedPlan(plan)}>{plan}</button>)}</div><div className="si-plan-preview"><div><small>SELECTED PLAN</small><h3>{selectedPlan}</h3><p>{selectedPlan === "Free" ? "A starting point for individual users." : selectedPlan === "Pro" ? "More insight and flexibility for growing teams." : "Custom controls for larger organizations."}</p></div><span className="si-plan-price">{selectedPlan === "Free" ? "₹0" : selectedPlan === "Pro" ? "₹999" : "Custom"}<small>{selectedPlan === "Enterprise" ? "pricing" : "/ month · example"}</small></span></div><div className="si-feature-table"><div className="si-feature-header"><span>FEATURE</span><span>FREE</span><span>PRO</span><span>ENTERPRISE</span></div>{planFeatures.map((feature) => <div className="si-feature-row" key={feature.name}><strong>{feature.name}</strong><span>{feature.free}</span><span>{feature.pro}</span><span>{feature.enterprise}</span></div>)}</div><p className="si-footnote">Example plan names, prices and permissions are illustrative. The resolver and customer access enforcement need a database-backed B2B implementation before production use.</p></section>
                </div>
              )}

              {view === "privacy" && (
                <div className="si-stack"><section className="si-panel"><div className="si-panel-heading"><div><h2>Privacy & workspace data</h2><p>Understand what this dashboard stores and manage your local records</p></div><span className="si-panel-tag">DATA CONTROLS</span></div><div className="si-privacy-row"><div><strong>Browser-local workspace</strong><p>Your current subscription list is stored in this browser's local storage. It is not yet synced to Supabase.</p></div><span className="si-status-pill active">LOCAL ONLY</span></div><div className="si-privacy-row"><div><strong>Export your data</strong><p>Download a JSON copy of the subscriptions currently shown in this workspace.</p></div><button className="si-secondary-button" onClick={exportData}>Export JSON</button></div><div className="si-privacy-row"><div><strong>Restore sample workspace</strong><p>Replace the current browser data with the original sample subscriptions.</p></div><button className="si-danger-button" onClick={resetWorkspace}>Reset sample data</button></div><p className="si-footnote">This browser-local prototype does not send subscription records to a server. Before multi-device use, we will connect a user-owned Supabase table with Row Level Security.</p></section></div>
              )}
            </>
          )}
          <footer className="si-footer"><span>SubscriptIQ · Subscription intelligence</span><span>Understand subscriptions. Eliminate waste. Control access.</span></footer>
        </div>
      </main>

      {showAdd && <div className="si-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowAdd(false); }}><section className="si-modal" role="dialog" aria-modal="true" aria-labelledby="si-add-title"><div className="si-modal-heading"><div><span className="si-eyebrow">WORKSPACE</span><h2 id="si-add-title">Add a subscription</h2><p>Track a recurring service and its next renewal.</p></div><button className="si-modal-close" onClick={() => setShowAdd(false)} aria-label="Close">×</button></div><form onSubmit={addSubscription} className="si-form"><label>Service name<input name="name" placeholder="e.g. Streaming service" required maxLength={80} /></label><div className="si-form-row"><label>Category<select name="category"><option>Entertainment</option><option>Music</option><option>Cloud storage</option><option>Productivity</option><option>Design</option><option>Education</option><option>Utilities</option><option>Other</option></select></label><label>Price (₹)<input name="amount" type="number" min="1" step="0.01" placeholder="499" required /></label></div><div className="si-form-row"><label>Billing cycle<select name="cycle"><option>Monthly</option><option>Yearly</option></select></label><label>Next renewal<input name="nextRenewal" type="date" min="2020-01-01" defaultValue={dateInDays(30)} required /></label></div><label>Last used<input name="lastUsed" type="date" defaultValue={dateInDays(0)} /></label><div className="si-form-actions"><button type="button" className="si-secondary-button" onClick={() => setShowAdd(false)}>Cancel</button><button type="submit" className="si-primary-button">Save subscription</button></div></form></section></div>}
    </div>
  );
}

function pageDescription(view: View) {
  const descriptions: Record<View, string> = {
    overview: "A clearer picture of what you pay for, use and renew.",
    subscriptions: "Keep every recurring service organised in one place.",
    guardian: "Find possible waste and services that may overlap.",
    savings: "Estimate what a different subscription mix could save.",
    renewals: "Know what is coming up before it renews.",
    entitlements: "A preview of plan-based access for SaaS businesses.",
    privacy: "Manage and understand the data in this workspace.",
  };
  return descriptions[view];
}

function MetricCard({ label, value, note, symbol, tone }: { label: string; value: string; note: string; symbol: string; tone: string }) {
  return <article className="si-metric-card"><div className="si-metric-top"><span>{label}</span><span className={`si-metric-symbol ${tone}`}>{symbol}</span></div><strong className="si-metric-value">{value}</strong><small>{note}</small></article>;
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className="si-empty"><span>◌</span><strong>{title}</strong><p>{body}</p></div>;
}

function SubscriptionTable({ items, onMarkUsed, onRemove }: { items: Subscription[]; onMarkUsed: (item: Subscription) => void; onRemove: (id: string) => void }) {
  if (items.length === 0) return <EmptyState title="No subscriptions yet" body="Add your first subscription to start understanding your recurring spend." />;
  return <div className="si-table-wrap"><table className="si-table"><thead><tr><th>SERVICE</th><th>CATEGORY</th><th>PRICE</th><th>NEXT RENEWAL</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><span className="si-table-service"><span className="si-service-icon">{item.name.slice(0, 1).toUpperCase()}</span><strong>{item.name}</strong></span></td><td>{item.category}</td><td><strong>{money(item.amount)}</strong><small className="si-table-subtext">/{item.cycle.toLowerCase()}</small></td><td>{formatDate(item.nextRenewal)}</td><td><span className={`si-status-pill ${statusClass(item.status)}`}>{item.status}</span></td><td><div className="si-row-actions"><button title="Mark as used today" onClick={() => onMarkUsed(item)}>Used today</button><button className="si-remove-action" title="Remove subscription" onClick={() => onRemove(item.id)}>Remove</button></div></td></tr>)}</tbody></table></div>;
}
