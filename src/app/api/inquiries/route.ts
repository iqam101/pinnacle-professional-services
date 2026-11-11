import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import {
  createInquiry,
  listInquiries,
  updateInquiryStatus,
} from "@/lib/db";
import type { InquiryItem } from "@/types/cms";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ inquiries: listInquiries() });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      phone?: string;
      companyName?: string;
      service?: string;
      message?: string;
    };

    const name = (body.name || "").trim();
    const email = (body.email || "").trim();
    const phone = (body.phone || "").trim();
    const service = (body.service || "General Inquiry").trim();
    const message = (body.message || "").trim();

    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: "Name, phone number, and message are required." },
        { status: 400 }
      );
    }

    const created = createInquiry({
      name,
      email: email || "Not provided",
      phone,
      companyName: (body.companyName || "").trim(),
      service,
      message,
    });

    return NextResponse.json({ inquiry: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to submit inquiry." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      id?: string;
      status?: InquiryItem["status"];
    };
    if (!body.id || !body.status) {
      return NextResponse.json(
        { error: "Inquiry id and status are required." },
        { status: 400 }
      );
    }
    const ok = updateInquiryStatus(body.id, body.status);
    if (!ok) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to update inquiry status." },
      { status: 500 }
    );
  }
}
