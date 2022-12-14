import { createStore, combineReducers, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import auth from './auth';
import products from './products';
import singleProduct from './singleProduct';
import users from './users';
import singleUser from './singleUser';
import order from './temp-order'; // NOTE: need to merge and change name
import cart from './cart';

export const reducer = combineReducers({
  auth,
  products,
  singleProduct,
  users,
  singleUser,
  order,
  cart,
});
const middleware = composeWithDevTools(
  applyMiddleware(thunkMiddleware, createLogger({ collapsed: true }))
);
const store = createStore(reducer, middleware);

export default store;
export * from './auth';
export * from './products';
export * from './singleProduct';
export * from './users';
export * from './singleUser';
export * from './temp-order'; // NOTE: need to merge and change name
export * from './cart';
