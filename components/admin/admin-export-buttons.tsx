"use client";

import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

export function AdminExportButtons() {
  const exportDailyReport = () => {
    const today = new Date().toISOString().split("T")[0];
    window.open(
      `/api/admin/reports?type=daily&format=csv&date=${today}`,
      "_blank"
    );
  };

  const exportMonthlyReport = () => {
    const today = new Date().toISOString().split("T")[0];
    window.open(
      `/api/admin/reports?type=monthly&format=csv&date=${today}`,
      "_blank"
    );
  };

  const exportUsers = () => {
    window.open("/api/admin/users/export?format=csv", "_blank");
  };

  const exportSubscriptions = () => {
    window.open("/api/admin/subscriptions?format=csv&status=ACTIVE", "_blank");
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-3">
        <h4 className="font-medium">Financial Reports</h4>
        <div className="flex flex-col gap-2">
          <Button variant="outline" size="sm" onClick={exportDailyReport}>
            <Download className="mr-2 h-4 w-4" />
            Daily Report (CSV)
          </Button>
          <Button variant="outline" size="sm" onClick={exportMonthlyReport}>
            <FileText className="mr-2 h-4 w-4" />
            Monthly Report (CSV)
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        <h4 className="font-medium">Data Exports</h4>
        <div className="flex flex-col gap-2">
          <Button variant="outline" size="sm" onClick={exportUsers}>
            <Download className="mr-2 h-4 w-4" />
            Export Users (CSV)
          </Button>
          <Button variant="outline" size="sm" onClick={exportSubscriptions}>
            <Download className="mr-2 h-4 w-4" />
            Export Subscriptions (CSV)
          </Button>
        </div>
      </div>
    </div>
  );
}
