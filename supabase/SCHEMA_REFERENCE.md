# Schema reference – backend tables and columns

This list matches `supabase/schema_full.sql` and the app’s usage. Keep in sync when adding fields.

## Enums

- **user_role**: `admin`, `sales_rep`, `operations`
- **lead_status**: `new_lead`, `contacted`, `meeting_scheduled`, `pitch_delivered`, `sprint_offered`, `sprint_started`, `sprint_completed`, `subscription_closed`, `lost`
- **activity_type**: `visit`, `meeting`, `note`, `stage_change`
- **plan_type**: `micro`, `small`, `growth`, `enterprise`
- **contract_type**: `monthly`, `quarterly`, `half_year`, `yearly`

## Tables (all `public`)

### profiles
| Column       | Type      | Notes                          |
|-------------|-----------|--------------------------------|
| id          | UUID      | PK, FK → auth.users            |
| email       | TEXT      |                                |
| full_name   | TEXT      |                                |
| role        | user_role | NOT NULL, default `sales_rep`  |
| created_at  | TIMESTAMPTZ | NOT NULL                     |
| updated_at  | TIMESTAMPTZ | NOT NULL                     |

### leads
| Column              | Type       | Notes                          |
|---------------------|------------|--------------------------------|
| id                  | UUID       | PK, default uuid_generate_v4()  |
| clinic_name         | TEXT       | NOT NULL                       |
| doctor_name         | TEXT       | NOT NULL                       |
| specialization      | TEXT       | default ''                     |
| phone               | TEXT       | NOT NULL default ''            |
| address             | TEXT       | NOT NULL default ''            |
| area                | TEXT       | NOT NULL default ''            |
| city                | TEXT       | NOT NULL default ''            |
| monthly_appointments| INT        | nullable                       |
| branch_count        | INT        | NOT NULL default 1             |
| lead_source         | TEXT       | NOT NULL default ''            |
| lead_status         | lead_status| NOT NULL default `new_lead`    |
| assigned_rep_id     | UUID       | FK → profiles, nullable        |
| next_follow_up      | DATE       | nullable                       |
| created_at          | TIMESTAMPTZ| NOT NULL                       |
| updated_at          | TIMESTAMPTZ| NOT NULL                       |

### lead_activities
| Column   | Type        | Notes                |
|----------|-------------|----------------------|
| id       | UUID        | PK                   |
| lead_id  | UUID        | NOT NULL, FK → leads |
| type     | activity_type | NOT NULL           |
| content  | TEXT        | nullable             |
| rep_id   | UUID        | NOT NULL, FK → profiles |
| metadata | JSONB       | nullable             |
| created_at | TIMESTAMPTZ | NOT NULL          |

### sprints
| Column                    | Type       | Notes                |
|---------------------------|------------|----------------------|
| id                        | UUID       | PK                   |
| lead_id                   | UUID       | NOT NULL, FK → leads |
| start_date                | DATE       | NOT NULL             |
| end_date                  | DATE       | NOT NULL             |
| status                    | TEXT       | NOT NULL default 'active' |
| appointment_confirmations | INT        | nullable             |
| calls_handled             | INT        | nullable             |
| rescheduled               | INT        | nullable             |
| feedback                  | TEXT       | nullable             |
| created_at                | TIMESTAMPTZ| NOT NULL             |
| updated_at                | TIMESTAMPTZ| NOT NULL             |

### subscriptions
| Column             | Type         | Notes                |
|--------------------|--------------|----------------------|
| id                 | UUID         | PK                   |
| lead_id            | UUID         | NOT NULL, FK → leads |
| plan_type          | plan_type    | NOT NULL             |
| contract_type     | contract_type| NOT NULL             |
| start_date        | DATE         | NOT NULL             |
| renewal_date      | DATE         | NOT NULL             |
| minutes_allocation| INT          | nullable             |
| branch_count      | INT          | NOT NULL default 1   |
| created_at        | TIMESTAMPTZ  | NOT NULL             |
| updated_at        | TIMESTAMPTZ  | NOT NULL             |

### daily_activities
| Column              | Type       | Notes                |
|---------------------|------------|----------------------|
| id                  | UUID       | PK                   |
| rep_id              | UUID       | NOT NULL, FK → profiles |
| date                | DATE       | NOT NULL             |
| clinic_visits       | INT        | NOT NULL default 0   |
| doctor_meetings     | INT        | NOT NULL default 0   |
| pitches_delivered   | INT        | NOT NULL default 0   |
| sprints_sold        | INT        | NOT NULL default 0   |
| subscriptions_closed| INT        | NOT NULL default 0   |
| created_at          | TIMESTAMPTZ| NOT NULL             |
| updated_at          | TIMESTAMPTZ| NOT NULL             |
| UNIQUE(rep_id, date)|            |                      |

### gamification_events
| Column     | Type       | Notes                |
|------------|------------|----------------------|
| id         | UUID       | PK                   |
| rep_id     | UUID       | NOT NULL, FK → profiles |
| action_type| TEXT       | NOT NULL             |
| points     | INT        | NOT NULL             |
| lead_id    | UUID       | nullable, FK → leads |
| created_at | TIMESTAMPTZ| NOT NULL             |

### notifications
| Column    | Type       | Notes                |
|-----------|------------|----------------------|
| id        | UUID       | PK                   |
| user_id   | UUID       | NOT NULL, FK → profiles |
| title     | TEXT       | NOT NULL             |
| body      | TEXT       | nullable             |
| read      | BOOLEAN    | NOT NULL default false |
| created_at| TIMESTAMPTZ| NOT NULL             |

## App ↔ schema mapping

- **types/database.ts** – TypeScript types for these tables; keep in sync when adding columns.
- **app/actions/*.ts** – Server actions that insert/update/select; use the column names above.
- **supabase/schema_full.sql** – Single source of truth for DDL; run in Supabase SQL Editor to create or fix schema.
