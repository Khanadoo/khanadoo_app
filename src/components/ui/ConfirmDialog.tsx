import Button from "./Button";
import Modal from "./Modal";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description: string;
    loading?: boolean;

    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    open,
    title,
    description,
    loading,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    return (
        <Modal
            open={open}
            title={title}
            onClose={onCancel}
        >
            <p className="mb-6 text-gray-600">
                {description}
            </p>

            <div className="flex justify-end gap-3">
                <Button
                    variant="outline"
                    onClick={onCancel}
                    size="md"
                >
                    Cancel
                </Button>

                <Button
                    variant="danger"
                    loading={loading}
                    onClick={onConfirm}
                    size="md"
                >
                    Confirm
                </Button>
            </div>
        </Modal>
    );
}