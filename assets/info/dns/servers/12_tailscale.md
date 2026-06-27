#### type

The type of the DNS server.

#### tag

The tag of the DNS server.

#### endpoint

==Required==

The tag of the [Tailscale Endpoint](/configuration/endpoint/tailscale).

#### accept_default_resolvers

Indicates whether default DNS resolvers should be accepted for fallback queries in addition to MagicDNS。

if not enabled, `NXDOMAIN` will be returned for non-Tailscale domain queries.

#### accept_search_domain

"Since sing-box 1.14.0"

When enabled, single-label queries (e.g. `my-device`) are retried against each Tailscale search domain until one resolves.

Default resolvers are not consulted for single-label queries regardless of `accept_default_resolvers`.