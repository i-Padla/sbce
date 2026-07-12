#### type

Rule type, `default` or `logical`

#### inbound

Tags of [Inbound](https://sing-box.sagernet.org/configuration/inbound/).

#### ip_version

4 or 6.

Not limited if empty.

#### auth_user

Username, see each inbound for details.

#### protocol

Sniffed protocol, see [Protocol Sniff](https://sing-box.sagernet.org/configuration/route/sniff/) for details.

#### client

!!! question "Since sing-box 1.10.0"

Sniffed client type, see [Protocol Sniff](https://sing-box.sagernet.org/configuration/route/sniff/) for details.

#### network

!!! quote "Changes in sing-box 1.13.0"

    Since sing-box 1.13.0, you can match ICMP echo (ping) requests via the new `icmp` network.

    Such traffic originates from `TUN`, `WireGuard`, and `Tailscale` inbounds and can be routed to `Direct`, `WireGuard`, and `Tailscale` outbounds.

Match network type.

`tcp`, `udp` or `icmp`.

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

    Geosite is deprecated and will be removed in sing-box 1.12.0, check [Migration](https://sing-box.sagernet.org/migration/#migrate-geosite-to-rule-sets).

Match geosite.

#### source_geoip

!!! failure "Deprecated in sing-box 1.8.0"

    GeoIP is deprecated and will be removed in sing-box 1.12.0, check [Migration](https://sing-box.sagernet.org/migration/#migrate-geoip-to-rule-sets).

Match source geoip.

#### geoip

!!! failure "Deprecated in sing-box 1.8.0"

    GeoIP is deprecated and will be removed in sing-box 1.12.0, check [Migration](https://sing-box.sagernet.org/migration/#migrate-geoip-to-rule-sets).

Match geoip.

#### source_ip_cidr

Match source IP CIDR.

#### ip_is_private

!!! question "Since sing-box 1.8.0"

Match non-public IP.

#### ip_cidr

Match IP CIDR.

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

#### wifi_ssid

Match WiFi SSID.

See [Wi-Fi State](https://sing-box.sagernet.org/configuration/shared/wifi-state/) for details.

#### wifi_bssid

Match WiFi BSSID.

See [Wi-Fi State](https://sing-box.sagernet.org/configuration/shared/wifi-state/) for details.

#### preferred_by

!!! question "Since sing-box 1.13.0"

Match specified outbounds' preferred routes.

| Type        | Match                                         |
| ----------- | --------------------------------------------- |
| `tailscale` | Match MagicDNS domains and peers' allowed IPs |
| `wireguard` | Match peers's allowed IPs                     |

#### source_mac_address

!!! question "Since sing-box 1.14.0"

!!! quote ""

    Only supported on Linux, macOS, or in graphical clients on Android and macOS. See [Neighbor Resolution](https://sing-box.sagernet.org/configuration/shared/neighbor/) for setup.

Match source device MAC address.

#### source_hostname

!!! question "Since sing-box 1.14.0"

!!! quote ""

    Only supported on Linux, macOS, or in graphical clients on Android and macOS. See [Neighbor Resolution](https://sing-box.sagernet.org/configuration/shared/neighbor/) for setup.

Match source device hostname from DHCP leases.

#### rule_set

!!! question "Since sing-box 1.8.0"

Match [rule-set](https://sing-box.sagernet.org/configuration/route/#rule_set).

#### rule_set_ipcidr_match_source

!!! question "Since sing-box 1.8.0"

!!! failure "Deprecated in sing-box 1.10.0"

    `rule_set_ipcidr_match_source` is renamed to `rule_set_ip_cidr_match_source` and will be remove in sing-box 1.11.0.

Make `ip_cidr` in rule-sets match the source IP.

#### rule_set_ip_cidr_match_source

!!! question "Since sing-box 1.10.0"

Make `ip_cidr` in rule-sets match the source IP.

#### invert

Invert match result.
