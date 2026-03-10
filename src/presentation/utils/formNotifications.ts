type FormNotificationArgs = {
  formType: string;
  source: string;
  subject?: string;
  replyTo?: string;
  data: Record<string, unknown>;
};

export async function notifyFormSubmission({
  formType,
  source,
  subject,
  replyTo,
  data,
}: FormNotificationArgs): Promise<void> {
  try {
    await fetch("/api/forms/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formType,
        source,
        subject,
        replyTo,
        data,
      }),
      keepalive: true,
    });
  } catch {
    // Form notifications should not block the main user action.
  }
}
