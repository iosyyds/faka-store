"use client";
import { useEffect, useState } from "react";

interface OrderItem {
  nickname: string;
  product_name: string;
  created_at: string;
}

/** 实时下单滚动公示栏 */
export default function Marquee({ items }: { items: OrderItem[] }) {
  const [fallback] = useState<OrderItem[]>([
    { nickname: "用户**88", product_name: "会员月卡", created_at: "" },
    { nickname: "小**坤", product_name: "加速器季卡", created_at: "" },
    { nickname: "**苹果", product_name: "视频VIP年卡", created_at: "" },
    { nickname: "用户**23", product_name: "游戏点卡", created_at: "" },
    { nickname: "**奶茶", product_name: "网盘会员", created_at: "" },
    { nickname: "用户**67", product_name: "音乐会员", created_at: "" },
  ]);

  const list = items && items.length > 0 ? items : fallback;
  // 复制一份用于无缝滚动
  const doubled = [...list, ...list];

  function maskName(name: string) {
    if (!name) return "用户";
    if (name.length <= 2) return name[0] + "**";
    return name[0] + "**" + name[name.length - 1];
  }

  function timeAgo(t: string) {
    if (!t) return "刚刚";
    const d = new Date(t).getTime();
    const diff = Math.floor((Date.now() - d) / 1000);
    if (diff < 60) return "刚刚";
    if (diff < 3600) return Math.floor(diff / 60) + "分钟前";
    if (diff < 86400) return Math.floor(diff / 3600) + "小时前";
    return Math.floor(diff / 86400) + "天前";
  }

  return (
    <div className="marquee">
      <div className="marquee-inner">
        {doubled.map((item, i) => (
          <div className="marquee-item" key={i}>
            <span className="dot" />
            <span className="name">{maskName(item.nickname)}</span>
            <span>购买了</span>
            <span style={{ color: "#1a1a1c", fontWeight: 500 }}>{item.product_name}</span>
            <span style={{ color: "#9ca3af" }}>{timeAgo(item.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
