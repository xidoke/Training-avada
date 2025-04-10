import Router from 'koa-router';

// Import handlers (these would call your API handlers internally)
import {
    getBooks,
    getBook
} from '../handlers/books.js';

const booksWebRouter = new Router();

// List all books
booksWebRouter.get('/', async (ctx) => {
    try {
        // Call the API handler but capture the response
        ctx.params = {}; // Ensure params exists
        await getBooks(ctx);
        const books = ctx.body; // Get the books from the API response

        // Render the view with the books
        await ctx.render('books/index', {
            title: 'Books',
            books
        });
    } catch (err) {
        ctx.app.emit('error', err, ctx);
    }
});

// Form to create a new book
booksWebRouter.get('/new', async (ctx) => {
    await ctx.render('books/new', {
        title: 'Add New Book'
    });
});

// View a single book
booksWebRouter.get('/:id', async (ctx) => {
    try {
        // Call the API handler but capture the response
        await getBook(ctx);
        const book = ctx.body; // Get the book from the API response

        // Render the view with the book
        await ctx.render('books/show', {
            title: book.title,
            book
        });
    } catch (err) {
        ctx.app.emit('error', err, ctx);
    }
});

// Form to edit a book
booksWebRouter.get('/:id/edit', async (ctx) => {
    try {
        // Call the API handler but capture the response
        await getBook(ctx);
        const book = ctx.body; // Get the book from the API response

        // Render the view with the book
        await ctx.render('books/edit', {
            title: `Edit ${book.title}`,
            book
        });
    } catch (err) {
        ctx.app.emit('error', err, ctx);
    }
});

export default booksWebRouter;