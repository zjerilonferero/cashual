"use client";

import { useRef, useEffect } from "react";
import classNames from "classnames";
import type { CategoryDTO } from "@/app/lib/category";

interface CategoryFilterProps {
  categories: readonly CategoryDTO[];
  selectedCategoryId: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

export function CategoryFilter({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryFilterProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (selectedRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const selected = selectedRef.current;
      const selectedRect = selected.getBoundingClientRect();

      const scrollLeft =
        selected.offsetLeft -
        container.offsetWidth / 2 +
        selectedRect.width / 2;

      container.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: "smooth",
      });
    }
  }, [selectedCategoryId]);

  return (
    <div
      ref={scrollContainerRef}
      className="flex gap-2 overflow-x-auto py-1"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <button
        ref={selectedCategoryId === null ? selectedRef : null}
        onClick={() => onSelectCategory(null)}
        className={classNames(
          "shrink-0 px-4 py-2 rounded-full text-sm font-medium",
          "transition-all duration-200 ease-out",
          "active:scale-95",
          selectedCategoryId === null
            ? "bg-white/15 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.3)]"
            : "bg-white/5 text-white/60 hover:bg-white/8 hover:text-white/80"
        )}
      >
        All
      </button>

      {categories.map((category) => {
        const isSelected = category.id === selectedCategoryId;
        const categoryColor = category.color ?? "#888888";

        return (
          <button
            key={category.id}
            ref={isSelected ? selectedRef : null}
            onClick={() => onSelectCategory(category.id)}
            className={classNames(
              "shrink-0 px-4 py-2 rounded-full text-sm font-medium",
              "transition-all duration-200 ease-out",
              "active:scale-95",
              "flex items-center gap-2"
            )}
            style={
              isSelected
                ? {
                    backgroundColor: `${categoryColor}25`,
                    color: categoryColor,
                    boxShadow: `0 0 0 1px ${categoryColor}40, 0 2px 8px rgba(0,0,0,0.3)`,
                  }
                : {
                    backgroundColor: "rgba(255,255,255,0.05)",
                    color: "rgba(255,255,255,0.6)",
                  }
            }
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: categoryColor }}
            />
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
