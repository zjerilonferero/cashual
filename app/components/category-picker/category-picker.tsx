"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { Check } from "feather-icons-react";
import classNames from "classnames";
import type { CategoryDTO } from "@/app/lib/category";

interface CategoryPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (categoryId: number) => void;
  currentCategoryId?: number | null;
  categories: readonly CategoryDTO[];
}

export function CategoryPicker({
  isOpen,
  onClose,
  onSelect,
  currentCategoryId,
  categories,
}: CategoryPickerProps) {
  const [animationState, setAnimationState] = useState<"closed" | "opening" | "open" | "closing">("closed");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevIsOpenRef = useRef(isOpen);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isOpen && !prevIsOpenRef.current) {
      setAnimationState("opening");
      timeoutRef.current = setTimeout(() => {
        setAnimationState("open");
      }, 300);
    } else if (!isOpen && prevIsOpenRef.current) {
      setAnimationState("closing");
      timeoutRef.current = setTimeout(() => {
        setAnimationState("closed");
      }, 200);
    }

    prevIsOpenRef.current = isOpen;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (document.body.style.position === "fixed") {
        const scrollY = document.body.style.top;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    };
  }, [isOpen, handleKeyDown]);

  const handleSelect = (categoryId: number) => {
    onSelect(categoryId);
  };

  if (animationState === "closed") return null;

  const isAnimatingOut = animationState === "closing";

  return (
    <div
      className={classNames(
        "fixed inset-0 z-50 flex items-end justify-center",
        isAnimatingOut ? "animate-out fade-out duration-200" : "animate-in fade-in duration-200"
      )}
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={classNames(
          "relative w-full bg-neutral-900 rounded-t-2xl",
          "flex flex-col",
          isAnimatingOut
            ? "animate-out slide-out-to-bottom duration-200 ease-in"
            : "animate-in slide-in-from-bottom duration-300 ease-out"
        )}
        style={{ height: "50vh" }}
      >
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 rounded-full bg-neutral-700" />
        </div>

        <div className="px-4 pb-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Select category
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-safe">
          <div className="space-y-1">
            {categories.map((category) => {
              const isSelected = category.id === currentCategoryId;

              return (
                <button
                  key={category.id}
                  onClick={() => handleSelect(category.id)}
                  className={classNames(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl",
                    "transition-colors duration-150",
                    "active:scale-[0.98] active:bg-neutral-700/50",
                    isSelected
                      ? "bg-neutral-800"
                      : "hover:bg-neutral-800/50"
                  )}
                >
                  <div
                    className={classNames(
                      "w-3 h-3 rounded-full shrink-0",
                      !category.color && "border border-neutral-600"
                    )}
                    style={{
                      backgroundColor: category.color ?? "transparent",
                    }}
                  />

                  <span className="flex-1 text-left text-sm font-medium">
                    {category.name}
                  </span>

                  {isSelected && (
                    <Check
                      size={18}
                      className="text-primary shrink-0"
                      strokeWidth={2.5}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-safe" />
      </div>
    </div>
  );
}
