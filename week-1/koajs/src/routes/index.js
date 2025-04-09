import Router from 'koa-router';

import booksRouter from './books.js';
import productsRouter from './products.js';

const apiRouter = new Router({
    prefix: '/api' // Prefix chung cho toàn bộ API
});

apiRouter.use('/books', booksRouter.routes(), booksRouter.allowedMethods());

apiRouter.use('/products', productsRouter.routes(), productsRouter.allowedMethods());

export default apiRouter;