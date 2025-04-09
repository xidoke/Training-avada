# Introduction

Koa.js là một web framework thế hệ mới cho Node.js, được thiết kế bởi đội ngũ đã tạo ra Express. Mục tiêu của Koa là trở thành một nền tảng nhỏ hơn, biểu cảm hơn và mạnh mẽ hơn để xây dựng các ứng dụng web và API.

Các đặc điểm chính của Koa.js bao gồm:

1.  **Sử dụng `async/await`**: Koa tận dụng các tính năng `async/await` của ES2017 để loại bỏ callback hell và giúp quản lý luồng điều khiển (control flow) của ứng dụng một cách dễ dàng hơn, làm cho code trông sạch sẽ và dễ hiểu hơn.
2.  **Middleware tinh gọn**: Koa có một lõi rất nhỏ và không đi kèm với bất kỳ middleware nào được tích hợp sẵn. Điều này cho phép các nhà phát triển lựa chọn và chỉ sử dụng những middleware mà họ thực sự cần. Kiến trúc middleware của Koa dựa trên `async` functions, hoạt động theo kiểu xếp chồng (cascading), cho phép thực hiện các hành động trước và sau khi một request được xử lý.
3.  **Đối tượng Context (`ctx`)**: Koa gộp các đối tượng `request` và `response` của Node.js vào một đối tượng duy nhất gọi là Context (`ctx`). Điều này cung cấp một giao diện thuận tiện hơn để làm việc với request và response, bao gồm nhiều phương thức trợ giúp hữu ích.
4.  **Xử lý lỗi tốt hơn**: Việc sử dụng `async/await` cũng giúp việc xử lý lỗi trở nên tự nhiên hơn thông qua cấu trúc `try...catch`.

Nhờ những đặc điểm này, Koa.js thường được coi là một lựa chọn hiện đại và linh hoạt hơn so với Express cho việc phát triển các ứng dụng Node.js, đặc biệt là các API.


# Application
Koa.js là một framework linh hoạt và có thể được sử dụng để xây dựng nhiều loại ứng dụng phía máy chủ (server-side) khác nhau. Dưới đây là một số ứng dụng phổ biến của Koa.js:

1.  **Xây dựng API (RESTful, GraphQL)**: Đây là một trong những ứng dụng phổ biến nhất của Koa. Nhờ cấu trúc middleware tinh gọn và việc sử dụng `async/await`, Koa rất phù hợp để tạo ra các API hiệu suất cao, dễ bảo trì và mở rộng.
2.  **Ứng dụng Web (Web Applications)**: Mặc dù Koa có lõi nhỏ, bạn có thể dễ dàng thêm các middleware cần thiết (như routing, templating engines, session management) để xây dựng các ứng dụng web hoàn chỉnh, từ các trang web đơn giản đến các ứng dụng phức tạp.
3.  **Microservices**: Kiến trúc nhỏ gọn và linh hoạt của Koa làm cho nó trở thành lựa chọn tốt để xây dựng các microservice độc lập, tập trung vào một chức năng cụ thể trong một hệ thống lớn hơn.
4.  **Ứng dụng thời gian thực (Real-time Applications)**: Koa có thể kết hợp với các thư viện như Socket.IO hoặc sử dụng WebSockets trực tiếp để xây dựng các ứng dụng yêu cầu tương tác thời gian thực, ví dụ như ứng dụng chat, bảng điều khiển dữ liệu trực tiếp (live dashboards).
5.  **Máy chủ Proxy (Proxy Servers)**: Bạn có thể sử dụng Koa để tạo các máy chủ proxy, chuyển tiếp yêu cầu đến các dịch vụ khác, thực hiện xác thực, hoặc sửa đổi header request/response.
6.  **Máy chủ phục vụ tệp tĩnh (Static File Servers)**: Bằng cách sử dụng middleware như `koa-static`, Koa có thể được cấu hình để phục vụ hiệu quả các tệp tĩnh như HTML, CSS, JavaScript và hình ảnh.

Nhìn chung, Koa.js phù hợp cho bất kỳ dự án Node.js nào mà nhà phát triển muốn có sự kiểm soát cao hơn đối với các thành phần của ứng dụng và ưa thích cách tiếp cận hiện đại với `async/await` để xử lý các tác vụ bất đồng bộ.


# Cascading

"Cascading" trong Koa.js đề cập đến cách các middleware được thực thi theo một luồng tuần tự và có thể chuyển quyền kiểm soát cho middleware tiếp theo, sau đó tiếp tục thực thi phần còn lại của code khi middleware tiếp theo hoàn thành. Điều này tạo ra một luồng đi xuống (downstream) và đi lên (upstream).

Hãy hình dung nó như một dòng thác (cascade):

1.  **Downstream (Đi xuống)**: Khi một request đến, nó sẽ đi qua từng middleware theo thứ tự bạn đã đăng ký chúng bằng `app.use()`.
2.  **`await next()`**: Bên trong một middleware, khi bạn gọi `await next()`, quyền kiểm soát sẽ được chuyển giao cho middleware *tiếp theo* trong chuỗi. Code trong middleware hiện tại sẽ tạm dừng tại điểm đó.
3.  **Upstream (Đi lên)**: Sau khi middleware cuối cùng thực thi (hoặc một middleware nào đó không gọi `next()`), luồng điều khiển sẽ quay ngược trở lại (đi lên) qua các middleware trước đó, thực thi phần code nằm *sau* lệnh `await next()`.

**Ví dụ minh họa:**

```javascript
const Koa = require('koa');
const app = new Koa();

// Middleware 1: Ghi log bắt đầu và kết thúc request
app.use(async (ctx, next) => {
  const start = Date.now();
  console.log('Middleware 1: Bắt đầu xử lý request');

  // Chuyển quyền cho middleware tiếp theo và chờ nó hoàn thành
  await next();

  // Code này chạy sau khi middleware 2 (và các middleware sau nó) đã hoàn thành
  const ms = Date.now() - start;
  console.log(`Middleware 1: Request xử lý xong trong ${ms}ms`);
  // Có thể sửa đổi response ở đây nếu cần
  ctx.set('X-Response-Time', `${ms}ms`);
});

// Middleware 2: Thiết lập nội dung response
app.use(async (ctx, next) => {
  console.log('Middleware 2: Đang xử lý...');
  // Giả sử có một tác vụ bất đồng bộ khác ở đây
  // await someAsyncTask();

  ctx.body = 'Hello Koa!';
  console.log('Middleware 2: Đã thiết lập body');

  // Không cần gọi next() nếu đây là middleware cuối cùng xử lý request chính
  // Nếu gọi next() ở đây mà không có middleware nào khác, nó sẽ không làm gì cả
  // await next();
});

app.listen(3000, () => {
  console.log('Server đang lắng nghe trên cổng 3000');
});
```

**Luồng thực thi khi có request:**

1.  Request đến.
2.  `Middleware 1` bắt đầu, log "Bắt đầu xử lý request".
3.  `Middleware 1` gọi `await next()`.
4.  `Middleware 2` bắt đầu, log "Đang xử lý...".
5.  `Middleware 2` thiết lập `ctx.body = 'Hello Koa!'`, log "Đã thiết lập body".
6.  `Middleware 2` kết thúc (vì không gọi `next()` hoặc là middleware cuối).
7.  Luồng điều khiển quay lại `Middleware 1`, thực thi code sau `await next()`.
8.  `Middleware 1` tính toán thời gian, log "Request xử lý xong...", và thiết lập header `X-Response-Time`.
9.  `Middleware 1` kết thúc.
10. Response được gửi về client.

Mô hình cascading này rất mạnh mẽ, cho phép bạn thực hiện các hành động trước và sau khi phần xử lý chính của request diễn ra, ví dụ như ghi log, đo thời gian xử lý, nén response, xử lý lỗi tập trung, v.v.

# Settings


*   `app.env`: Môi trường ứng dụng, mặc định là giá trị của biến môi trường **NODE\_ENV** hoặc là `"development"` nếu không có **NODE\_ENV**.
*   `app.keys`: Một mảng các khóa (keys) dùng để ký (sign) cookie.
*   `app.proxy`: Khi đặt là `true`, các trường header của proxy (ví dụ: `X-Forwarded-For`) sẽ được tin cậy.
*   `app.subdomainOffset`: Số lượng tên miền phụ (subdomains) tính từ cuối cùng của tên miền đầy đủ sẽ bị bỏ qua khi xác định `ctx.subdomains`. Mặc định là 2 (ví dụ: trong `a.b.c.com`, chỉ `a` được coi là subdomain).
*   `app.proxyIpHeader`: Tên header dùng để xác định địa chỉ IP gốc khi đi qua proxy. Mặc định là `'X-Forwarded-For'`.
*   `app.maxIpsCount`: Số lượng địa chỉ IP tối đa được đọc từ header `app.proxyIpHeader`. Mặc định là 0, có nghĩa là không giới hạn (đọc tất cả IP).

Bạn có thể thiết lập các cài đặt này khi khởi tạo đối tượng Koa:

```javascript
const Koa = require('koa');
const app = new Koa({ proxy: true }); // Ví dụ: bật chế độ tin cậy proxy
```

Hoặc thiết lập chúng một cách động sau khi đã tạo đối tượng `app`:

```javascript
const Koa = require('koa');
const app = new Koa();
app.proxy = true; // Ví dụ: bật chế độ tin cậy proxy
```

## app.listen(...)

Phương thức `app.listen(...)` trong Koa.js là cách để khởi động server HTTP của bạn và bắt đầu lắng nghe các kết nối đến trên một cổng (port) và địa chỉ mạng (hostname) cụ thể.

Về cơ bản, `app.listen(...)` là một phương thức tiện ích (syntactic sugar) bao bọc hàm `node:http.createServer()` và `server.listen()` của Node.js.

**Cách hoạt động chi tiết:**

1.  **Tạo Server HTTP:** Khi bạn gọi `app.listen(...)`, Koa sẽ ngầm định gọi phương thức `app.callback()`. Phương thức `app.callback()` này trả về một hàm xử lý request (request handler function) tương thích với module `http` của Node.js. Hàm này chứa logic để chạy một request đến qua chuỗi middleware Koa mà bạn đã định nghĩa bằng `app.use()`.
2.  **Khởi tạo Server:** Koa sử dụng hàm xử lý request từ `app.callback()` để tạo một instance của server HTTP chuẩn của Node.js: `const server = http.createServer(app.callback());`.
3.  **Lắng nghe kết nối:** Sau đó, Koa gọi phương thức `listen()` trên đối tượng `server` vừa tạo, truyền vào các đối số mà bạn đã cung cấp cho `app.listen(...)`. Ví dụ: `server.listen(port, hostname, backlog, callback);`.
    *   `port`: Số cổng mạng mà server sẽ lắng nghe (ví dụ: 3000, 8080). Đây là tham số bắt buộc phổ biến nhất.
    *   `hostname` (tùy chọn): Địa chỉ IP hoặc tên miền mà server sẽ gắn vào. Nếu bỏ qua, server thường sẽ chấp nhận kết nối trên bất kỳ địa chỉ IPv4 nào (`0.0.0.0`).
    *   `backlog` (tùy chọn): Số lượng kết nối đang chờ tối đa trong hàng đợi.
    *   `callback` (tùy chọn): Một hàm sẽ được gọi khi server đã bắt đầu lắng nghe thành công. Đây là nơi bạn thường đặt `console.log` để thông báo server đang chạy.

**Ví dụ từ ghi chú [[Index]]:**

```javascript
app.listen(3000, () => {
  console.log('Server đang lắng nghe trên cổng 3000');
});
```

Trong ví dụ này:

*   `3000` là `port`.
*   Hàm `() => { console.log(...) }` là `callback` được thực thi khi server sẵn sàng nhận request trên cổng 3000.

**Giá trị trả về:**

Phương thức `app.listen(...)` trả về chính đối tượng `http.Server` của Node.js đã được tạo ra. Điều này cho phép bạn thực hiện các thao tác nâng cao hơn nếu cần, ví dụ như đóng server một cách chương trình (`server.close()`).

**Tóm lại:** `app.listen(...)` là bước cuối cùng để khởi chạy ứng dụng Koa của bạn, làm cho nó có thể truy cập được qua mạng bằng cách lắng nghe các request HTTP đến trên một cổng được chỉ định. Nó tích hợp liền mạch ứng dụng Koa (với các middleware của nó) vào cơ chế server HTTP gốc của Node.js.

## subdomainOffset

`app.subdomainOffset` là một cài đặt trong Koa.js dùng để xác định phần nào của tên miền (hostname) trong request được coi là tên miền phụ (subdomain) thực sự của ứng dụng bạn. Giá trị này cho biết số lượng "phần" (tách bởi dấu `.`) tính từ *cuối* tên miền sẽ bị bỏ qua.

**Mặc định:**

*   Giá trị mặc định của `app.subdomainOffset` là `2`.
*   Điều này có nghĩa là Koa sẽ bỏ qua 2 phần cuối cùng của tên miền khi xác định `ctx.subdomains`. Thông thường, 2 phần này là tên miền cấp cao nhất (TLD - Top-Level Domain, ví dụ: `.com`, `.org`, `.net`) và tên miền cấp hai (SLD - Second-Level Domain, ví dụ: `example` trong `example.com`).

**Ví dụ với giá trị mặc định (`subdomainOffset = 2`):**

*   Nếu hostname là `a.b.example.com`:
    *   Các phần là: `['a', 'b', 'example', 'com']`
    *   Bỏ qua 2 phần cuối: `'example'` và `'com'`.
    *   Các phần còn lại được coi là subdomain: `'a'` và `'b'`.
    *   Kết quả `ctx.subdomains` sẽ là `['b', 'a']` (Lưu ý: Koa trả về mảng theo thứ tự ngược lại).
*   Nếu hostname là `my.app.co.uk`:
    *   Các phần là: `['my', 'app', 'co', 'uk']`
    *   Bỏ qua 2 phần cuối: `'co'` và `'uk'`.
    *   Kết quả `ctx.subdomains` sẽ là `['app', 'my']`.
*   Nếu hostname là `localhost` hoặc `example.com`:
    *   Không đủ phần để bỏ qua 2 phần cuối và còn lại subdomain.
    *   Kết quả `ctx.subdomains` sẽ là `[]` (mảng rỗng).

**Thay đổi `subdomainOffset`:**

Bạn có thể thay đổi giá trị này nếu cấu trúc tên miền của bạn khác biệt.

*   **Ví dụ: `app.subdomainOffset = 3`**
    *   Nếu hostname là `a.b.example.co.uk`:
        *   Các phần: `['a', 'b', 'example', 'co', 'uk']`
        *   Bỏ qua 3 phần cuối: `'example'`, `'co'`, `'uk'`.
        *   Kết quả `ctx.subdomains` sẽ là `['b', 'a']`.
*   **Ví dụ: `app.subdomainOffset = 1`**
    *   Nếu hostname là `a.b.example.com`:
        *   Các phần: `['a', 'b', 'example', 'com']`
        *   Bỏ qua 1 phần cuối: `'com'`.
        *   Kết quả `ctx.subdomains` sẽ là `['example', 'b', 'a']`.

**Mục đích:**

Cài đặt này giúp bạn chuẩn hóa cách ứng dụng nhận diện các subdomain, bất kể tên miền cơ sở (base domain) của bạn có bao nhiêu phần (ví dụ: `mydomain.com` so với `mydomain.co.uk`). Điều này rất hữu ích khi bạn cần thực hiện logic dựa trên subdomain, chẳng hạn như định tuyến (routing) hoặc hiển thị nội dung khác nhau cho các subdomain khác nhau.

> [!tip]- Tóm tắt
> app.subdomainOffset là cấu hình
> ctx.subdomains là kết quả trả về dựa trên cấu hình cài đặt

## proxy
Cài đặt `app.proxy` trong Koa.js là một tùy chọn boolean (đúng/sai) rất quan trọng khi ứng dụng của bạn được triển khai phía sau một reverse proxy (như Nginx, HAProxy, Cloudflare, hoặc các bộ cân bằng tải khác).

**Bối cảnh:**

Khi một client gửi request đến ứng dụng của bạn thông qua một proxy, thông tin kết nối mà server Koa (Node.js) nhận trực tiếp (như địa chỉ IP, giao thức HTTP/HTTPS, hostname) là của proxy chứ *không phải* của client gốc.

Để giải quyết vấn đề này, các proxy thường thêm các header đặc biệt vào request trước khi chuyển tiếp nó đến ứng dụng của bạn. Các header phổ biến nhất là:

*   `X-Forwarded-For`: Chứa địa chỉ IP gốc của client (và có thể cả IP của các proxy trung gian khác nếu có nhiều lớp proxy).
*   `X-Forwarded-Proto`: Chứa giao thức gốc mà client sử dụng để kết nối với proxy (thường là `http` hoặc `https`).
*   `X-Forwarded-Host`: Chứa tên miền (host) gốc mà client yêu cầu.

**Chức năng của `app.proxy = true`:**

Khi bạn đặt `app.proxy = true;`, bạn đang báo cho Koa rằng: "Tôi tin tưởng vào proxy đang đứng trước ứng dụng này. Hãy sử dụng các giá trị trong các header `X-Forwarded-*` (hoặc các header tương tự được cấu hình) để xác định thông tin gốc của request."

Cụ thể, khi `app.proxy` là `true`:

1.  **`ctx.request.ip`**: Sẽ được lấy từ header `X-Forwarded-For` (hoặc header được chỉ định bởi `app.proxyIpHeader`). Koa sẽ phân tích header này (có thể chứa nhiều IP) để cố gắng xác định IP gốc của client. Cài đặt `app.maxIpsCount` có thể ảnh hưởng đến việc này.
2.  **`ctx.request.protocol`**: Sẽ được xác định dựa trên header `X-Forwarded-Proto`. Nếu header này là `https`, `ctx.request.protocol` sẽ là `https`, ngay cả khi kết nối giữa proxy và server Koa của bạn là `http`. Điều này rất quan trọng để tạo URL chính xác hoặc đảm bảo các kết nối an toàn.
3.  **`ctx.request.host` / `ctx.request.hostname`**: Sẽ được lấy từ header `X-Forwarded-Host`. Điều này đảm bảo ứng dụng của bạn biết được tên miền mà người dùng thực sự truy cập, hữu ích cho việc định tuyến hoặc tạo liên kết.

**Khi `app.proxy = false` (Mặc định):**

Nếu `app.proxy` là `false` (hoặc không được đặt), Koa sẽ bỏ qua các header `X-Forwarded-*`.

*   `ctx.request.ip` sẽ là địa chỉ IP của kết nối trực tiếp đến server Koa (tức là IP của proxy).
*   `ctx.request.protocol` và `ctx.request.host` sẽ dựa trên kết nối giữa proxy và server Koa.

**Lưu ý quan trọng về bảo mật:**

Chỉ nên đặt `app.proxy = true` nếu bạn **chắc chắn** rằng ứng dụng của mình luôn được truy cập thông qua một proxy mà bạn kiểm soát và tin tưởng. Proxy này phải được cấu hình đúng cách để:

*   **Thiết lập chính xác** các header `X-Forwarded-*`.
*   **Loại bỏ hoặc ghi đè** bất kỳ header `X-Forwarded-*` nào có thể đã được gửi từ client (để ngăn chặn việc giả mạo thông tin).

Nếu bạn bật `app.proxy = true` mà không có proxy đáng tin cậy ở phía trước, kẻ tấn công có thể gửi các header `X-Forwarded-*` giả mạo trực tiếp đến ứng dụng của bạn, làm cho ứng dụng tin vào thông tin sai lệch (ví dụ: giả mạo IP để vượt qua kiểm soát truy cập dựa trên IP).

Tóm lại, `app.proxy = true` cho phép Koa "nhìn xuyên qua" proxy để lấy thông tin request gốc của client, dựa vào các header mà proxy thêm vào.

## keys

Set signed cookie keys.

These are passed to [KeyGrip](https://github.com/crypto-utils/keygrip), however you may also pass your own `KeyGrip` instance. For example the following are acceptable:

```
app.keys = ['OEK5zjaAMPc3L6iK7PyUjCOziUH3rsrMKB9u8H07La1SkfwtuBoDnHaaPCkG5Brg', 'MNKeIebviQnCPo38ufHcSfw3FFv8EtnAe1xE02xkN1wkCV1B2z126U44yk2BQVK7'];
app.keys = new KeyGrip(['OEK5zjaAMPc3L6iK7PyUjCOziUH3rsrMKB9u8H07La1SkfwtuBoDnHaaPCkG5Brg', 'MNKeIebviQnCPo38ufHcSfw3FFv8EtnAe1xE02xkN1wkCV1B2z126U44yk2BQVK7'], 'sha256');
```

For security reasons, please ensure that the key is long enough and random.

These keys may be rotated and are used when signing cookies with the `{ signed: true }` option:

```
ctx.cookies.set('name', 'tobi', { signed: true });
```

---

Cài đặt `app.keys` trong Koa.js là một thành phần thiết yếu cho việc bảo mật cookie, đặc biệt là khi bạn cần lưu trữ thông tin nhạy cảm hoặc thông tin mà bạn không muốn người dùng có thể tự ý thay đổi.

**Mục đích chính:**

`app.keys` được sử dụng để **ký (sign)** và **xác minh (verify)** các cookie. Việc ký cookie thêm một lớp bảo mật để đảm bảo rằng giá trị của cookie không bị sửa đổi bởi client (người dùng cuối).

**Cách hoạt động:**

1.  **Thiết lập:** Bạn cung cấp cho Koa một mảng các chuỗi bí mật (secret strings) thông qua `app.keys`.
    ```javascript
    const Koa = require('koa');
    const app = new Koa();

    // Rất quan trọng: Giữ các key này bí mật!
    // Nên sử dụng biến môi trường hoặc hệ thống quản lý bí mật trong production.
    app.keys = ['my-super-secret-key', 'another-secret-key'];
    ```

2.  **Ký Cookie (Signing):** Khi bạn muốn đặt một cookie đã ký, bạn sử dụng tùy chọn `{ signed: true }` với phương thức `ctx.cookies.set()`:
    ```javascript
    app.use(async ctx => {
      ctx.cookies.set('session_id', 'user123abc', { signed: true });
      ctx.body = 'Cookie đã được ký!';
    });
    ```
    *   Koa (thông qua thư viện `cookies` bên dưới) sẽ sử dụng **key đầu tiên** trong mảng `app.keys` (`'my-super-secret-key'` trong ví dụ trên) để tạo ra một chữ ký điện tử (thường là mã HMAC) dựa trên tên và giá trị của cookie.
    *   Chữ ký này được gắn kèm với giá trị cookie thực tế khi gửi về trình duyệt. Ví dụ, trình duyệt có thể lưu trữ một cookie tên là `session_id.sig` chứa chữ ký.

3.  **Xác minh Cookie (Verification):** Khi client gửi lại request kèm theo cookie, và bạn muốn đọc giá trị của cookie đã ký đó, bạn cũng sử dụng tùy chọn `{ signed: true }` với `ctx.cookies.get()`:
    ```javascript
    app.use(async ctx => {
      const sessionId = ctx.cookies.get('session_id', { signed: true });

      if (sessionId) {
        // Chữ ký hợp lệ, giá trị cookie đáng tin cậy
        ctx.body = `Session ID đã xác minh: ${sessionId}`;
      } else {
        // Chữ ký không hợp lệ (cookie bị sửa đổi) hoặc cookie không tồn tại
        // hoặc key dùng để ký không còn trong app.keys
        ctx.body = 'Không thể xác minh cookie session_id.';
      }
    });
    ```
    *   Koa sẽ lấy giá trị cookie và chữ ký đi kèm.
    *   Nó sẽ thử tính toán lại chữ ký cho giá trị cookie đó bằng cách sử dụng **tất cả các key** trong mảng `app.keys`.
    *   Nếu chữ ký được tính toán lại khớp với chữ ký đi kèm cookie (sử dụng *bất kỳ* key nào trong `app.keys`), thì việc xác minh thành công và `ctx.cookies.get()` trả về giá trị gốc của cookie.
    *   Nếu không có key nào trong `app.keys` tạo ra chữ ký khớp, điều đó có nghĩa là cookie đã bị thay đổi hoặc key dùng để ký ban đầu không còn hợp lệ. Trong trường hợp này, `ctx.cookies.get()` sẽ trả về `undefined`.

**Tại sao lại là một mảng (`array`)? Key Rotation:**

Việc sử dụng một mảng các key cho phép bạn thực hiện **xoay vòng key (key rotation)** một cách an toàn mà không làm mất hiệu lực ngay lập tức tất cả các cookie đã được ký trước đó. Đây là một thực hành bảo mật tốt.

*   **Bước 1:** Giả sử bạn đang dùng `app.keys = ['key_cũ'];`
*   **Bước 2:** Khi muốn đổi key, bạn thêm key mới vào *đầu* mảng: `app.keys = ['key_mới', 'key_cũ'];`. Triển khai thay đổi này.
    *   Các cookie mới sẽ được ký bằng `'key_mới'`.
    *   Các cookie cũ được ký bằng `'key_cũ'` vẫn có thể được xác minh thành công vì `'key_cũ'` vẫn còn trong mảng.
*   **Bước 3:** Sau một khoảng thời gian đủ dài để hầu hết các cookie cũ hết hạn hoặc người dùng nhận được cookie mới, bạn có thể loại bỏ key cũ: `app.keys = ['key_mới'];`. Triển khai thay đổi này.

**Tóm lại:**

`app.keys` là một mảng các chuỗi bí mật dùng để ký và xác minh cookie, đảm bảo tính toàn vẹn (integrity) của dữ liệu cookie và cho phép thực hiện key rotation an toàn. Nó là nền tảng cho các tính năng như session an toàn trong nhiều middleware của Koa.

### Quá trình sign và verify

Quá trình ký và xác minh cookie trong Koa (sử dụng `app.keys`) hoạt động dựa trên nguyên tắc của mã xác thực thông điệp dựa trên hàm băm (HMAC - Hash-based Message Authentication Code). Mục tiêu là đảm bảo rằng giá trị của cookie không bị thay đổi bởi client sau khi nó được server gửi đi.

**1. Quá trình Ký (Signing) - Khi Server Gửi Cookie:**

*   **Bước 1: Yêu cầu ký:** Bạn gọi `ctx.cookies.set('tên_cookie', 'giá_trị', { signed: true });`.
*   **Bước 2: Lấy key:** Koa lấy **key đầu tiên** (phần tử thứ 0) từ mảng `app.keys` mà bạn đã cung cấp. Ví dụ: `app.keys = ['key_bí_mật_1', 'key_bí_mật_2']`, thì `'key_bí_mật_1'` sẽ được sử dụng.
*   **Bước 3: Chuẩn bị dữ liệu:** Koa chuẩn bị dữ liệu cần ký. Thông thường, đây là sự kết hợp của tên cookie và giá trị của nó (ví dụ: chuỗi `"tên_cookie=giá_trị"`).
*   **Bước 4: Tạo chữ ký HMAC:** Koa sử dụng thuật toán HMAC (ví dụ: HMAC-SHA256) với:
    *   **Dữ liệu:** Dữ liệu đã chuẩn bị ở Bước 3.
    *   **Key bí mật:** Key lấy được ở Bước 2.
    Thuật toán HMAC tạo ra một chuỗi hash duy nhất (chữ ký) dựa trên dữ liệu và key bí mật. Nếu dữ liệu hoặc key thay đổi dù chỉ một chút, chữ ký tạo ra sẽ hoàn toàn khác.
*   **Bước 5: Gửi cookie:** Koa gửi hai cookie về trình duyệt của client thông qua header `Set-Cookie`:
    *   Cookie chứa giá trị gốc: `tên_cookie=giá_trị`
    *   Cookie chứa chữ ký: `tên_cookie.sig=chữ_ký_được_tạo_ra` (Tên cookie chữ ký thường là tên gốc cộng thêm `.sig`).

**2. Quá trình Xác minh (Verification) - Khi Server Nhận Cookie:**

*   **Bước 1: Yêu cầu xác minh:** Bạn gọi `ctx.cookies.get('tên_cookie', { signed: true });`.
*   **Bước 2: Lấy cookie và chữ ký:** Koa tìm trong các cookie gửi đến từ client để lấy:
    *   Giá trị của cookie `tên_cookie` (ví dụ: `'giá_trị'`).
    *   Giá trị của cookie chữ ký `tên_cookie.sig` (ví dụ: `'chữ_ký_được_gửi_đến'`).
    Nếu một trong hai cookie này không tồn tại, quá trình xác minh thất bại ngay lập tức và hàm trả về `undefined`.
*   **Bước 3: Lặp qua các key:** Koa lấy **toàn bộ mảng `app.keys`**.
*   **Bước 4: Tính toán lại và so sánh chữ ký:** Koa thực hiện vòng lặp qua từng `key` trong `app.keys`:
    *   Với mỗi `key`, Koa chuẩn bị lại dữ liệu cần ký giống như Bước 3 của quá trình ký (dùng `tên_cookie` và `giá_trị` lấy được từ client).
    *   Koa tính toán lại chữ ký HMAC sử dụng dữ liệu này và `key` hiện tại trong vòng lặp.
    *   So sánh chữ ký vừa tính toán lại với `'chữ_ký_được_gửi_đến'` (lấy từ cookie `.sig`).
    *   **Nếu khớp:** Điều này có nghĩa là cookie hợp lệ và được ký bằng `key` này. Quá trình xác minh thành công. Vòng lặp dừng lại và `ctx.cookies.get()` trả về `'giá_trị'` gốc của cookie.
    *   **Nếu không khớp:** Tiếp tục thử với `key` tiếp theo trong `app.keys`.
*   **Bước 5: Kết quả cuối cùng:** Nếu sau khi thử tất cả các `key` trong `app.keys` mà không có chữ ký nào khớp với `'chữ_ký_được_gửi_đến'`, điều đó có nghĩa là:
    *   Giá trị cookie (`'giá_trị'`) đã bị client sửa đổi.
    *   Hoặc chữ ký (`'chữ_ký_được_gửi_đến'`) đã bị sửa đổi.
    *   Hoặc cookie được ký bằng một key không còn tồn tại trong `app.keys` hiện tại.
    Trong trường hợp này, quá trình xác minh thất bại và `ctx.cookies.get()` trả về `undefined`.

**Tóm lại:** Quá trình này đảm bảo rằng server có thể tin tưởng giá trị cookie nhận được từ client nếu chữ ký đi kèm hợp lệ, vì chỉ server (với `app.keys` bí mật) mới có thể tạo ra chữ ký đúng. Nó không ngăn client đọc giá trị cookie (vì nó không được mã hóa), nhưng ngăn client thay đổi giá trị đó mà server không phát hiện ra.


## app.context

`app.context` is the prototype from which `ctx` is created. You may add additional properties to `ctx` by editing `app.context`. This is useful for adding properties or methods to `ctx` to be used across your entire app, which may be more performant (no middleware) and/or easier (fewer `require()`s) at the expense of relying more on `ctx`, which could be considered an anti-pattern.

For example, to add a reference to your database from `ctx`:

```
app.context.db = db();

app.use(async ctx => {
  console.log(ctx.db);
});
```

Note:

- Many properties on `ctx` are defined using getters, setters, and `Object.defineProperty()`. You can only edit these properties (not recommended) by using `Object.defineProperty()` on `app.context`. See [https://github.com/koajs/koa/issues/652](https://github.com/koajs/koa/issues/652).
- Mounted apps currently use their parent's `ctx` and settings. Thus, mounted apps are really just groups of middleware

- ---
`app.context` trong Koa.js là một đối tượng đặc biệt đóng vai trò như **prototype** (nguyên mẫu) cho tất cả các đối tượng Context (`ctx`) được tạo ra cho mỗi request đến.

**Mục đích chính:**

Mục đích chính của `app.context` là cho phép bạn **mở rộng (extend)** đối tượng `ctx` bằng cách thêm các thuộc tính hoặc phương thức tùy chỉnh của riêng bạn. Bất cứ thứ gì bạn thêm vào `app.context` sẽ tự động có sẵn trên mọi đối tượng `ctx` trong toàn bộ ứng dụng của bạn.

**Lợi ích:**

*   **Chia sẻ tiện ích/dữ liệu:** Đây là cách thuận tiện để chia sẻ các tài nguyên hoặc tiện ích chung (như kết nối cơ sở dữ liệu, các hàm tiện ích, thông tin cấu hình) cho tất cả các middleware mà không cần phải `require` chúng ở mọi nơi hoặc truyền chúng qua từng middleware.
*   **Hiệu suất (có thể):** Trong một số trường hợp, việc truy cập thuộc tính trực tiếp từ `ctx` (đã được thêm thông qua `app.context`) có thể nhanh hơn một chút so với việc chạy một middleware riêng chỉ để thêm thuộc tính đó vào `ctx`.
*   **Tổ chức code:** Giúp tập trung việc khởi tạo và cung cấp các phụ thuộc chung ở một nơi.

**Cách sử dụng (Ví dụ từ ghi chú [[Index]]):**

Để thêm một tham chiếu đến kết nối cơ sở dữ liệu (`db`) vào mọi `ctx`:

```javascript
// Giả sử bạn đã khởi tạo kết nối db ở đâu đó
const db = require('./db'); // Ví dụ

const Koa = require('koa');
const app = new Koa();

// Thêm thuộc tính 'db' vào prototype của context
app.context.db = db();

// Bây giờ, mọi middleware đều có thể truy cập ctx.db
app.use(async ctx => {
  // Sử dụng kết nối db thông qua ctx
  const data = await ctx.db.query('SELECT * FROM users');
  console.log(ctx.db); // In ra đối tượng db
  ctx.body = data;
});

app.listen(3000);
```

**Lưu ý quan trọng từ ghi chú [[Index]]:**

*   **Cân nhắc về Anti-pattern:** Việc lạm dụng `app.context` và đưa quá nhiều thứ vào `ctx` có thể bị coi là một anti-pattern. Nó làm cho middleware phụ thuộc nhiều hơn vào trạng thái "toàn cục" được thiết lập trên `app.context`, giảm tính độc lập và khả năng tái sử dụng của middleware.
*   **Getter/Setter:** Nhiều thuộc tính sẵn có trên `ctx` (như `ctx.request`, `ctx.response`, `ctx.body`, `ctx.status`, v.v.) được định nghĩa bằng getters và setters hoặc `Object.defineProperty()`. Việc sửa đổi trực tiếp các thuộc tính này trên `app.context` không đơn giản và thường không được khuyến khích. Nếu thực sự cần, bạn phải sử dụng `Object.defineProperty()` trên `app.context`.
*   **Mounted Apps:** Các ứng dụng con được "mount" vào ứng dụng cha sẽ sử dụng `ctx` và các cài đặt của ứng dụng cha. Điều này có nghĩa là chúng cũng kế thừa các thuộc tính từ `app.context` của ứng dụng cha.

Tóm lại, `app.context` là một cơ chế mạnh mẽ để tùy chỉnh và chia sẻ chức năng/dữ liệu trên toàn bộ ứng dụng Koa thông qua đối tượng `ctx`, nhưng cần được sử dụng một cách cân nhắc để tránh làm code trở nên khó quản lý.

## Error Handling

By default outputs all errors to stderr unless `app.silent` is `true`. The default error handler also won't output errors when `err.status` is `404` or `err.expose` is `true`. To perform custom error-handling logic such as centralized logging you can add an "error" event listener:

```
app.on('error', err => {
  log.error('server error', err)
});
```

If an error is in the req/res cycle and it is _not_ possible to respond to the client, the `Context` instance is also passed:

```
app.on('error', (err, ctx) => {
  log.error('server error', err, ctx)
});
```

When an error occurs _and_ it is still possible to respond to the client, aka no data has been written to the socket, Koa will respond appropriately with a 500 "Internal Server Error". In either case an app-level "error" is emitted for logging purposes.

