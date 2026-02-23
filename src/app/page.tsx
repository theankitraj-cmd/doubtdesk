import Navbar from "@/components/Navbar/Navbar";
import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeDot}></span>
              24/7 AI Teacher Available
            </div>
            <h1 className={styles.heroTitle}>
              Your Personal Teacher,
              <br />
              <span className={styles.heroTitleAccent}>Always Available.</span>
            </h1>
            <p className={styles.heroSub}>
              Ask any doubt. Get clear explanations. If confused, your AI teacher
              will appear on screen — with a real face, real voice, and real
              teaching — to make sure you understand.
            </p>
            <div className={styles.heroCTA}>
              <Link href="/dashboard" className="btn btn-primary btn-lg">
                🎓 Start Free Class
              </Link>
              <Link href="#how-it-works" className="btn btn-outline btn-lg">
                See How It Works
              </Link>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <strong>10K+</strong>
                <span>Doubts Cleared</span>
              </div>
              <div className={styles.heroStatDivider}></div>
              <div className={styles.heroStat}>
                <strong>4.9★</strong>
                <span>Student Rating</span>
              </div>
              <div className={styles.heroStatDivider}></div>
              <div className={styles.heroStat}>
                <strong>24/7</strong>
                <span>Always Available</span>
              </div>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.chatPreview}>
              <div className={styles.chatPreviewHeader}>
                <span className={styles.chatPreviewDot}></span>
                <span>Your Classroom</span>
              </div>
              <div className={styles.chatPreviewBody}>
                <div className={styles.chatBubbleStudent}>
                  Sir, I don&apos;t understand Newton&apos;s 3rd law. Why does the
                  table push back?
                </div>
                <div className={styles.chatBubbleTeacher}>
                  <div className={styles.chatBubbleLabel}>🎓 Teacher Reply</div>
                  Great question! Think of it this way — when you place a book
                  on the table, the book pushes the table down with its weight
                  (force of gravity)...
                </div>
                <div className={styles.chatBubbleStudent}>
                  Can you teach me properly? I&apos;m still confused 😕
                </div>
                <div className={styles.teacherModeCard}>
                  <div className={styles.teacherModeIcon}>🎬</div>
                  <div>
                    <strong>Teacher Mode Activated</strong>
                    <p>Your teacher is joining the class...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className={styles.features} id="features">
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="badge badge-green">Why DoubtDesk</span>
              <h2 className={styles.sectionTitle}>
                Not a Chatbot. A Real Teaching Experience.
              </h2>
              <p className={styles.sectionSub}>
                DoubtDesk doesn&apos;t just answer — it teaches. Like a patient
                teacher sitting next to you.
              </p>
            </div>
            <div className={styles.featureGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>💬</div>
                <h3>Ask Any Doubt</h3>
                <p>
                  Type, speak, or upload a photo of your problem. Get instant,
                  clear explanations with examples.
                </p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🎬</div>
                <h3>Live Teacher Mode</h3>
                <p>
                  Didn&apos;t understand? A teacher face appears on screen,
                  explains step-by-step with voice and expressions.
                </p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🧠</div>
                <h3>Remembers You</h3>
                <p>
                  Tracks your weak topics and adapts explanations. References
                  past struggles to build understanding.
                </p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>📝</div>
                <h3>Practice & Evaluate</h3>
                <p>
                  After each concept, your teacher gives practice problems,
                  checks your answers, and re-teaches if needed.
                </p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🔒</div>
                <h3>No Cheating Help</h3>
                <p>
                  We teach methods, not shortcuts. Your teacher will guide you to
                  solve problems yourself.
                </p>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureIcon}>🕐</div>
                <h3>Available 24/7</h3>
                <p>
                  Late night exam prep? Early morning doubt? Your teacher is
                  always ready, no scheduling needed.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className={styles.howItWorks} id="how-it-works">
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="badge badge-gold">How It Works</span>
              <h2 className={styles.sectionTitle}>
                From Doubt to Clarity in Minutes
              </h2>
            </div>
            <div className={styles.steps}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <h3>Ask Your Doubt</h3>
                <p>
                  Type your question, speak it, or take a photo. Just like asking
                  your teacher in class.
                </p>
              </div>
              <div className={styles.stepArrow}>→</div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <h3>Get a Clear Answer</h3>
                <p>
                  Your AI teacher gives a structured, step-by-step explanation
                  with real-world examples.
                </p>
              </div>
              <div className={styles.stepArrow}>→</div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <h3>Still Confused?</h3>
                <p>
                  Say &quot;Teach me properly&quot; — your teacher appears on
                  screen with face and voice to explain like a real class.
                </p>
              </div>
              <div className={styles.stepArrow}>→</div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <h3>Practice & Master</h3>
                <p>
                  Solve practice problems, get evaluated, and build real
                  understanding. No shortcuts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Subjects */}
        <section className={styles.subjects} id="subjects">
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="badge badge-green">Subjects</span>
              <h2 className={styles.sectionTitle}>
                Every Subject, Every Board, Every Exam
              </h2>
            </div>
            <div className={styles.subjectGrid}>
              {[
                { icon: "📐", name: "Mathematics", exams: "CBSE, ICSE, JEE" },
                { icon: "⚛️", name: "Physics", exams: "Board + JEE/NEET" },
                { icon: "🧪", name: "Chemistry", exams: "Organic, Inorganic, Physical" },
                { icon: "🧬", name: "Biology", exams: "NEET, Board Exams" },
                { icon: "📖", name: "English", exams: "Literature & Grammar" },
                { icon: "💻", name: "Computer Science", exams: "Python, Java, DSA" },
              ].map((subj) => (
                <div key={subj.name} className={styles.subjectCard}>
                  <span className={styles.subjectIcon}>{subj.icon}</span>
                  <h4>{subj.name}</h4>
                  <p>{subj.exams}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className={styles.pricing} id="pricing">
          <div className="container">
            <div className={styles.sectionHeader}>
              <span className="badge badge-gold">Pricing</span>
              <h2 className={styles.sectionTitle}>
                Affordable Tuition, Unlimited Learning
              </h2>
              <p className={styles.sectionSub}>
                Start free. Upgrade when you need your personal teacher.
              </p>
            </div>
            <div className={styles.pricingGrid}>
              <div className={styles.pricingCard}>
                <div className={styles.pricingPlan}>Starter</div>
                <div className={styles.pricingPrice}>
                  ₹0<span>/month</span>
                </div>
                <ul className={styles.pricingFeatures}>
                  <li>✅ 10 text doubts/day</li>
                  <li>✅ 2 subjects</li>
                  <li>✅ 2 min Teacher Mode trial</li>
                  <li>✅ 3 practice sets/day</li>
                  <li>❌ Full Teacher Mode</li>
                  <li>❌ Voice class</li>
                </ul>
                <Link href="/dashboard" className="btn btn-outline" style={{ width: "100%" }}>
                  Start Free
                </Link>
              </div>
              <div className={`${styles.pricingCard} ${styles.pricingCardFeatured}`}>
                <div className={styles.pricingBadge}>Most Popular</div>
                <div className={styles.pricingPlan}>Pro</div>
                <div className={styles.pricingPrice}>
                  ₹349<span>/month</span>
                </div>
                <ul className={styles.pricingFeatures}>
                  <li>✅ Unlimited text doubts</li>
                  <li>✅ All subjects</li>
                  <li>✅ 90 min Teacher Mode/month</li>
                  <li>✅ Unlimited practice</li>
                  <li>✅ Full session history</li>
                  <li>✅ Priority responses</li>
                </ul>
                <Link href="/pricing" className="btn btn-accent" style={{ width: "100%" }}>
                  Get Pro Access
                </Link>
              </div>
              <div className={styles.pricingCard}>
                <div className={styles.pricingPlan}>Annual</div>
                <div className={styles.pricingPrice}>
                  ₹2,999<span>/year</span>
                </div>
                <p className={styles.pricingSavings}>Save ₹1,189/year</p>
                <ul className={styles.pricingFeatures}>
                  <li>✅ Everything in Pro</li>
                  <li>✅ 150 min Teacher Mode/month</li>
                  <li>✅ Exam-specific prep</li>
                  <li>✅ Priority support</li>
                </ul>
                <Link href="/pricing" className="btn btn-primary" style={{ width: "100%" }}>
                  Best Value
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className="container">
            <div className={styles.footerGrid}>
              <div className={styles.footerBrand}>
                <div className={styles.footerLogo}>
                  <span>📖</span> DoubtDesk
                </div>
                <p>Your personal AI teacher, always available. Learn better, learn smarter.</p>
              </div>
              <div className={styles.footerCol}>
                <h4>Platform</h4>
                <Link href="#features">Features</Link>
                <Link href="/pricing">Pricing</Link>
                <Link href="#subjects">Subjects</Link>
                <Link href="/progress">Student Progress</Link>
              </div>
              <div className={styles.footerCol}>
                <h4>Account</h4>
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/account">Billing</Link>
                <Link href="/login">Login</Link>
              </div>
              <div className={styles.footerCol}>
                <h4>Legal</h4>
                <Link href="#">Privacy Policy</Link>
                <Link href="#">Terms of Service</Link>
              </div>
            </div>
            <div className={styles.footerBottom}>
              <p>© 2026 DoubtDesk. Made with ❤️ for students.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
