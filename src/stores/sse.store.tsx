import { Todo } from "@/types/todo";

class SseStore {
  private static instance: SseStore | null = null;
  private items: Todo[] = [];
  private listeners: Set<(items: Todo[]) => void> = new Set();

  private constructor() {
    this.fetchItems();
  }

  public static getInstance(): SseStore {
    if (!SseStore.instance) {
      SseStore.instance = new SseStore();
    }
    return SseStore.instance;
  }

  async fetchItems() {
    const todos = (await (await fetch("https://dummyjson.com/todos")).json())
      .todos;

    this.items = todos.map((todo: Todo) => ({
      ...todo,
      userId: null,
    }));

    this.notifyListeners();
  }

  getItems() {
    return this.items;
  }

  claimItem(itemId: number, userId: string | null) {
    const item = this.items.find((item) => item.id === itemId);

    if (!item) {
      return;
    }

    item.userId = userId;
  }

  addListener(listener: (items: Todo[]) => void) {
    this.listeners.add(listener);
  }

  removeListener(listener: (items: Todo[]) => void) {
    this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach((listener) => listener(this.items));
  }
}

// Use globalThis to ensure the instance persists across module reloads
const globalSseStore =
  (globalThis as { SseStore?: SseStore }).SseStore || SseStore.getInstance();
(globalThis as { SseStore?: SseStore }).SseStore = globalSseStore;

export { globalSseStore as SseStore };
