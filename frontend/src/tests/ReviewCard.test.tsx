import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ReviewCard } from "../components/ReviewCard";

test("показывает отзыв", () => {
  render(
    <MemoryRouter>
      <ReviewCard
        id={1}
        author="test"
        rating={5}
        date="today"
        title="Title"
        text="Text"
        category="Магазин"
        city="Riga"
      />
    </MemoryRouter>
  );

  expect(screen.getByText("Title")).toBeInTheDocument();
  expect(screen.getByText("Text")).toBeInTheDocument();
  expect(screen.getByText("Город: Riga")).toBeInTheDocument();
});