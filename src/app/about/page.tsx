import { Brand } from "@/components/brand/Brand";
export default function Page() {
  return (
    <article className="page-wrap narrow prose">
      <Brand full />
      <span className="eyebrow">BRIDGEVOICE 3.4</span>
      <h1>Every voice deserves to be understood.</h1>
      <section>
        <h2>The human connection engine</h2>
        <p>
          BridgeVoice is a communication assistant for people navigating
          unfamiliar language, specialist vocabulary and important
          conversations. Its chat interface brings together translation
          suggestions, explanations, terminology and human review.
        </p>
      </section>
      <section>
        <h2>A human-first mission</h2>
        <p>
          Founder Mohammad Samir Abdulrahimzai’s vision begins with the language
          needs of Pashto- and Dari-speaking communities. BridgeVoice supports
          interpreters; it does not replace their professional judgment.
        </p>
      </section>
      <section>
        <h2>A clear promise</h2>
        <p>
          You speak. BridgeVoice helps the world understand. English, Pashto and
          Dari text are included, with unreviewed language resources clearly
          marked. Live language quality needs testing with qualified reviewers.
        </p>
      </section>
      <section>
        <h2>About this build</h2>
        <p>
          This is a downloadable demonstration build. No professional
          certification, competition eligibility or live deployment is claimed.
          The original supplied robot video plays in profile imagery throughout the
          interface. The bridge remains the signature intro and voice visualization.
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
