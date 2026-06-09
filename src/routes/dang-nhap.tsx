import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/dang-nhap")({
  head: () => ({
    meta: [
      { title: "Đăng nhập — Truyện Việt" },
      { name: "robots", content: "noindex,follow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="container mx-auto flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-sm">
          <h1 className="text-2xl font-bold">Đăng nhập</h1>
          <p className="mt-1 text-sm text-muted-foreground">Chào mừng bạn quay trở lại</p>
          <form className="mt-6 space-y-4" onSubmit={e => e.preventDefault()}>
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <Input type="email" placeholder="you@example.com" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Mật khẩu</label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full">Đăng nhập</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Chưa có tài khoản? <Link to="/" className="text-primary hover:underline">Đăng ký</Link>
          </p>
          <p className="mt-4 rounded-md bg-muted/40 p-3 text-center text-xs text-muted-foreground">
            Trang đăng nhập sẽ được kết nối API ở bước tiếp theo.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
