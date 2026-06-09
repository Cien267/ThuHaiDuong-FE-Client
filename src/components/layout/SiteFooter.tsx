export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-base font-bold text-foreground">Truyện Việt</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Nền tảng đọc truyện online — ngôn tình, kiếm hiệp, tiên hiệp, đô thị và nhiều thể loại khác.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Khám phá</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="/truyen" className="hover:text-foreground">Danh sách truyện</a></li>
              <li><a href="/truyen?sortBy=TotalViews" className="hover:text-foreground">Bảng xếp hạng</a></li>
              <li><a href="/truyen?storyType=Completed" className="hover:text-foreground">Truyện hoàn thành</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Tài khoản</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="/dang-nhap" className="hover:text-foreground">Đăng nhập</a></li>
              <li><a href="/dang-ky" className="hover:text-foreground">Đăng ký</a></li>
              <li><a href="/tu-sach" className="hover:text-foreground">Tủ sách</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Hỗ trợ</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Điều khoản</a></li>
              <li><a href="#" className="hover:text-foreground">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-foreground">Liên hệ</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Truyện Việt. Đọc truyện online miễn phí.
        </div>
      </div>
    </footer>
  );
}
