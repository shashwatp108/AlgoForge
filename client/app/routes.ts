import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  // 1. The Landing Page (localhost:5173/)
  index("routes/_index.tsx"),

  // 2. The Editor Page (localhost:5173/editor)
  route("editor", "routes/editor.tsx"),

  // 3. The Profile Page (localhost:5173/profile)
  route("profile", "routes/profile.tsx"),

  // 4. The About Page (localhost:5173/about)
  route("about", "routes/about.tsx"),

  // 5. Google Auth Callback (Optional: if you want a dedicated loading page for auth)
  // route("auth/callback", "routes/auth_callback.tsx"),
] satisfies RouteConfig;