import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/features/auth/store";

const loginSchema = z.object({
  email: z.string().trim().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export const Route = createFileRoute("/dang-nhap")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Đăng nhập — Truyện Việt" },
      { name: "robots", content: "noindex,follow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { redirect } = Route.useSearch();
  const status = useAuthStore(s => s.status);
  const login = useAuthStore(s => s.login);
  const clearError = useAuthStore(s => s.clearError);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      navigate({ to: redirect ?? "/", replace: true });
    }
  }, [status, redirect, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fe: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as "email" | "password";
        fe[k] = issue.message;
      }
      setErrors(fe);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await login(parsed.data);
      toast.success("Đăng nhập thành công");
      router.invalidate();
      navigate({ to: redirect ?? "/", replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Đăng nhập thất bại";
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
          <h1 className="text-2xl font-bold">Đăng nhập</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Chào mừng bạn quay trở lại. Đọc truyện không cần đăng nhập — đăng nhập để
            đồng bộ tủ sách & lịch sử đọc.
          </p>
          <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
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
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={submitting}
              />
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
            </div>
            {errors.form && (
              <p className="rounded bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {errors.form}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link to="/dang-ky" className="text-primary hover:underline">
              Đăng ký
            </Link>
          </p>
          <p className="mt-2 text-center text-sm">
            <Link to="/" className="text-muted-foreground hover:underline">
              ← Tiếp tục đọc truyện không cần đăng nhập
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
