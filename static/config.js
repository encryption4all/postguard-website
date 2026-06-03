// Runtime configuration — overridden by Terraform ConfigMap in deployed environments.
// Values here are defaults for local development.
window.APP_CONFIG = {
  FF_BUSINESS: true,
  BUSINESS_URL: 'https://business.staging.postguard.eu',
  // Set to true to simulate the staging/dev environment locally: instead
  // of relying on cryptify to send a real notification email, the website
  // pops up a preview of what the email would have looked like.
  STAGING: false,
};
