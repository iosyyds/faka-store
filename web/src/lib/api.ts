/**
 * 前台 API 封装
 * 后端地址通过环境变量 NEXT_PUBLIC_API_BASE 配置（部署时在 GitHub Actions 里设置）
 */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
  "https://api.yourdomain.com"; // TODO: 部署时替换为你的后端地址

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  original_price: string | null;
  category: string;
  image: string;
  stock: number;
  sales: number;
}

export interface CreateOrderResult {
  order_no: string;
  query_pwd: string;
  price: string;
  product: string;
  qr_code: string;
}

export interface OrderQueryResult {
  order_no: string;
  product_name: string;
  price: string;
  status: number; // 0 待支付 1 已支付 2 已退款
  paid_at: string | null;
  card: string;
}

/** 拉取商品列表 */
export async function fetchProducts(category?: string): Promise<Product[]> {
  const url = new URL(`${API_BASE}/api/products.php`);
  if (category) url.searchParams.set("category", category);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error("商品列表加载失败");
  const json = await res.json();
  if (json.code !== 0) throw new Error(json.msg || "加载失败");
  return json.data;
}

/** 创建订单并预下单 */
export async function createOrder(
  product_id: number,
  contact: string
): Promise<CreateOrderResult> {
  const res = await fetch(`${API_BASE}/api/order_create.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id, contact }),
  });
  const json = await res.json();
  if (json.code !== 0) throw new Error(json.msg || "下单失败");
  return json.data;
}

/** 查询订单 / 卡密 */
export async function queryOrder(
  order_no: string,
  pwd: string
): Promise<OrderQueryResult> {
  const url = new URL(`${API_BASE}/api/order_query.php`);
  url.searchParams.set("order_no", order_no);
  url.searchParams.set("pwd", pwd);
  const res = await fetch(url.toString(), { cache: "no-store" });
  const json = await res.json();
  if (json.code !== 0) throw new Error(json.msg || "查询失败");
  return json.data;
}
