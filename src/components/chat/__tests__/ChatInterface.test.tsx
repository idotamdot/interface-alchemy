import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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


test("the Seer reviews options before changing a draft and preserves the brief when choosing", async () => {
  const direction = { name: "Sunlit", direction: "Warm editorial", rationale: "Readable and welcoming", palette: { background: "#ffffff", text: "#000000", mutedText: "#333333", accent: "#ffff00", accentText: "#000000", border: "#000000" } };
  const result = { proposal: direction, critique: "Keep readable text", final: direction };
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ results: [result] }) });
  vi.stubGlobal("fetch", fetchMock);
  const setInput = vi.fn();
  mockedUseChat.mockReturnValue({ ...baseChatState, input: "A multilingual shop", setInput });
  render(<ChatInterface />);
  fireEvent.click(screen.getByRole("button", { name: "Open design workspace" }));
  fireEvent.click(screen.getByRole("button", { name: "Let the Seer choose" }));
  await waitFor(() => expect(screen.getByRole("button", { name: "Use Sunlit" })).toBeDefined());
  expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ brief: "A multilingual shop", count: 3 });
  expect(setInput).not.toHaveBeenCalled();
  expect(baseChatState.append).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Use Sunlit" }));
  expect(setInput.mock.calls[0][0]).toContain("A multilingual shop");
  expect(setInput.mock.calls[0][0]).toContain("4.5:1");
  fireEvent.click(screen.getByRole("button", { name: "Explore color spiral" }));
  expect(screen.getByRole("heading", { name: "Explore your color story" })).toBeDefined();
  fireEvent.change(screen.getByRole("slider"), { target: { value: "3" } });
  fireEvent.click(screen.getByRole("button", { name: "Back to directions" }));
  fireEvent.click(screen.getByRole("button", { name: "Back to studio" }));
  fireEvent.click(screen.getByRole("button", { name: "Open design workspace" }));
  fireEvent.click(screen.getByRole("button", { name: "Explore color spiral" }));
  expect((screen.getByRole("slider") as HTMLInputElement).value).toBe("3");
  vi.unstubAllGlobals();
});

test("a failed Seer review keeps the draft and offers recovery", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "Your draft is intact. Try again." }) }));
  const setInput = vi.fn();
  mockedUseChat.mockReturnValue({ ...baseChatState, input: "My draft", setInput });
  render(<ChatInterface />);
  fireEvent.click(screen.getByRole("button", { name: "Open design workspace" }));
  fireEvent.click(screen.getByRole("button", { name: "Let the Seer choose" }));
  await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Try again"));
  expect(setInput).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
});

 test("full-page workspace returns to studio and preserves its direction controls", () => {
  render(<ChatInterface />);
  fireEvent.click(screen.getByRole("button", { name: "Open design workspace" }));
  fireEvent.change(screen.getByLabelText("Number of directions"), { target: { value: "2" } });
  fireEvent.click(screen.getByRole("button", { name: "Back to studio" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Open design workspace" }));
  expect((screen.getByLabelText("Number of directions") as HTMLSelectElement).value).toBe("2");
});
