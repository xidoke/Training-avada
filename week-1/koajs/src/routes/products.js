import Router from 'koa-router';
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from '../handlers/products.js';
import { validateProduct, validatePartialProduct } from '../middleware/productValidation.js';

const productsRouter = new Router();

productsRouter.get('/', getAllProducts);
// Sử dụng validateProduct cho POST (tạo mới, cần đủ trường)
productsRouter.post('/', validateProduct, createProduct);
productsRouter.get('/:id', getProductById);
// Sử dụng validatePartialProduct cho PUT (cập nhật, chỉ cần các trường thay đổi) / theo đặc tả thì nên là PATCH
productsRouter.put('/:id', validatePartialProduct, updateProduct);
productsRouter.delete('/:id', deleteProduct);

export default productsRouter;