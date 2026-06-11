import { Button, Input, Select, TextArea } from "@/components/ui"

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-100">
      Hello World
      <Input label="Name" placeholder="Enter your name" />
      <TextArea label="Message" placeholder="Enter your message" />
      <Select label="Category" options={[
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2" },
        { value: "option3", label: "Option 3" }
      ]} />
      <Button variant="primary" size="md">Submit</Button>
    </div>
  )
}
