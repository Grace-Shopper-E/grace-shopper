const router = require('express').Router();
const {
  models: { User, Product, Order, Order_Product },
} = require('../db');
module.exports = router;

/* Lauren's original code:
router.get('/:orderId', async (req, res, next) => {
  try {
    const cartOrder = await Order.findOne({
      where: { id: req.params.orderId },
      include: { model: Order_Product, include: { model: Product } },
    });
    res.json(cartOrder);
  } catch (err) {
    next(err);
  }
});
*/

router.get('/:orderId', async (req, res, next) => {
  try {
    const cartOrder = await Order_Product.findAll({
      where: { orderId: req.params.orderId },
      include: Product,
    });
    res.json(cartOrder);
  } catch (err) {
    next(err);
  }
});

router.post('/:orderId', async (req, res, next) => {
  try {
    const { num_items, product } = req.body;

    // check if product is already existing in the user's cart, then we update the product's num_items & items_total_price
    const existingItem = await Order_Product.findOne({
      where: { productId: product.id },
      include: Product,
    });
    if (existingItem) {
      const newQty = existingItem.num_items + parseInt(num_items);
      await existingItem.update({ num_items: newQty });
      await existingItem.setItemTotalPrice();

      res.send(existingItem);
    } else {
      // else create this new item
      const newItemInCart = await Order_Product.create({ num_items });
      await newItemInCart.setOrder(req.params.orderId);
      await newItemInCart.setProduct(product.id);
      await newItemInCart.setItemTotalPrice();

      const item = await Order_Product.findOne({
        where: { productId: product.id },
        include: Product,
      });
      res.send(item);
    }
  } catch (error) {
    next(error);
  }
});
