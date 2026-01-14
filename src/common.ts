export type FormElement = 'input' | HTMLTextAreaElement | HTMLSelectElement

export const pipeVal =
  (f: (value: string) => unknown) =>
  ({ currentTarget: { value } }: { currentTarget: { value: string } }): unknown =>
    f(value)
