// src/middleware/productValidation.js
import * as yup from 'yup';

// --- Schema for POST (Create) - Requires certain fields ---
const createProductSchema = yup.object().shape({
    name: yup.string().trim().required('Product name is required').min(3, 'Product name must be at least 3 characters'),
    price: yup.number().required('Price is required').positive('Price must be a positive number'),
    description: yup.string().trim().optional(),
    product: yup.string().trim().optional(), // Product type field name kept as 'product'
    color: yup.string().trim().optional(),
    image: yup.string().trim().url('Image must be a valid URL').optional(),
    // id and createdAt are handled by the backend
});

// --- Schema for PUT/PATCH (Partial Update) - No fields are required ---
// Validates fields ONLY IF they are present in the request body
const updateProductSchema = yup.object().shape({
    name: yup.string().trim().min(3, 'Product name must be at least 3 characters').optional(), // Not required, but if present, min 3 chars
    price: yup.number().positive('Price must be a positive number').optional(), // Not required, but if present, must be positive
    description: yup.string().trim().optional(),
    product: yup.string().trim().optional(),
    color: yup.string().trim().optional(),
    image: yup.string().trim().url('Image must be a valid URL').optional(),
    // id, createdAt should ideally not be updatable via request body
});


/**
 * Middleware to validate the FULL product structure for creation (POST).
 * @param {object} ctx - Koa context.
 * @param {function} next - Koa next function.
 */
export async function validateProduct(ctx, next) {
    try {
        const productData = ctx.request.body;
        // Use createProductSchema for POST
        await createProductSchema.validate(productData, { abortEarly: false, stripUnknown: true });
        await next();
    } catch (error) {
        ctx.status = 400;
        ctx.body = {
            success: false,
            message: 'Validation Failed for Creation',
            errors: error.inner?.reduce((acc, err) => {
                acc[err.path] = err.message;
                return acc;
            }, {}) || error.errors
        };
    }
}

/**
 * Middleware to validate PARTIAL product structure for updates (PUT/PATCH).
 * Validates fields only if they are present in the request body.
 * @param {object} ctx - Koa context.
 * @param {function} next - Koa next function.
 */
export async function validatePartialProduct(ctx, next) {
    try {
        const productData = ctx.request.body;

        // Handle empty body gracefully - an empty update might be technically valid (no-op)
        if (!productData || typeof productData !== 'object' || Object.keys(productData).length === 0) {
            // Depending on requirements, you might want to return an error for empty body,
            // but for PATCH semantics, allowing it and letting the handler decide is often better.
            // console.log('Update request body is empty or not an object. Proceeding...');
            await next();
            return;
        }

        // Use updateProductSchema for PUT/PATCH
        await updateProductSchema.validate(productData, { abortEarly: false, stripUnknown: true });
        await next();
    } catch (error) {
        ctx.status = 400;
        ctx.body = {
            success: false,
            message: 'Validation Failed for Update',
            errors: error.inner?.reduce((acc, err) => {
                acc[err.path] = err.message;
                return acc;
            }, {}) || error.errors
        };
    }
}