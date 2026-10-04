"""Policy and loop tests: no model key or running Maya required."""

import json, tempfile, unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch
from agent import AgentHost, agent_loop, RESERVE_TOOL


class FakeMaya:
    base_url = "http://example.invalid"
    tools = {"world_get_time": {"name": "world_get_time"}}

    def __init__(self):
        self.writes = []
        self.price = 100
        self.booking_surcharge = 0
        self.refundable = True
        self.booking = None
        self.searches = 0

    async def read(self, name, args):
        if name == "world_get_time":
            return {"maya_time": "2030-03-04 09:00:00"}
        if name == "hotels_search_availability":
            self.searches += 1
            return [
                {
                    "room_type_id": "MLG-DBL",
                    "refundable": self.refundable,
                    "total_price": {"amount": self.price},
                }
            ]
        raise AssertionError(name)

    async def invoke(self, domain, name, args):
        if name == "hotels_list_bookings":
            return [self.booking] if self.booking else []
        self.writes.append(name)
        if name == "hotels_book_room":
            self.booking = args | {
                "booking_reference": "DEMO01",
                "status": "CONFIRMED",
                "total_price": {"amount": self.price + self.booking_surcharge},
                "guest_name": "Alex Learner",
                "guests": 2,
            }
            return self.booking
        if name == "hotels_cancel_booking":
            return {"refund": {"amount": self.price}, "status": "CANCELLED"}
        raise AssertionError(name)


class PolicyTests(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.maya = FakeMaya()
        self.args = SimpleNamespace(
            journal=str(Path(self.tmp.name) / "journal.json"),
            guest_name="Alex Learner",
            guests=2,
            contact_email="learner@example.invalid",
            budget=200,
            allow_bookings=True,
        )
        self.request = {
            "room_type_id": "MLG-DBL",
            "check_in": "2030-03-18",
            "check_out": "2030-03-20",
        }
        self.host = AgentHost(self.maya, self.args)

    async def test_read_only_denies_booking(self):
        self.args.allow_bookings = False
        self.assertEqual(
            (await self.host.reserve(self.request))["error"]["code"],
            "booking_not_authorized",
        )
        self.assertFalse(self.maya.writes)

    async def test_forbidden_direct_tool_never_dispatched(self):
        for name in ["world_advance_time", "hotels_reset_bookings", "hotels_book_room"]:
            self.assertEqual(
                (await self.host.dispatch(name, {}))["error"]["code"],
                "tool_not_allowed",
            )
        self.assertFalse(self.maya.writes)

    async def test_budget_rejects_before_write(self):
        self.maya.price = 201
        self.assertEqual(
            (await self.host.reserve(self.request))["error"]["code"], "budget_exceeded"
        )
        self.assertFalse(self.maya.writes)

    async def test_nonrefundable_rejects_before_write(self):
        self.maya.refundable = False
        self.assertEqual(
            (await self.host.reserve(self.request))["error"]["code"], "policy_denied"
        )
        self.assertFalse(self.maya.writes)

    async def test_exact_request_is_not_booked_twice(self):
        first = await self.host.reserve(self.request)
        second = await self.host.reserve(self.request)
        self.assertEqual(first, second)
        self.assertEqual(self.maya.writes.count("hotels_book_room"), 1)

    async def test_pending_confirmation_is_reconciled(self):
        await self.host.reserve(self.request)
        op = next(iter(self.host.journal["operations"].values()))
        op.update(state="PENDING", result=None)
        self.host.save()
        restored = AgentHost(self.maya, self.args)
        self.assertEqual(
            (await restored.reserve(self.request))["booking_reference"], "DEMO01"
        )
        self.assertEqual(self.maya.writes.count("hotels_book_room"), 1)

    async def test_pending_without_match_never_retries_write(self):
        key = json.dumps(self.request, sort_keys=True)
        self.host.journal["operations"][key] = {
            "state": "PENDING",
            "arguments": self.request,
        }
        with self.assertRaises(RuntimeError):
            await self.host.reserve(self.request)
        self.assertFalse(self.maya.writes)

    async def test_aggregate_budget(self):
        self.maya.price = 150
        await self.host.reserve(self.request)
        another = self.request | {"check_in": "2030-03-21", "check_out": "2030-03-23"}
        self.assertEqual(
            (await self.host.reserve(another))["error"]["code"], "budget_exceeded"
        )
        self.assertEqual(len(self.maya.writes), 1)

    async def test_identity_change_is_rejected(self):
        await self.host.reserve(self.request)
        self.args.contact_email = "another@example.invalid"
        with self.assertRaises(ValueError):
            AgentHost(self.maya, self.args)

    async def test_malformed_arguments_do_not_write(self):
        for request in [
            self.request | {"guests": 99},
            self.request | {"check_in": None},
            self.request | {"check_out": "2030-03-17"},
        ]:
            self.assertIn("error", await self.host.reserve(request))
        self.assertFalse(self.maya.writes)

    async def test_responses_loop_returns_tool_result_to_model(self):
        calls = []

        class FakeResponses:
            async def create(inner, **kwargs):
                calls.append(kwargs)
                if len(calls) == 1:
                    return SimpleNamespace(
                        output=[
                            SimpleNamespace(
                                type="function_call",
                                name="world_get_time",
                                arguments="{}",
                                call_id="call_1",
                            )
                        ],
                        output_text="",
                    )
                self.assertEqual(kwargs["input"][-1]["call_id"], "call_1")
                self.assertIn("maya_time", json.loads(kwargs["input"][-1]["output"]))
                self.assertFalse(kwargs["parallel_tool_calls"])
                return SimpleNamespace(output=[], output_text="Maya time read.")

        class FakeClient:
            responses = FakeResponses()

            async def __aenter__(inner):
                return inner

            async def __aexit__(inner, *args):
                pass

        with patch("openai.AsyncOpenAI", return_value=FakeClient()):
            self.assertEqual(
                await agent_loop(self.host, "test-model", "Read Maya time"),
                "Maya time read.",
            )

    async def test_confirmation_price_drift_is_cancelled(self):
        self.maya.booking_surcharge = 150
        self.assertEqual(
            (await self.host.reserve(self.request))["error"]["code"], "price_changed"
        )
        self.assertEqual(
            self.maya.writes, ["hotels_book_room", "hotels_cancel_booking"]
        )
        self.assertEqual(
            next(iter(self.host.journal["operations"].values()))["state"], "CANCELLED"
        )

    async def test_real_sdk_serializes_tool_round_trip(self):
        import httpx
        from openai import AsyncOpenAI

        received = []

        def respond(request):
            body = json.loads(request.content)
            received.append(body)
            if len(received) == 1:
                output = [
                    {
                        "type": "function_call",
                        "id": "fc_1",
                        "call_id": "call_1",
                        "name": "world_get_time",
                        "arguments": "{}",
                        "status": "completed",
                    }
                ]
            else:
                self.assertEqual(body["input"][-1]["type"], "function_call_output")
                self.assertIn("maya_time", json.loads(body["input"][-1]["output"]))
                output = [
                    {
                        "type": "message",
                        "id": "msg_1",
                        "role": "assistant",
                        "status": "completed",
                        "content": [
                            {
                                "type": "output_text",
                                "text": "Maya time read.",
                                "annotations": [],
                            }
                        ],
                    }
                ]
            return httpx.Response(
                200,
                json={
                    "id": f"resp_{len(received)}",
                    "object": "response",
                    "created_at": 0,
                    "status": "completed",
                    "model": "test-model",
                    "output": output,
                },
            )

        client = AsyncOpenAI(
            api_key="test-key-not-a-real-credential",
            http_client=httpx.AsyncClient(transport=httpx.MockTransport(respond)),
        )
        with patch("openai.AsyncOpenAI", return_value=client):
            self.assertEqual(
                await agent_loop(self.host, "test-model", "Read Maya time"),
                "Maya time read.",
            )
        self.assertEqual(len(received), 2)


if __name__ == "__main__":
    unittest.main()
