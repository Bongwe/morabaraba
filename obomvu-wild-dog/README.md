# Obomvu Wild Dog

A Unity WebGL game served as static files behind nginx, deployed alongside the
Morabaraba stack on its own port (**9094**).

## Adding your build

1. In Unity, build for the **WebGL** platform.
2. Copy the *contents* of the build output folder into [`webgl/`](./webgl) so the
   structure is:

   ```
   obomvu-wild-dog/
     webgl/
       index.html
       Build/
       TemplateData/
       StreamingAssets/   (if present)
   ```

   Replace the placeholder `webgl/index.html` that ships in this repo.

## Compression note

If you build with **Compression Format = Brotli or Gzip** and turn the
**Decompression Fallback** option *off*, Unity's loader requests the
precompressed `.br` / `.gz` files directly. [`nginx.conf`](./nginx.conf) already
sets the matching `Content-Encoding` headers for those, so this works out of the
box. If you keep Decompression Fallback *on*, the defaults are also fine.

## Run locally

```bash
# from the repo root
docker compose up --build wild-dog
# → http://localhost:9094
```

## Deploy

Pushing to the `checkers-game` branch builds and pushes the image to GHCR and
redeploys via the GitHub Actions workflow (`.github/workflows/deploy.yml`),
same as the other services.
