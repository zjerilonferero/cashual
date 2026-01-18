import { Trash, Tag } from "feather-icons-react";
import classNames from "classnames";

interface FloatingActionButtonsProps {
  onDeletePress: () => void;
  onCategorizePress: () => void;
  isCategorizeDisabled?: boolean;
}

function FloatingActionButtons({
  onDeletePress,
  onCategorizePress,
  isCategorizeDisabled = false,
}: FloatingActionButtonsProps) {
  return (
    <div className="fixed bottom-24 right-6 z-20 flex gap-3">
      <button
        onClick={onCategorizePress}
        disabled={isCategorizeDisabled}
        className={classNames(
          "size-12 rounded-full flex justify-center items-center transition-all duration-200",
          "animate-in fade-in slide-in-from-bottom-2",
          isCategorizeDisabled
            ? "bg-neutral-800 text-neutral-600 cursor-not-allowed"
            : "bg-primary text-primary-foreground active:scale-95"
        )}
        style={{ animationDelay: "50ms" }}
      >
        <Tag size={20} />
      </button>

      <button
        onClick={onDeletePress}
        className={classNames(
          "size-12 rounded-full bg-destructive text-destructive-foreground flex justify-center items-center",
          "animate-in fade-in slide-in-from-bottom-2",
          "active:scale-95 transition-transform"
        )}
      >
        <Trash size={20} />
      </button>
    </div>
  );
}

export default FloatingActionButtons;
