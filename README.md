This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


Chat Widget Integration
This project includes a fully configurable AI chat widget that can be embedded on any HTML page using a simple script tag.

💡 How to Use the Chat Agent
Open the test-chat-widget.html file.

Locate the script tag at the bottom of the HTML:


<script src="https://cdn.jsdelivr.net/gh/zohaibyousaf456/chat-agent-widget@v1.0.0/chat-agent-widget.js"
        data-agent-id="80db399f-28fa-4b53-8f0f-df5b18278402"
        data-backend-url="http://localhost:8000"
        data-theme="blue"
        data-position="bottom-right"
        data-title="🤖 AI Chat Assistant"
        data-welcome-message="Hello! How can I help you today?"
        data-auto-open="false"
        data-show-welcome-message="true"
        data-button-text="Start Chat"
        data-placeholder="Type your message..."
        data-enable-animations="true"
        data-show-timestamps="false"
        data-remember-state="true">
</script>
To change the agent, simply update the data-agent-id value to your desired Agent ID:


data-agent-id="YOUR_NEW_AGENT_ID"
Save the file and open it in the browser to reflect the updated configuration.