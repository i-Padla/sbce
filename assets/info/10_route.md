#### rules

List of Route Rule

#### rule_set

!!! question "Since sing-box 1.8.0"

List of rule-set

#### final

Default outbound tag. the first outbound will be used if empty.

#### auto_detect_interface

!!! quote ""

    Only supported on Linux, Windows and macOS.

Bind outbound connections to the default NIC by default to prevent routing loops under tun.

Takes no effect if `outbound.bind_interface` is set.

#### override_android_vpn

!!! quote ""

    Only supported on Android.

Accept Android VPN as upstream NIC when `auto_detect_interface` enabled.

#### default_interface

!!! quote ""

    Only supported on Linux, Windows and macOS.

Bind outbound connections to the specified NIC by default to prevent routing loops under tun.

Takes no effect if `auto_detect_interface` is set.

#### default_mark

!!! quote ""

    Only supported on Linux.

Set routing mark by default.

Takes no effect if `outbound.routing_mark` is set.

#### find_process

!!! quote ""

    Only supported on Linux, Windows, and macOS.

Enable process search for logging when no `process_name`, `process_path`, `package_name`, `user` or `user_id` rules exist.

#### find_neighbor

!!! question "Since sing-box 1.14.0"

!!! quote ""

    Only supported on Linux and macOS.

Enable neighbor resolution for logging when no `source_mac_address` or `source_hostname` rules exist.

See [Neighbor Resolution](https://sing-box.sagernet.org/configuration/shared/neighbor/) for setup.

#### dhcp_lease_files

!!! question "Since sing-box 1.14.0"

!!! quote ""

    Only supported on Linux and macOS.

Custom DHCP lease file paths for hostname and MAC address resolution.

Automatically detected from common DHCP servers (dnsmasq, odhcpd, ISC dhcpd, Kea) if empty.

#### default_http_client

!!! question "Since sing-box 1.14.0"

Tag of the default [HTTP Client](https://sing-box.sagernet.org/configuration/shared/http-client/) used by remote rule-sets.

If empty and `http_clients` is defined, the first HTTP client is used.

#### default_domain_resolver

!!! question "Since sing-box 1.12.0"

See [Dial Fields](https://sing-box.sagernet.org/configuration/shared/dial/#domain_resolver) for details.

Can be overridden by `outbound.domain_resolver`.

####  default_domain_resolver.server

==Required==

Tag of the DNS server to use for resolving STUN hostnames

####  default_domain_resolver.timeout

Override the DNS query timeout

####  default_domain_resolver.strategy

Domain strategy: prefer_ipv4, prefer_ipv6, ipv4_only, ipv6_only (deprecated in 1.14.0)

####  default_domain_resolver.disable_cache

Disable DNS cache for this query

####  default_domain_resolver.disable_optimistic_cache

Disable optimistic DNS caching

####  default_domain_resolver.rewrite_ttl

Rewrite TTL in DNS responses

####  default_domain_resolver.client_subnet

Append edns0-subnet OPT record to queries

#### default_network_strategy

!!! question "Since sing-box 1.11.0"

See [Dial Fields](https://sing-box.sagernet.org/configuration/shared/dial/#network_strategy) for details.

Takes no effect if `outbound.bind_interface`, `outbound.inet4_bind_address` or `outbound.inet6_bind_address` is set.

Can be overridden by `outbound.network_strategy`.

Conflicts with `default_interface`.

#### default_network_type

!!! question "Since sing-box 1.11.0"

See [Dial Fields](https://sing-box.sagernet.org/configuration/shared/dial/#network_type) for details.

#### default_fallback_network_type

!!! question "Since sing-box 1.11.0"

See [Dial Fields](https://sing-box.sagernet.org/configuration/shared/dial/#fallback_network_type) for details.

#### default_fallback_delay

!!! question "Since sing-box 1.11.0"

See [Dial Fields](https://sing-box.sagernet.org/configuration/shared/dial/#fallback_delay) for details.