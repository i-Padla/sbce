#### type

The type of the DNS server.

#### tag

The tag of the DNS server.

#### service

==Required==

The tag of the [Resolved Service](https://sing-box.sagernet.org/configuration/service/resolved).

#### accept_default_resolvers

Indicates whether the default DNS resolvers should be accepted for fallback queries in addition to matching domains.

Specifically, default DNS resolvers are DNS servers that have `SetLinkDefaultRoute` or `SetLinkDomains ~.` set.

If not enabled, `NXDOMAIN` will be returned for requests that do not match search or match domains.