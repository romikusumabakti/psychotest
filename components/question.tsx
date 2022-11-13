import { Question } from "../app/page";
import RadioButtons from "./radio-buttons";

interface QuestionProps {
  question: Question;
  answer?: string;
  onChange?: Function;
}

export default function QuestionCard({
  question,
  answer,
  onChange,
}: QuestionProps) {
  return (
    <div className="flex flex-col gap-2 card">
      {question.question && <p>{question.question}</p>}
      <div className="flex flex-col items-start gap-1">
        {question.answers ? (
          <RadioButtons
            entries={question.answers}
            value={answer}
            onChange={onChange}
          />
        ) : (
          <input type="text" value={question.correctAnswer} />
        )}
      </div>
      {question.explanation && (
        <p className="text-sm">{question.explanation}</p>
      )}
    </div>
  );
}
