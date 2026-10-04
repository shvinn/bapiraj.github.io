# A learning agent for Maya

The accompanying article walks through this starter. Maya runs separately and exposes five domain MCP endpoints. The starter uses the OpenAI Responses API to select tools; the Python host enforces an explicit allowlist, an opt-in hotel booking capability, a hotel-only budget and a reservation journal.

## Setup

Use Python 3.10+ and uv. Start Maya from the latest `main` as described in the article, then:

```sh
uv venv .venv
uv pip install --python .venv/bin/python -r requirements.txt
.venv/bin/python agent.py --smoke
.venv/bin/python -m unittest -v test_agent.py
```

On Windows, substitute `.venv\Scripts\python.exe` for `.venv/bin/python`.

For a model-driven run, set `OPENAI_API_KEY` and `OPENAI_MODEL` to a function-calling model available to your account. API usage is billed by your provider. Never place a real API key in these files or your Git repository.

```sh
.venv/bin/python agent.py --task "Find a refundable hotel for two people in Aira, with check-in 14 days from now and check-out two days later. Do not book."
```

To permit hotel booking:

```sh
.venv/bin/python agent.py \
  --allow-bookings --budget 250 --guests 2 \
  --guest-name "Alex Learner" \
  --contact-email "maya-learner@example.invalid" \
  --journal hotel-reservation.json \
  --task "Book the cheapest refundable hotel for two people in Aira, for two nights starting 14 days from now, within the hotel budget. If none fits, do not book."
```

A journal belongs to one Maya URL, contact identity, party and hotel budget. Keep it for retries. Use a dedicated dummy contact per experiment. A PENDING reservation is reconciled with Maya before any further write; zero or ambiguous matches stop for inspection. Do not delete a pending journal to force a retry.

The budget covers hotel bookings only. Flights, cars, delivery and event tools are exposed for reads; their write tools are deliberately absent. This is a one-shot CLI, not an unattended scheduler or a complete production concierge. Run only one writer per journal; external cancellations and concurrent writers need additional coordination. Even refundable rooms have deadlines, and Maya has no cross-domain atomic transaction.

## Live integration check

```sh
.venv/bin/python smoke_test.py
```

This performs a real refundable booking under a unique dummy contact, checks budget rejection, duplicate prevention and lost-response reconciliation, then cancels that booking. It does not reset shared inventory. Use a disposable Maya database when learning.

## Verification scope

The MCP transport, host policy and recovery behavior were tested against Maya revision `c85e0ee13bd55fcec2551a011590669db2cd4190`. The model loop has a mocked response-sequence test. A paid, live model run was not performed while preparing the article; it requires your own API credentials and model access.
