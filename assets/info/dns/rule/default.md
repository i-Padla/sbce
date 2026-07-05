#### type

Rule type.

#### inbound

Tags of [Inbound](/configuration/inbound/).

#### ip_version

!!! quote "Changes in sing-box 1.14.0"

    This field now also applies when a DNS rule is matched from an internal
    domain resolution that does not target a specific DNS server, such as a
    [`resolve`](../../route/rule_action/#resolve) route rule action without a
    `server` set. In earlier versions, only DNS queries received from a
    client evaluated this field. See
    [Migration](/migration/#ip_version-and-query_type-behavior-changes-in-dns-rules)
    for the full list.

    Setting this field makes the DNS rule incompatible in the same DNS
    configuration with Legacy Address Filter Fields in DNS rules, the Legacy
    `strategy` DNS rule action option, and the Legacy
    `rule_set_ip_cidr_accept_empty` DNS rule item. To combine with
    address-based filtering, use the [`evaluate`](../rule_action/#evaluate)
    action and [`match_response`](#match_response).

4 (A DNS query) or 6 (AAAA DNS query).

Not limited if empty.

#### query_type

!!! quote "Changes in sing-box 1.14.0"

    This field now also applies when a DNS rule is matched from an internal
    domain resolution that does not target a specific DNS server, such as a
    [`resolve`](../../route/rule_action/#resolve) route rule action without a
    `server` set. In earlier versions, only DNS queries received from a
    client evaluated this field. See
    [Migration](/migration/#ip_version-and-query_type-behavior-changes-in-dns-rules)
    for the full list.

    Setting this field makes the DNS rule incompatible in the same DNS
    configuration with Legacy Address Filter Fields in DNS rules, the Legacy
    `strategy` DNS rule action option, and the Legacy
    `rule_set_ip_cidr_accept_empty` DNS rule item. To combine with
    address-based filtering, use the [`evaluate`](../rule_action/#evaluate)
    action and [`match_response`](#match_response).

DNS query type. Values can be integers or type name strings.

#### network

`tcp` or `udp`.

#### auth_user

Username, see each inbound for details.

#### protocol

Sniffed protocol, see [Sniff](/configuration/route/sniff/) for details.

#### domain

Match full domain.

#### domain_suffix

Match domain suffix.

#### domain_keyword

Match domain using keyword.

#### domain_regex

Match domain using regular expression.

#### geosite

!!! failure "Deprecated in sing-box 1.8.0"

    Geosite is deprecated and will be removed in sing-box 1.12.0, check [Migration](/migration/#migrate-geosite-to-rule-sets).

Match geosite.

#### source_geoip

!!! failure "Deprecated in sing-box 1.8.0"

    GeoIP is deprecated and will be removed in sing-box 1.12.0, check [Migration](/migration/#migrate-geoip-to-rule-sets).

Match source geoip.

#### source_ip_cidr

Match source IP CIDR.

#### source_ip_is_private

!!! question "Since sing-box 1.8.0"

Match non-public source IP.

#### source_port

Match source port.

#### source_port_range

Match source port range.

#### port

Match port.

#### port_range

Match port range.

#### process_name

!!! quote ""

    Only supported on Linux, Windows, and macOS.

Match process name.

#### process_path

!!! quote ""

    Only supported on Linux, Windows, and macOS.

Match process path.

#### process_path_regex

!!! question "Since sing-box 1.10.0"

!!! quote ""

    Only supported on Linux, Windows, and macOS.

Match process path using regular expression.

#### package_name

Match android package name.

#### package_name_regex

!!! question "Since sing-box 1.14.0"

Match android package name using regular expression.

#### user

!!! quote ""

    Only supported on Linux.

Match user name.

#### user_id

!!! quote ""

    Only supported on Linux.

Match user id.

#### clash_mode

Match Clash mode.

#### network_type

!!! question "Since sing-box 1.11.0"

!!! quote ""

    Only supported in graphical clients on Android and Apple platforms.

Match network type.

Available values: `wifi`, `cellular`, `ethernet` and `other`.

#### network_is_expensive

!!! question "Since sing-box 1.11.0"

!!! quote ""

    Only supported in graphical clients on Android and Apple platforms.

Match if network is considered Metered (on Android) or considered expensive,
such as Cellular or a Personal Hotspot (on Apple platforms).

#### network_is_constrained

!!! question "Since sing-box 1.11.0"

!!! quote ""

    Only supported in graphical clients on Apple platforms.

Match if network is in Low Data Mode.

#### interface_address

!!! question "Since sing-box 1.13.0"

!!! quote ""

    Only supported on Linux, Windows, and macOS.

Match interface address.

#### network_interface_address

!!! question "Since sing-box 1.13.0"

!!! quote ""

    Only supported in graphical clients on Android and Apple platforms.

Matches network interface (same values as `network_type`) address.

#### default_interface_address

!!! question "Since sing-box 1.13.0"

!!! quote ""

    Only supported on Linux, Windows, and macOS.

Match default interface address.

#### source_mac_address

!!! question "Since sing-box 1.14.0"

!!! quote ""

    Only supported on Linux, macOS, or in graphical clients on Android and macOS. See [Neighbor Resolution](/configuration/shared/neighbor/) for setup.

Match source device MAC address.

#### source_hostname

!!! question "Since sing-box 1.14.0"

!!! quote ""

    Only supported on Linux, macOS, or in graphical clients on Android and macOS. See [Neighbor Resolution](/configuration/shared/neighbor/) for setup.

Match source device hostname from DHCP leases.

#### preferred_by

!!! question "Since sing-box 1.14.0"

Match specified DNS servers' preferred domains.

| Type        | Match                                                                        |
| ----------- | ---------------------------------------------------------------------------- |
| `hosts`     | Match predefined entries and entries in hosts files                          |
| `local`     | Match hosts entries, neighbor-resolved hosts, and mDNS local domains         |
| `mdns`      | Match mDNS local domains (`*.local.` and IPv4/IPv6 link-local reverse zones) |
| `tailscale` | Match MagicDNS hosts and DNS route suffixes                                  |
| `resolved`  | Match split DNS and search domains from systemd-resolved links               |

#### wifi_ssid

!!! quote ""

    Only supported in graphical clients on Android and Apple platforms, or on Linux.

Match WiFi SSID.

#### wifi_bssid

!!! quote ""

    Only supported in graphical clients on Android and Apple platforms, or on Linux.

Match WiFi BSSID.

#### rule_set

!!! question "Since sing-box 1.8.0"

Match [rule-set](/configuration/route/#rule_set).

#### rule_set_ipcidr_match_source

!!! question "Since sing-box 1.9.0"

!!! failure "Deprecated in sing-box 1.10.0"

    `rule_set_ipcidr_match_source` is renamed to `rule_set_ip_cidr_match_source` and will be remove in sing-box 1.11.0.

Make `ip_cidr` rule items in rule-sets match the source IP.

#### rule_set_ip_cidr_match_source

!!! question "Since sing-box 1.10.0"

Make `ip_cidr` rule items in rule-sets match the source IP.

#### match_response

!!! question "Since sing-box 1.14.0"

Enable response-based matching. When enabled, this rule matches against the evaluated response
(set by a preceding [`evaluate`](/configuration/dns/rule_action/#evaluate) action)
instead of only matching the original query.

The evaluated response can also be returned directly by a later [`respond`](/configuration/dns/rule_action/#respond) action.

Required for Response Match Fields (`response_rcode`, `response_answer`, `response_ns`, `response_extra`).
Also required for `ip_cidr`, `ip_is_private`, and `ip_accept_any` when used with `evaluate` or Response Match Fields.

#### ip_accept_any

!!! question "Since sing-box 1.12.0"

Match when the DNS query response contains at least one address.

#### invert

Invert match result.

#### outbound

!!! failure "Deprecated in sing-box 1.12.0"

    `outbound` rule items are deprecated and will be removed in sing-box 1.14.0, check [Migration](/migration/#migrate-outbound-dns-rule-items-to-domain-resolver).

Match outbound.

`any` can be used as a value to match any outbound.

#### server

!!! failure "Deprecated in sing-box 1.11.0"

    Moved to [DNS Rule Action](../rule_action#route).

#### disable_cache

!!! failure "Deprecated in sing-box 1.11.0"

    Moved to [DNS Rule Action](../rule_action#route).

#### rewrite_ttl

!!! failure "Deprecated in sing-box 1.11.0"

    Moved to [DNS Rule Action](../rule_action#route).

#### client_subnet

!!! failure "Deprecated in sing-box 1.11.0"

    Moved to [DNS Rule Action](../rule_action#route).

### Legacy Address Filter Fields

!!! failure "Deprecated in sing-box 1.14.0"

    Legacy Address Filter Fields are deprecated and will be removed in sing-box 1.16.0,
    check [Migration](/migration/#migrate-address-filter-fields-to-response-matching).

Only takes effect for address requests (A/AAAA/HTTPS). When the query results do not match the address filtering rule items, the current rule will be skipped.

!!! info ""

    `ip_cidr` items in included rule-sets also takes effect as an address filtering field.

!!! note ""

    Enable `experimental.cache_file.store_rdrc` to cache results.

#### geoip

!!! failure "Removed in sing-box 1.12.0"

    GeoIP is deprecated in sing-box 1.8.0 and removed in sing-box 1.12.0, check [Migration](/migration/#migrate-geoip-to-rule-sets).

Match GeoIP with query response.

#### ip_cidr

!!! question "Since sing-box 1.9.0"

Match IP CIDR with query response.

As a Legacy Address Filter Field, deprecated. Use with `match_response` instead,
check [Migration](/migration/#migrate-address-filter-fields-to-response-matching).

#### ip_is_private

!!! question "Since sing-box 1.9.0"

Match private IP with query response.

As a Legacy Address Filter Field, deprecated. Use with `match_response` instead,
check [Migration](/migration/#migrate-address-filter-fields-to-response-matching).

#### rule_set_ip_cidr_accept_empty

!!! question "Since sing-box 1.10.0"

!!! failure "Deprecated in sing-box 1.14.0"

    `rule_set_ip_cidr_accept_empty` is deprecated and will be removed in sing-box 1.16.0,
    check [Migration](/migration/#migrate-address-filter-fields-to-response-matching).

Make `ip_cidr` rules in rule-sets accept empty query response.

### Response Match Fields

!!! question "Since sing-box 1.14.0"

Match fields for the evaluated response. Require `match_response` to be set to `true`
and a preceding rule with [`evaluate`](/configuration/dns/rule_action/#evaluate) action to populate the response.

That evaluated response may also be returned directly by a later [`respond`](/configuration/dns/rule_action/#respond) action.

#### response_rcode

Match DNS response code.

Accepted values are the same as in the [predefined action rcode](/configuration/dns/rule_action/#rcode).

#### response_answer

Match DNS answer records.

Record format is the same as in [predefined action answer](/configuration/dns/rule_action/#answer).

#### response_ns

Match DNS name server records.

Record format is the same as in [predefined action ns](/configuration/dns/rule_action/#ns).

#### response_extra

Match DNS extra records.

Record format is the same as in [predefined action extra](/configuration/dns/rule_action/#extra).

