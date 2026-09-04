<?php
/**
 * 支付宝 · 当面付 加签/验签工具类（RSA2 / SHA256withRSA）
 * 参考官方文档：https://opendocs.alipay.com
 */
class AlipaySign
{
    /** 生成待签名/待验签字符串：参数按 key 升序，key=value 用 & 连接，去除空值与 sign/sign_type */
    public static function buildSignText(array $params): string
    {
        ksort($params);
        $parts = [];
        foreach ($params as $k => $v) {
            if ($k === 'sign' || $k === 'sign_type' || $v === '' || $v === null) {
                continue;
            }
            $parts[] = $k . '=' . $v;
        }
        return implode('&', $parts);
    }

    /** 用应用私钥做 RSA2 签名，返回 base64 签名串 */
    public static function sign(array $params, string $privateKey): string
    {
        $text = self::buildSignText($params);
        $res = openssl_sign($text, $sign, $privateKey, OPENSSL_ALGO_SHA256);
        if (!$res) {
            throw new Exception('RSA2 签名失败：' . openssl_error_string());
        }
        return base64_encode($sign);
    }

    /** 用支付宝公钥验签，$sign 为 base64 签名串 */
    public static function verify(array $params, string $sign, string $publicKey): bool
    {
        $text = self::buildSignText($params);
        $ok = openssl_verify($text, base64_decode($sign), $publicKey, OPENSSL_ALGO_SHA256);
        return $ok === 1;
    }

    /**
     * 发起当面付预下单（alipay.trade.precreate）
     * @return array 支付宝返回的 JSON（含 qr_code）
     */
    public static function precreate(array $bizContent): array
    {
        $common = [
            'app_id'      => ALI_APP_ID,
            'method'      => 'alipay.trade.precreate',
            'format'      => 'JSON',
            'charset'     => 'utf-8',
            'sign_type'   => 'RSA2',
            'timestamp'   => date('Y-m-d H:i:s'),
            'version'     => '1.0',
            'notify_url'  => ALI_NOTIFY_URL,
            'biz_content' => json_encode($bizContent, JSON_UNESCAPED_UNICODE),
        ];
        $common['sign'] = self::sign($common, ALI_MERCHANT_PRIVATE_KEY);

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => ALI_GATEWAY,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($common),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $resp = curl_exec($ch);
        if (curl_errno($ch)) {
            throw new Exception('支付宝请求失败：' . curl_error($ch));
        }
        curl_close($ch);
        $data = json_decode($resp, true);
        if (!is_array($data)) {
            throw new Exception('支付宝返回解析失败：' . $resp);
        }
        return $data;
    }
}
