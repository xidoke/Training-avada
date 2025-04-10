import * as fs from "node:fs";
import {faker} from "@faker-js/faker"
import path from "path";

const NUM_PRODUCTS = 1000; // Số lượng sản phẩm cần tạo

const FILE_PATH = path.join(process.cwd(), "src", "database", "products.json");

const products = [];

console.log(`Generating ${NUM_PRODUCTS} product records...`);

for (let i = 0; i < NUM_PRODUCTS; i++) {
    const product = {
        id: i + 1,
        name: faker.commerce.productName(),
        price: parseFloat(faker.commerce.price({ min: 10, max: 1000, dec: 2 })),
        description: faker.commerce.productDescription(),
        product: faker.commerce.department(),
        color: faker.color.human(),
        createdAt: faker.date.past().toISOString(),
        image: faker.image.urlPicsumPhotos({ width: 640, height: 480 }) // ví dụ dùng 'technics'
    };
    products.push(product);
}

console.log(`Generated ${products.length} products.`);

const jsonData = JSON.stringify({
    data: products,
}, null, 2);

try {
    fs.writeFileSync(FILE_PATH, jsonData, 'utf8');
    console.log(`Successfully wrote ${products.length} records to ${FILE_PATH}`);
} catch (err) {
    console.error(`Error writing file ${FILE_PATH}:`, err);
}