## Requirements

### Requirement: Acronym dictionary

`humanizeLabel()` MUST apply a static dictionary mapping lowercase tokens to their canonical display form before falling back to simple capitalization.

Minimum required entries: `api→API`, `rest→REST`, `graphql→GraphQL`, `grpc→gRPC`, `openapi→OpenAPI`, `oauth→OAuth`, `oauth2→OAuth2`, `http→HTTP`, `https→HTTPS`, `url→URL`, `uri→URI`, `sdk→SDK`, `ui→UI`, `ux→UX`, `id→ID`, `db→DB`, `sql→SQL`, `css→CSS`, `html→HTML`, `json→JSON`, `yaml→YAML`, `xml→XML`, `jwt→JWT`, `ci→CI`, `cd→CD`.

#### Scenario: Known acronym is uppercased correctly
- **WHEN** `humanizeLabel('rest-api-docs')` is called
- **THEN** the result is `'REST API Docs'`

#### Scenario: openapi is recognized
- **WHEN** `humanizeLabel('openapi-v3-migration')` is called
- **THEN** the result contains `'OpenAPI'`

### Requirement: Version token detection

Tokens matching `/^v\d+$/` MUST be preserved in lowercase (e.g., `v3` stays `v3`, not `V3`).

#### Scenario: Version token stays lowercase
- **WHEN** `humanizeLabel('openapi-v3-migration')` is called
- **THEN** the result is `'OpenAPI v3 Migration'`

#### Scenario: Multi-digit version stays lowercase
- **WHEN** `humanizeLabel('schema-v10-upgrade')` is called
- **THEN** the result is `'Schema v10 Upgrade'`

### Requirement: Unknown tokens fall back to simple capitalization

Tokens not in the dictionary and not matching version pattern MUST have their first letter capitalized.

#### Scenario: Plain word is capitalized
- **WHEN** `humanizeLabel('user-onboarding-flow')` is called
- **THEN** the result is `'User Onboarding Flow'`
