from __future__ import annotations

import unittest

from configure_caddy_json import (
    API_ROUTE_ID,
    FRESH_CACHE_ROUTE_ID,
    HEADER_ROUTE_ID,
    IMMUTABLE_CACHE_ROUTE_ID,
    REDIRECT_ROUTE_ID,
    configure,
)


class ConfigureCaddyJsonTest(unittest.TestCase):
    def test_adds_redirect_proxy_and_cache_routes_idempotently(self) -> None:
        config = {"apps": {"http": {"servers": {"main": {"routes": [{"@id": "site"}]}}}}}

        configure(config, "eye-gym.bacus.dev", "api:8080")
        configure(config, "eye-gym.bacus.dev", "api:8080")

        routes = config["apps"]["http"]["servers"]["main"]["routes"]
        ids = [route.get("@id") for route in routes]
        self.assertEqual(ids.count(REDIRECT_ROUTE_ID), 1)
        self.assertEqual(ids.count(API_ROUTE_ID), 1)
        self.assertEqual(ids.count(IMMUTABLE_CACHE_ROUTE_ID), 1)
        self.assertEqual(ids.count(FRESH_CACHE_ROUTE_ID), 1)
        redirect = next(route for route in routes if route.get("@id") == REDIRECT_ROUTE_ID)
        self.assertEqual(redirect["match"][0]["header"]["X-Forwarded-Proto"], ["http"])
        self.assertEqual(redirect["handle"][0]["status_code"], 308)
        headers = next(route for route in routes if route.get("@id") == HEADER_ROUTE_ID)
        permissions = headers["handle"][0]["response"]["set"]["Permissions-Policy"]
        self.assertEqual(permissions, ["camera=(), microphone=(), geolocation=(), screen-wake-lock=(self)"])


if __name__ == "__main__":
    unittest.main()
