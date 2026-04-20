import { db } from "@/lib/db";

async function listVessel() {
  try {
    const vessels = await db.vessel.findMany({
      include: {
        route: true,
        crews: true,
        shipments: true,
      },
    });

    return vessels;
  } catch (error) {
    console.error("Error fetching vessels:", error);
    throw error;
  }
}

export async function GET() {
  try {
    const data = await listVessel();

    const response = {
      success: true,
      message: "Database connected successfully",
      total: data.length,
      data,
    };

    return new Response(JSON.stringify(response, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const errorResponse = {
      success: false,
      message: "Database connection failed",
      error: String(error),
    };

    return new Response(JSON.stringify(errorResponse, null, 2), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}