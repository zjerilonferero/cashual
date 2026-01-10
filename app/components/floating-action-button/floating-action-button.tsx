"use client";

import classNames from "classnames";
import { Upload, Plus } from "feather-icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function FloatingActionButton() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMenuActive = searchParams.get("menuActive") === "true";

  const onButtonClick = () => {
    const params = new URLSearchParams(searchParams);
    if (isMenuActive) {
      params.delete("menuActive");
    } else {
      params.set("menuActive", "true");
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const UploadCSVPress = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`${pathname}/upload-csv`);
  };

  return (
    <button
      className={classNames("absolute bottom-2 right-10 opacity-50", {
        "opacity-100": isMenuActive,
      })}
    >
      <div
        onClick={onButtonClick}
        className="size-12 rounded-full bg-primary relative flex justify-center items-center z-20"
      >
        <Plus
          className={classNames("transition z-10", {
            "rotate-45": isMenuActive,
          })}
        />
        <div
          onClick={UploadCSVPress}
          className={classNames(
            "size-8 rounded-full bg-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity",
            {
              "menu-item-1-in opacity-100 flex justify-center items-center":
                isMenuActive,
            },
            { hidden: !isMenuActive },
          )}
        >
          <Upload size={14} />
        </div>

        <div
          className={classNames(
            "size-8 rounded-full bg-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity",
            { "menu-item-2-in opacity-100": isMenuActive },
          )}
        ></div>

        <div
          className={classNames(
            "size-8 rounded-full bg-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity",
            { "menu-item-3-in opacity-100": isMenuActive },
          )}
        ></div>
      </div>
    </button>
  );
}

export default FloatingActionButton;
