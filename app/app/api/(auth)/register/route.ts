import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/connectDB";
import { User } from "@/models/user";

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().trim().email("Please provide a valid email"),
    phone: z.string().trim().min(7, "Phone number is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["user", "driver", "admin"]).optional(),
    roles: z
      .union([
        z.array(z.enum(["user", "driver", "admin"])),
        z.enum(["user", "driver", "admin"]),
      ])
      .optional(),
    driverProfile: z
      .object({
        licenseNumber: z.string().min(1),
        licenseExpiry: z.coerce.date(),
        status: z.enum(["available", "on_mission", "off_duty"]).optional(),
        vehicleType: z.enum(["truck", "van", "other"]).optional(),
      })
      .optional(),
    adminProfile: z
      .object({
        department: z.string().min(1),
        designation: z.string().min(1),
        jurisdictionDistrict: z.string().optional(),
      })
      .optional(),
  })
  .passthrough();

async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { message: "Request body is required" },
        { status: 400 }
      );
    }

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      phone,
      password,
      role,
      roles,
      driverProfile,
      adminProfile,
      ...rest
    } = parsed.data;

    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { message: "Database is not configured" },
        { status: 500 }
      );
    }

    await connectDB();

    const roleValues = Array.isArray(roles)
      ? roles
      : typeof roles === "string"
        ? [roles]
        : role
          ? [role]
          : ["user"];

    const normalizedRoles = Array.from(new Set(roleValues));

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }],
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "A user with this email or phone number already exists",
        },
        { status: 409 }
      );
    }

    const createdUser = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: await hashPassword(password),
      roles: normalizedRoles,
      ...(driverProfile ? { driverProfile } : {}),
      ...(adminProfile ? { adminProfile } : {}),
      ...rest,
    });

    const userObject = createdUser.toObject();
    delete userObject.password;

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: userObject,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while registering the user",
      },
      { status: 500 }
    );
  }
}