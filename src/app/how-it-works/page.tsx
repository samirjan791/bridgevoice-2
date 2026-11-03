export default function Page() {
  return (
    <article className="page-wrap narrow prose">
      <span className="eyebrow">BRIDGEVOICE 2.0</span>
      <h1>One conversation. More understanding.</h1>
      <section>
        <h2>Ask naturally</h2>
        <p>
          Type a question or use supported English microphone input. Translate,
          explain, simplify or explore terminology. Follow-up requests use the
          current conversation only. Use Response options to correct the
          detected task or explanation level.
        </p>
      </section>
      <section>
        <h2>Connect meaning</h2>
        <p>
          An internet connection and a valid Meta key are required.
          Chat sends authorized context to the server, which
          calls Meta’s Responses API. Streaming text is provisional until the
          structured response passes validation. Stopping generation discards an
          incomplete draft.
        </p>
      </section>
      <section>
        <h2>Review with MeaningGuard</h2>
        <p>
          Meaning Mirror compares your original text and proposed translation.
          Deterministic checks look for number, unit and negation differences;
          Meta can add contextual analysis. Review, correct or dismiss findings.
          These checks are limited and are never certification.
        </p>
      </section>
      <section>
        <h2>Keep people in control</h2>
        <p>
          Bridge Mode makes supported speech and typed segments convenient, but
          never speaks or forwards suggestions automatically. Save useful
          terminology to your glossary. Clear the chat whenever you want to
          start with fresh context.
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
