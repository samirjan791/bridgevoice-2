# BridgeAgent Live

Open `/agent` or use the **BridgeAgent Live** link in the chat sidebar. Press **Call Agent** and then the microphone to speak. The agent addresses the user as **Boss** by default; change the title before calling. This is a preference, not proof of identity.

The new page uses the existing `/api/chat` Meta integration, with browser speech recognition and browser speech synthesis. It keeps session transcript only in memory and does not request an additional microphone stream. On unsupported browsers or languages, typed chat is available. Pashto and Dari spoken recognition/synthesis cannot be guaranteed without a tested speech provider.

No real telephone calls, code execution, background agent jobs, or external actions are implemented. Existing BridgeVoice features and credential files are unchanged. Test with a real microphone and configured server-side Meta API credentials.
