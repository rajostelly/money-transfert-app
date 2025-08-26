import { NextRequest, NextResponse } from "next/server";
import { scheduledJobsService } from "@/lib/scheduled-jobs";

let jobsStarted = false;

export async function POST(request: NextRequest) {
  try {
    // Prevent multiple initializations
    if (jobsStarted) {
      return NextResponse.json({
        success: true,
        message: "Scheduled jobs already running",
      });
    }

    // Start the scheduled jobs
    scheduledJobsService.start();
    jobsStarted = true;

    return NextResponse.json({
      success: true,
      message: "Scheduled jobs started successfully",
    });
  } catch (error) {
    console.error("Error starting scheduled jobs:", error);
    return NextResponse.json(
      { error: "Failed to start scheduled jobs" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    scheduledJobsService.stop();
    jobsStarted = false;

    return NextResponse.json({
      success: true,
      message: "Scheduled jobs stopped successfully",
    });
  } catch (error) {
    console.error("Error stopping scheduled jobs:", error);
    return NextResponse.json(
      { error: "Failed to stop scheduled jobs" },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json({
    running: jobsStarted,
    timestamp: new Date().toISOString(),
  });
}
