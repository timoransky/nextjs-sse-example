import { SseStore } from "@/stores/sse.store";
import { Todo } from "@/types/todo";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
// This is required to enable streaming
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  function sendUpdate(data: { items: Todo[] }) {
    writer
      .write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      .catch((error) => {
        console.error("Error writing to stream:", error);
      });
  }

  const listener = (items: Todo[]) => {
    sendUpdate({
      items,
    });
  };

  SseStore.addListener(listener);

  sendUpdate({
    items: SseStore.getItems(),
  });

  // Handle connection close
  req.signal.addEventListener("abort", () => {
    SseStore.removeListener(listener);
    writer
      .close()
      .catch((error) => console.error("Error closing writer:", error));
  });

  // Return the SSE response
  return new Response(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
