import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { ok, notFound, corsPreflight } from "./lib/response";
import * as products from "./handlers/products";
import * as categories from "./handlers/categories";
import * as cart from "./handlers/cart";
import * as orders from "./handlers/orders";
import * as config from "./handlers/config";
import * as uploads from "./handlers/uploads";
import * as events from "./handlers/events";
import * as analytics from "./handlers/analytics";
import * as salesReport from "./handlers/sales-report";
import * as adminCarts from "./handlers/admin-carts";
import * as adminCustomers from "./handlers/admin-customers";
import * as account from "./handlers/account";
import * as coupons from "./handlers/coupons";
import * as sesEmail from "./handlers/ses-email";
import { stripeWebhook } from "./handlers/payments/stripe";
import { razorpayWebhook, verifyRazorpayPayment } from "./handlers/payments/razorpay";

type RouteHandler = (event: APIGatewayProxyEventV2) => Promise<APIGatewayProxyResultV2>;

interface Route {
  method: string;
  pattern: RegExp;
  handler: RouteHandler;
  params?: string[];
}

const routes: Route[] = [
  { method: "GET", pattern: /^\/health$/, handler: async () => ok({ status: "ok" }) },
  { method: "GET", pattern: /^\/products$/, handler: products.listProducts },
  { method: "GET", pattern: /^\/products\/([^/]+)$/, handler: products.getProduct, params: ["slug"] },
  { method: "POST", pattern: /^\/products$/, handler: products.createProduct },
  { method: "PUT", pattern: /^\/products\/([^/]+)$/, handler: products.updateProduct, params: ["slug"] },
  { method: "DELETE", pattern: /^\/products\/([^/]+)$/, handler: products.deleteProduct, params: ["slug"] },
  { method: "GET", pattern: /^\/admin\/products$/, handler: products.listAdminProducts },
  { method: "POST", pattern: /^\/products\/bulk$/, handler: products.bulkUploadProducts },
  { method: "GET", pattern: /^\/categories$/, handler: categories.listCategories },
  { method: "GET", pattern: /^\/categories\/([^/]+)$/, handler: categories.getCategory, params: ["slug"] },
  { method: "POST", pattern: /^\/categories$/, handler: categories.createCategory },
  { method: "PUT", pattern: /^\/categories\/([^/]+)$/, handler: categories.updateCategory, params: ["slug"] },
  { method: "DELETE", pattern: /^\/categories\/([^/]+)$/, handler: categories.deleteCategory, params: ["slug"] },
  { method: "GET", pattern: /^\/cart$/, handler: cart.getCartHandler },
  { method: "POST", pattern: /^\/cart\/items$/, handler: cart.addToCart },
  { method: "PUT", pattern: /^\/cart\/items\/([^/]+)$/, handler: cart.updateCartItem, params: ["productSlug"] },
  { method: "DELETE", pattern: /^\/cart\/items\/([^/]+)$/, handler: cart.removeFromCart, params: ["productSlug"] },
  { method: "DELETE", pattern: /^\/cart$/, handler: cart.clearCart },
  { method: "POST", pattern: /^\/checkout$/, handler: orders.checkout },
  { method: "GET", pattern: /^\/orders$/, handler: orders.listOrders },
  { method: "GET", pattern: /^\/orders\/([^/]+)$/, handler: orders.getOrder, params: ["orderId"] },
  { method: "POST", pattern: /^\/orders\/([^/]+)\/retry-payment$/, handler: orders.retryOrderPayment, params: ["orderId"] },
  { method: "GET", pattern: /^\/account$/, handler: account.getAccount },
  { method: "PUT", pattern: /^\/account\/profile$/, handler: account.updateAccountProfile },
  { method: "POST", pattern: /^\/account\/addresses$/, handler: account.createAccountAddress },
  { method: "PUT", pattern: /^\/account\/addresses\/([^/]+)$/, handler: account.updateAccountAddress, params: ["addressId"] },
  { method: "DELETE", pattern: /^\/account\/addresses\/([^/]+)$/, handler: account.deleteAccountAddress, params: ["addressId"] },
  { method: "GET", pattern: /^\/admin\/orders$/, handler: orders.listAdminOrders },
  { method: "POST", pattern: /^\/admin\/orders\/bulk-delete$/, handler: orders.bulkDeleteAdminOrders },
  { method: "GET", pattern: /^\/admin\/orders\/([^/]+)$/, handler: orders.getAdminOrder, params: ["orderId"] },
  { method: "PATCH", pattern: /^\/admin\/orders\/([^/]+)$/, handler: orders.updateOrderStatus, params: ["orderId"] },
  { method: "PUT", pattern: /^\/admin\/orders\/([^/]+)$/, handler: orders.updateOrderStatus, params: ["orderId"] },
  { method: "DELETE", pattern: /^\/admin\/orders\/([^/]+)$/, handler: orders.deleteAdminOrder, params: ["orderId"] },
  { method: "GET", pattern: /^\/admin\/leads$/, handler: orders.listLeads },
  { method: "PATCH", pattern: /^\/admin\/leads$/, handler: orders.updateLead },
  { method: "GET", pattern: /^\/admin\/analytics\/overview$/, handler: analytics.getAnalyticsOverview },
  { method: "GET", pattern: /^\/admin\/analytics\/sales$/, handler: salesReport.getSalesReport },
  { method: "GET", pattern: /^\/admin\/analytics\/products$/, handler: analytics.getTopProducts },
  { method: "GET", pattern: /^\/admin\/analytics\/searches$/, handler: analytics.getTopSearches },
  { method: "GET", pattern: /^\/admin\/analytics\/insights$/, handler: analytics.getAnalyticsInsights },
  { method: "GET", pattern: /^\/admin\/sessions$/, handler: analytics.listSessions },
  { method: "GET", pattern: /^\/admin\/sessions\/([^/]+)$/, handler: analytics.getSessionTimeline, params: ["sessionId"] },
  { method: "GET", pattern: /^\/admin\/carts\/abandoned$/, handler: adminCarts.getAbandonedCarts },
  { method: "GET", pattern: /^\/admin\/customers\/([^/]+)$/, handler: adminCustomers.getCustomerProfile, params: ["email"] },
  { method: "GET", pattern: /^\/admin\/search$/, handler: adminCustomers.adminSearch },
  { method: "POST", pattern: /^\/coupons\/validate$/, handler: coupons.validateCouponHandler },
  { method: "GET", pattern: /^\/admin\/welcome-coupons$/, handler: coupons.listWelcomeCoupons },
  { method: "POST", pattern: /^\/leads$/, handler: orders.captureLead },
  { method: "POST", pattern: /^\/events$/, handler: events.recordEvent },
  { method: "GET", pattern: /^\/config\/payments$/, handler: config.getPaymentConfig },
  { method: "GET", pattern: /^\/config\/usd-inr-rate$/, handler: config.getUsdInrRate },
  { method: "PUT", pattern: /^\/config\/payments$/, handler: config.updatePaymentConfig },
  { method: "GET", pattern: /^\/blog-images$/, handler: config.getBlogImages },
  { method: "PUT", pattern: /^\/admin\/blog-images$/, handler: config.updateBlogImages },
  { method: "POST", pattern: /^\/uploads\/presign$/, handler: uploads.getUploadUrl },
  { method: "POST", pattern: /^\/products\/([^/]+)\/images$/, handler: uploads.attachImageToProduct, params: ["slug"] },
  { method: "DELETE", pattern: /^\/products\/([^/]+)\/images$/, handler: uploads.deleteImageFromProduct, params: ["slug"] },
  { method: "POST", pattern: /^\/webhooks\/stripe$/, handler: stripeWebhook },
  { method: "POST", pattern: /^\/webhooks\/razorpay$/, handler: razorpayWebhook },
  { method: "POST", pattern: /^\/payments\/razorpay\/verify$/, handler: verifyRazorpayPayment },

  // SES bulk email campaigns (Cognito `email` group)
  { method: "GET", pattern: /^\/ses-email\/dashboard$/, handler: sesEmail.getDashboard },
  { method: "GET", pattern: /^\/ses-email\/campaigns$/, handler: sesEmail.listCampaigns },
  { method: "POST", pattern: /^\/ses-email\/campaigns$/, handler: sesEmail.createCampaign },
  { method: "GET", pattern: /^\/ses-email\/campaigns\/([^/]+)$/, handler: sesEmail.getCampaignHandler, params: ["campaignId"] },
  { method: "PUT", pattern: /^\/ses-email\/campaigns\/([^/]+)$/, handler: sesEmail.updateCampaign, params: ["campaignId"] },
  { method: "POST", pattern: /^\/ses-email\/recipients$/, handler: sesEmail.uploadRecipients },
  { method: "GET", pattern: /^\/ses-email\/templates$/, handler: sesEmail.listTemplates },
  { method: "POST", pattern: /^\/ses-email\/templates$/, handler: sesEmail.createTemplate },
  { method: "GET", pattern: /^\/ses-email\/settings$/, handler: sesEmail.getSettings },
  { method: "PUT", pattern: /^\/ses-email\/settings$/, handler: sesEmail.updateSettings },
  { method: "GET", pattern: /^\/ses-email\/suppression$/, handler: sesEmail.listSuppression },
  { method: "POST", pattern: /^\/ses-email\/suppression$/, handler: sesEmail.addSuppression },
  { method: "DELETE", pattern: /^\/ses-email\/suppression\/([^/]+)$/, handler: sesEmail.removeSuppression, params: ["email"] },
  { method: "GET", pattern: /^\/ses-email\/queue$/, handler: sesEmail.listQueue },
  { method: "GET", pattern: /^\/ses-email\/analytics$/, handler: sesEmail.getAnalytics },
  { method: "GET", pattern: /^\/ses-email\/notifications$/, handler: sesEmail.listNotifications },
  { method: "POST", pattern: /^\/ses-email\/test$/, handler: sesEmail.sendTest },
  { method: "GET", pattern: /^\/email\/open\/([^/]+)$/, handler: sesEmail.trackOpen, params: ["token"] },
  { method: "GET", pattern: /^\/email\/click\/([^/]+)$/, handler: sesEmail.trackClick, params: ["token"] },
  { method: "GET", pattern: /^\/email\/unsubscribe\/([^/]+)$/, handler: sesEmail.unsubscribe, params: ["token"] },
];

export async function route(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  let path = event.rawPath ?? event.requestContext.http.path ?? "/";
  const stage = event.requestContext.stage;
  // HTTP API includes stage in path (e.g. /prod/products) — strip it for routing
  if (stage && path.startsWith(`/${stage}/`)) {
    path = path.slice(stage.length + 1);
  } else if (stage && path === `/${stage}`) {
    path = "/";
  }

  const method = event.requestContext.http.method;

  if (method === "OPTIONS") {
    return corsPreflight();
  }

  for (const routeDef of routes) {
    if (routeDef.method !== method) continue;
    const match = path.match(routeDef.pattern);
    if (!match) continue;

    if (routeDef.params) {
      const params: Record<string, string> = {};
      routeDef.params.forEach((name, i) => {
        params[name] = match[i + 1];
      });
      event.pathParameters = { ...event.pathParameters, ...params };
    }

    return routeDef.handler(event);
  }

  return notFound(`Route not found: ${method} ${path}`);
}
