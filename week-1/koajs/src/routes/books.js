import Router from 'koa-router';

import { getBook, getBooks, save } from '../handlers/books.js';
import { bookValidation } from '../middleware/bookValidation.js';

const booksRouter = new Router();

booksRouter.get('/', getBooks);
booksRouter.get('/:id', getBook);

booksRouter.post('/', bookValidation, save);
booksRouter.post('/', save);

export default booksRouter;