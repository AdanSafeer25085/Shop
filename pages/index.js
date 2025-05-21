import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/user");
  }, []);

  return null;
}
