import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src', 'database', 'products.json');

/**
 * Reads the product database file.
 * @returns {Promise<Array>} A promise that resolves to the array of products.
 * @throws Will throw an error if reading or parsing fails.
 */
async function readDatabase() {
    try {
        const rawData = await fs.readFile(DB_PATH, 'utf-8');
        const jsonData = JSON.parse(rawData);
        return jsonData.data || []; // Ensure it returns an array even if file is empty/malformed
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

/**
 * Writes data to the product database file.
 * @param {Array} products - The array of products to write.
 * @returns {Promise<void>}
 * @throws Will throw an error if writing fails.
 */
async function writeDatabase(products) {
    try {
        const dataToWrite = JSON.stringify({ data: products }, null, 2);
        await fs.writeFile(DB_PATH, dataToWrite);
    } catch (error) {
        console.error('Error writing to database:', error);
        throw new Error('Could not save product database.');
    }
}

/**
 * Retrieves all products, optionally applying sorting and limiting.
 * @param {object} options - Filtering options.
 * @param {number} [options.limit] - Max number of products to return.
 * @param {'asc'|'desc'} [options.sort] - Sort order by createdAt.
 * @returns {Promise<Array>} List of products.
 */
export async function getAll({ limit, sort } = {}) {
    let products = await readDatabase();

    if (sort) {
        products.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return sort === 'desc' ? dateB - dateA : dateA - dateB;
        });
    }

    if (limit) {
        products = products.slice(0, parseInt(limit, 10));
    }

    return products;
}

/**
 * Retrieves a single product by its ID, optionally selecting specific fields.
 * @param {number} id - The ID of the product.
 * @param {string} [fields] - Comma-separated string of fields to return.
 * @returns {Promise<object|null>} The product object or null if not found.
 */
export async function getById(id, fields) {
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

/**
 * Creates a new product.
 * @param {object} productData - Data for the new product.
 * @returns {Promise<object>} The newly created product.
 */
export async function create(productData) {
    const products = await readDatabase();
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    const newProduct = {
        ...productData,
        id: newId,
        createdAt: new Date().toISOString(), // Add createdAt timestamp
    };
    products.push(newProduct);
    await writeDatabase(products);
    return newProduct;
}

/**
 * Updates an existing product.
 * @param {number} id - The ID of the product to update.
 * @param {object} updateData - The data to merge into the existing product.
 * @returns {Promise<object|null>} The updated product or null if not found.
 */
export async function update(id, updateData) {
    const products = await readDatabase();
    const productIndex = products.findIndex(p => p.id === parseInt(id, 10));

    if (productIndex === -1) {
        return null; // Not found
    }

    // Merge data - excluding id and createdAt from updateData (không cho phép thay đổi id và createAt)
    const { id: ignoredId, createdAt: ignoredCreatedAt, ...validUpdateData } = updateData;
    products[productIndex] = {
        ...products[productIndex],
        ...validUpdateData,
        // updatedAt: new Date().toISOString() // bỏ vì không có trường updateAt
    };

    await writeDatabase(products);
    return products[productIndex];
}

/**
 * Deletes a product by its ID.
 * @param {number} id - The ID of the product to delete.
 * @returns {Promise<boolean>} True if deleted, false if not found.
 */
export async function remove(id) {
    const products = await readDatabase();
    const initialLength = products.length;
    const updatedProducts = products.filter(p => p.id !== parseInt(id, 10));

    if (updatedProducts.length === initialLength) {
        return false; // Not found
    }

    await writeDatabase(updatedProducts);
    return true;
}