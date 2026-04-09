"use client";

import { useState, useTransition } from "react";
import { Store, Receipt, Truck, User, Save, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { saveStoreSettings, updateAdminProfile } from "../actions";

type Settings = {
  store_name: string;
  store_tagline: string | null;
  store_email: string | null;
  store_phone: string | null;
  store_address: string | null;
  store_city: string | null;
  store_country: string | null;
  currency: string;
  tax_enabled: boolean;
  tax_rate: number;
  tax_label: string | null;
  free_shipping_threshold: number;
  flat_shipping_rate: number;
  maintenance_mode: boolean;
} | null;

type Profile = {
  first_name: string | null;
  last_name: string | null;
  email: string;
} | null;

type Props = {
  settings: Settings;
  profile: Profile;
  userEmail: string;
};

const TABS = [
  { key: "store",    label: "Store Info",  icon: Store },
  { key: "tax",      label: "Tax",         icon: Receipt },
  { key: "shipping", label: "Shipping",    icon: Truck },
  { key: "account",  label: "My Account",  icon: User },
];

function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
      <CheckCircle className="w-4 h-4 shrink-0" />
      {message}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      {message}
    </div>
  );
}

function Field({
  label, name, type = "text", defaultValue, placeholder, hint, required,
}: {
  label: string; name: string; type?: string;
  defaultValue?: string | number | null; placeholder?: string; hint?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
        step={type === "number" ? "0.01" : undefined}
        className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
      />
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}

function Toggle({ label, name, defaultChecked, hint }: {
  label: string; name: string; defaultChecked?: boolean; hint?: string;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <div className="relative mt-0.5">
        <input type="checkbox" name={name} defaultChecked={defaultChecked} className="sr-only peer" />
        <div className="w-10 h-5 bg-neutral-200 rounded-full peer-checked:bg-brand-500 transition-colors" />
        <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-700">{label}</p>
        {hint && <p className="text-xs text-neutral-400 mt-0.5">{hint}</p>}
      </div>
    </label>
  );
}

export default function SettingsTabs({ settings: s, profile, userEmail }: Props) {
  const [tab, setTab] = useState("store");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  function handleAction(action: (fd: FormData) => Promise<void>, successMsg: string) {
    return (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      setResult(null);
      startTransition(async () => {
        try {
          await action(fd);
          setResult({ ok: true, msg: successMsg });
        } catch (err: unknown) {
          setResult({ ok: false, msg: err instanceof Error ? err.message : "Something went wrong" });
        }
      });
    };
  }

  return (
    <div className="flex gap-6 items-start">
      {/* Tab nav */}
      <aside className="w-44 shrink-0">
        <nav className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => { setTab(key); setResult(null); }}
              className={`flex items-center gap-2.5 w-full px-4 py-3 text-sm font-medium transition-colors border-b border-neutral-100 last:border-0 ${
                tab === key
                  ? "bg-brand-50 text-brand-600"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Panel */}
      <div className="flex-1 min-w-0">
        {result?.ok && <SuccessBanner message={result.msg} />}
        {result && !result.ok && <ErrorBanner message={result.msg} />}

        {/* ── Store Info ── */}
        {tab === "store" && (
          <form onSubmit={handleAction(saveStoreSettings, "Store settings saved.")} className="space-y-4">
            <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-5">
              <h2 className="font-semibold text-neutral-900 text-base">Store Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Store Name" name="store_name" defaultValue={s?.store_name} required placeholder="BookFlow" />
                <Field label="Currency" name="currency" defaultValue={s?.currency ?? "GHS"} placeholder="GHS" hint="ISO currency code, e.g. GHS, USD" />
              </div>
              <Field label="Tagline" name="store_tagline" defaultValue={s?.store_tagline} placeholder="Your premier online bookstore" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Contact Email" name="store_email" type="email" defaultValue={s?.store_email} placeholder="hello@bookflow.com" />
                <Field label="Phone" name="store_phone" defaultValue={s?.store_phone} placeholder="+233-244-49-8467" />
              </div>
              <Field label="Address" name="store_address" defaultValue={s?.store_address} placeholder="123 Liberation Road" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="City" name="store_city" defaultValue={s?.store_city} placeholder="Accra" />
                <Field label="Country" name="store_country" defaultValue={s?.store_country} placeholder="Ghana" />
              </div>

              <div className="pt-2 border-t border-neutral-100">
                <h3 className="font-semibold text-neutral-900 text-sm mb-3">Danger Zone</h3>
                <Toggle
                  name="maintenance_mode"
                  label="Maintenance Mode"
                  defaultChecked={s?.maintenance_mode ?? false}
                  hint="When enabled, the storefront shows a coming-soon page to shoppers."
                />
              </div>
            </div>
            <SaveButton loading={isPending} />
          </form>
        )}

        {/* ── Tax ── */}
        {tab === "tax" && (
          <form onSubmit={handleAction(saveStoreSettings, "Tax settings saved.")} className="space-y-4">
            {/* Pass non-tax fields as hidden so upsert doesn't blank them */}
            <input type="hidden" name="store_name" value={s?.store_name ?? "BookFlow"} />
            <input type="hidden" name="store_tagline" value={s?.store_tagline ?? ""} />
            <input type="hidden" name="store_email" value={s?.store_email ?? ""} />
            <input type="hidden" name="store_phone" value={s?.store_phone ?? ""} />
            <input type="hidden" name="store_address" value={s?.store_address ?? ""} />
            <input type="hidden" name="store_city" value={s?.store_city ?? ""} />
            <input type="hidden" name="store_country" value={s?.store_country ?? ""} />
            <input type="hidden" name="currency" value={s?.currency ?? "GHS"} />
            <input type="hidden" name="free_shipping_threshold" value={s?.free_shipping_threshold ?? 200} />
            <input type="hidden" name="flat_shipping_rate" value={s?.flat_shipping_rate ?? 15} />
            {s?.maintenance_mode && <input type="hidden" name="maintenance_mode" value="on" />}

            <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-5">
              <h2 className="font-semibold text-neutral-900 text-base">Tax Configuration</h2>

              <Toggle
                name="tax_enabled"
                label="Enable Tax"
                defaultChecked={s?.tax_enabled ?? true}
                hint="Apply tax to all orders at checkout."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Tax Rate (%)"
                  name="tax_rate"
                  type="number"
                  defaultValue={s?.tax_rate != null ? +(s.tax_rate * 100).toFixed(4) : 17.5}
                  hint="Enter as a percentage, e.g. 17.5 for 17.5%"
                />
                <Field
                  label="Tax Label"
                  name="tax_label"
                  defaultValue={s?.tax_label ?? "VAT + NHIL + GETFund (17.5%)"}
                  placeholder="VAT + NHIL + GETFund (17.5%)"
                  hint="Shown on receipts and invoices"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                <p className="font-semibold mb-1">Ghana Revenue Authority breakdown</p>
                <ul className="space-y-0.5 text-xs">
                  <li>• VAT: 12.5%</li>
                  <li>• NHIL (National Health Insurance Levy): 2.5%</li>
                  <li>• GETFund Levy: 2.5%</li>
                  <li className="font-medium pt-1">Total: 17.5%</li>
                </ul>
              </div>
            </div>
            <SaveButton loading={isPending} />
          </form>
        )}

        {/* ── Shipping ── */}
        {tab === "shipping" && (
          <form onSubmit={handleAction(saveStoreSettings, "Shipping settings saved.")} className="space-y-4">
            <input type="hidden" name="store_name" value={s?.store_name ?? "BookFlow"} />
            <input type="hidden" name="store_tagline" value={s?.store_tagline ?? ""} />
            <input type="hidden" name="store_email" value={s?.store_email ?? ""} />
            <input type="hidden" name="store_phone" value={s?.store_phone ?? ""} />
            <input type="hidden" name="store_address" value={s?.store_address ?? ""} />
            <input type="hidden" name="store_city" value={s?.store_city ?? ""} />
            <input type="hidden" name="store_country" value={s?.store_country ?? ""} />
            <input type="hidden" name="currency" value={s?.currency ?? "GHS"} />
            <input type="hidden" name="tax_rate" value={s?.tax_rate != null ? +(s.tax_rate * 100).toFixed(4) : 17.5} />
            <input type="hidden" name="tax_label" value={s?.tax_label ?? ""} />
            {s?.tax_enabled && <input type="hidden" name="tax_enabled" value="on" />}
            {s?.maintenance_mode && <input type="hidden" name="maintenance_mode" value="on" />}

            <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-5">
              <h2 className="font-semibold text-neutral-900 text-base">Shipping Rules</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Free Shipping Threshold (GHS)"
                  name="free_shipping_threshold"
                  type="number"
                  defaultValue={s?.free_shipping_threshold ?? 200}
                  hint="Orders above this amount ship free. Set to 0 to disable."
                />
                <Field
                  label="Flat Shipping Rate (GHS)"
                  name="flat_shipping_rate"
                  type="number"
                  defaultValue={s?.flat_shipping_rate ?? 15}
                  hint="Charged on orders below the free shipping threshold."
                />
              </div>

              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 text-sm text-neutral-600">
                <p className="font-medium mb-1">Current rules</p>
                <p>Orders under GHS {s?.free_shipping_threshold ?? 200}: shipping = GHS {s?.flat_shipping_rate ?? 15}</p>
                <p>Orders GHS {s?.free_shipping_threshold ?? 200} and above: <span className="text-green-600 font-medium">FREE shipping</span></p>
              </div>
            </div>
            <SaveButton loading={isPending} />
          </form>
        )}

        {/* ── Account ── */}
        {tab === "account" && (
          <form onSubmit={handleAction(updateAdminProfile, "Profile updated.")} className="space-y-4">
            <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-5">
              <h2 className="font-semibold text-neutral-900 text-base">Admin Profile</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First Name" name="first_name" defaultValue={profile?.first_name} placeholder="Jane" />
                <Field label="Last Name" name="last_name" defaultValue={profile?.last_name} placeholder="Doe" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={userEmail}
                  disabled
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm bg-neutral-50 text-neutral-400 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-neutral-400">Email is managed through Supabase Auth and cannot be changed here.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Password</label>
                <div className="flex items-center gap-3">
                  <input
                    type="password"
                    value="••••••••••"
                    disabled
                    className="flex-1 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm bg-neutral-50 text-neutral-400 cursor-not-allowed"
                  />
                  <a
                    href="/account/forgot-password"
                    target="_blank"
                    className="text-sm text-brand-500 hover:text-brand-600 font-medium whitespace-nowrap"
                  >
                    Reset password →
                  </a>
                </div>
              </div>
            </div>
            <SaveButton loading={isPending} label="Update Profile" />
          </form>
        )}
      </div>
    </div>
  );
}

function SaveButton({ loading, label = "Save Changes" }: { loading: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {label}
    </button>
  );
}
