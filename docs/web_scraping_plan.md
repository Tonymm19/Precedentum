# Court Rules & Judge Procedures Ingestion Plan

This plan outlines a separate workstream to scrape, normalize, and load court rules and judge procedure data into the Precedentum platform. The objectives are to remain compliant with website Terms of Service, build a maintainable ingestion pipeline, and deliver structured data that integrates back into the existing Django/React application.

---

## 1. Scope & Deliverables

1. Identify and document target data sources (district court websites, judge-specific pages, PDF standing orders).
2. Implement a legally compliant extraction process (respect robots.txt, rate limits, ToS).
3. Parse, normalize, and version scraped content (ETL pipeline).
4. Store results in a structured format consumable by the existing `court_rules` app (models: Judge, Rule, Procedure, Attachments).
5. Provide scheduling/automation (cron or Celery beat) for regular updates.
6. Supply monitoring, logging, and error handling.
7. Ship data back into the main repo via management commands or API endpoints.

---

## 2. Target Data Sources

| Priority | Source Type | Examples | Notes |
| --- | --- | --- | --- |
| P0 | US District Court official sites | `uscourts.gov`, district subdomains (e.g., `caed.uscourts.gov`) | Primary court rules, local rules PDFs. |
| P0 | Judge chambers pages | Individual judge standing orders/procedures | Often HTML/PDF; structure varies widely. |
| P1 | Calendars / scheduling notices | Court-specific calendars | May have separate ToS; optional for first pass. |

Action Items:
- Build a source catalogue spreadsheet capturing URLs, data types (HTML/PDF), update frequency, robots.txt allowances, and contact info.
- Note authentication or request headers required for each site.

---

## 3. Legal & Compliance Checklist

1. Review Terms of Service and robots.txt for each site. Document allowed scraping cadence.
2. Implement polite crawling: user-agent string, throttle requests (e.g., 1 request/sec), exponential backoff on errors.
3. Build an opt-out list for any sites that disallow automated access.
4. Provide a contact email in headers if ToS requires notification.
5. Keep an audit log of fetched URLs, timestamps, and status codes.

---

## 4. Technical Architecture

### 4.1 High-Level Flow

1. **Extractor (Collect)**: Python scripts (or Scrapy) fetch HTML/PDF content.
2. **Transformer (Parse & Normalize)**:
   - HTML parsing via BeautifulSoup / selectolax.
   - PDF text extraction (pdfplumber, PyPDF2, or OCR for scanned docs via Tesseract).
   - Standardize fields: court, judge, document type, last updated date, body content, attachments.
3. **Loader (Persist)**:
   - Generate JSON/CSV payloads compatible with `court_rules` Django models.
   - Option A: Save to S3/Blob storage + metadata DB.
   - Option B: Write directly into Postgres via Django ORM in dedicated ETL scripts.
4. **Notification & Monitoring**: Slack/email alerts on failures, summary reports after each run.

### 4.2 Repository Structure

Create a sibling package `ingestion/` within the repo (or separate repo for service) containing:

- `ingestion/collectors/` – per-source scrapers.
- `ingestion/parsers/` – HTML/PDF parsing utilities.
- `ingestion/pipelines/` – orchestrators combining collectors + parsers.
- `ingestion/storage/` – helpers to persist data (Django ORM clients, S3 clients).
- `ingestion/tests/` – unit/integration tests, fixture HTML/PDF samples.
- `ingestion/cli.py` – entrypoints (e.g., `python -m ingestion run --source=caed`).

Within the Django project, add:

- `court_rules/management/commands/import_rules.py` – loads normalized JSON into models.
- `court_rules/tasks.py` – Celery tasks to run imports on schedule.
- `core/logging.py` – extend with ingestion logging format.

---

## 5. Data Model Alignment

### Existing Models (from SPEC)
- `Judge`: name, court, chamber info.
- `Case`: references judge (already present).
- `Rule`: textual content, categories, effective dates.
- `Deadline`, `Reminder`, `AuditLog`: remain unchanged but will link to new rule metadata.

### Proposed Additions
- `Procedure` model: judge-specific procedural guidance (filing, standing orders).
- `DocumentAttachment` model: link to PDFs with metadata (title, url, checksum).
- `SourceSnapshot`: track raw payloads, fetch timestamp, checksum for rollback/re-diff.

### Integration Strategy
1. Ingestion pipeline writes normalized data to `ingestion/output/rules.json`.
2. Invoke `manage.py import_rules --input=ingestion/output/rules.json` to load into database.
3. On success, schedule `DataContext` frontend fetch to include new endpoints (e.g., `/api/v1/rules/` includes `procedure` and `attachments`).

---

## 6. Scheduling & Automation

- Use Celery beat or an external scheduler (e.g., GitHub Actions cron, Airflow) to run extracts nightly/weekly depending on court update frequency.
- Maintain a state table to track last successfully fetched version per source.
- Implement change detection (checksum comparison) to avoid unnecessary downstream updates.

---

## 7. Testing Strategy

1. **Unit Tests**: parser correctness against sample HTML/PDF fixtures.
2. **Integration Tests**: run full pipeline in CI against mock HTTP servers (e.g., `responses` or `vcr.py`).
3. **End-to-End Dry Run**: execute pipeline in sandbox environment, load into staging DB, verify frontend displays results.
4. **Performance Tests**: ensure scraping respects timeouts, handles large PDFs.

---

## 8. Operational Considerations

- **Logging**: structured logs with source, status, duration, number of records.
- **Alerting**: notify on repeated failures or large diffs in records.
- **Storage**: archive raw documents (S3 bucket) with versioning for traceability.
- **Security**: store credentials (if any) in AWS Secrets Manager/HashiCorp Vault; enforce HTTPS for data transit.
- **Documentation**: README within `ingestion/` describing how to add new sources.

---

## 9. Work Breakdown Structure

1. **Discovery & Compliance (3-5 days)**
   - Compile source inventory, confirm legal allowances, set up monitoring spreadsheet.
2. **Prototype Pipeline (5-7 days)**
   - Implement two representative scrapers (one HTML, one PDF).
   - Build parser + loader skeleton, deliver sample JSON output.
3. **ETL Framework Hardening (7-10 days)**
   - Add logging, retries, caching, storage abstractions, tests.
4. **Data Model Extensions (3-4 days)**
   - Add Django models, migrations, serializer updates, API endpoints.
5. **Integration & UI Enhancements (4-6 days)**
   - Update React views to surface new rule/procedure data.
   - Ensure new data accessible in deadline workflows.
6. **Automation & Ops (3-5 days)**
   - Configure scheduling, deploy pipeline workers, document runbooks.

Timeline assumes a dedicated engineer; adjust based on resources.

---

## 10. Integration Steps Back Into Main Codebase

1. Develop ingestion pipeline in feature branch or separate repo.
2. When stable, add ingestion package as a git submodule or Python package dependency.
3. Add import management command and API endpoints into main Django project.
4. Extend CI to run ingestion unit tests.
5. Document deployment steps for ingestion worker (Celery worker + beat schedule or external job).
6. Provide hand-off checklist to ensure operations team can monitor updates.

Following this plan keeps the scraping work isolated for independent development while ensuring the results plug back into the existing Precedentum architecture seamlessly.

