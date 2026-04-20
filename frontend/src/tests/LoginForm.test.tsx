import { render, screen } from "@testing-library/react";
import { LoginForm } from "../components/LoginForm";

test("рендер формы логина", () => {
  render(<LoginForm onLogin={() => {}} />);

  expect(screen.getByText("Вход")).toBeInTheDocument();
});