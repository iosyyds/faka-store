"use client";

import { useState } from "react";
import { queryOrder, type OrderQueryResult } from "@/lib/api";

/** 订单查询：输入订单号 + 查询密码 → 显示卡密 */
export default function QueryBox() {
  const [orderNo, setOrderNo] = useState("");
  const [pwd, setPwd] = useState("");
  const [result, setResult] = useState<OrderQueryResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleQuery = async () => {
    if (!orderNo.trim() || !pwd.trim()) {
      setError("请填写订单号和查询密码");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await queryOrder(orderNo.trim(), pwd.trim());
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "查询失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("已复制到剪贴板");
    } catch {
      /* 忽略 */
    }
  };

  const statusText = ["待支付", "已支付", "已退款"][result?.status ?? 0];

  return (
    <section className="fade-up mx-auto mt-12 w-full max-w-md px-4">
      <div className="glass glass-strong p-7">
        <h1 className="m-0 text-2xl font-bold">查询卡密</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          输入下单后保存的「订单号 + 查询密码」
        </p>

        <div className="mt-5">
          <label className="text-sm font-medium text-[var(--ink-soft)]">
            订单号
          </label>
          <input
            value={orderNo}
            onChange={(e) => setOrderNo(e.target.value)}
            placeholder="如 2026090412001234"
            className="mt-2 w-full rounded-2xl border border-[var(--glass-border)] bg-white/40 px-4 py-3 font-mono text-[15px] outline-none backdrop-blur-md transition focus:bg-white/60"
          />
        </div>
        <div className="mt-3">
          <label className="text-sm font-medium text-[var(--ink-soft)]">
            查询密码
          </label>
          <input
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="下单时返回的密码"
            className="mt-2 w-full rounded-2xl border border-[var(--glass-border)] bg-white/40 px-4 py-3 font-mono text-[15px] outline-none backdrop-blur-md transition focus:bg-white/60"
          />
        </div>

        <button
          onClick={handleQuery}
          disabled={loading}
          className="glass-btn accent mt-5 w-full disabled:opacity-60"
        >
          {loading ? <span className="spinner" /> : "查 询"}
        </button>

        {error && <p className="mt-4 text-sm text-rose-500">{error}</p>}

        {result && (
          <div className="mt-5 rounded-2xl bg-white/40 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--ink-soft)]">{result.product_name}</span>
              <span
                className={
                  result.status === 1
                    ? "font-bold text-emerald-500"
                    : result.status === 2
                      ? "font-bold text-rose-500"
                      : "font-bold text-amber-500"
                }
              >
                {statusText}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-[var(--ink-soft)]">金额</span>
              <span className="font-bold">￥{result.price}</span>
            </div>
            {result.status === 1 && result.card && (
              <>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-[var(--ink-soft)]">卡密内容</span>
                  <button
                    onClick={() => copy(result.card)}
                    className="glass-chip"
                    style={{ padding: "4px 10px", fontSize: 12 }}
                  >
                    复制
                  </button>
                </div>
                <pre className="m-0 mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-all font-mono text-[13px] leading-relaxed">
                  {result.card}
                </pre>
              </>
            )}
            {result.status === 0 && (
              <p className="mt-4 text-sm text-[var(--ink-soft)]">
                该订单尚未支付，支付完成后自动发货，稍后刷新查询。
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
