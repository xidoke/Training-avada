import {getOne as getOneBook, getAll as getAllBooks, add as addBook} from "../repositories/bookRepository.js"

/**
 *
 * @param ctx
 * @returns {Promise<void>}
 */
export async function getBooks(ctx) {
    try {
        const books = getAllBooks();

        ctx.body = {
            data: books
        };
    } catch (e) {
        ctx.status = 404;
        ctx.body = {
            success: false,
            data: [],
            error: e.message
        };
    }
}

/**
 *
 * @param ctx
 * @returns {Promise<{database: {author: string, name: string, id: number}}|{success: boolean, error: *}|{message: string, status: string}>}
 */
export async function getBook(ctx) {
    try {
        const {id} = ctx.params;
        const getCurrentBook = getOneBook(id);
        if (getCurrentBook) {
            return ctx.body = {
                data: getCurrentBook
            }
        }

        throw new Error('Book Not Found with that id!')
    } catch (e) {
        ctx.status = 404;
        return ctx.body = {
            success: false,
            error: e.message
        }
    }
}

/**
 *
 * @param ctx
 * @returns {Promise<{success: boolean, error: *}|{success: boolean}>}
 */
export async function save(ctx) {
    try {
        const postData = ctx.request.body;
        addBook(postData);

        ctx.status = 201;
        return ctx.body = {
            success: true
        }
    } catch (e) {
        return ctx.body = {
            success: false,
            error: e.message
        }
    }
}