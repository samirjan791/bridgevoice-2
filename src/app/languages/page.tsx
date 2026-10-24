export default function Page() {
  return (
    <div className="page-wrap prose">
      <span className="eyebrow">BRIDGEVOICE / LANGUAGES</span>
      <h1>Language is more than words.</h1>
      <section>
        <h2>Launch language packs</h2>
        <p>
          English, Pashto (پښتو) and Dari (دری) have glossary fields, native
          labels and text-direction metadata. The library contains 120 English
          entries with draft bilingual equivalents; missing equivalents remain
          visibly pending.
        </p>
      </section>
      <section>
        <h2>Current support</h2>
        <p>
          Typed input is available in all three languages. English browser
          speech recognition is implemented where supported. Reverse-direction
          glossary matching is available, while full Meta translation quality in
          every direction remains unevaluated. RTL text uses platform
          Arabic-script fonts and semantic direction attributes.
        </p>
      </section>
      <section>
        <h2>Review before reliance</h2>
        <p>
          Every seed entry is an AI-assisted editorial draft, not a verified
          bilingual reference. Professional Pashto and Dari review is required
          before use with clients. The interface is primarily in English.
        </p>
      </section>
      <section>
        <h2>Roadmap</h2>
        <p>
          Spanish, Arabic, Ukrainian, Haitian Creole, Burmese and Swahili are
          future language packs, not implemented features.
        </p>
      </section>
      <section>
        <h2>Adding a language</h2>
        <p>
          Add a pack with its identifier, native label, direction, optional
          speech locale, negation patterns and domain vocabulary; extend runtime
          language validation and add tests. Test with fluent professional
          interpreters.
        </p>
      </section>
    </div>
  );
}
