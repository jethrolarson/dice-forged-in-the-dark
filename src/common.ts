export type FormElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

export const pipeVal = (f: (value: string) => unknown) => ({
  currentTarget: { value },
}: React.FormEvent<FormElement>): unknown => f(value)
