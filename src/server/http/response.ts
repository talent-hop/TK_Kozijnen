import { ZodError } from "zod";
import { NextResponse } from "next/server";

type ErrorLike = {
  status?: number;
  message?: string;
};

export const jsonResponse = <T>(data: T, init?: ResponseInit) =>
  NextResponse.json(data, init);

export const createdResponse = <T>(data: T) =>
  NextResponse.json(data, { status: 201 });

export const noContentResponse = () => new NextResponse(null, { status: 204 });

export const notFoundResponse = (message = "Resource not found") =>
  NextResponse.json(
    {
      error: "NotFound",
      message,
    },
    { status: 404 }
  );

export const errorResponse = (error: unknown) => {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "ValidationError",
        issues: error.flatten(),
      },
      { status: 400 }
    );
  }

  const status = (error as ErrorLike)?.status ?? 500;
  const message = (error as ErrorLike)?.message ?? "Unexpected server error";

  return NextResponse.json(
    {
      error: "ServerError",
      message,
    },
    { status }
  );
};
