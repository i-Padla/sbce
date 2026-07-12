#### tag

The tag of the inbound.

#### type

The type of the inbound.

#### up_mbps

Max bandwidth, in Mbps.

Not limited if empty.

Conflict with `ignore_client_bandwidth`.

#### down_mbps

Max bandwidth, in Mbps.

Not limited if empty.

Conflict with `ignore_client_bandwidth`.

#### obfs

QUIC traffic obfuscator.

#### obfs.type

QUIC traffic obfuscator type, one of `salamander` `gecko`.

Disabled if empty.

#### obfs.password

QUIC traffic obfuscator password.

#### obfs.min_packet_size

!!! question "Since sing-box 1.14.0"

Minimum on-wire packet size in bytes. Gecko only.

`512` is used by default.

#### obfs.max_packet_size

!!! question "Since sing-box 1.14.0"

Maximum on-wire packet size in bytes. Gecko only.

`1200` is used by default.

#### users

Hysteria2 users.

#### users.name

Hysteria2 user name.

#### users.password

Authentication password

#### ignore_client_bandwidth

*When `up_mbps` and `down_mbps` are not set*:

Commands clients to use the BBR CC instead of Hysteria CC.

*When `up_mbps` and `down_mbps` are set*:

Deny clients to use the BBR CC.

#### tls

==Required==

TLS configuration, see [TLS](https://sing-box.sagernet.org/configuration/shared/tls/#inbound).

#### masquerade

HTTP3 server behavior (URL string configuration) when authentication fails.

| Scheme       | Example                 | Description        |
|--------------|-------------------------|--------------------|
| `file`       | `file:///var/www`       | As a file server   |
| `http/https` | `http://127.0.0.1:8080` | As a reverse proxy |

Conflict with `masquerade.type`.

A 404 page will be returned if masquerade is not configured.

#### masquerade.type

HTTP3 server behavior (Object configuration) when authentication fails.

| Type     | Description                 | Fields                              |
|----------|-----------------------------|-------------------------------------|
| `file`   | As a file server            | `directory`                         |
| `proxy`  | As a reverse proxy          | `url`, `rewrite_host`               |
| `string` | Reply with a fixed response | `status_code`, `headers`, `content` |

Conflict with `masquerade`.

A 404 page will be returned if masquerade is not configured.

#### masquerade.directory

File server root directory.

#### masquerade.url

Reverse proxy target URL.

#### masquerade.rewrite_host

Rewrite the `Host` header to the target URL.

#### masquerade.status_code

Fixed response status code.

#### masquerade.headers

Fixed response headers.

#### masquerade.content

Fixed response content.

#### bbr_profile

!!! question "Since sing-box 1.14.0"

BBR congestion control algorithm profile, one of `conservative` `standard` `aggressive`.

`standard` is used by default.

#### brutal_debug

Enable debug information logging for Hysteria Brutal CC.

#### realm

!!! question "Since sing-box 1.14.0"

Register this inbound to a Hysteria Realm rendezvous service to enable NAT traversal.

The inbound discovers its public addresses via STUN, registers them on the realm, and uses UDP hole-punching to accept incoming clients without a publicly reachable listen address.

See [Hysteria Realm](https://sing-box.sagernet.org/configuration/service/hysteria-realm/) for the rendezvous service.

#### realm.server_url

==Required==

Realm rendezvous service URL.

#### realm.token

Bearer token for the realm. Must match one of `users[].token` configured on the realm.

#### realm.realm_id

==Required==

Slot identifier on the realm.

1–64 characters, must match `^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$`.

Outbounds must use the same `realm_id` to find this server.

#### realm.stun_servers

==Required==

List of STUN servers (`host` or `host:port`) used to discover public addresses.

#### realm.stun_domain_resolver

Set domain resolver to use for resolving STUN server domain names.

This option uses the same format as the [route DNS rule action](https://sing-box.sagernet.org/configuration/dns/rule_action/#route) without the `action` field.

Setting this option directly to a string is equivalent to setting `server` of this options.

If empty, the default domain resolver is used.

#### realm.stun_domain_resolver.server

==Required==

Tag of the DNS server to use for resolving STUN hostnames

#### realm.stun_domain_resolver.timeout

Override the DNS query timeout

#### realm.stun_domain_resolver.strategy

Domain strategy: prefer_ipv4, prefer_ipv6, ipv4_only, ipv6_only (deprecated in 1.14.0)

#### realm.stun_domain_resolver.disable_cache

Disable DNS cache for this query

#### realm.stun_domain_resolver.disable_optimistic_cache

Disable optimistic DNS caching

#### realm.stun_domain_resolver.rewrite_ttl

Rewrite TTL in DNS responses

#### realm.stun_domain_resolver.client_subnet

Append edns0-subnet OPT record to queries

#### realm.http_client

HTTP client used to talk to the realm.

See [HTTP Client](https://sing-box.sagernet.org/configuration/shared/http-client/) for details.