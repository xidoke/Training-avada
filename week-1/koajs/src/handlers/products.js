// src/handlers/products.js
import * as productRepository from '../repositories/productRepository.js';

/**
 * Handler to get all products.
 * @param {object} ctx - Koa context.
 */
export async function getAllProducts(ctx) {
    try {
        const { limit, sort } = ctx.query; // Get query params
        const products = await productRepository.getAll({ limit, sort });
        ctx.body = { success: true, data: products };
    } catch (error) {
        console.error('Error in getAllProducts handler:', error);
        ctx.status = 500;
        ctx.body = { success: false, message: 'An internal server error occurred.' };
    }
}

/**
 * Handler to get a single product by ID.
 * @param {object} ctx - Koa context.
 */
export async function getProductById(ctx) {
    try {
        const { id } = ctx.params;
        const { fields } = ctx.query;
        const product = await productRepository.getById(id, fields);
        if (product) {
            ctx.body = { success: true, data: product };
        } else {
            ctx.status = 404;
            ctx.body = { success: false, message: `Product with ID ${id} not found.` };
        }
    } catch (error) {
        console.error(`Error in getProductById handler (ID: ${ctx.params.id}):`, error);
        ctx.status = 500;
        ctx.body = { success: false, message: 'An internal server error occurred.' };
    }
}

/**
 * Handler to create a new product.
 * Requires validateProduct middleware to run first.
 * @param {object} ctx - Koa context.
 */
export async function createProduct(ctx) {
    try {
        // Assumes validateProduct middleware has run and body is valid
        const productData = ctx.request.body;
        const newProduct = await productRepository.create(productData);
        ctx.status = 201; // Created
        ctx.body = { success: true, data: newProduct };
    } catch (error) {
        console.error('Error in createProduct handler:', error);
        ctx.status = 500;
        ctx.body = { success: false, message: 'An internal server error occurred while creating the product.' };
    }
}

/**
 * Handler to update an existing product.
 * Requires validateProduct middleware to run first.
 * @param {object} ctx - Koa context.
 */
export async function updateProduct(ctx) {
    try {
        const { id } = ctx.params;
        const updateData = ctx.request.body;
        const updatedProduct = await productRepository.update(id, updateData);
        if (updatedProduct) {
            ctx.body = { success: true, data: updatedProduct };
        } else {
            ctx.status = 404;
            ctx.body = { success: false, message: `Product with ID ${id} not found.` };
        }
    } catch (error) {
        console.error(`Error in updateProduct handler (ID: ${ctx.params.id}):`, error);
        ctx.status = 500;
        ctx.body = { success: false, message: 'An internal server error occurred while updating the product.' };
    }
}

/**
 * Handler to delete a product by ID.
 * @param {object} ctx - Koa context.
 */
export async function deleteProduct(ctx) {
    try {
        const { id } = ctx.params;
        const deleted = await productRepository.remove(id);
        if (deleted) {
            ctx.status = 204; // No Content - Success indicator for DELETE
            // No body needed for 204
        } else {
            ctx.status = 404;
            ctx.body = { success: false, message: `Product with ID ${id} not found.` };
        }
    } catch (error) {
        console.error(`Error in deleteProduct handler (ID: ${ctx.params.id}):`, error);
        ctx.status = 500;
        ctx.body = { success: false, message: 'An internal server error occurred while deleting the product.' };
    }
}