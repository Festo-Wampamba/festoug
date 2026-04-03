import { withRetry } from "@/lib/db";
import { projectInquiries } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { ChevronLeft, Inbox, Mail } from "lucide-react";
import { UpdateInquiryStatus } from "@/components/admin/update-inquiry-status";

export const metadata = { title: "Admin | Project Inquiries" };
export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  NEW:      "bg-orange-400/10 text-orange-400 border-orange-400/20",
  REVIEWED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  CLOSED:   "bg-jet text-light-gray-70 border-jet",
};

export default async function AdminInquiriesPage() {
  const allInquiries = await withRetry((db) =>
    db.select().from(projectInquiries).orderBy(desc(projectInquiries.createdAt))
  );

  const newCount = allInquiries.filter((i) => i.status === "NEW").length;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-light-gray hover:text-orange-yellow-crayola transition-colors text-sm font-medium mb-6"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white-2 text-xl font-bold">Project Inquiries</h2>
            <p className="text-light-gray-70 text-sm mt-1">
              {allInquiries.length} total ·{" "}
              {newCount > 0 ? (
                <span className="text-orange-400 font-semibold">{newCount} new</span>
              ) : (
                <span>all reviewed</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {allInquiries.length === 0 ? (
        <div className="bg-eerie-black-1 border border-jet rounded-2xl p-12 text-center">
          <Inbox className="w-10 h-10 text-light-gray-70 mx-auto mb-3" />
          <p className="text-white-2 font-semibold mb-1">No inquiries yet</p>
          <p className="text-light-gray-70 text-sm">Project briefs submitted via /get-started will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allInquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className={`bg-eerie-black-1 border rounded-2xl p-6 ${
                inquiry.status === "NEW" ? "border-orange-yellow-crayola/30" : "border-jet"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <p className="text-white-2 font-semibold">{inquiry.name}</p>
                    {inquiry.company && (
                      <span className="text-light-gray-70 text-xs">· {inquiry.company}</span>
                    )}
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[inquiry.status] ?? ""}`}>
                      {inquiry.status}
                    </span>
                  </div>
                  <a
                    href={`mailto:${inquiry.email}`}
                    className="text-orange-yellow-crayola text-sm hover:underline flex items-center gap-1 mb-3"
                  >
                    <Mail className="w-3.5 h-3.5" /> {inquiry.email}
                  </a>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-light-gray-70 mb-4">
                    <span><strong className="text-light-gray">Plan:</strong> {inquiry.plan}</span>
                    <span><strong className="text-light-gray">Timeline:</strong> {inquiry.timeline}</span>
                    <span><strong className="text-light-gray">Received:</strong> {new Date(inquiry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <div className="bg-jet/40 rounded-xl p-4">
                    <p className="text-xs text-light-gray-70 uppercase tracking-wider mb-2">Vision / Requirements</p>
                    <p className="text-light-gray text-sm leading-relaxed whitespace-pre-wrap">{inquiry.vision}</p>
                  </div>
                </div>

                <div className="shrink-0">
                  <UpdateInquiryStatus id={inquiry.id} currentStatus={inquiry.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
