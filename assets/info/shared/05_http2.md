#### idle_timeout

Idle connection timeout, in golang's Duration format.

#### keep_alive_period

Keep alive period, in golang's Duration format.

#### stream_receive_window

HTTP2 stream-level flow-control receive window size.

Accepts memory size format, e.g. `"64 MB"`.

#### connection_receive_window

HTTP2 connection-level flow-control receive window size.

Accepts memory size format, e.g. `"64 MB"`.

#### max_concurrent_streams

Maximum concurrent streams per connection.