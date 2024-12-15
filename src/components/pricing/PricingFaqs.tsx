// /src/components/Pricing/PricingFaqs.tsx

"use client";

import { useState } from "react";

const faqs = [
  {
    question: "How can I upgrade my plan?",
    answer: "You can upgrade your plan from your dashboard at any time.",
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept all major credit cards including Visa, MasterCard, and American Express.",
  },
  // Add more FAQs as needed
];

const PricingFaqs = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="container my-10">
      <h3 className="text-2xl font-semibold text-center mb-6">Frequently Asked Questions</h3>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border rounded-md">
            <button
              onClick={() => toggleFAQ(idx)}
              className="w-full text-left px-4 py-2 flex justify-between items-center focus:outline-none"
            >
              <span>{faq.question}</span>
              <span>{activeIndex === idx ? "-" : "+"}</span>
            </button>
            {activeIndex === idx && (
              <div className="px-4 py-2 border-t">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default PricingFaqs;
