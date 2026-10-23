import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth } from "@workspace/auth/better-auth/auth";
import { ratelimit } from "@/server/ratelimit";

const VALID_PNG_BYTES = Uint8Array.from(
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4//8/AwAI/AL+QpLXWQAAAABJRU5ErkJggg==",
    "base64",
  ),
);

// Mock Auth
vi.mock("@workspace/auth/better-auth/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

// Mock ratelimit
vi.mock("@/server/ratelimit", () => ({
  ratelimit: {
    limit: vi.fn(),
  },
}));

// Mock Next.js headers
vi.mock("next/headers", () => ({
  headers: vi.fn(() => new Headers()),
}));

// Mock @vercel/blob
const mockPut = vi.fn();
vi.mock("@vercel/blob", () => ({
  put: (...args: any[]) => mockPut(...args),
}));


describe("ModifyAvatar Route Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: authenticated user
    vi.mocked(auth.api.getSession).mockResolvedValue({
      session: { id: "session_1" },
      user: { id: "user_1", email: "test@test.com", name: "Test User" },
    } as any);

    vi.mocked(ratelimit.limit).mockResolvedValue({ success: true } as any);
  });

  describe("POST handler", () => {
    it("should return 401 when not authenticated", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue(null as any);

      const { POST } =
        await import("../../app/api/settings/modifyAvatar/route.js");

      const formData = new FormData();
      formData.append(
        "file",
        new File(["test"], "avatar.png", { type: "image/png" }),
      );

      const request = new Request(
        "http://localhost:3000/api/settings/modifyAvatar",
        {
          method: "POST",
          body: formData,
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 429 when rate limit is exceeded", async () => {
      vi.mocked(ratelimit.limit).mockResolvedValue({ success: false } as any);

      const { POST } =
        await import("../../app/api/settings/modifyAvatar/route.js");

      const formData = new FormData();
      formData.append(
        "file",
        new File(["test"], "avatar.png", { type: "image/png" }),
      );

      const request = new Request(
        "http://localhost:3000/api/settings/modifyAvatar",
        {
          method: "POST",
          body: formData,
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe("Rate limit exceeded");
    });

    it("should return 400 when no file is provided", async () => {
      const { POST } =
        await import("../../app/api/settings/modifyAvatar/route.js");

      const formData = new FormData();

      const request = new Request(
        "http://localhost:3000/api/settings/modifyAvatar",
        {
          method: "POST",
          body: formData,
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("No file provided");
    });

    it("should return 400 when file is not an image", async () => {
      const { POST } =
        await import("../../app/api/settings/modifyAvatar/route.js");

      const formData = new FormData();
      formData.append(
        "file",
        new File(["test"], "document.pdf", { type: "application/pdf" }),
      );

      const request = new Request(
        "http://localhost:3000/api/settings/modifyAvatar",
        {
          method: "POST",
          body: formData,
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        "Invalid image file. Please upload a valid PNG, JPEG, or WebP image.",
      );
    });

    it("should return 400 when image mime is spoofed", async () => {
      const { POST } =
        await import("../../app/api/settings/modifyAvatar/route.js");

      const formData = new FormData();
      formData.append(
        "file",
        new File(["not-a-real-image"], "avatar.png", { type: "image/png" }),
      );

      const request = new Request(
        "http://localhost:3000/api/settings/modifyAvatar",
        {
          method: "POST",
          body: formData,
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        "Invalid image file. Please upload a valid PNG, JPEG, or WebP image.",
      );
    });

    it("should return 400 for unsupported image formats like SVG", async () => {
      const { POST } =
        await import("../../app/api/settings/modifyAvatar/route.js");

      const formData = new FormData();
      formData.append(
        "file",
        new File(
          [
            '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>',
          ],
          "avatar.svg",
          { type: "image/svg+xml" },
        ),
      );

      const request = new Request(
        "http://localhost:3000/api/settings/modifyAvatar",
        {
          method: "POST",
          body: formData,
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe(
        "Unsupported image format. Only PNG, JPEG, and WebP images are allowed.",
      );
    });

    it("should return 400 when file exceeds 5MB", async () => {
      const { POST } =
        await import("../../app/api/settings/modifyAvatar/route.js");

      // Create a file slightly over 5MB
      const largeContent = new Uint8Array(5 * 1024 * 1024 + 1);
      const formData = new FormData();
      formData.append(
        "file",
        new File([largeContent], "large.png", { type: "image/png" }),
      );

      const request = new Request(
        "http://localhost:3000/api/settings/modifyAvatar",
        {
          method: "POST",
          body: formData,
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("File size exceeds 5MB limit.");
    });

    it("should upload to Vercel Blob by default", async () => {
      mockPut.mockResolvedValue({
        url: "https://blob.vercel.com/avatar.png",
      });

      const { POST } =
        await import("../../app/api/settings/modifyAvatar/route.js");

      const formData = new FormData();
      formData.append(
        "file",
        new File([VALID_PNG_BYTES], "avatar.png", { type: "image/png" }),
      );

      const request = new Request(
        "http://localhost:3000/api/settings/modifyAvatar",
        {
          method: "POST",
          body: formData,
        },
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.url).toBe("https://blob.vercel.com/avatar.png");
      expect(mockPut).toHaveBeenCalledTimes(1);
      const blobUploadCall = mockPut.mock.calls[0];
      expect(blobUploadCall).toBeDefined();
      const [objectKey, uploadedBody, options] = blobUploadCall!;
      expect(objectKey).toMatch(/^profile-images\/.*\.png$/);
      expect(objectKey).not.toContain("avatar.png");
      expect(Buffer.isBuffer(uploadedBody)).toBe(true);
      expect(options).toEqual(
        expect.objectContaining({
          access: "public",
          addRandomSuffix: false,
          contentType: "image/png",
        }),
      );
    });


  });
});
