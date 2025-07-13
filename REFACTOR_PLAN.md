# Codebase Refactoring Plan

## Phase 1: Fix Core Pricing Issues ✓
- [x] Remove USD conversion from variant pricing
- [x] Implement proper INR-based calculations
- [x] Fix iPhone 12 128GB pricing (₹13,800 = 60% of ₹23,000)

## Phase 2: Fix Admin Panel (IN PROGRESS)
### Order Management System
- [ ] Implement proper order action controls (complete, reject, reschedule, reset)
- [ ] Fix scoring system for condition assessment
- [ ] Add real-time order status updates
- [ ] Implement order search and filtering

### Variant Management
- [ ] Fix variant-based pricing in admin
- [ ] Implement bulk variant updates
- [ ] Add variant availability management

### Data Integration
- [ ] Remove all mock data
- [ ] Connect to real database APIs
- [ ] Fix query patterns and error handling

## Phase 3: Improve Customer Frontend
### Trust Building Elements
- [ ] Add security badges and certifications
- [ ] Implement customer reviews/testimonials
- [ ] Add transparent pricing breakdown
- [ ] Implement pickup scheduling

### User Experience
- [ ] Improve navigation flow
- [ ] Add progress indicators
- [ ] Implement form validation
- [ ] Add loading states

## Phase 4: Code Organization
### Modular Structure
- [ ] Consolidate duplicate components
- [ ] Create shared utilities
- [ ] Implement consistent API patterns
- [ ] Add proper error handling

### Database Schema
- [ ] Optimize buyback request structure
- [ ] Add order action history
- [ ] Implement proper status transitions

## Phase 5: Testing & Validation
- [ ] Test complete customer journey
- [ ] Validate admin workflows
- [ ] Check pricing calculations
- [ ] Verify data integrity

## Key Priorities:
1. Fix variant pricing calculations
2. Implement complete order management
3. Add trust-building elements
4. Ensure smooth admin operations