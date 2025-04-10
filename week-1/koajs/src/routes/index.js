import Router from 'koa-router';
import apiRouter from './api.js';
import productsWebRouter from './products-web.js';
import booksWebRouter from './books-web.js';

// Create a main router
const mainRouter = new Router();

// Mount API router
mainRouter.use(apiRouter.routes(), apiRouter.allowedMethods());

// Create and mount web routers
const webRouter = new Router();

// Home route
webRouter.get('/', async (ctx) => {
    ctx.redirect('/products');
});

// Mount product web routes
webRouter.use('/products', productsWebRouter.routes(), productsWebRouter.allowedMethods());

// Mount book web routes (if you have them)
webRouter.use('/books', booksWebRouter.routes(), booksWebRouter.allowedMethods());

// Mount web router to main router
mainRouter.use(webRouter.routes(), webRouter.allowedMethods());

export default mainRouter;