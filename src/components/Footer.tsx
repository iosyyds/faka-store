import Link from "next/link";

export default function Footer({
  siteName = "发卡商城",
  customerService = "",
  qqGroup = "",
  copyright = "",
}: {
  siteName?: string;
  customerService?: string;
  qqGroup?: string;
  copyright?: string;
}) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h4>{siteName}</h4>
          <p>全自动虚拟商品发卡平台，24小时无人值守，付款秒发。</p>
          <p>安全 · 快捷 · 稳定</p>
        </div>
        <div>
          <h4>快速链接</h4>
          <Link href="/">首页</Link>
          <Link href="/query">查卡密</Link>
          <Link href="/faq">常见问题</Link>
          <Link href="/after-sale">售后反馈</Link>
        </div>
        <div>
          <h4>联系客服</h4>
          {customerService && <p>客服：{customerService}</p>}
          {qqGroup && <p>QQ群：{qqGroup}</p>}
          <p>工作时间：24小时自动发货</p>
        </div>
        <div>
          <h4>法律信息</h4>
          <p>本站仅售卖虚拟数字商品</p>
          <p>卡密一经售出概不退换</p>
          <p>请妥善保管您的卡密</p>
        </div>
      </div>
      <div className="footer-bottom">
        {copyright || `© ${new Date().getFullYear()} ${siteName} 版权所有`}
      </div>
    </footer>
  );
}
