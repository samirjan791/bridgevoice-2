export default function Page() {
  return (
    <article className="page-wrap narrow prose">
      <span className="eyebrow">BRIDGEVOICE 2.0</span>
      <h1>Privacy, in plain language.</h1>
      <section>
        <h2>What stays on your device</h2>
        <p>
          By default, conversation messages and extracted document text stay in
          the current page session and are discarded on a fresh page load.
          Preferences and saved glossary entries persist in browser storage. You
          may enable local chat history in Settings; that can retain sensitive
          content, including source excerpts. Do not enable it for sensitive
          conversations.
        </p>
      </section>
      <section>
        <h2>When information leaves your device</h2>
        <p>
          Guided offline chat uses local rules and glossary data. Live Meta mode
          sends your current message, bounded context from this conversation,
          and attached document excerpts to the configured Meta API. You must
          enable Live Meta and affirm permission. The request sets store:false,
          which is not a guarantee about all provider processing or retention;
          Meta’s applicable terms and privacy practices still apply.
        </p>
      </section>
      <section>
        <h2>Voice</h2>
        <p>
          Microphone use begins only after your action and browser permission.
          Browser speech recognition may send audio to a browser or
          operating-system service. BridgeVoice does not record or save audio.
          The visual level meter briefly accesses microphone audio locally while
          listening. Read-aloud is explicit and depends on installed browser
          voices.
        </p>
      </section>
      <section>
        <h2>Documents</h2>
        <p>
          PDF, DOCX and UTF-8 TXT files are sent to the BridgeVoice server for
          text extraction after confirmation. The application processes them in
          memory and does not intentionally store them. Extracted text stays in
          your session unless you export, enable history, or send it to Meta.
          Text extraction has size and page limits. Scanned images and OCR are
          unsupported.
        </p>
      </section>
      <section>
        <h2>Storage and deletion</h2>
        <p>
          Settings lets you delete saved history or all BridgeVoice browser
          data. New chat clears active conversation context. Downloaded exports
          are outside the application’s control; delete them yourself when no
          longer needed. Browser profiles, backups, extensions, server
          infrastructure and third-party processors have their own privacy
          properties.
        </p>
      </section>
      <section>
        <h2>Logs and tracking</h2>
        <p>
          The application adds no advertising trackers or analytics collecting
          conversation content. Application code does not log prompts, files or
          API keys. Your hosting provider may keep operational access logs.
          Before handling sensitive data, review that provider’s configuration
          and terms.
        </p>
      </section>
      <section>
        <h2>Consent and limitations</h2>
        <p>
          Use fictional examples for demonstrations. Obtain permission from
          everyone whose information you process. BridgeVoice does not claim
          HIPAA compliance or medical/legal certification. The operator of any
          public deployment must provide a contact method and publish
          deployment-specific retention and processor information before
          offering the service to real users.
        </p>
      </section>
      <p className="muted">
        BridgeVoice supports human interpreters. All AI-generated translations
        and terminology suggestions require professional judgment and
        verification.
      </p>
    </article>
  );
}
