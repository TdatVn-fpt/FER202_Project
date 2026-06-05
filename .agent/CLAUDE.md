# CLAUDE.md — Luật làm việc dành riêng cho Claude

> File này quy định cách Claude AI tương tác với dự án **IELTS Online Learning Website** (FER202).

---

## 1. Ngôn ngữ

- Claude **PHẢI trả lời bằng tiếng Việt**.
- Tên biến, tên component, tên file vẫn dùng tiếng Anh theo convention React.
- Comment trong code có thể dùng tiếng Việt hoặc tiếng Anh tùy context.

---

## 2. Quy trình bắt buộc khi được yêu cầu code

Khi người dùng yêu cầu Claude code bất kỳ feature nào, Claude **PHẢI đọc** theo thứ tự:

1. `.agent/AGENTS.md` — Hiểu vai trò và quy tắc chung.
2. `.sdd/shared_context.md` — Hiểu bối cảnh dự án.
3. `.sdd/constitution.md` — Hiểu ràng buộc project.
4. `DESIGN.md` — Hiểu design system. **KHÔNG ĐƯỢC SỬA file này.**
5. `.sdd/.spec/<feature>/CONTEXT.md` — Hiểu scope feature.
6. `.sdd/.spec/<feature>/SPEC.md` — Hiểu yêu cầu chi tiết.
7. `.sdd/.spec/<feature>/PLAN.md` — Hiểu kế hoạch triển khai.
8. `.sdd/.spec/<feature>/TASKS.md` — Hiểu task cần làm.

---

## 3. Quy tắc ứng xử

### Claude PHẢI:
- ✅ Hỏi lại nếu yêu cầu mơ hồ hoặc có thể hiểu nhiều cách.
- ✅ Ưu tiên giải thích ngắn gọn, dễ hiểu cho sinh viên FER.
- ✅ Chia task thành bước nhỏ, mỗi bước rõ ràng.
- ✅ Ghi changelog vào `.sdd/agents_changelog.md` nếu sửa/tạo file.
- ✅ Ưu tiên component nhỏ, tái sử dụng được.
- ✅ Giải thích tại sao chọn cách tiếp cận này (không chỉ "làm gì").

### Claude KHÔNG ĐƯỢC:
- ❌ Tự tạo logic ngoài scope feature đang làm.
- ❌ Tự sửa DESIGN.md.
- ❌ Tự thay đổi route đã thống nhất.
- ❌ Tự đổi tech stack.
- ❌ Dùng thuật ngữ backend phức tạp (vì dự án chỉ mock bằng JSON-Server).
- ❌ Over-engineering — không dùng pattern phức tạp khi có cách đơn giản hơn.
- ❌ Hardcode secret, API key, password vào code.
- ❌ Xóa file hiện có khi không được yêu cầu.

---

## 4. Route Guest/Public phải giữ nguyên

Claude phải đảm bảo các route sau không bị thay đổi:

| Route | Trang | Ghi chú |
|---|---|---|
| `/` | HomePage | Trang chủ public |
| `/courses` | CourseListPage | Danh sách khóa học |
| `/courses/:id` | CourseDetailPage | Chi tiết khóa học preview |
| `/login` | LoginPage | Đăng nhập |
| `/register` | RegisterPage | Đăng ký |
| `/forgot-password` | ForgotPasswordPage | Quên mật khẩu |
| `/403` | ForbiddenPage | Không có quyền |
| `/404` | NotFoundPage | Không tìm thấy trang |

---

## 5. Route toàn hệ thống (tham khảo)

| Prefix | Actor | Ví dụ |
|---|---|---|
| `/` | Guest/Public | `/`, `/courses`, `/courses/:id` |
| `/login`, `/register` | Auth | Đăng nhập, đăng ký |
| `/learning/*` | Student | `/learning/dashboard`, `/learning/courses` |
| `/teacher/*` | Teacher | `/teacher/dashboard`, `/teacher/courses` |
| `/admin/*` | Admin | `/admin/dashboard`, `/admin/users` |

---

## 6. Cách viết code chuẩn cho dự án này

```jsx
// ✅ TỐT: Component nhỏ, rõ ràng, dễ hiểu
function CourseCard({ course }) {
  return (
    <div className="course-card">
      <h3>{course.title}</h3>
      <p>{course.description}</p>
    </div>
  );
}

// ❌ XẤU: God component, logic chồng chéo
function EverythingPage() {
  // 500 dòng code xử lý mọi thứ...
}
```

---

## 7. Khi không chắc chắn

Nếu Claude không chắc chắn về:
- Scope feature → Hỏi lại người dùng.
- Design → Tham khảo DESIGN.md, hỏi nếu không rõ.
- Route → Tham khảo `AppRoutes.jsx` và `constitution.md`.
- Data structure → Tham khảo `db.json` và `shared_context.md`.

**Nguyên tắc: Hỏi trước, làm sau. Không đoán mò.**
