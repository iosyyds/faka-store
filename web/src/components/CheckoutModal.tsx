"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  createOrder,
  queryOrder,
  type CreateOrderResult,
  type Product,
} from "@/lib/api";

type Stage = "form" | "paying" | "success" | "error";

interface Props {
  product: Product;
  onClose: () => void;
}

/** 下单 → 二维码支付 → 轮询 → 自动发货 全流程弹窗 */
export default function CheckoutModal({ product, onClose }: Props) {
  const [stage, setStage] = useState<Stage>("form");
  const [contact, setContact] = useState("");
  const [order, setOrder] = useState<CreateOrderResult | null>(null);
  const [card, setCard] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const qrRef = useRef<HTMLCanvasElement>(null);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 生成二维码
  const renderQR = useCallback(async (text: string) => {
    if (qrRef.current && text) {
      try {
        await QRCode.toCanvas(qrRef.current, text, {
          width: 220,
          margin: 1,
          color: { dark: "#1c1c28", light: "#ffffff" },
        });
      } catch {
        /* 二维码渲染失败不阻塞流程 */
      }
    }
  }, []);

  // 发起下单
  const handlePay = async () => {
    setSubmitting(true);
    setErrMsg("");
    try {
      const res = await createOrder(product.id, contact.trim());
      setOrder(res);
      setStage("paying");
      await renderQR(res.qr_code);
    } catch (e: unknown) {
      setErrMsg(e instanceof Error ? e.message : "下单失败，请稍后重试");
      setStage("error");
    } finally {
      setSubmitting(false);
    }
  };

  // 支付成功后轮询查卡
  const pollOnce = useCallback(async () => {
    if (!order) return;
    try {
      const res = await queryOrder(order.order_no, order.query_pwd);
      if (res.status === 1) {
        setCard(res.card || "已支付，但卡密内容缺失，请联系客服");
        setStage("success");
        return;
      }
    } catch {
      /* 网络抖动忽略，继续轮询 */
    }
    pollRef.current = setTimeout(pollOnce, 3000);
  }, [order]);

  useEffect(() => {
    if (stage === "paying") pollOnce();
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [stage, pollOnce]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("已复制到剪贴板");
    } catch {
      /* 忽略 */
    }
  };

  return (
    <div className="modal-mask" onClick={onClose}>
      <div
        className="glass glass-strong modal-pop w-full max-w-md overflow-hidden rounded-[28px] p-7 text-[var(--ink)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题 */}
        <div className="mb-1 flex items-center justify-between">
          <h3 className="m-0 text-xl font-bold">
            {stage === "success" ? "购买成功" : product.name}
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[var(--ink-soft)] transition hover:bg-black/5"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>
        <p className="mt-0 mb-5 text-sm text-[var(--ink-soft)]">
          {stage === "success" ? "卡密已自动发放，请及时保存" : `￥${product.price} · 付款后自动秒发`}
        </p>

        {/* ---- 表单阶段 ---- */}
        {stage === "form" && (
          <div>
            <label className="text-sm font-medium text-[var(--ink-soft)]">
              联系方式（选填，用于接收发货提醒）
            </label>
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="邮箱 / QQ / 手机号"
              maxLength={100}
              className="mt-2 w-full rounded-2xl border border-[var(--glass-border)] bg-white/40 px-4 py-3 text-[15px] outline-none backdrop-blur-md transition focus:bg-white/60"
            />
            <button
              onClick={handlePay}
              disabled={submitting}
              className="glass-btn accent mt-5 w-full disabled:opacity-60"
            >
              {submitting ? (
                <span className="spinner" />
              ) : (
                <>立即支付 ￥{product.price}</>
              )}
            </button>
          </div>
        )}

        {/* ---- 二维码阶段 ---- */}
        {stage === "paying" && order && (
          <div className="flex flex-col items-center text-center">
            <canvas
              ref={qrRef}
              className="qr-glow rounded-2xl bg-white p-2"
            />
            <p className="mt-4 text-sm font-medium text-[var(--ink-soft)]">
              请使用 <b>支付宝</b> 扫码支付
            </p>
            <div className="mt-3 w-full rounded-2xl bg-white/35 px-4 py-3 text-sm backdrop-blur-md">
              <div className="flex justify-between">
                <span className="text-[var(--ink-soft)]">订单号</span>
                <span className="font-mono">{order.order_no}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-[var(--ink-soft)]">金额</span>
                <span className="font-bold text-rose-500">
                  ￥{order.price}
                </span>
              </div>
            </div>
            <p className="mt-3 flex items-center gap-1 text-xs text-[var(--ink-soft)]">
              <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
              等待支付，到账后自动发货…
            </p>
          </div>
        )}

        {/* ---- 成功阶段 ---- */}
        {stage === "success" && (
          <div>
            <div className="rounded-2xl bg-white/45 p-4 backdrop-blur-md">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-[var(--ink-soft)]">卡密内容</span>
                <button
                  onClick={() => copy(card)}
                  className="glass-chip"
                  style={{ padding: "4px 10px", fontSize: 12 }}
                >
                  复制
                </button>
              </div>
              <pre className="m-0 max-h-56 overflow-auto whitespace-pre-wrap break-all font-mono text-[13px] leading-relaxed">
                {card}
              </pre>
            </div>
            <button
              onClick={onClose}
              className="glass-btn mt-5 w-full"
              style={{ background: "linear-gradient(135deg,#60a5fa,#8b5cf6 55%,#ec4899)" }}
            >
              完成
            </button>
          </div>
        )}

        {/* ---- 错误阶段 ---- */}
        {stage === "error" && (
          <div>
            <p className="text-rose-500">{errMsg}</p>
            <button
              onClick={() => setStage("form")}
              className="glass-btn accent mt-3 w-full"
            >
              返回重试
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
