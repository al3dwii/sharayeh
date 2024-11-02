import React from 'react';

interface PrivacyPolicyProps {
  params: {
    lang: string;
  };
}

const PrivacyPolicy = ({ params: { lang } }: PrivacyPolicyProps) => {
  return (
    <div className="privacy-policy"  dir="ltr">
      <h1 className="privacy-policy__title">Privacy Policy</h1>

      <section className="privacy-policy__section">
        <h2 className="privacy-policy__section-title">A. Accountability</h2>
        <p className="privacy-policy__text">
          At gadawel (“we,” “us,” “our”), we respect and prioritize users’
          privacy and ensure that they understand how we collect, use, protect,
          and disclose personal information. Our services, which include file
          upload and OCR processing, are designed to assist individuals and
          businesses in digitizing text from images and documents.
        </p>
        <p className="privacy-policy__text">
          This Privacy Policy explains how we manage personal information that
          is shared with us when users visit our website, use our services, or
          communicate with us.
        </p>
      </section>

      <section className="privacy-policy__section">
        <h2 className="privacy-policy__section-title">B. Personal Information</h2>
        <p className="privacy-policy__text">We collect two types of personal information:</p>
        <ul className="privacy-policy__list">
          <li className="privacy-policy__list-item">
            <strong>Identifying Information</strong>: This includes data that can identify a specific person, such as a name, email address, or telephone number, when combined with other details like physical characteristics, addresses, or history.
          </li>
          <li className="privacy-policy__list-item">
            <strong>Sensitive Information</strong>: This includes personal details like race, gender, religion, education, employment, financial history, or personal opinions. We ensure that sensitive data is handled with utmost confidentiality.
          </li>
        </ul>
      </section>

      <section className="privacy-policy__section">
        <h2 className="privacy-policy__section-title">C. The Personal Information We Collect</h2>
        <p className="privacy-policy__text">
          The personal information we collect at gadawel includes:
        </p>
        <ul className="privacy-policy__list">
          <li className="privacy-policy__list-item">Basic identification data necessary for account creation: name, email, and password.</li>
          <li className="privacy-policy__list-item">Data related to improving our services and user experience on our website.</li>
          <li className="privacy-policy__list-item">Information used for marketing, service improvements, and customer relationship management.</li>
        </ul>
      </section>

      <section className="privacy-policy__section">
        <h2 className="privacy-policy__section-title">D. Why We Collect Personal Information and Your Consent</h2>
        <p className="privacy-policy__text">
          We collect personal information to:
        </p>
        <ul className="privacy-policy__list">
          <li className="privacy-policy__list-item">Operate our website and provide a personalized experience.</li>
          <li className="privacy-policy__list-item">Allow customers to access and use our OCR services.</li>
          <li className="privacy-policy__list-item">Fulfill our contractual obligations to customers.</li>
        </ul>
        <p className="privacy-policy__text">
          We may use cookies and similar technologies to collect additional information and to associate browsing behavior with your account, if applicable.
        </p>
        <p className="privacy-policy__text">
          By using our services or browsing our website, you consent to our collection and use of your personal and non-personal information as outlined in this Policy.
        </p>
      </section>

      <section className="privacy-policy__section">
        <h2 className="privacy-policy__section-title">E. Internal Access to Personal Information</h2>
        <p className="privacy-policy__text">
          Access to personal information is restricted to gadawel employees who need it for:
        </p>
        <ul className="privacy-policy__list">
          <li className="privacy-policy__list-item">Developing and providing our services.</li>
          <li className="privacy-policy__list-item">Offering customer support.</li>
        </ul>
        <p className="privacy-policy__text">
          We may also share personal information with trusted third-party service providers, such as cloud hosting services and payment processors, for business operations.
        </p>
      </section>

      <section className="privacy-policy__section">
        <h2 className="privacy-policy__section-title">F. External Disclosure of Personal Information</h2>
        <p className="privacy-policy__text">
        gadawel does not sell or disclose your personal information to third parties, except where necessary for business operations (e.g., third-party support services) or as required by law.
        </p>
      </section>

      <section className="privacy-policy__section">
        <h2 className="privacy-policy__section-title">G. Retention of Personal Information</h2>
        <p className="privacy-policy__text">
          We retain personal information to ensure future service availability and ongoing customer support. Personal data is disposed of securely when no longer needed, either through shredding physical documents or permanently deleting electronic records.
        </p>
      </section>

      <section className="privacy-policy__section">
        <h2 className="privacy-policy__section-title">H. Accuracy of Personal Information</h2>
        <p className="privacy-policy__text">
          We strive to ensure that personal information is accurate and up to date. Customers are encouraged to inform us of any changes to their details.
        </p>
      </section>

      <section className="privacy-policy__section">
        <h2 className="privacy-policy__section-title">I. Safeguards</h2>
        <p className="privacy-policy__text">
          We employ industry-standard security measures, including encryption (HTTPS over TLS), to protect personal information.
        </p>
      </section>

      <section className="privacy-policy__section">
        <h2 className="privacy-policy__section-title">J. Data Breaches</h2>
        <p className="privacy-policy__text">
          In the event of a data breach, we will notify affected customers and advise them on steps to protect their personal information. We will also notify authorities as required by law.
        </p>
      </section>

      <section className="privacy-policy__section">
        <h2 className="privacy-policy__section-title">K. Your Access to Your Personal Information</h2>
        <p className="privacy-policy__text">
          You have the right to access your personal information. To request a copy or to update your data, contact us at <a href="mailto:support@gadawel.com" className="privacy-policy__link">support@gadawel.com</a>, specifying “Privacy Inquiry” in the subject line.
        </p>
      </section>

      <section className="privacy-policy__section">
        <h2 className="privacy-policy__section-title">L. Compliance</h2>
        <p className="privacy-policy__text">
          We have made reasonable efforts to comply with privacy laws in all jurisdictions where we offer our services. If you believe we are not meeting legal requirements, please contact our Privacy Compliance Officer at <a href="mailto:support@gadawel.com" className="privacy-policy__link">support@gadawel.com</a>.
        </p>
      </section>

      <section className="privacy-policy__section">
        <h2 className="privacy-policy__section-title">M. Managing Cookies</h2>
        <p className="privacy-policy__text">
          We use cookies to improve your experience on our website and to gather analytics. You can manage cookie preferences through your browser settings. Blocking cookies may affect the functionality of our website.
        </p>
      </section>

      <section className="privacy-policy__section">
        <h2 className="privacy-policy__section-title">N. Amendments to this Privacy Policy</h2>
        <p className="privacy-policy__text">
          We may amend this Privacy Policy periodically. Continued use of our website or services after amendments signifies your consent to the updated policy.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
