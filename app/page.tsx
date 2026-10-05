import { registry } from "@/morph/registry";

export default function Home() {
  return (
    <main>
      {Object.entries(registry).map(([name, Block]) => (
        <Block key={name} />
      ))}
    </main>
  );
}
