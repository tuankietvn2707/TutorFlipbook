# Firestore Security Specification (Phase 0)

## 1. Data Invariants
1. **Strict Ownership Isolation**: Every document under `/users/{userId}` and its subcollections (`books`, `pages`, `audioTracks`, `chunks`) belongs strictly to the authenticated, email-verified user whose `request.auth.uid == userId`.
2. **Relational Parent Integrity (Master Gate)**: Subcollection writes (`pages`, `audioTracks`, `chunks`) verify parent document existence and ownership (`get()` on parent `/users/{userId}/books/{bookId}` and `/audioTracks/{trackId}`).
3. **Immutable Identity & Creation Timestamps**: `uid`, `id`, `ownerId`, `bookId`, `trackId`, and `createdAt` cannot change after creation.
4. **Temporal Integrity**: `createdAt` must equal `request.time` on create; `updatedAt` must equal `request.time` on create and update.
5. **Path & Payload Bounds**: Every document ID matches `^[a-zA-Z0-9_-]+$` (`<= 128` chars) and every string/number conforms to strict `.size()` and range caps to prevent DoS / Denial-of-Wallet attacks.
6. **Zero Ghost Fields**: All creates validate exact required and allowed key sets (`hasAll` + `hasOnly`), and updates validate action-specific `affectedKeys().hasOnly(...)`.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated Read/Write**: Read or write `/users/u1/books/b1` with `request.auth == null`.
2. **Unverified Email Write**: Write `/users/u1/books/b1` with `request.auth.uid == "u1"` and `email_verified == false`.
3. **Cross-User Read (PII Leak)**: User `u2` reads `/users/u1` or `/users/u1/books/b1`.
4. **Cross-User List**: User `u2` queries `/users/u1/books` (`list` without matching `resource.data.ownerId == request.auth.uid`).
5. **Identity Spoofing on Create**: User `u1` creates `/users/u1/books/b1` with `ownerId: "u2"`.
6. **Ghost Field Injection (Shadow Update)**: User `u1` creates or updates `/users/u1` with extra key `isAdmin: true`.
7. **Immutable Field Mutation**: User `u1` updates `/users/u1/books/b1` changing `ownerId` or `createdAt`.
8. **Forged Timestamp**: User `u1` creates `/users/u1/books/b1` with client-supplied past timestamp instead of `request.time`.
9. **ID Poisoning**: User `u1` creates `/users/u1/books/bad..id$with%spaces` or 200-char ID.
10. **Oversized String / DoW Attack**: User `u1` writes `title` with 5,000 characters or `chunk` exceeding 700,000 bytes.
11. **Orphan Subcollection Write**: User `u1` creates `/users/u1/books/nonexistent/pages/p0` when parent book document does not exist.
12. **Type Poisoning on Update**: User `u1` updates `/users/u1/books/b1` setting `totalPages: "many"` (string instead of integer).
