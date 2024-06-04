from rest_framework.decorators import api_view
from rest_framework.response import Response
from botbuilder.core import TurnContext, BotFrameworkAdapter, BotFrameworkAdapterSettings
from botbuilder.schema import Activity
from .bot import MyBot
import asyncio

adapter_settings = BotFrameworkAdapterSettings("MicrosoftAppId", "MicrosoftAppPassword")
adapter = BotFrameworkAdapter(adapter_settings)
bot = MyBot()

@api_view(['POST'])
def messages(request):
    activity = Activity.deserialize(request.data)
    auth_header = request.META.get("HTTP_AUTHORIZATION", "")

    async def call_bot(turn_context):
        await bot.on_turn(turn_context)

    loop = asyncio.get_event_loop()
    task = loop.create_task(adapter.process_activity(activity, auth_header, call_bot))
    loop.run_until_complete(task)
    
    return Response(status=201)
