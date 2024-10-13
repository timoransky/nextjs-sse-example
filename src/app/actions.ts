"use server";

import { SseStore } from "@/stores/sse.store";

export async function claimItem(itemId: number, userId: string | null) {
  // This just simulates some kind of API call to where the data are stored
  SseStore.claimItem(itemId, userId);

  // Notify all listeners that the data has changed
  SseStore.notifyListeners();
}
