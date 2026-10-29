## ADDED Requirements

### Requirement: API reports errors as JSON
The system SHALL return error responses of the REST API as JSON documents.

#### Scenario: Request fails
- **WHEN** an API request fails with a server error
- **THEN** the response body is a JSON document describing the error
