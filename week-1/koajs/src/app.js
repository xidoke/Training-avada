import Koa from 'koa';
import {koaBody} from 'koa-body';
import apiRouter from './routes/index.js';

const app = new Koa();
const PORT = process.env.PORT || 5000;

app.use(koaBody());

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

app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});