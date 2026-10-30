
"use client";

import Modal from "@/components/ui/Modal";
import PropertyForm, {
    PropertyFormValues,
} from "@/components/property/PropertyForm";

import { propertyClient } from "@/services/property.client";
import { useAuth } from "@/context/AuthContext";

interface AddPropertyModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: () => void | Promise<void>;
}

export default function AddPropertyModal({
    open,
    onClose,
    onCreated,
}: AddPropertyModalProps) {
    const { accessToken } = useAuth();

    const handleCreateProperty = async (
        values: PropertyFormValues
    ) => {
        if (!accessToken) {
            throw new Error(
                "You must be logged in to add a property."
            );
        }

        await propertyClient.create(
            values,
            accessToken
        );

        onClose();

        await onCreated();
    };

    return (
        <Modal
            open={open}
            title="Add property"
            onClose={onClose}
        >
            <PropertyForm
                submitLabel="Create Property"
                onSubmit={handleCreateProperty}
            />
        </Modal>
    );
}
