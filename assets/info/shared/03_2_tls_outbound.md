#### enabled

Enable TLS.

#### engine

!!! question "Since sing-box 1.14.0"



TLS engine to use.

Values:

* `go` (default)
* `apple`
* `windows`

Supported fields:

* `server_name`
* `insecure`
* `alpn`
* `min_version`
* `max_version`
* `certificate` / `certificate_path`
* `certificate_public_key_sha256`
* `handshake_timeout`

Unsupported fields:

* `disable_sni`
* `cipher_suites`
* `curve_preferences`
* `client_certificate` / `client_certificate_path` / `client_key` / `client_key_path`
* `fragment` / `record_fragment`
* `kernel_tx` / `kernel_rx`
* `ech`
* `utls`
* `reality`

!!! note ""

    `windows` uses Schannel via SSPI. Only available on Windows build 17763 or later (Windows 10 version 1809, Windows Server 2019, or newer).

!!! note ""

    TLS 1.3 is only negotiated on Windows 11 or Windows Server 2022 and newer. On older Windows versions, Schannel caps the connection at TLS 1.2 even when `max_version` is `1.3`.

The default version range is TLS 1.2 to TLS 1.3, matching the `go` engine.

Supported fields:

* `server_name`
* `insecure`
* `alpn`
* `min_version`
* `max_version`
* `certificate` / `certificate_path`
* `certificate_public_key_sha256`
* `handshake_timeout`

Unsupported fields:

* `disable_sni`
* `cipher_suites`
* `curve_preferences`
* `client_certificate` / `client_certificate_path` / `client_key` / `client_key_path`
* `fragment` / `record_fragment`
* `kernel_tx` / `kernel_rx`
* `ech`
* `utls`
* `reality`

#### disable_sni



Do not send server name in ClientHello.

#### server_name

Used to verify the hostname on the returned certificates unless insecure is given.

It is also included in the client's handshake to support virtual hosting unless it is an IP address.

#### insecure



Accepts any server certificate.

#### alpn

List of supported application level protocols, in order of preference.

If both peers support ALPN, the selected protocol will be one from this list, and the connection will fail if there is
no mutually supported protocol.

See [Application-Layer Protocol Negotiation](https://en.wikipedia.org/wiki/Application-Layer_Protocol_Negotiation).

#### min_version

The minimum TLS version that is acceptable.

By default, TLS 1.2 is currently used as the minimum when acting as a
client, and TLS 1.0 when acting as a server.

#### max_version

The maximum TLS version that is acceptable.

By default, the maximum version is currently TLS 1.3.

#### cipher_suites

List of enabled TLS 1.0–1.2 cipher suites. The order of the list is ignored.
Note that TLS 1.3 cipher suites are not configurable.

If empty, a safe default list is used. The default cipher suites might change over time.

#### curve_preferences

!!! question "Since sing-box 1.13.0"

Set of supported key exchange mechanisms. The order of the list is ignored, and key exchange mechanisms are chosen
from this list using an internal preference order by Golang.

Available values, also the default list:

* `P256`
* `P384`
* `P521`
* `X25519`
* `X25519MLKEM768`

#### certificate

Server certificates chain line array, in PEM format.

#### certificate_path

!!! note ""

    Will be automatically reloaded if file modified.

The path to server certificate chain, in PEM format.


#### certificate_public_key_sha256

!!! question "Since sing-box 1.13.0"



List of SHA-256 hashes of server certificate public keys, in base64 format.

To generate the SHA-256 hash for a certificate's public key, use the following commands:

```bash
# For a certificate file
openssl x509 -in certificate.pem -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64

# For a certificate from a remote server
echo | openssl s_client -servername example.com -connect example.com:443 2>/dev/null | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64
```

#### client_certificate

!!! question "Since sing-box 1.13.0"



Client certificate chain line array, in PEM format.

#### client_certificate_path

!!! question "Since sing-box 1.13.0"



The path to client certificate chain, in PEM format.

#### client_key

!!! question "Since sing-box 1.13.0"



Client private key line array, in PEM format.

#### client_key_path

!!! question "Since sing-box 1.13.0"



The path to client private key, in PEM format.


#### kernel_tx

!!! question "Since sing-box 1.13.0"

!!! quote ""

    Only supported on Linux 5.1+, use a newer kernel if possible.

!!! quote ""

    Only TLS 1.3 is supported.

!!! warning ""

    kTLS TX may only improve performance when `splice(2)` is available (both ends must be TCP or TLS without additional protocols after handshake); otherwise, it will definitely degrade performance.

Enable kernel TLS transmit support.

#### kernel_rx

!!! question "Since sing-box 1.13.0"

!!! quote ""

    Only supported on Linux 5.1+, use a newer kernel if possible.

!!! quote ""

    Only TLS 1.3 is supported.

!!! failure ""

    kTLS RX will definitely degrade performance even if `splice(2)` is in use, so enabling it is not recommended.

Enable kernel TLS receive support.

#### handshake_timeout

!!! question "Since sing-box 1.14.0"

TLS handshake timeout, in golang's Duration format.

`15s` is used by default.



#### utls



!!! failure "Not Recommended"

    uTLS has had repeated fingerprinting vulnerabilities discovered by researchers.

    uTLS is a Go library that attempts to imitate browser TLS fingerprints by copying
    ClientHello structure. However, browsers use completely different TLS stacks
    (Chrome uses BoringSSL, Firefox uses NSS) with distinct implementation behaviors
    that cannot be replicated by simply copying the handshake format, making detection possible.
    Additionally, the library lacks active maintenance and has poor code quality,
    making it unsuitable for censorship circumvention.

    For TLS fingerprint resistance, use [NaiveProxy](/configuration/inbound/naive/) instead.

uTLS is a fork of "crypto/tls", which provides ClientHello fingerprinting resistance.

#### utls.enabled

Enable utls.

#### utls.fingerprint

Available fingerprint values:

!!! warning "Removed since sing-box 1.10.0"

    Some legacy chrome fingerprints have been removed and will fallback to chrome:

    :material-close: chrome_psk  
    :material-close: chrome_psk_shuffle  
    :material-close: chrome_padding_psk_shuffle  
    :material-close: chrome_pq  
    :material-close: chrome_pq_psk

* chrome
* firefox
* edge
* safari
* 360
* qq
* ios
* android
* random
* randomized

Chrome fingerprint will be used if empty.

#### ech

ECH Fields

ECH (Encrypted Client Hello) is a TLS extension that allows a client to encrypt the first part of its ClientHello
message.

The ECH key and configuration can be generated by `sing-box generate ech-keypair`.

#### ech.enabled

Enable ECH

#### ech.pq_signature_schemes_enabled

!!! failure "Deprecated in sing-box 1.12.0"

    `pq_signature_schemes_enabled` is deprecated in sing-box 1.12.0 and removed in sing-box 1.13.0.

Enable support for post-quantum peer certificate signature schemes.

#### ech.dynamic_record_sizing_disabled

!!! failure "Deprecated in sing-box 1.12.0"

    `dynamic_record_sizing_disabled` is deprecated in sing-box 1.12.0 and removed in sing-box 1.13.0.

Disables adaptive sizing of TLS records.

When true, the largest possible TLS record size is always used.  
When false, the size of TLS records may be adjusted in an attempt to improve latency.


#### ech.config



ECH configuration line array, in PEM format.

If empty, load from DNS will be attempted.

#### ech.config_path



The path to ECH configuration, in PEM format.

If empty, load from DNS will be attempted.

#### ech.query_server_name

!!! question "Since sing-box 1.13.0"



Overrides the domain name used for ECH HTTPS record queries.

If empty, `server_name` is used for queries.

#### fragment

!!! question "Since sing-box 1.12.0"



Fragment TLS handshakes to bypass firewalls.

This feature is intended to circumvent simple firewalls based on **plaintext packet matching**,
and should not be used to circumvent real censorship.

Due to poor performance, try `record_fragment` first, and only apply to server names known to be blocked.

On Linux, Apple platforms, (administrator privileges required) Windows,
the wait time can be automatically detected. Otherwise, it will fall back to
waiting for a fixed time specified by `fragment_fallback_delay`.

In addition, if the actual wait time is less than 20ms, it will also fall back to waiting for a fixed time,
because the target is considered to be local or behind a transparent proxy.

#### fragment_fallback_delay

!!! question "Since sing-box 1.12.0"



The fallback value used when TLS segmentation cannot automatically determine the wait time.

`500ms` is used by default.

#### record_fragment

!!! question "Since sing-box 1.12.0"



Fragment TLS handshake into multiple TLS records to bypass firewalls.

#### spoof

!!! question "Since sing-box 1.14.0"



!!! quote ""

    Only supported on Linux, macOS, and Windows, and requires elevated privileges.

Inject a forged TLS ClientHello carrying a whitelisted SNI before the real one,
to fool SNI-filtering middleboxes that permit specific hostnames.

The forged segment is a copy of the real ClientHello with only the SNI value
replaced by the value of this field, so TLS fingerprinting cannot distinguish
it from the real one. The receiving server drops the forged segment
(see `spoof_method`) while the middlebox treats it as a legitimate session.

Requires raw-socket access (`CAP_NET_RAW` on Linux, root on macOS);
on Linux, `CAP_NET_ADMIN` is additionally required because the send sequence
number is read via `TCP_REPAIR`.
On Windows, Administrator is required to install the embedded WinDivert kernel
driver on first use. Windows on ARM64 is not supported.

#### spoof_method

!!! question "Since sing-box 1.14.0"



How the forged segment is rejected by the real server.

| Value                      | Behavior                                                                                                       |
|----------------------------|----------------------------------------------------------------------------------------------------------------|
| `wrong-sequence` (default) | The forged segment's TCP sequence number is placed before the server's receive window.                         |
| `wrong-checksum`           | The forged segment's TCP checksum is deliberately invalid.                                                     |
| `wrong-ack`                | The forged segment's TCP acknowledgment number is placed before the server's send window.                      |
| `wrong-md5`                | The forged segment carries a TCP-MD5 signature option, which the server rejects since no MD5 key is negotiated. |
| `wrong-timestamp`          | The forged segment carries a backdated TCP timestamp, which the server rejects as a PAWS replay. Linux/Windows only; not supported on macOS. |

#### reality

Reality Fields

#### reality.enabled

Enable Reality

#### reality.public_key

==Required==

Public key, generated by `sing-box generate reality-keypair`.

#### reality.short_id

==Required==

A hexadecimal string with zero to eight digits.
