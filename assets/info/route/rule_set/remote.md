#### type

==Required==

Type of rule-set, `local` or `remote`.

#### tag

==Required==

Tag of rule-set.


#### format

==Required==

Format of rule-set file, `source` or `binary`.

Optional when `path` or `url` uses `json` or `srs` as extension.

#### url

==Required==

Download URL of rule-set.

#### http_client

!!! question "Since sing-box 1.14.0"

HTTP Client for downloading rule-set.

See [HTTP Client Fields](https://sing-box.sagernet.org/configuration/shared/http-client/) for details.

When empty, the default HTTP client is used: the one named by
[`default_http_client`](https://sing-box.sagernet.org/configuration/route/#default_http_client), or the first top-level
`http_clients` entry when `default_http_client` is empty.

!!! failure "Implicit default deprecated in sing-box 1.14.0"

    When neither `http_clients` nor `default_http_client` is configured, an implicit HTTP
    client connecting through the default outbound is used. This implicit default is
    deprecated in sing-box 1.14.0 and will be removed in sing-box 1.16.0; define
    `http_clients` instead.

#### update_interval

Update interval of rule-set.

`1d` will be used if empty.

#### download_detour

!!! failure "Deprecated in sing-box 1.14.0"

    `download_detour` is deprecated in sing-box 1.14.0 and will be removed in sing-box 1.16.0, use `http_client` instead.

Tag of the outbound to download rule-set.