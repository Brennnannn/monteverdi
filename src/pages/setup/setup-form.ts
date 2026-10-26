/** The /setup form's fields, held by the ui package's `FormWrapper`. */
export type SetupForm = {
  /** Connected Claude account's email; read-only, filled from the CLI's status. */
  account: string
  projectDir: string
}
