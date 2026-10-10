import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ChatInterface } from "../ChatInterface";
import { useChat } from "@/lib/contexts/chat-context";
import type { Message } from "ai";
import type { ChangeEvent, FormEvent, ReactNode } from "react";

vi.mock("@/lib/contexts/chat-context", () => ({
  useChat: vi.fn(),
}));

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className} data-radix-scroll-area-viewport>
      {children}
    </div>
  ),
}));

vi.mock("../MessageList", () => ({
  MessageList: ({ messages, isLoading }: { messages: Message[]; isLoading?: boolean }) => (
    <div data-testid="message-list">
      {messages.length} messages, loading: {String(Boolean(isLoading))}
    </div>
  ),
}));

vi.mock("../MessageInput", () => ({
  MessageInput: ({
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  }: {
    input: string;
    handleInputChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
    handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
    isLoading: boolean;
  }) => (
    <form data-testid="message-input" onSubmit={handleSubmit}>
      <textarea value={input} onChange={handleInputChange} disabled={isLoading} />
      <button type="submit" disabled={isLoading}>
        Generate
      </button>
    </form>
  ),
}));

const mockedUseChat = vi.mocked(useChat);

const baseChatState: ReturnType<typeof useChat> = {
  messages: [],
  input: "",
  setInput: vi.fn(),
  handleInputChange: vi.fn(),
  handleSubmit: vi.fn(),
  status: "idle",
  append: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedUseChat.mockReturnValue(baseChatState);
});

afterEach(() => {
  cleanup();
});

test("renders the Conductor with message history and intent input", () => {
  render(<ChatInterface />);

  expect(screen.getByText("The Conductor")).toBeDefined();
  expect(screen.getByText("What are we creating?")).toBeDefined();
  expect(screen.getByText("Intent online")).toBeDefined();
  expect(screen.getByTestId("message-list")).toBeDefined();
  expect(screen.getByTestId("message-input")).toBeDefined();
});

test("passes messages and streaming state to the conversation", () => {
  const messages: Message[] = [
    { id: "1", role: "user", content: "Create a luminous archive" },
    { id: "2", role: "assistant", content: "Shaping the interface." },
  ];

  mockedUseChat.mockReturnValue({
    ...baseChatState,
    messages,
    status: "streaming",
  });

  render(<ChatInterface />);

  expect(screen.getByTestId("message-list").textContent).toContain("2 messages");
  expect(screen.getByTestId("message-list").textContent).toContain("loading: true");
  expect(screen.getByText("Composing the interface")).toBeDefined();
});

test("shows the submitted synthesis state and disables input", () => {
  mockedUseChat.mockReturnValue({
    ...baseChatState,
    input: "A cinematic booking experience",
    status: "submitted",
  });

  render(<ChatInterface />);

  expect(screen.getByText("Interpreting product intent")).toBeDefined();
  expect(screen.getByRole("textbox")).toHaveProperty("disabled", true);
  expect(screen.getByRole("button", { name: "Generate" })).toHaveProperty(
    "disabled",
    true
  );
});

test("keeps the intent input active while idle", () => {
  render(<ChatInterface />);

  expect(screen.getByRole("textbox")).toHaveProperty("disabled", false);
  expect(screen.getByRole("button", { name: "Generate" })).toHaveProperty(
    "disabled",
    false
  );
});

test("uses the Chromatic Void container and preserves scroll behavior", () => {
  const { container, rerender } = render(<ChatInterface />);

  const root = container.firstElementChild;
  expect(root?.className).toContain("bg-[radial-gradient");
  expect(root?.className).toContain("overflow-hidden");
  expect(
    screen.getByTestId("message-list").closest("[data-radix-scroll-area-viewport]")
  ).toBeDefined();

  mockedUseChat.mockReturnValue({
    ...baseChatState,
    messages: [{ id: "1", role: "user", content: "Evolve this" }],
  });
  rerender(<ChatInterface />);

  expect(screen.getByTestId("message-list").textContent).toContain("1 messages");
});


test("the Seer preserves the brief, rerolls without stacking directions, and waits for submission", () => {
  vi.spyOn(Math, "random").mockReturnValue(0);
  const setInput = vi.fn();
  const state = { ...baseChatState, input: "A multilingual neighborhood shop", setInput };
  mockedUseChat.mockReturnValue(state);
  const view = render(<ChatInterface />);
  fireEvent.click(screen.getByRole("button", { name: "Let the Seer choose" }));
  const first = setInput.mock.calls[0][0];
  expect(first).toContain(state.input);
  expect(first).toContain("Sunlit editorial");
  expect(baseChatState.append).not.toHaveBeenCalled();
  expect(baseChatState.handleSubmit).not.toHaveBeenCalled();
  mockedUseChat.mockReturnValue({ ...state, input: first });
  view.rerender(<ChatInterface />);
  fireEvent.click(screen.getByRole("button", { name: "Let the Seer choose" }));
  const second = setInput.mock.calls[1][0];
  expect(second).toContain(state.input);
  expect(second).toContain("Playful garden");
  expect(second).not.toContain("Sunlit editorial");
  mockedUseChat.mockReturnValue({ ...state, status: "streaming" });
  view.rerender(<ChatInterface />);
  expect(screen.getByRole("button", { name: "Let the Seer choose" }).hasAttribute("disabled")).toBe(true);
  vi.restoreAllMocks();
});
