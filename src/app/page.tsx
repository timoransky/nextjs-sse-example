"use client";

import { Todo } from "@/types/todo";
import { useEffect, useState } from "react";
import { claimItem, unclaimItem } from "./actions";

export default function Home() {
  if (!localStorage.getItem("userId")) {
    localStorage.setItem("userId", crypto.randomUUID());
  }

  const userId = localStorage.getItem("userId");

  const [itemsFromApi, setItemsFromApi] = useState<Todo[]>([]);

  useEffect(() => {
    const eventSource = new EventSource("/api/sse");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.items) {
        setItemsFromApi(data.items);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const claimTodo = (itemId: number) => {
    if (!userId) {
      return;
    }

    claimItem(itemId, userId);
  };

  const unclaimTodo = (itemId: number) => {
    if (!userId) {
      return;
    }

    unclaimItem(itemId);
  };

  return (
    <div className="max-w-lg mx-auto my-20">
      <ul role="list" className="divide-y divide-gray-100">
        {itemsFromApi.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center justify-between gap-x-6 py-5"
          >
            <div className="min-w-0">
              <div className="flex items-start gap-x-3">
                <p className="text-sm font-semibold leading-6 text-gray-900">
                  {todo.todo}
                </p>
              </div>
              <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                <p className="truncate">
                  Assigned to user with ID {todo.userId}
                </p>
              </div>
            </div>
            <div className="flex flex-none items-center gap-x-4">
              {!todo.userId && (
                <button
                  onClick={() => claimTodo(todo.id)}
                  className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
                >
                  Claim
                </button>
              )}

              {todo.userId === userId && (
                <button
                  onClick={() => unclaimTodo(todo.id)}
                  className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
                >
                  Unclaim
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
