import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { ArrowLeft, Shield, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { toast } from "sonner";

export const Route = createFileRoute("/security-questions")({ component: SecurityQuestionsPage });

const availableQuestions = [
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "What is your favorite book?",
  "In what city were you born?",
  "What is your favorite movie?",
  "What was your childhood nickname?",
  "What is the name of the street you grew up on?",
  "What is your favorite food?",
  "What year did you graduate high school?",
  "What is the name of your best friend in high school?",
];

function SecurityQuestionsPage() {
  useAuthGuard();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([
    { id: 1, question: "", answer: "" },
    { id: 2, question: "", answer: "" },
    { id: 3, question: "", answer: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const updateQuestion = (id: number, question: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, question } : q)));
    setOpenDropdown(null);
  };

  const updateAnswer = (id: number, answer: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, answer } : q)));
  };

  const handleSubmit = () => {
    const allFilled = questions.every((q) => q.question && q.answer);

    if (!allFilled) {
      toast.error("Please answer all security questions");
      return;
    }

    const uniqueQuestions = new Set(questions.map((q) => q.question)).size;
    if (uniqueQuestions < 3) {
      toast.error("Please select different questions");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Security questions updated");
      navigate({ to: "/profile" });
    }, 1200);
  };

  return (
    <>
      <TopBar title="SECURITY QUESTIONS" />

      <button
        onClick={() => navigate({ to: "/profile" })}
        className="tile-press mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="space-y-6">
        <div className="glass rounded-2xl p-4 space-y-2">
          <div className="flex gap-2 items-start">
            <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground font-semibold">SECURITY INFO</p>
              <p className="text-sm">
                Security questions help protect your account in case you forget your password.
                Answer honestly and remember your answers.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((item) => (
            <div key={item.id} className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">QUESTION {item.id}</p>

              {/* Question Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
                  className="tile-press w-full rounded-xl bg-muted/30 px-4 py-3 text-left text-sm flex items-center justify-between hover:bg-muted/40"
                >
                  <span
                    className={
                      item.question ? "text-foreground font-medium" : "text-muted-foreground"
                    }
                  >
                    {item.question || "Select a security question"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>

                {openDropdown === item.id && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-muted/20 rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                    {availableQuestions.map((question) => (
                      <button
                        key={question}
                        type="button"
                        onClick={() => updateQuestion(item.id, question)}
                        className={`w-full px-4 py-3 text-left text-sm hover:bg-muted/30 border-b border-muted/10 last:border-0 transition-colors ${
                          item.question === question ? "bg-primary/10 font-semibold" : ""
                        }`}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Answer Input */}
              {item.question && (
                <input
                  type="text"
                  value={item.answer}
                  onChange={(e) => updateAnswer(item.id, e.target.value)}
                  placeholder="Your answer"
                  className="w-full rounded-xl bg-muted/30 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!questions.every((q) => q.question && q.answer) || loading}
          className="tile-press w-full rounded-xl bg-gradient-to-r from-primary to-accent py-3 font-bold text-primary-foreground glow-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
        >
          {loading ? "Saving..." : "Save Security Questions"}
        </button>
      </div>
    </>
  );
}
