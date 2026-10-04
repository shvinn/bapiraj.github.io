"""Live MCP integration check using dummy identities. No model key needed."""

import argparse, asyncio, json, tempfile, uuid
from datetime import datetime, timedelta
from pathlib import Path
from types import SimpleNamespace
from agent import MayaClient, AgentHost, rows


async def main(url):
    maya = MayaClient(url)
    await maya.discover()
    assert not any("reset" in name for name in maya.tools)
    assert "world_advance_time" not in maya.tools
    clock = await maya.read("world_get_time", {})
    now = datetime.fromisoformat(clock["maya_time"])
    day = now.date() + timedelta(days=14)
    req = {
        "check_in": day.isoformat(),
        "check_out": (day + timedelta(days=2)).isoformat(),
    }
    matches = rows(
        await maya.read("hotels_search_availability", req | {"guests": 2, "limit": 100})
    )
    quote = next(q for q in matches if q["refundable"])
    req["room_type_id"] = quote["room_type_id"]
    with tempfile.TemporaryDirectory(prefix="maya-starter-check-") as tmp:
        args = SimpleNamespace(
            journal=str(Path(tmp) / "journal.json"),
            guest_name="Alex Learner",
            guests=2,
            contact_email=f"check-{uuid.uuid4().hex}@example.invalid",
            budget=1,
            allow_bookings=True,
        )
        host = AgentHost(maya, args)
        assert (await host.reserve(req))["error"]["code"] == "budget_exceeded"
        assert not rows(
            await maya.invoke(
                "hotels", "hotels_list_bookings", {"email": args.contact_email}
            )
        )
        args.budget = 10000
        host = AgentHost(maya, args)
        confirmation = await host.reserve(req)
        assert "error" not in confirmation, confirmation
        try:
            assert (await host.reserve(req))["booking_reference"] == confirmation[
                "booking_reference"
            ]
            op = next(iter(host.journal["operations"].values()))
            op.update(state="PENDING", result=None)
            host.save()
            restored = AgentHost(maya, args)
            assert (await restored.reserve(req))["booking_reference"] == confirmation[
                "booking_reference"
            ]
            assert (
                len(
                    rows(
                        await maya.invoke(
                            "hotels",
                            "hotels_list_bookings",
                            {"email": args.contact_email},
                        )
                    )
                )
                == 1
            )
            print(
                json.dumps(
                    {
                        "passed": True,
                        "read_tools": len(maya.tools),
                        "budget_rejection": True,
                        "duplicate_prevention": True,
                        "lost_response_reconciliation": True,
                        "maya_time": clock["maya_time"],
                    },
                    indent=2,
                )
            )
        finally:
            reply = await maya.invoke(
                "hotels",
                "hotels_cancel_booking",
                {"reference": confirmation["booking_reference"]},
            )
            assert "error" not in reply, reply


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--maya-url", default="http://127.0.0.1:6292")
    args = p.parse_args()
    asyncio.run(main(args.maya_url))
