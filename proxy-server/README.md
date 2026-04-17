# Shrimine Mining Proxy (VPS)

WebSocket bridge between browser miners and a Monero Stratum pool.

## Quick start

```bash
cd proxy-server
cp .env.example .env
# Edit .env: set POOL_WALLET (or rely on Lovable Cloud platform_config)
npm install
npm start
```

The proxy listens on `:8080` (HTTP + WebSocket on the same port).

## Behind nginx (TLS → wss://)

```nginx
server {
  listen 443 ssl http2;
  server_name proxy.your-domain.com;

  ssl_certificate     /etc/letsencrypt/live/proxy.your-domain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/proxy.your-domain.com/privkey.pem;

  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 86400;
  }
}
```

Then in the Shrimine **Admin → Proxy & Pool** tab set:

```
proxy_url = wss://proxy.your-domain.com
proxy_enabled = true
```

## Run as a service (systemd)

Create `/etc/systemd/system/shrimine-proxy.service`:

```ini
[Unit]
Description=Shrimine Mining Proxy
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/shrimine-proxy
ExecStart=/usr/bin/node server.js
Restart=always
User=www-data
EnvironmentFile=/opt/shrimine-proxy/.env

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now shrimine-proxy
sudo journalctl -u shrimine-proxy -f
```

## Public test pools (no signup)

| Pool | Host | Port | TLS |
|------|------|------|-----|
| SupportXMR | pool.supportxmr.com | 3333 | false |
| MoneroOcean | gulf.moneroocean.stream | 10128 | true |
| Nanopool | xmr-eu1.nanopool.org | 14444 | false |

## Health check

```bash
curl https://proxy.your-domain.com/health
```

Returns the live config the proxy is using.

## Protocol (browser ⇄ proxy)

Connect with `wss://proxy.your-domain.com?token=<supabase_jwt>`

**Server → client**
```json
{ "type": "job", "job": { "job_id": "...", "blob": "...", "target": "..." } }
{ "type": "accepted", "id": "browser-share-id" }
{ "type": "rejected", "id": "...", "error": { "code": -1, "message": "..." } }
{ "type": "error",    "message": "..." }
```

**Client → server**
```json
{ "type": "submit", "id": "browser-share-id", "share": {
  "job_id": "...", "nonce": "...", "result": "...", "session_id": "..."
}}
```
