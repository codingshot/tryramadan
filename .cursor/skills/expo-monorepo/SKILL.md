---
name: expo-monorepo
description: Maintain TryRamadan's npm workspaces, Expo native/PWA app and existing Vite web experience. Use for cross-platform migration, shared domain changes, or workspace build failures.
---

# TryRamadan cross-platform changes

- Root commands orchestrate npm workspaces. `apps/web` owns the existing Vite site and full web app; `apps/mobile` owns Expo iOS/Android and its standalone web export. The landing page remains web-only, absent from Expo. Do not silently replace the full web experience with the smaller native feature set.
- `packages/core` contains platform-neutral TypeScript. No React, DOM, localStorage, Node built-ins, or `import.meta.env` there. Web imports calendar functions through its compatibility re-export.
- Web uses React 18; Expo uses its SDK-matched React/React Native pair. Never hoist/alias React manually across these apps. Check Expo's installed `bundledNativeModules.json` and run `expo install --check` from `apps/mobile`.
- Use the root npm lockfile. Run scripts in the right workspace; asset scripts and browser tests live under `apps/web`. Keep root deployment output pointed at `apps/web/dist`.
- Preserve web localStorage keys and origin. Native records have a separate versioned key and do not sync with web; disclose this. Never replace corrupted stored records with defaults on save.
- Expo PWA post-processing runs after export. Cache only static same-origin assets; never journal entries or third-party responses. New workers wait for old tabs to close to avoid losing unsaved drafts. Verify install, reload, offline navigation and save/read-back on the built output, not Metro alone.
- Regression gate: root typecheck, web tests/build/lint, Expo web export and iOS/Android JS exports. A JS export is not a device test or signed native build. Record unverified native behavior and feature-parity gaps in `docs/MONOREPO-AUDIT.md`.
- Calendar edits require DST, first/last day, cross-year occurrence, invalid override and unknown-year tests. Approximate dates must not be represented as moon-sighting decisions.
