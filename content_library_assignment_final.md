# Báo cáo: Áp dụng công cụ kiểm thử tĩnh (ESLint) cho Module Content Library Validation

## 1. Giới thiệu Module (Module Overview)
- **Thuộc dự án (SWP Project)**: IELTS Online Learning Website.
- **Tên Module**: `ContentFileUploader` (Tích hợp trong phân hệ Teacher/Admin Dashboard để giáo viên tải học liệu lên hệ thống).
- **Loại Module**: React Component.

**Quy mô Module (Medium size)**:
- **Items (8 Screen Components / UI Fields)**:
  1. `fileInput`: Trường chọn file đầu vào.
  2. `fileNameInput`: Trường nhập tên tài liệu.
  3. `categorySelect`: Dropdown chọn kỹ năng (Reading/Listening).
  4. `uploadButton`: Nút Submit để xử lý upload.
  5. `cancelButton`: Nút Hủy và reset form.
  6. `errorAlert`: Component hiển thị thông báo lỗi.
  7. `successAlert`: Component hiển thị thông báo thành công.
  8. `uploadingAlert`: Component hiển thị trạng thái đang xử lý.
- **Transactions (5 User Actions / UI State Updates)**:
  1. `handleFileChange`: Người dùng chọn file -> Kích hoạt validate định dạng và dung lượng (UI update).
  2. `onChange Name`: Người dùng nhập ký tự -> Cập nhật tên tài liệu vào state.
  3. `onChange Category`: Người dùng chọn danh mục -> Cập nhật state.
  4. `handleUpload`: Bấm Upload -> Validate rỗng -> Gọi API giả lập.
  5. `handleCancel`: Bấm Cancel -> Xóa sạch state của form.

*(Đạt tiêu chuẩn yêu cầu: 7-15 items và 3-7 transactions)*

---

## 2. Tóm tắt Logic (Summary Code)

| Function / Handler | Mục đích (Purpose) |
| :--- | :--- |
| `handleFileChange(e)` | Bắt sự kiện người dùng chọn file, trích xuất đuôi mở rộng (`.pdf`, `.mp3`) và dung lượng để đối chiếu với tập luật Business Rules. Cập nhật cảnh báo lên UI nếu file bị lỗi. |
| `handleUpload()` | Thực hiện validate chốt chặn cuối (đảm bảo file và tên không bị bỏ trống). Khởi tạo `FormData` và gọi hàm setTimeout (giả lập API Call) để đẩy dữ liệu lên máy chủ. |
| `render()` (JSX) | Kết xuất (Render) giao diện gồm 8 UI components và thực hiện Data-binding (liên kết State vào `value`, `onChange`, `onClick`). |

---

## 3. Code cố ý chứa lỗi (Before Fix)
*Component React này chứa 5 lỗi cú pháp (Syntax & Code Smells) để công cụ quét lỗi bắt được.*

```jsx
import React, { useState } from 'react';

const ContentFileUploader = () => {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [category, setCategory] = useState('Reading');
    const [status, setStatus] = useState(''); 
    const [message, setMessage] = useState('');

    // LỖI 1 (no-undef): Quên từ khóa const/let
    maxAllowedSize = 5 * 1024 * 1024; 
    const allowedExtensions = ['pdf', 'mp3', 'mp4'];

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        
        // LỖI 2 (no-cond-assign): Dùng dấu = thay vì ===
        if (selectedFile.size = 0) {
            setStatus('error');
            setMessage('File is empty.');
            return;
        }

        const fileExt = selectedFile.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExt)) {
            setStatus('error');
            setMessage('Invalid file extension.');
            return;
        }

        if (selectedFile.size > maxAllowedSize) {
            setStatus('error');
            setMessage('File exceeds 5MB limit.');
            return;
        }

        setFile(selectedFile);
        setStatus('');
        setMessage('');
    };

    const handleUpload = () => {
        if (!file || !fileName) {
            setStatus('error');
            setMessage('Please select a file and enter a name.');
            return;
        }

        // LỖI 3 (no-const-assign): Khởi tạo const sau đó lại gán giá trị mới
        const formData = new FormData();
        formData = new FormData(); 
        formData.append('file', file);
        formData.append('name', fileName);

        // LỖI 4 (no-unused-vars): Khai báo nhưng không dùng
        const unusedApiToken = "abc.def.ghi"; 

        setStatus('uploading');
        setMessage('Uploading in progress...');

        setTimeout(() => {
            setStatus('success');
            setMessage('Upload successful!');
            setFile(null);
            setFileName('');
        }, 1500);
    };

    return (
        <div className="content-uploader-module p-4 border rounded">
            <h2>Upload Course Content</h2>
            
            {status === 'error' && <div className="alert alert-danger">{message}</div>}
            {status === 'success' && <div className="alert alert-success">{message}</div>}
            {status === 'uploading' && <div className="alert alert-info">{message}</div>}

            <input type="file" className="form-control mb-2" onChange={handleFileChange} />
            <input type="text" className="form-control mb-2" placeholder="Document Name" value={fileName} onChange={(e) => setFileName(e.target.value)} />
            
            <select className="form-control mb-3" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Reading">Reading</option>
                <option value="Listening">Listening</option>
            </select>

            <button className="btn btn-primary me-2" onClick={handleUpload} disabled={status === 'uploading'}>Submit Upload</button>
            <button className="btn btn-secondary" onClick={() => { setFile(null); setFileName(''); setStatus(''); }}>Cancel</button>
        </div>
    );
    
    // LỖI 5 (no-unreachable): Viết lệnh sau return
    console.log("Render Component Finished");
};

export default ContentFileUploader;
```

---

## 4. Issues phát hiện bởi ESLint & Giải thích

Nếu đưa code trên vào ESLint với bộ cấu hình chuẩn (`eslint:recommended`), công cụ sẽ báo 5 lỗi cực kỳ chính xác:

| Mã lỗi ESLint (Issue ID) | Ý nghĩa (What it means) | Cách sửa (How to fix) |
| :--- | :--- | :--- |
| `no-undef` | Biến `maxAllowedSize` được sử dụng nhưng chưa được khai báo bởi `let` hoặc `const`. JavaScript tự tạo biến global, dễ gây bug ghi đè bộ nhớ. | Thêm từ khóa `const` trước biến. |
| `no-cond-assign` | Trong lệnh `if (selectedFile.size = 0)`, dấu `=` là phép gán. Nó khiến thuộc tính size của file bị gán lại bằng 0, điều kiện này luôn thành Falsy. | Thay dấu `=` thành toán tử so sánh `===`. |
| `no-const-assign` | Bạn đã khởi tạo hằng số `const formData = new FormData()`, nhưng ở dòng tiếp theo lại gán đè dữ liệu mới vào nó. Điều này vi phạm tính bất biến của `const`. | Xóa dòng gán đè thứ 2 đi. |
| `no-unused-vars` | Khai báo biến `unusedApiToken` nhưng không được dùng để tính toán hay truy xuất ở đâu cả. Rác code. | Xóa dòng khai báo biến dư thừa này. |
| `no-unreachable` | Lệnh `console.log()` bị đặt ngay phía dưới lệnh `return (JSX)`. React component khi render chạm tới return là thoát hàm ngay, code bên dưới mãi mãi không chạy. | Xóa dòng `console.log` này. |

---

## 5. Code sau khi đã Fix (After Fix)

```jsx
import React, { useState } from 'react';

const ContentFileUploader = () => {
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [category, setCategory] = useState('Reading');
    const [status, setStatus] = useState(''); 
    const [message, setMessage] = useState('');

    // FIXED 1: Đã thêm từ khóa const
    const maxAllowedSize = 5 * 1024 * 1024; 
    const allowedExtensions = ['pdf', 'mp3', 'mp4'];

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        
        // FIXED 2: Đã sửa thành toán tử so sánh tuyệt đối ===
        if (selectedFile.size === 0) {
            setStatus('error');
            setMessage('File is empty.');
            return;
        }

        const fileExt = selectedFile.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExt)) {
            setStatus('error');
            setMessage('Invalid file extension.');
            return;
        }

        if (selectedFile.size > maxAllowedSize) {
            setStatus('error');
            setMessage('File exceeds 5MB limit.');
            return;
        }

        setFile(selectedFile);
        setStatus('');
        setMessage('');
    };

    const handleUpload = () => {
        if (!file || !fileName) {
            setStatus('error');
            setMessage('Please select a file and enter a name.');
            return;
        }

        // FIXED 3: Đã xóa lệnh gán đè sai trái, chỉ khởi tạo 1 lần
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', fileName);

        // FIXED 4: Đã xóa biến unusedApiToken rác

        setStatus('uploading');
        setMessage('Uploading in progress...');

        setTimeout(() => {
            setStatus('success');
            setMessage('Upload successful!');
            setFile(null);
            setFileName('');
        }, 1500);
    };

    return (
        <div className="content-uploader-module p-4 border rounded">
            <h2>Upload Course Content</h2>
            
            {status === 'error' && <div className="alert alert-danger">{message}</div>}
            {status === 'success' && <div className="alert alert-success">{message}</div>}
            {status === 'uploading' && <div className="alert alert-info">{message}</div>}

            <input type="file" className="form-control mb-2" onChange={handleFileChange} />
            <input type="text" className="form-control mb-2" placeholder="Document Name" value={fileName} onChange={(e) => setFileName(e.target.value)} />
            
            <select className="form-control mb-3" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Reading">Reading</option>
                <option value="Listening">Listening</option>
            </select>

            <button className="btn btn-primary me-2" onClick={handleUpload} disabled={status === 'uploading'}>Submit Upload</button>
            <button className="btn btn-secondary" onClick={() => { setFile(null); setFileName(''); setStatus(''); }}>Cancel</button>
        </div>
    );
    // FIXED 5: Đã xóa đoạn console.log unreachable
};

export default ContentFileUploader;
```

---

## 6. Cơ sở kiểm thử (Test Basis)

**Source Documents:**
- **SRS (Software Requirement Specification)**: Tài liệu yêu cầu chức năng Upload học liệu lên máy chủ cho giáo viên.
- **Business Rules (BR)**:
  - `[BR-01]` Chỉ chấp nhận định dạng file mở rộng: `.pdf`, `.mp3`, `.mp4`.
  - `[BR-02]` Kích thước file đầu vào lớn hơn `0MB` và tối đa không quá `5MB` (`5 * 1024 * 1024 bytes`).
  - `[BR-03]` Không được thao tác Upload nếu chưa nhập Document Name hoặc chưa chọn file hợp lệ.
- **Design Specification**: Hiển thị Error Alert màu đỏ nếu vi phạm nghiệp vụ, Success Alert màu xanh khi API trả kết quả thành công.

## 7. Điều kiện kiểm thử (Test Conditions)
1. **TC_Cond_01**: Validate điều kiện dung lượng file (Size validation).
2. **TC_Cond_02**: Validate điều kiện định dạng file (Extension validation).
3. **TC_Cond_03**: Validate điều kiện dữ liệu bắt buộc (Mandatory fields validation).
4. **TC_Cond_04**: Validate luồng cập nhật trạng thái UI (Cancel action, trạng thái Uploading).

## 8. Kịch bản kiểm thử (Test Cases)
*Sử dụng kỹ thuật Kiểm thử Phân vùng tương đương (EP) và Phân tích giá trị biên (BVA).*

| Test Case ID | Test Condition | Kịch bản / Test Data | Kết quả mong đợi (Expected Result) |
| :--- | :--- | :--- | :--- |
| **TC01** | EP (Valid) | File: `reading.pdf`, Size: `2MB`, Name: `Bài 1` | System cho phép upload, báo "Upload successful!". |
| **TC02** | EP (Valid) | File: `audio.mp3`, Size: `4MB`, Name: `Nghe 1` | System cho phép upload, báo "Upload successful!". |
| **TC03** | BVA (Valid) | File: `video.mp4`, Size: `5MB` (Biên hợp lệ Max) | System cho phép upload, báo "Upload successful!". |
| **TC04** | BVA (Invalid) | File: `video.mp4`, Size: `5.1MB` (Biên không hợp lệ Max) | Ném lỗi: "File exceeds 5MB limit." Nút Submit có thể bị block logic. |
| **TC05** | EP (Invalid) | File: `heavy_video.mp4`, Size: `8MB` | Ném lỗi: "File exceeds 5MB limit." |
| **TC06** | EP (Invalid) | File: `virus.exe`, Size: `2MB` (Sai định dạng) | Ném lỗi: "Invalid file extension." |
| **TC07** | BVA (Invalid) | File: `empty_doc.pdf`, Size: `0MB` (Biên rỗng Min) | Ném lỗi: "File is empty." |
| **TC08** | EP (Invalid) | File: `reading.pdf`, Size: `2MB`, Name: `(Để trống)` | Nhấn Upload hệ thống chặn lại báo: "Please select a file and enter a name." |
| **TC09** | UI Flow | Đã điền Form -> Bấm nút Cancel | Hệ thống xóa sạch dữ liệu trên UI Form và các State lưu trữ. |
