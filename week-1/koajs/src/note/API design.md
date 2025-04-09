

|Method|Route|Description|Parameter|
|---|---|---|---|
|GET|`/api/products`|Get all list of products|limit, orderBy|
|POST|`/api/products`|Create a new product to the list|None|
|PUT|`/api/product/:id`|Update a product with the input data|None|
|DELETE|`/api/product/:id`|Delete a product of a given id|None|
|GET|`/api/product/:id`|Get one product by ID|fields|


# Sử dụng require/import hay fs để read data?

**Kết Luận Ngắn Gọn Về Lựa Chọn Đọc Database File (JSON):**

1. **import ... with { type: "json" } hoặc require('./file.json'):**
    
    - **Cơ chế:** Đọc và phân tích file JSON **một lần duy nhất** khi ứng dụng khởi động hoặc khi được gọi lần đầu, sau đó lưu vào bộ nhớ cache.
        
    - **Ưu điểm:** Đọc rất nhanh sau lần đầu (lấy từ RAM). Code gọn.
        
    - **Nhược điểm:** Dữ liệu **tĩnh**. Không thấy được sự thay đổi trong file sau khi đã load.
        
    - **Kết luận:** **Không phù hợp** để dùng làm "database" nếu dữ liệu có thể thay đổi trong quá trình chạy ứng dụng. Chỉ nên dùng cho file cấu hình tĩnh.
        
2. **fs.readFileSync (Đồng bộ):**
    
    - **Cơ chế:** Đọc file **mỗi lần** được gọi, **chặn (block)** luồng chính cho đến khi đọc xong.
        
    - **Ưu điểm:** Đọc được dữ liệu mới nhất từ file. Code trông đơn giản hơn async.
        
    - **Nhược điểm:** **Gây tắc nghẽn (blocking)** nghiêm trọng, làm giảm hiệu năng và khả năng xử lý đồng thời của server Node.js.
        
    - **Kết luận:** **Tránh tuyệt đối** sử dụng trong môi trường server (trong request/response cycle).
        
3. **fs.readFile hoặc fs.promises.readFile (Bất đồng bộ):**
    
    - **Cơ chế:** Đọc file **mỗi lần** được gọi nhưng thực hiện **bất đồng bộ**, không chặn luồng chính.
        
    - **Ưu điểm:** Đọc được dữ liệu mới nhất. **Không blocking**, đảm bảo hiệu năng server. Chuẩn mực cho I/O trong Node.js.
        
    - **Nhược điểm:** Code dài hơn (do async/await hoặc callback). Tốc độ đọc chậm hơn đọc từ RAM.
        
    - **Kết luận:** **Là lựa chọn tốt nhất và được khuyến nghị** khi dùng file làm nơi lưu trữ dữ liệu đơn giản cho server, đảm bảo lấy được dữ liệu cập nhật mà không ảnh hưởng hiệu năng.
        

**Tóm lại:** Dùng fs.promises.readFile (bất đồng bộ) là cách đúng đắn cho việc đọc file "database" trong ứng dụng server Node.js. import/require chỉ dùng cho cấu hình tĩnh. fs.readFileSync nên tránh.

``` js
/**  
 * Reads the product database file. * @returns {Promise<Array>} A promise that resolves to the array of products.  
 * @throws Will throw an error if reading or parsing fails.  
 */async function readDatabase() {  
    try {  
        const rawData = await fs.readFile(DB_PATH, 'utf-8');  
        const jsonData = JSON.parse(rawData);  
        return jsonData || []; // Ensure it returns an array even if file is empty/malformed  
    } catch (error) {  
        // Handle case where file doesn't exist or is invalid JSON  
        if (error.code === 'ENOENT') {  
            console.warn('Database file not found, returning empty array.');  
            return [];  
        }  
        console.error('Error reading or parsing database:', error);  
        throw new Error('Could not read product database.'); // Propagate a generic error  
    }  
}
```

# writeDatabase

```js
/**  
 * Writes data to the product database file. * @param {Array} products - The array of products to write.  
 * @returns {Promise<void>}  
 * @throws Will throw an error if writing fails.  
 */async function writeDatabase(products) {  
    try {  
        const dataToWrite = JSON.stringify({ data: products }, null, 2);  
        await fs.writeFile(DB_PATH, dataToWrite);  
    } catch (error) {  
        console.error('Error writing to database:', error);  
        throw new Error('Could not save product database.');  
    }  
}
```


# getAll

chiến lược: đọc từ readDatabase
sau đó bổ sung thêm tính năng query: sort, limit (Lưu ý thứ tự limit thực hiện sau) như sau:
1. Limit
	1. Dùng Array.slice(0, parseInt(limit, 10))
2. Sort
	1. Dùng Array.sort(). Lưu ý rằng sort sẽ thay đổi trực tiếp mảng thay vì tạo mảng mới. Ngoài ra theo mặc định, hàm sắp xếp dựa trên thứ tự Unicode, nên cần viết hàm CompareFn phù hợp để tránh lỗi.
# getById

```js
  
/**  
 * Retrieves a single product by its ID, optionally selecting specific fields. * @param {number} id - The ID of the product.  
 * @param {string} [fields] - Comma-separated string of fields to return.  
 * @returns {Promise<object|null>} The product object or null if not found.  
 */export async function getById(id, fields) {  
    const products = await readDatabase();  
    const product = products.find(p => p.id === parseInt(id, 10));  
  
    if (!product) {  
        return null;  
    }  
  
    if (fields) {  
        const requestedFields = fields.split(',');  
        const selectedProduct = {};  
        requestedFields.forEach(field => {  
            if (product.hasOwnProperty(field.trim())) {  
                selectedProduct[field.trim()] = product[field.trim()];  
            }  
        });  
        // Always include id if fields are requested but id isn't explicitly mentioned  
        if (!selectedProduct.hasOwnProperty('id')) {  
            selectedProduct.id = product.id;  
        }  
        return selectedProduct;  
    }  
  
    return product;  
  
}
```

# create
1. readDatabase
2. Tạo newId bằng cách: 
	1. products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
3. Tạo newProduct
```js
const newProduct = {  
    ...productData,  
    id: newId,  
    createdAt: new Date().toISOString(), // Add createdAt timestamp  
};
```
sau đó thêm newProduct vào products bằng products.push()
và lưu vào file bằng writeDatabase(products)

# update

# remove

1. dùng filter lọc các product khác id bị xóa
2. nếu product.length === filteredProduct.length thì return (tức là không tìm thấy)
3. writeDatabase(filteredProduct)