from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any


HEADER_ROUTE_ID = "eye-gym-security-headers"
API_ROUTE_ID = "eye-gym-api-route"


def configure(config: dict[str, Any], domain: str, upstream: str) -> dict[str, Any]:
    servers = config.get("apps", {}).get("http", {}).get("servers", {})
    if not servers:
        raise ValueError("Caddy configuration has no HTTP servers")

    header_route = {
        "@id": HEADER_ROUTE_ID,
        "match": [{"host": [domain]}],
        "handle": [
            {
                "handler": "headers",
                "response": {
                    "set": {
                        "Strict-Transport-Security": ["max-age=31536000; includeSubDomains"],
                        "X-Content-Type-Options": ["nosniff"],
                        "Content-Security-Policy": [
                            "frame-ancestors 'self' https://web.telegram.org https://*.telegram.org"
                        ],
                        "Referrer-Policy": ["strict-origin-when-cross-origin"],
                        "Permissions-Policy": ["camera=(), microphone=(), geolocation=()"],
                    }
                },
            }
        ],
    }
    api_route = {
        "@id": API_ROUTE_ID,
        "match": [{"host": [domain], "path": ["/api/*"]}],
        "handle": [
            {
                "handler": "reverse_proxy",
                "upstreams": [{"dial": upstream}],
            }
        ],
        "terminal": True,
    }

    for server in servers.values():
        routes = server.setdefault("routes", [])
        routes[:] = [
            route
            for route in routes
            if route.get("@id") not in {HEADER_ROUTE_ID, API_ROUTE_ID}
        ]
        routes[0:0] = [header_route, api_route]
    return config


if __name__ == "__main__":
    if len(sys.argv) != 5:
        raise SystemExit(
            "Usage: configure_caddy_json.py INPUT OUTPUT DOMAIN UPSTREAM"
        )
    input_path, output_path, domain, upstream = sys.argv[1:]
    current = json.loads(Path(input_path).read_text(encoding="utf-8"))
    updated = configure(current, domain, upstream)
    Path(output_path).write_text(
        json.dumps(updated, separators=(",", ":")), encoding="utf-8"
    )
