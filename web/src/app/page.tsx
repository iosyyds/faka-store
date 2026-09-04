import Navbar from "@/components/Navbar";
import Shop from "@/components/Shop";

// 站点名称与公告（可自行修改）
const SITE_NAME = "发卡小店";
const SITE_NOTICE =
  "精选虚拟商品，支付宝付款后自动秒发卡密。售后问题请联系客服处理，感谢支持。";

export default function Home() {
  return (
    <>
      <Navbar siteName={SITE_NAME} />
      <Shop siteName={SITE_NAME} notice={SITE_NOTICE} />
    </>
  );
}
