import { Trash } from "feather-icons-react";

interface FloatingActionDeleteButtonProps {
  onDeletePress: () => void;
}

function FloatingActionDeleteButton(props: FloatingActionDeleteButtonProps) {
  const { onDeletePress } = props;
  return (
    <button className="fixed bottom-22 right-10 z-20 ">
      <div
        onClick={onDeletePress}
        className="size-12 rounded-full bg-primary relative flex justify-center items-center "
      >
        <Trash className="z-10" />
      </div>
    </button>
  );
}

export default FloatingActionDeleteButton;
