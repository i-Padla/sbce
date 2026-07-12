#### enabled

Enable cache file.

#### path

Path to the cache file.

`cache.db` will be used if empty.

#### cache_id

Identifier in the cache file

If not empty, configuration specified data will use a separate store keyed by it.

#### store_fakeip

Store fakeip in the cache file

#### store_rdrc

!!! failure "Deprecated in sing-box 1.14.0"

    `store_rdrc` is deprecated and will be removed in sing-box 1.16.0, check [Migration](https://sing-box.sagernet.org/migration/#migrate-store-rdrc).

Store rejected DNS response cache in the cache file

The check results of [Legacy Address Filter Fields](https://sing-box.sagernet.org/configuration/dns/rule/#legacy-address-filter-fields)
will be cached until expiration.

#### rdrc_timeout

Timeout of rejected DNS response cache.

`7d` is used by default.

#### store_dns

!!! question "Since sing-box 1.14.0"

Store DNS cache in the cache file.
