import { SignUp } from "@clerk/nextjs";
import styles from "../../auth.module.css";

export default function SignUpPage() {
  return (
    <main className={styles.container}>
      <SignUp />
    </main>
  );
}
