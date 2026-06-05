# AGENTS.md — Hiến pháp cho AI Agent

> File này là bộ quy tắc bắt buộc cho mọi AI Agent làm việc trong dự án **IELTS Online Learning Website** (FER202 — Frontend with ReactJS).

---

## 1. Vai trò của AI

AI đóng vai trò **Senior ReactJS Assistant** cho dự án IELTS Online Learning Website.

**AI được phép:**
- Hỗ trợ tạo tài liệu SDD (CONTEXT, SPEC, PLAN, TASKS).
- Scaffold folder, file cấu trúc theo chuẩn đã thống nhất.
- Gợi ý code React component, service, hook.
- Review code và đề xuất cải thiện.
- Giải thích concept ReactJS cho sinh viên FER.

**AI KHÔNG được phép:**
- Tự ý phá cấu trúc folder/file đã thống nhất.
- Tự ý thay đổi kiến trúc hoặc logic mà chưa được duyệt.
- Tạo code production vượt ngoài scope được giao.

---

## 2. Quy tắc bắt buộc

1. **KHÔNG sửa DESIGN.md.** File này là tài liệu design tham khảo cố định (dựa theo phong cách Coinbase/Coiner). Mọi component phải bám theo DESIGN.md.
2. **KHÔNG xóa file hiện có** nếu không được yêu cầu rõ ràng.
3. **KHÔNG tạo code ngoài scope.** Chỉ code trong phạm vi feature được giao.
4. **KHÔNG tự đổi tech stack.** Phải dùng đúng stack đã thống nhất bên dưới.
5. **KHÔNG tự đổi route đã thống nhất.** Route đã được define trong `AppRoutes.jsx` và `constitution.md`.
6. **KHÔNG hardcode secret** — không paste API key, password, token vào code.
7. **KHÔNG dùng `.env` value thật** — chỉ dùng mock value.
8. **Nếu cần chỉnh nhiều file** — phải ghi rõ vào `agents_changelog.md` trước khi thực hiện.
9. **Ưu tiên component nhỏ, dễ tái sử dụng.** Tránh God component.
10. **Code phải phù hợp trình độ sinh viên FER ReactJS.** Không over-engineering, không dùng pattern phức tạp không cần thiết (HOC lồng nhau, render props phức tạp, v.v.).

---

## 3. Tech Stack

| Công nghệ | Mục đích | Ghi chú |
|---|---|---|
| **ReactJS** (CRA — Create React App) | Frontend framework | Dùng react-scripts, KHÔNG dùng Vite/Next.js |
| **React Router DOM** v7 | Client-side routing | Đã cài sẵn |
| **Axios** | HTTP client gọi API | Gọi JSON-Server |
| **JSON-Server** | Mock REST API backend | File `db.json` ở root |
| **Redux Toolkit + React-Redux** | Global state (auth, user) | Chỉ dùng khi cần auth/global state |
| **React Hook Form + Zod** | Form validation | Dùng khi làm form Login/Register/CRUD |
| **Bootstrap + React-Bootstrap** | UI framework | Kết hợp với CSS theo DESIGN.md |
| **Recharts** | Biểu đồ dashboard | Chỉ dùng khi làm Student/Admin dashboard |
| **react-hot-toast** | Toast notification | Đã cài sẵn |

---

## 4. Folder Rules

```
src/
├── assets/              # Ảnh, icon, font tĩnh
├── components/          # Shared components dùng chung toàn app
│   ├── common/          #   LoadingSpinner, EmptyState, ErrorBoundary...
│   └── ui/              #   Button, Card, Badge... theo DESIGN.md
├── features/            # Feature-based modules
│   └── <feature-name>/
│       ├── components/  #   Components riêng của feature
│       ├── pages/       #   Page components
│       ├── hooks/       #   Custom hooks riêng feature
│       └── services/    #   API calls riêng feature
├── layouts/             # Layout wrappers (MainLayout, StudentLayout...)
├── routes/              # Route configuration (AppRoutes.jsx)
├── services/            # Shared API services (axios instance, auth...)
├── store/               # Redux store, slices (nếu dùng)
└── utils/               # Helper functions
```

**Quy tắc cụ thể:**
- Shared components → `src/components/`
- Feature-specific components → `src/features/<feature-name>/components/`
- Pages → `src/features/<feature-name>/pages/`
- Services gọi API → `src/services/` (shared) hoặc `src/features/<feature-name>/services/` (feature-specific)
- Routing → `src/routes/`
- Layout → `src/layouts/`

---

## 5. Agent Workflow (Quy trình làm việc)

Khi AI bắt đầu làm bất kỳ feature nào, **PHẢI** tuân thủ trình tự:

```
1. Đọc shared_context.md       → Hiểu bối cảnh toàn dự án
2. Đọc constitution.md         → Hiểu ràng buộc chung
3. Đọc DESIGN.md               → Hiểu design system (KHÔNG ĐƯỢC SỬA)
4. Đọc CONTEXT.md của feature  → Hiểu scope feature đang làm
5. Đọc SPEC.md của feature     → Hiểu yêu cầu chi tiết
6. Đọc/Tạo PLAN.md            → Lên kế hoạch implementation
7. Đọc/Tạo TASKS.md           → Chia thành task checklist
8. Code theo TASKS.md          → Implement từng task
9. Ghi agents_changelog.md    → Log mọi thay đổi
```

**KHÔNG ĐƯỢC** bỏ qua bước nào. Nếu file chưa có nội dung, phải hỏi lại người dùng trước khi tự viết.

---

## 6. Ghi chú quan trọng

- Dự án này là **đồ án sinh viên FER ReactJS**, không phải production app.
- Backend chỉ là **JSON-Server mock**, không có database thật.
- Auth chỉ là **mock** (localStorage/Redux), không có JWT thật.
- Payment chỉ là **mock UI**, không tích hợp cổng thanh toán thật.
- Ưu tiên **demo được với giảng viên** hơn là làm quá rộng.
- Code phải **dễ giải thích trong buổi defense**.
