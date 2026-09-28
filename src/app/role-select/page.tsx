import { redirect } from "next/navigation";

// The five preset roles were replaced by the personal mask from the Awakening questionnaire
export default function RoleSelectRedirect() {
  redirect("/awakening");
}
