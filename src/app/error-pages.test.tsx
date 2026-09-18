import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AppError from "./error";
import NotFound from "./not-found";

describe("SIGNAL error states", () => {
  it("offers useful recovery routes from the 404", () => {
    render(<NotFound />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /this frequency is quiet/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /go to home/i })).toHaveAttribute(
      "href",
      "/home",
    );
    expect(
      screen.getByRole("link", { name: /explore signal/i }),
    ).toHaveAttribute("href", "/home/discover");
  });

  it("retries a route failure without displaying technical details", () => {
    const reset = vi.fn();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <AppError
        error={Object.assign(new Error("private detail"), {
          digest: "safe-id",
        })}
        reset={reset}
      />,
    );

    expect(screen.queryByText("private detail")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(reset).toHaveBeenCalledOnce();

    consoleError.mockRestore();
  });
});
