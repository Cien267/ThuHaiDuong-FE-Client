import { Link, useNavigate } from "@tanstack/react-router";
import { Search, BookMarked, User, Menu, LogOut, Library } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CATEGORIES } from "@/features/stories/mock-data";
import { useAuthStore } from "@/features/auth/store";
import { toast } from "sonner";

export function SiteHeader() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const status = useAuthStore(s => s.status);
  const logout = useAuthStore(s => s.logout);

  async function handleLogout() {
    await logout();
    toast.success("Đã đăng xuất");
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BookMarked className="h-5 w-5" />
          </div>
          <span className="hidden text-lg font-bold sm:inline">Truyện Việt</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            to="/truyen"
            className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-foreground"
          >
            Danh sách
          </Link>
          <Link
            to="/truyen"
            search={{ sortBy: "TotalViews", sortDesc: true }}
            className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-foreground"
          >
            Bảng xếp hạng
          </Link>
          <div className="group relative">
            <button className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-accent hover:text-foreground">
              Thể loại
            </button>
            <div className="invisible absolute left-0 top-full z-50 grid w-[480px] grid-cols-3 gap-1 rounded-md border border-border bg-popover p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
              {CATEGORIES.map(c => (
                <Link
                  key={c.id}
                  to="/truyen"
                  search={{ categorySlug: c.slug }}
                  className="rounded px-3 py-2 text-sm hover:bg-accent"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <form
          className="ml-auto flex flex-1 items-center gap-2 md:max-w-sm"
          onSubmit={e => {
            e.preventDefault();
            const url = `/truyen?keyword=${encodeURIComponent(q)}`;
            window.location.href = url;
          }}
        >
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Tìm truyện, tác giả..."
              className="pl-9"
            />
          </div>
        </form>

        <div className="flex items-center gap-1">
          {status === "authenticated" && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {(user.displayName || user.username || user.email)
                      .slice(0, 1)
                      .toUpperCase()}
                  </span>
                  <span className="hidden max-w-[120px] truncate sm:inline">
                    {user.displayName || user.username}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">
                  {user.displayName || user.username}
                  <div className="truncate text-xs font-normal text-muted-foreground">
                    {user.email}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <Library className="mr-2 h-4 w-4" />
                  Tủ sách (sắp ra mắt)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                <Link to="/dang-nhap">
                  <User className="mr-1 h-4 w-4" />
                  Đăng nhập
                </Link>
              </Button>
              <Button size="sm" asChild className="hidden sm:inline-flex">
                <Link to="/dang-ky">Đăng ký</Link>
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
