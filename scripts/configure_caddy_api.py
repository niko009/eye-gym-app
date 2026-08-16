from __future__ import annotations

import sys
from pathlib import Path


MARKER = "# BEGIN EYE GYM MANAGED ROUTES"
END_MARKER = "# END EYE GYM MANAGED ROUTES"
BLOCK = """
  # BEGIN EYE GYM MANAGED ROUTES
  @eyeGymHttp header X-Forwarded-Proto http
  redir @eyeGymHttp https://{host}{uri} permanent

  handle /api/* {
    reverse_proxy {upstream}
  }

  @eyeGymImmutable path /assets/* /audio/v1/*
  header @eyeGymImmutable Cache-Control "public, max-age=31536000, immutable"

  @eyeGymFresh path / /index.html /*.html /sw.js /workbox-* /manifest.webmanifest
  header @eyeGymFresh Cache-Control "no-cache"

  header {
    Strict-Transport-Security "max-age=31536000; includeSubDomains"
    X-Content-Type-Options "nosniff"
    Content-Security-Policy "frame-ancestors 'self' https://web.telegram.org https://*.telegram.org"
    Referrer-Policy "strict-origin-when-cross-origin"
    Permissions-Policy "camera=(), microphone=(), geolocation=()"
  }
  # END EYE GYM MANAGED ROUTES
"""


def find_site_opening_brace(content: str, domain: str) -> int:
    offset = 0
    while True:
        domain_index = content.find(domain, offset)
        if domain_index < 0:
            raise ValueError(f"No Caddy site block found for {domain}")

        line_end = content.find("\n", domain_index)
        if line_end < 0:
            line_end = len(content)
        brace_index = content.find("{", domain_index, line_end)
        if brace_index >= 0:
            return brace_index
        offset = domain_index + len(domain)


def configure(path: Path, domain: str, upstream: str) -> bool:
    content = path.read_text(encoding="utf-8")
    if MARKER in content:
        start = content.index(MARKER)
        line_start = content.rfind("\n", 0, start) + 1
        end = content.index(END_MARKER, start) + len(END_MARKER)
        block = BLOCK.replace("{upstream}", upstream).strip("\n")
        updated = content[:line_start] + block + content[end:]
        if updated == content:
            return False
        path.write_text(updated, encoding="utf-8")
        return True

    brace_index = find_site_opening_brace(content, domain)
    block = BLOCK.replace("{upstream}", upstream)
    updated = content[: brace_index + 1] + "\n" + block + content[brace_index + 1 :]
    path.write_text(updated, encoding="utf-8")
    return True


if __name__ == "__main__":
    if len(sys.argv) != 4:
        raise SystemExit("Usage: configure_caddy_api.py CADDYFILE DOMAIN UPSTREAM")
    changed = configure(Path(sys.argv[1]), sys.argv[2], sys.argv[3])
    print("updated" if changed else "already-configured")
