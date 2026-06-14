"use client";
import { Badge, ConfirmDialog, Modal, Spinner } from "@/components/ui"
import { useState } from "react"

export default function Page() {
  const [ConfirmOpen, setConfirmOpen] = useState(true);
  const [ModalOpen, setModalOpen] = useState(true);

  const handleConfirm = () => {
    // Handle the confirm action here
    setConfirmOpen(false);
  }

  const handleCancel = () => {
    // Handle the cancel action here
    setModalOpen(false);
  }

  const handleOpenDialog = () => {
    setModalOpen(true);
  }

  const handleCloseDialog = () => {
    setModalOpen(false);
  }
  return (
    <div className="min-h-screen bg-gray-100">
      Hello World
      <Spinner />
      <Badge variant="success">Available</Badge>
      <ConfirmDialog 
        open={ConfirmOpen}
        title="Confirm Action"
        description="Are you sure you want to perform this action?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <Modal open={ModalOpen} title="Test Modal" onClose={handleCloseDialog}>
        <p>This is the modal content.</p>
      </Modal>
    </div>
  )
}
