import Koa from 'koa';
import {koaBody} from 'koa-body';
import mainRouter from './routes/index.js';
import render from "koa-ejs"
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = new Koa();
const PORT = process.env.PORT || 5000;

app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        console.error('Global Error Handler Caught:', err);
        ctx.status = err.statusCode || err.status || 500;
        ctx.body = {
            success: false,
            message: err.message || 'Internal Server Error',
        };
    }
});


// Setup EJS
render(app, {
    root: path.join(__dirname, 'views'),
    layout: 'layouts/default',
    viewExt: 'ejs',
    cache: process.env.NODE_ENV === 'production',
    debug: process.env.NODE_ENV !== 'production'
});

app.use(koaBody());

app.use(mainRouter.routes());
app.use(mainRouter.allowedMethods());

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});