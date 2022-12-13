import * as RadioGroup from "@radix-ui/react-radio-group";
import Markdown, { compiler } from "markdown-to-jsx";
import Image from "next/image";
import { InputHTMLAttributes } from "react";
import { Question } from "../app/page";
import TextField from "./text-field";

interface QuestionProps extends InputHTMLAttributes<HTMLInputElement> {
  number?: number;
  question: Question;
  answer?: string;
  onValueChange?: (value: string) => void;
}

export default function QuestionCard({
  number,
  question,
  answer,
  onValueChange,
  ...props
}: QuestionProps) {
  return (
    <div className="flex gap-4 card">
      {number && <div>{number}</div>}
      <span className="flex flex-col gap-4 grow">
        {question.question && (
          <p>
            {question.question.endsWith(".svg") ? (
              <Image
                src={`/tests/${question.question}`}
                alt=""
                width={128}
                height={0}
              />
            ) : (
              question.question
            )}
          </p>
        )}
        {question.answers ? (
          // <RadioButtons entries={question.answers} value={answer} {...props} />
          <RadioGroup.Root
            className="flex justify-between gap-4 grow"
            value={answer}
            onValueChange={onValueChange}
          >
            {Object.keys(question.answers).map((key, i) => (
              <label key={i} className="flex flex-1 gap-4">
                <RadioGroup.Item
                  value={key}
                  className="flex items-center justify-center shrink-0 text-sm w-6 h-6 rounded-full bg-secondary-container from-on-secondary-container/[.08] to-on-secondary-container/[.08] radix-state-checked:bg-primary radix-state-checked:from-on-primary/[.08] radix-state-checked:to-on-primary/[.08] hover:bg-gradient-to-r"
                >
                  {key.toUpperCase()}
                  <RadioGroup.Indicator />
                </RadioGroup.Item>
                {question.answers![key].endsWith(".svg") ? (
                  <Image
                    src={`/tests/${question.answers![key]}`}
                    alt=""
                    width={64}
                    height={0}
                  />
                ) : (
                  question.answers![key]
                )}
              </label>
            ))}
          </RadioGroup.Root>
        ) : question.type === "numberCheck" ? (
          <div className="flex items-center justify-between gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((number) => (
              <label key={number} className="flex">
                <input
                  type="checkbox"
                  className="peer"
                  checked={(question.correctAnswer || answer)?.includes(
                    number.toString()
                  )}
                  hidden
                  onChange={(e) => {
                    if (onValueChange) {
                      if (e.target.checked) {
                        onValueChange(
                          [...(answer?.split("") || []), number]
                            .sort((a, b) => (a as number) - (b as number))
                            .join("")
                        );
                      } else {
                        onValueChange(
                          (answer?.split("") || [])
                            .filter((v) => v !== number.toString())
                            .join("")
                        );
                      }
                    }
                  }}
                  {...props}
                />
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary-container from-on-secondary-container/[.08] to-on-secondary-container/[.08] peer-hover:bg-gradient-to-r peer-checked:bg-primary peer-hover:peer-checked:!from-on-primary/[.08] peer-hover:peer-checked:!to-on-primary/[.08]">
                  {number}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <TextField
            className="w-full"
            value={answer}
            onChange={(e) => onValueChange && onValueChange(e.target.value)}
            {...props}
          />
        )}
        {question.explanation && (
          <Markdown className="text-sm">{question.explanation}</Markdown>
        )}
      </span>
    </div>
  );
}
