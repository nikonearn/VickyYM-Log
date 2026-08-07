---
name: Credential visibility
description: Security boundary for product stock credentials in the marketplace
---

Stock credentials are sensitive inventory data. Keep them out of public product responses and expose them only through an authenticated admin endpoint used by the product editor.

**Why:** Buyers and unauthenticated storefront visitors should be able to see product availability without receiving unsold credentials; the admin editor still needs the saved values to support reliable editing and removal.

**How to apply:** When adding product inventory features, keep the public product serializer credential-free and use the admin-only response for inventory management.