import { getAblyServer } from "./ably";

export const publishMessageCreated = async (
  enquiryId: string,
  message: {
    id: string;
    enquiryId: string;
    senderId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    sender: {
      id: string;
      name: string;
    };
  },
) => {
  const channelName = `enquiry:${enquiryId}`;

  const ably = getAblyServer();

  const channel = ably.channels.get(channelName);

  await channel.publish("message.created", {
    message: {
      id: message.id,
      enquiryId: message.enquiryId,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
      sender: {
        id: message.sender.id,
        name: message.sender.name,
      },
    },
  });
};

export const publishEnquiryUpdated = async (
    enquiryId: string,
    enquiry: {
        id: string;
        status: string;
        updatedAt: Date;
    },
) => {
    const channelName = `enquiry:${enquiryId}`;

    const ably = getAblyServer();

    const channel =
        ably.channels.get(channelName);

    await channel.publish(
        "enquiry.updated",
        {
            enquiry: {
                id: enquiry.id,
                status: enquiry.status,
                updatedAt:
                    enquiry.updatedAt.toISOString(),
            },
        },
    );
};