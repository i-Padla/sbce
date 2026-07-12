#### type

The type of the service.

#### tag

The tag of the endpoint.

#### servers

==Required==

A mapping Object from HTTP endpoints to [Shadowsocks Inbound](https://sing-box.sagernet.org/configuration/inbound/shadowsocks) tags.

Selected Shadowsocks inbounds must be configured with [managed](https://sing-box.sagernet.org/configuration/inbound/shadowsocks#managed) enabled.

Example:

```json
{
  "servers": {
    "/": "ss-in"
  }
}
```

#### cache_path

If set, when the server is about to stop, traffic and user state will be saved to the specified JSON file
to be restored on the next startup.

#### tls

TLS configuration, see [TLS](https://sing-box.sagernet.org/configuration/shared/tls/#inbound).