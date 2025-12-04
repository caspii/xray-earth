<!--
═══════════════════════════════════════════════════════════════════════════════
SYNC IMPACT REPORT
═══════════════════════════════════════════════════════════════════════════════
Version Change: [none] → 1.0.0 (Initial ratification)
Modified Principles: N/A (new constitution - initial creation)
Added Sections:
  - Core Principles (7 principles: Native Performance First, Device Orientation as Primary Interface, Cross-Platform Parity, Offline-First Architecture, Minimal Dependencies, Permission Transparency, Data Persistence with AsyncStorage)
  - Testing & Quality (Testing Requirements, Quality Gates)
  - Development Workflow (Feature Development Process, Code Organization)
  - Governance (Amendment Process, Versioning Policy, Compliance Review)
Removed Sections: None
Templates Requiring Updates:
  ✅ .specify/templates/plan-template.md - Added Constitution Check section with X-ray Earth principles
  ✅ .specify/templates/spec-template.md - Added mobile app edge case considerations
  ✅ .specify/templates/tasks-template.md - Added mobile-specific performance & testing tasks
  ✅ .claude/commands/*.md - Verified agent-agnostic language (already compliant)
  ✅ README.md - Reviewed, already aligns with constitution principles
  ✅ SPEC.md - Reviewed, already aligns with constitution principles
Follow-up TODOs: None
═══════════════════════════════════════════════════════════════════════════════
-->

# X-ray Earth Constitution

## Core Principles

### I. Native Performance First

Every feature MUST maintain 60 FPS minimum on target devices (iPhone 12+, Pixel 5+). Sensor latency MUST remain under 16ms. Battery drain MUST stay under 5% per 10 minutes of active use. Memory usage MUST remain under 150MB.

**Rationale**: The app's core value proposition is real-time device orientation tracking with native-quality responsiveness. Performance degradation directly undermines the user experience and the "wow factor" that differentiates this app.

**Enforcement**: Performance profiling is mandatory for all features touching 3D rendering, sensor integration, or frame-by-frame updates. Features failing performance gates cannot merge.

### II. Device Orientation as Primary Interface

Physical device movement (tilt, rotation, compass) is the primary interaction model. Touch interactions are secondary and limited to configuration, selection, and auxiliary controls.

**Rationale**: The app's unique value is "seeing through" the Earth by pointing your device. Touch-based navigation would reduce the immersive experience and contradict the core concept.

**Enforcement**: All primary navigation and exploration features MUST use device orientation. Touch gestures are permitted only for modal interactions (city selection, settings), zoom controls, and auxiliary features not central to the core experience.

### III. Cross-Platform Parity (NON-NEGOTIABLE)

iOS and Android MUST have feature parity, identical user experience, and equivalent performance. Single codebase using React Native and Expo. Platform-specific code limited to unavoidable native API differences.

**Rationale**: X-ray Earth targets both major mobile platforms from day one. Maintaining separate codebases or allowing platform drift would increase development cost and fragment the user experience.

**Enforcement**: All features MUST be tested on both iOS and Android physical devices before merge. Platform-specific implementations require explicit justification and approval. Feature flags for platform-specific behavior are prohibited except for system-level differences (permissions, sensor APIs).

### IV. Offline-First Architecture

The app MUST function fully offline after initial installation. No network connectivity required for core functionality (3D Earth visualization, orientation tracking, landmark display).

**Rationale**: The app relies on device sensors and local data. Network dependencies would create poor user experience in areas with weak connectivity and add unnecessary complexity.

**Enforcement**: Network requests are prohibited for core features. Optional network features (future: real-time data, social sharing) must gracefully degrade when offline. All landmark data and assets must be bundled with the app.

### V. Minimal Dependencies

Limit external dependencies to Expo SDK, Three.js, and React Native core. New dependencies require justification demonstrating no viable in-house alternative.

**Rationale**: Mobile apps with large dependency trees suffer from increased bundle size, build failures, version conflicts, and security vulnerabilities. Performance and reliability trump convenience.

**Enforcement**: Dependency additions require approval and must document: why needed, bundle size impact, maintenance status, security audit status, and why building in-house is insufficient.

### VI. Permission Transparency

Location and motion sensor permissions MUST be requested with clear, honest explanations. App MUST function gracefully when permissions denied (degraded mode or helpful error messages).

**Rationale**: User trust and App Store/Play Store compliance require transparent permission handling. Users must understand why permissions are needed and have agency over their data.

**Enforcement**: Permission requests must include human-readable descriptions in Info.plist (iOS) and AndroidManifest.xml (Android). All permission-gated features must handle denial gracefully without crashing or blocking core functionality unnecessarily.

### VII. Data Persistence with AsyncStorage

User location preferences (city selection, manual coordinates) MUST persist across app sessions using React Native AsyncStorage. Persistence layer must remain simple, local, and synchronous.

**Rationale**: Users expect their selected location to persist. AsyncStorage is React Native's standard local storage mechanism—lightweight, cross-platform, and sufficient for key-value data.

**Enforcement**: AsyncStorage is the only permitted local persistence mechanism. Database engines (SQLite, Realm) are prohibited unless explicitly justified for scale requirements beyond current scope. Storage operations must be wrapped in error handling and provide fallback behavior.

## Testing & Quality

### Testing Requirements

**Manual Testing Mandatory**: All features MUST be tested on physical iOS and Android devices. Simulator/emulator testing is insufficient for sensor-dependent features.

**Performance Testing Required**: Features touching rendering, sensors, or frame updates MUST include FPS monitoring, memory profiling, and battery impact measurement.

**Automated Testing Optional**: Unit tests for coordinate calculations, distance formulas, and validation logic are encouraged but not mandatory. Integration tests for permission flows are encouraged.

**Rationale**: The app's value depends on real device sensors and native performance. Simulators cannot replicate gyroscope, magnetometer, or GPS behavior accurately. Automated testing has limited value for sensor-driven 3D apps where subjective user experience is paramount.

### Quality Gates

- 60 FPS minimum on target devices (mandatory)
- <16ms sensor latency (mandatory)
- <150MB memory usage (mandatory)
- <5% battery drain per 10 minutes (mandatory)
- No crashes during 30-minute continuous use (mandatory)
- Smooth orientation tracking without lag or jitter (subjective, tested manually)

## Development Workflow

### Feature Development Process

1. **Specification**: Define feature requirements with user scenarios and success criteria
2. **Performance Impact Assessment**: Estimate impact on FPS, memory, battery, sensor latency
3. **Implementation**: Build feature incrementally with frequent device testing
4. **Performance Validation**: Profile on physical devices to verify no regressions
5. **Cross-Platform Testing**: Verify identical behavior and performance on iOS and Android
6. **User Acceptance**: Test with real users to validate subjective experience quality

### Code Organization

- **Single Codebase**: All code in single React Native project at repository root
- **Component Structure**: `src/components/`, `src/hooks/`, `src/utils/`, `src/constants/`, `src/contexts/`
- **Platform-Specific Code**: Minimize and isolate in platform-specific files (.ios.js, .android.js) only when unavoidable
- **No Premature Abstraction**: Keep code simple and direct. Abstractions must serve proven needs, not hypothetical futures.

## Governance

### Amendment Process

1. Identify principle in conflict or missing principle needed
2. Document rationale for change with concrete examples
3. Assess impact on existing features and development workflow
4. Propose updated constitution text
5. Update version number per semantic versioning (see below)
6. Update constitution.md with new content
7. Propagate changes to dependent templates and documentation
8. Commit with descriptive message (e.g., "docs: amend constitution to v2.0.0 (add AR mode principle)")

### Versioning Policy

- **MAJOR** (X.0.0): Backward-incompatible principle removals or redefinitions that invalidate existing features
- **MINOR** (0.X.0): New principle added or materially expanded guidance that affects future development
- **PATCH** (0.0.X): Clarifications, wording improvements, typo fixes, non-semantic refinements

### Compliance Review

All feature specifications, implementation plans, and code reviews MUST verify compliance with this constitution. Violations require explicit justification and approval. Complexity that contradicts principles (e.g., adding network dependencies for core features, sacrificing performance for convenience) must demonstrate why the principle is insufficient for the use case.

**Constitution Supersedes**: This constitution supersedes all other practices, preferences, or conventions. When in conflict, the constitution wins.

**Version**: 1.0.0 | **Ratified**: 2025-12-04 | **Last Amended**: 2025-12-04
