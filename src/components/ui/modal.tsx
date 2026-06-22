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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-lg">

                <div className="flex items-center justify-between border-b p-6">
                    <h2 className="text-lg font-semibold">
                        {title}
                    </h2>

                    <button onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6">
                    {children}
                </div>

            </div>
        </div>
    );
}