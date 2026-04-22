# Member Application Schema Alignment (Backend)

## Goal

Align backend logic with the new schema split:

- MemberApplication (aggregate root)
- CVReview
- DepartmentInterview
- FinalReview
- MemberApplication.state (aggregate state)

## 1) Prisma and Database

- [ ] Run `npx prisma format`
- [ ] Run `npx prisma validate`
- [ ] Create migration for new fields/nullable changes:
  - [ ] `MemberApplication.state`
  - [ ] `CVReview.reviewerId` nullable
  - [ ] `FinalReview.reviewerId` nullable
  - [ ] indexes on `MemberApplication.state`
- [ ] Run migration in local and staging databases
- [ ] Verify generated SQL and rollback strategy

## 2) Domain Rules (Single Source of Truth)

- [ ] Keep detail truth in child tables (`CVReview`, `DepartmentInterview`, `FinalReview`)
- [ ] Use `MemberApplication.state` as aggregate/read model for listing/filtering
- [ ] Define deterministic state transitions in service layer

### Suggested state mapping

- SUBMITTED -> when application is created
- CV_PENDING -> when CV review process starts
- CV_PASSED -> when CVReview.status = PASSED
- CV_FAILED -> when CVReview.status = FAILED
- DEPARTMENT_INTERVIEWING -> when at least one department interview is in progress
- FINAL_PENDING -> when interview stage is complete and waiting final review
- APPROVED -> when FinalReview.status = PASSED
- REJECTED -> when FinalReview.status = FAILED or business rejection
- WITHDRAWN -> when candidate withdraws

## 3) Service Layer Refactor

- [ ] Replace old all-in-one member-application update logic with orchestrated transaction
- [ ] Implement use cases:
  - [ ] createMemberApplication
  - [ ] upsertCVReview
  - [ ] upsertDepartmentInterview
  - [ ] upsertFinalReview
  - [ ] recomputeAndPersistApplicationState
- [ ] Ensure all write paths call state recomputation in same DB transaction
- [ ] Add optimistic checks/guards for invalid transitions

## 4) API Contract (Aggregate-first)

- [ ] Keep one aggregate detail endpoint for FE simplicity
- [ ] Return payload shape that includes:
  - [ ] application base fields
  - [ ] `state`
  - [ ] `cvReview`
  - [ ] `departmentInterviews`
  - [ ] `finalReview`
- [ ] Update list endpoint to filter/sort by `state`
- [ ] Add dedicated action endpoints if needed:
  - [ ] `POST /member-applications/:id/cv-review`
  - [ ] `POST /member-applications/:id/department-interviews`
  - [ ] `POST /member-applications/:id/final-review`
  - [ ] `POST /member-applications/:id/withdraw`

## 5) Validation and Authorization

- [ ] Validate role-based access for each action:
  - [ ] CV reviewer roles
  - [ ] Interviewer roles
  - [ ] Final reviewer roles
- [ ] Validate required data by transition step
- [ ] Prevent duplicate records where unique constraints exist

## 6) Backward Compatibility

- [ ] If FE still consumes old fields, provide temporary response mapping
- [ ] Mark deprecated fields/endpoints with sunset date
- [ ] Add migration notes in release document

## 7) Tests (Backend)

- [ ] Unit tests for state recomputation
- [ ] Integration tests for full flow:
  - [ ] submit -> cv pass -> interview -> final pass
  - [ ] submit -> cv fail
  - [ ] submit -> withdraw
- [ ] API tests for permission failures and invalid transitions

## 8) Observability

- [ ] Add structured logs for each transition event
- [ ] Add audit trail fields/events for who changed what and when
- [ ] Add dashboard metrics per state (approved/rejected/withdrawn)

## 9) Done Criteria

- [ ] Prisma migration applied and verified
- [ ] All member application endpoints return schema-aligned payloads
- [ ] FE no longer depends on removed legacy fields
- [ ] Test suite passes for new workflow
