/** 前台 API 封装（新版 v2） */
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") || "";
export interface SiteInfo {
  site_name: string; site_logo: string; customer_service: string; qq_group: string; copyright: string;
  announcements: Array<{ id: number; title: string; content: string; is_popup: number }>;
  faqs: Array<{ id: number; question: string; answer: string }>;
  recent_orders: Array<{ nickname: string; product_name: string; created_at: string }>;
}
export interface Category { id: number; name: string; icon: string; parent_id: number; children?: Category[]; }
export interface ProductSpec { id: number; spec_name: string; price: string; stock: number; }
export interface Product {
  id: number; name: string; description: string; price: string; original_price: string | null;
  category_id: number; category_name: string; image: string; stock: number; sales: number;
  is_hot: number; is_top: number; has_spec: number; status: number;
}
export interface ProductDetail extends Product { purchase_notice: string; tutorial: string; specs: ProductSpec[]; }
export interface CreateOrderResult {
  order_no: string; query_pwd: string; total_amount: string; product_name: string; qr_code: string; pay_timeout: number;
}
export interface OrderCard { content: string; }
export interface OrderInfo {
  order_no: string; product_name: string; spec_name: string; quantity: number; total_amount: string;
  status: number; paid_at: string | null; created_at: string; cards: OrderCard[]; contact: string;
}
export interface FAQ { id: number; question: string; answer: string; }
async function req<T>(path: string, params?: Record<string, string>, init?: RequestInit): Promise<T> {
  const url = new URL(`${API_BASE}/api/${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { cache: "no-store", ...init });
  const json = await res.json();
  if (json.code !== 0) throw new Error(json.msg || "请求失败");
  return json.data as T;
}
export function fetchSite() { return req<SiteInfo>("site.php"); }
export function fetchCategories() { return req<Category[]>("categories.php"); }
export function fetchProducts(params?: { category_id?: string; keyword?: string; sort?: string; page?: string }) {
  return req<{ list: Product[]; total: number }>("products.php", params as Record<string, string>);
}
export function fetchProductDetail(id: string) { return req<ProductDetail>("product_detail.php", { id }); }
export function createOrder(data: { product_id: number; spec_id?: number; quantity: number; contact: string }) {
  return req<CreateOrderResult>("order_create.php", undefined, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
}
export function queryOrder(order_no: string, pwd: string) { return req<OrderInfo>("order_query.php", { order_no, pwd }); }
export function fetchOrderList(contact: string, pwd: string) { return req<OrderInfo[]>("order_list.php", { contact, pwd }); }
export function fetchFAQs() { return req<FAQ[]>("faq.php"); }
export function submitAfterSale(data: { order_no: string; contact: string; content: string }) {
  return req<{ id: number }>("after_sale.php", undefined, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
}
