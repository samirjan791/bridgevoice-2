export const demos = [
  {
    id: "medication",
    title: "The details that matter",
    domain: "Medical",
    description:
      "Medication instructions · Preserve dosage, frequency and negation.",
    segments: [
      "Take 5 milligrams twice daily for seven days.",
      "Do not take more than two tablets.",
      "Stop taking the medication if you experience severe dizziness.",
    ],
    objective:
      "Verify 5 milligrams, twice daily and seven days. Review the negation and condition.",
  },
  {
    id: "emergency",
    title: "A moment of urgency",
    domain: "Emergency care",
    description: "Emergency intake · Keep allergies and timing visible.",
    segments: [
      "The patient is 42 years old and has chest pain.",
      "The pain started 30 minutes ago.",
      "I have an allergy to penicillin.",
    ],
    objective: "Preserve age, onset and allergy statement.",
  },
  {
    id: "immigration",
    title: "A clearer next step",
    domain: "Immigration",
    description: "Fictional interview · Make legal terminology understandable.",
    segments: [
      "Please bring your passport to the interview.",
      "The notice says you may appeal within 30 days.",
      "Do not sign the document unless you understand it.",
    ],
    objective: "Flag the fictional deadline; do not infer legal advice.",
  },
  {
    id: "benefits",
    title: "Understanding eligibility",
    domain: "Government benefits",
    description:
      "Fictional benefits meeting · Separate conditions from promises.",
    segments: [
      "Eligibility depends on household income.",
      "Please provide income verification within 14 days.",
      "Approval is not guaranteed.",
    ],
    objective: "Preserve conditions and negative statements.",
  },
  {
    id: "pharmacy",
    title: "Confidence at the counter",
    domain: "Pharmacy",
    description: "Pharmacy consultation · Clarify a vague instruction.",
    segments: [
      "This prescription is for a tablet.",
      "Take it as needed.",
      "Ask the pharmacist about side effects and a refill.",
    ],
    objective: "Ask what “it” and “as needed” mean; never invent a dose.",
  },
  {
    id: "school",
    title: "Every parent belongs",
    domain: "Education",
    description: "School meeting · Explain unfamiliar learning terminology.",
    segments: [
      "We would like to discuss attendance and assessment.",
      "Your child has 3 absences this month.",
      "An accommodation may help the student participate.",
    ],
    objective: "Explain school terminology without assuming a diagnosis.",
  },
];
