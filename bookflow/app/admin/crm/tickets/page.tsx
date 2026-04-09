import Link from "next/link";
import { adminSupabase } from "@/lib/supabase/admin";
import { MessageSquare } from "lucide-react";
import { updateTicketStatus } from "./actions";

const STATUS_STYLES: Record<string, string> = {
  open:        "bg-red-100 text-red-700",
  in_progress: "bg-amber-100 text-amber-700",
  resolved:    "bg-green-100 text-green-700",
  closed:      "bg-neutral-100 text-neutral-500",
};

const PRIORITY_STYLES: Record<string, string> = {
  low:    "bg-neutral-100 text-neutral-500",
  normal: "bg-blue-100 text-blue-600",
  high:   "bg-orange-100 text-orange-600",
  urgent: "bg-red-100 text-red-700",
};

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  let query = adminSupabase
    .from("support_tickets")
    .select("id, name, email, topic, message, status, priority, created_at, user_id")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data: tickets } = await query;
  const list = tickets ?? [];

  const counts = {
    all: list.length,
    open: list.filter((t) => t.status === "open").length,
    in_progress: list.filter((t) => t.status === "in_progress").length,
    resolved: list.filter((t) => t.status === "resolved").length,
    closed: list.filter((t) => t.status === "closed").length,
  };

  const filterLinks = [
    { label: "All", value: "all", count: counts.all },
    { label: "Open", value: "open", count: counts.open },
    { label: "In Progress", value: "in_progress", count: counts.in_progress },
    { label: "Resolved", value: "resolved", count: counts.resolved },
    { label: "Closed", value: "closed", count: counts.closed },
  ];

  const active = status ?? "all";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Support Tickets</h1>
          <p className="text-sm text-neutral-500 mt-1">Customer enquiries and support requests</p>
        </div>
        <Link href="/admin/crm" className="text-sm text-brand-500 hover:text-brand-600 font-medium">
          ← Back to CRM
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filterLinks.map(({ label, value, count }) => (
          <Link
            key={value}
            href={`/admin/crm/tickets?status=${value}`}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              active === value
                ? "bg-brand-500 text-white"
                : "bg-white border border-neutral-200 text-neutral-600 hover:border-brand-300"
            }`}
          >
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${active === value ? "bg-brand-600 text-brand-100" : "bg-neutral-100 text-neutral-500"}`}>
              {count}
            </span>
          </Link>
        ))}
      </div>

      {/* Tickets */}
      {list.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-xl py-16 text-center">
          <MessageSquare className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-500 text-sm">No tickets in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((ticket: {
            id: string; name: string; email: string; topic: string | null;
            message: string; status: string; priority: string; created_at: string; user_id: string | null;
          }) => (
            <div key={ticket.id} className="bg-white border border-neutral-200 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-neutral-900 text-sm">{ticket.name}</span>
                    <span className="text-neutral-400 text-xs">{ticket.email}</span>
                    {ticket.user_id && (
                      <Link href={`/admin/crm/${ticket.user_id}`} className="text-xs text-brand-500 hover:text-brand-600">
                        View profile →
                      </Link>
                    )}
                  </div>
                  {ticket.topic && (
                    <p className="text-xs font-medium text-neutral-600 mt-1 bg-neutral-100 inline-block px-2 py-0.5 rounded">
                      {ticket.topic}
                    </p>
                  )}
                  <p className="text-sm text-neutral-700 mt-2">{ticket.message}</p>
                  <p className="text-xs text-neutral-400 mt-2">
                    {new Date(ticket.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[ticket.status] ?? "bg-neutral-100 text-neutral-500"}`}>
                    {ticket.status.replace("_", " ")}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_STYLES[ticket.priority] ?? ""}`}>
                    {ticket.priority}
                  </span>
                </div>
              </div>

              {/* Status actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-100 flex-wrap">
                <span className="text-xs text-neutral-400 self-center mr-1">Update status:</span>
                {["open", "in_progress", "resolved", "closed"].map((s) => (
                  <form key={s} action={updateTicketStatus}>
                    <input type="hidden" name="ticketId" value={ticket.id} />
                    <input type="hidden" name="status" value={s} />
                    <button
                      type="submit"
                      disabled={ticket.status === s}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                        ticket.status === s
                          ? "bg-neutral-100 text-neutral-500"
                          : "bg-white border border-neutral-200 text-neutral-600 hover:border-brand-300 hover:text-brand-600"
                      }`}
                    >
                      {s.replace("_", " ")}
                    </button>
                  </form>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
