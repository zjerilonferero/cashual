import React from "react";

type LongPressEvent = React.MouseEvent | React.TouchEvent;

type LongPressOptions = {
  threshold?: number;
  onStart?: (event: LongPressEvent) => void;
  onFinish?: (event: LongPressEvent) => void;
  onCancel?: (event: LongPressEvent) => void;
};

type LongPressHandlers = {
  onMouseDown: (event: React.MouseEvent) => void;
  onMouseUp: (event: React.MouseEvent) => void;
  onMouseLeave: (event: React.MouseEvent) => void;
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchEnd: (event: React.TouchEvent) => void;
};

function isMouseEvent(event: LongPressEvent): event is React.MouseEvent {
  return "button" in event;
}

function isTouchEvent(event: LongPressEvent): event is React.TouchEvent {
  return "touches" in event;
}

export function useLongPress(
  callback: ((event: LongPressEvent) => void) | null,
  options: LongPressOptions = {},
): Partial<LongPressHandlers> {
  const { threshold = 400, onStart, onFinish, onCancel } = options;
  const isLongPressActive = React.useRef<boolean>(false);
  const isPressed = React.useRef<boolean>(false);
  const timerId = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  return React.useMemo(() => {
    if (typeof callback !== "function") {
      return {};
    }

    const start = (event: LongPressEvent) => {
      if (!isMouseEvent(event) && !isTouchEvent(event)) return;

      if (onStart) {
        onStart(event);
      }

      isPressed.current = true;
      timerId.current = setTimeout(() => {
        callback(event);
        isLongPressActive.current = true;
      }, threshold);
    };

    const cancel = (event: LongPressEvent) => {
      if (!isMouseEvent(event) && !isTouchEvent(event)) return;

      if (isLongPressActive.current) {
        if (onFinish) {
          onFinish(event);
        }
      } else if (isPressed.current) {
        if (onCancel) {
          onCancel(event);
        }
      }

      isLongPressActive.current = false;
      isPressed.current = false;

      if (timerId.current) {
        clearTimeout(timerId.current);
      }
    };

    const mouseHandlers = {
      onMouseDown: start,
      onMouseUp: cancel,
      onMouseLeave: cancel,
    };

    const touchHandlers = {
      onTouchStart: start,
      onTouchEnd: cancel,
    };

    return {
      ...mouseHandlers,
      ...touchHandlers,
    };
  }, [callback, threshold, onCancel, onFinish, onStart]);
}
