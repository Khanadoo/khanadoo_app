interface ModalProps {
    open: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

export default function Modal({
    open,
    title,
    onClose,
    children,
}: ModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                        {title}
                    </h2>

                    <button onClick={onClose}>
                        ✕
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
}