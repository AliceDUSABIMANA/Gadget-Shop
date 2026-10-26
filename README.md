# Gadget Shop Rwanda

A beginner-friendly electronics storefront with separate React Router pages for the home page, product catalog, product details, cart, login, registration, checkout preview, purchase confirmation, customer order history and admin management of products, users and orders.

Prices use Rwandan francs (RWF). Regular customer checkout requires a delivery address and saves the customer's name, address and purchased items with the order. Checkout does not process payments: it creates a pending order, reduces product stock and shows an order confirmation. Admins cannot place orders; they can manage products and customer accounts, and set order statuses to Pending, Processing, Completed or Failed.

## Start the app

1. Install packages with `npm install`.
2. Copy `.env.example` to `.env`.
3. Set `MONGODB_URI` in `.env` to your MongoDB connection string.
4. Set a private, random `JWT_SECRET` of at least 32 characters.
5. Set the admin email and password in `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
6. In one terminal run `npm run server`.
7. In another terminal run `npm run dev` and open the Vite URL.

The frontend proxies `/api` requests to the backend on port 5000. The first backend start adds the 12 sample gadgets if the products collection is empty. A MongoDB connection is required; the server reports a clear error when a required environment value is missing.

## Main API

- `GET /api/products` and `GET /api/products/:id` — browse products.
- `POST /api/auth/register` and `POST /api/auth/login` — create an account or sign in.
- `POST /api/orders` — reserve stock and create a pending demo order with a delivery address.
- `GET /api/orders/mine` — view the signed-in customer's orders.
- `GET /api/orders/admin` and `PATCH /api/orders/admin/:id/status` — manage orders as an admin.
- `GET /api/users/admin` — list customer accounts as an admin.

Customer passwords are hashed by the backend. The configured admin signs in through the same login page as customers. Never commit `.env`; use `.env.example` as the configuration template. This is still a demo checkout and does not collect payment details.
