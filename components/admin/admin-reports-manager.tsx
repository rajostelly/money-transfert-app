"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  Download,
  FileText,
  TrendingUp,
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

export function AdminReportsManager() {
  const [reportType, setReportType] = useState("daily");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async (format_type: "csv" | "json") => {
    setIsGenerating(true);
    try {
      let url = `/api/admin/reports?type=${reportType}&format=${format_type}&date=${startDate}`;

      if (reportType === "period") {
        url += `&endDate=${endDate}`;
      }

      window.open(url, "_blank");
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const presetReports = [
    {
      title: "Today's Report",
      description: "Financial activity for today",
      action: () => {
        setReportType("daily");
        setStartDate(format(new Date(), "yyyy-MM-dd"));
        generateReport("csv");
      },
    },
    {
      title: "Yesterday's Report",
      description: "Financial activity for yesterday",
      action: () => {
        const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
        setReportType("daily");
        setStartDate(yesterday);
        generateReport("csv");
      },
    },
    {
      title: "This Month's Report",
      description: "Financial activity for current month",
      action: () => {
        setReportType("monthly");
        setStartDate(format(startOfMonth(new Date()), "yyyy-MM-dd"));
        generateReport("csv");
      },
    },
    {
      title: "Last 7 Days",
      description: "Financial activity for past week",
      action: () => {
        setReportType("period");
        setStartDate(format(subDays(new Date(), 7), "yyyy-MM-dd"));
        setEndDate(format(new Date(), "yyyy-MM-dd"));
        generateReport("csv");
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Reports */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Quick Reports</span>
          </CardTitle>
          <CardDescription>
            Generate common financial reports instantly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {presetReports.map((report, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <h4 className="font-medium">{report.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.description}
                    </p>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={report.action}
                      disabled={isGenerating}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Generate CSV
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Report Generator */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Custom Report Generator</span>
          </CardTitle>
          <CardDescription>
            Create customized financial reports for specific periods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Report</SelectItem>
                  <SelectItem value="monthly">Monthly Report</SelectItem>
                  <SelectItem value="period">Custom Period</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">
                {reportType === "daily"
                  ? "Date"
                  : reportType === "monthly"
                  ? "Month"
                  : "Start Date"}
              </Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {reportType === "period" && (
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => generateReport("csv")}
              disabled={isGenerating}
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              {isGenerating ? "Generating..." : "Download CSV"}
            </Button>
            <Button
              onClick={() => generateReport("json")}
              disabled={isGenerating}
              variant="outline"
              className="flex-1"
            >
              <FileText className="mr-2 h-4 w-4" />
              {isGenerating ? "Generating..." : "View JSON"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Information */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Report Contents</CardTitle>
          <CardDescription>
            What's included in the financial reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-3">Summary Information</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Total transfers (completed, pending, failed)</li>
                <li>• Total volume in CAD</li>
                <li>• Total fees collected</li>
                <li>• Total revenue generated</li>
                <li>• New user registrations</li>
                <li>• Average transfer amount</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Detailed Data</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Individual transfer records</li>
                <li>• Sender and beneficiary information</li>
                <li>• Exchange rates used</li>
                <li>• Transfer types (one-time vs subscription)</li>
                <li>• Transaction status and timestamps</li>
                <li>• Fee breakdowns</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
