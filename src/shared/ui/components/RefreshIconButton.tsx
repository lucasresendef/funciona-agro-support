import { RotateCcw } from "lucide-react";
import { TableIconButton } from "./TableIconButton";

interface RefreshIconButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}

export function RefreshIconButton({
  onClick,
  disabled = false,
  label = "Atualizar dados",
}: RefreshIconButtonProps) {
  return (
    <TableIconButton aria-label={label} title={label} onClick={onClick} disabled={disabled}>
      <RotateCcw size={16} className={disabled ? "animate-spin" : ""} />
    </TableIconButton>
  );
}
