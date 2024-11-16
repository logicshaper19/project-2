import { authMiddleware } from "@clerk/nextjs";

// Define a list of superadmin email addresses
const SUPERADMIN_EMAILS = [
  'admin@dealfinder.ai',
  // Add other superadmin emails here
];

export default authMiddleware({
  publicRoutes: ["/", "/preferences"],
  afterAuth(auth, req, evt) {
    // Check if user is trying to access superadmin
    if (req.url.includes('/superadmin')) {
      // Only allow access if user's email is in the superadmin list
      if (!auth?.userId || !SUPERADMIN_EMAILS.includes(auth.user?.emailAddresses[0]?.emailAddress)) {
        return Response.redirect(new URL('/', req.url));
      }
    }
  },
});