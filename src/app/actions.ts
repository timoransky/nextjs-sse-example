"use server";

import { SseStore } from "@/stores/sse.store";

export async function claimItem(itemId: number, userId: string) {
  SseStore.claimItem(itemId, userId);

  SseStore.notifyListeners();
}

export async function unclaimItem(itemId: number) {
  SseStore.claimItem(itemId, null);

  SseStore.notifyListeners();
}
