import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { fetchCart, removeItem, updateQty } from '../store/cart';
import { createOrder, getOrder, getOrderByUser } from '../store';

class Cart extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: true,
      qtyInputs: {},
    };
    this.handleRemove = this.handleRemove.bind(this);
    this.handleQtyUpdate = this.handleQtyUpdate.bind(this);
  }

  handleRemove(item) {
    const { removeItem } = this.props;
    removeItem(item);
  }

  handleQtyUpdate(event, item, index) {
    const newQty = event.target.value;
    this.setState((state) => {
      const newObject = { ...state.qtyInputs };
      newObject[`${index}`] = newQty;
      return { qtyInputs: newObject };
    });
    this.props.updateQty(newQty, item);
  }

  async componentDidMount() {
    const { user, order, getCart, createOrder, getExistingOrder } = this.props;

    const { orderId } = this.props.match.params;
    // await getCart(orderId);
    // this.setState({ loading: false });

    // if there is a valid orderId, load cart
    // if (orderId) {
    //   await getCart(orderId);
    //   this.setState({ loading: false });
    // } else
    if (!user) {
      // need to determine the orderId

      // if it is a guest user
      const existingOrder = JSON.parse(window.localStorage.getItem('order'));
      console.log('existingOrder >>>> ', existingOrder);

      if (!order.id && !existingOrder) {
        await createOrder(false);
        console.log('created order successfully! new order:', this.props.order);

        await getCart(this.props.order.id);
        this.setState({ loading: false });
      } else if (!existingOrder) {
        await createOrder();
        console.log(
          'fix bug -- create order successfully! new order:',
          this.props.order
        );
      } else {
        await getExistingOrder(existingOrder.id);
        await getCart(this.props.order.id);
        this.setState({ loading: false });
      }
    } else {
      console.log('This is an auth user');
      // this is an authorized user, dispatch thunk to get order
      await this.props.getOrderByUser();
      await getCart(this.props.order.id);
      this.setState({ loading: false });
    }
  }

  render() {
    const { cart } = this.props;
    const { loading, qtyInputs } = this.state;
    const { handleRemove, handleQtyUpdate } = this;

    if (loading) {
      return (
        <main>
          <p>Loading cart details...</p>
        </main>
      );
    } else {
      const hasCart = cart.length !== 0;
      let cartPrice = 0;

      return (
        <main>
          {hasCart ? (
            <div className="cart-layout">
              <h2>Shopping Cart</h2>
              <div className="cart-products-layout">
                {cart.map((op, index) => {
                  cartPrice += parseFloat(op.item_total_price);

                  return (
                    <div key={op.product.id} className="cart-main">
                      <div className="cart-each-product">
                        <div>
                          <Link to={`/shop/products/${op.product.id}`}>
                            <img
                              className="all-products-img"
                              src={op.product.imageUrl}
                            />
                          </Link>
                        </div>

                        <div className="cart-product-detail">
                          <h3>{op.product.name}</h3>
                          <button
                            className="remove-button"
                            type="button"
                            onClick={() => handleRemove(op)}
                          >
                            Remove
                          </button>
                        </div>
                        <div className="cart-quantity-option">
                          <p>Quantity: {op.num_items} </p>
                          <p>Subtotal: ${op.item_total_price}</p>
                          <div>
                            <input
                              type="number"
                              name="cart-quantity-input"
                              min="1"
                              max={op.product.quantity}
                              placeholder="Update item here..."
                              value={qtyInputs[`${index}`] || ''}
                              onChange={(event) =>
                                handleQtyUpdate(event, op, index)
                              }
                            />
                            {/* <button
                              type="button"
                              onClick={() => handleUpdate(op)}
                            >
                              Update
                            </button> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="cart-each-product order-summary">
                  <h2>Order Summary - {cart.length} Item(s)</h2>
                  <h2>Order Total: ${cartPrice}</h2>
                </div>
              </div>
              <Link to="/checkout">
                <button className="checkout-button">CHECKOUT</button>
              </Link>
            </div>
          ) : (
            <h3>Your cart is empty.</h3>
          )}
        </main>
      );
    }
  }
}

const mapState = (state) => {
  return {
    user: state.auth.username,
    order: state.order,
    cart: state.cart,
  };
};

const mapDispatch = (dispatch) => {
  return {
    getCart: (orderId) => dispatch(fetchCart(orderId)),
    removeItem: (item) => dispatch(removeItem(item)),
    createOrder: (setUserId) => dispatch(createOrder(setUserId)),
    getExistingOrder: (orderId) => dispatch(getOrder(orderId)),
    getOrderByUser: () => dispatch(getOrderByUser()),
    updateQty: (newQty, item) => dispatch(updateQty(newQty, item)),
  };
};

export default connect(mapState, mapDispatch)(Cart);
