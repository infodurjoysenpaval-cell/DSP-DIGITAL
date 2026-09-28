# Security Specification

## 1. Data Invariants
1. Products can be read by any public visitor so store shoppers can browse digital licenses and products.
2. Product additions, modifications, and deletions can only be performed by authenticated users or authorized admins.
3. A user profile document can only be written or updated by the matching user or an administrator.
4. An affiliate application can be created by the applicant user, read by the user or store admin, and status updates or deletions can be performed by the admin.
5. All document IDs must conform to alphanumeric characters and safe punctuation (`^[a-zA-Z0-9_\\-]+$`).

## 2. The Dirty Dozen Payloads
1. **Malicious ID Injection**: A payload containing a 10KB string document ID designed to cause memory poisoning.
2. **Ghost Field Escalation**: Injecting `role: "admin"` into a customer registration payload.
3. **Price Manipulation**: Injecting `salePrice: -500` or non-numeric types into a product write.
4. **Unauthorized Affiliate Approval**: A regular user attempting to set `status: "approved"` on their own affiliate record.
5. **Unauthorized Product Deletion**: An unauthenticated actor attempting to delete `/products/{productId}`.
6. **User Impersonation**: Attempting to create or modify `/users/{userId}` where `userId != request.auth.uid`.
7. **Cross-Tenant Document Read**: Attempting to read another user's private account data.
8. **Malicious Image Overflow**: Injecting multi-megabyte binary bloat into a text field.
9. **Fake Email Verification**: Spoofing `emailVerified: true` without Google authentication.
10. **Orphaned Payout Modification**: Tampering with `availableBalance` or `totalEarned` directly from client.
11. **Status Tampering**: Altering restricted vendor access states without admin privilege.
12. **Malformed Schema Injection**: Submitting an object where required fields like `name` or `salePrice` are omitted.
