import { type NextRequest, NextResponse } from "next/server";

// This is a mock implementation since we can't actually check document status
// In a real implementation, this would call the Knowledge Retrieval API to check document status
export async function GET(req: NextRequest) {
  try {
    // Check for authorization token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid authorization token" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Get document ID from query params
    const url = new URL(req.url);
    const documentId = url.searchParams.get("id");

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    // In a real implementation, we would call the Knowledge API to check document status
    // For this mock implementation, we'll simulate a document status

    // Simulate different statuses based on document ID to demonstrate UI states
    // In a real implementation, this would be the actual status from the Knowledge API
    let status;
    const name = "Document " + documentId.substring(0, 8);
    const size = 1024 * 1024 * Math.random() * 5; // Random size between 0-5MB

    // For demo purposes, use the document ID to determine status
    // In a real implementation, this would be the actual status from the API
    const lastChar = documentId.charAt(documentId.length - 1);
    const charCode = lastChar.charCodeAt(0);

    if (charCode % 10 === 0) {
      status = "error";
      return NextResponse.json({
        id: documentId,
        name,
        size,
        status,
        error: "Failed to process document",
      });
    } else if (charCode % 10 <= 3) {
      status = "processing";
    } else {
      status = "ready";
    }

    return NextResponse.json({
      id: documentId,
      name,
      size,
      status,
    });
  } catch (error) {
    console.error("Error checking document status:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unknown error occurred checking status",
      },
      { status: 500 }
    );
  }
}
