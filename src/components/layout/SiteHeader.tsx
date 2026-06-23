import { Link, useNavigate } from "@tanstack/react-router";
import { Search, User, Menu, LogOut, Library, X, ChevronRight } from "lucide-react";
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/features/auth/store";
import { toast } from "sonner";
import { flattenCategories } from "@/features/stories/categories";
import { categoriesQuery } from "@/features/stories/api";
import { useQuery } from "@tanstack/react-query";

export function SiteHeader() {
  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const logout = useAuthStore((s) => s.logout);
  const categoriesQ = useQuery(categoriesQuery());
  const flatCategories = flattenCategories(categoriesQ.data ?? []);

  async function handleLogout() {
    await logout();
    toast.success("Đã đăng xuất");
    navigate({ to: "/" });
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const url = `/truyen?keyword=${encodeURIComponent(q)}`;
    setMobileOpen(false);
    window.location.href = url;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto grid h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-3 md:h-16 md:gap-4 md:px-4">
        {/* Left: logo + mobile trigger */}
        <div className="flex items-center gap-1">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Mở menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[88vw] max-w-sm p-0">
              <SheetHeader className="border-b border-border px-4 py-3">
                <SheetTitle className="text-lg bg-linear-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent font-extrabold! inline-block font-[Lavishly_Yours]!">
                  Thu Hải Đường
                </SheetTitle>
              </SheetHeader>

              <ScrollArea className="h-[calc(100vh-3.5rem)]">
                <div className="space-y-4 p-4">
                  {/* Search inside drawer */}
                  <form onSubmit={submitSearch}>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Tìm truyện, tác giả..."
                        className="pl-9"
                      />
                    </div>
                  </form>

                  {/* Auth actions for guest */}
                  {status !== "authenticated" && (
                    <div className="grid grid-cols-2 gap-2">
                      <SheetClose asChild>
                        <Button asChild variant="outline" size="sm">
                          <Link
                            to="/dang-nhap"
                            search={{
                              redirect: undefined,
                            }}
                          >
                            Đăng nhập
                          </Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="greenShiny" asChild size="sm">
                          <Link to="/dang-ky">Đăng ký</Link>
                        </Button>
                      </SheetClose>
                    </div>
                  )}

                  {/* Primary nav */}
                  <nav className="grid gap-1">
                    <MobileNavLink
                      to="/"
                      label="Trang chủ"
                      onNavigate={() => setMobileOpen(false)}
                    />
                    <MobileNavLink
                      to="/truyen"
                      label="Danh sách truyện"
                      onNavigate={() => setMobileOpen(false)}
                    />
                    <MobileNavLink
                      to="/truyen"
                      search={{ sortBy: "TotalViews", sortDesc: true }}
                      label="Bảng xếp hạng"
                      onNavigate={() => setMobileOpen(false)}
                    />
                    {status === "authenticated" && (
                      <MobileNavLink
                        to="/tu-sach"
                        label="Tủ sách"
                        onNavigate={() => setMobileOpen(false)}
                      />
                    )}
                  </nav>

                  <div>
                    <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Thể loại
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {flatCategories.map((c) => (
                        <SheetClose asChild key={c.id}>
                          <Link
                            to="/truyen"
                            search={{ categorySlug: c.slug }}
                            className="rounded px-3 py-2 text-sm hover:bg-accent"
                          >
                            {c.name}
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                  </div>

                  {status === "authenticated" && user && (
                    <div className="border-t border-border pt-3">
                      <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Tài khoản
                      </div>
                      <div className="mb-2 truncate px-1 text-sm">
                        <div className="truncate font-medium">
                          {user.displayName || user.username}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => {
                          setMobileOpen(false);
                          void handleLogout();
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <Link
            to="/"
            className="text-lg bg-linear-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent font-extrabold! inline-block font-[Lavishly_Yours]!"
          >
            Thu Hải Đường
          </Link>

          <nav className="ml-2 hidden items-center gap-1 md:flex">
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
                {flatCategories.map((c) => (
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
        </div>

        {/* Middle: search (desktop) */}
        <form
          className="hidden min-w-0 items-center gap-2 md:flex md:max-w-sm md:ml-auto"
          onSubmit={submitSearch}
        >
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm truyện, tác giả..."
              className="pl-9"
            />
          </div>
        </form>

        {/* Right: auth */}
        <div className="flex items-center justify-end gap-1">
          {/* Mobile search icon → focus drawer search */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Tìm kiếm"
            onClick={() => setMobileOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {status === "authenticated" && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {(user.displayName || user.username || user.email).slice(0, 1).toUpperCase()}
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
                <DropdownMenuItem asChild>
                  <Link to="/tu-sach">
                    <Library className="mr-2 h-4 w-4" />
                    Tủ sách
                  </Link>
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
                <Link
                  to="/dang-nhap"
                  search={{
                    redirect: undefined,
                  }}
                >
                  <User className="mr-1 h-4 w-4" />
                  Đăng nhập
                </Link>
              </Button>
              <Button variant="greenShiny" size="sm" asChild className="hidden sm:inline-flex">
                <Link to="/dang-ky">Đăng ký</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function MobileNavLink({
  to,
  search,
  label,
  onNavigate,
}: {
  to: string;
  search?: Record<string, unknown>;
  label: string;
  onNavigate: () => void;
}) {
  return (
    <SheetClose asChild>
      <Link
        to={to}
        search={search as never}
        onClick={onNavigate}
        className="flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
      >
        <span>{label}</span>
        <ChevronRight className="h-4 w-4 opacity-50" />
      </Link>
    </SheetClose>
  );
}

// Silence unused-import lint when X icon dropped
void X;
