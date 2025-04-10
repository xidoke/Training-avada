import Router from 'koa-router';

// Import handlers (these would call your API handlers internally)
import {
    getAllProducts,
    getProductById
} from '../handlers/products.js';

const productsWebRouter = new Router();

// List all products
productsWebRouter.get('/', async (ctx) => {
    try {
        // Call the API handler but capture the response
        ctx.params = {}; // Ensure params exists
        await getAllProducts(ctx);
        const products = ctx.body.data; // Get the products from the API response

        // Render the view with the products
        await ctx.render('products/index', {
            title: 'Products',
            products
        });
    } catch (err) {
        ctx.app.emit('error', err, ctx);
    }
});

// Form to create a new product
productsWebRouter.get('/new', async (ctx) => {
    await ctx.render('products/new', {
        title: 'Add New Product'
    });
});

// View a single product
productsWebRouter.get('/:id', async (ctx) => {
    try {
        // Call the API handler but capture the response
        await getProductById(ctx);
        const product = ctx.body.data; // Get the product from the API response

        // Render the view with the product
        await ctx.render('products/show', {
            title: product.name,
            product
        });
    } catch (err) {
        ctx.app.emit('error', err, ctx);
    }
});

// Form to edit a product
productsWebRouter.get('/:id/edit', async (ctx) => {
    try {
        // Call the API handler but capture the response
        await getProductById(ctx);
        const product = ctx.body.data; // Get the product from the API response

        // Render the view with the product
        await ctx.render('products/edit', {
            title: `Edit ${product.name}`,
            product
        });
    } catch (err) {
        ctx.app.emit('error', err, ctx);
    }
});

export default productsWebRouter;