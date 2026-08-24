from __future__ import annotations

import re
import sys
from pathlib import Path


MARKER = "# BEGIN EYE GYM MANAGED ROUTES"
END_MARKER = "# END EYE GYM MANAGED ROUTES"


def shared_block(domain: str, upstream: str) -> str:
    return f"""
  # BEGIN EYE GYM MANAGED ROUTES
  @eyeGymApi {{
    host {domain}
    path /api/*
  }}
  handle @eyeGymApi {{
    reverse_proxy {upstream}
  }}

  @eyeGymImmutable {{
    host {domain}
    path /assets/* /audio/v1/*
  }}
  header @eyeGymImmutable Cache-Control "public, max-age=31536000, immutable"

  @eyeGymFresh {{
    host {domain}
    path / /index.html /*.html /sw.js /workbox-* /manifest.webmanifest
  }}
  header @eyeGymFresh Cache-Control "no-cache"

  @eyeGymHost host {domain}
  header @eyeGymHost {{
    Strict-Transport-Security "max-age=31536000; includeSubDomains"
    X-Content-Type-Options "nosniff"
    Content-Security-Policy "frame-ancestors 'self' https://web.telegram.org https://*.telegram.org"
    Referrer-Policy "strict-origin-when-cross-origin"
    Permissions-Policy "camera=(), microphone=(), geolocation=()"
  }}
  # END EYE GYM MANAGED ROUTES
"""


def site_block(upstream: str) -> str:
    return f"""
  # BEGIN EYE GYM MANAGED ROUTES
  @eyeGymHttp header X-Forwarded-Proto http
  redir @eyeGymHttp https://{{host}}{{uri}} permanent

  handle /api/* {{
    reverse_proxy {upstream}
  }}

  @eyeGymImmutable path /assets/* /audio/v1/*
  header @eyeGymImmutable Cache-Control "public, max-age=31536000, immutable"

  @eyeGymFresh path / /index.html /*.html /sw.js /workbox-* /manifest.webmanifest
  header @eyeGymFresh Cache-Control "no-cache"

  header {{
    Strict-Transport-Security "max-age=31536000; includeSubDomains"
    X-Content-Type-Options "nosniff"
    Content-Security-Policy "frame-ancestors 'self' https://web.telegram.org https://*.telegram.org"
    Referrer-Policy "strict-origin-when-cross-origin"
    Permissions-Policy "camera=(), microphone=(), geolocation=()"
  }}
  # END EYE GYM MANAGED ROUTES
"""


def find_site_opening_brace(content: str, domain: str) -> int | None:
    offset = 0
    while True:
        domain_index = content.find(domain, offset)
        if domain_index < 0:
            return None

        line_end = content.find("\n", domain_index)
        if line_end < 0:
            line_end = len(content)
        brace_index = content.find("{", domain_index, line_end)
        if brace_index >= 0:
            return brace_index
        offset = domain_index + len(domain)


def find_shared_http_opening_brace(content: str) -> int | None:
    match = re.search(r"(?m)^\s*:80\s*\{", content)
    if not match:
        return None
    return content.find("{", match.start(), match.end())


def replace_managed_block(content: str, block: str) -> str | None:
    if MARKER not in content:
        return None
    start = content.index(MARKER)
    line_start = content.rfind("\n", 0, start) + 1
    end = content.index(END_MARKER, start) + len(END_MARKER)
    return content[:line_start] + block.strip("\n") + content[end:]


def configure(path: Path, domain: str, upstream: str) -> bool:
    content = path.read_text(encoding="utf-8")

    shared_brace = find_shared_http_opening_brace(content)
    if shared_brace is not None:
        block = shared_block(domain, upstream)
        replaced = replace_managed_block(content, block)
        if replaced is not None:
            if replaced == content:
                return False
            path.write_text(replaced, encoding="utf-8")
            return True

        updated = content[: shared_brace + 1] + "\n" + block + content[shared_brace + 1 :]
        path.write_text(updated, encoding="utf-8")
        return True

    site_brace = find_site_opening_brace(content, domain)
    if site_brace is None:
        raise ValueError(
            f"No Caddy site block for {domain} and no shared :80 server block found"
        )

    block = site_block(upstream)
    replaced = replace_managed_block(content, block)
    if replaced is not None:
        if replaced == content:
            return False
        path.write_text(replaced, encoding="utf-8")
        return True

    updated = content[: site_brace + 1] + "\n" + block + content[site_brace + 1 :]
    path.write_text(updated, encoding="utf-8")
    return True


if __name__ == "__main__":
    if len(sys.argv) != 4:
        raise SystemExit("Usage: configure_caddy_api.py CADDYFILE DOMAIN UPSTREAM")
    changed = configure(Path(sys.argv[1]), sys.argv[2], sys.argv[3])
    print("updated" if changed else "already-configured")
