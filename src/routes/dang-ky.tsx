import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/features/auth/store";

const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Họ tên tối thiểu 2 ký tự")
      .max(100, "Họ tên tối đa 100 ký tự"),
    username: z
      .string()
      .trim()
      .min(3, "Tên đăng nhập tối thiểu 3 ký tự")
      .max(32, "Tên đăng nhập tối đa 32 ký tự")
      .regex(/^[a-zA-Z0-9_.-]+$/, "Chỉ dùng chữ, số, dấu . _ -"),
    email: z.string().trim().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự").max(72, "Mật khẩu tối đa 72 ký tự"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Mật khẩu nhập lại không khớp",
  });

export const Route = createFileRoute("/dang-ky")({
  head: () => ({
    meta: [{ title: "Đăng ký — Thu Hải Đường" }, { name: "robots", content: "noindex,follow" }],
  }),
  component: RegisterPage,
});

type FieldErrors = Partial<
  Record<"fullName" | "username" | "email" | "password" | "confirm" | "form", string>
>;

function RegisterPage() {
  const navigate = useNavigate();
  const status = useAuthStore((s) => s.status);
  const register = useAuthStore((s) => s.register);

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") navigate({ to: "/", replace: true });
  }, [status, navigate]);

  function setField<K extends keyof typeof form>(k: K, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const fe: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof FieldErrors;
        fe[k] = issue.message;
      }
      setErrors(fe);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await register({
        fullName: parsed.data.fullName,
        username: parsed.data.username,
        email: parsed.data.email,
        password: parsed.data.password,
      });
      toast.success("Đăng ký thành công");
      navigate({ to: "/", replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Đăng ký thất bại";
      setErrors({ form: msg });
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold">Đăng ký tài khoản</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tạo tài khoản để lưu tủ sách & lịch sử đọc trên mọi thiết bị.
          </p>
          <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
            <div>
              <label className="mb-1 block text-sm font-medium">Họ tên</label>
              <Input
                value={form.fullName}
                onChange={(e) => setField("fullName", e.target.value)}
                placeholder="Nguyễn Văn A"
                autoComplete="name"
                disabled={submitting}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-destructive">{errors.fullName}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Tên đăng nhập</label>
              <Input
                value={form.username}
                onChange={(e) => setField("username", e.target.value)}
                placeholder="docgia01"
                autoComplete="username"
                disabled={submitting}
              />
              {errors.username && (
                <p className="mt-1 text-xs text-destructive">{errors.username}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={submitting}
              />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Mật khẩu</label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="new-password"
                disabled={submitting}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-destructive">{errors.password}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Nhập lại mật khẩu</label>
              <Input
                type="password"
                value={form.confirm}
                onChange={(e) => setField("confirm", e.target.value)}
                autoComplete="new-password"
                disabled={submitting}
              />
              {errors.confirm && <p className="mt-1 text-xs text-destructive">{errors.confirm}</p>}
            </div>
            {errors.form && (
              <p className="rounded bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {errors.form}
              </p>
            )}
            <Button variant="greenShiny" type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Đang tạo tài khoản..." : "Đăng ký"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link
              to="/dang-nhap"
              search={{ redirect: "/dang-ky" }}
              className="text-primary hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
          <p className="mt-2 text-center text-sm">
            <Link to="/" className="text-muted-foreground hover:underline">
              ← Tiếp tục đọc truyện không cần đăng ký
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
